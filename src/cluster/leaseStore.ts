import { instanceId } from "@/cluster/identity";
import config from "@/config";
import { getDb } from "@/lib/mongodb";

export interface Lease {
  owner: string;
  epoch: number;
}

export type RenewResult = "renewed" | "lost" | "missing";

interface LeaseDoc {
  _id: string;
  owner: string;
  epoch: number;
  expiresAt: Date;
}

interface EpochDoc {
  _id: string;
  epoch: number;
}

interface CooldownDoc {
  _id: string;
  owner: string;
  expiresAt: Date;
}

interface HandoffDoc {
  _id: string;
  target: string;
  expiresAt: Date;
}

function leaseTtl() {
  return config.cluster.leaseTtlMs;
}

async function getNextEpoch(phoneNumber: string): Promise<number> {
  const db = getDb();
  const epochs = db.collection<EpochDoc>("lease_epochs");
  const res = await epochs.findOneAndUpdate(
    { _id: phoneNumber },
    { $inc: { epoch: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return res && res.epoch ? res.epoch : 1;
}

export async function acquireLease(phoneNumber: string): Promise<Lease | null> {
  const db = getDb();
  const leases = db.collection<LeaseDoc>("leases");
  const epoch = await getNextEpoch(phoneNumber);
  const lease: Lease = { owner: instanceId, epoch };
  const now = new Date();
  const expiresAt = new Date(now.getTime() + leaseTtl());

  // Try to update if expired
  const updateRes = await leases.findOneAndUpdate(
    {
      _id: phoneNumber,
      expiresAt: { $lt: now },
    },
    {
      $set: {
        owner: instanceId,
        epoch,
        expiresAt,
      },
    },
    { returnDocument: "after" },
  );

  if (updateRes) {
    return lease;
  }

  // Otherwise, try to insert new lease
  try {
    await leases.insertOne({
      _id: phoneNumber,
      owner: instanceId,
      epoch,
      expiresAt,
    });
    return lease;
  } catch (err) {
    // Already exists and not expired
    return null;
  }
}

export async function forceAcquireLease(phoneNumber: string): Promise<Lease> {
  const db = getDb();
  const leases = db.collection<LeaseDoc>("leases");
  const epoch = await getNextEpoch(phoneNumber);
  const lease: Lease = { owner: instanceId, epoch };
  const expiresAt = new Date(Date.now() + leaseTtl());

  await leases.updateOne(
    { _id: phoneNumber },
    {
      $set: {
        owner: instanceId,
        epoch,
        expiresAt,
      },
    },
    { upsert: true },
  );
  return lease;
}

export async function renewLease(phoneNumber: string): Promise<RenewResult> {
  const db = getDb();
  const leases = db.collection<LeaseDoc>("leases");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + leaseTtl());

  const res = await leases.findOneAndUpdate(
    {
      _id: phoneNumber,
      owner: instanceId,
    },
    {
      $set: { expiresAt },
    },
  );

  if (res) {
    return "renewed";
  }

  const existing = await leases.findOne({ _id: phoneNumber });
  if (!existing) {
    return "missing";
  }
  return "lost";
}

export async function releaseLease(
  phoneNumber: string,
  expectedEpoch: number,
): Promise<boolean> {
  const db = getDb();
  const leases = db.collection<LeaseDoc>("leases");
  const result = await leases.deleteOne({
    _id: phoneNumber,
    owner: instanceId,
    epoch: expectedEpoch,
  });
  return result.deletedCount === 1;
}

export async function getLease(phoneNumber: string): Promise<Lease | null> {
  const db = getDb();
  const leases = db.collection<LeaseDoc>("leases");
  const raw = await leases.findOne({ _id: phoneNumber });
  if (!raw) {
    return null;
  }
  return {
    owner: raw.owner,
    epoch: raw.epoch,
  };
}

export async function setReleaseCooldown(phoneNumber: string): Promise<void> {
  const db = getDb();
  const cooldowns = db.collection<CooldownDoc>("cooldowns");
  const expiresAt = new Date(Date.now() + config.cluster.releaseCooldownMs);
  await cooldowns.updateOne(
    { _id: phoneNumber },
    {
      $set: {
        owner: instanceId,
        expiresAt,
      },
    },
    { upsert: true },
  );
}

export async function isOnOwnReleaseCooldown(
  phoneNumber: string,
): Promise<boolean> {
  const db = getDb();
  const cooldowns = db.collection<CooldownDoc>("cooldowns");
  const value = await cooldowns.findOne({
    _id: phoneNumber,
    expiresAt: { $gt: new Date() },
  });
  return value ? value.owner === instanceId : false;
}

export async function setHandoffTarget(
  phoneNumber: string,
  targetInstanceId: string,
): Promise<void> {
  const db = getDb();
  const handoffs = db.collection<HandoffDoc>("handoffs");
  const expiresAt = new Date(Date.now() + config.cluster.leaseTtlMs);
  await handoffs.updateOne(
    { _id: phoneNumber },
    {
      $set: {
        target: targetInstanceId,
        expiresAt,
      },
    },
    { upsert: true },
  );
}

export async function getHandoffTarget(
  phoneNumber: string,
): Promise<string | null> {
  const db = getDb();
  const handoffs = db.collection<HandoffDoc>("handoffs");
  const value = await handoffs.findOne({
    _id: phoneNumber,
    expiresAt: { $gt: new Date() },
  });
  return value ? value.target : null;
}
