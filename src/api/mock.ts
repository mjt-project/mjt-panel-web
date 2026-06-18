import type { Capabilities, FileEntry, PanelStatus, ServerProfile } from './types';

export const demoServers: ServerProfile[] = [
  { name: 'velocity', type: 'velocity', workdir: '/home/container/server/Minecraft/Velocity', port: 25565, running: true, status: 'running', version: 'latest' },
  { name: 'smp', type: 'paper', workdir: '/home/container/server/Minecraft/smp', port: 25566, running: true, status: 'running', version: '1.21.4' },
  { name: 'lobby', type: 'purpur', workdir: '/home/container/server/Minecraft/lobby', port: 25567, running: false, status: 'stopped', version: '1.21.4' }
];

export const demoStatus: PanelStatus = { version: '3.0.0-SNAPSHOT+9', remote: 'local', activeProfile: 'velocity' };
export const demoCapabilities: Capabilities = { files: true, backups: false, players: false, network: false, system: false };

const demoFiles: FileEntry[] = [
  { name: 'plugins', path: 'plugins', directory: true },
  { name: 'world', path: 'world', directory: true },
  { name: 'server.properties', path: 'server.properties', directory: false, size: 1320 },
  { name: 'eula.txt', path: 'eula.txt', directory: false, size: 9 },
  { name: 'start.sh', path: 'start.sh', directory: false, size: 156 }
];

export async function mockResponse(path: string): Promise<unknown> {
  await new Promise((resolve) => setTimeout(resolve, 130));

  if (path.startsWith('/auth/check')) return { ok: true };
  if (path === '/status') return demoStatus;
  if (path === '/minecraft/status' || path === '/minecraft/profiles') return { profiles: demoServers };
  if (path.startsWith('/capabilities')) return { features: demoCapabilities };
  if (path.startsWith('/minecraft/logs')) return { lines: ['[MJT] Demo console connected.', '[Server] Done (1.842s)! Type "help" for help.', '[Server] Players online: 0'] };
  if (path.startsWith('/workspaces/') && path.includes('/files/list')) return { entries: demoFiles };
  if (path.startsWith('/workspaces/') && path.includes('/files/read')) return { content: '# MJT demo file\n# Edit and save to test the UI.\nserver-port=25566\nonline-mode=false\n' };
  if (path.startsWith('/minecraft/install')) return { ok: true, message: 'Demo server installed.' };
  return { ok: true };
}
