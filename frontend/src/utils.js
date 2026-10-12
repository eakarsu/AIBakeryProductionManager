const configuredApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API = configuredApiUrl
  ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`)
  : '/api';

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || data?.message || `Request failed (${response.status})`);
  if (data === null) throw new Error('The server returned an invalid response.');
  return data;
}
