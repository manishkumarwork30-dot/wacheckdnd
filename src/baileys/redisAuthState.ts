import {
  type AuthenticationCreds,
  type AuthenticationState,
  BufferJSON,
  initAuthCreds,
  proto,
  type SignalDataTypeMap,
} from "@whiskeysockets/baileys";
import { instanceId } from "@/cluster/identity";
import logger from "@/lib/logger";
import { getDb } from "@/lib/mongodb";

const DELETE_SENTINEL = "@@DEL@@";

interface LeaseDoc {
  _id: string;
  owner: string;
  expiresAt: Date;
}

interface AuthStateDoc {
  connectionId: string;
  field: string;
  value: string;
  updatedAt?: Date;
}

async function fencedAuthWrite(id: string, pairs: string[]): Promise<boolean> {
  if (pairs.length === 0) {
    return true;
  }
  const db = getDb();

  // Check the lease first
  const lease = await db.collection<LeaseDoc>("leases").findOne({ _id: id });
  if (
    lease &&
    lease.owner !== instanceId &&
    new Date(lease.expiresAt) > new Date()
  ) {
    logger.warn(
      "[%s] [fencedAuthWrite] write rejected — lease is owned by another instance",
      id,
    );
    return false;
  }

  // Build bulk operations
  const ops = [];
  for (let i = 0; i < pairs.length; i += 2) {
    const field = pairs[i];
    const value = pairs[i + 1];
    if (value === DELETE_SENTINEL) {
      ops.push({
        deleteOne: {
          filter: { connectionId: id, field },
        },
      });
    } else {
      ops.push({
        updateOne: {
          filter: { connectionId: id, field },
          update: { $set: { value, updatedAt: new Date() } },
          upsert: true,
        },
      });
    }
  }

  if (ops.length > 0) {
    await db.collection<AuthStateDoc>("auth_states").bulkWrite(ops);
  }
  return true;
}

export async function writeAuthMetadata(
  id: string,
  metadata: unknown,
): Promise<boolean> {
  return fencedAuthWrite(id, ["metadata", JSON.stringify(metadata)]);
}

export async function useRedisAuthState(
  id: string,
  metadata?: unknown,
): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}> {
  const db = getDb();

  const writeData = (_key: string, field: string, data: unknown) =>
    fencedAuthWrite(id, [field, JSON.stringify(data, BufferJSON.replacer)]);

  const readData = async (key: string, field: string) => {
    const doc = await db
      .collection<AuthStateDoc>("auth_states")
      .findOne({ connectionId: id, field });
    return doc && doc.value ? JSON.parse(doc.value, BufferJSON.reviver) : null;
  };

  const creds: AuthenticationCreds =
    (await readData("authState", "creds")) || initAuthCreds();

  if (metadata !== undefined) {
    await writeAuthMetadata(id, metadata);
  }

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};
          await Promise.all(
            ids.map(async (signalId) => {
              const field = `${type}-${signalId}`;
              const value = await readData("authState", field);
              data[signalId] =
                type === "app-state-sync-key" && value
                  ? proto.Message.AppStateSyncKeyData.fromObject(value)
                  : value;
            }),
          );
          return data;
        },
        set: async (data) => {
          type DataKey = keyof typeof data;
          const pairs: string[] = [];
          for (const category in data) {
            for (const dataId in data[category as DataKey]) {
              const field = `${category}-${dataId}`;
              const value = data[category as DataKey]?.[dataId];
              pairs.push(
                field,
                value
                  ? JSON.stringify(value, BufferJSON.replacer)
                  : DELETE_SENTINEL,
              );
            }
          }
          await fencedAuthWrite(id, pairs);
        },
        clear: async () => {
          const lease = await db
            .collection<LeaseDoc>("leases")
            .findOne({ _id: id });
          if (
            lease &&
            lease.owner !== instanceId &&
            new Date(lease.expiresAt) > new Date()
          ) {
            logger.warn(
              "[%s] [clearAuthState] clear rejected — lease is owned by another instance",
              id,
            );
            return;
          }
          await db
            .collection<AuthStateDoc>("auth_states")
            .deleteMany({ connectionId: id });
        },
      },
    },
    saveCreds: async () => {
      await writeData("authState", "creds", creds);
    },
  };
}

export async function isRedisAuthStatePaired(id: string): Promise<boolean> {
  const db = getDb();
  const doc = await db
    .collection<AuthStateDoc>("auth_states")
    .findOne({ connectionId: id, field: "creds" });
  if (!doc || !doc.value) {
    return false;
  }
  try {
    const creds = JSON.parse(doc.value) as { me?: { id?: string } };
    return Boolean(creds?.me?.id);
  } catch {
    return false;
  }
}

export async function getRedisAuthMetadata<T>(id: string): Promise<T | null> {
  const db = getDb();
  const doc = await db
    .collection<AuthStateDoc>("auth_states")
    .findOne({ connectionId: id, field: "metadata" });
  return doc && doc.value ? JSON.parse(doc.value) : null;
}

export async function getRedisSavedAuthStateIds<T>(): Promise<
  Array<{ id: string; metadata: T }>
> {
  const db = getDb();
  const docs = await db
    .collection<AuthStateDoc>("auth_states")
    .find({ field: "metadata" })
    .toArray();
  return docs
    .map((doc) => ({
      id: doc.connectionId,
      metadata: doc.value ? JSON.parse(doc.value) : null,
    }))
    .filter((item) => item.metadata !== null) as Array<{
    id: string;
    metadata: T;
  }>;
}
