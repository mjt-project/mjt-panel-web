import { state, selectedProfile } from '../../app/state.js';
import { serverCard } from '../../ui/serverCard.js';

export function DashboardView() {
  const profile = selectedProfile();
  const running = state.profiles.filter((item) => item.running).length;
  return `
    <section class="space-y-6">
      <div class="rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-400 p-6 text-white shadow-soft">
        <span class="text-xs font-black uppercase tracking-widest text-blue-100">Selected profile</span>
        <div class="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><h3 class="text-5xl font-black">${state.selectedProfile || 'none'}</h3><p class="mt-2 text-blue-50">${profile ? `${profile.type || 'minecraft'} • ${profile.workdir || 'unknown workdir'}` : 'No profile selected.'}</p></div>
          <div class="grid gap-2 sm:grid-cols-3 lg:min-w-96">
            <button class="rounded-2xl bg-white px-4 py-3 font-black text-green-700" data-action="start" data-profile="${state.selectedProfile}">Start</button>
            <button class="rounded-2xl bg-white/90 px-4 py-3 font-black text-amber-700" data-action="stop" data-profile="${state.selectedProfile}">Stop</button>
            <button class="rounded-2xl bg-slate-900 px-4 py-3 font-black text-white" data-go="console">Console</button>
          </div>
        </div>
      </div>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        ${stat('Core', state.status?.version || 'unknown', 'MJT Java core')}
        ${stat('Running', running, 'active profiles')}
        ${stat('Profiles', state.profiles.length, 'configured servers')}
        ${stat('Mode', state.demo ? 'Demo' : 'API', 'connection mode')}
      </div>
      <div class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article class="rounded-3xl border border-mjt-border bg-white p-6 shadow-sm">
          <h3 class="text-xl font-black">First-run checklist</h3>
          <div class="mt-4 grid gap-3">
            ${check('Login token accepted', true)}
            ${check('At least one profile configured', state.profiles.length > 0)}
            ${check('Installer ready', true)}
            ${check('Console selected', !!state.selectedProfile)}
          </div>
        </article>
        <article class="rounded-3xl border border-mjt-border bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-center justify-between"><h3 class="text-xl font-black">Server overview</h3><button class="rounded-xl border border-mjt-border px-3 py-2 text-xs font-black" data-go="servers">Manage</button></div>
          <div class="grid gap-3">${state.profiles.length ? state.profiles.map((p) => serverCard(p, p.name === state.selectedProfile)).join('') : '<p class="text-slate-500">No profiles yet.</p>'}</div>
        </article>
      </div>
    </section>`;
}
function stat(label, value, hint) { return `<div class="rounded-3xl border border-mjt-border bg-white p-6 shadow-sm"><span class="text-xs font-black uppercase tracking-widest text-slate-400">${label}</span><strong class="mt-3 block text-2xl font-black text-slate-900">${value}</strong><small class="text-slate-500">${hint}</small></div>`; }
function check(text, done) { return `<div class="flex items-center gap-3 rounded-2xl border border-mjt-border bg-slate-50 px-4 py-3 text-sm font-bold"><span class="h-3 w-3 rounded-full ${done ? 'bg-green-500' : 'bg-slate-300'}"></span>${text}</div>`; }
