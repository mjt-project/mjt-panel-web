import { state } from "../app/state.js";

const profiles = [
  { name: "velocity", type: "velocity", workdir: "/home/container/server/Minecraft/Velocity", command: "bash start.sh", port: 25565, running: true },
  { name: "smp", type: "paper", workdir: "/home/container/server/Minecraft/smp", command: "bash start.sh", port: 25566, running: false },
  { name: "lobby", type: "purpur", workdir: "/home/container/server/Minecraft/lobby", command: "bash start.sh", port: 25567, running: false }
];

const files = {
  "/": [
    { name: "server.properties", type: "file", size: 2840, modified: "2026-06-18 10:31" },
    { name: "plugins", type: "directory", size: 0, modified: "2026-06-18 10:32" },
    { name: "logs", type: "directory", size: 0, modified: "2026-06-18 10:33" }
  ],
  "/plugins": [
    { name: "Geyser.jar", type: "file", size: 9138120, modified: "2026-06-18 10:33" }
  ],
  "/logs": [
    { name: "latest.log", type: "file", size: 12048, modified: "2026-06-18 10:40" }
  ]
};

export async function mockApi(path) {
  await new Promise((resolve) => setTimeout(resolve, 120));
  if (path.startsWith("/auth/check")) return { ok: true };
  if (path === "/status") return { version: "3.0.0-SNAPSHOT+8", activeProfile: state.selectedProfile || "velocity" };
  if (path.includes("/minecraft/status") || path.includes("/minecraft/profiles")) return { profiles };
  if (path.includes("/minecraft/logs")) {
    const profile = new URLSearchParams(path.split("?")[1] || "").get("profile") || state.selectedProfile || "velocity";
    return { lines: [`[MJT] Demo log stream for ${profile}`, `[${profile}] Server thread/INFO: Done (2.314s)!`, `[${profile}] Type commands below: list, say hello, stop`] };
  }
  if (path.includes("/minecraft/install")) return { ok: true, message: "Demo install completed" };
  if (path.includes("/files/list")) {
    const query = new URLSearchParams(path.split("?")[1] || "");
    const p = query.get("path") || "/";
    return { path: p, items: files[p] || [] };
  }
  if (path.includes("/files/read")) return { content: "# Demo file
server-port=25566
motd=MJT demo server
" };
  if (path.includes("/files/write")) return { ok: true };
  return { ok: true };
}
