// In-memory token storage (works in Expo Go without native modules)
let _tokens: { access: string | null; refresh: string | null } = {
  access: null,
  refresh: null,
};

const API_BASE = 'http://45.196.196.154';

export function getToken(): string | null {
  return _tokens.access;
}

export function setTokens(access: string, refresh: string) {
  _tokens.access = access;
  _tokens.refresh = refresh;
}

export function clearTokens() {
  _tokens.access = null;
  _tokens.refresh = null;
}

export async function api<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}
