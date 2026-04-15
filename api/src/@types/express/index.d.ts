import { UserPayload } from '@/services/auth';

declare global {
  namespace Express {
    interface Locals {
      user: UserPayload | null;
    }
  }
}
