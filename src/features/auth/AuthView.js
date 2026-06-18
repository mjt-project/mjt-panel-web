export function AuthView({ apiBase = "/api", token = "" } = {}) {
  return `<section class="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
    <div class="w-full max-w-md card card-pad">
      <div class="flex items-center gap-3 mb-6"><div class="logo">M</div><div><h1 class="text-2xl font-black">MJT Panel</h1><p class="text-slate-500 text-sm">Mini Minecraft control panel</p></div></div>
      <div class="rounded-2xl bg-blue-50 border border-blue-100 p-4 mb-5"><b>Welcome back.</b><p class="text-sm text-slate-600 mt-1">Paste your token or use <code>dev</code> on localhost.</p></div>
      <div class="space-y-4">
        <div class="field"><label>API Base</label><input id="apiBaseInput" class="input" value="${apiBase}" /></div>
        <div class="field"><label>Panel Token</label><input id="tokenInput" class="input" type="password" value="${token}" placeholder="Paste token" /></div>
        <button id="loginBtn" class="btn btn-primary w-full">Sign in</button>
        <button id="demoBtn" class="btn btn-soft w-full">Open demo mode</button>
        <p id="loginMessage" class="text-sm font-semibold min-h-5 text-amber-600"></p>
      </div>
    </div>
  </section>`;
}
export function setLoginMessage(text, danger = false) {
  const el = document.getElementById("loginMessage"); if (!el) return;
  el.textContent = text || ""; el.className = `text-sm font-semibold min-h-5 ${danger ? "text-red-600" : "text-amber-600"}`;
}
