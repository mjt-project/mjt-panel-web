import { loadApiBase, loadToken } from '../services/storage.js';

export const state = {
  apiBase: loadApiBase(),
  token: loadToken(),
  demo: false,
  currentPage: 'dashboard',
  status: null,
  profiles: [],
  selectedProfile: '',
  logsPaused: false,
  logsTimer: null,
  commandHistory: [],
  filePath: '/',
  files: [],
  selectedFile: null,
  fileContent: ''
};

export function selectedProfile() {
  return state.profiles.find((p) => p.name === state.selectedProfile) || null;
}
