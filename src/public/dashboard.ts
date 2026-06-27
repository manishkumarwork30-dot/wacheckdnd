// src/public/dashboard.ts

export const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Baileys WhatsApp API Dashboard</title>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      --card-bg: rgba(30, 41, 59, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #10b981;
      --primary-hover: #059669;
      --primary-glow: rgba(16, 185, 129, 0.15);
      --accent: #6366f1;
      --danger: #ef4444;
      --warning: #f59e0b;
      --success: #10b981;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Outfit', sans-serif;
    }

    body {
      background: var(--bg-gradient);
      color: var(--text-main);
      min-height: 100vh;
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .container {
      max-width: 1200px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }

    h1 {
      font-size: 1.8rem;
      font-weight: 600;
      background: linear-gradient(to right, #10b981, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge {
      background: var(--primary-glow);
      color: var(--primary);
      padding: 0.25rem 0.75rem;
      border-radius: 99px;
      font-size: 0.85rem;
      font-weight: 500;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .api-key-section {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    input, textarea, select {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--card-border);
      color: var(--text-main);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.3s ease;
    }

    input:focus, textarea:focus, select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    button {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    button:hover {
      background: var(--primary-hover);
      box-shadow: 0 0 12px var(--primary-glow);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    @media (max-width: 900px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-main);
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .session-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 250px;
      overflow-y: auto;
    }

    .session-item {
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid var(--card-border);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s ease;
    }

    .session-item:hover {
      border-color: rgba(99, 102, 241, 0.4);
    }

    .session-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .session-phone {
      font-weight: 600;
      color: var(--text-main);
    }

    .session-status {
      font-size: 0.75rem;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .qr-container {
      background: white;
      padding: 1rem;
      border-radius: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto;
      max-width: 250px;
      aspect-ratio: 1;
      border: 2px solid var(--accent);
    }

    .qr-container img {
      width: 100%;
      height: 100%;
    }

    .status-alert {
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .status-alert.info {
      background: rgba(99, 102, 241, 0.1);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    .status-alert.error {
      background: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .status-alert.warning {
      background: rgba(245, 158, 11, 0.1);
      color: #fde047;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    /* Bulk Validator Section */
    .bulk-section {
      grid-column: span 2;
    }

    @media (max-width: 900px) {
      .bulk-section {
        grid-column: span 1;
      }
    }

    .progress-bar-container {
      width: 100%;
      height: 8px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 99px;
      overflow: hidden;
      display: none;
    }

    .progress-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(to right, var(--primary), var(--accent));
      transition: width 0.3s ease;
    }

    /* Results Table */
    .table-container {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      background: rgba(15, 23, 42, 0.2);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.95rem;
    }

    th, td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--card-border);
    }

    th {
      background: rgba(15, 23, 42, 0.6);
      color: var(--text-muted);
      font-weight: 500;
      position: sticky;
      top: 0;
    }

    tr:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .status-badge {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.active {
      background: rgba(16, 185, 129, 0.15);
      color: var(--primary);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .status-badge.inactive {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stats-row {
      display: flex;
      gap: 1.5rem;
      background: rgba(15, 23, 42, 0.4);
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid var(--card-border);
    }

    .stat-box {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .stat-val {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .stat-val.success { color: var(--success); }
    .stat-val.danger { color: var(--danger); }
  </style>
</head>
<body>

<div class="container">
  <!-- Header -->
  <header>
    <h1>🟢 Baileys WhatsApp Gateway</h1>
    <div class="api-key-section">
      <input type="password" id="apiKeyInput" placeholder="Enter x-api-key" />
      <button onclick="saveApiKey()">Save Key</button>
    </div>
  </header>

  <div class="grid">
    <!-- Active Connections Manager -->
    <div class="card">
      <div class="card-title">
        <span>Active WhatsApp Sessions</span>
        <button onclick="fetchSessions()" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Refresh</button>
      </div>
      <div id="sessionAlert" class="status-alert info">Loading sessions...</div>
      <div id="sessionList" class="session-list"></div>
    </div>

    <!-- Create Connection -->
    <div class="card">
      <div class="card-title">Add WhatsApp Connection</div>
      <div class="form-group">
        <label for="newPhone">Phone Number (with country code, e.g. +917012345678)</label>
        <input type="text" id="newPhone" placeholder="+917012345678" />
      </div>
      <div class="form-group">
        <label for="newWebhook">Webhook URL</label>
        <input type="text" id="newWebhook" value="http://localhost:3000/webhook-mock" />
      </div>
      <div class="form-group">
        <label for="newVerifyToken">Webhook Verify Token</label>
        <input type="text" id="newVerifyToken" value="verify_token_123456" />
      </div>
      <button id="connectBtn" onclick="createConnection()">Create & Connect</button>
      
      <!-- QR code display if connecting -->
      <div id="qrSection" style="display: none; flex-direction: column; gap: 1rem; align-items: center; margin-top: 1rem;">
        <p style="font-weight: 500; font-size: 0.95rem; color: var(--warning);">Scan this QR Code in WhatsApp Linked Devices:</p>
        <div class="qr-container">
          <img id="qrImg" src="" alt="WhatsApp QR Code" />
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted);">Polling latest QR code...</p>
      </div>
    </div>

    <!-- Bulk WhatsApp Number Validator -->
    <div class="card bulk-section">
      <div class="card-title">Bulk Active WhatsApp Checker ("wa active hai y nhi")</div>
      
      <div class="grid" style="gap: 1rem; margin-bottom: 0;">
        <div class="form-group">
          <label for="activeSessionSelect">Select Connected Session</label>
          <select id="activeSessionSelect">
            <option value="">-- Select Connection --</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="phoneInput">Enter Phone Numbers (One number per line, with country code, e.g. +917012345678 or 917012345678)</label>
        <textarea id="phoneInput" rows="6" placeholder="917012345678&#10;+919988776655&#10;918877665544"></textarea>
      </div>

      <div class="actions-row">
        <button id="validateBtn" onclick="startBulkValidation()" disabled>Start Validation</button>
        
        <div class="stats-row" id="statsRow" style="display: none;">
          <div class="stat-box">
            <span class="stat-label">Total</span>
            <span id="statTotal" class="stat-val">0</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Active</span>
            <span id="statActive" class="stat-val success">0</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Inactive</span>
            <span id="statInactive" class="stat-val danger">0</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Progress</span>
            <span id="statProgress" class="stat-val">0%</span>
          </div>
        </div>
      </div>

      <div class="progress-bar-container" id="progressContainer">
        <div class="progress-bar" id="progressBar"></div>
      </div>

      <div class="table-container" id="tableContainer" style="display: none;">
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 1rem; background: rgba(0,0,0,0.2); align-items: center;">
          <h4 style="font-weight: 500; font-size: 0.9rem;">Validation Log</h4>
          <button onclick="downloadCSV()" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; background: var(--accent);">Export CSV</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Phone Number</th>
              <th>JID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="resultsTableBody">
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<script>
  let qrPollInterval = null;
  let activePhoneNumbers = [];
  let validationResults = [];

  // Load saved API key on startup
  document.addEventListener("DOMContentLoaded", () => {
    const savedKey = localStorage.getItem("x-api-key");
    if (savedKey) {
      document.getElementById("apiKeyInput").value = savedKey;
    }
    fetchSessions();
  });

  function getHeaders() {
    const key = document.getElementById("apiKeyInput").value;
    return {
      "Content-Type": "application/json",
      "x-api-key": key
    };
  }

  function saveApiKey() {
    const key = document.getElementById("apiKeyInput").value;
    localStorage.setItem("x-api-key", key);
    alert("API Key saved locally!");
    fetchSessions();
  }

  async function fetchSessions() {
    const alertEl = document.getElementById("sessionAlert");
    const listEl = document.getElementById("sessionList");
    const selectEl = document.getElementById("activeSessionSelect");
    const validateBtn = document.getElementById("validateBtn");

    try {
      const response = await fetch("/connections", { headers: getHeaders() });
      if (!response.ok) {
        throw new Error(await response.text() || "Failed to fetch");
      }
      const res = await response.json();
      activePhoneNumbers = res.data || [];
      
      listEl.innerHTML = "";
      selectEl.innerHTML = '<option value="">-- Select Connection --</option>';

      if (activePhoneNumbers.length === 0) {
        alertEl.style.display = "block";
        alertEl.className = "status-alert warning";
        alertEl.innerText = "No active connection sessions. Please add a connection on the right.";
        validateBtn.disabled = true;
      } else {
        alertEl.style.display = "none";
        validateBtn.disabled = false;
        
        activePhoneNumbers.forEach(phone => {
          // Add to list
          const item = document.createElement("div");
          item.className = "session-item";
          item.innerHTML = \`
            <div class="session-details">
              <span class="session-phone">\${phone}</span>
              <span class="session-status">🟢 Connected & Active</span>
            </div>
            <button onclick="disconnectSession('\${phone}')" style="background: var(--danger); padding: 0.4rem 0.8rem; font-size: 0.8rem;">Disconnect</button>
          \`;
          listEl.appendChild(item);

          // Add to select dropdown
          const opt = document.createElement("option");
          opt.value = phone;
          opt.innerText = phone;
          selectEl.appendChild(opt);
        });
      }
    } catch (err) {
      alertEl.style.display = "block";
      alertEl.className = "status-alert error";
      alertEl.innerText = "Error loading sessions: " + err.message + ". Make sure your x-api-key is correct.";
      validateBtn.disabled = true;
    }
  }

  async function createConnection() {
    const phone = document.getElementById("newPhone").value.trim();
    const webhook = document.getElementById("newWebhook").value.trim();
    const verifyToken = document.getElementById("newVerifyToken").value.trim();
    const connectBtn = document.getElementById("connectBtn");

    if (!phone || !webhook || !verifyToken) {
      alert("Please fill in all connection details!");
      return;
    }

    connectBtn.disabled = true;
    connectBtn.innerText = "Connecting...";

    try {
      const response = await fetch(\`/connections/\${encodeURIComponent(phone)}\`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          clientName: "Chrome (Local Dashboard)",
          webhookUrl: webhook,
          webhookVerifyToken: verifyToken,
          includeMedia: false,
          syncFullHistory: false
        })
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to trigger connect");
      }

      // Start polling for QR code
      startQRPolling(phone);

    } catch (err) {
      alert("Error: " + err.message);
      connectBtn.disabled = false;
      connectBtn.innerText = "Create & Connect";
    }
  }

  function startQRPolling(phone) {
    const qrSection = document.getElementById("qrSection");
    const qrImg = document.getElementById("qrImg");
    
    qrSection.style.display = "flex";
    if (qrPollInterval) clearInterval(qrPollInterval);

    let pollAttempts = 0;
    qrPollInterval = setInterval(async () => {
      pollAttempts++;
      if (pollAttempts > 30) { // stop after 2.5 minutes
        clearInterval(qrPollInterval);
        alert("QR code polling timed out. Please refresh session state.");
        resetConnectForm();
        return;
      }

      try {
        const response = await fetch(\`/connections/\${encodeURIComponent(phone)}/qr\`, {
          headers: getHeaders()
        });

        if (response.ok) {
          const res = await response.json();
          if (res.qr) {
            qrImg.src = res.qr;
          }
        } else if (response.status === 404) {
          // If QR is 404, check if the session is already active in connection list
          await fetchSessions();
          if (activePhoneNumbers.includes(phone)) {
            clearInterval(qrPollInterval);
            qrSection.style.display = "none";
            alert("WhatsApp connected successfully!");
            resetConnectForm();
          }
        }
      } catch (err) {
        console.error("QR poll error:", err);
      }
    }, 5000);
  }

  function resetConnectForm() {
    const connectBtn = document.getElementById("connectBtn");
    connectBtn.disabled = false;
    connectBtn.innerText = "Create & Connect";
    document.getElementById("newPhone").value = "";
  }

  async function disconnectSession(phone) {
    if (!confirm(\`Are you sure you want to disconnect \${phone}?\`)) return;

    try {
      const response = await fetch(\`/connections/\${encodeURIComponent(phone)}\`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (!response.ok) {
        throw new Error(await response.text() || "Failed to disconnect");
      }
      alert("Session disconnected!");
      fetchSessions();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  // Bulk active checker
  async function startBulkValidation() {
    const session = document.getElementById("activeSessionSelect").value;
    const rawPhones = document.getElementById("phoneInput").value.trim();
    const validateBtn = document.getElementById("validateBtn");

    if (!session) {
      alert("Please select a connected session first!");
      return;
    }
    if (!rawPhones) {
      alert("Please enter phone numbers to validate!");
      return;
    }

    // Parse and normalize numbers
    let numbers = rawPhones.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
    // Add JID suffix format if missing
    let jids = numbers.map(num => {
      let clean = num.replace("+", "");
      if (!clean.endsWith("@s.whatsapp.net")) {
        clean = clean + "@s.whatsapp.net";
      }
      return clean;
    });

    if (jids.length === 0) {
      alert("No valid phone numbers found!");
      return;
    }

    validateBtn.disabled = true;
    validateBtn.innerText = "Checking...";
    validationResults = [];
    
    document.getElementById("statsRow").style.display = "flex";
    document.getElementById("progressContainer").style.display = "block";
    document.getElementById("tableContainer").style.display = "block";
    document.getElementById("resultsTableBody").innerHTML = "";

    // Stats counter
    let total = jids.length;
    let active = 0;
    let inactive = 0;
    
    document.getElementById("statTotal").innerText = total;
    document.getElementById("statActive").innerText = active;
    document.getElementById("statInactive").innerText = inactive;
    document.getElementById("statProgress").innerText = "0%";
    
    const progressBar = document.getElementById("progressBar");
    progressBar.style.width = "0%";

    // Process in batches of 50
    const batchSize = 50;
    for (let i = 0; i < jids.length; i += batchSize) {
      const batch = jids.slice(i, i + batchSize);
      
      try {
        const response = await fetch(\`/connections/\${encodeURIComponent(session)}/on-whatsapp\`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ jids: batch })
        });

        if (!response.ok) {
          throw new Error(await response.text() || "Failed batch check");
        }

        const res = await response.json();
        const results = res || [];

        results.forEach(r => {
          const numberOnly = r.jid.split("@")[0];
          const exists = r.exists;

          if (exists) active++;
          else inactive++;

          validationResults.push({
            number: "+" + numberOnly,
            jid: r.jid,
            status: exists ? "ACTIVE" : "INACTIVE"
          });

          // Append to results table
          const row = document.createElement("tr");
          row.innerHTML = \`
            <td>+\${numberOnly}</td>
            <td>\${r.jid}</td>
            <td>
              <span class="status-badge \${exists ? 'active' : 'inactive'}">
                \${exists ? 'Active' : 'Inactive'}
              </span>
            </td>
          \`;
          document.getElementById("resultsTableBody").appendChild(row);
        });

        // Update stats
        document.getElementById("statActive").innerText = active;
        document.getElementById("statInactive").innerText = inactive;
        
        let percentage = Math.round(((i + batch.length) / total) * 100);
        document.getElementById("statProgress").innerText = percentage + "%";
        progressBar.style.width = percentage + "%";

      } catch (err) {
        console.error("Batch check error:", err);
        // Treat batch as inactive/failed in UI log
        batch.forEach(jid => {
          inactive++;
          validationResults.push({
            number: "+" + jid.split("@")[0],
            jid: jid,
            status: "FAILED/INACTIVE"
          });
          const row = document.createElement("tr");
          row.innerHTML = \`
            <td>+\${jid.split("@")[0]}</td>
            <td>\${jid}</td>
            <td><span class="status-badge inactive">Inactive / Error</span></td>
          \`;
          document.getElementById("resultsTableBody").appendChild(row);
        });
        document.getElementById("statInactive").innerText = inactive;
      }
      
      // Pause slightly between batches
      await new Promise(r => setTimeout(r, 1000));
    }

    validateBtn.disabled = false;
    validateBtn.innerText = "Start Validation";
  }

  function downloadCSV() {
    if (validationResults.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,Phone Number,WhatsApp JID,WhatsApp Active\\n";
    
    validationResults.forEach(r => {
      csvContent += \`\${r.number},\${r.jid},\${r.status}\\n\`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "whatsapp_active_validation.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

</body>
</html>
`;
