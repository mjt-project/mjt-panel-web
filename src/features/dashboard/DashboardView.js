import { state, selectedProfile } from "../../app/state.js";
import { serverCard } from "../../ui/serverCard.js";

export function DashboardView() {
  const profile = selectedProfile();
  const running = state.profiles.filter((item) => item.running).length;
  return `
    <section class="page active">
      <div class="hero"><div><span class="eyebrow">Selected profile</span><h3>${state.selectedProfile || "none"}</h3><p>${profile ? `${profile.type || "minecraft"} • ${profile.workdir || "unknown workdir"}` : "No profile selected."}</p></div><div class="hero-actions"><button class="btn success" data-action="start" data-profile="${state.selectedProfile}">Start</button><button class="btn warn" data-action="stop" data-profile="${state.selectedProfile}">Stop</button><button class="btn primary" data-go="console">Open console</button></div></div>
      <div class="stats-grid"><div class="stat-card"><span>Core</span><strong>${state.status?.version || "unknown"}</strong><small>MJT Java core</small></div><div class="stat-card"><span>Running</span><strong>${running}</strong><small>active process profiles</small></div><div class="stat-card"><span>Profiles</span><strong>${state.profiles.length}</strong><small>configured servers</small></div><div class="stat-card"><span>Mode</span><strong>${state.demo ? "Demo" : "API"}</strong><small>connection mode</small></div></div>
      <div class="layout-2"><article class="card"><div class="card-head"><h3>First-run checklist</h3></div><div class="checklist"><div class="check-item done"><span></span>Login token accepted</div><div class="check-item ${state.profiles.length ? "done" : ""}"><span></span>At least one profile configured</div><div class="check-item done"><span></span>Installer ready for Velocity/Paper/Purpur</div><div class="check-item ${state.selectedProfile ? "done" : ""}"><span></span>Console selected</div></div></article><article class="card"><div class="card-head"><h3>Server overview</h3><button class="btn subtle small-btn" data-go="servers">Manage</button></div><div class="server-list">${state.profiles.length ? state.profiles.map((p) => serverCard(p, p.name === state.selectedProfile)).join("") : emptyProfiles()}</div></article></div>
    </section>`;
}
function emptyProfiles() { return `<div class="empty"><p>No profiles yet. Open Installer to create Velocity, Paper or Purpur.</p></div>`; }
