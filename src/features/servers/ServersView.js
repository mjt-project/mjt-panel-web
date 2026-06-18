import { state } from '../../app/state.js';
import { serverCard } from './serverCard.js';
export function ServersView(){return `<div class="card"><div class="card-head"><h3>Server profiles</h3><button class="btn primary small" data-go="installer">Install new</button></div><div class="servers-grid">${state.profiles.map(p=>serverCard(p,p.name===state.selectedProfile,true)).join('')||'<p class="muted">No profiles yet.</p>'}</div></div>`}
