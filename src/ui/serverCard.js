import { escapeHtml } from '../utils/escape.js';

export function serverCard(profile, selected = false, full = false) {
  return `
    <div class="rounded-2xl border ${selected ? 'border-cyan-400 ring-2 ring-cyan-400/20' : 'border-mjt-line'} bg-slate-950/70 p-4" data-select-profile="${escapeHtml(profile.name)}">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-lg font-black">${escapeHtml(profile.name)}</h3>
          <div class="mt-1 flex flex-wrap gap-2 text-xs text-mjt-muted">
            <span>${escapeHtml(profile.type || 'minecraft')}</span>
            <span>port ${escapeHtml(profile.port || '')}</span>
          </div>
        </div>
        <span class="rounded-full px-2 py-1 text-xs font-black ${profile.running ? 'bg-green-500/15 text-green-300' : 'bg-slate-500/15 text-slate-300'}">${profile.running ? 'Running' : 'Stopped'}</span>
      </div>
      ${full ? `<div class="mt-3 truncate text-xs text-mjt-muted">${escapeHtml(profile.workdir || '')}</div>` : ''}
      <div class="mt-4 flex flex-wrap gap-2">
        <button class="rounded-xl bg-green-500 px-3 py-2 text-xs font-black text-green-950" data-action="start" data-profile="${escapeHtml(profile.name)}">Start</button>
        <button class="rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-amber-950" data-action="stop" data-profile="${escapeHtml(profile.name)}">Stop</button>
        <button class="rounded-xl bg-red-500 px-3 py-2 text-xs font-black text-white" data-action="kill" data-profile="${escapeHtml(profile.name)}">Kill</button>
        <button class="rounded-xl border border-mjt-line px-3 py-2 text-xs font-black" data-action="console" data-profile="${escapeHtml(profile.name)}">Console</button>
      </div>
    </div>
  `;
}
