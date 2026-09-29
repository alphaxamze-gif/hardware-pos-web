import { UserRole } from '../models';

/** Roles recognized by Hardware PRO (matches backend Prisma Role). */
export const VALID_ROLES: readonly UserRole[] = ['ADMIN', 'MANAGER', 'CASHIER'] as const;

export function isValidRole(role: unknown): role is UserRole {
  return typeof role === 'string' && (VALID_ROLES as readonly string[]).includes(role);
}

/**
 * Backend-aligned feature permissions (verified API authorize lists).
 * Only used by frontend nav/routing — does not change the backend.
 */
export const FEATURE_ROLES = {
  dashboard: ['ADMIN', 'MANAGER'] as UserRole[],
  products: ['ADMIN', 'MANAGER'] as UserRole[],
  categories: ['ADMIN', 'MANAGER'] as UserRole[],
  customers: ['ADMIN', 'MANAGER', 'CASHIER'] as UserRole[],
  sales: ['ADMIN', 'MANAGER', 'CASHIER'] as UserRole[],
  salesHistory: ['ADMIN', 'MANAGER', 'CASHIER'] as UserRole[],
  purchases: ['ADMIN', 'MANAGER'] as UserRole[],
  suppliers: ['ADMIN', 'MANAGER'] as UserRole[],
  payments: ['ADMIN', 'MANAGER', 'CASHIER'] as UserRole[],
  expenses: ['ADMIN', 'MANAGER'] as UserRole[],
  reminders: ['ADMIN', 'MANAGER'] as UserRole[],
  users: ['ADMIN'] as UserRole[],
} as const;

export type FeatureKey = keyof typeof FEATURE_ROLES;

/** Default landing path after login / role denial (must be a registered route). */
export function defaultHomeForRole(role: UserRole | null | undefined): string {
  if (role === 'CASHIER') {
    return '/customers';
  }
  if (role === 'ADMIN' || role === 'MANAGER') {
    return '/dashboard';
  }
  return '/login';
}
