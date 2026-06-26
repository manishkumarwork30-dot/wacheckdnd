import { incarnationId, instanceId } from "@/cluster/identity";
import { isInstanceAlive } from "@/cluster/instanceRegistry";
import { errorToString } from "@/helpers/errorToString";
import logger from "@/lib/logger";
import { getDb } from "@/lib/mongodb";

const IDEMPOTENCY_TTL = 600;
const PROCESSING_PREFIX = "processing:";

interface IdempotencyDoc {
  _id: string;
  value: string;
  expiresAt: Date;
}

const processingValue = () =>
  `${PROCESSING_PREFIX}${instanceId}#${incarnationId}`;

export type IdempotencyResult<T> =
  | { status: "executed"; value: T }
  | { status: "cached"; value: T }
  | { status: "processing" }
  | { status: "failed" };

export async function withIdempotency<T>(
  key: string | null,
  fn: () => Promise<T | null>,
): Promise<IdempotencyResult<T>> {
  if (!key) {
    const value = await fn();
    return value !== null
      ? { status: "executed", value }
      : { status: "failed" };
  }

  const outcome = await acquireOrSteal<T>(key);
  if (outcome.status === "cached") {
    return { status: "cached", value: outcome.value };
  }
  if (outcome.status === "processing") {
    return { status: "processing" };
  }

  try {
    const value = await fn();

    if (value === null) {
      await releaseLock(key);
      return { status: "failed" };
    }

    const cached = await cacheResult(key, value);
    if (!cached) await releaseLock(key);

    return { status: "executed", value };
  } catch (error) {
    await releaseLock(key);
    throw error;
  }
}

type AcquireOutcome<T> =
  | { status: "owned" }
  | { status: "cached"; value: T }
  | { status: "processing" };

async function acquireOrSteal<T>(key: string): Promise<AcquireOutcome<T>> {
  if (await acquireLock(key)) {
    return { status: "owned" };
  }

  let current: string | null = null;
  try {
    const db = getDb();
    const collection = db.collection<IdempotencyDoc>("idempotency");
    const doc = await collection.findOne({ _id: key });
    current = doc ? doc.value : null;
  } catch (error) {
    logger.warn(
      "[withIdempotency] holder inspection failed, treating as processing: %s",
      errorToString(error),
    );
    return { status: "processing" };
  }

  if (current === null) {
    return (await acquireLock(key))
      ? { status: "owned" }
      : { status: "processing" };
  }

  if (current === processingValue()) {
    return { status: "processing" };
  }

  const holder = parseHolder(current);
  if (holder === null) {
    try {
      return { status: "cached", value: JSON.parse(current) as T };
    } catch {
      return { status: "processing" };
    }
  }

  if (holder.instanceId === "") {
    return { status: "processing" };
  }

  const isOwnDeadIncarnation =
    holder.instanceId === instanceId &&
    holder.incarnationId !== undefined &&
    holder.incarnationId !== incarnationId;

  if (!isOwnDeadIncarnation) {
    let alive: boolean;
    try {
      alive = await isInstanceAlive(holder.instanceId);
    } catch {
      return { status: "processing" };
    }
    if (alive) {
      return { status: "processing" };
    }
  }

  if (await stealLock(key, current)) {
    logger.info(
      "[withIdempotency] reclaimed orphaned lock %s from dead holder %s",
      key,
      holder.incarnationId
        ? `${holder.instanceId}#${holder.incarnationId}`
        : holder.instanceId,
    );
    return { status: "owned" };
  }
  return { status: "processing" };
}

interface Holder {
  instanceId: string;
  incarnationId: string | undefined;
}

// Parses an in-flight marker into its holder. Returns null when the value is a
// cached result rather than a marker. The legacy bare "processing" value and
// the pre-incarnation "processing:<instanceId>" form are both tolerated
// (instanceId "" / incarnationId undefined respectively).
function parseHolder(value: string): Holder | null {
  if (value === "processing") {
    return { instanceId: "", incarnationId: undefined };
  }
  if (!value.startsWith(PROCESSING_PREFIX)) {
    return null;
  }
  const rest = value.slice(PROCESSING_PREFIX.length);
  // The incarnation token is appended after "#". Splitting on "#" (rather than
  // ":") keeps this unambiguous when instanceId contains colons. A legacy
  // "processing:<instanceId>" marker has no "#" and parses as a bare instanceId.
  const sep = rest.lastIndexOf("#");
  if (sep === -1) {
    return { instanceId: rest, incarnationId: undefined };
  }
  return {
    instanceId: rest.slice(0, sep),
    incarnationId: rest.slice(sep + 1),
  };
}

async function acquireLock(key: string): Promise<boolean> {
  try {
    const db = getDb();
    const collection = db.collection<IdempotencyDoc>("idempotency");
    const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL * 1000);
    await collection.insertOne({
      _id: key,
      value: processingValue(),
      expiresAt,
    });
    return true;
  } catch (error: any) {
    if (error.code === 11000) {
      return false;
    }
    logger.warn(
      "[withIdempotency] lock acquire failed, proceeding without cache: %s",
      errorToString(error),
    );
    return true;
  }
}

async function stealLock(key: string, expected: string): Promise<boolean> {
  try {
    const db = getDb();
    const collection = db.collection<IdempotencyDoc>("idempotency");
    const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL * 1000);
    const result = await collection.updateOne(
      { _id: key, value: expected },
      {
        $set: {
          value: processingValue(),
          expiresAt,
        },
      },
    );
    return result.modifiedCount === 1;
  } catch (error) {
    logger.warn(
      "[withIdempotency] lock steal failed: %s",
      errorToString(error),
    );
    return false;
  }
}

async function releaseLock(key: string): Promise<void> {
  try {
    const db = getDb();
    const collection = db.collection<IdempotencyDoc>("idempotency");
    await collection.deleteOne({ _id: key });
  } catch {
    /* fail-open */
  }
}

async function cacheResult<T>(key: string, value: T): Promise<boolean> {
  try {
    const db = getDb();
    const collection = db.collection<IdempotencyDoc>("idempotency");
    const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL * 1000);
    await collection.updateOne(
      { _id: key },
      {
        $set: {
          value: JSON.stringify(value),
          expiresAt,
        },
      },
      { upsert: true },
    );
    return true;
  } catch (error) {
    logger.warn(
      "[withIdempotency] cache write failed: %s",
      errorToString(error),
    );
    return false;
  }
}
