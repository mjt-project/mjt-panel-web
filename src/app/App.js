import { state } from "./state.js";
import { setPage } from "./router.js";
import { api } from "../services/apiClient.js";
import { clearToken } from "../services/storage.js";
import { toast } from "../ui/toast.js";

import { AuthView } from "../features/auth/AuthView.js";
import { bindAuthEvents } from "../features/auth/AuthController.js";
import { LayoutView } from "../features/layout/LayoutView.js";
import { DashboardView } from "../features/dashboard/DashboardView.js";
import { ServersView } from "../features/servers/ServersView.js";
import { InstallerView } from "../features/installer/InstallerView.js";
import { ConsoleView } from "../features/console/ConsoleView.js";
import { PlaceholderView } from "../features/placeholder/PlaceholderView.js";

export function createApp(root) {
  async function boot() {
    renderAuth();
    if (state.token) {
      const loginMessage = document.getElementById("loginMessage");
      if (loginMessage) loginMessage.textContent = "Stored token found. Checking...";
      try { await api(`/auth/check?token=${encodeURIComponent(state.token)}`); await openPanel(); }
      catch { if (loginMessage) { loginMessage.textContent = "Stored token is invalid. Please sign in again."; loginMessage.style.color = "var(--danger)"; } }
    }
  }

  function renderAuth() {
    root.innerHTML = AuthView({ apiBase: state.apiBase, token: state.token });
    bindAuthEvents({ openPanel });
  }

  async function openPanel() { await refreshAll(); renderPanel(); startLogPolling(); }

  async function refreshAll() {
    try {
      const [status, minecraft] = await Promise.all([api("/status"), api("/minecraft/status").catch(() => api("/minecraft/profiles"))]);
      state.status = status;
      state.profiles = Array.isArray(minecraft) ? minecraft : (minecraft.profiles || []);
      state.selectedProfile = state.selectedProfile || status.activeProfile || state.profiles[0]?.name || "";
    } catch (error) { toast(`Refresh failed: ${error.message}`, true); }
  }

  function renderPanel() { root.innerHTML = LayoutView(currentPageHtml()); bindPanelEvents(); if (state.currentPage === "console") loadLogs(); }

  function currentPageHtml() {
    switch (state.currentPage) {
      case "dashboard": return DashboardView();
      case "servers": return ServersView();
      case "installer": return InstallerView();
      case "console": return ConsoleView();
      default: return PlaceholderView();
    }
  }

  function bindPanelEvents() {
    document.getElementById("logoutBtn").onclick = logout;
    document.getElementById("refreshBtn").onclick = async () => { await refreshAll(); renderPanel(); };
    document.querySelectorAll("[data-page]").forEach((button) => { button.onclick = () => { setPage(button.dataset.page); renderPanel(); }; });
    document.querySelectorAll("[data-go]").forEach((button) => { button.onclick = () => { setPage(button.dataset.go); renderPanel(); }; });
    const profileSelect = document.getElementById("profileSelect");
    if (profileSelect) profileSelect.onchange = () => { state.selectedProfile = profileSelect.value; renderPanel(); };
    document.querySelectorAll("[data-select-profile]").forEach((card) => { card.onclick = (event) => { if (event.target.tagName === "BUTTON") return; state.selectedProfile = card.dataset.selectProfile; renderPanel(); }; });
    document.querySelectorAll("[data-action]").forEach((button) => {
      button.onclick = async () => {
        const action = button.dataset.action;
        const profile = button.dataset.profile || state.selectedProfile;
        if (action === "console") { state.selectedProfile = profile; setPage("console"); renderPanel(); return; }
        await serverAction(action, profile);
      };
    });
    bindInstallerEvents();
    bindConsoleEvents();
  }

  function bindInstallerEvents() {
    const installBtn = document.getElementById("installBtn");
    if (!installBtn) return;
    installBtn.onclick = installServer;
    document.querySelectorAll("[data-recipe]").forEach((button) => { button.onclick = () => applyRecipe(button.dataset.recipe); });
  }

  function bindConsoleEvents() {
    const sendButton = document.getElementById("sendCommandBtn");
    if (!sendButton) return;
    sendButton.onclick = sendCommand;
    document.getElementById("commandInput").addEventListener("keydown", (event) => { if (event.key === "Enter") sendCommand(); });
    document.getElementById("pauseLogsBtn").onclick = () => { state.logsPaused = !state.logsPaused; renderPanel(); };
    document.getElementById("clearConsoleBtn").onclick = () => { const output = document.getElementById("consoleOutput"); if (output) output.textContent = ""; };
    document.querySelectorAll("[data-history-command]").forEach((button) => { button.onclick = () => { document.getElementById("commandInput").value = button.dataset.historyCommand; }; });
  }

  async function serverAction(action, profile) {
    if (!profile) return toast("Select a profile first.", true);
    try { await api(`/minecraft/${action}`, { method: "POST", body: JSON.stringify({ profile }) }); toast(`${action} sent to ${profile}`); await refreshAll(); renderPanel(); }
    catch (error) { toast(`${action} failed: ${error.message}`, true); }
  }

  async function installServer() {
    const payload = {
      provider: document.getElementById("installProvider").value,
      profile: document.getElementById("installProfile").value.trim(),
      version: document.getElementById("installVersion").value.trim() || "latest",
      build: document.getElementById("installBuild").value.trim() || "latest",
      port: Number(document.getElementById("installPort").value || 25565),
      memory: document.getElementById("installMemory").value.trim() || "1G",
      acceptEula: document.getElementById("installEula").checked,
      force: document.getElementById("installForce").checked
    };
    if (!payload.profile) return toast("Profile name is required.", true);
    if ((payload.provider === "paper" || payload.provider === "purpur") && !payload.acceptEula) return toast("Paper/Purpur requires EULA acceptance.", true);
    const output = document.getElementById("installOutput");
    output.textContent = `Installing ${payload.provider} profile "${payload.profile}"...`;
    try { const result = await api("/minecraft/install", { method: "POST", body: JSON.stringify(payload) }); output.textContent += `
Done.
${JSON.stringify(result, null, 2)}`; toast(`Installed ${payload.profile}`); state.selectedProfile = payload.profile; await refreshAll(); renderPanel(); }
    catch (error) { output.textContent += `
Failed: ${error.message}`; toast(`Install failed: ${error.message}`, true); }
  }

  function applyRecipe(name) {
    const recipes = { velocity: { provider: "velocity", profile: "velocity", port: 25565, memory: "512M", eula: false }, paper: { provider: "paper", profile: "smp", port: 25566, memory: "1G", eula: true }, purpur: { provider: "purpur", profile: "lobby", port: 25567, memory: "1G", eula: true } };
    const r = recipes[name];
    if (!r) return;
    document.getElementById("installProvider").value = r.provider;
    document.getElementById("installProfile").value = r.profile;
    document.getElementById("installVersion").value = "latest";
    document.getElementById("installBuild").value = "latest";
    document.getElementById("installPort").value = r.port;
    document.getElementById("installMemory").value = r.memory;
    document.getElementById("installEula").checked = r.eula;
  }

  async function sendCommand() {
    const input = document.getElementById("commandInput");
    const command = input.value.trim();
    if (!command) return;
    if (!state.selectedProfile) return toast("Select a profile first.", true);
    try { await api("/minecraft/send", { method: "POST", body: JSON.stringify({ profile: state.selectedProfile, command }) }); input.value = ""; rememberCommand(command); toast(`Command sent to ${state.selectedProfile}`); await loadLogs(); }
    catch (error) { toast(`Command failed: ${error.message}`, true); }
  }

  function rememberCommand(command) { state.commandHistory = [command, ...state.commandHistory.filter((item) => item !== command)].slice(0, 8); }

  async function loadLogs() {
    if (state.logsPaused || !state.selectedProfile) return;
    const output = document.getElementById("consoleOutput");
    if (!output) return;
    try { const result = await api(`/minecraft/logs?profile=${encodeURIComponent(state.selectedProfile)}`); output.textContent = (result.lines || []).join("\n"); output.scrollTop = output.scrollHeight; }
    catch (error) { output.textContent = `Cannot load logs: ${error.message}`; }
  }

  function startLogPolling() { stopLogPolling(); loadLogs(); state.logsTimer = setInterval(loadLogs, 1800); }
  function stopLogPolling() { if (state.logsTimer) clearInterval(state.logsTimer); state.logsTimer = null; }
  function logout() { clearToken(); state.token = ""; state.demo = false; stopLogPolling(); renderAuth(); }
  return { boot };
}
