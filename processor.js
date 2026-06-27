const { MongoClient } = require("mongodb");
require("dotenv").config();

// Configuration
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = "verification_db";
const COLLECTION_NAME = "target_numbers";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const API_KEY = process.env.API_KEY || "";

// Session rotation list (comma separated phone numbers without '+' e.g. "911111111111,912222222222")
const SESSIONS = (process.env.SESSION_NUMBERS || "")
  .split(",")
  .map(s => s.trim())
  .filter(s => s.length > 0);

const BATCH_SIZE = 50; // Baileys-API accepts up to 50 JIDs per batch
const ROTATE_AFTER_BATCHES = 1; // Rotate session after every batch request
const COOLDOWN_INTERVAL_BATCHES = 100; // Cooldown break after every 100 batches (5,000 checks)
const COOLDOWN_TIME_MS = 15000; // 15 seconds cooldown

async function main() {
  if (SESSIONS.length === 0) {
    console.error("ERROR: No WhatsApp sessions configured. Set SESSION_NUMBERS environment variable in .env.");
    console.error("Example: SESSION_NUMBERS=911111111111,912222222222");
    process.exit(1);
  }

  console.log(`Initialized Bulk WhatsApp Scanner with ${SESSIONS.length} active sessions:`, SESSIONS);
  console.log(`Connecting to MongoDB at ${MONGO_URL}...`);
  const client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Verify index exists
    await collection.createIndex({ status: 1 });

    // Get database counts to report proper percentage progress
    console.log("Fetching database stats...");
    const totalCount = await collection.countDocuments({});
    const initialPendingCount = await collection.countDocuments({ status: "pending" });
    const initialProcessedCount = totalCount - initialPendingCount;

    let activeSessionIndex = 0;
    let batchCount = 0;
    let processedCount = initialProcessedCount;
    let activeCount = await collection.countDocuments({ status: "active" });
    let inactiveCount = await collection.countDocuments({ status: "inactive" });

    console.log(`Starting bulk lookup streams... Total in DB: ${totalCount} | Already processed: ${initialProcessedCount} | Pending: ${initialPendingCount}`);

    // Main loop: Query pending numbers in batches
    while (true) {
      // Fetch a batch of pending documents
      const pendingDocs = await collection
        .find({ status: "pending" })
        .limit(BATCH_SIZE)
        .toArray();

      if (pendingDocs.length === 0) {
        console.log("No more pending phone numbers found. Done!");
        break;
      }

      const jids = pendingDocs.map(doc => `${doc.phone}@s.whatsapp.net`);
      let success = false;
      let attempt = 0;
      let responseData = null;

      // Retry batch across active sessions if one is offline/disconnected
      while (!success && attempt < SESSIONS.length) {
        const activeSession = SESSIONS[activeSessionIndex];
        const checkUrl = `${API_BASE_URL}/connections/${activeSession}/on-whatsapp`;
        
        console.log(`[Batch ${batchCount + 1}] Verifying ${jids.length} numbers via session ${activeSession}...`);

        try {
          const headers = {
            "Content-Type": "application/json"
          };
          if (API_KEY) {
            headers["x-api-key"] = API_KEY;
          }

          const response = await fetch(checkUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ jids })
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errText}`);
          }

          responseData = await response.json();
          success = true;
        } catch (error) {
          console.error(`Warning: Session ${activeSession} failed for batch:`, error.message);
          attempt++;
          // Rotate to the next session immediately on failure
          activeSessionIndex = (activeSessionIndex + 1) % SESSIONS.length;
          console.log(`Rotating to next session: ${SESSIONS[activeSessionIndex]}`);
          // Wait briefly before retrying the batch
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      // If all sessions failed to process this batch, wait 60s and try again (don't skip documents)
      if (!success || !responseData) {
        console.error("ERROR: All sessions failed to verify the current batch. Halting scanner for 60 seconds...");
        await new Promise(r => setTimeout(r, 60000));
        continue;
      }

      // Parse response and prepare bulk write updates for MongoDB
      const checkResults = Array.isArray(responseData) 
        ? responseData 
        : (responseData.data || []);

      if (checkResults.length === 0) {
        console.warn(`[Batch ${batchCount + 1}] API returned no results. Marking batch as skipped/failed to avoid infinite loop.`);
        const failedOps = pendingDocs.map(doc => ({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { status: "pending_failed", updatedAt: new Date() } }
          }
        }));
        await collection.bulkWrite(failedOps);
        processedCount += jids.length;
        const progressPercent = totalCount > 0 ? ((processedCount / totalCount) * 100).toFixed(2) : "0.00";
        console.log(`Progress: ${progressPercent}% (${processedCount}/${totalCount}) | Active: ${activeCount} | Inactive: ${inactiveCount}`);
      } else {
        const ops = checkResults.map(result => {
          const phone = result.jid.split("@")[0];
          const exists = result.exists;
          if (exists) activeCount++; else inactiveCount++;
          
          return {
            updateOne: {
              filter: { phone },
              update: { $set: { status: exists ? "active" : "inactive", updatedAt: new Date() } }
            }
          };
        });

        // Execute bulk write updates in MongoDB
        await collection.bulkWrite(ops);
        processedCount += jids.length;
        const progressPercent = totalCount > 0 ? ((processedCount / totalCount) * 100).toFixed(2) : "0.00";
        console.log(`Progress: ${progressPercent}% (${processedCount}/${totalCount}) | Active: ${activeCount} | Inactive: ${inactiveCount}`);
      }

      batchCount++;

      // Session Rotation rule
      if (batchCount % ROTATE_AFTER_BATCHES === 0) {
        activeSessionIndex = (activeSessionIndex + 1) % SESSIONS.length;
      }

      // Large block cooldown break
      if (batchCount % COOLDOWN_INTERVAL_BATCHES === 0) {
        console.log(`\n--- Cooldown break for ${COOLDOWN_TIME_MS / 1000}s to avoid ban risk ---`);
        await new Promise(r => setTimeout(r, COOLDOWN_TIME_MS));
      } else {
        // Micro delay between requests (1.2 to 2.5 seconds random delay)
        const microDelay = Math.floor(Math.random() * 1300) + 1200;
        await new Promise(r => setTimeout(r, microDelay));
      }
    }

    console.log("=============================================");
    console.log("All scans completed successfully!");
    console.log(`Total checked: ${processedCount}`);
    console.log(`Active WhatsApp: ${activeCount}`);
    console.log(`Inactive WhatsApp: ${inactiveCount}`);
    console.log("=============================================");

  } catch (error) {
    console.error("Fatal processor error:", error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
