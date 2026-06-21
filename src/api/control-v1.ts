/**
 * Typed client for MJT Core's /api/v1 control API.
 *
 * Authentication is sent only through X-MJT-Token, never as a query parameter.
 */
export interface ControlApiErrorShape {
  ok: false;
  error: { code: string; message: string };
}

export class ControlApiRequestError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ControlApiRequestError';
  }
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
  activeEnvironment?: string;
  hostArchitecture?: string;
  distroEngineReady?: boolean;
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

/** Native-only environments exposed by Core Phase 8. */
export interface DistroCatalogEntry {
  id: 'debian-12' | 'ubuntu-24.04' | 'alpine-3.21' | string;
  label: string;
  image: string;
  architecture: string;
  packageManager: 'apt' | 'apk' | string;
}

export interface DistroCatalogSnapshot {
  ok: true;
  hostArchitecture: string;
  displayArchitecture: string;
  supported: boolean;
  environments: DistroCatalogEntry[];
}

export interface DistroEngineInfo {
  enabled: boolean;
  linuxHost: boolean;
  hostArchitecture: string;
  displayArchitecture: string;
  architectureSupported: boolean;
  python: string;
  pythonReady: boolean;
  proot: string;
  prootReady: boolean;
  path: string;
  ready: boolean;
  version: string;
  activeEnvironment: string;
  runtimeDirectory: string;
  cacheDirectory: string;
}

export interface DistroEngineSnapshot {
  ok: true;
  engine: DistroEngineInfo;
}

export interface DistroEnvironment {
  name: string;
  source: string;
  rootfs: string;
  architecture: string;
  active: boolean;
  ready: boolean;
}

export interface DistroListSnapshot {
  ok: true;
  activeEnvironment: string;
  environments: DistroEnvironment[];
}

export interface DistroJob {
  id: string;
  type: string;
  target: string;
  state: 'queued' | 'running' | 'succeeded' | 'failed' | string;
  message: string;
  createdAt: string;
  startedAt: string;
  finishedAt: string;
  logs: string[];
}

export interface DistroJobSnapshot {
  ok: true;
  job: DistroJob;
}

export interface AcceptedDistroJob {
  ok: true;
  accepted: true;
  jobId: string;
}

export interface InstallDistroInput {
  catalogId: string;
  /** Empty lets Core use the safe catalog default. */
  name?: string;
  activate?: boolean;
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

  /** Environment / PRoot-Distro API (MJT Core Phase 8). */
  public distroCatalog(): Promise<DistroCatalogSnapshot> {
    return this.request('/distros/catalog');
  }

  public distroEngine(): Promise<DistroEngineSnapshot> {
    return this.request('/distros/engine');
  }

  public listDistros(): Promise<DistroListSnapshot> {
    return this.request('/distros');
  }

  public installDistroEngine(): Promise<AcceptedDistroJob> {
    return this.request('/distros/engine/install', { method: 'POST', body: '{}' });
  }

  public updateDistroEngine(version?: string): Promise<AcceptedDistroJob> {
    return this.request('/distros/engine/update', { method: 'POST', body: JSON.stringify({ version: version ?? '' }) });
  }

  public installDistro(input: InstallDistroInput): Promise<AcceptedDistroJob> {
    return this.request('/distros/install', { method: 'POST', body: JSON.stringify(input) });
  }

  public getDistro(name: string): Promise<DistroEnvironment> {
    return this.request(`/distros/${encodeURIComponent(name)}`);
  }

  public activateDistro(name: string): Promise<AcceptedDistroJob> {
    return this.request(`/distros/${encodeURIComponent(name)}/activate`, { method: 'POST', body: '{}' });
  }

  public removeDistro(name: string): Promise<AcceptedDistroJob> {
    return this.request(`/distros/${encodeURIComponent(name)}/remove`, { method: 'POST', body: '{}' });
  }

  public distroJob(jobId: string): Promise<DistroJobSnapshot> {
    return this.request(`/distros/jobs/${encodeURIComponent(jobId)}`);
  }

  /**
   * Stream SSE through fetch rather than EventSource because EventSource cannot
   * send the X-MJT-Token header. Returns when the caller aborts or server ends.
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

  private async toError(response: Response): Promise<ControlApiRequestError> {
    let data: unknown;
    try { data = await response.json(); } catch {
      return new ControlApiRequestError(`HTTP ${response.status}`, response.status);
    }
    if (typeof data === 'object' && data !== null && 'error' in data) {
      const error = (data as ControlApiErrorShape).error;
      if (error?.message) return new ControlApiRequestError(error.message, response.status, error.code);
    }
    return new ControlApiRequestError(`HTTP ${response.status}`, response.status);
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
  if (!directAbsoluteUrl || !url.port || url.port === '9090') url.port = '9091';
  url.pathname = '/api/v1';
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}
