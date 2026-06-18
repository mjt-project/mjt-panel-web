export function DashboardView({ profile, profiles, status }) {
  const running = profiles.filter((item) => item.running).length;
  return `
    <section class="stack-lg">
      <article class="context-card">
        <div class="context-copy">
          <span class="eyebrow">Selected server</span>
          <h2>${profile ? escapeHtml(profile.name) : 'No profile selected'}</h2>
          <p>${profile ? `${escapeHtml(profile.type || 'Minecraft')} · ${escapeHtml(profile.workdir || 'workdir unavailable')}` : 'Install a server or select an existing profile to begin.'}</p>
        </div>
        <div class="context-actions">
          <button class="button button-primary" data-server-action="start" data-profile="${escapeHtml(profile?.name || '')}">Start server</button>
          <button class="button button-secondary" data-server-action="stop" data-profile="${escapeHtml(profile?.name || '')}">Stop</button>
          <button class="button button-ghost" data-server-action="console" data-profile="${escapeHtml(profile?.name || '')}">Console</button>
        </div>
      </article>

      <section class="metric-grid">
        ${metric('Core', status?.version || 'Unknown', 'MJT Java core')}
        ${metric('Running', String(running), 'active server processes')}
        ${metric('Profiles', String(profiles.length), 'configured servers')}
        ${metric('Connection', status ? 'Online' : 'Checking', 'panel API status')}
      </section>

      <section class="content-grid">
        <article class="surface-card">
          <div class="section-heading"><div><h3>Getting started</h3><p>Keep the setup steps short and visible.</p></div></div>
          <ol class="setup-list">
            <li class="is-done"><span>1</span>Panel session verified</li>
            <li class="${profiles.length ? 'is-done' : ''}"><span>2</span>At least one profile configured</li>
            <li><span>3</span>Start a profile and open its console</li>
          </ol>
        </article>
        <article class="surface-card">
          <div class="section-heading"><div><h3>Profiles</h3><p>Choose one to continue working.</p></div><button class="button button-text" data-page="servers">View all</button></div>
          <div class="compact-profile-list">
            ${profiles.length ? profiles.map(profileRow).join('') : '<div class="empty-inline">No profiles installed yet.</div>'}
          </div>
        </article>
      </section>
    </section>`;
}

function metric(label, value, hint) { return `<article class="metric-card"><span>${label}</span><strong>${escapeHtml(value)}</strong><small>${hint}</small></article>`; }
function profileRow(profile) { return `<button class="compact-profile-row" data-select-profile="${escapeHtml(profile.name)}"><span class="profile-name"><i class="status-mini ${profile.running ? 'running' : ''}"></i>${escapeHtml(profile.name)}</span><span>${escapeHtml(profile.type || 'Minecraft')}</span></button>`; }
function escapeHtml(value) { return String(value || '').replace(/[&"<>']/g, (char) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[char]); }
