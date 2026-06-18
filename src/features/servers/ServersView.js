import { state } from '../../app/state.js';
import { serverCard } from '../../ui/serverCard.js';

export function ServersView() {
  return `<section><div class="rounded-3xl border border-mjt-line bg-mjt-card/80 p-5"><div class="mb-4 flex items-center justify-between"><h3 class="text-xl font-black">Server profiles</h3><button class="rounded-2xl bg-cyan-400 px-4 py-3 font-black text-slate-950" data-go="installer">Install new</button></div><div class="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">${state.profiles.length ? state.profiles.map((p) => serverCard(p, p.name === state.selectedProfile, true)).join('') : '<p class="text-mjt-muted">No profiles yet.</p>'}</div></div></section>`;
}
