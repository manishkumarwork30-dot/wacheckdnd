import { LRUCache } from "lru-cache";
import type { ChangeStream } from "mongodb";
import config from "@/config";
import { errorToString } from "@/helpers/errorToString";
import logger from "@/lib/logger";
import { getDb } from "@/lib/mongodb";

export interface RouteTarget {
  instanceId: string;
  baseUrl: string;
}

const cache = new LRUCache<string, RouteTarget>({
  max: 10_000,
  ttl: config.proxy.routeCacheTtlMs,
});

export function getCachedTarget(phoneNumber: string): RouteTarget | undefined {
  return cache.get(phoneNumber);
}

export function setCachedTarget(phoneNumber: string, target: RouteTarget) {
  cache.set(phoneNumber, target);
}

export function invalidateTarget(phoneNumber: string) {
  cache.delete(phoneNumber);
}

let activeChangeStream: ChangeStream | null = null;

export async function startRouteCacheInvalidation() {
  if (activeChangeStream) {
    logger.warn("Route cache invalidation already started");
    return;
  }

  const db = getDb();
  try {
    const leasesCollection = db.collection("leases");
    // Watch for inserts, updates, deletes, and replaces on leases collection
    const changeStream = leasesCollection.watch([
      {
        $match: {
          operationType: { $in: ["insert", "update", "replace", "delete"] },
        },
      },
    ]);

    activeChangeStream = changeStream;

    changeStream.on("change", (next) => {
      try {
        const phoneNumber = (next as any).documentKey?._id;
        if (phoneNumber && typeof phoneNumber === "string") {
          invalidateTarget(phoneNumber);
        }
      } catch (error) {
        logger.warn(
          "Ignoring malformed change event: %s",
          errorToString(error as Error),
        );
      }
    });

    changeStream.on("error", (error: unknown) => {
      logger.error(
        "Route cache change stream error: %s",
        errorToString(error as Error),
      );
    });
  } catch (error) {
    activeChangeStream = null;
    logger.warn(
      "MongoDB Change Streams (Replica Set required) not available; route cache will rely on TTL expiration: %s",
      errorToString(error as Error),
    );
  }
}

export async function stopRouteCacheInvalidation() {
  const changeStream = activeChangeStream;
  activeChangeStream = null;
  if (changeStream) {
    await changeStream.close().catch(() => {});
  }
}
