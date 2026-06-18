import { state } from "./state.js";

export const pages = ["dashboard", "servers", "installer", "console", "files", "backups", "network", "settings", "system"];

export const pageMeta = {
  dashboard: ["Dashboard", "Install, start and manage Minecraft profiles."],
  servers: ["Servers", "View all profiles and take quick actions."],
  installer: ["Installer", "Download and install Velocity, Paper or Purpur."],
  console: ["Console", "Read logs and send commands to the selected server."],
  files: ["Files", "File manager shell."],
  backups: ["Backups", "Backup shell."],
  network: ["Network", "Gateway, tunnel and panel access overview."],
  settings: ["Settings", "Panel preferences and profile settings."],
  system: ["System", "Core health and version details."]
};

export function setPage(page) {
  state.currentPage = pages.includes(page) ? page : "dashboard";
}
