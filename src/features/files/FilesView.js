export function FilesView({ profile, fileState }) {
  return `
    <section class="files-layout">
      <article class="surface-card">
        <div class="section-heading"><div><span class="eyebrow">${profile ? escapeHtml(profile.name) : 'No profile selected'}</span><h2>File Manager</h2><p>Files are loaded only when you ask for them.</p></div><div class="inline-actions"><button id="files-connect-button" class="button button-primary">${fileState.loaded ? 'Reload files' : 'Load files'}</button><button id="files-refresh-button" class="button button-secondary">Refresh</button></div></div>
        ${fileBody(profile, fileState)}
      </article>
      <aside class="surface-card files-help"><span class="eyebrow">Safety</span><h3>Profile-scoped files</h3><p>The MJT core should only expose the selected profile workdir. It should reject paths that escape through <code>../</code> or symlinks.</p></aside>
    </section>`;
}

function fileBody(profile, fileState) {
  if (!profile) return '<div class="empty-inline">Select a profile first, then load its files.</div>';
  if (fileState.loading) return '<div class="loading-state">Loading files…</div>';
  if (fileState.error) return `<div class="error-state">File API unavailable: ${escapeHtml(fileState.error)}</div>`;
  if (!fileState.loaded) return '<div class="empty-inline">The file API has not been called yet. Click “Load files” when the backend endpoint is ready.</div>';
  if (!fileState.items.length) return '<div class="empty-inline">This folder is empty.</div>';
  return `<div class="file-table">${fileState.items.map((item) => `<div class="file-row"><span class="file-icon">${item.type === 'directory' ? '▸' : '•'}</span><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.size || '—')}</span></div>`).join('')}</div>`;
}
function escapeHtml(value) { return String(value || '').replace(/[&"<>']/g, (char) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[char]); }
