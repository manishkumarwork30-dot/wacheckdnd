import { type Db, MongoClient } from "mongodb";
import config from "@/config";
import logger from "@/lib/logger";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function initializeMongo(): Promise<Db> {
  if (db) return db;

  const mongoUrl =
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017";
  const dbName = "verification_db"; // You can make this configurable via config if needed

  logger.info("Connecting to MongoDB...");
  client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db(dbName);
  logger.info("Connected to MongoDB");

  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Database not initialized. Call initializeMongo() first.");
  }
  return db;
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info("Closed MongoDB connection");
  }
}
