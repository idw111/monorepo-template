import { apiClient } from '@/lib/api/client';

export async function fetchServerStatus() {
  const response = await apiClient.get<string>('/status');
  return response.data;
}
