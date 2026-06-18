import { createApp } from './app/App.js';

const root = document.getElementById('app');

try {
  createApp(root).boot();
} catch (error) {
  console.error('[MJT Panel] Bootstrap error', error);
  root.innerHTML = `
    <main class="fatal-shell">
      <section class="fatal-card">
        <span class="eyebrow">MJT Panel</span>
        <h1>Panel could not start</h1>
        <p>The frontend loaded, but a JavaScript module failed before rendering.</p>
        <pre>${String(error?.message || error)}</pre>
        <button class="button button-primary" onclick="location.reload()">Reload panel</button>
      </section>
    </main>`;
}
