import { mockApi } from './mock';
import type {
  BackupItem,
  CoreStatus,
  FileListResult,
  InstallRequest,
  MinecraftProfile,
  NetworkStatus,
  PlayerItem,
  SystemStatus,
} from './types';

export interface ApiOptions {
  baseUrl: string;
  token: string;
  demo: boolean;
}

async function request<T>(options: ApiOptions, path: string, init: RequestInit = {}): Promise<T> {
  if (options.demo) throw new Error('Mock endpoint must be called directly');

  const response = await fetch(`${options.baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-MJT-Token': options.token,
      Authorization: `Bearer ${options.token}`,
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  let data: unknown = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!response.ok) {
    const record = data as Record<string, unknown>;
    throw new Error(String(record.message || record.error || `HTTP ${response.status}`));
  }

  return data as T;
}

export function createApi(options: ApiOptions) {
  const useMock = options.demo;

  return {
    checkAuth: (): Promise<{ ok: boolean }> => useMock
      ? mockApi.checkAuth()
      : request<{ ok: boolean }>(options, `/auth/check?token=${encodeURIComponent(options.token)}`),
    getStatus: (): Promise<CoreStatus> => useMock
      ? mockApi.getStatus()
      : request<CoreStatus>(options, '/status'),
    getProfiles: (): Promise<{ profiles: MinecraftProfile[] }> => useMock
      ? mockApi.getProfiles()
      : request<{ profiles: MinecraftProfile[] }>(options, '/minecraft/status'),
    logs: (profile: string): Promise<{ lines: string[] }> => useMock
      ? mockApi.logs(profile)
      : request<{ lines: string[] }>(options, `/minecraft/logs?profile=${encodeURIComponent(profile)}`),
    action: (profile: string, action: 'start' | 'stop' | 'restart' | 'kill'): Promise<{ ok: boolean }> => useMock
      ? mockApi.serverAction(profile, action)
      : request<{ ok: boolean }>(options, `/minecraft/${action}`, { method: 'POST', body: JSON.stringify({ profile }) }),
    sendCommand: (profile: string, command: string): Promise<{ ok: boolean; profile?: string; command?: string }> => useMock
      ? mockApi.command(profile, command)
      : request<{ ok: boolean; profile?: string; command?: string }>(options, '/minecraft/send', { method: 'POST', body: JSON.stringify({ profile, command }) }),
    install: (payload: InstallRequest): Promise<{ ok: boolean; message?: string }> => useMock
      ? mockApi.install(payload)
      : request<{ ok: boolean; message?: string }>(options, '/minecraft/install', { method: 'POST', body: JSON.stringify(payload) }),
    listFiles: (profile: string, path: string): Promise<FileListResult> => useMock
      ? mockApi.listFiles(profile, path)
      : request<FileListResult>(options, `/files/list?profile=${encodeURIComponent(profile)}&path=${encodeURIComponent(path)}`),
    readFile: (profile: string, path: string): Promise<{ path: string; content: string }> => useMock
      ? mockApi.readFile(profile, path)
      : request<{ path: string; content: string }>(options, `/files/read?profile=${encodeURIComponent(profile)}&path=${encodeURIComponent(path)}`),
    saveFile: (profile: string, path: string, content: string): Promise<{ ok: boolean }> => useMock
      ? mockApi.saveFile(profile, path, content)
      : request<{ ok: boolean }>(options, '/files/write', { method: 'POST', body: JSON.stringify({ profile, path, content }) }),
    createFile: (profile: string, path: string): Promise<{ ok: boolean }> => useMock
      ? mockApi.createFile(profile, path)
      : request<{ ok: boolean }>(options, '/files/create', { method: 'POST', body: JSON.stringify({ profile, path }) }),
    createDirectory: (profile: string, path: string): Promise<{ ok: boolean }> => useMock
      ? mockApi.createDirectory(profile, path)
      : request<{ ok: boolean }>(options, '/files/mkdir', { method: 'POST', body: JSON.stringify({ profile, path }) }),
    renameFile: (profile: string, path: string, newPath: string): Promise<{ ok: boolean }> => useMock
      ? mockApi.renameFile(profile, path, newPath)
      : request<{ ok: boolean }>(options, '/files/rename', { method: 'POST', body: JSON.stringify({ profile, path, newPath }) }),
    deleteFile: (profile: string, path: string): Promise<{ ok: boolean }> => useMock
      ? mockApi.deleteFile(profile, path)
      : request<{ ok: boolean }>(options, '/files/delete', { method: 'POST', body: JSON.stringify({ profile, path }) }),
    listBackups: (profile: string): Promise<{ backups: BackupItem[] }> => useMock
      ? mockApi.listBackups(profile)
      : request<{ backups: BackupItem[] }>(options, `/backups/list?profile=${encodeURIComponent(profile)}`),
    createBackup: (profile: string, name?: string): Promise<{ ok: boolean; backup?: BackupItem }> => useMock
      ? mockApi.createBackup(profile, name)
      : request<{ ok: boolean; backup?: BackupItem }>(options, '/backups/create', { method: 'POST', body: JSON.stringify({ profile, name }) }),
    restoreBackup: (profile: string, id: string): Promise<{ ok: boolean }> => useMock
      ? mockApi.restoreBackup(profile, id)
      : request<{ ok: boolean }>(options, '/backups/restore', { method: 'POST', body: JSON.stringify({ profile, id }) }),
    deleteBackup: (profile: string, id: string): Promise<{ ok: boolean }> => useMock
      ? mockApi.deleteBackup(profile, id)
      : request<{ ok: boolean }>(options, '/backups/delete', { method: 'POST', body: JSON.stringify({ profile, id }) }),
    listPlayers: (profile: string): Promise<{ players: PlayerItem[] }> => useMock
      ? mockApi.listPlayers(profile)
      : request<{ players: PlayerItem[] }>(options, `/players/list?profile=${encodeURIComponent(profile)}`),
    playerAction: (profile: string, action: string, player: string): Promise<{ ok: boolean }> => useMock
      ? mockApi.playerAction(profile, action, player)
      : request<{ ok: boolean }>(options, '/players/action', { method: 'POST', body: JSON.stringify({ profile, action, player }) }),
    getNetwork: (): Promise<NetworkStatus> => useMock
      ? mockApi.getNetwork()
      : request<NetworkStatus>(options, '/network/status'),
    getSystem: (): Promise<SystemStatus> => useMock
      ? mockApi.getSystem()
      : request<SystemStatus>(options, '/system/status'),
  };
}

export type MjtApi = ReturnType<typeof createApi>;
