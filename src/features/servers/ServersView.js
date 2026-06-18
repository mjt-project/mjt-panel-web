export function ServersView({ profiles, selectedProfile }) {
  return `
    <section class="stack-lg">
      <div class="page-toolbar"><div><h2>Server profiles</h2><p>Each profile has its own workdir, process and console.</p></div><button class="button button-primary" data-page="installer">Install server</button></div>
      <div class="server-grid">
        ${profiles.length ? profiles.map((profile) => card(profile, profile.name === selectedProfile)).join('') : emptyState()}
      </div>
    </section>`;
}

function card(profile, selected) {
  return `<article class="server-card ${selected ? 'is-selected' : ''}">
    <header><div><div class="status-line"><i class="status-mini ${profile.running ? 'running' : ''}"></i><span>${profile.running ? 'Running' : 'Stopped'}</span></div><h3>${escapeHtml(profile.name)}</h3><p>${escapeHtml(profile.type || 'Minecraft')} · Port ${escapeHtml(profile.port || '—')}</p></div><button class="button button-icon" data-server-action="more" data-profile="${escapeHtml(profile.name)}" aria-label="More actions">•••</button></header>
    <div class="server-workdir">${escapeHtml(profile.workdir || 'No workdir reported')}</div>
    <footer><button class="button button-primary button-small" data-server-action="start" data-profile="${escapeHtml(profile.name)}">Start</button><button class="button button-secondary button-small" data-server-action="stop" data-profile="${escapeHtml(profile.name)}">Stop</button><button class="button button-text button-small" data-server-action="console" data-profile="${escapeHtml(profile.name)}">Open console</button><div id="server-menu-${escapeHtml(profile.name)}" class="action-menu hidden"><button class="menu-danger" data-server-action="kill" data-profile="${escapeHtml(profile.name)}">Kill process</button></div></footer>
  </article>`;
}
function emptyState() { return '<article class="empty-card"><h3>No profiles yet</h3><p>Create a Velocity, Paper or Purpur profile from Installer.</p><button class="button button-primary" data-page="installer">Go to installer</button></article>'; }
function escapeHtml(value) { return String(value || '').replace(/[&"<>']/g, (char) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[char]); }
