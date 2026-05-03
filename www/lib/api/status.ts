import { apiClient } from '@/lib/api/client';

export const fetchServerStatus = async () => {
  const response = await apiClient.get<string>('/status');
  return response.data;
};
