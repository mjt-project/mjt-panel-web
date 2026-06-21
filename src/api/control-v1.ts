/**
 * Typed client for MJT Core's loopback-only /api/v1 control API.
 *
 * It deliberately uses a request header for authentication. Tokens are never
 * appended to a URL, therefore they do not leak through browser history,
 * referrers or proxy logs.
 */
export interface ControlApiErrorShape {
  ok: false;
  error: { code: string; message: string };
}

export interface ServiceLifecycle {
  autostart: boolean;
  restartPolicy: 'never' | 'on-failure' | 'always' | string;
  restartMax: number;
  restartDelay: number;
}

export interface ServiceHealth {
  enabled: boolean;
  path: string;
  status: string;
  detail: string;
  failures: number;
}

export interface GuestService {
  id: string;
  enabled: boolean;
  type: string;
  runtime: 'proot' | string;
  workdir: string;
  command: string;
  host: string;
  port: number;
  running: boolean;
  public: { enabled: boolean; hostname: string };
  lifecycle: ServiceLifecycle;
  health: ServiceHealth;
  runtimeState: {
    lastExitCode: number | null;
    restartCount: number;
    lastRestartReason: string;
  };
}

export interface CreateGuestServiceInput {
  id: string;
  type: string;
  workdir: string;
  command: string;
  port?: number;
  host?: string;
  publicHostname?: string;
  healthEnabled?: boolean;
  healthPath?: string;
  restartPolicy?: 'never' | 'on-failure' | 'always';
  restartMax?: number;
  restartDelay?: number;
  autostart?: boolean;
}

export type UpdateGuestServiceInput = Partial<Omit<CreateGuestServiceInput, 'id'>> & {
  enabled?: boolean;
  publicEnabled?: boolean;
  healthInterval?: number;
  healthTimeout?: number;
  healthFailures?: number;
  healthAction?: 'report' | 'restart';
};

export interface CoreStatus {
  ok: true;
  apiVersion: number;
  coreVersion: string;
  release: string;
  serverTime: string;
  activeProfile: string;
  guestServices: number;
}

export interface NetworkSnapshot {
  ok: true;
  gateway: { enabled: boolean; host: string; port: string };
  tunnel: { enabled: boolean; mode: string; running: boolean };
  publishedServices: Array<{ serviceId: string; hostname: string; origin: string }>;
}

export interface ServiceEvent {
  event: 'log' | 'status' | 'unknown';
  data: unknown;
}

export class PanelControlApi {
  private readonly base: string;

  public constructor(apiBase: string, private readonly token: string) {
    this.base = apiBase.replace(/\/+$/, '');
  }

  public checkAuth(): Promise<{ ok: true; authenticated: true }> {
    return this.request('/auth/check');
  }

  public status(): Promise<CoreStatus> {
    return this.request('/status');
  }

  public listServices(): Promise<{ ok: true; services: GuestService[] }> {
    return this.request('/services');
  }

  public getService(id: string): Promise<GuestService> {
    return this.request(`/services/${encodeURIComponent(id)}`);
  }

  public createService(input: CreateGuestServiceInput): Promise<GuestService> {
    return this.request('/services', { method: 'POST', body: JSON.stringify(input) });
  }

  public updateService(id: string, input: UpdateGuestServiceInput): Promise<GuestService> {
    return this.request(`/services/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) });
  }

  public async deleteService(id: string): Promise<void> {
    await this.request(`/services/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  public serviceAction(
    id: string,
    action: 'start' | 'stop' | 'restart' | 'publish' | 'unpublish' | 'health'
  ): Promise<GuestService> {
    return this.request(`/services/${encodeURIComponent(id)}/${action}`, { method: 'POST', body: '{}' });
  }

  public serviceLogs(id: string, lines = 300): Promise<{ ok: true; id: string; lines: string[] }> {
    return this.request(`/services/${encodeURIComponent(id)}/logs?lines=${Math.max(1, Math.min(2000, lines))}`);
  }

  public network(): Promise<NetworkSnapshot> {
    return this.request('/network');
  }

  /**
   * Stream SSE through fetch rather than EventSource because EventSource cannot
   * send the X-MJT-Token header. Returns when the caller aborts or server ends
   * its bounded stream.
   */
  public async streamServiceEvents(
    id: string,
    onEvent: (event: ServiceEvent) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const response = await fetch(`${this.base}/services/${encodeURIComponent(id)}/events`, {
      headers: this.headers(),
      signal,
    });
    if (!response.ok || !response.body) {
      throw await this.toError(response);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffered = '';
    let eventName = 'unknown';
    let dataLines: string[] = [];

    const flush = () => {
      if (dataLines.length === 0) return;
      const text = dataLines.join('\n');
      let data: unknown = text;
      try { data = JSON.parse(text); } catch { /* line stays text */ }
      onEvent({ event: eventName === 'log' || eventName === 'status' ? eventName : 'unknown', data });
      eventName = 'unknown';
      dataLines = [];
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffered += decoder.decode(value, { stream: true });
      let lineEnd: number;
      while ((lineEnd = buffered.indexOf('\n')) >= 0) {
        const line = buffered.slice(0, lineEnd).replace(/\r$/, '');
        buffered = buffered.slice(lineEnd + 1);
        if (!line) { flush(); continue; }
        if (line.startsWith('event:')) eventName = line.slice(6).trim();
        if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
      }
    }
    flush();
  }

  private headers(): HeadersInit {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-MJT-Token': this.token,
    };
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.base}${path}`, {
      ...init,
      headers: { ...this.headers(), ...(init?.headers ?? {}) },
    });
    if (!response.ok) throw await this.toError(response);
    return (await response.json()) as T;
  }

  private async toError(response: Response): Promise<Error> {
    let data: unknown;
    try { data = await response.json(); } catch { return new Error(`HTTP ${response.status}`); }
    if (typeof data === 'object' && data !== null && 'error' in data) {
      const error = (data as ControlApiErrorShape).error;
      if (error?.message) return new Error(error.message);
    }
    return new Error(`HTTP ${response.status}`);
  }
}

const CONTROL_API_BASE_STORAGE_KEY = 'mjt.panel.controlApiBase';

export function readControlApiBase(legacyApiBase: string): string {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(CONTROL_API_BASE_STORAGE_KEY)?.trim();
    if (saved) return saved.replace(/\/+$/, '');
  }
  return inferControlApiBase(legacyApiBase);
}

export function saveControlApiBase(apiBase: string): void {
  if (typeof window === 'undefined') return;
  const clean = apiBase.trim().replace(/\/+$/, '');
  if (clean) window.localStorage.setItem(CONTROL_API_BASE_STORAGE_KEY, clean);
  else window.localStorage.removeItem(CONTROL_API_BASE_STORAGE_KEY);
}

/**
 * Converts the legacy static-panel base (usually :9090) to the v1 API base
 * (usually :9091/api/v1). A direct /api/v1 URL is preserved unchanged.
 */
export function inferControlApiBase(legacyOrApiBase: string, browserOrigin?: string): string {
  const input = legacyOrApiBase.trim();
  if (input.includes('/api/v1')) return input.replace(/\/+$/, '');
  const origin = browserOrigin ?? (typeof window === 'undefined' ? 'http://127.0.0.1:9090' : window.location.origin);
  const directAbsoluteUrl = /^https?:\/\//i.test(input);
  const url = new URL(input || origin, origin);
  // Relative `/api` in Vite development points to the frontend port, not Core.
  if (!directAbsoluteUrl || !url.port || url.port === '9090') url.port = '9091';
  url.pathname = '/api/v1';
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}
