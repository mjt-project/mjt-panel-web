import { loadApiBase, loadToken } from '../services/storage.js';

export const state = {
  apiBase: loadApiBase(),
  token: loadToken(),
  demo: false,
  page: 'dashboard',
  status: null,
  profiles: [],
  selectedProfile: '',
  consoleLines: [],
  commandHistory: [],
  logsPaused: false,
  logTimer: null,
  fileState: {
    path: '/',
    loaded: false,
    loading: false,
    error: '',
    items: [],
    selectedFile: null,
    content: ''
  }
};

export function currentProfile() {
  return state.profiles.find((profile) => profile.name === state.selectedProfile) || null;
}
