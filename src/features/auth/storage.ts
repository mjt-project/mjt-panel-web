const TOKEN = 'mjt.panel.token';
const API = 'mjt.panel.api-base';

export function readToken() { return localStorage.getItem(TOKEN) ?? ''; }
export function saveToken(token: string) {
  localStorage.setItem(TOKEN, token);
  document.cookie = `MJT_TOKEN=${encodeURIComponent(token)}; Path=/; SameSite=Strict`;
}
export function clearToken() {
  localStorage.removeItem(TOKEN);
  document.cookie = 'MJT_TOKEN=; Path=/; Max-Age=0; SameSite=Strict';
}
export function readApiBase() { return localStorage.getItem(API) ?? '/api'; }
export function saveApiBase(value: string) { localStorage.setItem(API, value || '/api'); }

export function localDevEnabled(token: string) {
  return token === 'dev' && (location.hostname === '127.0.0.1' || location.hostname === 'localhost');
}
