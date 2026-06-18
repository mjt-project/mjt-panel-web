export function ConsoleView({ profile, lines, paused, history }) {
  return `
    <section class="console-layout">
      <article class="surface-card console-card">
        <div class="section-heading"><div><span class="eyebrow">${profile ? escapeHtml(profile.name) : 'No profile'}</span><h2>Console</h2><p>${paused ? 'Log polling paused.' : 'Live log polling every 1.8 seconds.'}</p></div><div class="inline-actions"><button id="logs-pause-button" class="button button-secondary">${paused ? 'Resume logs' : 'Pause logs'}</button><button id="logs-clear-button" class="button button-ghost">Clear view</button></div></div>
        <pre id="console-output" class="console-output">${escapeHtml(lines.join('\n') || 'Select a profile to load console output.')}</pre>
        <form id="console-form" class="console-form"><input id="console-command" class="field-control mono" placeholder="Type a command, e.g. list" autocomplete="off" /><button class="button button-primary" type="submit">Send</button></form>
        ${history.length ? `<div class="command-history">${history.map((item) => `<button class="history-chip" data-command-history="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join('')}</div>` : ''}
      </article>
      <aside class="surface-card console-side"><span class="eyebrow">Tip</span><h3>Use safe commands first</h3><p>Try <code>list</code>, <code>say Hello</code> or <code>help</code> before using destructive commands.</p></aside>
    </section>`;
}
function escapeHtml(value) { return String(value || '').replace(/[&"<>']/g, (char) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[char]); }
