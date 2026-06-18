import { pageMeta, pages } from '../../app/router.js';
import { state } from '../../app/state.js';

export function LayoutView(contentHtml) {
  const [title, subtitle] = pageMeta[state.currentPage] || pageMeta.dashboard;
  return `
    <section class="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside class="border-r border-mjt-border bg-white px-5 py-6 shadow-sm">
        <div class="flex items-center gap-3 border-b border-mjt-border pb-5">
          <div class="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 font-black text-white">M</div>
          <div>
            <strong class="block text-slate-900">MJT Panel</strong>
            <span class="text-xs font-semibold text-slate-500">web 0.0.6</span>
          </div>
        </div>
        <nav class="mt-6 grid gap-2">
          ${pages.map((page) => `<button class="mjt-nav ${page === state.currentPage ? 'active' : ''}" data-page="${page}">${page[0].toUpperCase()+page.slice(1)}</button>`).join('')}
        </nav>
        <div class="mt-8 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
          <div class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full ${state.demo ? 'bg-green-500' : 'bg-cyan-500'}"></span>${state.demo ? 'Demo mode' : 'API mode'}</div>
        </div>
        <button id="logoutBtn" class="mt-4 w-full rounded-2xl bg-red-500 px-4 py-3 font-black text-white">Logout</button>
      </aside>
      <main class="px-6 py-7 lg:px-8">
        <header class="mb-6 flex flex-col gap-4 rounded-3xl border border-mjt-border bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div><h2 class="text-3xl font-black text-slate-900">${title}</h2><p class="mt-1 text-sm text-slate-500">${subtitle}</p></div>
          <div class="flex flex-col gap-3 sm:flex-row">
            <select id="profileSelect" class="mjt-input min-w-56">${profileOptions()}</select>
            <button id="refreshBtn" class="rounded-2xl border border-mjt-border px-4 py-3 font-black text-slate-700">Refresh</button>
          </div>
        </header>
        ${contentHtml}
      </main>
    </section>`;
}

function profileOptions() {
  if (!state.profiles.length) return `<option value="">No profiles</option>`;
  return state.profiles.map((profile) => `<option value="${profile.name}" ${profile.name === state.selectedProfile ? 'selected' : ''}>${profile.name}${profile.running ? ' • running' : ''}</option>`).join('');
}
