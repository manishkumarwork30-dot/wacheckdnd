import { instanceId, workerBaseUrl } from "@/cluster/identity";
import config from "@/config";
import { getDb } from "@/lib/mongodb";

export interface InstanceInfo {
  instanceId: string;
  baseUrl: string;
  connectionCount: number;
  draining: boolean;
  startedAt: number;
}

interface InstanceRegistryDoc {
  _id: string;
  instanceId: string;
  baseUrl: string;
  connectionCount: number;
  draining: boolean;
  startedAt: number;
  updatedAt: Date;
}

const startedAt = Date.now();

export async function heartbeat(info: {
  connectionCount: number;
  draining: boolean;
}): Promise<void> {
  const db = getDb();
  const instances = db.collection<InstanceRegistryDoc>("instances");
  const payload = {
    instanceId,
    baseUrl: workerBaseUrl ?? "",
    connectionCount: info.connectionCount,
    draining: info.draining,
    startedAt,
    updatedAt: new Date(),
  };

  await instances.updateOne(
    { _id: instanceId },
    { $set: payload },
    { upsert: true },
  );
}

export async function listLiveInstances(): Promise<InstanceInfo[]> {
  const db = getDb();
  const instances = db.collection<InstanceRegistryDoc>("instances");
  const cutoff = new Date(Date.now() - config.cluster.instanceTtlMs);
  const docs = await instances.find({ updatedAt: { $gt: cutoff } }).toArray();

  return docs.map((doc) => ({
    instanceId: doc.instanceId,
    baseUrl: doc.baseUrl,
    connectionCount: doc.connectionCount,
    draining: doc.draining,
    startedAt: doc.startedAt,
  }));
}

export async function isInstanceAlive(id: string): Promise<boolean> {
  const db = getDb();
  const instances = db.collection<InstanceRegistryDoc>("instances");
  const cutoff = new Date(Date.now() - config.cluster.instanceTtlMs);
  const count = await instances.countDocuments({
    _id: id,
    updatedAt: { $gt: cutoff },
  });
  return count === 1;
}

export async function getInstance(id: string): Promise<InstanceInfo | null> {
  const db = getDb();
  const instances = db.collection<InstanceRegistryDoc>("instances");
  const doc = await instances.findOne({ _id: id });
  if (!doc) {
    return null;
  }
  return {
    instanceId: doc.instanceId,
    baseUrl: doc.baseUrl,
    connectionCount: doc.connectionCount,
    draining: doc.draining,
    startedAt: doc.startedAt,
  };
}

export async function deregister(): Promise<void> {
  const db = getDb();
  const instances = db.collection<InstanceRegistryDoc>("instances");
  await instances.deleteOne({ _id: instanceId });
}

export interface OwnershipChangedEvent {
  type: "ownership.changed";
  phoneNumber: string;
  instanceId: string;
}

export async function publishOwnershipChanged(
  phoneNumber: string,
): Promise<void> {
  // No-op. Change streams on leases collection handles invalidation.
}
