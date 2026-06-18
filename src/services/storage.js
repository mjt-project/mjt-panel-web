const TOKEN_KEY = 'mjtToken';
const API_BASE_KEY = 'mjtApiBase';

export function loadToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token || '');
  document.cookie = `MJT_TOKEN=${encodeURIComponent(token || '')}; Path=/; SameSite=Strict`;
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = 'MJT_TOKEN=; Path=/; Max-Age=0; SameSite=Strict';
}
export function loadApiBase() { return localStorage.getItem(API_BASE_KEY) || '/api'; }
export function saveApiBase(apiBase) { localStorage.setItem(API_BASE_KEY, apiBase || '/api'); }
