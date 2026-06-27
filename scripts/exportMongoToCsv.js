const { MongoClient } = require("mongodb");
const fs = require("fs");
require("dotenv").config();

// Read database URL from env or fallback
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = "verification_db";
const COLLECTION_NAME = "target_numbers";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: node scripts/exportMongoToCsv.js <path-to-output-csv>");
    process.exit(1);
  }

  const outputFilePath = args[0];
  console.log(`Connecting to MongoDB at ${MONGO_URL}...`);
  const client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully.");
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log("Fetching cursor for target_numbers...");
    const cursor = collection.find({ status: { $in: ["active", "inactive", "pending_failed"] } });

    console.log(`Preparing write stream to: ${outputFilePath}`);
    const writeStream = fs.createWriteStream(outputFilePath);

    // Write CSV Header
    writeStream.write("phone,status,updatedAt\n");

    let count = 0;
    for await (const doc of cursor) {
      const line = `"${doc.phone}","${doc.status}","${doc.updatedAt ? doc.updatedAt.toISOString() : ""}"\n`;
      
      // Handle backpressure if write stream buffer is full
      if (!writeStream.write(line)) {
        await new Promise(resolve => writeStream.once("drain", resolve));
      }
      
      count++;
      if (count % 10000 === 0) {
        console.log(`Exported ${count} records...`);
      }
    }

    writeStream.end();
    console.log(`\n=============================================`);
    console.log(`Export Completed successfully!`);
    console.log(`Total exported records written: ${count}`);
    console.log(`Output File: ${outputFilePath}`);
    console.log(`=============================================`);

  } catch (error) {
    console.error("An error occurred during export:", error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
