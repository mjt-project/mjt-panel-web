import { state } from '../app/state.js';

const demoProfiles = [
  { name: 'velocity', type: 'velocity', workdir: '/home/container/server/Minecraft/Velocity', command: 'bash start.sh', port: 25565, running: true },
  { name: 'smp', type: 'paper', workdir: '/home/container/server/Minecraft/smp', command: 'bash start.sh', port: 25566, running: true },
  { name: 'lobby', type: 'purpur', workdir: '/home/container/server/Minecraft/lobby', command: 'bash start.sh', port: 25567, running: false }
];

const mockFiles = {
  '/': [
    { name: 'server.properties', path: '/server.properties', type: 'file', size: 1842, modified: '2026-06-18 22:10' },
    { name: 'plugins', path: '/plugins', type: 'dir', size: 0, modified: '2026-06-18 22:09' },
    { name: 'world', path: '/world', type: 'dir', size: 0, modified: '2026-06-18 21:58' },
    { name: 'start.sh', path: '/start.sh', type: 'file', size: 86, modified: '2026-06-18 21:40' }
  ],
  '/plugins': [
    { name: 'Geyser-Spigot.jar', path: '/plugins/Geyser-Spigot.jar', type: 'file', size: 18320000, modified: '2026-06-18 21:44' },
    { name: 'ViaVersion.jar', path: '/plugins/ViaVersion.jar', type: 'file', size: 6320000, modified: '2026-06-18 21:45' }
  ]
};

const mockContents = {
  '/server.properties': 'server-ip=127.0.0.1\nserver-port=25566\nonline-mode=false\nmotd=MJT Demo Server\n',
  '/start.sh': '#!/usr/bin/env bash\ncd "$(dirname "$0")"\nexec java -Xms1G -Xmx1G -jar minecraft.jar nogui\n'
};

export async function mockApi(path) {
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (path.startsWith('/auth/check')) return { ok: true, mode: 'demo' };
  if (path === '/status') return { version: '3.0.0-SNAPSHOT+9', activeProfile: state.selectedProfile || 'smp' };
  if (path.includes('/minecraft/status') || path.includes('/minecraft/profiles')) return { profiles: demoProfiles };
  if (path.includes('/minecraft/logs')) return { lines: [`[MJT] Demo logs for ${state.selectedProfile || 'smp'}`, '[Server] Done (2.314s)!'] };
  if (path.includes('/minecraft/install')) return { ok: true, message: 'Demo install completed' };

  if (path.startsWith('/files/list') || path.startsWith('/api/files/list')) {
    const qs = new URLSearchParams(path.split('?')[1] || '');
    const p = qs.get('path') || '/';
    return { path: p, files: mockFiles[p] || [] };
  }

  if (path.startsWith('/files/read') || path.startsWith('/api/files/read')) {
    const qs = new URLSearchParams(path.split('?')[1] || '');
    const p = qs.get('path') || '/server.properties';
    return { path: p, content: mockContents[p] || '' };
  }

  if (path.startsWith('/files/write') || path.startsWith('/files/delete') || path.startsWith('/files/mkdir') || path.startsWith('/files/create') || path.startsWith('/files/rename')) {
    return { ok: true, message: 'Demo file operation completed' };
  }

  return { ok: true };
}
