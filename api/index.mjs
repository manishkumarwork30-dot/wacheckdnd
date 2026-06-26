var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/app.ts
import cors from "@elysiajs/cors";
import Elysia6 from "elysia";

// package.json
var package_default = {
  name: "@fazer-ai/baileys-api",
  version: "1.0.0",
  description: "Baileys API for WhatsApp.",
  author: "gabrieljablonski",
  repository: {
    type: "git",
    url: "https://github.com/fazer-ai/baileys-api.git"
  },
  license: "MIT",
  main: "src/index.ts",
  module: "src/index.ts",
  scripts: {
    dev: "bun --watch src/index.ts",
    test: "bun test --coverage",
    "test-watch": "bun test --watch",
    start: "bun src/index.ts",
    build: "esbuild src/vercel-entry.ts --bundle --platform=node --target=node20 --format=esm --outfile=api/index.mjs --packages=external",
    lint: "bun biome check",
    format: "bun biome check --write",
    "manage-api-keys": "LOG_LEVEL=warn bun scripts/manage-api-keys.ts",
    "build-swagger": "LOG_LEVEL=warn bun scripts/build-swagger.ts",
    "build-check": "bunx tsc --noEmit",
    check: "bun lint && bun build-check && bun test"
  },
  dependencies: {
    "@elysiajs/cors": "^1.4.2",
    "@elysiajs/swagger": "^1.3.1",
    "@ffmpeg-installer/ffmpeg": "^1.1.0",
    "@hapi/boom": "^10.0.1",
    "@sinclair/typebox": "^0.34.14",
    "@whiskeysockets/baileys": "7.0.0-rc13",
    "audio-decode": "^2.2.3",
    dotenv: "^17.4.2",
    elysia: "^1.4.28",
    "fluent-ffmpeg": "^2.1.3",
    "link-preview-js": "^3.0.0",
    "lru-cache": "^11.5.1",
    mongodb: "^7.4.0",
    pino: "^10.3.1",
    "pino-pretty": "^13.1.3",
    "pino-roll": "^4.0.0",
    qrcode: "^1.5.4",
    redis: "^6.0.0",
    sharp: "^0.34.5"
  },
  devDependencies: {
    "@biomejs/biome": "2.4.16",
    "@types/fluent-ffmpeg": "^2.1.28",
    "@types/qrcode": "^1.5.6",
    "bun-types": "latest",
    esbuild: "^0.20.1",
    "pino-caller": "^4.0.0",
    typescript: "^6.0.3"
  },
  patchedDependencies: {
    "@whiskeysockets/baileys@7.0.0-rc13": "patches/@whiskeysockets%2Fbaileys@7.0.0-rc13.patch"
  }
};

// src/config.ts
var {
  NODE_ENV,
  PORT,
  LOG_LEVEL,
  BAILEYS_LOG_LEVEL,
  BAILEYS_CLIENT_VERSION,
  BAILEYS_OVERRIDE_CLIENT_VERSION,
  MONGO_URL,
  WEBHOOK_RETRY_POLICY_MAX_RETRIES,
  WEBHOOK_RETRY_POLICY_RETRY_INTERVAL,
  WEBHOOK_RETRY_POLICY_BACKOFF_FACTOR,
  CORS_ORIGIN,
  IGNORE_GROUP_MESSAGES,
  IGNORE_STATUS_MESSAGES,
  IGNORE_BROADCAST_MESSAGES,
  IGNORE_NEWSLETTER_MESSAGES,
  IGNORE_BOT_MESSAGES,
  IGNORE_META_AI_MESSAGES,
  MEDIA_CLEANUP_ENABLED,
  MEDIA_CLEANUP_INTERVAL_MS,
  MEDIA_MAX_AGE_HOURS,
  BAILEYS_LISTEN_TO_EVENTS,
  ROLE,
  INSTANCE_ID,
  WORKER_BASE_URL,
  CLUSTER_LEASE_TTL_MS,
  CLUSTER_LEASE_RENEW_INTERVAL_MS,
  CLUSTER_CLAIM_INTERVAL_MS,
  CLUSTER_CLAIM_JITTER_MS,
  CLUSTER_RECONNECT_CONCURRENCY,
  CLUSTER_UNCLAIMED_GRACE_MS,
  CLUSTER_RELEASE_COOLDOWN_MS,
  CLUSTER_REBALANCE_ENABLED,
  CLUSTER_REBALANCE_RELEASE_INTERVAL_MS,
  CLUSTER_REBALANCE_TOLERANCE,
  CLUSTER_REBALANCE_IDLE_THRESHOLD_MS,
  CLUSTER_HEARTBEAT_INTERVAL_MS,
  CLUSTER_INSTANCE_TTL_MS,
  CLUSTER_SHUTDOWN_TIMEOUT_MS,
  PROXY_ROUTE_CACHE_TTL_MS,
  PROXY_REQUEST_TIMEOUT_MS,
  PROXY_MAX_BODY_BYTES
} = process.env;
function intFromEnv(name, raw, fallback, { min = 1 } = {}) {
  if (raw === void 0 || raw === "") {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min) {
    throw new Error(`${name} must be an integer >= ${min}, got "${raw}"`);
  }
  return value;
}
function boolFromEnv(name, raw, fallback) {
  if (raw === void 0 || raw === "") {
    return fallback;
  }
  if (raw !== "true" && raw !== "false") {
    throw new Error(`${name} must be "true" or "false", got "${raw}"`);
  }
  return raw === "true";
}
var config = {
  packageInfo: {
    name: package_default.name,
    version: package_default.version,
    description: package_default.description,
    repository: package_default.repository
  },
  port: PORT ? Number(PORT) : 3025,
  env: NODE_ENV || "development",
  logLevel: LOG_LEVEL || "info",
  baileys: {
    logLevel: BAILEYS_LOG_LEVEL || "warn",
    clientVersion: BAILEYS_CLIENT_VERSION || "default",
    overrideClientVersion: BAILEYS_OVERRIDE_CLIENT_VERSION === "true",
    // FIXME: We ignore any non-user messages for now. As we implement more features,
    // we can enable them as needed.
    ignoreGroupMessages: IGNORE_GROUP_MESSAGES ? IGNORE_GROUP_MESSAGES === "true" : false,
    ignoreStatusMessages: IGNORE_STATUS_MESSAGES ? IGNORE_STATUS_MESSAGES === "true" : true,
    ignoreBroadcastMessages: IGNORE_BROADCAST_MESSAGES ? IGNORE_BROADCAST_MESSAGES === "true" : true,
    ignoreNewsletterMessages: IGNORE_NEWSLETTER_MESSAGES ? IGNORE_NEWSLETTER_MESSAGES === "true" : true,
    ignoreBotMessages: IGNORE_BOT_MESSAGES ? IGNORE_BOT_MESSAGES === "true" : true,
    ignoreMetaAiMessages: IGNORE_META_AI_MESSAGES ? IGNORE_META_AI_MESSAGES === "true" : true,
    listenToEvents: new Set(
      BAILEYS_LISTEN_TO_EVENTS ? BAILEYS_LISTEN_TO_EVENTS.split(",").map((e) => e.trim()) : []
    )
  },
  mongo: {
    url: MONGO_URL || process.env.MONGODB_URI || "mongodb://localhost:27017"
  },
  webhook: {
    retryPolicy: {
      maxRetries: WEBHOOK_RETRY_POLICY_MAX_RETRIES ? Number(WEBHOOK_RETRY_POLICY_MAX_RETRIES) : 3,
      retryInterval: WEBHOOK_RETRY_POLICY_RETRY_INTERVAL ? Number(WEBHOOK_RETRY_POLICY_RETRY_INTERVAL) : 5e3,
      backoffFactor: WEBHOOK_RETRY_POLICY_BACKOFF_FACTOR ? Number(WEBHOOK_RETRY_POLICY_BACKOFF_FACTOR) : 3
    }
  },
  corsOrigin: CORS_ORIGIN || "localhost",
  cluster: {
    role: ROLE || "standalone",
    instanceId: INSTANCE_ID || void 0,
    workerBaseUrl: WORKER_BASE_URL || void 0,
    leaseTtlMs: intFromEnv(
      "CLUSTER_LEASE_TTL_MS",
      CLUSTER_LEASE_TTL_MS,
      3e4
    ),
    leaseRenewIntervalMs: intFromEnv(
      "CLUSTER_LEASE_RENEW_INTERVAL_MS",
      CLUSTER_LEASE_RENEW_INTERVAL_MS,
      1e4
    ),
    claimIntervalMs: intFromEnv(
      "CLUSTER_CLAIM_INTERVAL_MS",
      CLUSTER_CLAIM_INTERVAL_MS,
      5e3
    ),
    claimJitterMs: intFromEnv(
      "CLUSTER_CLAIM_JITTER_MS",
      CLUSTER_CLAIM_JITTER_MS,
      2e3,
      { min: 0 }
    ),
    reconnectConcurrency: intFromEnv(
      "CLUSTER_RECONNECT_CONCURRENCY",
      CLUSTER_RECONNECT_CONCURRENCY,
      5
    ),
    unclaimedGraceMs: intFromEnv(
      "CLUSTER_UNCLAIMED_GRACE_MS",
      CLUSTER_UNCLAIMED_GRACE_MS,
      3e4,
      { min: 0 }
    ),
    releaseCooldownMs: intFromEnv(
      "CLUSTER_RELEASE_COOLDOWN_MS",
      CLUSTER_RELEASE_COOLDOWN_MS,
      6e4,
      { min: 0 }
    ),
    rebalanceEnabled: boolFromEnv(
      "CLUSTER_REBALANCE_ENABLED",
      CLUSTER_REBALANCE_ENABLED,
      true
    ),
    rebalanceReleaseIntervalMs: intFromEnv(
      "CLUSTER_REBALANCE_RELEASE_INTERVAL_MS",
      CLUSTER_REBALANCE_RELEASE_INTERVAL_MS,
      1e4
    ),
    rebalanceTolerance: intFromEnv(
      "CLUSTER_REBALANCE_TOLERANCE",
      CLUSTER_REBALANCE_TOLERANCE,
      1,
      { min: 0 }
    ),
    // 0 disables the timing component of idle detection: every connection
    // without in-flight webhooks counts as idle (useful in tests, surprising
    // in production).
    rebalanceIdleThresholdMs: intFromEnv(
      "CLUSTER_REBALANCE_IDLE_THRESHOLD_MS",
      CLUSTER_REBALANCE_IDLE_THRESHOLD_MS,
      3e5,
      { min: 0 }
    ),
    heartbeatIntervalMs: intFromEnv(
      "CLUSTER_HEARTBEAT_INTERVAL_MS",
      CLUSTER_HEARTBEAT_INTERVAL_MS,
      5e3
    ),
    instanceTtlMs: intFromEnv(
      "CLUSTER_INSTANCE_TTL_MS",
      CLUSTER_INSTANCE_TTL_MS,
      15e3
    ),
    shutdownTimeoutMs: intFromEnv(
      "CLUSTER_SHUTDOWN_TIMEOUT_MS",
      CLUSTER_SHUTDOWN_TIMEOUT_MS,
      3e4,
      { min: 0 }
    )
  },
  proxy: {
    routeCacheTtlMs: intFromEnv(
      "PROXY_ROUTE_CACHE_TTL_MS",
      PROXY_ROUTE_CACHE_TTL_MS,
      5e3
    ),
    // Above the worst-case worker operation: POST /connections (client
    // version fetch + socket handshake) and send-message with audio
    // preprocessing.
    requestTimeoutMs: intFromEnv(
      "PROXY_REQUEST_TIMEOUT_MS",
      PROXY_REQUEST_TIMEOUT_MS,
      75e3
    ),
    // Bodies are buffered for 421/409 replay; the cap keeps a handful of
    // concurrent large uploads from exhausting the proxy's memory. 64 MiB
    // leaves headroom over chatwoot's default 40 MB attachment limit after
    // base64 inflation (~54 MiB).
    maxBodyBytes: intFromEnv(
      "PROXY_MAX_BODY_BYTES",
      PROXY_MAX_BODY_BYTES,
      64 * 1024 * 1024
    )
  },
  media: {
    cleanupEnabled: MEDIA_CLEANUP_ENABLED === "true",
    cleanupIntervalMs: Number(MEDIA_CLEANUP_INTERVAL_MS) || 60 * 60 * 1e3,
    // 1 hour
    maxAgeHours: Number(MEDIA_MAX_AGE_HOURS) || 24
    // 24 hours
  }
};
if (!["standalone", "worker", "proxy"].includes(config.cluster.role)) {
  throw new Error(
    `Invalid ROLE "${config.cluster.role}" \u2014 expected standalone, worker or proxy`
  );
}
if (config.cluster.leaseRenewIntervalMs > config.cluster.leaseTtlMs / 2) {
  throw new Error(
    "CLUSTER_LEASE_RENEW_INTERVAL_MS must be at most half of CLUSTER_LEASE_TTL_MS"
  );
}
if (config.cluster.heartbeatIntervalMs > config.cluster.instanceTtlMs / 2) {
  throw new Error(
    "CLUSTER_HEARTBEAT_INTERVAL_MS must be at most half of CLUSTER_INSTANCE_TTL_MS"
  );
}
var config_default = config;

// src/controllers/admin.ts
import Elysia from "elysia";

// src/baileys/connection.ts
import makeWASocket, {
  Browsers,
  DisconnectReason,
  isJidGroup as isJidGroup2,
  makeCacheableSignalKeyStore,
  WAMessageStatus
} from "@whiskeysockets/baileys";
import { toDataURL } from "qrcode";

// src/baileys/helpers/downloadMediaFromMessages.ts
import { unlink } from "node:fs/promises";
import path2 from "node:path";
import {
  downloadContentFromMessage
} from "@whiskeysockets/baileys";

// src/bun-polyfill.ts
import fs from "node:fs/promises";
function file(path4) {
  return {
    exists: () => fs.access(path4).then(() => true).catch(() => false),
    arrayBuffer: async () => {
      const buf = await fs.readFile(path4);
      return buf.buffer;
    },
    write: (data) => fs.writeFile(path4, data)
  };
}

// src/lib/logger.ts
import path, { join } from "node:path";
import pino from "pino";
function omitKeys(obj, keys) {
  for (const key in obj) {
    if (keys.includes(key)) {
      obj[key] = "********";
    }
  }
}
function sanitizeItem(item, options) {
  if (item === null || item === void 0) {
    return item;
  }
  if (typeof item === "string") {
    return `${item.slice(0, 50)}${item.length > 50 ? "..." : ""}`;
  }
  if (Array.isArray(item) || item instanceof Set) {
    const arr = Array.from(item);
    const maxItems = 3;
    const sanitized = arr.slice(0, maxItems).map((i) => sanitizeItem(i, options));
    if (arr.length > maxItems) {
      sanitized.push(`... and ${arr.length - maxItems} more`);
    }
    return sanitized;
  }
  if (typeof item === "object") {
    const obj = item;
    const keys = Object.keys(obj);
    const maxKeys = 20;
    if (keys.length > maxKeys) {
      const truncated = {};
      for (const key of keys.slice(0, maxKeys)) {
        truncated[key] = sanitizeItem(obj[key], options);
      }
      truncated["..."] = `${keys.length - maxKeys} more keys`;
      return truncated;
    }
    return deepSanitizeObject(obj, options);
  }
  return item;
}
function deepSanitizeObject(obj, options) {
  const output = structuredClone(obj);
  if (options?.omitKeys) {
    omitKeys(output, options.omitKeys);
  }
  for (const key in output) {
    output[key] = sanitizeItem(output[key], options);
  }
  return output;
}
var isDev = config_default.env === "development";
function buildDevTransport(level, logFile) {
  return {
    targets: [
      {
        level,
        target: "pino-roll",
        options: {
          file: path.join("logs", logFile),
          size: "50m",
          limit: { count: 10 }
        }
      },
      {
        level,
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard"
        }
      }
    ]
  };
}
var baileysLogger = pino({
  level: isDev ? "debug" : config_default.baileys.logLevel,
  ...isDev && {
    transport: buildDevTransport(config_default.baileys.logLevel, "baileys")
  }
});
var logger = pino({
  level: isDev ? "debug" : config_default.logLevel,
  ...isDev && {
    transport: buildDevTransport(config_default.logLevel, "log")
  }
});
if (config_default.env === "development") {
  logger = __require("pino-caller")(logger, {
    relativeTo: join(__dirname, "..")
  });
}
var logger_default = logger;

// src/baileys/helpers/preprocessAudio.ts
var POOL_SIZE = typeof navigator !== "undefined" && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;
var workers = [];
var nextWorkerIndex = 0;
var messageId = 0;
var pendingRequests = /* @__PURE__ */ new Map();
function getWorkerPool() {
  if (workers.length > 0) {
    return workers;
  }
  for (let i = 0; i < POOL_SIZE; i++) {
    const worker = new Worker(
      new URL("./preprocessAudioWorker.ts", import.meta.url).href
    );
    worker.onmessage = (event) => {
      const { id, result, error } = event.data;
      const pending = pendingRequests.get(id);
      if (!pending) {
        return;
      }
      pendingRequests.delete(id);
      if (error) {
        pending.reject(new Error(error));
      } else if (result) {
        pending.resolve(Buffer.from(result));
      }
    };
    worker.onerror = (event) => {
      logger_default.error("Audio worker error: %s", event.message);
      for (const [id, pending] of pendingRequests) {
        pending.reject(new Error(`Worker error: ${event.message}`));
        pendingRequests.delete(id);
      }
    };
    workers.push(worker);
  }
  return workers;
}
async function preprocessAudio(audio, format) {
  const pool = getWorkerPool();
  const worker = pool[nextWorkerIndex % pool.length];
  nextWorkerIndex++;
  const id = messageId++;
  const arrayBuffer = new Uint8Array(audio).buffer;
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    worker.postMessage({ id, audio: arrayBuffer, format }, [arrayBuffer]);
  });
}

// src/cluster/identity.ts
import os from "node:os";
var instanceId = config_default.cluster.instanceId || `${os.hostname()}-${Math.random().toString(36).slice(2, 8)}`;
var incarnationId = Math.random().toString(36).slice(2, 10);
var role = config_default.cluster.role;
var workerBaseUrl = config_default.cluster.workerBaseUrl || `http://${os.hostname()}:${config_default.port}`;

// src/helpers/errorToString.ts
function errorToString(error) {
  if (error instanceof Error) {
    return error.stack || error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null) {
    return JSON.stringify(error);
  }
  return "";
}

// src/lib/mongodb.ts
import { MongoClient } from "mongodb";
var client = null;
var db = null;
async function initializeMongo() {
  if (db)
    return db;
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || "mongodb://localhost:27017";
  const dbName = "verification_db";
  logger_default.info("Connecting to MongoDB...");
  client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db(dbName);
  logger_default.info("Connected to MongoDB");
  return db;
}
function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call initializeMongo() first.");
  }
  return db;
}

// src/baileys/helpers/downloadMediaFromMessages.ts
var CONCURRENCY = 3;
async function downloadMediaFromMessages(messages, options) {
  const downloadedMedia = {};
  const mediaDir = path2.resolve(process.cwd(), "media");
  const downloadableMessages = messages.filter(
    ({ key, message }) => key.id && message && extractMediaMessage(message).mediaMessage
  );
  if (downloadableMessages.length === 0) {
    return null;
  }
  for (let i = 0; i < downloadableMessages.length; i += CONCURRENCY) {
    const chunk = downloadableMessages.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      chunk.map(async ({ key, message }) => {
        if (!key.id || !message) {
          return;
        }
        const { mediaMessage, mediaType } = extractMediaMessage(message);
        if (!mediaMessage || !mediaType) {
          return;
        }
        const stream = await downloadContentFromMessage(
          mediaMessage,
          mediaType
        );
        let fileBuffer = await streamToBuffer(stream);
        if (message.audioMessage) {
          fileBuffer = await preprocessAudio(fileBuffer, "ogg-low");
          message.audioMessage.mimetype = "audio/ogg; codecs=opus";
        }
        const filePath = path2.join(mediaDir, `${key.id}`);
        await file(filePath).write(fileBuffer);
        try {
          const db2 = getDb();
          const expiresAt = config_default.media.cleanupEnabled ? new Date(
            Date.now() + (config_default.media.maxAgeHours * 3600 + Math.ceil(config_default.media.cleanupIntervalMs / 1e3)) * 1e3
          ) : void 0;
          await db2.collection(
            "media_owners"
          ).updateOne(
            { _id: key.id },
            { $set: { owner: instanceId, expiresAt } },
            { upsert: true }
          );
        } catch (error) {
          if (config_default.cluster.role === "worker") {
            await unlink(filePath).catch(() => {
            });
            throw error;
          }
          logger_default.warn(
            "Failed to record media owner for %s: %s",
            key.id,
            errorToString(error)
          );
        }
        if (options?.includeMedia) {
          downloadedMedia[key.id] = fileBuffer.toString("base64");
        }
      })
    );
    for (const result of results) {
      if (result.status === "rejected") {
        logger_default.error(
          "Failed to download media: %s",
          errorToString(result.reason)
        );
      }
    }
  }
  return Object.keys(downloadedMedia).length > 0 ? downloadedMedia : null;
}
function extractMediaMessage(message) {
  const mediaMapping = [
    ["imageMessage", "image"],
    ["stickerMessage", "sticker"],
    ["videoMessage", "video"],
    ["audioMessage", "audio"],
    ["documentMessage", "document"],
    ["documentWithCaptionMessage", "document"]
  ];
  for (const [field, type] of mediaMapping) {
    if (message[field]) {
      return {
        mediaMessage: field === "documentWithCaptionMessage" ? message[field]?.message?.documentMessage : message[field],
        mediaType: type
      };
    }
  }
  return extractHeaderMediaMessage(message) ?? {
    mediaMessage: null,
    mediaType: null
  };
}
function extractHeaderMediaMessage(message) {
  const headers = [
    message.templateMessage?.hydratedFourRowTemplate,
    message.templateMessage?.hydratedTemplate,
    message.interactiveMessage?.header,
    message.templateMessage?.interactiveMessageTemplate?.header,
    message.buttonsMessage
  ];
  const headerMapping = [
    ["imageMessage", "image"],
    ["videoMessage", "video"],
    ["documentMessage", "document"]
  ];
  for (const header of headers) {
    if (!header) {
      continue;
    }
    for (const [field, type] of headerMapping) {
      const node = header[field];
      if (node) {
        return { mediaMessage: node, mediaType: type };
      }
    }
  }
  return null;
}
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// src/baileys/helpers/fetchBaileysClientVersion.ts
import {
  fetchLatestWaWebVersion
} from "@whiskeysockets/baileys";
async function fetchBaileysClientVersion() {
  const { version } = await fetchLatestWaWebVersion({});
  if (config_default.baileys.overrideClientVersion) {
    if (config_default.baileys.clientVersion === "default") {
      logger_default.warn(
        "BAILEYS_OVERRIDE_CLIENT_VERSION is set to true but BAILEYS_CLIENT_VERSION is unset. Using latest version %s instead.",
        version.join(".")
      );
      return version;
    }
    if (/^\d+\.\d+\.\d+$/.test(config_default.baileys.clientVersion)) {
      return config_default.baileys.clientVersion.split(".").map((v) => Number(v));
    }
    logger_default.warn(
      "Invalid BAILEYS_CLIENT_VERSION format, expected semver (e.g. 2.2314.13). Falling back to latest version %s instead.",
      version.join(".")
    );
  } else if (config_default.baileys.clientVersion !== "default") {
    logger_default.warn(
      "BAILEYS_CLIENT_VERSION is set to version %s without BAILEYS_OVERRIDE_CLIENT_VERSION. Remove this variable to suppress this warning, or set BAILEYS_OVERRIDE_CLIENT_VERSION to true to use the specified version. Using latest version %s instead.",
      config_default.baileys.clientVersion,
      version.join(".")
    );
  }
  return version;
}

// src/baileys/helpers/normalizeBrazilPhoneNumber.ts
function normalizeBrazilPhoneNumber(phoneNumber) {
  const match = phoneNumber.match(/^\+55(\d{2})(\d{8})$/);
  if (!match) {
    return phoneNumber;
  }
  const [, ddd, number] = match;
  return `+55${ddd}9${number}`;
}

// src/baileys/helpers/shouldIgnoreJid.ts
import {
  isJidBot,
  isJidBroadcast,
  isJidGroup,
  isJidMetaAI,
  isJidNewsletter,
  isJidStatusBroadcast
} from "@whiskeysockets/baileys";
function shouldIgnoreJid(jid) {
  const {
    ignoreGroupMessages,
    ignoreStatusMessages,
    ignoreBroadcastMessages,
    ignoreNewsletterMessages,
    ignoreBotMessages,
    ignoreMetaAiMessages
  } = config_default.baileys;
  if (isJidGroup(jid) && ignoreGroupMessages) {
    return true;
  }
  if (isJidStatusBroadcast(jid) && ignoreStatusMessages) {
    return true;
  }
  if (isJidBroadcast(jid) && !isJidStatusBroadcast(jid) && ignoreBroadcastMessages) {
    return true;
  }
  if (isJidNewsletter(jid) && ignoreNewsletterMessages) {
    return true;
  }
  if (isJidBot(jid) && ignoreBotMessages) {
    return true;
  }
  if (isJidMetaAI(jid) && ignoreMetaAiMessages) {
    return true;
  }
  return false;
}

// src/baileys/redisAuthState.ts
import {
  BufferJSON,
  initAuthCreds,
  proto
} from "@whiskeysockets/baileys";
var DELETE_SENTINEL = "@@DEL@@";
async function fencedAuthWrite(id, pairs) {
  if (pairs.length === 0) {
    return true;
  }
  const db2 = getDb();
  const lease = await db2.collection("leases").findOne({ _id: id });
  if (lease && lease.owner !== instanceId && new Date(lease.expiresAt) > /* @__PURE__ */ new Date()) {
    logger_default.warn(
      "[%s] [fencedAuthWrite] write rejected \u2014 lease is owned by another instance",
      id
    );
    return false;
  }
  const ops = [];
  for (let i = 0; i < pairs.length; i += 2) {
    const field = pairs[i];
    const value = pairs[i + 1];
    if (value === DELETE_SENTINEL) {
      ops.push({
        deleteOne: {
          filter: { connectionId: id, field }
        }
      });
    } else {
      ops.push({
        updateOne: {
          filter: { connectionId: id, field },
          update: { $set: { value, updatedAt: /* @__PURE__ */ new Date() } },
          upsert: true
        }
      });
    }
  }
  if (ops.length > 0) {
    await db2.collection("auth_states").bulkWrite(ops);
  }
  return true;
}
async function writeAuthMetadata(id, metadata) {
  return fencedAuthWrite(id, ["metadata", JSON.stringify(metadata)]);
}
async function useRedisAuthState(id, metadata) {
  const db2 = getDb();
  const writeData = (_key, field, data) => fencedAuthWrite(id, [field, JSON.stringify(data, BufferJSON.replacer)]);
  const readData = async (key, field) => {
    const doc = await db2.collection("auth_states").findOne({ connectionId: id, field });
    return doc && doc.value ? JSON.parse(doc.value, BufferJSON.reviver) : null;
  };
  const creds = await readData("authState", "creds") || initAuthCreds();
  if (metadata !== void 0) {
    await writeAuthMetadata(id, metadata);
  }
  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (signalId) => {
              const field = `${type}-${signalId}`;
              const value = await readData("authState", field);
              data[signalId] = type === "app-state-sync-key" && value ? proto.Message.AppStateSyncKeyData.fromObject(value) : value;
            })
          );
          return data;
        },
        set: async (data) => {
          const pairs = [];
          for (const category in data) {
            for (const dataId in data[category]) {
              const field = `${category}-${dataId}`;
              const value = data[category]?.[dataId];
              pairs.push(
                field,
                value ? JSON.stringify(value, BufferJSON.replacer) : DELETE_SENTINEL
              );
            }
          }
          await fencedAuthWrite(id, pairs);
        },
        clear: async () => {
          const lease = await db2.collection("leases").findOne({ _id: id });
          if (lease && lease.owner !== instanceId && new Date(lease.expiresAt) > /* @__PURE__ */ new Date()) {
            logger_default.warn(
              "[%s] [clearAuthState] clear rejected \u2014 lease is owned by another instance",
              id
            );
            return;
          }
          await db2.collection("auth_states").deleteMany({ connectionId: id });
        }
      }
    },
    saveCreds: async () => {
      await writeData("authState", "creds", creds);
    }
  };
}
async function isRedisAuthStatePaired(id) {
  const db2 = getDb();
  const doc = await db2.collection("auth_states").findOne({ connectionId: id, field: "creds" });
  if (!doc || !doc.value) {
    return false;
  }
  try {
    const creds = JSON.parse(doc.value);
    return Boolean(creds?.me?.id);
  } catch {
    return false;
  }
}
async function getRedisAuthMetadata(id) {
  const db2 = getDb();
  const doc = await db2.collection("auth_states").findOne({ connectionId: id, field: "metadata" });
  return doc && doc.value ? JSON.parse(doc.value) : null;
}
async function getRedisSavedAuthStateIds() {
  const db2 = getDb();
  const docs = await db2.collection("auth_states").find({ field: "metadata" }).toArray();
  return docs.map((doc) => ({
    id: doc.connectionId,
    metadata: doc.value ? JSON.parse(doc.value) : null
  })).filter((item) => item.metadata !== null);
}

// src/cluster/leaseStore.ts
function leaseTtl() {
  return config_default.cluster.leaseTtlMs;
}
async function getNextEpoch(phoneNumber) {
  const db2 = getDb();
  const epochs = db2.collection("lease_epochs");
  const res = await epochs.findOneAndUpdate(
    { _id: phoneNumber },
    { $inc: { epoch: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return res && res.epoch ? res.epoch : 1;
}
async function acquireLease(phoneNumber) {
  const db2 = getDb();
  const leases = db2.collection("leases");
  const epoch = await getNextEpoch(phoneNumber);
  const lease = { owner: instanceId, epoch };
  const now = /* @__PURE__ */ new Date();
  const expiresAt = new Date(now.getTime() + leaseTtl());
  const updateRes = await leases.findOneAndUpdate(
    {
      _id: phoneNumber,
      expiresAt: { $lt: now }
    },
    {
      $set: {
        owner: instanceId,
        epoch,
        expiresAt
      }
    },
    { returnDocument: "after" }
  );
  if (updateRes) {
    return lease;
  }
  try {
    await leases.insertOne({
      _id: phoneNumber,
      owner: instanceId,
      epoch,
      expiresAt
    });
    return lease;
  } catch (err) {
    return null;
  }
}
async function forceAcquireLease(phoneNumber) {
  const db2 = getDb();
  const leases = db2.collection("leases");
  const epoch = await getNextEpoch(phoneNumber);
  const lease = { owner: instanceId, epoch };
  const expiresAt = new Date(Date.now() + leaseTtl());
  await leases.updateOne(
    { _id: phoneNumber },
    {
      $set: {
        owner: instanceId,
        epoch,
        expiresAt
      }
    },
    { upsert: true }
  );
  return lease;
}
async function renewLease(phoneNumber) {
  const db2 = getDb();
  const leases = db2.collection("leases");
  const now = /* @__PURE__ */ new Date();
  const expiresAt = new Date(now.getTime() + leaseTtl());
  const res = await leases.findOneAndUpdate(
    {
      _id: phoneNumber,
      owner: instanceId
    },
    {
      $set: { expiresAt }
    }
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
async function releaseLease(phoneNumber, expectedEpoch) {
  const db2 = getDb();
  const leases = db2.collection("leases");
  const result = await leases.deleteOne({
    _id: phoneNumber,
    owner: instanceId,
    epoch: expectedEpoch
  });
  return result.deletedCount === 1;
}
async function getLease(phoneNumber) {
  const db2 = getDb();
  const leases = db2.collection("leases");
  const raw = await leases.findOne({ _id: phoneNumber });
  if (!raw) {
    return null;
  }
  return {
    owner: raw.owner,
    epoch: raw.epoch
  };
}
async function setReleaseCooldown(phoneNumber) {
  const db2 = getDb();
  const cooldowns = db2.collection("cooldowns");
  const expiresAt = new Date(Date.now() + config_default.cluster.releaseCooldownMs);
  await cooldowns.updateOne(
    { _id: phoneNumber },
    {
      $set: {
        owner: instanceId,
        expiresAt
      }
    },
    { upsert: true }
  );
}
async function isOnOwnReleaseCooldown(phoneNumber) {
  const db2 = getDb();
  const cooldowns = db2.collection("cooldowns");
  const value = await cooldowns.findOne({
    _id: phoneNumber,
    expiresAt: { $gt: /* @__PURE__ */ new Date() }
  });
  return value ? value.owner === instanceId : false;
}
async function setHandoffTarget(phoneNumber, targetInstanceId) {
  const db2 = getDb();
  const handoffs = db2.collection("handoffs");
  const expiresAt = new Date(Date.now() + config_default.cluster.leaseTtlMs);
  await handoffs.updateOne(
    { _id: phoneNumber },
    {
      $set: {
        target: targetInstanceId,
        expiresAt
      }
    },
    { upsert: true }
  );
}
async function getHandoffTarget(phoneNumber) {
  const db2 = getDb();
  const handoffs = db2.collection("handoffs");
  const value = await handoffs.findOne({
    _id: phoneNumber,
    expiresAt: { $gt: /* @__PURE__ */ new Date() }
  });
  return value ? value.target : null;
}

// src/helpers/asyncSleep.ts
async function asyncSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// src/baileys/connection.ts
var CONNECTION_REPLACED_LOOP_WINDOW_MS = 3e4;
var CONNECTION_REPLACED_LOOP_THRESHOLD = 5;
var CONNECTION_REPLACED_BACKOFF_MS = 3e4;
var MESSAGE_ACCOUNT_RESTRICTION_CODE = "463";
var REACHOUT_TIMELOCK_REFETCH_WINDOW_MS = 6e4;
var BaileysNotConnectedError = class extends Error {
  constructor() {
    super("Phone number not connected");
  }
};
var BaileysConnectionForbiddenError = class extends Error {
  constructor() {
    super("Connection not owned by this API key");
  }
};
var BaileysConnection = class {
  constructor(phoneNumber, options) {
    this.LOGGER_OMIT_KEYS = [
      "qr",
      "qrDataUrl",
      "fileSha256",
      "jpegThumbnail",
      "fileEncSha256",
      "scansSidecar",
      "midQualityFileSha256",
      "mediaKey",
      "senderKeyHash",
      "recipientKeyHash",
      "messageSecret",
      "thumbnailSha256",
      "thumbnailEncSha256",
      "appStateSyncKeyShare",
      "initialHistBootstrapInlinePayload"
    ];
    this.ALL_BAILEYS_SOCKET_EVENTS = [
      "connection.update",
      "creds.update",
      "messaging-history.set",
      "messaging-history.status",
      "chats.upsert",
      "chats.update",
      "chats.lock",
      "lid-mapping.update",
      "chats.delete",
      "presence.update",
      "contacts.upsert",
      "contacts.update",
      "messages.delete",
      "messages.update",
      "messages.media-update",
      "messages.upsert",
      "messages.reaction",
      "message-receipt.update",
      "message-capping.update",
      "groups.upsert",
      "groups.update",
      "group-participants.update",
      "group.join-request",
      "group.member-tag.update",
      "blocklist.set",
      "blocklist.update",
      "call",
      "labels.edit",
      "labels.association",
      "newsletter.reaction",
      "newsletter.view",
      "newsletter-participants.update",
      "newsletter-settings.update",
      "settings.update"
    ];
    this.clearOnlinePresenceTimeout = null;
    this.reconnectCount = 0;
    this.connectionReplacedTimestamps = [];
    this.isDiscarded = false;
    this._inFlightWebhooks = 0;
    this.leaseEpoch = null;
    // Monotonic timestamp of the last message-level traffic (received message,
    // outgoing send, receipt update). null = no traffic since this connection
    // object was created. Drives idle-aware handoff in the coordinator.
    this._lastTrafficAt = null;
    this.groupActivityMap = /* @__PURE__ */ new Map();
    this.groupActivityInterval = null;
    // Debounce bookkeeping for the active reach-out time-lock query triggered on
    // a 463 (see handleMessagesUpdate / fetchReachoutTimelockOn463).
    this.reachoutTimelockFetchInFlight = false;
    this.lastReachoutTimelockFetchAt = 0;
    this.phoneNumber = phoneNumber;
    this.clientName = options.clientName || "Chrome";
    this.webhookUrl = options.webhookUrl;
    this.webhookVerifyToken = options.webhookVerifyToken;
    this.onConnectionClose = options.onConnectionClose || null;
    this.requestLogout = options.requestLogout ?? null;
    this.socket = null;
    this.clearAuthState = null;
    this.isReconnect = !!options.isReconnect;
    this.includeMedia = options.includeMedia ?? true;
    this.syncFullHistory = options.syncFullHistory ?? false;
    this.groupsEnabled = options.groupsEnabled ?? true;
    this.autoPresenceSubscribe = options.autoPresenceSubscribe ?? false;
    this._apiKeyHash = options.apiKeyHash ?? null;
    this.leaseEpoch = options.leaseEpoch ?? null;
  }
  get apiKeyHash() {
    return this._apiKeyHash;
  }
  get inFlightWebhooks() {
    return this._inFlightWebhooks;
  }
  get lastTrafficAt() {
    return this._lastTrafficAt;
  }
  markTraffic() {
    this._lastTrafficAt = performance.now();
  }
  // biome-ignore lint/suspicious/noExplicitAny: Typing this wrapper is not trivial.
  withErrorHandling(handlerName, handler2) {
    return async (...args) => {
      try {
        await handler2.apply(this, args);
      } catch (error) {
        logger_default.error(
          "[%s] [%s] Error: %s",
          this.phoneNumber,
          handlerName,
          errorToString(error)
        );
      }
    };
  }
  async updateOptions(options) {
    this.clientName = options.clientName || "Chrome";
    this.webhookUrl = options.webhookUrl;
    this.webhookVerifyToken = options.webhookVerifyToken;
    this.includeMedia = options.includeMedia ?? true;
    this.syncFullHistory = options.syncFullHistory ?? false;
    const prevGroupsEnabled = this.groupsEnabled;
    this.groupsEnabled = options.groupsEnabled ?? true;
    if (prevGroupsEnabled !== this.groupsEnabled && this.socket) {
      if (this.groupsEnabled) {
        this.stopGroupActivityFlush();
      } else {
        this.startGroupActivityFlush();
      }
    }
    this.autoPresenceSubscribe = options.autoPresenceSubscribe ?? false;
    this._apiKeyHash = options.apiKeyHash ?? this._apiKeyHash;
    if (options.leaseEpoch !== void 0) {
      this.leaseEpoch = options.leaseEpoch;
    }
    await this.persistMetadata();
  }
  async persistMetadata() {
    await writeAuthMetadata(this.phoneNumber, {
      clientName: this.clientName,
      webhookUrl: this.webhookUrl,
      webhookVerifyToken: this.webhookVerifyToken,
      includeMedia: this.includeMedia,
      syncFullHistory: this.syncFullHistory,
      groupsEnabled: this.groupsEnabled,
      autoPresenceSubscribe: this.autoPresenceSubscribe,
      apiKeyHash: this._apiKeyHash
    });
  }
  async connect() {
    if (this.isDiscarded || this.socket) {
      return;
    }
    const { state, saveCreds } = await useRedisAuthState(this.phoneNumber, {
      clientName: this.clientName,
      webhookUrl: this.webhookUrl,
      webhookVerifyToken: this.webhookVerifyToken,
      includeMedia: this.includeMedia,
      syncFullHistory: this.syncFullHistory,
      groupsEnabled: this.groupsEnabled,
      autoPresenceSubscribe: this.autoPresenceSubscribe,
      apiKeyHash: this._apiKeyHash
    });
    if (this.isDiscarded) {
      return;
    }
    this.clearAuthState = state.keys.clear;
    const version = await fetchBaileysClientVersion().catch((error) => {
      logger_default.error(
        "[%s] [fetchBaileysVersion] Failed to fetch latest WhatsApp Web version, falling back to internal version. %s",
        this.phoneNumber,
        errorToString(error)
      );
      return void 0;
    });
    if (this.isDiscarded) {
      return;
    }
    const guardedKeys = {
      ...state.keys,
      set: async (data) => {
        if (this.isDiscarded) {
          return;
        }
        await state.keys.set(data);
      }
    };
    const socketOptions = {
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(guardedKeys, logger_default)
      },
      markOnlineOnConnect: false,
      logger: baileysLogger,
      browser: Browsers.windows(this.clientName),
      syncFullHistory: this.syncFullHistory,
      shouldIgnoreJid,
      version
    };
    try {
      this.socket = makeWASocket(socketOptions);
    } catch (error) {
      logger_default.error(
        "[%s] [BaileysConnection.connect] Failed to create socket: %s",
        this.phoneNumber,
        errorToString(error)
      );
      this.onConnectionClose?.();
      return;
    }
    this.addEventListeners({ saveCreds });
  }
  addEventListeners({ saveCreds }) {
    const handledEvents = {
      "creds.update": this.withErrorHandling("saveCreds", async () => {
        if (this.isDiscarded) {
          return;
        }
        await saveCreds();
      }),
      "connection.update": this.withErrorHandling(
        "handleConnectionUpdate",
        this.handleConnectionUpdate
      ),
      "messages.upsert": this.withErrorHandling(
        "handleMessagesUpsert",
        this.handleMessagesUpsert
      ),
      "messages.update": this.withErrorHandling(
        "handleMessagesUpdate",
        this.handleMessagesUpdate
      ),
      "message-receipt.update": this.withErrorHandling(
        "handleMessageReceiptUpdate",
        this.handleMessageReceiptUpdate
      ),
      // Antecedent signal to the 463 restriction: WhatsApp's new-chat message
      // cap. Handled (not left to the generic forwarder) so it is always
      // delivered, independent of BAILEYS_LISTEN_TO_EVENTS.
      "message-capping.update": this.withErrorHandling(
        "handleMessageCappingUpdate",
        this.handleMessageCappingUpdate
      ),
      "messaging-history.set": this.withErrorHandling(
        "handleMessagingHistorySet",
        this.handleMessagingHistorySet
      ),
      "groups.update": this.withErrorHandling(
        "handleGroupsUpdate",
        this.handleGroupsUpdate
      ),
      "group-participants.update": this.withErrorHandling(
        "handleGroupParticipantsUpdate",
        this.handleGroupParticipantsUpdate
      ),
      "presence.update": this.withErrorHandling(
        "handlePresenceUpdate",
        this.handlePresenceUpdate
      )
    };
    Object.entries(handledEvents).forEach(([event, handler2]) => {
      this.socket?.ev.on(
        event,
        handler2
      );
    });
    this.ALL_BAILEYS_SOCKET_EVENTS.forEach((event) => {
      if (event in handledEvents || !config_default.baileys.listenToEvents.has(event)) {
        return;
      }
      this.socket?.ev.on(event, (data) => this.sendToWebhook({ event, data }));
    });
  }
  async close() {
    this.stopGroupActivityFlush();
    if (this.clearOnlinePresenceTimeout) {
      clearTimeout(this.clearOnlinePresenceTimeout);
      this.clearOnlinePresenceTimeout = null;
    }
    await this.clearAuthState?.();
    this.clearAuthState = null;
    this.socket = null;
    this.reconnectCount = 0;
    this.connectionReplacedTimestamps = [];
    this.onConnectionClose?.();
  }
  async logout() {
    this.isDiscarded = true;
    try {
      await this.safeSocket().logout();
    } catch (error) {
      logger_default.error(
        "[%s] [LOGOUT] error=%s",
        this.phoneNumber,
        errorToString(error)
      );
    }
    await this.close();
  }
  // Atomically disowns this connection so it cannot resurrect itself.
  // Used by the handler when a stale connection is being replaced (e.g.
  // recovery path from BaileysNotConnectedError, or a stuck reconnect
  // backoff). Does NOT clear the Redis auth state — the replacement will
  // reuse the same identity — and does NOT fire onConnectionClose — the
  // handler driving the discard already owns the replacement, and a late
  // callback would only race with it.
  discard() {
    if (this.isDiscarded) {
      return;
    }
    this.isDiscarded = true;
    this.onConnectionClose = null;
    this.stopGroupActivityFlush();
    if (this.clearOnlinePresenceTimeout) {
      clearTimeout(this.clearOnlinePresenceTimeout);
      this.clearOnlinePresenceTimeout = null;
    }
    try {
      this.socket?.ev.removeAllListeners("connection.update");
      this.socket?.end(void 0);
    } catch (error) {
      logger_default.warn(
        "[%s] [discard] error while ending socket: %s",
        this.phoneNumber,
        errorToString(error)
      );
    }
    this.socket = null;
  }
  // Terminal teardown for a connection that gives up on itself (e.g. a
  // reconnect loop that never stabilizes). Unlike close(), preserves the
  // Redis auth state so the same identity can be resumed later — by a new
  // POST /connections or by another instance sharing this Redis. Unlike
  // discard(), fires onConnectionClose so the handler evicts this instance
  // from its registry.
  abort() {
    const onConnectionClose = this.onConnectionClose;
    this.discard();
    onConnectionClose?.();
  }
  async sendMessage(jid, messageContent, options) {
    this.safeSocket();
    this.markTraffic();
    this.autoSubscribePresence(jid);
    let waveformProxy = null;
    try {
      if ("audio" in messageContent && Buffer.isBuffer(messageContent.audio)) {
        const originalAudio = messageContent.audio;
        [messageContent.audio, waveformProxy] = await Promise.all([
          preprocessAudio(
            originalAudio,
            // NOTE: Use lower quality for ptt messages for more realistic quality.
            messageContent.ptt ? "ogg-low" : "mp3-high"
          ),
          messageContent.ptt ? preprocessAudio(originalAudio, "wav") : null
        ]);
        messageContent.mimetype = messageContent.ptt ? "audio/ogg; codecs=opus" : "audio/mpeg";
      }
    } catch (error) {
      logger_default.error(
        "[%s] [sendMessage] [ERROR] error=%s",
        this.phoneNumber,
        errorToString(error)
      );
    }
    return this.safeSocket().sendMessage(jid, messageContent, {
      waveformProxy,
      quoted: options?.quoted
    });
  }
  sendPresenceUpdate(type, toJid) {
    if (!this.safeSocket().authState.creds.me) {
      return;
    }
    if (toJid && ["composing", "recording", "paused"].includes(type)) {
      this.autoSubscribePresence(toJid);
    }
    return this.safeSocket().sendPresenceUpdate(type, toJid).then(() => {
      if (this.clearOnlinePresenceTimeout && ["unavailable", "available"].includes(type)) {
        clearTimeout(this.clearOnlinePresenceTimeout);
        this.clearOnlinePresenceTimeout = null;
      }
      if (type === "available") {
        this.clearOnlinePresenceTimeout = setTimeout(() => {
          this.clearOnlinePresenceTimeout = null;
          this.socket?.sendPresenceUpdate("unavailable", toJid);
        }, 6e4);
      }
    });
  }
  async presenceSubscribe(jids) {
    this.safeSocket();
    await this.ensureAvailablePresence();
    const subscribed = [];
    for (const jid of jids) {
      try {
        const resolvedJid = await this.resolveToPN(jid).catch(() => null) ?? jid;
        await this.safeSocket().presenceSubscribe(resolvedJid);
        subscribed.push(jid);
      } catch (error) {
        logger_default.error(
          "[%s] [presenceSubscribe] Failed to subscribe to %s: %s",
          this.phoneNumber,
          jid,
          errorToString(error)
        );
      }
    }
    return { subscribed };
  }
  autoSubscribePresence(jid) {
    if (!this.autoPresenceSubscribe)
      return;
    if (isJidGroup2(jid))
      return;
    this.resolveToPN(jid).then((pnJid) => {
      const targetJid = pnJid ?? jid;
      return this.ensureAvailablePresence().then(() => this.safeSocket().presenceSubscribe(targetJid)).then(() => {
        logger_default.debug(
          "[%s] [autoSubscribePresence] Subscribed to %s",
          this.phoneNumber,
          targetJid
        );
      });
    }).catch((error) => {
      logger_default.error(
        "[%s] [autoSubscribePresence] Failed for %s: %s",
        this.phoneNumber,
        jid,
        errorToString(error)
      );
    });
  }
  async resolveToPN(jid) {
    if (!jid.endsWith("@lid"))
      return jid;
    return this.safeSocket().signalRepository.lidMapping.getPNForLID(jid);
  }
  async ensureAvailablePresence() {
    if (this.clearOnlinePresenceTimeout)
      return;
    await this.sendPresenceUpdate("available");
  }
  readMessages(keys) {
    return this.safeSocket().readMessages(keys);
  }
  chatModify(mod, jid) {
    return this.safeSocket().chatModify(mod, jid);
  }
  fetchMessageHistory(count, oldestMsgKey, oldestMsgTimestamp) {
    return this.safeSocket().fetchMessageHistory(
      count,
      oldestMsgKey,
      oldestMsgTimestamp
    );
  }
  sendReceipts(keys, type) {
    return this.safeSocket().sendReceipts(keys, type);
  }
  deleteMessage(jid, key) {
    return this.safeSocket().sendMessage(jid, { delete: key });
  }
  editMessage(jid, key, messageContent) {
    return this.safeSocket().sendMessage(jid, {
      ...messageContent,
      edit: key
    });
  }
  async profilePictureUrl(jid, type) {
    return this.safeSocket().profilePictureUrl(jid, type);
  }
  // Read-only restriction diagnostics. Both query WhatsApp directly via MEX
  // (GraphQL) queries — they do NOT send a message, so they are safe to call
  // on a 463-restricted account without worsening the reach-out time-lock.
  getReachoutTimelock() {
    return this.safeSocket().fetchAccountReachoutTimelock();
  }
  getNewChatMessageCap() {
    return this.safeSocket().fetchNewChatMessageCap();
  }
  async updateProfilePicture(jid, image) {
    return this.safeSocket().updateProfilePicture(jid, image);
  }
  onWhatsApp(jids) {
    return this.safeSocket().onWhatsApp(...jids);
  }
  getBusinessProfile(jid) {
    return this.safeSocket().getBusinessProfile(jid);
  }
  groupMetadata(jid) {
    return this.safeSocket().groupMetadata(jid);
  }
  groupParticipants(jid, participants, action) {
    return this.safeSocket().groupParticipantsUpdate(jid, participants, action);
  }
  groupUpdateSubject(jid, subject) {
    return this.safeSocket().groupUpdateSubject(jid, subject);
  }
  groupUpdateDescription(jid, description) {
    return this.safeSocket().groupUpdateDescription(jid, description);
  }
  groupCreate(subject, participants) {
    return this.safeSocket().groupCreate(subject, participants);
  }
  groupLeave(jid) {
    return this.safeSocket().groupLeave(jid);
  }
  groupRequestParticipantsList(jid) {
    return this.safeSocket().groupRequestParticipantsList(jid);
  }
  groupRequestParticipantsUpdate(jid, participants, action) {
    return this.safeSocket().groupRequestParticipantsUpdate(
      jid,
      participants,
      action
    );
  }
  groupInviteCode(jid) {
    return this.safeSocket().groupInviteCode(jid);
  }
  groupRevokeInvite(jid) {
    return this.safeSocket().groupRevokeInvite(jid);
  }
  groupAcceptInvite(code) {
    return this.safeSocket().groupAcceptInvite(code);
  }
  groupRevokeInviteV4(groupJid2, invitedJid) {
    return this.safeSocket().groupRevokeInviteV4(groupJid2, invitedJid);
  }
  groupAcceptInviteV4(key, inviteMessage) {
    return this.safeSocket().groupAcceptInviteV4(key, inviteMessage);
  }
  groupGetInviteInfo(code) {
    return this.safeSocket().groupGetInviteInfo(code);
  }
  groupToggleEphemeral(jid, ephemeralExpiration) {
    return this.safeSocket().groupToggleEphemeral(jid, ephemeralExpiration);
  }
  groupSettingUpdate(jid, setting) {
    return this.safeSocket().groupSettingUpdate(jid, setting);
  }
  groupMemberAddMode(jid, mode) {
    return this.safeSocket().groupMemberAddMode(jid, mode);
  }
  groupJoinApprovalMode(jid, mode) {
    return this.safeSocket().groupJoinApprovalMode(jid, mode);
  }
  groupFetchAllParticipating() {
    return this.safeSocket().groupFetchAllParticipating();
  }
  safeSocket() {
    if (!this.socket) {
      throw new BaileysNotConnectedError();
    }
    return this.socket;
  }
  async handleConnectionUpdate(data) {
    if (this.isDiscarded) {
      return;
    }
    const { connection, qr, lastDisconnect, isNewLogin, isOnline } = data;
    const { reachoutTimeLock } = data;
    if (reachoutTimeLock) {
      logger_default.info(
        "[%s] [handleConnectionUpdate] reachoutTimeLock update (isActive=%s, enforcementType=%s, ends=%s)",
        this.phoneNumber,
        String(reachoutTimeLock.isActive ?? false),
        reachoutTimeLock.enforcementType ?? "",
        reachoutTimeLock.timeEnforcementEnds?.toISOString?.() ?? ""
      );
    }
    const isReconnecting = isNewLogin || connection === "connecting" && ("qr" in data && !qr || this.isReconnect);
    if (isReconnecting) {
      logger_default.debug(
        "[%s] [handleConnectionUpdate] Reconnecting (isNewLogin=%d, isReconnect=%d, connection=%s, qr=%s)",
        this.phoneNumber,
        Number(isNewLogin ?? false),
        Number(this.isReconnect),
        connection ?? "",
        qr ?? ""
      );
      this.isReconnect = false;
      this.handleReconnecting();
      return;
    }
    if (connection === "close") {
      const error = lastDisconnect?.error;
      const statusCode = error?.output?.statusCode;
      const message = error?.output?.payload?.message || error.message;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut && message !== "QR refs attempts ended";
      if (shouldReconnect) {
        if (statusCode === DisconnectReason.connectionReplaced && await this.shouldYieldToLeaseOwner()) {
          this.abort();
          return;
        }
        logger_default.debug(
          "[%s] [handleConnectionUpdate] Reconnecting (lastDisconnect=%o)",
          this.phoneNumber,
          lastDisconnect ?? {}
        );
        await this.handleReconnecting();
        this.socket = null;
        if (statusCode === DisconnectReason.connectionReplaced) {
          const recentCount = this.trackConnectionReplaced();
          if (recentCount >= CONNECTION_REPLACED_LOOP_THRESHOLD) {
            logger_default.warn(
              "[%s] [handleConnectionUpdate] connectionReplaced loop detected (%d events in %dms window), backing off %dms before reconnect",
              this.phoneNumber,
              recentCount,
              CONNECTION_REPLACED_LOOP_WINDOW_MS,
              CONNECTION_REPLACED_BACKOFF_MS
            );
            await asyncSleep(CONNECTION_REPLACED_BACKOFF_MS);
          }
        }
        this.connect();
        return;
      }
      await this.close();
    }
    if (connection === "open" && this.socket?.user?.id) {
      const phoneNumberFromId = `+${this.socket.user.id.split("@")[0].split(":")[0]}`;
      if (normalizeBrazilPhoneNumber(phoneNumberFromId) !== normalizeBrazilPhoneNumber(this.phoneNumber)) {
        this.handleWrongPhoneNumber();
        return;
      }
    }
    if (qr) {
      Object.assign(data, {
        connection: "connecting",
        qrDataUrl: await toDataURL(qr)
      });
    }
    if (isOnline) {
      Object.assign(data, { connection: "open" });
    }
    if (data.connection === "open") {
      this.reconnectCount = 0;
      this.startGroupActivityFlush();
    }
    this.sendToWebhook({
      event: "connection.update",
      data
    });
  }
  async handleMessagesUpsert(data) {
    this.markTraffic();
    if (data.type === "notify") {
      for (const msg of data.messages) {
        const remoteJid = msg.key?.remoteJid;
        if (remoteJid) {
          this.autoSubscribePresence(remoteJid);
        }
      }
    }
    let messagesData = data;
    if (!this.groupsEnabled) {
      const individualMessages = [];
      for (const msg of data.messages) {
        const remoteJid = msg.key?.remoteJid;
        if (remoteJid && isJidGroup2(remoteJid)) {
          const existing = this.groupActivityMap.get(remoteJid);
          this.groupActivityMap.set(remoteJid, {
            unreadCount: (existing?.unreadCount ?? 0) + 1,
            lastMessageAt: Date.now()
          });
        } else {
          individualMessages.push(msg);
        }
      }
      if (individualMessages.length === 0) {
        return;
      }
      messagesData = { ...data, messages: individualMessages };
    }
    const payload = {
      event: "messages.upsert",
      data: messagesData
    };
    const media = await downloadMediaFromMessages(messagesData.messages, {
      includeMedia: this.includeMedia
    });
    if (media) {
      payload.extra = { media };
    }
    this.sendToWebhook(payload);
  }
  handleMessagesUpdate(data) {
    this.markTraffic();
    if (this.hasAccountRestrictionError(data)) {
      this.fetchReachoutTimelockOn463();
    }
    this.sendToWebhook(
      {
        event: "messages.update",
        data
      },
      {
        awaitResponse: true
      }
    );
  }
  hasAccountRestrictionError(data) {
    return data.some(
      ({ update }) => update?.status === WAMessageStatus.ERROR && Array.isArray(update.messageStubParameters) && update.messageStubParameters.includes(MESSAGE_ACCOUNT_RESTRICTION_CODE)
    );
  }
  // Fire-and-forget, debounced. fetchAccountReachoutTimelock emits a
  // connection.update { reachoutTimeLock } which handleConnectionUpdate
  // forwards to the webhook. Safe on a restricted account (read-only MEX
  // query, sends no message).
  fetchReachoutTimelockOn463() {
    if (this.reachoutTimelockFetchInFlight) {
      return;
    }
    const now = Date.now();
    if (now - this.lastReachoutTimelockFetchAt < REACHOUT_TIMELOCK_REFETCH_WINDOW_MS) {
      return;
    }
    this.reachoutTimelockFetchInFlight = true;
    this.lastReachoutTimelockFetchAt = now;
    void (async () => {
      try {
        await this.getReachoutTimelock();
      } catch (error) {
        logger_default.warn(
          "[%s] [fetchReachoutTimelockOn463] failed to fetch reachout timelock: %s",
          this.phoneNumber,
          errorToString(error)
        );
      } finally {
        this.reachoutTimelockFetchInFlight = false;
      }
    })();
  }
  handleMessageCappingUpdate(data) {
    this.sendToWebhook({
      event: "message-capping.update",
      data
    });
  }
  handleMessageReceiptUpdate(data) {
    this.markTraffic();
    this.sendToWebhook({
      event: "message-receipt.update",
      data
    });
  }
  handleMessagingHistorySet(data) {
    if (!this.syncFullHistory) {
      return;
    }
    this.sendToWebhook({ event: "messaging-history.set", data });
  }
  handleGroupsUpdate(data) {
    this.sendToWebhook({
      event: "groups.update",
      data
    });
  }
  handleGroupParticipantsUpdate(data) {
    this.sendToWebhook({
      event: "group-participants.update",
      data
    });
  }
  async handlePresenceUpdate(data) {
    const enrichedData = { ...data };
    if (data.id.endsWith("@lid")) {
      try {
        const pn = await this.safeSocket().signalRepository.lidMapping.getPNForLID(
          data.id
        );
        if (pn) {
          enrichedData.jidAlt = pn;
        }
      } catch (error) {
        logger_default.error(
          "[%s] [handlePresenceUpdate] Failed to resolve LID %s: %s",
          this.phoneNumber,
          data.id,
          errorToString(error)
        );
      }
    }
    this.sendToWebhook({
      event: "presence.update",
      data: enrichedData
    });
  }
  handleWrongPhoneNumber() {
    this.sendToWebhook({
      event: "connection.update",
      data: { error: "wrong_phone_number" }
    });
    this.socket?.ev.removeAllListeners("connection.update");
    if (this.requestLogout) {
      this.requestLogout();
    } else {
      this.logout();
    }
  }
  async handleReconnecting() {
    this.reconnectCount += 1;
    if (this.reconnectCount > 10) {
      logger_default.warn(
        "[%s] [handleReconnecting] Reconnect count exceeded 10, aborting reconnection (auth state preserved)",
        this.phoneNumber
      );
      this.sendToWebhook({
        event: "connection.update",
        data: { error: "reconnect_loop_detected" }
      });
      this.abort();
      return;
    }
    this.sendToWebhook({
      event: "connection.update",
      data: { connection: "reconnecting" }
    });
  }
  // True only when the lease verifiably belongs to another instance. On any
  // doubt (no lease system state, Redis unreachable) we keep the
  // single-instance behavior — reconnect with backoff — because wrongly
  // yielding here silently kills a healthy connection.
  async shouldYieldToLeaseOwner() {
    try {
      const lease = await getLease(this.phoneNumber);
      if (lease && lease.owner !== instanceId) {
        logger_default.info(
          "[%s] [shouldYieldToLeaseOwner] lease is owned by %s (epoch %d), yielding",
          this.phoneNumber,
          lease.owner,
          lease.epoch
        );
        return true;
      }
      return false;
    } catch (error) {
      logger_default.warn(
        "[%s] [shouldYieldToLeaseOwner] could not verify lease, keeping reconnect behavior: %s",
        this.phoneNumber,
        errorToString(error)
      );
      return false;
    }
  }
  trackConnectionReplaced() {
    const now = Date.now();
    this.connectionReplacedTimestamps = this.connectionReplacedTimestamps.filter(
      (ts) => now - ts <= CONNECTION_REPLACED_LOOP_WINDOW_MS
    );
    this.connectionReplacedTimestamps.push(now);
    return this.connectionReplacedTimestamps.length;
  }
  startGroupActivityFlush() {
    this.stopGroupActivityFlush();
    if (this.groupsEnabled) {
      return;
    }
    this.groupActivityInterval = setInterval(() => {
      this.flushGroupActivity();
    }, 3e4);
  }
  flushGroupActivity() {
    if (this.groupActivityMap.size === 0) {
      return;
    }
    const activities = [];
    for (const [jid, activity] of this.groupActivityMap) {
      activities.push({ jid, ...activity });
    }
    this.groupActivityMap.clear();
    this.sendToWebhook({
      event: "groups.activity",
      data: activities
    });
  }
  stopGroupActivityFlush() {
    if (this.groupActivityInterval) {
      clearInterval(this.groupActivityInterval);
      this.groupActivityInterval = null;
    }
    this.flushGroupActivity();
  }
  // Counts deliveries (including their retry windows) still running in this
  // process's memory. Graceful shutdown waits on this before exiting so a
  // handoff doesn't drop events that WhatsApp already considers delivered.
  async sendToWebhook(payload, options) {
    let enriched = payload;
    if (payload.event === "connection.update" && this.leaseEpoch !== null) {
      enriched = {
        ...payload,
        data: {
          ...payload.data,
          epoch: this.leaseEpoch
        }
      };
    }
    this._inFlightWebhooks += 1;
    try {
      return await this.deliverToWebhook(enriched, options);
    } finally {
      this._inFlightWebhooks -= 1;
    }
  }
  async deliverToWebhook(payload, options) {
    let sanitizedPayload = null;
    if (logger_default.isLevelEnabled("debug")) {
      sanitizedPayload = deepSanitizeObject(
        { ...payload },
        {
          omitKeys: [...this.LOGGER_OMIT_KEYS]
        }
      );
      logger_default.debug(
        "[%s] [sendToWebhook] (options: %o) payload=%o",
        this.phoneNumber,
        options || {},
        sanitizedPayload
      );
    }
    const webhookUrl = this.webhookUrl;
    const serializedBody = JSON.stringify({
      ...payload,
      webhookVerifyToken: this.webhookVerifyToken,
      awaitResponse: options?.awaitResponse
    });
    const { maxRetries, retryInterval, backoffFactor } = config_default.webhook.retryPolicy;
    let attempt = 0;
    let delay = retryInterval;
    while (attempt <= maxRetries) {
      const { response, error } = await this.sendPayloadToWebhook(
        webhookUrl,
        serializedBody
      );
      if (response) {
        if (response.ok) {
          if (logger_default.isLevelEnabled("debug")) {
            logger_default.debug(
              "[%s] [sendToWebhook] [SUCCESS] event=%s status=%d",
              this.phoneNumber,
              payload.event,
              response.status
            );
          }
          return response;
        }
        logger_default.error(
          "[%s] [sendToWebhook] [ERROR] webhookUrl=%s payload=%o response=%o",
          this.phoneNumber,
          webhookUrl,
          sanitizedPayload ?? payload.event,
          { status: response.status, statusText: response.statusText }
        );
      }
      if (error) {
        logger_default.error(
          "[%s] [sendToWebhook] [ERROR] webhookUrl=%s payload=%o error=%s",
          this.phoneNumber,
          webhookUrl,
          sanitizedPayload ?? payload.event,
          errorToString(error)
        );
      }
      attempt++;
      if (attempt <= maxRetries) {
        logger_default.info(
          "[%s] [sendToWebhook] [RETRYING] payload=%o attempt=%d/%d delay=%dms",
          this.phoneNumber,
          sanitizedPayload ?? payload.event,
          attempt,
          maxRetries,
          delay
        );
        const jitter = Math.floor(Math.random() * 1e3);
        await asyncSleep(delay + jitter);
        delay *= backoffFactor;
      }
    }
    logger_default.error(
      "[%s] [sendToWebhook] [FAILED] webhookUrl=%s payload=%o",
      this.phoneNumber,
      webhookUrl,
      sanitizedPayload ?? payload.event
    );
  }
  async sendPayloadToWebhook(webhookUrl, serializedBody) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: serializedBody
      });
      return { response };
    } catch (error) {
      return { error };
    }
  }
};

// src/baileys/connectionsHandler.ts
var BaileysConnectionsHandler = class {
  constructor(createConnection) {
    this.connections = {};
    this.inFlightOps = {};
    // Discarded connections whose webhook deliveries (including retries) are
    // still running. They left `connections` already, but the shutdown drain
    // must keep seeing their in-flight count until it reaches zero.
    this.drainingWebhooks = /* @__PURE__ */ new Set();
    this.createConnection = createConnection || ((phone, opts) => new BaileysConnection(phone, opts));
  }
  hasConnection(phoneNumber) {
    return Boolean(this.connections[phoneNumber]);
  }
  getActivePhoneNumbers() {
    return Object.keys(this.connections);
  }
  get size() {
    return Object.keys(this.connections).length;
  }
  inFlightWebhookCount() {
    for (const connection of this.drainingWebhooks) {
      if (connection.inFlightWebhooks === 0) {
        this.drainingWebhooks.delete(connection);
      }
    }
    let sum = 0;
    for (const connection of Object.values(this.connections)) {
      sum += connection.inFlightWebhooks;
    }
    for (const connection of this.drainingWebhooks) {
      sum += connection.inFlightWebhooks;
    }
    return sum;
  }
  // Activity snapshot used by the coordinator to prefer idle connections
  // when shedding load (rebalance victim selection, shutdown ordering).
  connectionActivity(phoneNumber) {
    const connection = this.connections[phoneNumber];
    if (!connection) {
      return null;
    }
    return {
      inFlightWebhooks: connection.inFlightWebhooks,
      lastTrafficAt: connection.lastTrafficAt
    };
  }
  // Tears down the local socket WITHOUT touching the Redis auth state, so the
  // identity can be picked up elsewhere. Used by the cluster coordinator for
  // self-fencing (lease owned by another instance) and graceful handoff.
  // Serialized through inFlightOps so it cannot interleave with a concurrent
  // connect/logout for the same number.
  async discardConnection(phoneNumber) {
    await this.withInFlightOp(phoneNumber, async () => {
      const connection = this.connections[phoneNumber];
      if (!connection) {
        return;
      }
      connection.discard();
      delete this.connections[phoneNumber];
      if (connection.inFlightWebhooks > 0) {
        this.drainingWebhooks.add(connection);
      }
    });
  }
  // Drains any in-flight op for `phoneNumber`, reserves a fresh slot
  // synchronously, and runs `fn` inside it. Serializes concurrent
  // connect/logout calls for the same number so we never have two parallel
  // sockets with the same identity (which the WhatsApp server kicks with
  // conflict/replaced). The internal drain is defense-in-depth so callers
  // can't accidentally bypass the lock by skipping a prior drain.
  async withInFlightOp(phoneNumber, fn) {
    while (this.inFlightOps[phoneNumber]) {
      await this.inFlightOps[phoneNumber].catch(() => {
      });
    }
    let resolveSlot = () => {
    };
    const slot = new Promise((res) => {
      resolveSlot = res;
    });
    this.inFlightOps[phoneNumber] = slot;
    try {
      return await fn();
    } finally {
      if (this.inFlightOps[phoneNumber] === slot) {
        delete this.inFlightOps[phoneNumber];
      }
      resolveSlot();
    }
  }
  async spawnConnection(phoneNumber, options) {
    await this.withInFlightOp(phoneNumber, async () => {
      const previous = this.connections[phoneNumber];
      if (previous) {
        previous.discard();
      }
      const connection = this.createConnection(phoneNumber, {
        ...options,
        onConnectionClose: () => {
          if (this.connections[phoneNumber] === connection) {
            delete this.connections[phoneNumber];
          }
          logger_default.debug(
            "Now tracking %d connections",
            Object.keys(this.connections).length
          );
          options.onConnectionClose?.();
        },
        requestLogout: () => {
          void this.withInFlightOp(phoneNumber, async () => {
            if (this.connections[phoneNumber] !== connection) {
              return;
            }
            await connection.logout();
            delete this.connections[phoneNumber];
          }).catch((error) => {
            logger_default.error(
              "[%s] [requestLogout] %s",
              phoneNumber,
              errorToString(error)
            );
          });
        }
      });
      this.connections[phoneNumber] = connection;
      await connection.connect();
    });
  }
  async connect(phoneNumber, options) {
    for (; ; ) {
      while (this.inFlightOps[phoneNumber]) {
        await this.inFlightOps[phoneNumber].catch(() => {
        });
      }
      const existing = this.connections[phoneNumber];
      if (!existing) {
        await this.spawnConnection(phoneNumber, options);
        return;
      }
      await existing.updateOptions(options);
      try {
        await existing.sendPresenceUpdate("available");
        return;
      } catch (error) {
        if (!(error instanceof BaileysNotConnectedError)) {
          throw error;
        }
        if (this.connections[phoneNumber] === existing) {
          existing.discard();
          delete this.connections[phoneNumber];
        }
        logger_default.debug(
          "Handled inconsistent connection state for %s",
          phoneNumber
        );
      }
    }
  }
  async verifyConnectionAccess(phoneNumber, apiKeyHash) {
    const connection = this.connections[phoneNumber];
    let ownerHash;
    if (connection) {
      ownerHash = connection.apiKeyHash;
    } else {
      const metadata = await getRedisAuthMetadata(phoneNumber);
      ownerHash = metadata?.apiKeyHash;
    }
    if (ownerHash && apiKeyHash && ownerHash !== apiKeyHash) {
      throw new BaileysConnectionForbiddenError();
    }
  }
  getConnection(phoneNumber) {
    const connection = this.connections[phoneNumber];
    if (!connection) {
      throw new BaileysNotConnectedError();
    }
    return connection;
  }
  sendPresenceUpdate(phoneNumber, { type, toJid }) {
    return this.getConnection(phoneNumber).sendPresenceUpdate(type, toJid);
  }
  presenceSubscribe(phoneNumber, jids) {
    return this.getConnection(phoneNumber).presenceSubscribe(jids);
  }
  sendMessage(phoneNumber, {
    jid,
    messageContent,
    quoted
  }) {
    return this.getConnection(phoneNumber).sendMessage(jid, messageContent, {
      quoted
    });
  }
  readMessages(phoneNumber, keys) {
    return this.getConnection(phoneNumber).readMessages(keys);
  }
  chatModify(phoneNumber, mod, jid) {
    return this.getConnection(phoneNumber).chatModify(mod, jid);
  }
  fetchMessageHistory(phoneNumber, { count, oldestMsgKey, oldestMsgTimestamp }) {
    return this.getConnection(phoneNumber).fetchMessageHistory(
      count,
      oldestMsgKey,
      oldestMsgTimestamp
    );
  }
  sendReceipts(phoneNumber, { keys, type }) {
    return this.getConnection(phoneNumber).sendReceipts(keys, type);
  }
  deleteMessage(phoneNumber, { jid, key }) {
    return this.getConnection(phoneNumber).deleteMessage(jid, key);
  }
  editMessage(phoneNumber, {
    jid,
    key,
    messageContent
  }) {
    return this.getConnection(phoneNumber).editMessage(
      jid,
      key,
      messageContent
    );
  }
  profilePictureUrl(phoneNumber, jid, type) {
    return this.getConnection(phoneNumber).profilePictureUrl(jid, type);
  }
  updateProfilePicture(phoneNumber, jid, image) {
    return this.getConnection(phoneNumber).updateProfilePicture(jid, image);
  }
  getReachoutTimelock(phoneNumber) {
    return this.getConnection(phoneNumber).getReachoutTimelock();
  }
  getNewChatMessageCap(phoneNumber) {
    return this.getConnection(phoneNumber).getNewChatMessageCap();
  }
  onWhatsApp(phoneNumber, jids) {
    return this.getConnection(phoneNumber).onWhatsApp(jids);
  }
  getBusinessProfile(phoneNumber, jid) {
    return this.getConnection(phoneNumber).getBusinessProfile(jid);
  }
  groupMetadata(phoneNumber, jid) {
    return this.getConnection(phoneNumber).groupMetadata(jid);
  }
  groupParticipants(phoneNumber, jid, participants, action) {
    return this.getConnection(phoneNumber).groupParticipants(
      jid,
      participants,
      action
    );
  }
  groupUpdateSubject(phoneNumber, jid, subject) {
    return this.getConnection(phoneNumber).groupUpdateSubject(jid, subject);
  }
  groupUpdateDescription(phoneNumber, jid, description) {
    return this.getConnection(phoneNumber).groupUpdateDescription(
      jid,
      description
    );
  }
  groupCreate(phoneNumber, subject, participants) {
    return this.getConnection(phoneNumber).groupCreate(subject, participants);
  }
  groupLeave(phoneNumber, jid) {
    return this.getConnection(phoneNumber).groupLeave(jid);
  }
  groupRequestParticipantsList(phoneNumber, jid) {
    return this.getConnection(phoneNumber).groupRequestParticipantsList(jid);
  }
  groupRequestParticipantsUpdate(phoneNumber, jid, participants, action) {
    return this.getConnection(phoneNumber).groupRequestParticipantsUpdate(
      jid,
      participants,
      action
    );
  }
  groupInviteCode(phoneNumber, jid) {
    return this.getConnection(phoneNumber).groupInviteCode(jid);
  }
  groupRevokeInvite(phoneNumber, jid) {
    return this.getConnection(phoneNumber).groupRevokeInvite(jid);
  }
  groupAcceptInvite(phoneNumber, code) {
    return this.getConnection(phoneNumber).groupAcceptInvite(code);
  }
  groupRevokeInviteV4(phoneNumber, groupJid2, invitedJid) {
    return this.getConnection(phoneNumber).groupRevokeInviteV4(
      groupJid2,
      invitedJid
    );
  }
  groupAcceptInviteV4(phoneNumber, key, inviteMessage) {
    return this.getConnection(phoneNumber).groupAcceptInviteV4(
      key,
      inviteMessage
    );
  }
  groupGetInviteInfo(phoneNumber, code) {
    return this.getConnection(phoneNumber).groupGetInviteInfo(code);
  }
  groupToggleEphemeral(phoneNumber, jid, ephemeralExpiration) {
    return this.getConnection(phoneNumber).groupToggleEphemeral(
      jid,
      ephemeralExpiration
    );
  }
  groupSettingUpdate(phoneNumber, jid, setting) {
    return this.getConnection(phoneNumber).groupSettingUpdate(jid, setting);
  }
  groupMemberAddMode(phoneNumber, jid, mode) {
    return this.getConnection(phoneNumber).groupMemberAddMode(jid, mode);
  }
  groupJoinApprovalMode(phoneNumber, jid, mode) {
    return this.getConnection(phoneNumber).groupJoinApprovalMode(jid, mode);
  }
  groupFetchAllParticipating(phoneNumber) {
    return this.getConnection(phoneNumber).groupFetchAllParticipating();
  }
  async logout(phoneNumber) {
    await this.withInFlightOp(phoneNumber, async () => {
      await this.getConnection(phoneNumber).logout();
      delete this.connections[phoneNumber];
      logger_default.debug(
        "Now tracking %d connections",
        Object.keys(this.connections).length
      );
    });
  }
  async logoutAll() {
    while (Object.keys(this.inFlightOps).length > 0) {
      await Promise.allSettled(Object.values(this.inFlightOps));
    }
    const connections = Object.values(this.connections);
    await Promise.allSettled(connections.map((c) => c.logout()));
    this.connections = {};
  }
};

// src/baileys/index.ts
var baileys = new BaileysConnectionsHandler();
var baileys_default = baileys;

// src/middlewares/auth.ts
import { createHash } from "node:crypto";
import { LRUCache } from "lru-cache";
var apiKeyCache = new LRUCache({
  max: 1e3,
  ttl: 5 * 60 * 1e3
});
function getApiKey(headers) {
  return headers.get("x-api-key");
}
var authMiddleware = (app2) => app2.derive(async ({ request }) => {
  const apiKey = getApiKey(request.headers);
  if (!apiKey) {
    return { auth: null, apiKeyHash: null };
  }
  const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");
  try {
    const cached = apiKeyCache.get(apiKey);
    if (cached) {
      return { auth: cached, apiKeyHash };
    }
    const db2 = getDb();
    const doc = await db2.collection("api_keys").findOne({ key: apiKey });
    if (!doc) {
      logger_default.warn("Invalid API key attempted: %s", apiKeyHash);
      return { auth: null, apiKeyHash: null };
    }
    const auth = { role: doc.role };
    apiKeyCache.set(apiKey, auth);
    return { auth, apiKeyHash };
  } catch (error) {
    logger_default.error("Auth middleware error %s", errorToString(error));
    return { auth: null, apiKeyHash: null };
  }
}).onBeforeHandle(({ auth, set }) => {
  if (config_default.env === "development") {
    return;
  }
  if (!auth) {
    set.status = 401;
    return {
      error: "Unauthorized",
      message: "Valid API key required"
    };
  }
});
var adminGuard = (app2) => app2.use(authMiddleware).onBeforeHandle(({ auth, set }) => {
  if (auth?.role !== "admin") {
    set.status = 404;
    return "NOT_FOUND";
  }
});

// src/controllers/admin.ts
var adminController = new Elysia({
  prefix: "/admin",
  detail: {
    tags: ["Admin"],
    security: [{ xApiKey: [] }]
  }
}).use(adminGuard).post("/connections/logout-all", async () => await baileys_default.logoutAll(), {
  detail: {
    responses: {
      200: {
        description: "Initiated logout for all connections"
      }
    }
  }
});
var admin_default = adminController;

// src/controllers/cluster.ts
import Elysia2 from "elysia";

// src/cluster/instanceRegistry.ts
var startedAt = Date.now();
async function heartbeat(info) {
  const db2 = getDb();
  const instances = db2.collection("instances");
  const payload = {
    instanceId,
    baseUrl: workerBaseUrl ?? "",
    connectionCount: info.connectionCount,
    draining: info.draining,
    startedAt,
    updatedAt: /* @__PURE__ */ new Date()
  };
  await instances.updateOne(
    { _id: instanceId },
    { $set: payload },
    { upsert: true }
  );
}
async function listLiveInstances() {
  const db2 = getDb();
  const instances = db2.collection("instances");
  const cutoff = new Date(Date.now() - config_default.cluster.instanceTtlMs);
  const docs = await instances.find({ updatedAt: { $gt: cutoff } }).toArray();
  return docs.map((doc) => ({
    instanceId: doc.instanceId,
    baseUrl: doc.baseUrl,
    connectionCount: doc.connectionCount,
    draining: doc.draining,
    startedAt: doc.startedAt
  }));
}
async function isInstanceAlive(id) {
  const db2 = getDb();
  const instances = db2.collection("instances");
  const cutoff = new Date(Date.now() - config_default.cluster.instanceTtlMs);
  const count = await instances.countDocuments({
    _id: id,
    updatedAt: { $gt: cutoff }
  });
  return count === 1;
}
async function deregister() {
  const db2 = getDb();
  const instances = db2.collection("instances");
  await instances.deleteOne({ _id: instanceId });
}
async function publishOwnershipChanged(phoneNumber) {
}

// src/cluster/coordinator.ts
var REBALANCE_FORCE_FACTOR = 2;
var BaileysConnectionOwnedElsewhereError = class extends Error {
  constructor(ownerInstanceId) {
    super(`Connection is owned by live instance ${ownerInstanceId}`);
    this.ownerInstanceId = ownerInstanceId;
  }
};
var ClusterCoordinator = class {
  constructor(handler2, options) {
    this.running = false;
    this.draining = false;
    // Set when Redis is unreachable; pauses claims (our view of the cluster is
    // stale) without fencing the sockets we already hold.
    this.redisDegraded = false;
    this.claimTimer = null;
    this.renewTimer = null;
    this.heartbeatTimer = null;
    // Monotonic timestamps of when each phone was first observed without a
    // lease. Drives the orphan override: the fair-share cap must never leave a
    // phone unowned forever (e.g. rounding when phones % instances != 0).
    this.firstSeenUnleasedAt = /* @__PURE__ */ new Map();
    // Claim recency per locally-held phone: rebalance releases the most
    // recently claimed connection, minimizing churn on long-stable ones.
    this.claimedAt = /* @__PURE__ */ new Map();
    // Circuit breaker inputs for rebalance: never rebalance on top of an
    // in-progress failover storm.
    this.lastClaimAt = 0;
    // -Infinity, not 0: performance.now() starts near zero at process boot and
    // a 0 sentinel would silently rate-limit the first release away.
    this.lastRebalanceReleaseAt = Number.NEGATIVE_INFINITY;
    // Epoch of each lease this instance currently holds. Releases are
    // compare-and-delete on (owner, epoch), so a stale release can never drop a
    // lease the same instance has since re-acquired under a newer epoch.
    this.heldLeaseEpochs = /* @__PURE__ */ new Map();
    this.handler = handler2;
    this.options = {
      claimIntervalMs: config_default.cluster.claimIntervalMs,
      claimJitterMs: config_default.cluster.claimJitterMs,
      leaseRenewIntervalMs: config_default.cluster.leaseRenewIntervalMs,
      heartbeatIntervalMs: config_default.cluster.heartbeatIntervalMs,
      reconnectConcurrency: config_default.cluster.reconnectConcurrency,
      unclaimedGraceMs: config_default.cluster.unclaimedGraceMs,
      shutdownTimeoutMs: config_default.cluster.shutdownTimeoutMs,
      rebalanceEnabled: config_default.cluster.rebalanceEnabled,
      rebalanceReleaseIntervalMs: config_default.cluster.rebalanceReleaseIntervalMs,
      rebalanceTolerance: config_default.cluster.rebalanceTolerance,
      rebalanceIdleThresholdMs: config_default.cluster.rebalanceIdleThresholdMs,
      ...options
    };
  }
  /**
   * Monotonic clock for lease safety windows. `performance.now()` is
   * high-resolution and immune to NTP steps; `Date.now()` is off-limits here
   * because a wall-clock jump would stretch or shrink grace periods and
   * deadlines, breaking the lease timing guarantees.
   */
  now() {
    return performance.now();
  }
  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    void this.runHeartbeat();
    this.scheduleHeartbeat();
    this.scheduleRenew();
    const initialDelay = Math.floor(Math.random() * this.options.claimJitterMs);
    this.claimTimer = setTimeout(() => {
      void this.claimTick();
    }, initialDelay);
  }
  scheduleClaim() {
    if (!this.running) {
      return;
    }
    const jitter = Math.floor(Math.random() * this.options.claimJitterMs);
    this.claimTimer = setTimeout(() => {
      void this.claimTick();
    }, this.options.claimIntervalMs + jitter);
  }
  async claimTick() {
    try {
      await this.runClaimCycle();
    } catch (error) {
      logger_default.error(
        "[coordinator] claim cycle failed: %s",
        errorToString(error)
      );
    }
    try {
      await this.runRebalanceCycle();
    } catch (error) {
      logger_default.error(
        "[coordinator] rebalance cycle failed: %s",
        errorToString(error)
      );
    }
    this.scheduleClaim();
  }
  scheduleRenew() {
    if (!this.running) {
      return;
    }
    this.renewTimer = setTimeout(async () => {
      try {
        await this.runRenewCycle();
      } catch (error) {
        logger_default.error(
          "[coordinator] renew cycle failed: %s",
          errorToString(error)
        );
      }
      this.scheduleRenew();
    }, this.options.leaseRenewIntervalMs);
  }
  scheduleHeartbeat() {
    if (!this.running) {
      return;
    }
    this.heartbeatTimer = setTimeout(async () => {
      await this.runHeartbeat();
      this.scheduleHeartbeat();
    }, this.options.heartbeatIntervalMs);
  }
  async runHeartbeat() {
    try {
      await heartbeat({
        connectionCount: this.handler.size,
        draining: this.draining
      });
    } catch (error) {
      logger_default.warn("[coordinator] heartbeat failed: %s", errorToString(error));
    }
  }
  // One pass over the saved auth states: claim what is unleased, bounded by
  // fair share, then reconnect the claims with limited concurrency.
  async runClaimCycle() {
    if (this.draining || this.redisDegraded) {
      return;
    }
    const saved = await getRedisSavedAuthStateIds();
    const savedIds = new Set(saved.map(({ id }) => id));
    for (const phone of this.firstSeenUnleasedAt.keys()) {
      if (!savedIds.has(phone) || this.handler.hasConnection(phone)) {
        this.firstSeenUnleasedAt.delete(phone);
      }
    }
    if (saved.length === 0) {
      return;
    }
    let instances;
    try {
      instances = await listLiveInstances();
    } catch (error) {
      logger_default.warn(
        "[coordinator] instance registry unavailable, skipping claim cycle: %s",
        errorToString(error)
      );
      return;
    }
    const liveCount = Math.max(
      instances.filter((instance) => !instance.draining).length,
      1
    );
    const fairShare = Math.ceil(saved.length / liveCount);
    const now = this.now();
    const candidates = shuffle(
      saved.filter(({ id }) => !this.handler.hasConnection(id))
    );
    const claimed = [];
    for (const { id, metadata } of candidates) {
      if (this.draining) {
        break;
      }
      try {
        const lease = await getLease(id);
        if (lease) {
          this.firstSeenUnleasedAt.delete(id);
          continue;
        }
        if (!this.firstSeenUnleasedAt.has(id)) {
          this.firstSeenUnleasedAt.set(id, now);
        }
        const firstSeen = this.firstSeenUnleasedAt.get(id) ?? now;
        const orphaned = now - firstSeen >= this.options.unclaimedGraceMs;
        const handoffTarget = await getHandoffTarget(id);
        if (handoffTarget && handoffTarget !== instanceId) {
          continue;
        }
        const directedAtMe = handoffTarget === instanceId;
        if (!directedAtMe && this.handler.size + claimed.length >= fairShare && !orphaned) {
          continue;
        }
        if (!directedAtMe && await isOnOwnReleaseCooldown(id)) {
          continue;
        }
        if (!await isRedisAuthStatePaired(id)) {
          continue;
        }
        const acquired = await acquireLease(id);
        if (!acquired) {
          continue;
        }
        this.heldLeaseEpochs.set(id, acquired.epoch);
        this.firstSeenUnleasedAt.delete(id);
        const claimedNow = this.now();
        this.claimedAt.set(id, claimedNow);
        this.lastClaimAt = claimedNow;
        void publishOwnershipChanged(id);
        claimed.push({ id, metadata, epoch: acquired.epoch });
      } catch (error) {
        logger_default.warn(
          "[coordinator] claim check failed for %s: %s",
          id,
          errorToString(error)
        );
      }
    }
    if (claimed.length === 0) {
      return;
    }
    if (this.draining) {
      for (const { id } of claimed) {
        await this.releaseHeldLease(id).catch(() => {
        });
        void publishOwnershipChanged(id);
      }
      return;
    }
    logger_default.info(
      "[coordinator] claimed %d connection(s): %o",
      claimed.length,
      claimed.map(({ id }) => id)
    );
    const { reconnectConcurrency } = this.options;
    for (let i = 0; i < claimed.length; i += reconnectConcurrency) {
      const chunk = claimed.slice(i, i + reconnectConcurrency);
      await Promise.allSettled(
        chunk.map(async ({ id, metadata, epoch }) => {
          await asyncSleep(Math.floor(Math.random() * 100));
          if (this.draining) {
            await this.releaseHeldLease(id).catch(() => {
            });
            void publishOwnershipChanged(id);
            return;
          }
          if (this.heldLeaseEpochs.get(id) !== epoch) {
            return;
          }
          try {
            await this.handler.connect(id, {
              isReconnect: true,
              ...metadata,
              // From this cycle's acquireLease — webhooks must carry the
              // epoch of the claim that authorized this socket, never a
              // re-read that could observe a successor's lease.
              leaseEpoch: epoch
            });
          } catch (error) {
            logger_default.error(
              "[coordinator] reconnect failed for %s, releasing lease: %s",
              id,
              errorToString(error)
            );
            await this.releaseHeldLease(id).catch(() => {
            });
            void publishOwnershipChanged(id);
          }
        })
      );
    }
  }
  // Sheds load one phone at a time when this instance holds more than its
  // fair share — e.g. a 1→2 migration where the older instance booted first
  // and claimed everything. Conservative by design: rate-limited, hysteresis
  // via tolerance, directed tombstone + release cooldown against ping-pong,
  // and a circuit breaker that defers to in-progress failovers.
  async runRebalanceCycle() {
    if (!this.options.rebalanceEnabled || this.draining || this.redisDegraded) {
      return;
    }
    const now = this.now();
    if (now - this.lastRebalanceReleaseAt < this.options.rebalanceReleaseIntervalMs) {
      return;
    }
    if (this.lastClaimAt > 0 && now - this.lastClaimAt < this.options.unclaimedGraceMs) {
      return;
    }
    const instances = await listLiveInstances().catch((error) => {
      logger_default.warn(
        "[coordinator] instance registry unavailable, skipping rebalance cycle: %s",
        errorToString(error)
      );
      return [];
    });
    const peers = instances.filter(
      (instance) => instance.instanceId !== instanceId && !instance.draining
    );
    if (peers.length === 0) {
      return;
    }
    const liveCount = peers.length + 1;
    const saved = await getRedisSavedAuthStateIds();
    const fairShare = Math.ceil(saved.length / liveCount);
    const myCount = this.handler.size;
    if (myCount <= fairShare + this.options.rebalanceTolerance) {
      return;
    }
    const target = peers.reduce(
      (best, candidate) => candidate.connectionCount < best.connectionCount ? candidate : best
    );
    if (target.connectionCount >= myCount - 1) {
      return;
    }
    const forced = myCount > fairShare * REBALANCE_FORCE_FACTOR;
    const victim = await this.pickRebalanceVictim(forced);
    if (!victim) {
      logger_default.debug(
        "[coordinator] no idle connection to rebalance (%d held, fair share %d), deferring",
        myCount,
        fairShare
      );
      return;
    }
    logger_default.info(
      "[coordinator] rebalancing %s to %s (%d held, fair share %d%s)",
      victim,
      target.instanceId,
      myCount,
      fairShare,
      forced ? ", forced" : ""
    );
    await this.handler.discardConnection(victim);
    try {
      await setReleaseCooldown(victim);
      await setHandoffTarget(victim, target.instanceId);
    } catch (error) {
      logger_default.warn(
        "[coordinator] rebalance handoff metadata failed for %s, releasing undirected: %s",
        victim,
        errorToString(error)
      );
    }
    try {
      await this.releaseHeldLease(victim);
    } catch (error) {
      this.redisDegraded = true;
      logger_default.warn(
        "[coordinator] lease release failed after discard for %s, pausing rebalances: %s",
        victim,
        errorToString(error)
      );
      return;
    } finally {
      void publishOwnershipChanged(victim);
    }
    this.lastRebalanceReleaseAt = this.now();
  }
  // Idle-aware victim selection. Migrating a connection costs a few seconds
  // of gap — invisible on an idle connection, visible mid-conversation
  // (presence lost, a racing send bounces to the client's retry). So:
  // - prefer connections with no in-flight webhooks and no message traffic
  //   within the idle threshold, tie-breaking by most recent claim (least
  //   accumulated session warmth);
  // - with no idle candidate, defer (return null) unless `forced`, in which
  //   case the least recently active connection is moved anyway;
  // - pending-QR connections are never moved — the user is mid-pairing on
  //   THIS instance's QR code.
  async pickRebalanceVictim(forced) {
    const now = this.now();
    const candidates = this.handler.getActivePhoneNumbers().map((phone) => ({
      phone,
      activity: this.handler.connectionActivity(phone)
    })).filter(
      (candidate) => candidate.activity !== null
    );
    const isIdle = (activity) => activity.inFlightWebhooks === 0 && (activity.lastTrafficAt === null || now - activity.lastTrafficAt >= this.options.rebalanceIdleThresholdMs);
    const idle = candidates.filter(({ activity }) => isIdle(activity)).sort(
      (a, b) => (this.claimedAt.get(b.phone) ?? 0) - (this.claimedAt.get(a.phone) ?? 0)
    );
    const pickedIdle = await this.firstPaired(idle.map(({ phone }) => phone));
    if (pickedIdle || !forced) {
      return pickedIdle;
    }
    const byActivity = [...candidates].sort(
      (a, b) => (a.activity.lastTrafficAt ?? Number.NEGATIVE_INFINITY) - (b.activity.lastTrafficAt ?? Number.NEGATIVE_INFINITY)
    );
    return this.firstPaired(byActivity.map(({ phone }) => phone));
  }
  async firstPaired(phones) {
    for (const phone of phones) {
      try {
        if (await isRedisAuthStatePaired(phone)) {
          return phone;
        }
      } catch {
      }
    }
    return null;
  }
  async runRenewCycle() {
    const phones = this.handler.getActivePhoneNumbers();
    if (phones.length === 0) {
      if (this.redisDegraded) {
        try {
          await getDb().command({ ping: 1 });
          this.redisDegraded = false;
        } catch {
        }
      }
      return;
    }
    for (const phone of phones) {
      try {
        const result = await renewLease(phone);
        if (result === "renewed") {
          this.redisDegraded = false;
          continue;
        }
        if (result === "missing") {
          const lease = await acquireLease(phone);
          if (lease) {
            this.heldLeaseEpochs.set(phone, lease.epoch);
            this.redisDegraded = false;
            continue;
          }
        }
        logger_default.warn(
          "[coordinator] lease for %s is owned elsewhere, discarding local socket",
          phone
        );
        this.heldLeaseEpochs.delete(phone);
        this.claimedAt.delete(phone);
        await this.handler.discardConnection(phone).catch((error) => {
          logger_default.warn(
            "[coordinator] discard failed for %s: %s",
            phone,
            errorToString(error)
          );
        });
      } catch (error) {
        this.redisDegraded = true;
        logger_default.warn(
          "[coordinator] lease renewal failed, keeping sockets and pausing claims: %s",
          errorToString(error)
        );
        return;
      }
    }
  }
  // Explicit user intent (POST /connections) — takes the identity over even
  // if a lease exists. In standalone this matches today's single-instance
  // semantics (the request is authoritative). In worker role, a lease held
  // by another LIVE instance is not stolen: the caller gets
  // BaileysConnectionOwnedElsewhereError and the proxy re-routes the request
  // to the owner. A dead owner's lease is force-taken immediately instead of
  // waiting for the TTL.
  async connectWithLease(phoneNumber, options) {
    if (config_default.cluster.role === "worker") {
      const lease = await getLease(phoneNumber);
      if (lease && lease.owner !== instanceId && await isInstanceAlive(lease.owner)) {
        throw new BaileysConnectionOwnedElsewhereError(lease.owner);
      }
    }
    const acquired = await forceAcquireLease(phoneNumber);
    this.heldLeaseEpochs.set(phoneNumber, acquired.epoch);
    this.claimedAt.set(phoneNumber, this.now());
    void publishOwnershipChanged(phoneNumber);
    try {
      await this.handler.connect(phoneNumber, {
        ...options,
        leaseEpoch: acquired.epoch
      });
    } catch (error) {
      await this.releaseHeldLease(phoneNumber).catch(() => {
      });
      void publishOwnershipChanged(phoneNumber);
      throw error;
    }
  }
  get isDraining() {
    return this.draining;
  }
  async logoutWithLease(phoneNumber) {
    try {
      await this.handler.logout(phoneNumber);
    } finally {
      await this.releaseHeldLease(phoneNumber).catch(() => {
      });
      void publishOwnershipChanged(phoneNumber);
    }
  }
  // Releases via compare-and-delete on the epoch we hold. Falls back to a
  // lease read when the epoch was never tracked (e.g. a logout for a phone
  // claimed before a process restart): if the lease meanwhile changed hands
  // or epochs, the scripted compare no-ops, which is the safe outcome.
  async releaseHeldLease(phoneNumber) {
    this.claimedAt.delete(phoneNumber);
    let epoch = this.heldLeaseEpochs.get(phoneNumber);
    this.heldLeaseEpochs.delete(phoneNumber);
    if (epoch === void 0) {
      const lease = await getLease(phoneNumber);
      if (lease?.owner !== instanceId) {
        return;
      }
      epoch = lease.epoch;
    }
    await releaseLease(phoneNumber, epoch);
  }
  // Graceful handoff: announce draining (peers stop counting us toward fair
  // share), close each socket BEFORE releasing its lease (the next owner must
  // never overlap with a still-open socket), then give in-flight webhooks a
  // bounded window to drain.
  async shutdown() {
    if (this.draining) {
      return;
    }
    this.draining = true;
    this.running = false;
    if (this.claimTimer) {
      clearTimeout(this.claimTimer);
    }
    if (this.renewTimer) {
      clearTimeout(this.renewTimer);
    }
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
    }
    await this.runHeartbeat();
    const phones = [...this.handler.getActivePhoneNumbers()].sort((a, b) => {
      const ta = this.handler.connectionActivity(a)?.lastTrafficAt ?? Number.NEGATIVE_INFINITY;
      const tb = this.handler.connectionActivity(b)?.lastTrafficAt ?? Number.NEGATIVE_INFINITY;
      return ta - tb;
    });
    if (phones.length > 0) {
      logger_default.info(
        "[coordinator] releasing %d connection(s) for handoff",
        phones.length
      );
    }
    for (const phone of phones) {
      try {
        await this.handler.discardConnection(phone);
        await this.releaseHeldLease(phone);
        void publishOwnershipChanged(phone);
      } catch (error) {
        logger_default.warn(
          "[coordinator] handoff failed for %s: %s",
          phone,
          errorToString(error)
        );
      }
    }
    const deadline = this.now() + this.options.shutdownTimeoutMs;
    while (this.handler.inFlightWebhookCount() > 0 && this.now() < deadline) {
      await asyncSleep(250);
    }
    await deregister().catch((error) => {
      logger_default.warn("[coordinator] deregister failed: %s", errorToString(error));
    });
  }
};
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// src/cluster/index.ts
var coordinator = new ClusterCoordinator(baileys_default);
var cluster_default = coordinator;

// src/controllers/cluster.ts
var clusterController = new Elysia2({
  prefix: "/cluster",
  detail: {
    tags: ["Cluster"]
  }
}).get(
  "/health",
  () => ({
    instanceId,
    role,
    connectionCount: baileys_default.size,
    draining: cluster_default.isDraining
  }),
  {
    detail: {
      responses: {
        200: {
          description: "Instance health and cluster identity"
        }
      }
    }
  }
);
var cluster_default2 = clusterController;

// src/controllers/connections/index.ts
import Elysia3, { t as t2 } from "elysia";

// src/cluster/workerRouting.ts
async function resolveMisdirectedRequest(phoneNumber) {
  if (config_default.cluster.role !== "worker") {
    return null;
  }
  try {
    const lease = await getLease(phoneNumber);
    if (lease && lease.owner !== instanceId && await isInstanceAlive(lease.owner)) {
      return lease.owner;
    }
  } catch {
    return null;
  }
  return null;
}

// src/controllers/connections/helpers.ts
function extractQuoted(content) {
  if (!content.quotedMessage) {
    return void 0;
  }
  return {
    key: content.quotedMessage.key,
    message: content.quotedMessage.message
  };
}
function buildMessageContent(content) {
  if ("text" in content) {
    const { quotedMessage: quotedMessage2, ...rest } = content;
    return {
      messageContent: rest,
      quoted: extractQuoted(content)
    };
  }
  if ("image" in content) {
    const { quotedMessage: quotedMessage2, ...rest } = content;
    return {
      messageContent: {
        ...rest,
        image: Buffer.from(content.image, "base64")
      },
      quoted: extractQuoted(content)
    };
  }
  if ("video" in content) {
    const { quotedMessage: quotedMessage2, ...rest } = content;
    return {
      messageContent: {
        ...rest,
        video: Buffer.from(content.video, "base64")
      },
      quoted: extractQuoted(content)
    };
  }
  if ("document" in content) {
    const { quotedMessage: quotedMessage2, ...rest } = content;
    return {
      messageContent: {
        ...rest,
        document: Buffer.from(content.document, "base64")
      },
      quoted: extractQuoted(content)
    };
  }
  if ("audio" in content) {
    const { quotedMessage: quotedMessage2, ...rest } = content;
    return {
      messageContent: {
        ...rest,
        audio: Buffer.from(content.audio, "base64")
      },
      quoted: extractQuoted(content)
    };
  }
  if ("react" in content) {
    return { messageContent: { react: content.react } };
  }
  throw new Error("Invalid message content");
}
function buildEditableMessageContent(content) {
  return content;
}

// src/helpers/withIdempotency.ts
var IDEMPOTENCY_TTL = 600;
var PROCESSING_PREFIX = "processing:";
var processingValue = () => `${PROCESSING_PREFIX}${instanceId}#${incarnationId}`;
async function withIdempotency(key, fn) {
  if (!key) {
    const value = await fn();
    return value !== null ? { status: "executed", value } : { status: "failed" };
  }
  const outcome = await acquireOrSteal(key);
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
    if (!cached)
      await releaseLock(key);
    return { status: "executed", value };
  } catch (error) {
    await releaseLock(key);
    throw error;
  }
}
async function acquireOrSteal(key) {
  if (await acquireLock(key)) {
    return { status: "owned" };
  }
  let current = null;
  try {
    const db2 = getDb();
    const collection = db2.collection("idempotency");
    const doc = await collection.findOne({ _id: key });
    current = doc ? doc.value : null;
  } catch (error) {
    logger_default.warn(
      "[withIdempotency] holder inspection failed, treating as processing: %s",
      errorToString(error)
    );
    return { status: "processing" };
  }
  if (current === null) {
    return await acquireLock(key) ? { status: "owned" } : { status: "processing" };
  }
  if (current === processingValue()) {
    return { status: "processing" };
  }
  const holder = parseHolder(current);
  if (holder === null) {
    try {
      return { status: "cached", value: JSON.parse(current) };
    } catch {
      return { status: "processing" };
    }
  }
  if (holder.instanceId === "") {
    return { status: "processing" };
  }
  const isOwnDeadIncarnation = holder.instanceId === instanceId && holder.incarnationId !== void 0 && holder.incarnationId !== incarnationId;
  if (!isOwnDeadIncarnation) {
    let alive;
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
    logger_default.info(
      "[withIdempotency] reclaimed orphaned lock %s from dead holder %s",
      key,
      holder.incarnationId ? `${holder.instanceId}#${holder.incarnationId}` : holder.instanceId
    );
    return { status: "owned" };
  }
  return { status: "processing" };
}
function parseHolder(value) {
  if (value === "processing") {
    return { instanceId: "", incarnationId: void 0 };
  }
  if (!value.startsWith(PROCESSING_PREFIX)) {
    return null;
  }
  const rest = value.slice(PROCESSING_PREFIX.length);
  const sep = rest.lastIndexOf("#");
  if (sep === -1) {
    return { instanceId: rest, incarnationId: void 0 };
  }
  return {
    instanceId: rest.slice(0, sep),
    incarnationId: rest.slice(sep + 1)
  };
}
async function acquireLock(key) {
  try {
    const db2 = getDb();
    const collection = db2.collection("idempotency");
    const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL * 1e3);
    await collection.insertOne({
      _id: key,
      value: processingValue(),
      expiresAt
    });
    return true;
  } catch (error) {
    if (error.code === 11e3) {
      return false;
    }
    logger_default.warn(
      "[withIdempotency] lock acquire failed, proceeding without cache: %s",
      errorToString(error)
    );
    return true;
  }
}
async function stealLock(key, expected) {
  try {
    const db2 = getDb();
    const collection = db2.collection("idempotency");
    const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL * 1e3);
    const result = await collection.updateOne(
      { _id: key, value: expected },
      {
        $set: {
          value: processingValue(),
          expiresAt
        }
      }
    );
    return result.modifiedCount === 1;
  } catch (error) {
    logger_default.warn(
      "[withIdempotency] lock steal failed: %s",
      errorToString(error)
    );
    return false;
  }
}
async function releaseLock(key) {
  try {
    const db2 = getDb();
    const collection = db2.collection("idempotency");
    await collection.deleteOne({ _id: key });
  } catch {
  }
}
async function cacheResult(key, value) {
  try {
    const db2 = getDb();
    const collection = db2.collection("idempotency");
    const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL * 1e3);
    await collection.updateOne(
      { _id: key },
      {
        $set: {
          value: JSON.stringify(value),
          expiresAt
        }
      },
      { upsert: true }
    );
    return true;
  } catch (error) {
    logger_default.warn(
      "[withIdempotency] cache write failed: %s",
      errorToString(error)
    );
    return false;
  }
}

// src/controllers/connections/types.ts
import { t } from "elysia";
var userJid = (moreInfo) => t.String({
  description: `User JID${moreInfo ? ` [${moreInfo}]` : ""}`,
  example: "551101234567@s.whatsapp.net"
});
var groupJid = (moreInfo) => t.String({
  description: `Group JID${moreInfo ? ` [${moreInfo}]` : ""}`,
  example: "123456789012345678@g.us"
});
var anyJid = (moreInfo) => t.String({
  description: `WhatsApp JID${moreInfo ? ` [${moreInfo}]` : ""}`,
  examples: ["551101234567@s.whatsapp.net", "123456789012345678@g.us"]
});
var phoneNumberParams = t.Object({
  phoneNumber: t.String({
    minLength: 6,
    maxLength: 16,
    pattern: "^\\+\\d{5,15}$",
    description: "Phone number for connection. Must have + prefix.",
    example: "+551234567890"
  })
});
var iMessageKey = t.Object({
  id: t.Optional(t.String()),
  remoteJid: t.Optional(t.String()),
  fromMe: t.Optional(t.Boolean()),
  participant: t.Optional(t.String())
});
var iMessageKeyWithId = t.Object({
  id: t.String({ description: "Message ID" }),
  remoteJid: t.Optional(t.String()),
  fromMe: t.Optional(t.Boolean()),
  participant: t.Optional(t.String())
});
var quotedMessage = t.Object(
  {
    key: iMessageKeyWithId,
    message: t.Record(t.String(), t.Unknown(), {
      description: "Original message content. This is required for the quoted message preview to appear correctly. Use the message object from the original messages.upsert webhook payload.",
      example: { conversation: "Hello!" }
    })
  },
  {
    description: "Message to reply to. Both key and message are required for the quoted message preview to appear correctly."
  }
);
var anyMessageContent = t.Union([
  t.Object(
    {
      text: t.String({ description: "Text message", example: "Hello world!" }),
      mentions: t.Optional(
        t.Array(userJid("user to mention in group message"))
      ),
      quotedMessage: t.Optional(quotedMessage)
    },
    {
      title: "Text message"
    }
  ),
  t.Object(
    {
      image: t.String({ description: "Base64 encoded image data" }),
      caption: t.Optional(t.String()),
      mimetype: t.Optional(t.String()),
      quotedMessage: t.Optional(quotedMessage)
    },
    {
      title: "Image message"
    }
  ),
  t.Object(
    {
      video: t.String({ description: "Base64 encoded video data" }),
      caption: t.Optional(t.String()),
      mimetype: t.Optional(t.String()),
      quotedMessage: t.Optional(quotedMessage)
    },
    {
      title: "Video message"
    }
  ),
  t.Object(
    {
      document: t.String({ description: "Base64 encoded document data" }),
      fileName: t.Optional(t.String()),
      mimetype: t.Optional(t.String()),
      caption: t.Optional(t.String()),
      quotedMessage: t.Optional(quotedMessage)
    },
    {
      title: "Document message"
    }
  ),
  t.Object(
    {
      audio: t.String({ description: "Base64 encoded audio data" }),
      ptt: t.Optional(t.Boolean()),
      mimetype: t.Optional(t.String()),
      quotedMessage: t.Optional(quotedMessage)
    },
    {
      title: "Audio message"
    }
  ),
  t.Object(
    {
      react: t.Object({
        key: iMessageKey,
        text: t.String({
          description: "Emoji to react with",
          example: "\u{1F44D}"
        })
      })
    },
    {
      title: "Reaction message"
    }
  )
]);
var editableMessageContent = t.Object(
  {
    text: t.String({
      description: "New text content for the message",
      example: "Updated message text"
    }),
    mentions: t.Optional(t.Array(userJid("user to mention in group message")))
  },
  {
    title: "Editable text message",
    description: "Message content that can be edited. Only text messages can be edited on WhatsApp."
  }
);
var lastMessageList = t.Array(
  t.Object({
    key: iMessageKey,
    messageTimestamp: t.Number()
  })
);
var chatModification = t.Object(
  {
    markRead: t.Boolean(),
    lastMessages: lastMessageList
  },
  {
    title: "Mark read/unread"
  }
);

// src/controllers/connections/index.ts
var connectionsController = new Elysia3({
  prefix: "/connections",
  detail: {
    tags: ["Connections"],
    security: [{ xApiKey: [] }],
    responses: {
      403: {
        description: "Forbidden \u2014 the API key does not own this connection. Returned when a connection is bound to a different API key."
      },
      421: {
        description: "Misdirected Request \u2014 in cluster mode, this instance does not own the connection. The owning instance id is in the x-baileys-owner header; a proxy re-routes the request there. Not returned for POST /connections/{phoneNumber} (explicit takeover).",
        headers: {
          "x-baileys-owner": {
            description: "Instance id of the connection owner",
            schema: { type: "string" }
          }
        }
      }
    }
  }
}).use(authMiddleware).onBeforeHandle(async ({ params, apiKeyHash, set, request, path: path4 }) => {
  const phoneNumber = params?.phoneNumber;
  if (!phoneNumber) {
    return;
  }
  const isConnectTakeover = request.method === "POST" && decodeURIComponent(path4) === `/connections/${phoneNumber}`;
  if (!isConnectTakeover) {
    const owner = await resolveMisdirectedRequest(phoneNumber);
    if (owner) {
      set.status = 421;
      set.headers["x-baileys-owner"] = owner;
      return {
        error: "Misdirected Request",
        message: "Connection is owned by another instance"
      };
    }
  }
  try {
    await baileys_default.verifyConnectionAccess(phoneNumber, apiKeyHash);
  } catch (e) {
    if (e instanceof BaileysConnectionForbiddenError) {
      set.status = 403;
      return { error: "Forbidden", message: e.message };
    }
    throw e;
  }
}).post(
  "/:phoneNumber",
  async ({ params, body, apiKeyHash, set }) => {
    const { phoneNumber } = params;
    try {
      await cluster_default.connectWithLease(phoneNumber, {
        ...body,
        apiKeyHash: apiKeyHash ?? void 0
      });
    } catch (e) {
      if (e instanceof BaileysConnectionOwnedElsewhereError) {
        set.status = 409;
        set.headers["x-baileys-owner"] = e.ownerInstanceId;
        return {
          error: "Conflict",
          message: "Connection is owned by another live instance"
        };
      }
      throw e;
    }
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      clientName: t2.Optional(
        t2.String({
          description: "Name of the client to be used on WhatsApp connection",
          example: "My WhatsApp Client"
        })
      ),
      webhookUrl: t2.String({
        format: "uri",
        description: "URL for receiving updates",
        example: "http://localhost:3026/whatsapp/+1234567890"
      }),
      webhookVerifyToken: t2.String({
        minLength: 6,
        description: "Token for verifying webhook",
        example: "a3f4b2"
      }),
      includeMedia: t2.Optional(
        t2.Boolean({
          description: "Include media in messages.upsert event payload as base64 string",
          // TODO(v2): Change default to false.
          default: true
        })
      ),
      syncFullHistory: t2.Optional(
        t2.Boolean({
          description: "Sync full history of messages on connection.",
          default: false
        })
      ),
      groupsEnabled: t2.Optional(
        t2.Boolean({
          description: "Enable full group message processing. When false, group messages are accumulated and sent as activity summaries.",
          default: true
        })
      ),
      autoPresenceSubscribe: t2.Optional(
        t2.Boolean({
          description: "Automatically subscribe to presence updates when sending/receiving messages or typing status to/from a contact. Subscriptions are ephemeral and re-established automatically.",
          default: false
        })
      )
    }),
    detail: {
      responses: {
        200: {
          description: "Connection initiated"
        },
        409: {
          description: "Conflict \u2014 in cluster mode, the connection is owned by another live instance (id in the x-baileys-owner header); a proxy re-routes the takeover there instead of stealing a healthy socket.",
          headers: {
            "x-baileys-owner": {
              description: "Instance id of the connection owner",
              schema: { type: "string" }
            }
          }
        }
      }
    }
  }
).patch(
  "/:phoneNumber/presence",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    await baileys_default.sendPresenceUpdate(phoneNumber, body);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      type: t2.Union(
        [
          t2.Literal("unavailable", { title: "unavailable" }),
          t2.Literal("available", { title: "available" }),
          t2.Literal("composing", { title: "composing" }),
          t2.Literal("recording", { title: "recording" }),
          t2.Literal("paused", { title: "paused" })
        ],
        {
          description: "Presence type. `available` is automatically reset to `unavailable` after 60s. `composing` and `recording` are automatically held for ~25s by WhatsApp. `paused` can be used to reset `composing` and `recording` early.",
          example: "available"
        }
      ),
      toJid: t2.Optional(
        anyJid("Required for `composing`, `recording`, and `paused`")
      )
    }),
    detail: {
      responses: {
        200: {
          description: "Presence update sent successfully"
        }
      }
    }
  }
).post(
  "/:phoneNumber/presence-subscribe",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jids } = body;
    const result = await baileys_default.presenceSubscribe(phoneNumber, jids);
    return { data: result };
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jids: t2.Array(
        anyJid("WhatsApp JID to subscribe to presence updates for"),
        {
          description: "Array of JIDs to subscribe to presence updates",
          minItems: 1,
          maxItems: 50
        }
      )
    }),
    detail: {
      description: "Subscribe to presence updates for one or more JIDs. Presence updates will be forwarded via the `presence.update` webhook event. Subscriptions are ephemeral, so re-subscribe periodically for continuous monitoring. LID JIDs are automatically resolved to phone number JIDs before subscribing.",
      responses: {
        200: {
          description: "Presence subscription result"
        }
      }
    }
  }
).post(
  "/:phoneNumber/send-message",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jid, messageContent, chatwootMessageId } = body;
    const idempotencyKey = chatwootMessageId !== void 0 && chatwootMessageId !== null ? `@baileys-api:idempotency:send-message:${phoneNumber}:${String(chatwootMessageId)}` : null;
    let result;
    try {
      result = await withIdempotency(idempotencyKey, async () => {
        const { messageContent: builtContent, quoted } = buildMessageContent(messageContent);
        const response = await baileys_default.sendMessage(phoneNumber, {
          jid,
          messageContent: builtContent,
          quoted
        });
        if (!response)
          return null;
        return {
          key: response.key,
          messageTimestamp: response.messageTimestamp
        };
      });
    } catch (e) {
      if (e instanceof BaileysNotConnectedError) {
        return new Response("Phone number not connected", { status: 404 });
      }
      throw e;
    }
    if (result.status === "processing") {
      return new Response("Message is already being processed", {
        status: 409
      });
    }
    if (result.status === "failed") {
      return new Response("Message not sent", { status: 500 });
    }
    return { data: result.value };
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: anyJid(),
      messageContent: anyMessageContent,
      chatwootMessageId: t2.Optional(t2.Union([t2.String(), t2.Number()]))
    }),
    detail: {
      responses: {
        200: {
          description: "Message sent successfully",
          content: {
            "application/json": {
              schema: t2.Object({
                data: t2.Object({
                  key: iMessageKey,
                  messageTimestamp: t2.String()
                })
              })
            }
          }
        },
        404: {
          description: "Phone number not connected"
        },
        409: {
          description: "Message is already being processed"
        },
        500: {
          description: "Message not sent"
        }
      }
    }
  }
).post(
  "/:phoneNumber/read-messages",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { keys } = body;
    await baileys_default.readMessages(phoneNumber, keys);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      keys: t2.Array(iMessageKey)
    }),
    detail: {
      responses: {
        200: {
          description: "Message read successfully"
        }
      }
    }
  }
).post(
  "/:phoneNumber/chat-modify",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { mod, jid } = body;
    await baileys_default.chatModify(phoneNumber, mod, jid);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      mod: chatModification,
      jid: anyJid()
    }),
    detail: {
      description: "Currently only supports marking chats as read/unread with `markRead` + `lastMessages`.",
      responses: {
        200: {
          description: "Chat modification was successfully applied"
        }
      }
    }
  }
).post(
  "/:phoneNumber/fetch-message-history",
  ({ params, body }) => {
    const { phoneNumber } = params;
    return baileys_default.fetchMessageHistory(phoneNumber, body);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      count: t2.Number({
        minimum: 1,
        maximum: 50,
        description: "Number of messages to fetch",
        example: 10
      }),
      oldestMsgKey: iMessageKey,
      oldestMsgTimestamp: t2.Number()
    }),
    detail: {
      responses: {
        200: { description: "Message history fetched" }
      }
    }
  }
).post(
  "/:phoneNumber/send-receipts",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    await baileys_default.sendReceipts(phoneNumber, body);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      keys: t2.Array(iMessageKey)
    }),
    detail: {
      description: "Sends read receipts for the provided message keys. Currently only supports sending `received` event. For `read` receipts, use `read-messages` endpoint.",
      responses: {
        200: {
          description: "Receipts sent successfully"
        }
      }
    }
  }
).delete(
  "/:phoneNumber/messages",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    await baileys_default.deleteMessage(phoneNumber, body);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: anyJid("Chat JID where the message exists"),
      key: iMessageKeyWithId
    }),
    detail: {
      description: "Deletes a message for everyone in the chat. For group messages not sent by you, this requires admin privileges.",
      responses: {
        200: {
          description: "Message deleted successfully"
        }
      }
    }
  }
).patch(
  "/:phoneNumber/messages",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jid, key, messageContent } = body;
    const response = await baileys_default.editMessage(phoneNumber, {
      jid,
      key,
      messageContent: buildEditableMessageContent(messageContent)
    });
    if (!response) {
      return new Response("Message not edited", { status: 500 });
    }
    return {
      data: {
        key: response.key,
        messageTimestamp: response.messageTimestamp
      }
    };
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: anyJid("Chat JID where the message exists"),
      key: iMessageKeyWithId,
      messageContent: editableMessageContent
    }),
    detail: {
      description: "Edits a previously sent message. Only text messages (including captions) can be edited. The message must have been sent by you and must be within the editable time window (approximately 15 minutes).",
      responses: {
        200: {
          description: "Message edited successfully",
          content: {
            "application/json": {
              schema: t2.Object({
                data: t2.Object({
                  key: iMessageKey,
                  messageTimestamp: t2.String()
                })
              })
            }
          }
        },
        500: {
          description: "Message not edited"
        }
      }
    }
  }
).get(
  "/:phoneNumber/profile-picture-url",
  async ({ params, query }) => {
    const { phoneNumber } = params;
    const { jid, type } = query;
    try {
      const profilePictureUrl = await baileys_default.profilePictureUrl(
        phoneNumber,
        jid,
        type
      );
      return {
        data: {
          jid,
          profilePictureUrl: profilePictureUrl || null
        }
      };
    } catch (e) {
      if (e.message === "item-not-found") {
        return new Response("Profile picture not found", { status: 404 });
      }
      throw e;
    }
  },
  {
    params: phoneNumberParams,
    query: t2.Object({
      jid: anyJid(),
      type: t2.Optional(
        t2.Union(
          [
            t2.Literal("preview", { title: "preview" }),
            t2.Literal("image", { title: "image" })
          ],
          {
            description: "Picture quality type",
            default: "preview"
          }
        )
      )
    }),
    detail: {
      responses: {
        200: {
          description: "Profile picture URL retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      jid: {
                        type: "string",
                        description: "WhatsApp JID of the phone number",
                        example: "551234567890@s.whatsapp.net"
                      },
                      profilePictureUrl: {
                        type: "string",
                        nullable: true,
                        example: "https://pps.whatsapp.net/v/t61.24694-24/..."
                      }
                    }
                  }
                }
              }
            }
          }
        },
        404: { description: "Profile picture not found" }
      }
    }
  }
).get(
  "/:phoneNumber/reachout-timelock",
  async ({ params }) => {
    const { phoneNumber } = params;
    try {
      const reachoutTimelock = await baileys_default.getReachoutTimelock(phoneNumber);
      return { data: reachoutTimelock };
    } catch (e) {
      if (e instanceof BaileysNotConnectedError) {
        return new Response("Phone number not connected", { status: 404 });
      }
      throw e;
    }
  },
  {
    params: phoneNumberParams,
    detail: {
      description: "Fetch the account's reach-out time-lock state \u2014 the restriction behind error 463 ('account restricted') that blocks starting new chats. Read-only: queries WhatsApp directly (MEX) without sending a message, so it is safe to call on a restricted account.",
      responses: {
        200: {
          description: "Reach-out time-lock state retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      isActive: {
                        type: "boolean",
                        description: "Whether the reach-out time-lock is currently enforced",
                        example: false
                      },
                      timeEnforcementEnds: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        description: "When the current enforcement window ends"
                      },
                      enforcementType: {
                        type: "string",
                        description: "Reason/type of enforcement. 'DEFAULT' means no restriction.",
                        example: "DEFAULT"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        404: { description: "Phone number not connected" }
      }
    }
  }
).get(
  "/:phoneNumber/new-chat-cap",
  async ({ params }) => {
    const { phoneNumber } = params;
    try {
      const newChatCap = await baileys_default.getNewChatMessageCap(phoneNumber);
      return { data: newChatCap };
    } catch (e) {
      if (e instanceof BaileysNotConnectedError) {
        return new Response("Phone number not connected", { status: 404 });
      }
      throw e;
    }
  },
  {
    params: phoneNumberParams,
    detail: {
      description: "Fetch the account's new-chat message cap and usage \u2014 an antecedent indicator of the 463 restriction (how many new conversations can still be started this cycle). Read-only: queries WhatsApp directly (MEX) without sending a message.",
      responses: {
        200: {
          description: "New-chat message cap retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      total_quota: {
                        type: "number",
                        description: "Total new-chat messages allowed in the current cycle",
                        example: 100
                      },
                      used_quota: {
                        type: "number",
                        description: "New-chat messages already used in the current cycle",
                        example: 0
                      },
                      cycle_start_timestamp: {
                        type: "string",
                        nullable: true,
                        description: "Unix timestamp of the cycle start"
                      },
                      cycle_end_timestamp: {
                        type: "string",
                        nullable: true,
                        description: "Unix timestamp of the cycle end"
                      },
                      server_sent_timestamp: {
                        type: "string",
                        nullable: true,
                        description: "Unix timestamp when WhatsApp produced this snapshot"
                      },
                      ote_status: {
                        type: "string",
                        nullable: true,
                        description: "One-time-engagement cap status (NOT_ELIGIBLE, ELIGIBLE, ACTIVE_IN_CURRENT_CYCLE, EXHAUSTED)"
                      },
                      mv_status: {
                        type: "string",
                        nullable: true,
                        description: "Multi-vertical cap status (NOT_ELIGIBLE, NOT_ACTIVE, ACTIVE, ACTIVE_UPGRADE_AVAILABLE)"
                      },
                      capping_status: {
                        type: "string",
                        nullable: true,
                        description: "Overall capping status (NONE, FIRST_WARNING, SECOND_WARNING, CAPPED)",
                        example: "NONE"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        404: { description: "Phone number not connected" }
      }
    }
  }
).post(
  "/:phoneNumber/on-whatsapp",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jids } = body;
    return baileys_default.onWhatsApp(phoneNumber, jids);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jids: t2.Array(
        t2.String({
          description: "Phone number formatted as jid",
          pattern: "^\\d{5,15}@s.whatsapp.net$",
          example: "551234567890@s.whatsapp.net"
        }),
        {
          description: "Array of phone numbers to check if they are on WhatsApp",
          minItems: 1,
          maxItems: 50
        }
      )
    }),
    detail: {
      description: "Check if phone numbers are registered on WhatsApp",
      responses: {
        200: {
          description: "Phone numbers checked successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        jid: {
                          type: "string",
                          description: "WhatsApp JID of the phone number",
                          example: "551234567890@s.whatsapp.net"
                        },
                        exists: {
                          type: "boolean",
                          description: "Whether the phone number is registered on WhatsApp"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
).get(
  "/:phoneNumber/business-profile",
  async ({ params, query }) => {
    const { phoneNumber } = params;
    const { jid } = query;
    return baileys_default.getBusinessProfile(phoneNumber, jid);
  },
  {
    params: phoneNumberParams,
    query: t2.Object({
      jid: userJid()
    }),
    detail: {
      description: "Get business profile of a WhatsApp Business account",
      responses: {
        200: {
          description: "Business profile retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  wid: {
                    type: "string",
                    description: "WhatsApp ID of the business",
                    example: "551234567890@s.whatsapp.net"
                  },
                  description: {
                    type: "string",
                    description: "Business description",
                    example: "We are a company that sells products"
                  },
                  email: {
                    type: "string",
                    nullable: true,
                    description: "Business email",
                    example: "contact@business.com"
                  },
                  website: {
                    type: "array",
                    items: { type: "string" },
                    description: "Business websites",
                    example: ["https://business.com"]
                  },
                  category: {
                    type: "string",
                    nullable: true,
                    description: "Business category",
                    example: "Retail"
                  },
                  address: {
                    type: "string",
                    nullable: true,
                    description: "Business address",
                    example: "123 Main St, City"
                  },
                  business_hours: {
                    type: "object",
                    description: "Business hours configuration",
                    properties: {
                      timezone: {
                        type: "string",
                        description: "Timezone of the business",
                        example: "America/Sao_Paulo"
                      },
                      config: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            day_of_week: { type: "string" },
                            mode: { type: "string" },
                            open_time: { type: "number" },
                            close_time: { type: "number" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
).get(
  "/:phoneNumber/group-metadata",
  async ({ params, query }) => {
    const { phoneNumber } = params;
    const { jid } = query;
    return baileys_default.groupMetadata(phoneNumber, jid);
  },
  {
    params: phoneNumberParams,
    query: t2.Object({
      jid: groupJid()
    }),
    detail: {
      responses: {
        200: {
          description: "Group metadata retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "Group JID",
                    example: "120363425378794738@g.us"
                  },
                  addressingMode: {
                    type: "string",
                    description: "Addressing mode of the group",
                    example: "lid"
                  },
                  subject: {
                    type: "string",
                    description: "Group name/subject",
                    example: "My Group"
                  },
                  subjectOwner: {
                    type: "string",
                    description: "JID of the user who set the subject",
                    example: "12345678901234@lid"
                  },
                  subjectOwnerPn: {
                    type: "string",
                    description: "Phone number JID of the subject owner",
                    example: "551234567890@s.whatsapp.net"
                  },
                  subjectTime: {
                    type: "number",
                    description: "Timestamp when subject was set"
                  },
                  size: {
                    type: "number",
                    description: "Number of participants in the group"
                  },
                  creation: {
                    type: "number",
                    description: "Timestamp when the group was created"
                  },
                  owner: {
                    type: "string",
                    description: "JID of the group owner",
                    example: "12345678901234@lid"
                  },
                  ownerPn: {
                    type: "string",
                    description: "Phone number JID of the group owner",
                    example: "551234567890@s.whatsapp.net"
                  },
                  owner_country_code: {
                    type: "string",
                    description: "Country code of the group owner",
                    example: "BR"
                  },
                  desc: {
                    type: "string",
                    nullable: true,
                    description: "Group description"
                  },
                  descId: {
                    type: "string",
                    nullable: true,
                    description: "Description ID"
                  },
                  descOwner: {
                    type: "string",
                    nullable: true,
                    description: "JID of the user who set the description"
                  },
                  descTime: {
                    type: "number",
                    nullable: true,
                    description: "Timestamp when description was set"
                  },
                  restrict: {
                    type: "boolean",
                    description: "Whether only admins can change group settings",
                    example: false
                  },
                  announce: {
                    type: "boolean",
                    description: "Whether only admins can send messages",
                    example: false
                  },
                  isCommunity: {
                    type: "boolean",
                    description: "Whether the group is a community",
                    example: false
                  },
                  isCommunityAnnounce: {
                    type: "boolean",
                    description: "Whether the group is a community announcement group",
                    example: false
                  },
                  joinApprovalMode: {
                    type: "boolean",
                    description: "Whether join requests require admin approval",
                    example: false
                  },
                  memberAddMode: {
                    type: "boolean",
                    description: "Whether members can add other members",
                    example: true
                  },
                  participants: {
                    type: "array",
                    description: "List of group participants",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          description: "Participant JID",
                          example: "12345678901234@lid"
                        },
                        phoneNumber: {
                          type: "string",
                          description: "Participant phone number JID",
                          example: "551234567890@s.whatsapp.net"
                        },
                        admin: {
                          type: "string",
                          nullable: true,
                          description: "Admin status: 'superadmin', 'admin', or null",
                          example: "superadmin"
                        }
                      }
                    }
                  },
                  ephemeralDuration: {
                    type: "number",
                    nullable: true,
                    description: "Duration in seconds for disappearing messages",
                    example: 604800
                  }
                }
              }
            }
          }
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-participants",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jid, participant, action } = body;
    return baileys_default.groupParticipants(phoneNumber, jid, [participant], action);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: groupJid(),
      participant: userJid(),
      action: t2.Union(
        [
          t2.Literal("add", { title: "add" }),
          t2.Literal("remove", { title: "remove" }),
          t2.Literal("promote", { title: "promote" }),
          t2.Literal("demote", { title: "demote" })
        ],
        {
          description: "Action to perform on participants. `add` adds participants, `remove` removes them, `promote` makes them admins, `demote` removes admin privileges.",
          example: "add"
        }
      )
    }),
    detail: {
      description: "Manage group participants (add, remove, promote, demote)",
      responses: {
        200: {
          description: "Participants updated successfully"
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-subject",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jid, subject } = body;
    await baileys_default.groupUpdateSubject(phoneNumber, jid, subject);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: groupJid(),
      subject: t2.String({
        description: "New group subject (name)",
        minLength: 1,
        maxLength: 100,
        example: "My Group Name"
      })
    }),
    detail: {
      description: "Update group subject (name)",
      responses: {
        200: {
          description: "Group subject updated successfully"
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-description",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jid, description } = body;
    await baileys_default.groupUpdateDescription(phoneNumber, jid, description);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: groupJid(),
      description: t2.Optional(
        t2.String({
          description: "New group description",
          maxLength: 2048,
          example: "This is my group description"
        })
      )
    }),
    detail: {
      description: "Update group description",
      responses: {
        200: {
          description: "Group description updated successfully"
        }
      }
    }
  }
).post(
  "/:phoneNumber/update-profile-picture",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jid, image } = body;
    const buffer = Buffer.from(image, "base64");
    await baileys_default.updateProfilePicture(phoneNumber, jid, buffer);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: anyJid(),
      image: t2.String({
        description: "Base64-encoded image data"
      })
    }),
    detail: {
      description: "Update profile picture for a contact or group",
      responses: {
        200: {
          description: "Profile picture updated successfully"
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-create",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { subject, participants } = body;
    return baileys_default.groupCreate(phoneNumber, subject, participants);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      subject: t2.String({
        description: "Group name/subject",
        minLength: 1,
        maxLength: 100,
        example: "My New Group"
      }),
      participants: t2.Array(userJid("Participant to add to the group"), {
        description: "Array of participant JIDs to add to the group",
        minItems: 1
      })
    }),
    detail: {
      description: "Create a new WhatsApp group",
      responses: {
        200: {
          description: "Group created successfully"
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-leave",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jid } = body;
    await baileys_default.groupLeave(phoneNumber, jid);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: groupJid()
    }),
    detail: {
      description: "Leave a WhatsApp group",
      responses: {
        200: {
          description: "Left group successfully"
        }
      }
    }
  }
).get(
  "/:phoneNumber/group-request-participants-list",
  async ({ params, query }) => {
    const { phoneNumber } = params;
    const { jid } = query;
    return baileys_default.groupRequestParticipantsList(phoneNumber, jid);
  },
  {
    params: phoneNumberParams,
    query: t2.Object({
      jid: groupJid()
    }),
    detail: {
      description: "List pending join requests for a group",
      responses: {
        200: {
          description: "Pending join requests retrieved successfully"
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-request-participants-update",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jid, participants, action } = body;
    return baileys_default.groupRequestParticipantsUpdate(
      phoneNumber,
      jid,
      participants,
      action
    );
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: groupJid(),
      participants: t2.Array(userJid("Participant to approve or reject"), {
        description: "Array of participant JIDs to approve or reject",
        minItems: 1
      }),
      action: t2.Union(
        [
          t2.Literal("approve", { title: "approve" }),
          t2.Literal("reject", { title: "reject" })
        ],
        {
          description: "Action to perform on join requests",
          example: "approve"
        }
      )
    }),
    detail: {
      description: "Approve or reject pending join requests for a group",
      responses: {
        200: {
          description: "Join requests updated successfully"
        }
      }
    }
  }
).get(
  "/:phoneNumber/group-invite-code",
  async ({ params, query }) => {
    const { phoneNumber } = params;
    const { jid } = query;
    const code = await baileys_default.groupInviteCode(phoneNumber, jid);
    return { data: { jid, inviteCode: code || null } };
  },
  {
    params: phoneNumberParams,
    query: t2.Object({
      jid: groupJid()
    }),
    detail: {
      description: "Get the invite code for a group",
      responses: {
        200: {
          description: "Invite code retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      jid: { type: "string" },
                      inviteCode: { type: "string", nullable: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-revoke-invite",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jid } = body;
    const newCode = await baileys_default.groupRevokeInvite(phoneNumber, jid);
    return { data: { jid, inviteCode: newCode || null } };
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: groupJid()
    }),
    detail: {
      description: "Revoke the current invite code and generate a new one for a group",
      responses: {
        200: {
          description: "Invite code revoked successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      jid: { type: "string" },
                      inviteCode: { type: "string", nullable: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-accept-invite",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { code } = body;
    const groupJid2 = await baileys_default.groupAcceptInvite(phoneNumber, code);
    return { data: { groupJid: groupJid2 || null } };
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      code: t2.String({
        description: "Group invite code",
        example: "ABC123xyz"
      })
    }),
    detail: {
      description: "Join a group using an invite code",
      responses: {
        200: {
          description: "Joined group successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      groupJid: { type: "string", nullable: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-revoke-invite-v4",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { groupJid: gJid, invitedJid } = body;
    const result = await baileys_default.groupRevokeInviteV4(
      phoneNumber,
      gJid,
      invitedJid
    );
    return { data: { revoked: result } };
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      groupJid: groupJid(),
      invitedJid: userJid("JID of the invited user")
    }),
    detail: {
      description: "Revoke a V4 invite for a specific user",
      responses: {
        200: {
          description: "V4 invite revoked successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      revoked: { type: "boolean" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-accept-invite-v4",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { key, inviteMessage } = body;
    const result = await baileys_default.groupAcceptInviteV4(
      phoneNumber,
      key,
      inviteMessage
    );
    return { data: result };
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      key: t2.Union([
        t2.String({ description: "Invite key as string" }),
        iMessageKeyWithId
      ]),
      inviteMessage: t2.Object(
        {
          groupJid: groupJid("target group for the invite"),
          inviteCode: t2.String({ description: "Invite code" }),
          inviteExpiration: t2.Optional(t2.Number()),
          groupName: t2.Optional(t2.String()),
          caption: t2.Optional(t2.String())
        },
        {
          description: "Group invite message content"
        }
      )
    }),
    detail: {
      description: "Accept a V4 group invite message",
      responses: {
        200: {
          description: "V4 invite accepted successfully"
        }
      }
    }
  }
).get(
  "/:phoneNumber/group-invite-info",
  async ({ params, query }) => {
    const { phoneNumber } = params;
    const { code } = query;
    return baileys_default.groupGetInviteInfo(phoneNumber, code);
  },
  {
    params: phoneNumberParams,
    query: t2.Object({
      code: t2.String({
        description: "Group invite code",
        example: "ABC123xyz"
      })
    }),
    detail: {
      description: "Get group metadata from an invite code without joining the group",
      responses: {
        200: {
          description: "Group invite info retrieved successfully"
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-toggle-ephemeral",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jid, ephemeralExpiration } = body;
    await baileys_default.groupToggleEphemeral(phoneNumber, jid, ephemeralExpiration);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: groupJid(),
      ephemeralExpiration: t2.Number({
        description: "Duration in seconds for disappearing messages. Use 0 to disable.",
        minimum: 0,
        example: 604800
      })
    }),
    detail: {
      description: "Toggle disappearing messages for a group",
      responses: {
        200: {
          description: "Ephemeral setting updated successfully"
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-setting-update",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jid, setting } = body;
    await baileys_default.groupSettingUpdate(phoneNumber, jid, setting);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: groupJid(),
      setting: t2.Union(
        [
          t2.Literal("announcement", { title: "announcement" }),
          t2.Literal("not_announcement", { title: "not_announcement" }),
          t2.Literal("locked", { title: "locked" }),
          t2.Literal("unlocked", { title: "unlocked" })
        ],
        {
          description: "Group setting to update. `announcement` makes only admins able to send messages. `not_announcement` allows all participants. `locked` makes only admins able to edit group info. `unlocked` allows all participants to edit.",
          example: "announcement"
        }
      )
    }),
    detail: {
      description: "Update group settings (announcement/locked mode)",
      responses: {
        200: {
          description: "Group setting updated successfully"
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-member-add-mode",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jid, mode } = body;
    await baileys_default.groupMemberAddMode(phoneNumber, jid, mode);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: groupJid(),
      mode: t2.Union(
        [
          t2.Literal("admin_add", { title: "admin_add" }),
          t2.Literal("all_member_add", { title: "all_member_add" })
        ],
        {
          description: "Who can add members. `admin_add` restricts to admins only. `all_member_add` allows all members.",
          example: "all_member_add"
        }
      )
    }),
    detail: {
      description: "Set who can add members to the group",
      responses: {
        200: {
          description: "Member add mode updated successfully"
        }
      }
    }
  }
).post(
  "/:phoneNumber/group-join-approval-mode",
  async ({ params, body }) => {
    const { phoneNumber } = params;
    const { jid, mode } = body;
    await baileys_default.groupJoinApprovalMode(phoneNumber, jid, mode);
  },
  {
    params: phoneNumberParams,
    body: t2.Object({
      jid: groupJid(),
      mode: t2.Union(
        [
          t2.Literal("on", { title: "on" }),
          t2.Literal("off", { title: "off" })
        ],
        {
          description: "Whether join requests require admin approval. `on` enables approval mode, `off` disables it.",
          example: "on"
        }
      )
    }),
    detail: {
      description: "Toggle join approval mode for a group",
      responses: {
        200: {
          description: "Join approval mode updated successfully"
        }
      }
    }
  }
).get(
  "/:phoneNumber/group-fetch-all-participating",
  async ({ params }) => {
    const { phoneNumber } = params;
    return baileys_default.groupFetchAllParticipating(phoneNumber);
  },
  {
    params: phoneNumberParams,
    detail: {
      description: "Fetch metadata for all groups the connected number is participating in",
      responses: {
        200: {
          description: "All group metadata retrieved successfully"
        }
      }
    }
  }
).delete(
  "/:phoneNumber",
  async ({ params }) => {
    const { phoneNumber } = params;
    try {
      await cluster_default.logoutWithLease(phoneNumber);
    } catch (e) {
      if (e instanceof BaileysNotConnectedError) {
        return new Response("Phone number not found", { status: 404 });
      }
      throw e;
    }
  },
  {
    params: phoneNumberParams,
    detail: {
      responses: {
        200: {
          description: "Disconnected"
        },
        404: {
          description: "Phone number not found"
        }
      }
    }
  }
);
var connections_default = connectionsController;

// src/controllers/media.ts
import path3 from "node:path";
import Elysia4, { t as t3 } from "elysia";
var mediaController = new Elysia4({
  prefix: "/media",
  detail: {
    tags: ["Media"],
    description: "Media file download",
    security: [{ xApiKey: [] }]
  }
}).use(authMiddleware).get(
  ":messageId",
  async ({ params, set }) => {
    const { messageId: messageId2 } = params;
    const mediaPath = path3.resolve(process.cwd(), "media", messageId2);
    const mediaFile = file(mediaPath);
    if (await mediaFile.exists()) {
      set.headers["content-type"] = "application/octet-stream";
      set.headers["cache-control"] = "public, max-age=31536000";
      const buffer = await mediaFile.arrayBuffer();
      return new Response(buffer, {
        headers: {
          "content-type": "application/octet-stream",
          "cache-control": "public, max-age=31536000"
        }
      });
    }
    return new Response("File not found", { status: 404 });
  },
  {
    params: t3.Object({
      messageId: t3.String({
        description: "Message ID to download media from",
        // NOTE: From empirical testing, most message IDs are below 33 characters.
        // To avoid any issues, we set the max length to 64 characters.
        pattern: "^[A-Z0-9]{1,64}$"
      })
    }),
    detail: {
      responses: {
        200: {
          description: "Media file"
        },
        404: {
          description: "File not found"
        }
      }
    }
  }
);
var media_default = mediaController;

// src/controllers/status.ts
import Elysia5 from "elysia";
var statusController = new Elysia5({
  prefix: "/status",
  detail: {
    tags: ["Status"],
    security: [{ xApiKey: [] }]
  }
}).get("", () => deepSanitizeObject(config_default, { omitKeys: ["password"] }), {
  detail: {
    responses: {
      200: {
        description: "Server running",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                packageInfo: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "baileys-api" },
                    version: { type: "string", example: "1.0.0" },
                    description: { type: "string" },
                    repository: {
                      type: "object",
                      properties: {
                        type: { type: "string", example: "git" },
                        url: {
                          type: "string",
                          example: "https://github.com/fazer-ai/baileys-api.git"
                        }
                      }
                    }
                  }
                },
                port: {
                  type: "number",
                  example: 3025
                },
                env: {
                  type: "string",
                  enum: ["development", "production"],
                  example: "development"
                },
                logLevel: {
                  type: "string",
                  example: "info"
                },
                baileys: {
                  type: "object",
                  properties: {
                    logLevel: { type: "string", example: "warn" },
                    clientVersion: { type: "string", example: "default" },
                    ignoreGroupMessages: { type: "boolean", example: false },
                    ignoreStatusMessages: { type: "boolean", example: true },
                    ignoreBroadcastMessages: {
                      type: "boolean",
                      example: true
                    },
                    ignoreNewsletterMessages: {
                      type: "boolean",
                      example: true
                    },
                    ignoreBotMessages: { type: "boolean", example: true },
                    ignoreMetaAiMessages: { type: "boolean", example: true }
                  }
                },
                redis: {
                  type: "object",
                  properties: {
                    url: {
                      type: "string",
                      example: "redis://localhost:6379"
                    },
                    password: {
                      type: "string",
                      example: "********",
                      description: "Omitted password"
                    }
                  }
                },
                webhook: {
                  type: "object",
                  properties: {
                    retryPolicy: {
                      type: "object",
                      properties: {
                        maxRetries: { type: "number", example: 3 },
                        retryInterval: { type: "number", example: 5e3 },
                        backoffFactor: { type: "number", example: 3 }
                      }
                    }
                  }
                },
                corsOrigin: {
                  type: "string",
                  example: "localhost"
                },
                keyStore: {
                  type: "object",
                  properties: {
                    lruCacheMax: { type: "number", example: 100 },
                    lruCacheTtl: { type: "number", example: 6e5 }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}).use(authMiddleware).get("/auth", () => "OK", {
  detail: {
    responses: {
      200: {
        description: "Authenticated"
      }
    }
  }
});
var status_default = statusController;

// src/app.ts
var app = new Elysia6().onAfterResponse(({ request, response, set }) => {
  if (config_default.env === "development") {
    logger_default.info(
      "%s %s [%d] %o",
      request.method,
      request.url,
      response?.status ?? set.status,
      typeof response === "object" && response !== null ? deepSanitizeObject(response) : response ?? {}
    );
  } else {
    logger_default.info(
      "%s %s [%d]",
      request.method,
      request.url,
      response?.status ?? set.status
    );
  }
}).onError(({ path: path4, error, code }) => {
  logger_default.error("%s\n%s", path4, errorToString(error));
  switch (code) {
    case "INTERNAL_SERVER_ERROR": {
      const message = config_default.env === "development" ? errorToString(error) : "Something went wrong";
      return new Response(message, { status: 500 });
    }
    default:
  }
}).use(status_default).use(admin_default).use(connections_default).use(media_default).use(cluster_default2);
if (!process.env.VERCEL) {
  try {
    const swaggerModule = "@elysiajs/swagger";
    const swagger = __require(swaggerModule).default || __require(swaggerModule).swagger;
    if (swagger) {
      app.use(
        swagger({
          documentation: {
            info: {
              title: config_default.packageInfo.name,
              version: config_default.packageInfo.version,
              description: `${config_default.packageInfo.description} [See on GitHub](${config_default.packageInfo.repository.url})`
            },
            servers: [
              {
                url: `http://localhost:${config_default.port}`,
                description: "Local development server"
              },
              {
                url: "{scheme}://{customUrl}",
                description: "Custom server",
                variables: {
                  scheme: {
                    enum: ["http", "https"],
                    default: "https",
                    description: "HTTP or HTTPS"
                  },
                  customUrl: {
                    default: "your-domain.com",
                    description: "Your API domain (without protocol)"
                  }
                }
              }
            ],
            tags: [
              {
                name: "Status",
                description: "Fetch server status"
              },
              {
                name: "Connections",
                description: "WhatsApp connections operations"
              },
              {
                name: "Admin",
                description: "Admin operations"
              },
              {
                name: "Media",
                description: "Retrieve media content from a message"
              },
              {
                name: "Cluster",
                description: "Instance health and cluster identity"
              }
            ],
            components: {
              securitySchemes: {
                xApiKey: {
                  type: "apiKey",
                  in: "header",
                  name: "x-api-key",
                  description: "API key. See scripts/manage-api-keys.ts"
                }
              }
            }
          }
        })
      );
    }
  } catch (err) {
    logger_default.error("Failed to load swagger: %s", errorToString(err));
  }
}
if (config_default.env === "development") {
  app.use(cors());
} else {
  app.use(cors({ origin: config_default.corsOrigin }));
}
var app_default = app;

// src/vercel-entry.ts
async function handler(request) {
  await initializeMongo();
  return app_default.handle(request);
}
export {
  handler as default
};
