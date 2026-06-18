const TOKEN_KEY = 'mjt.panel.token';
const API_KEY = 'mjt.panel.apiBase';

export const authStorage = {
  token: () => localStorage.getItem(TOKEN_KEY) || '',
  apiBase: () => localStorage.getItem(API_KEY) || '/api',
  save(token: string, apiBase: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(API_KEY, apiBase || '/api');
    document.cookie = `MJT_TOKEN=${encodeURIComponent(token)}; Path=/; SameSite=Strict`;
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = 'MJT_TOKEN=; Path=/; Max-Age=0; SameSite=Strict';
  },
};
