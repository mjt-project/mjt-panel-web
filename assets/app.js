const API_BASE = "/api";

const state = {
  token: localStorage.getItem("mjtToken") || "",
  demo: false,
  status: null,
  profiles: [],
  activeProfile: "",
  logsTimer: null
};

const $ = (id) => document.getElementById(id);

const demoProfiles = [
  { name: "velocity", type: "velocity", workdir: "/home/container/server/Minecraft/Velocity", command: "bash start.sh", port: 25565, running: true },
  { name: "smp", type: "paper", workdir: "/home/container/server/Minecraft/smp", command: "bash start.sh", port: 25566, running: true },
  { name: "lobby", type: "paper", workdir: "/home/container/server/Minecraft/lobby", command: "bash start.sh", port: 25567, running: false }
];

function tokenHeaders() {
  return {
    "Content-Type": "application/json",
    // "X-MJT-Token": state.token,
    // "Authorization": `Bearer ${state.token}`
    "X-MJT-Token": "state.token",
    "Authorization": `Bearer ${state.token}`
  };
}

async function api(path, options = {}) {
  if (state.demo) return demoApi(path, options);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...tokenHeaders(), ...(options.headers || {}) }
  });

  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP ${response.status}`);
  }

  return data;
}

function demoApi(path, options = {}) {
  if (path.includes("/auth/check")) return Promise.resolve({ ok: true, mode: "demo" });
  if (path.includes("/status")) {
    return Promise.resolve({
      version: "3.0.0-SNAPSHOT+1",
      activeProfile: state.activeProfile || "velocity",
      attachedProfile: state.activeProfile || "velocity",
      remote: "demo"
    });
  }
  if (path.includes("/minecraft/install/providers")) {
    return Promise.resolve({ ok: true, providers: [
      { id: "velocity", name: "Velocity", type: "proxy" },
      { id: "paper", name: "Paper", type: "server" },
      { id: "purpur", name: "Purpur", type: "server" }
    ] });
  }
  if (path.includes("/minecraft/profiles") || path.includes("/minecraft/status")) {
    return Promise.resolve({ profiles: demoProfiles });
  }
  if (path.includes("/minecraft/logs")) {
    const profile = new URLSearchParams(path.split("?")[1] || "").get("profile") || "velocity";
    return Promise.resolve({
      lines: [
        `[${profile}] MJT demo console ready.`,
        `[${profile}] Server output will appear here.`,
        `[${profile}] Use the command box below to send console commands.`
      ]
    });
  }
  if (path.includes("/minecraft/install")) return Promise.resolve({ ok: true, software: "demo", profile: "demo", version: "latest", build: "latest", jar: "/demo/minecraft.jar", workdir: "/demo" });
  return Promise.resolve({ ok: true });
}

function showToast(text) {
  const toast = $("toast");
  toast.textContent = text;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2500);
}

function setLoginMessage(text, danger = false) {
  const el = $("loginMessage");
  el.textContent = text || "";
  el.style.color = danger ? "var(--danger)" : "var(--warning)";
}

async function login(token) {
  state.token = token.trim();
  if (!state.token) {
    setLoginMessage("Please paste your panel token.", true);
    return;
  }

  setLoginMessage("Checking token...");
  try {
    await api(`/auth/check?token=${encodeURIComponent(state.token)}`);
    localStorage.setItem("mjtToken", state.token);
    document.cookie = `MJT_TOKEN=${encodeURIComponent(state.token)}; Path=/; SameSite=Strict`;
    setLoginMessage("Login successful.");
    await openPanel();
  } catch (error) {
    setLoginMessage(`Login failed: ${error.message}`, true);
  }
}

async function openPanel() {
  $("loginView").classList.add("hidden");
  $("panelView").classList.remove("hidden");
  await refreshAll();
  startLogPolling();
}

function logout() {
  localStorage.removeItem("mjtToken");
  document.cookie = "MJT_TOKEN=; Path=/; Max-Age=0; SameSite=Strict";
  state.token = "";
  state.demo = false;
  if (state.logsTimer) clearInterval(state.logsTimer);
  $("panelView").classList.add("hidden");
  $("loginView").classList.remove("hidden");
}

async function refreshAll() {
  try {
    const status = await api("/status");
    const profilesResult = await api("/minecraft/status");
    state.status = status;
    state.profiles = profilesResult.profiles || profilesResult || [];
    state.activeProfile = state.activeProfile || status.activeProfile || status.attachedProfile || (state.profiles[0]?.name || "");
    render();
  } catch (error) {
    showToast(`Refresh failed: ${error.message}`);
  }
}

function render() {
  $("coreVersion").textContent = state.status?.version || "core unknown";
  $("activeProfile").textContent = state.activeProfile || "none";
  $("panelMode").textContent = state.demo ? "Demo" : "API";
  $("remoteStatus").textContent = state.status?.remote || "local";

  const running = state.profiles.filter(p => p.running).length;
  $("runningCount").textContent = String(running);

  renderProfileSelect();
  renderProfileCards();
  renderServersTable();
  $("consoleProfileBadge").textContent = state.activeProfile || "none";
}

function renderProfileSelect() {
  const select = $("profileSelect");
  select.innerHTML = "";
  for (const profile of state.profiles) {
    const option = document.createElement("option");
    option.value = profile.name;
    option.textContent = `${profile.name}${profile.running ? " • running" : ""}`;
    select.appendChild(option);
  }
  select.value = state.activeProfile;
}

function renderProfileCards() {
  const box = $("profileCards");
  box.innerHTML = "";

  for (const p of state.profiles) {
    const row = document.createElement("div");
    row.className = "server-item";
    row.innerHTML = `
      <div>
        <strong style="font-size:18px;margin:0">${p.name}</strong>
        <small>${p.type || "minecraft"} • ${p.workdir || ""}</small>
      </div>
      <span class="badge ${p.running ? "running" : "stopped"}">${p.running ? "Running" : "Stopped"}</span>
    `;
    row.onclick = () => {
      state.activeProfile = p.name;
      render();
      loadLogs();
    };
    box.appendChild(row);
  }
}

function renderServersTable() {
  const box = $("serversTable");
  box.innerHTML = "";

  for (const p of state.profiles) {
    const row = document.createElement("div");
    row.className = "table-row";
    row.innerHTML = `
      <strong>${p.name}</strong>
      <span class="badge ${p.running ? "running" : "stopped"}">${p.running ? "Running" : "Stopped"}</span>
      <span>${p.type || "minecraft"} : ${p.port || ""}</span>
      <small class="muted">${p.command || ""}</small>
    `;
    box.appendChild(row);
  }
}

async function action(name) {
  if (!state.activeProfile) return showToast("Select a profile first.");

  try {
    await api(`/minecraft/${name}`, {
      method: "POST",
      body: JSON.stringify({ profile: state.activeProfile })
    });
    showToast(`${name} sent to ${state.activeProfile}`);
    await refreshAll();
  } catch (error) {
    showToast(`${name} failed: ${error.message}`);
  }
}

async function sendCommand() {
  const input = $("commandInput");
  const command = input.value.trim();
  if (!command) return;
  if (!state.activeProfile) return showToast("Select a profile first.");

  try {
    await api("/minecraft/send", {
      method: "POST",
      body: JSON.stringify({ profile: state.activeProfile, command })
    });
    input.value = "";
    showToast(`Command sent to ${state.activeProfile}`);
    await loadLogs();
  } catch (error) {
    showToast(`Command failed: ${error.message}`);
  }
}

async function loadLogs() {
  if (!state.activeProfile) return;

  try {
    const result = await api(`/minecraft/logs?profile=${encodeURIComponent(state.activeProfile)}`);
    const lines = result.lines || [];
    $("consoleOutput").textContent = lines.join("\n");
    $("consoleOutput").scrollTop = $("consoleOutput").scrollHeight;
  } catch (error) {
    $("consoleOutput").textContent = `Cannot load logs: ${error.message}`;
  }
}

function startLogPolling() {
  if (state.logsTimer) clearInterval(state.logsTimer);
  loadLogs();
  state.logsTimer = setInterval(loadLogs, 1500);
}

function switchPage(page) {
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.page === page));
  document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
  $(`${page}Page`).classList.add("active");

  $("pageTitle").textContent = page.charAt(0).toUpperCase() + page.slice(1);
  const subtitles = {
    dashboard: "Control your Minecraft profiles from one place.",
    servers: "View and manage all configured Minecraft profiles.",
    console: "Send commands and inspect server logs.",
    files: "Browse and edit files inside profile workdirs.",
    backups: "Create and manage backups.",
    players: "Player tools and moderation shortcuts.",
    installer: "Download and install Velocity, Paper or Purpur profiles.",
    network: "Gateway, tunnel, ports and public access.",
    settings: "Panel and Minecraft profile settings.",
    system: "Core version, health checks and installers."
  };
  $("pageSubtitle").textContent = subtitles[page] || "";
}


async function checkInstallerProviders() {
  try {
    const result = await api("/minecraft/install/providers");
    const providers = result.providers || [];
    $("installerOutput").textContent = JSON.stringify(providers, null, 2);
    showToast("Installer providers loaded");
  } catch (error) {
    $("installerOutput").textContent = `Provider check failed: ${error.message}`;
  }
}

async function installMinecraftServer() {
  const software = $("installSoftware").value;
  const profile = $("installProfile").value.trim();
  const version = $("installVersion").value.trim() || "latest";
  const build = $("installBuild").value.trim() || "latest";
  const acceptEula = $("installAcceptEula").checked;
  const force = $("installForce").checked;

  if (!software || !profile) {
    showToast("Choose software and profile first.");
    return;
  }

  $("installerOutput").textContent = `Installing ${software} into profile ${profile}...`;
  try {
    const result = await api("/minecraft/install", {
      method: "POST",
      body: JSON.stringify({ software, profile, version, build, acceptEula, force })
    });
    $("installerOutput").textContent = JSON.stringify(result, null, 2);
    showToast(`Installed ${software} as ${profile}`);
    await refreshAll();
  } catch (error) {
    $("installerOutput").textContent = `Install failed: ${error.message}`;
    showToast(`Install failed: ${error.message}`);
  }
}

function syncInstallerProfileDefault() {
  const software = $("installSoftware").value;
  if (software === "velocity") $("installProfile").value = "velocity";
  if (software === "paper") $("installProfile").value = "smp";
  if (software === "purpur") $("installProfile").value = "lobby";
}

function bindEvents() {
  $("loginBtn").onclick = () => login($("tokenInput").value);
  $("demoBtn").onclick = async () => {
    state.demo = true;
    state.token = "demo";
    await openPanel();
  };
  $("logoutBtn").onclick = logout;
  $("refreshBtn").onclick = refreshAll;
  $("reloadProfilesBtn").onclick = refreshAll;

  $("startBtn").onclick = () => action("start");
  $("stopBtn").onclick = () => action("stop");
  $("killBtn").onclick = () => action("kill");

  $("sendCommandBtn").onclick = sendCommand;
  $("installerProvidersBtn").onclick = checkInstallerProviders;
  $("installMinecraftBtn").onclick = installMinecraftServer;
  $("installSoftware").onchange = syncInstallerProfileDefault;
  $("commandInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendCommand();
  });

  $("profileSelect").onchange = (event) => {
    state.activeProfile = event.target.value;
    render();
    loadLogs();
  };

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.onclick = () => switchPage(btn.dataset.page);
  });

  $("tokenInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") login($("tokenInput").value);
  });
}

async function boot() {
  bindEvents();

  if (state.token) {
    $("tokenInput").value = state.token;
    setLoginMessage("Stored token found. Checking...");
    try {
      await api(`/auth/check?token=${encodeURIComponent(state.token)}`);
      await openPanel();
    } catch {
      setLoginMessage("Stored token is invalid. Please sign in again.", true);
    }
  }
}

boot();
