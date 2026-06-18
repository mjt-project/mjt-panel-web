import { state } from '../../app/state.js';
import { api } from '../../services/apiClient.js';
import { toast } from '../../ui/toast.js';

export async function loadFiles() {
  if (!state.selectedProfile) return { entries: [], error: 'Select a profile first.' };
  try {
    const result = await api(`/files/list?profile=${encodeURIComponent(state.selectedProfile)}&path=${encodeURIComponent(state.filePath || '/')}`);
    return { entries: result.entries || [], error: '' };
  } catch (error) {
    return { entries: [], error: `Load files failed: ${error.message}` };
  }
}

export function bindFileEvents({ renderPanel }) {
  document.querySelectorAll('[data-file-action]').forEach((button) => {
    button.onclick = async () => {
      const action = button.dataset.fileAction;
      if (action === 'up') goUp();
      if (action === 'refresh') await renderPanel();
      if (action === 'new-file') await createFile();
      if (action === 'new-folder') await createFolder();
    };
  });

  document.querySelectorAll('[data-file-open]').forEach((button) => {
    button.onclick = async () => {
      const name = button.dataset.fileOpen;
      const type = button.dataset.fileType;
      if (type === 'dir') {
        state.filePath = joinPath(state.filePath, name);
        await renderPanel();
      } else {
        await readFile(joinPath(state.filePath, name));
        await renderPanel();
      }
    };
  });

  document.querySelectorAll('[data-file-delete]').forEach((button) => {
    button.onclick = async () => {
      await deletePath(joinPath(state.filePath, button.dataset.fileDelete));
      await renderPanel();
    };
  });

  const saveBtn = document.getElementById('saveFileBtn');
  if (saveBtn) saveBtn.onclick = saveFile;
}

function joinPath(base, name) {
  const clean = (base || '/').replace(/\/$/, '');
  return `${clean}/${name}`.replace(/^\/\//, '/');
}
function goUp() {
  const parts = (state.filePath || '/').split('/').filter(Boolean);
  parts.pop();
  state.filePath = '/' + parts.join('/');
  if (state.filePath !== '/') state.filePath = state.filePath.replace(/\/$/, '');
}
async function readFile(path) {
  const result = await api(`/files/read?profile=${encodeURIComponent(state.selectedProfile)}&path=${encodeURIComponent(path)}`);
  state.selectedFile = path;
  state.fileContent = result.content || '';
}
async function saveFile() {
  if (!state.selectedFile) return toast('Select a file first.', true);
  const content = document.getElementById('fileEditor').value;
  await api('/files/write', { method: 'POST', body: JSON.stringify({ profile: state.selectedProfile, path: state.selectedFile, content }) });
  toast('File saved.');
}
async function createFile() {
  const name = prompt('New file name');
  if (!name) return;
  await api('/files/create', { method: 'POST', body: JSON.stringify({ profile: state.selectedProfile, path: joinPath(state.filePath, name), type: 'file' }) });
  toast('File created.');
}
async function createFolder() {
  const name = prompt('New folder name');
  if (!name) return;
  await api('/files/mkdir', { method: 'POST', body: JSON.stringify({ profile: state.selectedProfile, path: joinPath(state.filePath, name) }) });
  toast('Folder created.');
}
async function deletePath(path) {
  if (!confirm(`Delete ${path}?`)) return;
  await api('/files/delete', { method: 'POST', body: JSON.stringify({ profile: state.selectedProfile, path }) });
  toast('Deleted.');
}
