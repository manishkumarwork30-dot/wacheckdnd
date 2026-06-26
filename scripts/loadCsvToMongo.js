const { MongoClient } = require("mongodb");
const fs = require("fs");
const readline = require("readline");

// Read database URL from env or fallback
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = "verification_db";
const COLLECTION_NAME = "target_numbers";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: node scripts/loadCsvToMongo.js <path-to-csv-file>");
    process.exit(1);
  }

  const csvFilePath = args[0];
  console.log(`Connecting to MongoDB at ${MONGO_URL}...`);
  const client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully.");
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Create unique index on phone to avoid duplicates
    console.log("Ensuring unique index on phone field...");
    await collection.createIndex({ phone: 1 }, { unique: true });

    console.log(`Reading CSV file: ${csvFilePath}...`);
    const fileStream = fs.createReadStream(csvFilePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let count = 0;
    let duplicateCount = 0;
    let batch = [];
    const BATCH_SIZE = 5000;

    let isFirstLine = true;
    let phoneColumnIndex = -1;

    for await (const line of rl) {
      if (!line.trim()) continue;

      // Parse CSV line
      const columns = line.split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));

      if (isFirstLine) {
        isFirstLine = false;
        // Try to identify if this is a header row
        const lowerCols = columns.map(c => c.toLowerCase());
        phoneColumnIndex = lowerCols.findIndex(
          c => c.includes("phone") || c.includes("number") || c.includes("mobile") || c.includes("jid")
        );

        if (phoneColumnIndex !== -1) {
          console.log(`Detected header. Phone column found at index ${phoneColumnIndex}: "${columns[phoneColumnIndex]}"`);
          continue;
        } else {
          // If no obvious phone column header, check if first column contains digits (likely data, not header)
          const firstColClean = columns[0].replace(/\D/g, "");
          if (firstColClean.length >= 7) {
            phoneColumnIndex = 0; // Default to first column
            console.log("No header detected. Defaulting to first column.");
          } else {
            console.log("Skipping header row:", columns);
            continue;
          }
        }
      }

      const rawPhone = columns[phoneColumnIndex !== -1 ? phoneColumnIndex : 0];
      if (!rawPhone) continue;

      // Clean phone number: keep only digits
      const phone = rawPhone.replace(/\D/g, "");
      if (phone.length < 7 || phone.length > 15) {
        // Skip invalid length numbers
        continue;
      }

      batch.push({
        phone,
        status: "pending",
        updatedAt: new Date(),
      });

      if (batch.length >= BATCH_SIZE) {
        const result = await insertBatch(collection, batch);
        count += result.inserted;
        duplicateCount += result.duplicates;
        batch = [];
        console.log(`Processed ${count + duplicateCount} numbers (Inserted: ${count}, Duplicates skipped: ${duplicateCount})...`);
      }
    }

    // Insert remaining
    if (batch.length > 0) {
      const result = await insertBatch(collection, batch);
      count += result.inserted;
      duplicateCount += result.duplicates;
    }

    console.log("\n=============================================");
    console.log("Import Completed successfully!");
    console.log(`Total phone numbers in DB/Processed: ${count + duplicateCount}`);
    console.log(`Successfully Inserted: ${count}`);
    console.log(`Duplicates Skipped: ${duplicateCount}`);
    console.log("=============================================");

  } catch (error) {
    console.error("An error occurred during import:", error);
  } finally {
    await client.close();
  }
}

async function insertBatch(collection, batch) {
  try {
    const result = await collection.insertMany(batch, { ordered: false });
    return {
      inserted: result.insertedCount,
      duplicates: 0
    };
  } catch (error) {
    const inserted = error.result?.nInserted || 0;
    const duplicates = batch.length - inserted;
    return {
      inserted,
      duplicates
    };
  }
}

main().catch(console.error);
