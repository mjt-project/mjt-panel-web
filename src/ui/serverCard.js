import { escapeAttr, escapeHtml } from "../utils/escape.js";

export function serverCard(profile, selected = false, full = false) {
  return `
    <div class="server-card ${selected ? "selected" : ""}" data-select-profile="${escapeAttr(profile.name)}">
      <div class="card-head no-margin">
        <div>
          <h3>${escapeHtml(profile.name)}</h3>
          <div class="server-meta"><span>${escapeHtml(profile.type || "minecraft")}</span><span>port ${escapeHtml(profile.port || "")}</span></div>
        </div>
        <span class="badge ${profile.running ? "running" : "stopped"}">${profile.running ? "Running" : "Stopped"}</span>
      </div>
      ${full ? `<div class="server-meta"><span>${escapeHtml(profile.workdir || "")}</span></div>` : ""}
      <div class="server-actions">
        <button class="btn success small-btn" data-action="start" data-profile="${escapeAttr(profile.name)}">Start</button>
        <button class="btn warn small-btn" data-action="stop" data-profile="${escapeAttr(profile.name)}">Stop</button>
        <button class="btn danger small-btn" data-action="kill" data-profile="${escapeAttr(profile.name)}">Kill</button>
        <button class="btn subtle small-btn" data-action="console" data-profile="${escapeAttr(profile.name)}">Console</button>
      </div>
    </div>`;
}
