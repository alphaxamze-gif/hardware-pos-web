import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { FEATURE_ROLES } from './core/auth/role-permissions';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: FEATURE_ROLES.dashboard },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'products',
        canActivate: [roleGuard],
        data: { roles: FEATURE_ROLES.products },
        loadComponent: () =>
          import('./features/products/products.component').then(
            (m) => m.ProductsComponent
          ),
      },
      {
        path: 'categories',
        canActivate: [roleGuard],
        data: { roles: FEATURE_ROLES.categories },
        loadComponent: () =>
          import('./features/categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
      },
      {
        path: 'customers',
        canActivate: [roleGuard],
        data: { roles: FEATURE_ROLES.customers },
        loadComponent: () =>
          import('./features/customers/customers.component').then(
            (m) => m.CustomersComponent
          ),
      },
      // Sales, purchases, payments, etc. — no components yet; nav filtered by role only
    ],
  },

  { path: '**', redirectTo: 'login' },
];
