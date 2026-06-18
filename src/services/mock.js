const profiles = [
  { name: 'velocity', type: 'Velocity', port: 25565, workdir: '/home/container/server/Minecraft/Velocity', running: true },
  { name: 'smp', type: 'Paper', port: 25566, workdir: '/home/container/server/Minecraft/smp', running: false },
  { name: 'lobby', type: 'Purpur', port: 25567, workdir: '/home/container/server/Minecraft/lobby', running: false }
];

export async function mockApi(path, options = {}) {
  await new Promise((resolve) => setTimeout(resolve, 180));
  if (path.startsWith('/auth/check')) return { ok: true };
  if (path === '/status') return { version: '3.0.0-SNAPSHOT+8', activeProfile: 'velocity' };
  if (path.startsWith('/minecraft/status') || path.startsWith('/minecraft/profiles')) return { profiles };
  if (path.startsWith('/minecraft/logs')) return { lines: ['[MJT] Mock console connected.', '[Server] Done (1.23s)! Type “list” or “say hello”.'] };
  if (path.startsWith('/minecraft/install')) return { ok: true, message: 'Mock installation completed. The core installer will perform the real download.' };
  if (path.startsWith('/files/list')) return { items: [{ name: 'server.properties', type: 'file', size: '1.8 KB' }, { name: 'plugins', type: 'directory', size: '—' }] };
  return { ok: true, options };
}
