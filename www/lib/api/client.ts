import axios from 'axios';
import { envvars } from '@/lib/envvars';

const CSRF_HEADER = 'x-csrf-token';

const getCsrfToken = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\s*)x-csrf-token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
};

const STATE_CHANGING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

export const apiClient = axios.create({
  baseURL: envvars.api() || undefined,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  if (method && STATE_CHANGING_METHODS.has(method)) {
    const token = getCsrfToken();
    if (token) {
      config.headers[CSRF_HEADER] = token;
    }
  }
  return config;
});
