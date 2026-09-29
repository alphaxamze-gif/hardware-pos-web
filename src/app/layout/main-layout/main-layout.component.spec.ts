import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { AuthUser } from '../../core/models';

function user(role: AuthUser['role']): AuthUser {
  return {
    id: '1',
    email: 't@test.local',
    firstName: 'T',
    lastName: 'U',
    role,
  };
}

describe('MainLayoutComponent role navigation', () => {
  let fixture: ComponentFixture<MainLayoutComponent>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', [
      'getUser',
      'hasAnyRole',
      'logout',
    ]);

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();
  });

  function createWithRole(role: AuthUser['role']) {
    auth.getUser.and.returnValue(user(role));
    auth.hasAnyRole.and.callFake((roles: string[]) => roles.includes(role));
    fixture = TestBed.createComponent(MainLayoutComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should create', () => {
    auth.getUser.and.returnValue(user('ADMIN'));
    auth.hasAnyRole.and.returnValue(true);
    fixture = TestBed.createComponent(MainLayoutComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('CASHIER does not see Dashboard, Products, Categories, Purchases, Suppliers, Expenses, Reminders, Users', () => {
    const el = createWithRole('CASHIER');
    const text = el.textContent || '';
    expect(text).not.toContain('Dashboard');
    expect(text).not.toContain('Products');
    expect(text).not.toContain('Categories');
    expect(text).not.toContain('Purchases');
    expect(text).not.toContain('Suppliers');
    expect(text).not.toContain('Expenses');
    expect(text).not.toContain('Due Reminders');
    expect(text).not.toContain('Users');
  });

  it('CASHIER sees Customers, POS, Sales History, Payments', () => {
    const el = createWithRole('CASHIER');
    const text = el.textContent || '';
    expect(text).toContain('Customers');
    expect(text).toContain('POS / New Sale');
    expect(text).toContain('Sales History');
    expect(text).toContain('Payments');
  });

  it('MANAGER does not see Users', () => {
    const el = createWithRole('MANAGER');
    expect(el.textContent || '').not.toContain('Users');
  });

  it('MANAGER sees Dashboard and Products', () => {
    const el = createWithRole('MANAGER');
    const text = el.textContent || '';
    expect(text).toContain('Dashboard');
    expect(text).toContain('Products');
  });

  it('ADMIN sees Users', () => {
    const el = createWithRole('ADMIN');
    expect(el.textContent || '').toContain('Users');
  });
});
