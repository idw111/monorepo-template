import { AuthUser } from '@/services/auth';

declare global {
  namespace Express {
    interface Locals {
      user: AuthUser | null;
    }
  }
}
