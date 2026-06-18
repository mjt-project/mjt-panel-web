import { state } from '../../app/state.js';
import { api } from '../../services/apiClient.js';
import { toast } from '../../ui/toast.js';
import { renderBreadcrumb, renderFileRows } from './FileManagerView.js';

export async function loadFiles(path = state.filePath || '/') {
  if (!state.selectedProfile) return toast('Select a profile first.', true);
  state.filePath = normalizePath(path);
  try {
    const result = await api(`/files/list?profile=${encodeURIComponent(state.selectedProfile)}&path=${encodeURIComponent(state.filePath)}`);
    state.files = result.files || [];
    renderBreadcrumb();
    renderFileRows();
    bindFileRows();
  } catch (error) {
    toast(`Load files failed: ${error.message}`, true);
  }
}

export function bindFileManagerEvents() {
  const refresh = document.getElementById('filesRefreshBtn');
  if (!refresh) return;
  refresh.onclick = () => loadFiles(state.filePath);
  document.getElementById('filesUpBtn').onclick = () => loadFiles(parentPath(state.filePath));
  document.getElementById('saveFileBtn').onclick = saveCurrentFile;
  document.getElementById('newFileBtn').onclick = createFile;
  document.getElementById('newFolderBtn').onclick = createFolder;
  loadFiles(state.filePath || '/');
}

function bindFileRows() {
  document.querySelectorAll('[data-file-open]').forEach((button) => {
    button.onclick = () => {
      const path = button.dataset.fileOpen;
      const type = button.dataset.fileType;
      if (type === 'dir') loadFiles(path);
      else readFile(path);
    };
  });
  document.querySelectorAll('[data-breadcrumb]').forEach((button) => button.onclick = () => loadFiles(button.dataset.breadcrumb));
  document.querySelectorAll('[data-file-delete]').forEach((button) => button.onclick = () => deletePath(button.dataset.fileDelete));
  document.querySelectorAll('[data-file-download]').forEach((button) => button.onclick = () => downloadPath(button.dataset.fileDownload));
}

async function readFile(path) {
  try {
    const result = await api(`/files/read?profile=${encodeURIComponent(state.selectedProfile)}&path=${encodeURIComponent(path)}`);
    state.selectedFile = path;
    state.fileContent = result.content || '';
    document.getElementById('editorFileName').textContent = path;
    document.getElementById('fileEditor').value = state.fileContent;
  } catch (error) {
    toast(`Read failed: ${error.message}`, true);
  }
}

async function saveCurrentFile() {
  if (!state.selectedFile) return toast('Select a file first.', true);
  try {
    await api('/files/write', { method: 'POST', body: JSON.stringify({ profile: state.selectedProfile, path: state.selectedFile, content: document.getElementById('fileEditor').value }) });
    toast(`Saved ${state.selectedFile}`);
  } catch (error) {
    toast(`Save failed: ${error.message}`, true);
  }
}

async function createFile() {
  const name = prompt('New file name');
  if (!name) return;
  const path = joinPath(state.filePath, name);
  try {
    await api('/files/create', { method: 'POST', body: JSON.stringify({ profile: state.selectedProfile, path, type: 'file' }) });
    toast(`Created ${name}`);
    await loadFiles(state.filePath);
  } catch (error) { toast(`Create failed: ${error.message}`, true); }
}

async function createFolder() {
  const name = prompt('New folder name');
  if (!name) return;
  const path = joinPath(state.filePath, name);
  try {
    await api('/files/mkdir', { method: 'POST', body: JSON.stringify({ profile: state.selectedProfile, path }) });
    toast(`Created folder ${name}`);
    await loadFiles(state.filePath);
  } catch (error) { toast(`Mkdir failed: ${error.message}`, true); }
}

async function deletePath(path) {
  if (!confirm(`Delete ${path}?`)) return;
  try {
    await api('/files/delete', { method: 'POST', body: JSON.stringify({ profile: state.selectedProfile, path }) });
    toast(`Deleted ${path}`);
    await loadFiles(state.filePath);
  } catch (error) { toast(`Delete failed: ${error.message}`, true); }
}

function downloadPath(path) {
  if (state.demo) return toast('Download disabled in demo mode.');
  location.href = `${state.apiBase}/files/download?profile=${encodeURIComponent(state.selectedProfile)}&path=${encodeURIComponent(path)}&token=${encodeURIComponent(state.token)}`;
}

function normalizePath(path) {
  if (!path || path === '.') return '/';
  let p = path.replaceAll('\\\\', '/');
  if (!p.startsWith('/')) p = '/' + p;
  return p.replace(/\/+/g, '/');
}
function parentPath(path) {
  const clean = normalizePath(path);
  if (clean === '/') return '/';
  const parts = clean.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
}
function joinPath(base, name) {
  return normalizePath(`${base}/${name}`);
}
