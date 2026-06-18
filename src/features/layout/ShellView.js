import { state } from '../../app/state.js';

const nav = [
  ['dashboard', 'Dashboard'],
  ['servers', 'Servers'],
  ['installer', 'Installer'],
  ['console', 'Console'],
  ['files', 'Files'],
  ['backups', 'Backups'],
  ['network', 'Network'],
  ['settings', 'Settings'],
  ['system', 'System']
];

export function ShellView({ pageMeta, body }) {
  const [title, description] = pageMeta[state.page] || pageMeta.dashboard;
  return `
    <div class="panel-shell">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-glyph brand-glyph-small">M</div>
          <div><strong>MJT Panel</strong><span>web 0.0.12</span></div>
        </div>

        <nav class="sidebar-nav" aria-label="Panel navigation">
          ${nav.map(([key, label]) => `<button class="nav-item ${state.page === key ? 'is-active' : ''}" data-page="${key}"><span class="nav-dot"></span>${label}</button>`).join('')}
        </nav>

        <div class="sidebar-status">
          <div class="api-state"><span id="api-status-dot" class="status-dot connected"></span><span id="api-status-text">${state.demo ? 'Mock mode' : 'API connected'}</span></div>
          <button id="logout-button" class="button button-ghost button-full">Sign out</button>
        </div>
      </aside>

      <main class="main-content">
        <header class="topbar">
          <div>
            <h1>${title}</h1>
            <p>${description}</p>
          </div>
          <div class="topbar-actions">
            <label class="sr-only" for="profile-select">Selected profile</label>
            <select id="profile-select" class="profile-select">
              ${profileOptions()}
            </select>
            <button id="refresh-button" class="icon-button" type="button" title="Refresh panel data">↻</button>
          </div>
        </header>
        <div data-page-enter>${body}</div>
      </main>
    </div>`;
}

function profileOptions() {
  if (!state.profiles.length) return '<option value="">No profiles</option>';
  return state.profiles.map((profile) => `<option value="${escapeHtml(profile.name)}" ${profile.name === state.selectedProfile ? 'selected' : ''}>${escapeHtml(profile.name)}${profile.running ? ' · running' : ''}</option>`).join('');
}

function escapeHtml(value) {
  return String(value || '').replace(/[&"<>']/g, (char) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[char]);
}
