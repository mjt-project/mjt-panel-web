const TOKEN_KEY = 'mjt.panel.token';
const API_KEY = 'mjt.panel.apiBase';

export function loadToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
export function loadApiBase() { return localStorage.getItem(API_KEY) || '/api'; }

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token || '');
  document.cookie = `MJT_TOKEN=${encodeURIComponent(token || '')}; Path=/; SameSite=Strict`;
}

export function saveApiBase(apiBase) { localStorage.setItem(API_KEY, apiBase || '/api'); }

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = 'MJT_TOKEN=; Path=/; Max-Age=0; SameSite=Strict';
}
