import { escapeHtml } from "../utils/escape.js";

export function serverCard(profile, selected = false, full = false) {
  return `<div class="server-card ${selected ? "selected" : ""}" data-select-profile="${escapeHtml(profile.name)}">
    <div class="flex items-start justify-between gap-3">
      <div><h3 class="text-lg font-extrabold text-slate-900">${escapeHtml(profile.name)}</h3>
      <p class="text-sm text-slate-500 mt-1">${escapeHtml(profile.type || "minecraft")} · port ${escapeHtml(profile.port || "")}</p></div>
      <span class="badge ${profile.running ? "running" : "stopped"}">${profile.running ? "Running" : "Stopped"}</span>
    </div>
    ${full ? `<p class="text-xs text-slate-500 break-all mt-3">${escapeHtml(profile.workdir || "")}</p>` : ""}
    <div class="flex flex-wrap gap-2 mt-4">
      <button class="btn btn-success btn-sm" data-action="start" data-profile="${escapeHtml(profile.name)}">Start</button>
      <button class="btn btn-warning btn-sm" data-action="stop" data-profile="${escapeHtml(profile.name)}">Stop</button>
      <button class="btn btn-danger btn-sm" data-action="kill" data-profile="${escapeHtml(profile.name)}">Kill</button>
      <button class="btn btn-soft btn-sm" data-action="console" data-profile="${escapeHtml(profile.name)}">Console</button>
    </div>
  </div>`;
}
