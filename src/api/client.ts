import { mockResponse } from './mock';
import type { Capabilities, FileEntry, PanelStatus, ServerProfile } from './types';

export class ApiClient {
  constructor(
    private readonly apiBase: string,
    private readonly token: string,
    private readonly demo = false
  ) {}

  private headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-MJT-Token': this.token,
      Authorization: `Bearer ${this.token}`
    };
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (this.demo) return mockResponse(path) as Promise<T>;

    const response = await fetch(`${this.apiBase}${path}`, {
      ...init,
      headers: { ...this.headers(), ...(init?.headers ?? {}) }
    });
    const raw = await response.text();
    let data: unknown = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = { message: raw }; }

    if (!response.ok) {
      const message = typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message: unknown }).message)
        : `HTTP ${response.status}`;
      throw new Error(message || `HTTP ${response.status}`);
    }
    return data as T;
  }

  checkAuth() { return this.request<{ ok: boolean }>(`/auth/check?token=${encodeURIComponent(this.token)}`); }
  status() { return this.request<PanelStatus>('/status'); }

  async servers(): Promise<ServerProfile[]> {
    const result = await this.request<{ profiles?: ServerProfile[] } | ServerProfile[]>('/minecraft/status');
    return Array.isArray(result) ? result : (result.profiles ?? []);
  }

  async capabilities(): Promise<Capabilities> {
    try {
      const result = await this.request<{ features?: Partial<Capabilities> }>('/capabilities');
      return { files: Boolean(result.features?.files), backups: Boolean(result.features?.backups), players: Boolean(result.features?.players), network: Boolean(result.features?.network), system: Boolean(result.features?.system) };
    } catch {
      return { files: false, backups: false, players: false, network: false, system: false };
    }
  }

  async action(action: 'start' | 'stop' | 'kill' | 'restart', profile: string) {
    if (action === 'restart') {
      await this.request('/minecraft/stop', { method: 'POST', body: JSON.stringify({ profile }) });
      return this.request('/minecraft/start', { method: 'POST', body: JSON.stringify({ profile }) });
    }
    return this.request(`/minecraft/${action}`, { method: 'POST', body: JSON.stringify({ profile }) });
  }

  sendCommand(profile: string, command: string) {
    return this.request('/minecraft/send', { method: 'POST', body: JSON.stringify({ profile, command }) });
  }

  logs(profile: string) { return this.request<{ lines?: string[] }>(`/minecraft/logs?profile=${encodeURIComponent(profile)}`); }

  install(payload: Record<string, unknown>) {
    return this.request('/minecraft/install', { method: 'POST', body: JSON.stringify(payload) });
  }

  listFiles(workspace: string, path = '') {
    return this.request<{ entries?: FileEntry[] }>(`/workspaces/${encodeURIComponent(workspace)}/files/list?path=${encodeURIComponent(path)}`);
  }

  readFile(workspace: string, path: string) {
    return this.request<{ content?: string }>(`/workspaces/${encodeURIComponent(workspace)}/files/read?path=${encodeURIComponent(path)}`);
  }

  writeFile(workspace: string, path: string, content: string) {
    return this.request(`/workspaces/${encodeURIComponent(workspace)}/files/write`, { method: 'POST', body: JSON.stringify({ path, content }) });
  }
}
