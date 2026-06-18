import { state, selectedProfile } from '../../app/state.js';
import { serverCard } from '../../ui/serverCard.js';

export function DashboardView() {
  const p = selectedProfile();
  const running = state.profiles.filter((x) => x.running).length;
  return `
    <section>
      <div class="mb-5 flex justify-between gap-5 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 to-indigo-500/10 p-6 shadow-2xl max-md:flex-col">
        <div><p class="text-xs font-black uppercase tracking-widest text-cyan-300">Selected profile</p><h3 class="mt-2 text-5xl font-black max-sm:text-3xl">${state.selectedProfile || 'none'}</h3><p class="mt-2 text-mjt-muted">${p ? `${p.type || 'minecraft'} • ${p.workdir || ''}` : 'Install or select a profile first.'}</p></div>
        <div class="grid min-w-44 content-center gap-3"><button class="rounded-2xl bg-green-500 px-4 py-3 font-black text-green-950" data-action="start" data-profile="${state.selectedProfile}">Start</button><button class="rounded-2xl bg-amber-500 px-4 py-3 font-black text-amber-950" data-action="stop" data-profile="${state.selectedProfile}">Stop</button><button class="rounded-2xl bg-cyan-400 px-4 py-3 font-black text-slate-950" data-go="console">Open console</button></div>
      </div>
      <div class="mb-5 grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        ${stat('Core', state.status?.version || 'unknown', 'MJT Java core')}
        ${stat('Running', running, 'active profiles')}
        ${stat('Profiles', state.profiles.length, 'configured servers')}
        ${stat('Mode', state.demo ? 'Demo' : 'API', 'connection mode')}
      </div>
      <div class="grid grid-cols-[.85fr_1.15fr] gap-4 max-xl:grid-cols-1">
        <article class="rounded-3xl border border-mjt-line bg-mjt-card/80 p-5"><h3 class="mb-4 text-xl font-black">First-run checklist</h3>${check('Login token accepted', true)}${check('At least one profile configured', state.profiles.length > 0)}${check('Installer ready', true)}${check('Console selected', !!state.selectedProfile)}</article>
        <article class="rounded-3xl border border-mjt-line bg-mjt-card/80 p-5"><div class="mb-4 flex items-center justify-between"><h3 class="text-xl font-black">Server overview</h3><button class="rounded-xl border border-mjt-line px-3 py-2 text-xs font-black" data-go="servers">Manage</button></div><div class="grid gap-3">${state.profiles.length ? state.profiles.map((profile) => serverCard(profile, profile.name === state.selectedProfile)).join('') : '<p class="text-mjt-muted">No profiles yet.</p>'}</div></article>
      </div>
    </section>
  `;
}

function stat(label, value, note) { return `<div class="rounded-3xl border border-mjt-line bg-mjt-card/80 p-5"><p class="text-xs font-black uppercase tracking-widest text-mjt-muted">${label}</p><strong class="mt-2 block text-2xl font-black">${value}</strong><small class="text-mjt-muted">${note}</small></div>`; }
function check(text, ok) { return `<div class="mb-3 flex items-center gap-3 rounded-2xl border border-mjt-line bg-slate-950/70 p-3 text-sm ${ok ? 'text-white' : 'text-mjt-muted'}"><span class="h-4 w-4 rounded-full ${ok ? 'bg-green-400' : 'border border-mjt-muted'}"></span>${text}</div>`; }
