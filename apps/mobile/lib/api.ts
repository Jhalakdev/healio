import * as SecureStore from 'expo-secure-store';

const API_BASE = __DEV__ ? 'http://192.168.0.101:3000' : 'https://api.healio.in';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('accessToken');
}

export async function setTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync('accessToken', access);
  await SecureStore.setItemAsync('refreshToken', refresh);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
}

export async function api<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
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
