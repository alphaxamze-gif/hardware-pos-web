import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { AuthUser } from '../models';

function makeUser(role: AuthUser['role']): AuthUser {
  return {
    id: 'u1',
    email: `${role.toLowerCase()}@test.local`,
    firstName: 'Test',
    lastName: role,
    role,
  };
}

describe('roleGuard', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', [
      'isLoggedIn',
      'getUser',
      'logout',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    });

    router = TestBed.inject(Router);
    spyOn(router, 'createUrlTree').and.callThrough();
  });

  function runGuard(roles: string[]) {
    return TestBed.runInInjectionContext(() =>
      roleGuard({ data: { roles } } as any, {} as any)
    );
  }

  it('redirects unauthenticated users to /login', () => {
    auth.isLoggedIn.and.returnValue(false);
    auth.getUser.and.returnValue(null);

    const result = runGuard(['ADMIN']);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).not.toBe(true);
  });

  it('ADMIN can access ADMIN+MANAGER route (dashboard)', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('ADMIN'));
    expect(runGuard(['ADMIN', 'MANAGER'])).toBe(true);
  });

  it('MANAGER can access manager routes', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('MANAGER'));
    expect(runGuard(['ADMIN', 'MANAGER'])).toBe(true);
  });

  it('MANAGER cannot access Users (ADMIN only)', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('MANAGER'));
    const result = runGuard(['ADMIN']);
    expect(result).not.toBe(true);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('CASHIER can access Customers', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('CASHIER'));
    expect(runGuard(['ADMIN', 'MANAGER', 'CASHIER'])).toBe(true);
  });

  it('CASHIER can access Sales/POS roles', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('CASHIER'));
    expect(runGuard(['ADMIN', 'MANAGER', 'CASHIER'])).toBe(true);
  });

  it('CASHIER can access Sales History roles', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('CASHIER'));
    expect(runGuard(['ADMIN', 'MANAGER', 'CASHIER'])).toBe(true);
  });

  it('CASHIER can access Payments roles', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('CASHIER'));
    expect(runGuard(['ADMIN', 'MANAGER', 'CASHIER'])).toBe(true);
  });

  it('CASHIER cannot access Dashboard', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('CASHIER'));
    const result = runGuard(['ADMIN', 'MANAGER']);
    expect(result).not.toBe(true);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/customers']);
  });

  it('CASHIER cannot access Products', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('CASHIER'));
    expect(runGuard(['ADMIN', 'MANAGER'])).not.toBe(true);
  });

  it('CASHIER cannot access Categories', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('CASHIER'));
    expect(runGuard(['ADMIN', 'MANAGER'])).not.toBe(true);
  });

  it('CASHIER cannot access Purchases', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('CASHIER'));
    expect(runGuard(['ADMIN', 'MANAGER'])).not.toBe(true);
  });

  it('CASHIER cannot access Suppliers', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('CASHIER'));
    expect(runGuard(['ADMIN', 'MANAGER'])).not.toBe(true);
  });

  it('CASHIER cannot access Expenses', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('CASHIER'));
    expect(runGuard(['ADMIN', 'MANAGER'])).not.toBe(true);
  });

  it('CASHIER cannot access Reminders', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('CASHIER'));
    expect(runGuard(['ADMIN', 'MANAGER'])).not.toBe(true);
  });

  it('CASHIER cannot access Users', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue(makeUser('CASHIER'));
    expect(runGuard(['ADMIN'])).not.toBe(true);
  });

  it('invalid role logs out and sends to login', () => {
    auth.isLoggedIn.and.returnValue(true);
    auth.getUser.and.returnValue({ ...makeUser('ADMIN'), role: 'HACKER' as any });
    const result = runGuard(['ADMIN']);
    expect(auth.logout).toHaveBeenCalled();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).not.toBe(true);
  });
});
