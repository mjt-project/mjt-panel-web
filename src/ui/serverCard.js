import { escapeAttr, escapeHtml } from '../utils/escape.js';

export function serverCard(profile, selected = false, full = false) {
  return `
    <div class="rounded-3xl border ${selected ? 'border-blue-500 ring-4 ring-blue-100' : 'border-mjt-border'} bg-white p-5 shadow-sm" data-select-profile="${escapeAttr(profile.name)}">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-black text-slate-900">${escapeHtml(profile.name)}</h3>
          <div class="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            <span>${escapeHtml(profile.type || 'minecraft')}</span>
            <span>port ${escapeHtml(profile.port || '')}</span>
          </div>
        </div>
        <span class="rounded-full px-3 py-1 text-xs font-black ${profile.running ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}">
          ${profile.running ? 'Running' : 'Stopped'}
        </span>
      </div>
      ${full ? `<p class="mt-3 truncate text-xs text-slate-500">${escapeHtml(profile.workdir || '')}</p>` : ''}
      <div class="mt-4 flex flex-wrap gap-2">
        <button class="rounded-xl bg-green-600 px-3 py-2 text-xs font-black text-white" data-action="start" data-profile="${escapeAttr(profile.name)}">Start</button>
        <button class="rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-white" data-action="stop" data-profile="${escapeAttr(profile.name)}">Stop</button>
        <button class="rounded-xl bg-red-500 px-3 py-2 text-xs font-black text-white" data-action="kill" data-profile="${escapeAttr(profile.name)}">Kill</button>
        <button class="rounded-xl border border-mjt-border px-3 py-2 text-xs font-black text-slate-700" data-action="console" data-profile="${escapeAttr(profile.name)}">Console</button>
      </div>
    </div>`;
}
