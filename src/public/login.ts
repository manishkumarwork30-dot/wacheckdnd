// src/public/login.ts

export const loginHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - WhatsApp Gateway</title>
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
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }

    .login-container {
      max-width: 420px;
      width: 100%;
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .header {
      text-align: center;
    }

    h1 {
      font-size: 1.8rem;
      font-weight: 600;
      background: linear-gradient(to right, #10b981, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    input {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--card-border);
      color: var(--text-main);
      padding: 0.85rem 1rem;
      border-radius: 8px;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.3s ease;
    }

    input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    button {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.9rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    button:hover {
      background: var(--primary-hover);
      box-shadow: 0 0 15px var(--primary-glow);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-alert {
      background: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.2);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      display: none;
      text-align: center;
    }
  </style>
</head>
<body>

  <div class="login-container">
    <div class="header">
      <h1>🟢 Gateway Admin</h1>
      <p class="subtitle">Please sign in to access the dashboard</p>
    </div>

    <div class="error-alert" id="errorAlert"></div>

    <form onsubmit="handleLogin(event)" style="display: flex; flex-direction: column; gap: 1.25rem;">
      <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" required placeholder="admin@example.com" />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" required placeholder="••••••••" />
      </div>

      <button type="submit" id="loginBtn">Sign In</button>
    </form>
  </div>

  <script>
    async function handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const btn = document.getElementById("loginBtn");
      const errEl = document.getElementById("errorAlert");

      btn.disabled = true;
      btn.innerText = "Signing in...";
      errEl.style.display = "none";

      try {
        const res = await fetch("/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Invalid email or password");
        }

        // Reload the page on successful login so server serves dashboardHtml
        window.location.reload();
      } catch (err) {
        errEl.innerText = err.message;
        errEl.style.display = "block";
        btn.disabled = false;
        btn.innerText = "Sign In";
      }
    }
  </script>

</body>
</html>
`;
