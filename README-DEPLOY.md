# WhatsApp Bulk Scanner Deployment Guide

This guide details the steps to deploy the **Bun-based Baileys-API** locally with **Redis** and **MongoDB** containers and scan up to **10 Lakh (1,000,000)** phone numbers in an optimized, production-ready environment.

---

## 🏗️ Production Architecture Overview

The system runs in a hybrid layout for maximum performance and stability:

1. **Baileys-API (Bun/Elysia)**: Runs inside a Docker container (using native Bun and `jemalloc` memory allocator to prevent leaks). Maps to Port `3000`.
2. **Redis Cache**: Used by the Baileys-API to store authentication session keys and tokens in memory, ensuring rapid lookups.
3. **MongoDB**: Stores target phone numbers and scan status, allowing streaming pagination using MongoDB cursors (to prevent RAM bloat).
4. **Client Scripts (Node.js)**: Runs on the host machine using lightweight, non-blocking requests to verify numbers in batches of **50** (50x faster than one-by-one verification) and updates MongoDB in bulk.

```
                  +----------------------------------------------+
                  |               DOCKER NETWORK                 |
                  |                                              |
                  |   +-------------+          +-------------+   |
                  |   |    Redis    |          |   MongoDB   |   |
                  |   +------+------+          +------+------+   |
                  |          ^                        ^          |
                  |          |                        |          |
                  |          v                        |          |
                  |   +------+------+                 |          |
                  |   | Baileys-API |                 |          |
                  |   +------+------+                 |          |
                  +----------^------------------------|----------+
                             |                        |
                   HTTP POST | (Port 3000)            | (Port 27017)
                             |                        |
                  +----------+------------------------v----------+
                  |         HOST MACHINE (Node.js runtime)       |
                  |                                              |
                  |                processor.js                  |
                  |       (Batching, Cooldowns, Rotation)        |
                  +----------------------------------------------+
```

---

## 🚀 Step-by-Step Setup

### Step 1: Clone and Install Host Dependencies

Make sure you have Node.js (v18+) installed on your Windows machine. Install the required client dependencies:

```bash
npm install
```

### Step 2: Configure Environment Variables

Edit the `.env` file at the root directory of the project. Set your WhatsApp numbers for session rotation:

```env
# MongoDB and API Connection Settings
MONGO_URL=mongodb://localhost:27017
API_BASE_URL=http://localhost:3000

# WhatsApp session numbers to rotate (comma-separated, country code, no + or spaces)
SESSION_NUMBERS=911111111111,912222222222,913333333333

# Optional: Set an API Key if NODE_ENV is production
API_KEY=your-secure-api-key
```

### Step 3: Spin Up Docker Services

Ensure Docker Desktop is running. Start MongoDB, Redis, and Baileys-API:

```bash
docker-compose up --build -d
```

Verify that all containers are healthy:

```bash
docker ps
```

---

## 📲 Step 4: Active WhatsApp Sessions (QR Code Pairing)

For each phone number specified in `SESSION_NUMBERS`, you need to connect the device to create an active session.

1. Trigger the connection request for your number using `curl` or Postman:
   ```bash
   curl -X POST http://localhost:3000/connections/91XXXXXXXXXX \
     -H "Content-Type: application/json" \
     -d '{
       "webhookUrl": "http://localhost:3000/mock-webhook",
       "webhookVerifyToken": "verification-token-123"
     }'
   ```
2. Retrieve the QR code to scan. You can view the Docker logs for the `whatsapp-scanner-api` container:
   ```bash
   docker logs -f whatsapp-scanner-api
   ```
3. A QR code will be printed in the console. Scan it with your phone's WhatsApp ("Linked Devices" menu).
4. Repeat this step for each of your numbers in the rotation pool.

---

## 💻 Step 5: Data Verification & Scanner Execution

### 1. Load your Target Phone Numbers (CSV to MongoDB)
Prepare a CSV file (e.g. `numbers.csv`) containing the list of phone numbers (with country code, one number per line or with a `phone` header).
Load them into MongoDB using the bulk loader script:

```bash
node scripts/loadCsvToMongo.js numbers.csv
```

### 2. Launch the High-Volume Scanner
Run the background verification scanner:

```bash
node processor.js
```

---

## 🛡️ Anti-Ban & Production Scaling Guidelines

To safeguard your WhatsApp accounts from bans during large scans:

1. **Session Rotation**: The `processor.js` automatically cycles through your connected sessions for every batch of 50 numbers. This distributes the traffic evenly.
2. **Batching**: The scanner packs 50 numbers into a single `on-whatsapp` request. This dramatically reduces network requests and is 50 times faster.
3. **Micro-Delays**: The script introduces a random delay of **1.2 to 2.5 seconds** between batch queries.
4. **Macro-Cooldowns**: After every **100 batches (5,000 checks)**, the script halts operations for **15 seconds** to prevent triggers.
5. **Token Persistence**: Since we run Redis with AOF persistence enabled, your session tokens are saved across container restarts. Do not delete the Docker volume `redis-data` unless you want to re-pair all devices.
