export function AuthView({ apiBase = '/api', token = '' } = {}) {
  return `
    <section class="min-h-screen grid place-items-center px-6 py-10">
      <div class="w-full max-w-md rounded-[2rem] border border-mjt-border bg-white p-8 shadow-soft">
        <div class="flex items-center gap-4">
          <div class="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-black text-white">M</div>
          <div>
            <h1 class="text-2xl font-black text-slate-900">MJT Panel</h1>
            <p class="text-sm text-slate-500">Light Minecraft control panel</p>
          </div>
        </div>
        <div class="mt-6 rounded-3xl bg-blue-50 p-4 text-sm text-blue-900">
          Paste your token to manage profiles, installer, console and files. Use <b>dev</b> on localhost.
        </div>
        <label class="mt-5 block text-sm font-bold text-slate-600">API Base</label>
        <input id="apiBaseInput" class="mjt-input mt-2" value="${apiBase}" autocomplete="off" />
        <label class="mt-4 block text-sm font-bold text-slate-600">Panel Token</label>
        <input id="tokenInput" class="mjt-input mt-2" type="password" value="${token}" placeholder="Paste token or use dev" />
        <div class="mt-5 grid grid-cols-[1fr_130px] gap-3">
          <button id="loginBtn" class="rounded-2xl bg-blue-600 px-4 py-3 font-black text-white shadow-lg shadow-blue-100">Sign in</button>
          <button id="demoBtn" class="rounded-2xl border border-mjt-border px-4 py-3 font-black text-slate-700">Demo</button>
        </div>
        <p id="loginMessage" class="mt-4 min-h-6 text-sm font-semibold text-amber-600"></p>
      </div>
    </section>`;
}
export function setLoginMessage(text, danger = false) {
  const el = document.getElementById('loginMessage');
  if (!el) return;
  el.textContent = text || '';
  el.className = `mt-4 min-h-6 text-sm font-semibold ${danger ? 'text-red-600' : 'text-amber-600'}`;
}
