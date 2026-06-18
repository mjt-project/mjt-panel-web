import { state } from "./state.js";
import { pages } from "./router.js";
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
import { FileManagerView } from "../features/files/FileManagerView.js";
import { PlaceholderView } from "../features/placeholder/PlaceholderView.js";

export function createApp(root) {
  async function boot() { renderAuth(); if (state.token) { try { await api(`/auth/check?token=${encodeURIComponent(state.token)}`); await openPanel(); } catch {} } }
  function renderAuth() { root.innerHTML = AuthView({ apiBase: state.apiBase, token: state.token }); bindAuthEvents({ openPanel }); }
  async function openPanel() { await refreshAll(); renderPanel(); startLogPolling(); }
  async function refreshAll() { const [status, mc] = await Promise.all([api("/status"), api("/minecraft/status").catch(() => api("/minecraft/profiles"))]); state.status = status; state.profiles = Array.isArray(mc) ? mc : (mc.profiles || []); state.selectedProfile = state.selectedProfile || status.activeProfile || state.profiles[0]?.name || ""; }
  function html() { if (state.currentPage === "dashboard") return DashboardView(); if (state.currentPage === "servers") return ServersView(); if (state.currentPage === "installer") return InstallerView(); if (state.currentPage === "console") return ConsoleView(); if (state.currentPage === "files") return FileManagerView(); return PlaceholderView(); }
  function renderPanel() { root.innerHTML = LayoutView(html()); bindEvents(); if (state.currentPage === "console") loadLogs(); if (state.currentPage === "files") loadFiles(false); }
  function bindEvents() {
    document.getElementById("logoutBtn").onclick = logout;
    document.getElementById("refreshBtn").onclick = async () => { await refreshAll(); renderPanel(); };
    document.querySelectorAll("[data-page]").forEach(b => b.onclick = () => { state.currentPage = pages.includes(b.dataset.page) ? b.dataset.page : "dashboard"; renderPanel(); });
    document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { state.currentPage = b.dataset.go; renderPanel(); });
    const select = document.getElementById("profileSelect"); if (select) select.onchange = () => { state.selectedProfile = select.value; renderPanel(); };
    document.querySelectorAll("[data-select-profile]").forEach(c => c.onclick = e => { if (e.target.tagName === "BUTTON") return; state.selectedProfile = c.dataset.selectProfile; renderPanel(); });
    document.querySelectorAll("[data-action]").forEach(b => b.onclick = async () => { const action = b.dataset.action; const profile = b.dataset.profile || state.selectedProfile; if (action === "console") { state.selectedProfile = profile; state.currentPage = "console"; renderPanel(); return; } await serverAction(action, profile); });
    bindInstaller(); bindConsole(); bindFiles();
  }
  async function serverAction(action, profile) { if (!profile) return toast("Select a profile first", true); try { await api(`/minecraft/${action}`, { method:"POST", body: JSON.stringify({ profile }) }); toast(`${action} sent to ${profile}`); await refreshAll(); renderPanel(); } catch(e) { toast(`${action} failed: ${e.message}`, true); } }
  function bindInstaller() { const btn = document.getElementById("installBtn"); if (!btn) return; btn.onclick = installServer; document.querySelectorAll("[data-recipe]").forEach(b => b.onclick = () => applyRecipe(b.dataset.recipe)); }
  async function installServer() { const software = val("installProvider").toLowerCase(); const payload = { software, provider: software, profile: val("installProfile"), version: val("installVersion") || "latest", build: val("installBuild") || "latest", port: Number(val("installPort") || 25565), memory: val("installMemory") || "1G", acceptEula: document.getElementById("installEula").checked, force: document.getElementById("installForce").checked }; const out = document.getElementById("installOutput"); out.textContent = `Installing ${payload.software} profile "${payload.profile}"...`; try { const res = await api("/minecraft/install", { method:"POST", body: JSON.stringify(payload) }); out.textContent += `
Done.
${JSON.stringify(res,null,2)}`; state.selectedProfile = payload.profile; toast(`Installed ${payload.profile}`); await refreshAll(); renderPanel(); } catch(e) { out.textContent += `
Failed: ${e.message}`; toast(`Install failed: ${e.message}`, true); } }
  function applyRecipe(name) { const r = { velocity:["velocity","velocity",25565,"512M",false], paper:["paper","smp",25566,"1G",true], purpur:["purpur","lobby",25567,"1G",true] }[name]; if (!r) return; document.getElementById("installProvider").value = r[0]; document.getElementById("installProfile").value = r[1]; document.getElementById("installPort").value = r[2]; document.getElementById("installMemory").value = r[3]; document.getElementById("installEula").checked = r[4]; }
  function bindConsole() { const btn = document.getElementById("sendCommandBtn"); if (!btn) return; btn.onclick = sendCommand; document.getElementById("commandInput").addEventListener("keydown", e => { if (e.key === "Enter") sendCommand(); }); document.getElementById("pauseLogsBtn").onclick = () => { state.logsPaused = !state.logsPaused; renderPanel(); }; document.getElementById("clearConsoleBtn").onclick = () => document.getElementById("consoleOutput").textContent = ""; document.querySelectorAll("[data-history-command]").forEach(b => b.onclick = () => document.getElementById("commandInput").value = b.dataset.historyCommand); }
  async function sendCommand() { const input = document.getElementById("commandInput"); const command = input.value.trim(); if (!command) return; await api("/minecraft/send", { method:"POST", body: JSON.stringify({ profile: state.selectedProfile, command }) }); state.commandHistory = [command, ...state.commandHistory.filter(c => c !== command)].slice(0, 8); input.value = ""; toast("Command sent"); await loadLogs(); }
  async function loadLogs() { if (state.logsPaused || !state.selectedProfile) return; const out = document.getElementById("consoleOutput"); if (!out) return; try { const res = await api(`/minecraft/logs?profile=${encodeURIComponent(state.selectedProfile)}`); out.textContent = (res.lines || []).join("
"); out.scrollTop = out.scrollHeight; } catch(e) { out.textContent = `Cannot load logs: ${e.message}`; } }
  function startLogPolling() { stopLogPolling(); state.logsTimer = setInterval(loadLogs, 1800); }
  function stopLogPolling() { if (state.logsTimer) clearInterval(state.logsTimer); state.logsTimer = null; }
  function bindFiles() { const refresh = document.getElementById("fileRefreshBtn"); if (!refresh) return; refresh.onclick = () => loadFiles(true); document.getElementById("fileUpBtn").onclick = () => { const parts = state.files.path.split("/").filter(Boolean); parts.pop(); state.files.path = "/" + parts.join("/"); if (state.files.path !== "/") state.files.path += ""; loadFiles(true); }; document.querySelectorAll("[data-file-open]").forEach(b => b.onclick = () => openFile(b.dataset.fileOpen, b.dataset.fileType)); document.getElementById("fileSaveBtn").onclick = saveFile; }
  async function loadFiles(showError=true) { if (state.currentPage !== "files" || !state.selectedProfile) return; try { const res = await api(`/files/list?profile=${encodeURIComponent(state.selectedProfile)}&path=${encodeURIComponent(state.files.path)}`); state.files.items = res.items || []; if (showError) renderPanel(); } catch(e) { if (showError) toast(`Load files failed: ${e.message}`, true); } }
  async function openFile(name, type) { if (type === "directory") { state.files.path = (state.files.path === "/" ? "" : state.files.path) + "/" + name; await loadFiles(true); return; } const path = (state.files.path === "/" ? "" : state.files.path) + "/" + name; const res = await api(`/files/read?profile=${encodeURIComponent(state.selectedProfile)}&path=${encodeURIComponent(path)}`); state.files.selectedFile = path; state.files.selectedContent = res.content || ""; renderPanel(); }
  async function saveFile() { if (!state.files.selectedFile) return toast("No file selected", true); await api("/files/write", { method:"POST", body: JSON.stringify({ profile: state.selectedProfile, path: state.files.selectedFile, content: document.getElementById("fileEditor").value }) }); toast("File saved"); }
  function val(id) { return document.getElementById(id).value.trim(); }
  function logout() { clearToken(); state.token = ""; state.demo = false; stopLogPolling(); renderAuth(); }
  return { boot };
}
