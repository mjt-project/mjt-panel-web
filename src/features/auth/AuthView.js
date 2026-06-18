export function AuthView({ apiBase = "/api", token = "" } = {}) {
  return `
    <section class="login-view">
      <div class="login-card">
        <div class="logo-wrap"><div class="logo">M</div><div><h1>MJT Panel</h1><p>Mini Minecraft control panel</p></div></div>
        <div class="login-copy"><strong>Welcome back.</strong><span>Paste your panel token to manage Minecraft profiles, installer and console.</span></div>
        <label>API Base</label><input id="apiBaseInput" value="${apiBase}" autocomplete="off" />
        <label>Panel Token</label><input id="tokenInput" type="password" value="${token}" placeholder="Paste token or use dev on localhost" />
        <div class="login-actions"><button id="loginBtn" class="btn primary">Sign in</button><button id="demoBtn" class="btn subtle">Demo mode</button></div>
        <p id="loginMessage" class="form-message"></p>
        <div class="login-help"><code>.mjt panel token reset</code><code>.mjt panel install</code><code>.mjt panel start</code></div>
      </div>
    </section>`;
}

export function setLoginMessage(text, danger = false) {
  const el = document.getElementById("loginMessage");
  if (!el) return;
  el.textContent = text || "";
  el.style.color = danger ? "var(--danger)" : "var(--warn)";
}
