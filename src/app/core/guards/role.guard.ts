import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';
import { defaultHomeForRole, isValidRole } from '../auth/role-permissions';

/**
 * Functional guard: requires auth + role in route data.roles.
 * Unauthenticated → /login
 * Authenticated but wrong/invalid role → role default home (no loop)
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const user = authService.getUser();
  const role = user?.role;

  if (!isValidRole(role)) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  const allowed = (route.data?.['roles'] as UserRole[] | undefined) ?? [];

  if (allowed.length === 0 || allowed.includes(role)) {
    return true;
  }

  const home = defaultHomeForRole(role);
  // Avoid redirecting to the same blocked path
  if (home === `/${route.routeConfig?.path}`) {
    return router.createUrlTree(['/login']);
  }
  return router.createUrlTree([home]);
};
