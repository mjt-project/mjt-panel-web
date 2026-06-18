import { loadApiBase, loadToken } from '../services/storage.js';

export const state = {
  apiBase: loadApiBase(),
  token: loadToken(),
  demo: false,
  status: null,
  profiles: [],
  selectedProfile: '',
  currentPage: 'dashboard',
  logsPaused: false,
  logsTimer: null,
  commandHistory: [],
  filePath: '/',
  selectedFile: null,
  fileContent: ''
};

export function selectedProfile() {
  return state.profiles.find((profile) => profile.name === state.selectedProfile) || null;
}
