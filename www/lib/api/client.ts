import axios from 'axios';
import { publicEnv } from '@/lib/env';

export const apiClient = axios.create({
  baseURL: publicEnv.apiBaseUrl ?? undefined,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
  withCredentials: true,
});
