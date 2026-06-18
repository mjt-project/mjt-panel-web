import { state } from '../app/state.js';

const profiles = [
  { name: 'velocity', type: 'velocity', workdir: '/home/container/server/Minecraft/Velocity', command: 'bash start.sh', port: 25565, running: true },
  { name: 'smp', type: 'paper', workdir: '/home/container/server/Minecraft/smp', command: 'bash start.sh', port: 25566, running: false },
  { name: 'lobby', type: 'purpur', workdir: '/home/container/server/Minecraft/lobby', command: 'bash start.sh', port: 25567, running: false }
];

const fileTree = {
  '/': [
    { name: 'server.properties', type: 'file', size: 932, modified: 'now' },
    { name: 'plugins', type: 'dir', size: '-', modified: 'now' },
    { name: 'logs', type: 'dir', size: '-', modified: 'now' },
    { name: 'start.sh', type: 'file', size: 128, modified: 'now' }
  ],
  '/plugins': [
    { name: 'README.txt', type: 'file', size: 44, modified: 'now' }
  ],
  '/logs': [
    { name: 'latest.log', type: 'file', size: 2048, modified: 'now' }
  ]
};

function fileContent(path) {
  if (path.endsWith('server.properties')) return 'server-ip=127.0.0.1\nserver-port=25566\nonline-mode=false\n';
  if (path.endsWith('start.sh')) return '#!/usr/bin/env bash\ncd "$(dirname "$0")"\nexec java -Xms1G -Xmx1G -jar minecraft.jar nogui\n';
  if (path.endsWith('latest.log')) return '[INFO] Demo latest.log\n[INFO] File manager is working in dev mode.\n';
  return 'Demo file content.\n';
}

export async function mockApi(path, options = {}) {
  await new Promise((resolve) => setTimeout(resolve, 120));
  if (path.startsWith('/auth/check')) return { ok: true };
  if (path === '/status') return { version: '3.0.0-SNAPSHOT+8', remote: 'local', activeProfile: state.selectedProfile || 'velocity' };
  if (path.includes('/minecraft/status') || path.includes('/minecraft/profiles')) return { profiles };
  if (path.includes('/minecraft/logs')) {
    const profile = new URLSearchParams(path.split('?')[1] || '').get('profile') || state.selectedProfile || 'velocity';
    return { lines: [`[MJT] Light UI demo for ${profile}`, `[${profile}] Done (2.314s)!`, `[${profile}] Type command: list`] };
  }
  if (path.includes('/minecraft/install')) return { ok: true, message: 'Demo install completed' };
  if (path.startsWith('/files/list') || path.startsWith('/api/files/list')) return { path: state.filePath, entries: fileTree[state.filePath] || [] };
  if (path.startsWith('/files/read') || path.startsWith('/api/files/read')) {
    const query = new URLSearchParams(path.split('?')[1] || '');
    return { path: query.get('path') || '/', content: fileContent(query.get('path') || '/') };
  }
  if (path.includes('/files/write') || path.includes('/files/mkdir') || path.includes('/files/create') || path.includes('/files/delete')) return { ok: true };
  return { ok: true };
}
