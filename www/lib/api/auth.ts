import type { AuthUser } from 'shared';
import { apiClient } from '@/lib/api/client';

export type SessionUser = AuthUser | null;

type CurrentUserResponse = {
  user: SessionUser;
};

export const fetchCurrentUser = async () => {
  const response = await apiClient.get<CurrentUserResponse>('/auth');
  return response.data.user;
};
