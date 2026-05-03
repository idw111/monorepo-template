import axios from 'axios';
import { envvars } from '@/lib/envvars';

export const apiClient = axios.create({
  baseURL: envvars.api() || undefined,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
});
