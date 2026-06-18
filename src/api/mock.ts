import type {
  BackupItem,
  CoreStatus,
  FileEntry,
  FileListResult,
  InstallRequest,
  MinecraftProfile,
  NetworkStatus,
  PlayerItem,
  SystemStatus,
} from './types';

const profiles: MinecraftProfile[] = [
  { name: 'velocity', type: 'velocity', version: 'latest', workdir: '/home/container/server/Minecraft/Velocity', command: 'bash start.sh', port: 25565, memory: '512M', running: true },
  { name: 'smp', type: 'paper', version: '1.21.4', workdir: '/home/container/server/Minecraft/smp', command: 'bash start.sh', port: 25566, memory: '2G', running: true },
  { name: 'lobby', type: 'purpur', version: '1.21.4', workdir: '/home/container/server/Minecraft/lobby', command: 'bash start.sh', port: 25567, memory: '1G', running: false },
];

const filesByPath: Record<string, FileEntry[]> = {
  '': [
    { name: 'plugins', path: 'plugins', type: 'directory', modifiedAt: 'Today, 10:20' },
    { name: 'world', path: 'world', type: 'directory', modifiedAt: 'Yesterday, 18:42' },
    { name: 'server.properties', path: 'server.properties', type: 'file', size: 540, modifiedAt: 'Today, 09:12' },
    { name: 'eula.txt', path: 'eula.txt', type: 'file', size: 12, modifiedAt: 'Today, 09:10' },
    { name: 'start.sh', path: 'start.sh', type: 'file', size: 146, modifiedAt: 'Today, 09:09' },
  ],
  plugins: [
    { name: 'Geyser-Spigot.jar', path: 'plugins/Geyser-Spigot.jar', type: 'file', size: 1234567, modifiedAt: 'Today, 08:15' },
    { name: 'LuckPerms', path: 'plugins/LuckPerms', type: 'directory', modifiedAt: 'Yesterday, 19:02' },
  ],
  world: [
    { name: 'level.dat', path: 'world/level.dat', type: 'file', size: 2390, modifiedAt: 'Yesterday, 18:42' },
    { name: 'region', path: 'world/region', type: 'directory', modifiedAt: 'Yesterday, 18:42' },
  ],
};

let backups: BackupItem[] = [
  { id: 'bkp-20260617-0830', name: 'Before plugin update', profile: 'smp', size: '184 MB', createdAt: '17 Jun 2026, 08:30', status: 'ready' },
  { id: 'bkp-20260616-2105', name: 'Nightly backup', profile: 'smp', size: '181 MB', createdAt: '16 Jun 2026, 21:05', status: 'ready' },
  { id: 'bkp-20260615-1710', name: 'Lobby baseline', profile: 'lobby', size: '32 MB', createdAt: '15 Jun 2026, 17:10', status: 'ready' },
];

let players: PlayerItem[] = [
  { name: 'Simon', uuid: '00000000-0000-0000-0000-000000000001', ping: 31, online: true, op: true, whitelisted: true, joinedAt: '10:18' },
  { name: 'Alex', uuid: '00000000-0000-0000-0000-000000000002', ping: 64, online: true, op: false, whitelisted: true, joinedAt: '10:05' },
  { name: 'Builder', uuid: '00000000-0000-0000-0000-000000000003', ping: 92, online: false, op: false, whitelisted: false, joinedAt: 'Yesterday' },
];

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

function ensurePath(path: string) {
  if (!filesByPath[path]) filesByPath[path] = [];
}

function parentPath(path: string) {
  const chunks = path.split('/');
  chunks.pop();
  return chunks.join('/');
}

export const mockApi = {
  async checkAuth() { await wait(); return { ok: true }; },
  async getStatus(): Promise<CoreStatus> { await wait(); return { version: '3.0.0-SNAPSHOT+8', activeProfile: 'velocity', remote: 'local', uptime: '2h 43m', panelUrl: 'http://127.0.0.1:9090' }; },
  async getProfiles() { await wait(); return { profiles }; },
  async command(profile: string, command: string) { await wait(); return { ok: true, profile, command }; },
  async serverAction(profile: string, action: string) {
    await wait();
    const current = profiles.find((entry) => entry.name === profile);
    if (current) current.running = action === 'start' || action === 'restart';
    return { ok: true };
  },
  async logs(profile: string) {
    await wait();
    const running = profiles.find((entry) => entry.name === profile)?.running;
    return { lines: [
      `[MJT] Demo log stream for ${profile}`,
      running ? `[${profile}] Server thread/INFO: Done (2.314s)!` : `[${profile}] Server is currently stopped.`,
      `[${profile}] Use commands: list, say hello, stop`,
    ] };
  },
  async install(request: InstallRequest) {
    await wait(650);
    const existing = profiles.find((item) => item.name === request.profile);
    if (!existing) profiles.push({ name: request.profile, type: request.software, version: request.version, workdir: `/home/container/server/Minecraft/${request.profile}`, command: 'bash start.sh', port: request.port, memory: request.memory, running: false });
    return { ok: true, message: `Installed ${request.software} profile ${request.profile}` };
  },
  async listFiles(_profile: string, path: string): Promise<FileListResult> { await wait(); return { path, entries: filesByPath[path] || [] }; },
  async readFile(_profile: string, path: string) {
    await wait();
    const text = path.endsWith('server.properties')
      ? 'server-port=25566\nonline-mode=false\nmotd=MJT Server\nmax-players=30\n'
      : path.endsWith('eula.txt')
        ? 'eula=true\n'
        : path.endsWith('start.sh')
          ? '#!/usr/bin/env bash\ncd "$(dirname "$0")"\nexec java -Xms1G -Xmx2G -jar minecraft.jar nogui\n'
          : '# MJT demo file\n';
    return { path, content: text };
  },
  async saveFile(_profile: string, _path: string, _content: string) { await wait(); return { ok: true }; },
  async createFile(_profile: string, path: string) {
    await wait();
    const parent = parentPath(path); ensurePath(parent);
    filesByPath[parent].push({ name: path.split('/').pop() || 'new-file.txt', path, type: 'file', size: 0, modifiedAt: 'Just now' });
    return { ok: true };
  },
  async createDirectory(_profile: string, path: string) {
    await wait();
    const parent = parentPath(path); ensurePath(parent); ensurePath(path);
    filesByPath[parent].push({ name: path.split('/').pop() || 'new-folder', path, type: 'directory', modifiedAt: 'Just now' });
    return { ok: true };
  },
  async renameFile(_profile: string, path: string, newPath: string) {
    await wait();
    const parent = parentPath(path); const nextParent = parentPath(newPath);
    const entry = filesByPath[parent]?.find((item) => item.path === path);
    if (entry) { entry.path = newPath; entry.name = newPath.split('/').pop() || entry.name; }
    if (parent !== nextParent && entry) {
      filesByPath[parent] = filesByPath[parent].filter((item) => item !== entry);
      ensurePath(nextParent); filesByPath[nextParent].push(entry);
    }
    return { ok: true };
  },
  async deleteFile(_profile: string, path: string) {
    await wait();
    const parent = parentPath(path);
    filesByPath[parent] = (filesByPath[parent] || []).filter((item) => item.path !== path);
    delete filesByPath[path];
    return { ok: true };
  },
  async listBackups(profile: string) { await wait(); return { backups: backups.filter((backup) => !profile || backup.profile === profile) }; },
  async createBackup(profile: string, name?: string) {
    await wait(500);
    const backup: BackupItem = { id: `bkp-${Date.now()}`, name: name || `Manual backup ${new Date().toLocaleTimeString()}`, profile, size: '0 MB', createdAt: 'Just now', status: 'ready' };
    backups = [backup, ...backups];
    return { ok: true, backup };
  },
  async restoreBackup(_profile: string, _id: string) { await wait(500); return { ok: true }; },
  async deleteBackup(_profile: string, id: string) { await wait(); backups = backups.filter((backup) => backup.id !== id); return { ok: true }; },
  async listPlayers(_profile: string) { await wait(); return { players }; },
  async playerAction(_profile: string, action: string, player: string) {
    await wait();
    const target = players.find((item) => item.name === player);
    if (target) {
      if (action === 'kick' || action === 'ban') target.online = false;
      if (action === 'op') target.op = true;
      if (action === 'deop') target.op = false;
      if (action === 'whitelist-add') target.whitelisted = true;
      if (action === 'whitelist-remove') target.whitelisted = false;
    }
    return { ok: true };
  },
  async getNetwork(): Promise<NetworkStatus> {
    await wait();
    return {
      panelUrl: 'http://127.0.0.1:9090',
      localPanelUrl: 'http://127.0.0.1:9090',
      gateway: { enabled: false, host: '127.0.0.1', port: 25565 },
      tunnel: { mode: 'local', status: 'offline' },
      ports: [
        { label: 'Velocity', host: '127.0.0.1', port: 25565, protocol: 'TCP', status: 'open' },
        { label: 'SMP', host: '127.0.0.1', port: 25566, protocol: 'TCP', status: 'open' },
        { label: 'Lobby', host: '127.0.0.1', port: 25567, protocol: 'TCP', status: 'closed' },
      ],
    };
  },
  async getSystem(): Promise<SystemStatus> {
    await wait();
    return { java: 'OpenJDK 21', os: 'Linux', architecture: 'x86_64', memory: '2.4 GB / 4 GB', disk: '3.2 GB / 20 GB', cloudflared: 'not installed', panelFrontend: '0.0.14' };
  },
};
