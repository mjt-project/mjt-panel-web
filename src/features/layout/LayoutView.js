import { pageMeta, pages } from '../../app/router.js';
import { state } from '../../app/state.js';

export function LayoutView(contentHtml) {
  const [title, subtitle] = pageMeta[state.currentPage] || pageMeta.dashboard;
  return `
    <section class="grid min-h-screen grid-cols-[270px_1fr] max-lg:grid-cols-1">
      <aside class="flex flex-col border-r border-mjt-line bg-slate-950/60 p-5 backdrop-blur-xl max-lg:border-r-0 max-lg:border-b">
        <div class="flex items-center gap-3 border-b border-mjt-line pb-5">
          <div class="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 font-black text-slate-950">M</div>
          <div><strong>MJT Panel</strong><p class="text-xs text-mjt-muted">web 0.0.5</p></div>
        </div>
        <nav class="mt-5 grid gap-2 max-lg:grid-cols-3 max-sm:grid-cols-2">
          ${pages.map((page) => `<button class="rounded-2xl px-4 py-3 text-left text-sm font-black ${page === state.currentPage ? 'bg-mjt-soft text-white' : 'text-mjt-muted hover:bg-mjt-soft hover:text-white'}" data-page="${page}">${page[0].toUpperCase() + page.slice(1)}</button>`).join('')}
        </nav>
        <div class="mt-auto grid gap-3 pt-5">
          <div class="flex items-center gap-2 text-sm text-mjt-muted"><span class="h-2.5 w-2.5 rounded-full ${state.demo ? 'bg-green-400' : 'bg-cyan-400'}"></span>${state.demo ? 'Demo mode' : 'API mode'}</div>
          <button id="logoutBtn" class="rounded-2xl bg-red-500 px-4 py-3 font-black text-white">Logout</button>
        </div>
      </aside>
      <main class="overflow-auto p-6 max-sm:p-4">
        <header class="mb-5 flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
          <div><h2 class="text-3xl font-black">${title}</h2><p class="mt-1 text-mjt-muted">${subtitle}</p></div>
          <div class="flex gap-3 max-sm:flex-col">
            <select id="profileSelect" class="min-w-56 rounded-2xl border border-mjt-line bg-slate-950 px-4 py-3 outline-none">${profileOptions()}</select>
            <button id="refreshBtn" class="rounded-2xl border border-mjt-line px-4 py-3 font-black">Refresh</button>
          </div>
        </header>
        ${contentHtml}
      </main>
    </section>
  `;
}

function profileOptions() {
  if (!state.profiles.length) return '<option value="">No profiles</option>';
  return state.profiles.map((p) => `<option value="${p.name}" ${p.name === state.selectedProfile ? 'selected' : ''}>${p.name}${p.running ? ' • running' : ''}</option>`).join('');
}
