/** Role values matching backend Prisma Role enum */
export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

/**
 * Authenticated user payload returned by login/register
 * (backend does not currently include isActive on this payload).
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}
