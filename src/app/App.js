import { state, currentProfile } from './state.js';
import { api } from '../services/api.js';
import { clearToken, saveApiBase, saveToken } from '../services/storage.js';
import { toast } from '../ui/toast.js';
import { animateIn } from '../ui/motion.js';
import { LoginView, bindLogin } from '../features/auth/LoginView.js';
import { ShellView } from '../features/layout/ShellView.js';
import { DashboardView } from '../features/dashboard/DashboardView.js';
import { ServersView } from '../features/servers/ServersView.js';
import { InstallerView } from '../features/installer/InstallerView.js';
import { ConsoleView } from '../features/console/ConsoleView.js';
import { FilesView } from '../features/files/FilesView.js';
import { PlaceholderView } from '../features/placeholder/PlaceholderView.js';
import { isLocalDevToken } from '../features/auth/devMode.js';

const PAGE_META = {
  dashboard: ['Dashboard', 'A calm overview of the server profiles you manage.'],
  servers: ['Servers', 'Choose a profile and manage its lifecycle safely.'],
  installer: ['Installer', 'Create a Velocity, Paper or Purpur profile from one focused form.'],
  console: ['Console', 'Read output and send commands to the selected profile.'],
  files: ['Files', 'Browse profile files when the core file API is available.'],
  backups: ['Backups', 'Backup workflows will appear here when the API is enabled.'],
  network: ['Network', 'Public access, gateways and tunnels will appear here.'],
  settings: ['Settings', 'Panel preferences and profile defaults.'],
  system: ['System', 'Core details, releases and diagnostics.']
};

export function createApp(root) {
  function boot() {
    renderLogin();
    if (state.token) tryAutoLogin();
  }

  async function tryAutoLogin() {
    setLoginHint('Checking saved session…');
    try {
      if (isLocalDevToken(state.token)) {
        state.demo = true;
      } else {
        await api(`/auth/check?token=${encodeURIComponent(state.token)}`);
      }
      await openPanel();
    } catch {
      setLoginHint('Saved token could not be verified. Please sign in again.', true);
    }
  }

  function renderLogin() {
    root.innerHTML = LoginView({ apiBase: state.apiBase, token: state.token });
    bindLogin({ onSubmit: signIn, onDemo: openDemo });
    animateIn('.login-card');
  }

  function setLoginHint(message, danger = false) {
    const element = document.getElementById('login-message');
    if (!element) return;
    element.textContent = message || '';
    element.dataset.tone = danger ? 'danger' : 'neutral';
  }

  async function signIn({ apiBase, token }) {
    if (!token) return setLoginHint('Paste a panel token to continue.', true);

    state.apiBase = apiBase || '/api';
    state.token = token;
    state.demo = false;
    saveApiBase(state.apiBase);

    if (isLocalDevToken(token)) {
      state.demo = true;
      saveToken(token);
      setLoginHint('Local Mock Mode enabled.');
      await openPanel();
      return;
    }

    setLoginHint('Verifying token and API…');
    try {
      await api(`/auth/check?token=${encodeURIComponent(token)}`);
      saveToken(token);
      await openPanel();
    } catch (error) {
      setLoginHint(`Could not sign in: ${error.message}`, true);
    }
  }

  async function openDemo() {
    state.demo = true;
    state.token = 'demo';
    await openPanel();
  }

  async function openPanel() {
    await refreshData({ silent: true });
    renderShell();
    startLogPolling();
  }

  async function refreshData({ silent = false } = {}) {
    try {
      const [status, profilePayload] = await Promise.all([
        api('/status'),
        api('/minecraft/status').catch(() => api('/minecraft/profiles'))
      ]);

      state.status = status || {};
      state.profiles = Array.isArray(profilePayload) ? profilePayload : (profilePayload?.profiles || []);
      state.selectedProfile = state.selectedProfile || state.status.activeProfile || state.profiles[0]?.name || '';

      updateApiState('connected');
      return true;
    } catch (error) {
      updateApiState('error');
      if (!silent) toast(`Could not refresh panel data: ${error.message}`, 'danger');
      return false;
    }
  }

  function renderShell() {
    root.innerHTML = ShellView({ pageMeta: PAGE_META, body: pageBody() });
    bindShell();
    animateIn('[data-page-enter]');
  }

  function pageBody() {
    switch (state.page) {
      case 'dashboard': return DashboardView({ profile: currentProfile(), profiles: state.profiles, status: state.status });
      case 'servers': return ServersView({ profiles: state.profiles, selectedProfile: state.selectedProfile });
      case 'installer': return InstallerView();
      case 'console': return ConsoleView({ profile: currentProfile(), lines: state.consoleLines, paused: state.logsPaused, history: state.commandHistory });
      case 'files': return FilesView({ profile: currentProfile(), fileState: state.fileState });
      default: return PlaceholderView({ page: state.page, description: PAGE_META[state.page]?.[1] || '' });
    }
  }

  function bindShell() {
    document.querySelectorAll('[data-page]').forEach((button) => {
      button.addEventListener('click', () => {
        state.page = button.dataset.page;
        renderShell();
      });
    });

    document.querySelectorAll('[data-select-profile]').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedProfile = button.dataset.selectProfile;
        renderShell();
      });
    });

    document.getElementById('profile-select')?.addEventListener('change', (event) => {
      state.selectedProfile = event.target.value;
      renderShell();
    });

    document.getElementById('refresh-button')?.addEventListener('click', async () => {
      const success = await refreshData();
      if (success) {
        renderShell();
        toast('Panel data refreshed.', 'success');
      }
    });

    document.getElementById('logout-button')?.addEventListener('click', logout);

    bindServerActions();
    bindInstaller();
    bindConsole();
    bindFiles();
  }

  function bindServerActions() {
    document.querySelectorAll('[data-server-action]').forEach((button) => {
      button.addEventListener('click', async () => {
        const action = button.dataset.serverAction;
        const profile = button.dataset.profile || state.selectedProfile;
        if (action === 'console') {
          state.selectedProfile = profile;
          state.page = 'console';
          renderShell();
          return;
        }
        if (action === 'more') {
          const menu = document.getElementById(`server-menu-${profile}`);
          menu?.classList.toggle('hidden');
          return;
        }
        await serverAction(action, profile);
      });
    });
  }

  async function serverAction(action, profile) {
    if (!profile) return toast('Select a server profile first.', 'danger');
    try {
      await api(`/minecraft/${action}`, { method: 'POST', body: JSON.stringify({ profile }) });
      toast(`${capitalize(action)} request sent to ${profile}.`, action === 'kill' ? 'danger' : 'success');
      await refreshData({ silent: true });
      renderShell();
    } catch (error) {
      toast(`${capitalize(action)} failed: ${error.message}`, 'danger');
    }
  }

  function bindInstaller() {
    const form = document.getElementById('installer-form');
    if (!form) return;

    document.querySelectorAll('[data-recipe]').forEach((button) => {
      button.addEventListener('click', () => applyRecipe(button.dataset.recipe));
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const software = String(formData.get('software') || '').trim().toLowerCase();
      const payload = {
        software,
        provider: software,
        profile: String(formData.get('profile') || '').trim(),
        version: String(formData.get('version') || 'latest').trim(),
        build: String(formData.get('build') || 'latest').trim(),
        port: Number(formData.get('port') || 25565),
        memory: String(formData.get('memory') || '1G').trim(),
        acceptEula: formData.get('acceptEula') === 'on',
        force: formData.get('force') === 'on'
      };

      const output = document.getElementById('installer-output');
      if (!payload.profile) return setInstallerOutput('A profile name is required.', 'danger');
      if ((software === 'paper' || software === 'purpur') && !payload.acceptEula) {
        return setInstallerOutput('Paper and Purpur require EULA acceptance.', 'danger');
      }

      setInstallerOutput(`Creating ${software} profile “${payload.profile}”…`, 'loading');
      try {
        const result = await api('/minecraft/install', { method: 'POST', body: JSON.stringify(payload) });
        setInstallerOutput(result?.message || `Profile “${payload.profile}” was installed.`, 'success');
        state.selectedProfile = payload.profile;
        await refreshData({ silent: true });
        toast(`Installed ${payload.profile}.`, 'success');
      } catch (error) {
        setInstallerOutput(`Install failed: ${error.message}`, 'danger');
      }
    });
  }

  function applyRecipe(recipe) {
    const presets = {
      velocity: { software: 'velocity', profile: 'velocity', version: 'latest', build: 'latest', port: 25565, memory: '512M', acceptEula: false },
      paper: { software: 'paper', profile: 'smp', version: 'latest', build: 'latest', port: 25566, memory: '1G', acceptEula: true },
      purpur: { software: 'purpur', profile: 'lobby', version: 'latest', build: 'latest', port: 25567, memory: '1G', acceptEula: true }
    };
    const preset = presets[recipe];
    if (!preset) return;
    Object.entries(preset).forEach(([key, value]) => {
      const field = document.querySelector(`[name="${key}"]`);
      if (!field) return;
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else field.value = value;
    });
  }

  function setInstallerOutput(message, tone = 'neutral') {
    const output = document.getElementById('installer-output');
    if (!output) return;
    output.textContent = message;
    output.dataset.tone = tone;
  }

  function bindConsole() {
    const form = document.getElementById('console-form');
    if (!form) return;

    document.getElementById('logs-pause-button')?.addEventListener('click', () => {
      state.logsPaused = !state.logsPaused;
      renderShell();
    });

    document.getElementById('logs-clear-button')?.addEventListener('click', () => {
      state.consoleLines = [];
      renderShell();
    });

    document.querySelectorAll('[data-command-history]').forEach((button) => {
      button.addEventListener('click', () => {
        const input = document.getElementById('console-command');
        if (input) input.value = button.dataset.commandHistory;
      });
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = document.getElementById('console-command');
      const command = input?.value.trim();
      if (!command) return;
      if (!state.selectedProfile) return toast('Select a profile before sending a command.', 'danger');

      try {
        await api('/minecraft/send', { method: 'POST', body: JSON.stringify({ profile: state.selectedProfile, command }) });
        state.commandHistory = [command, ...state.commandHistory.filter((item) => item !== command)].slice(0, 8);
        input.value = '';
        toast('Command sent.', 'success');
        await loadLogs();
        renderShell();
      } catch (error) {
        toast(`Command failed: ${error.message}`, 'danger');
      }
    });
  }

  async function loadLogs() {
    if (state.logsPaused || !state.selectedProfile || state.page !== 'console') return;
    try {
      const result = await api(`/minecraft/logs?profile=${encodeURIComponent(state.selectedProfile)}`);
      state.consoleLines = result?.lines || [];
      const output = document.getElementById('console-output');
      if (output) {
        output.textContent = state.consoleLines.join('\n');
        output.scrollTop = output.scrollHeight;
      }
    } catch (error) {
      state.consoleLines = [`Unable to load logs: ${error.message}`];
    }
  }

  function startLogPolling() {
    stopLogPolling();
    state.logTimer = setInterval(loadLogs, 1800);
  }

  function stopLogPolling() {
    if (state.logTimer) clearInterval(state.logTimer);
    state.logTimer = null;
  }

  function bindFiles() {
    document.getElementById('files-connect-button')?.addEventListener('click', loadFiles);
    document.getElementById('files-refresh-button')?.addEventListener('click', loadFiles);
  }

  async function loadFiles() {
    if (!state.selectedProfile) return toast('Select a profile before opening files.', 'danger');
    state.fileState.loading = true;
    state.fileState.error = '';
    renderShell();
    try {
      const result = await api(`/files/list?profile=${encodeURIComponent(state.selectedProfile)}&path=${encodeURIComponent(state.fileState.path)}`);
      state.fileState.items = result?.items || [];
      state.fileState.loaded = true;
    } catch (error) {
      state.fileState.error = error.message;
      state.fileState.loaded = false;
    } finally {
      state.fileState.loading = false;
      renderShell();
    }
  }

  function updateApiState(mode) {
    const dot = document.getElementById('api-status-dot');
    const text = document.getElementById('api-status-text');
    if (!dot || !text) return;
    dot.className = `status-dot ${mode}`;
    text.textContent = mode === 'connected' ? (state.demo ? 'Mock mode' : 'API connected') : 'API unavailable';
  }

  function logout() {
    clearToken();
    state.token = '';
    state.demo = false;
    state.status = null;
    state.profiles = [];
    state.selectedProfile = '';
    stopLogPolling();
    renderLogin();
  }

  function capitalize(text) { return String(text).charAt(0).toUpperCase() + String(text).slice(1); }

  return { boot };
}
