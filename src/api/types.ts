export type ServerSoftware = 'velocity' | 'paper' | 'purpur' | 'minecraft';

export interface MinecraftProfile {
  name: string;
  type?: ServerSoftware | string;
  workdir?: string;
  command?: string;
  port?: number;
  running?: boolean;
  memory?: string;
  version?: string;
}

export interface CoreStatus {
  version?: string;
  activeProfile?: string;
  attachedProfile?: string;
  remote?: string;
  uptime?: string;
  panelUrl?: string;
}

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modifiedAt?: string;
}

export interface FileListResult {
  path: string;
  entries: FileEntry[];
}

export interface InstallRequest {
  software: 'velocity' | 'paper' | 'purpur';
  provider: 'velocity' | 'paper' | 'purpur';
  profile: string;
  version: string;
  build: string;
  port: number;
  memory: string;
  acceptEula: boolean;
  force: boolean;
}

export interface BackupItem {
  id: string;
  name: string;
  profile: string;
  size: string;
  createdAt: string;
  status: 'ready' | 'creating' | 'failed';
}

export interface PlayerItem {
  name: string;
  uuid?: string;
  ping?: number;
  online: boolean;
  op?: boolean;
  whitelisted?: boolean;
  joinedAt?: string;
}

export interface NetworkStatus {
  panelUrl?: string;
  localPanelUrl?: string;
  gateway?: {
    enabled: boolean;
    host?: string;
    port?: number;
  };
  tunnel?: {
    mode: 'local' | 'quick' | 'named' | 'disabled';
    status: 'online' | 'offline' | 'unknown';
    url?: string;
  };
  ports?: Array<{
    label: string;
    host: string;
    port: number;
    protocol: 'TCP' | 'UDP';
    status: 'open' | 'closed' | 'unknown';
  }>;
}

export interface SystemStatus {
  java?: string;
  os?: string;
  architecture?: string;
  memory?: string;
  disk?: string;
  cloudflared?: string;
  panelFrontend?: string;
}
