export function LoginView({ apiBase, token }) {
  return `
    <main class="login-shell">
      <section class="login-card" data-page-enter>
        <div class="brand-lockup">
          <div class="brand-glyph">M</div>
          <div>
            <span class="eyebrow">Mini Java Terminal</span>
            <h1>MJT Panel</h1>
          </div>
        </div>
        <p class="login-description">A focused workspace for your Minecraft profiles, console and installation flow.</p>

        <form id="login-form" class="form-stack" novalidate>
          <label class="field-label" for="api-base">API base</label>
          <input id="api-base" class="field-control" value="${escapeAttribute(apiBase)}" autocomplete="off" />

          <label class="field-label" for="panel-token">Panel token</label>
          <input id="panel-token" class="field-control" type="password" value="${escapeAttribute(token)}" placeholder="Paste token from .mjt panel token reset" />

          <div class="login-actions">
            <button class="button button-primary" type="submit">Sign in</button>
            <button class="button button-secondary" id="demo-button" type="button">Preview demo</button>
          </div>
        </form>

        <p id="login-message" class="form-hint"></p>
        <div class="login-footer">
          <span>Local UI development:</span><code>token: dev</code>
        </div>
      </section>
    </main>`;
}

export function bindLogin({ onSubmit, onDemo }) {
  document.getElementById('login-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit({
      apiBase: document.getElementById('api-base')?.value.trim() || '/api',
      token: document.getElementById('panel-token')?.value.trim() || ''
    });
  });
  document.getElementById('demo-button')?.addEventListener('click', onDemo);
}

function escapeAttribute(value) {
  return String(value || '').replace(/[&"<>']/g, (char) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[char]);
}
