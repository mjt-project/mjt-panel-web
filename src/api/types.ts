export type ServerStatus = 'running' | 'stopped' | 'starting' | 'unknown';
export type ServerSoftware = 'velocity' | 'paper' | 'purpur' | 'minecraft';

export interface ServerProfile {
  name: string;
  type: ServerSoftware | string;
  workdir?: string;
  command?: string;
  port?: number;
  running: boolean;
  status?: ServerStatus;
  version?: string;
}

export interface PanelStatus {
  version?: string;
  remote?: string;
  activeProfile?: string;
}

export interface FileEntry {
  name: string;
  path: string;
  directory: boolean;
  size?: number;
  modifiedAt?: string;
}

export interface Capabilities {
  files: boolean;
  backups: boolean;
  players: boolean;
  network: boolean;
  system: boolean;
}
