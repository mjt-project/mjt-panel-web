import { state } from "../../app/state.js";
import { serverCard } from "../../ui/serverCard.js";
export function ServersView() { return `<section class="card card-pad"><div class="card-head"><h3 class="text-xl font-black">Server profiles</h3><button class="btn btn-primary btn-sm" data-go="installer">Install new</button></div><div class="server-grid">${state.profiles.map((p) => serverCard(p, p.name === state.selectedProfile, true)).join("") || `<div class="empty">No profiles yet.</div>`}</div></section>`; }
