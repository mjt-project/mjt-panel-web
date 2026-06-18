import { state } from './state.js';
import { pageMeta } from './router.js';
import { api } from '../services/apiClient.js';
import { clearToken } from '../services/storage.js';
import { toast } from '../ui/toast.js';
import { AuthView } from '../features/auth/AuthView.js';
import { bindAuthEvents } from '../features/auth/AuthController.js';
import { LayoutView } from '../features/layout/LayoutView.js';
import { DashboardView } from '../features/dashboard/DashboardView.js';
import { ServersView } from '../features/servers/ServersView.js';
import { InstallerView } from '../features/installer/InstallerView.js';
import { ConsoleView } from '../features/console/ConsoleView.js';
import { FileManagerView } from '../features/files/FileManagerView.js';
import { loadFiles, bindFileEvents } from '../features/files/FileManagerController.js';
import { PlaceholderView } from '../features/placeholder/PlaceholderView.js';

export function createApp(root) {
  let fileEntries = [];
  let fileError = '';

  async function boot() {
    renderAuth();
    if (state.token) {
      try { await api(`/auth/check?token=${encodeURIComponent(state.token)}`); await openPanel(); }
      catch { const m = document.getElementById('loginMessage'); if (m) m.textContent = 'Stored token is invalid. Please sign in again.'; }
    }
  }

  function renderAuth() { root.innerHTML = AuthView({ apiBase: state.apiBase, token: state.token }); bindAuthEvents({ openPanel }); }
  async function openPanel() { await refreshAll(); await renderPanel(); startLogPolling(); }
  async function refreshAll() {
    try {
      const [status, minecraft] = await Promise.all([api('/status'), api('/minecraft/status').catch(() => api('/minecraft/profiles'))]);
      state.status = status;
      state.profiles = Array.isArray(minecraft) ? minecraft : (minecraft.profiles || []);
      state.selectedProfile = state.selectedProfile || status.activeProfile || state.profiles[0]?.name || '';
    } catch (error) { toast(`Refresh failed: ${error.message}`, true); }
  }

  async function renderPanel() {
    if (state.currentPage === 'files') {
      const result = await loadFiles();
      fileEntries = result.entries;
      fileError = result.error;
    }
    root.innerHTML = LayoutView(currentPageHtml());
    bindPanelEvents();
    if (state.currentPage === 'console') loadLogs();
  }

  function currentPageHtml() {
    if (state.currentPage === 'dashboard') return DashboardView();
    if (state.currentPage === 'servers') return ServersView();
    if (state.currentPage === 'installer') return InstallerView();
    if (state.currentPage === 'console') return ConsoleView();
    if (state.currentPage === 'files') return FileManagerView(fileEntries, fileError);
    return PlaceholderView();
  }

  function bindPanelEvents() {
    document.getElementById('logoutBtn').onclick = logout;
    document.getElementById('refreshBtn').onclick = async () => { await refreshAll(); await renderPanel(); };
    document.querySelectorAll('[data-page]').forEach((button) => button.onclick = async () => { state.currentPage = button.dataset.page; await renderPanel(); });
    document.querySelectorAll('[data-go]').forEach((button) => button.onclick = async () => { state.currentPage = button.dataset.go; await renderPanel(); });
    const profileSelect = document.getElementById('profileSelect');
    if (profileSelect) profileSelect.onchange = async () => { state.selectedProfile = profileSelect.value; await renderPanel(); };
    document.querySelectorAll('[data-select-profile]').forEach((card) => card.onclick = async (event) => { if (event.target.tagName === 'BUTTON') return; state.selectedProfile = card.dataset.selectProfile; await renderPanel(); });
    document.querySelectorAll('[data-action]').forEach((button) => button.onclick = async () => { const action = button.dataset.action; const profile = button.dataset.profile || state.selectedProfile; if (action === 'console') { state.selectedProfile = profile; state.currentPage = 'console'; await renderPanel(); return; } await serverAction(action, profile); });
    bindInstallerEvents(); bindConsoleEvents(); if (state.currentPage === 'files') bindFileEvents({ renderPanel });
  }

  function bindInstallerEvents() { const b = document.getElementById('installBtn'); if (!b) return; b.onclick = installServer; document.querySelectorAll('[data-recipe]').forEach((x) => x.onclick = () => applyRecipe(x.dataset.recipe)); }
  function bindConsoleEvents() { const b = document.getElementById('sendCommandBtn'); if (!b) return; b.onclick = sendCommand; document.getElementById('commandInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendCommand(); }); document.getElementById('pauseLogsBtn').onclick = async () => { state.logsPaused = !state.logsPaused; await renderPanel(); }; document.getElementById('clearConsoleBtn').onclick = () => { document.getElementById('consoleOutput').textContent = ''; }; document.querySelectorAll('[data-history-command]').forEach((x) => x.onclick = () => { document.getElementById('commandInput').value = x.dataset.historyCommand; }); }

  async function serverAction(action, profile) { if (!profile) return toast('Select a profile first.', true); try { await api(`/minecraft/${action}`, { method:'POST', body: JSON.stringify({ profile }) }); toast(`${action} sent to ${profile}`); await refreshAll(); await renderPanel(); } catch(error) { toast(`${action} failed: ${error.message}`, true); } }
  async function installServer() {
    const payload = { provider: val('installProvider'), profile: val('installProfile'), version: val('installVersion') || 'latest', build: val('installBuild') || 'latest', port: Number(val('installPort') || 25565), memory: val('installMemory') || '1G', acceptEula: document.getElementById('installEula').checked, force: document.getElementById('installForce').checked };
    if (!payload.profile) return toast('Profile name is required.', true);
    if ((payload.provider === 'paper' || payload.provider === 'purpur') && !payload.acceptEula) return toast('Paper/Purpur requires EULA acceptance.', true);
    const out = document.getElementById('installOutput'); out.textContent = `Installing ${payload.provider} profile "${payload.profile}"...`;
    try { const result = await api('/minecraft/install', { method:'POST', body: JSON.stringify(payload) }); out.textContent += `
Done.
${JSON.stringify(result, null, 2)}`; toast(`Installed ${payload.profile}`); state.selectedProfile = payload.profile; await refreshAll(); await renderPanel(); } catch(error) { out.textContent += `
Failed: ${error.message}`; toast(`Install failed: ${error.message}`, true); }
  }
  function applyRecipe(name) { const r = { velocity:['velocity','velocity',25565,'512M',false], paper:['paper','smp',25566,'1G',true], purpur:['purpur','lobby',25567,'1G',true] }[name]; if (!r) return; document.getElementById('installProvider').value = r[0]; document.getElementById('installProfile').value = r[1]; document.getElementById('installVersion').value = 'latest'; document.getElementById('installBuild').value = 'latest'; document.getElementById('installPort').value = r[2]; document.getElementById('installMemory').value = r[3]; document.getElementById('installEula').checked = r[4]; }
  function val(id) { return document.getElementById(id).value.trim(); }
  async function sendCommand() { const input = document.getElementById('commandInput'); const command = input.value.trim(); if (!command) return; if (!state.selectedProfile) return toast('Select a profile first.', true); try { await api('/minecraft/send', { method:'POST', body: JSON.stringify({ profile: state.selectedProfile, command }) }); input.value = ''; state.commandHistory = [command, ...state.commandHistory.filter((x) => x !== command)].slice(0, 8); toast(`Command sent to ${state.selectedProfile}`); await loadLogs(); } catch(error) { toast(`Command failed: ${error.message}`, true); } }
  async function loadLogs() { if (state.logsPaused || !state.selectedProfile) return; const out = document.getElementById('consoleOutput'); if (!out) return; try { const result = await api(`/minecraft/logs?profile=${encodeURIComponent(state.selectedProfile)}`); out.textContent = (result.lines || []).join('\n'); out.scrollTop = out.scrollHeight; } catch(error) { out.textContent = `Cannot load logs: ${error.message}`; } }
  function startLogPolling() { stopLogPolling(); loadLogs(); state.logsTimer = setInterval(loadLogs, 1800); }
  function stopLogPolling() { if (state.logsTimer) clearInterval(state.logsTimer); state.logsTimer = null; }
  function logout() { clearToken(); state.token = ''; state.demo = false; stopLogPolling(); renderAuth(); }
  return { boot };
}
