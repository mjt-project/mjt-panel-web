import { state } from '../../app/state.js';
import { escapeHtml } from '../../utils/escape.js';

export function FileManagerView() {
  return `
    <section class="grid grid-cols-[1fr_420px] gap-4 max-xl:grid-cols-1">
      <article class="rounded-3xl border border-mjt-line bg-mjt-card/80 p-5">
        <div class="mb-4 flex items-center justify-between gap-3 max-md:flex-col max-md:items-stretch">
          <div><h3 class="text-xl font-black">File Manager</h3><p class="text-sm text-mjt-muted">Profile: ${state.selectedProfile || 'none'} • Path: ${escapeHtml(state.filePath)}</p></div>
          <div class="flex flex-wrap gap-2"><button id="filesUpBtn" class="file-btn">Up</button><button id="filesRefreshBtn" class="file-btn">Refresh</button><button id="newFileBtn" class="file-btn">New file</button><button id="newFolderBtn" class="file-btn">New folder</button></div>
        </div>
        <div id="breadcrumb" class="mb-3 flex flex-wrap gap-2 text-sm text-cyan-300"></div>
        <div class="overflow-hidden rounded-2xl border border-mjt-line">
          <div class="grid grid-cols-[1fr_110px_150px_120px] gap-2 bg-slate-950/80 px-4 py-3 text-xs font-black uppercase tracking-widest text-mjt-muted max-md:hidden"><span>Name</span><span>Size</span><span>Modified</span><span>Actions</span></div>
          <div id="fileRows" class="divide-y divide-mjt-line"></div>
        </div>
      </article>
      <article class="rounded-3xl border border-mjt-line bg-mjt-card/80 p-5">
        <div class="mb-4 flex items-center justify-between gap-3"><div><h3 class="text-xl font-black">Editor</h3><p id="editorFileName" class="text-sm text-mjt-muted">No file selected</p></div><button id="saveFileBtn" class="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950">Save</button></div>
        <textarea id="fileEditor" class="min-h-[520px] w-full resize-y rounded-2xl border border-mjt-line bg-slate-950 p-4 font-mono text-sm text-green-100 outline-none focus:border-cyan-400" placeholder="Select a text file to edit..."></textarea>
      </article>
    </section>
  `;
}

export function renderFileRows() {
  const rows = document.getElementById('fileRows');
  if (!rows) return;
  if (!state.files.length) {
    rows.innerHTML = '<div class="p-5 text-mjt-muted">Empty folder or API not ready.</div>';
    return;
  }
  rows.innerHTML = state.files.map((item) => `
    <div class="grid grid-cols-[1fr_110px_150px_120px] items-center gap-2 px-4 py-3 text-sm hover:bg-slate-950/40 max-md:grid-cols-1" data-file-path="${escapeHtml(item.path)}" data-file-type="${escapeHtml(item.type)}">
      <button class="text-left font-black ${item.type === 'dir' ? 'text-cyan-300' : 'text-white'}" data-file-open="${escapeHtml(item.path)}" data-file-type="${escapeHtml(item.type)}">${item.type === 'dir' ? '📁' : '📄'} ${escapeHtml(item.name)}</button>
      <span class="text-mjt-muted">${formatSize(item.size)}</span>
      <span class="text-mjt-muted">${escapeHtml(item.modified || '')}</span>
      <div class="flex gap-2"><button class="rounded-xl border border-mjt-line px-2 py-1 text-xs" data-file-download="${escapeHtml(item.path)}">Down</button><button class="rounded-xl border border-red-500/40 px-2 py-1 text-xs text-red-300" data-file-delete="${escapeHtml(item.path)}">Del</button></div>
    </div>
  `).join('');
}

export function renderBreadcrumb() {
  const el = document.getElementById('breadcrumb');
  if (!el) return;
  const parts = state.filePath.split('/').filter(Boolean);
  let current = '';
  const buttons = [`<button class="rounded-full border border-mjt-line px-3 py-1" data-breadcrumb="/">root</button>`];
  for (const part of parts) {
    current += '/' + part;
    buttons.push(`<button class="rounded-full border border-mjt-line px-3 py-1" data-breadcrumb="${escapeHtml(current)}">${escapeHtml(part)}</button>`);
  }
  el.innerHTML = buttons.join('');
}

function formatSize(size) {
  const n = Number(size || 0);
  if (n <= 0) return '-';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
