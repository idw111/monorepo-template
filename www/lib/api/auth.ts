import { apiClient } from '@/lib/api/client';

export type SessionUser = {
  email: string;
  id: number;
  nickname: string;
  role: 'admin' | 'user';
} | null;

type CurrentUserResponse = {
  user: SessionUser;
};

export const fetchCurrentUser = async () => {
  const response = await apiClient.get<CurrentUserResponse>('/auth');
  return response.data.user;
};
