import { state } from '../app/state.js';
import { mockApi } from './mockApi.js';

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-MJT-Token': state.token,
    'Authorization': `Bearer ${state.token}`
  };
}

export async function api(path, options = {}) {
  if (state.demo) return mockApi(path, options);

  const response = await fetch(`${state.apiBase}${path}`, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) }
  });

  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!response.ok) throw new Error(data.message || data.error || `HTTP ${response.status}`);
  return data;
}
