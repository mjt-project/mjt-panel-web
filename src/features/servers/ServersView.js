import { state } from '../../app/state.js';
import { serverCard } from '../../ui/serverCard.js';
export function ServersView() {
  return `<section class="rounded-3xl border border-mjt-border bg-white p-6 shadow-sm"><div class="mb-5 flex items-center justify-between"><h3 class="text-xl font-black">Server profiles</h3><button class="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-black text-white" data-go="installer">Install new</button></div><div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">${state.profiles.length ? state.profiles.map((p) => serverCard(p, p.name === state.selectedProfile, true)).join('') : '<p class="text-slate-500">No profiles yet.</p>'}</div></section>`;
}
