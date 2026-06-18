export function AuthView({ apiBase = '/api', token = '' } = {}) {
  return `
    <section class="grid min-h-screen place-items-center px-5 py-10">
      <div class="w-full max-w-md rounded-3xl border border-mjt-line bg-slate-950/70 p-8 shadow-2xl backdrop-blur-xl">
        <div class="flex items-center gap-4">
          <div class="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-2xl font-black text-slate-950">M</div>
          <div>
            <h1 class="text-2xl font-black">MJT Panel</h1>
            <p class="text-sm text-mjt-muted">Tailwind CDN development build</p>
          </div>
        </div>
        <div class="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
          <strong>Welcome back.</strong>
          <p class="mt-1 text-sm text-mjt-muted">Use real token in MJT, or token <code>dev</code> on localhost.</p>
        </div>
        <label class="mt-5 block text-sm font-black text-mjt-muted">API Base</label>
        <input id="apiBaseInput" class="mt-2 w-full rounded-2xl border border-mjt-line bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400" value="${apiBase}" />
        <label class="mt-4 block text-sm font-black text-mjt-muted">Panel Token</label>
        <input id="tokenInput" type="password" class="mt-2 w-full rounded-2xl border border-mjt-line bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400" value="${token}" placeholder="Paste token or type dev" />
        <div class="mt-5 grid grid-cols-[1fr_140px] gap-3">
          <button id="loginBtn" class="rounded-2xl bg-cyan-400 px-4 py-3 font-black text-slate-950">Sign in</button>
          <button id="demoBtn" class="rounded-2xl border border-mjt-line px-4 py-3 font-black">Demo</button>
        </div>
        <p id="loginMessage" class="mt-4 min-h-6 text-sm text-amber-300"></p>
      </div>
    </section>
  `;
}

export function setLoginMessage(text, danger = false) {
  const el = document.getElementById('loginMessage');
  if (!el) return;
  el.textContent = text || '';
  el.className = `mt-4 min-h-6 text-sm ${danger ? 'text-red-300' : 'text-amber-300'}`;
}
