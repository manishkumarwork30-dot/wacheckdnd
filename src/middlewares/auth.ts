import { createHash } from "node:crypto";
import type { Elysia } from "elysia";
import { LRUCache } from "lru-cache";
import config from "@/config";
import { errorToString } from "@/helpers/errorToString";
import logger from "@/lib/logger";
import { getDb } from "@/lib/mongodb";

export interface AuthData {
  role: "user" | "admin";
}

export const REDIS_KEY_PREFIX = "@baileys-api:api-keys";

const apiKeyCache = new LRUCache<string, AuthData>({
  max: 1000,
  ttl: 5 * 60 * 1000,
});

export function clearApiKeyCache(apiKey: string) {
  apiKeyCache.delete(apiKey);
}

function getApiKey(headers: Headers): string | null {
  return headers.get("x-api-key");
}

export const authMiddleware = (app: Elysia) =>
  app
    .derive(async ({ request }) => {
      const apiKey = getApiKey(request.headers);
      if (!apiKey) {
        return { auth: null, apiKeyHash: null as string | null };
      }

      const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");

      try {
        const cached = apiKeyCache.get(apiKey);
        if (cached) {
          return { auth: cached, apiKeyHash };
        }

        const db = getDb();
        const doc = await db.collection("api_keys").findOne({ key: apiKey });

        if (!doc) {
          logger.warn("Invalid API key attempted: %s", apiKeyHash);
          return { auth: null, apiKeyHash: null as string | null };
        }

        const auth: AuthData = { role: doc.role };
        apiKeyCache.set(apiKey, auth);
        return { auth, apiKeyHash };
      } catch (error) {
        logger.error("Auth middleware error %s", errorToString(error));
        return { auth: null, apiKeyHash: null as string | null };
      }
    })
    .onBeforeHandle(({ auth, set }) => {
      if (config.env === "development") {
        return;
      }

      if (!auth) {
        set.status = 401;
        return {
          error: "Unauthorized",
          message: "Valid API key required",
        };
      }
    });

export const adminGuard = (app: Elysia) =>
  app.use(authMiddleware).onBeforeHandle(({ auth, set }) => {
    if (auth?.role !== "admin") {
      set.status = 404;
      return "NOT_FOUND";
    }
  });
