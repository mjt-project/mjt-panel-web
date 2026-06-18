import { state } from "../../app/state.js";
import { serverCard } from "../../ui/serverCard.js";

export function ServersView() {
  return `<section class="page active"><div class="card"><div class="card-head"><h3>Server profiles</h3><button class="btn primary small-btn" data-go="installer">Install new</button></div><div class="servers-grid">${state.profiles.length ? state.profiles.map((p) => serverCard(p, p.name === state.selectedProfile, true)).join("") : `<div class="empty"><p>No profiles yet. Open Installer to create Velocity, Paper or Purpur.</p></div>`}</div></div></section>`;
}
