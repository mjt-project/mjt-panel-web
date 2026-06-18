import { state } from '../app/state.js';
import { mockApi } from './mock.js';

export async function api(path, options = {}) {
  if (state.demo) return mockApi(path, options);

  const response = await fetch(`${state.apiBase}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-MJT-Token': state.token,
      'Authorization': `Bearer ${state.token}`,
      ...(options.headers || {})
    }
  });

  const raw = await response.text();
  let body = {};
  try { body = raw ? JSON.parse(raw) : {}; }
  catch { body = { raw }; }

  if (!response.ok) throw new Error(body.message || body.error || `Request failed (${response.status})`);
  return body;
}
