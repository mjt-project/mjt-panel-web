import { state } from "../app/state.js";

const demoProfiles = [
  { name: "velocity", type: "velocity", workdir: "/home/container/server/Minecraft/Velocity", command: "bash start.sh", port: 25565, running: true },
  { name: "smp", type: "paper", workdir: "/home/container/server/Minecraft/smp", command: "bash start.sh", port: 25566, running: true },
  { name: "lobby", type: "purpur", workdir: "/home/container/server/Minecraft/lobby", command: "bash start.sh", port: 25567, running: false }
];

export async function mockApi(path) {
  await new Promise((resolve) => setTimeout(resolve, 120));
  if (path.startsWith("/auth/check")) return { ok: true, mode: "demo" };
  if (path === "/status") return { version: "3.0.0-SNAPSHOT+8", remote: "local", activeProfile: state.selectedProfile || "velocity" };
  if (path.includes("/minecraft/status") || path.includes("/minecraft/profiles")) return { profiles: demoProfiles };
  if (path.includes("/minecraft/logs")) {
    const profile = new URLSearchParams(path.split("?")[1] || "").get("profile") || state.selectedProfile || "velocity";
    return { lines: [`[MJT] Demo log stream for ${profile}`, `[${profile}] Server thread/INFO: Done (2.314s)!`, `[${profile}] Type commands below: list, say hello, stop`] };
  }
  if (path.includes("/minecraft/install/providers")) return { providers: ["velocity", "paper", "purpur"] };
  if (path.includes("/minecraft/install")) return { ok: true, message: "Demo install completed" };
  return { ok: true };
}
