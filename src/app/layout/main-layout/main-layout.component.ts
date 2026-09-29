import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthUser, UserRole } from '../../core/models';
import { FEATURE_ROLES } from '../../core/auth/role-permissions';

export interface NavItem {
  label: string;
  path: string;
  roles: UserRole[];
  /** Inline SVG path content for the icon (stroke icons). */
  icon: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/** Single nav definition; visibility filtered by role. */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        roles: FEATURE_ROLES.dashboard,
        icon: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
      },
    ],
  },
  {
    label: 'Sales',
    items: [
      {
        label: 'POS / New Sale',
        path: '/sales',
        roles: FEATURE_ROLES.sales,
        icon: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
      },
      {
        label: 'Sales History',
        path: '/sales-history',
        roles: FEATURE_ROLES.salesHistory,
        icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
      },
    ],
  },
  {
    label: 'Inventory',
    items: [
      {
        label: 'Products',
        path: '/products',
        roles: FEATURE_ROLES.products,
        icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
      },
      {
        label: 'Categories',
        path: '/categories',
        roles: FEATURE_ROLES.categories,
        icon: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
      },
      {
        label: 'Purchases',
        path: '/purchases',
        roles: FEATURE_ROLES.purchases,
        icon: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
      },
    ],
  },
  {
    label: 'People',
    items: [
      {
        label: 'Customers',
        path: '/customers',
        roles: FEATURE_ROLES.customers,
        icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      },
      {
        label: 'Suppliers',
        path: '/suppliers',
        roles: FEATURE_ROLES.suppliers,
        icon: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
      },
    ],
  },
  {
    label: 'Finance',
    items: [
      {
        label: 'Payments',
        path: '/payments',
        roles: FEATURE_ROLES.payments,
        icon: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
      },
      {
        label: 'Expenses',
        path: '/expenses',
        roles: FEATURE_ROLES.expenses,
        icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
      },
      {
        label: 'Due Reminders',
        path: '/reminders',
        roles: FEATURE_ROLES.reminders,
        icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
      },
    ],
  },
  {
    label: 'Admin',
    items: [
      {
        label: 'Users',
        path: '/users',
        roles: FEATURE_ROLES.users,
        icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      },
    ],
  },
];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit {
  user: AuthUser | null = null;
  isSidebarOpen = true;
  isDarkMode = false;
  today = new Date();
  visibleSections: NavSection[] = [];

  constructor(private authService: AuthService) {
    this.user = this.authService.getUser();
    this.visibleSections = this.buildVisibleNav();
  }

  ngOnInit() {
    const saved = localStorage.getItem('theme');
    this.isDarkMode = saved === 'dark';
    this.applyTheme();
  }

  canAccess(roles: UserRole[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  private buildVisibleNav(): NavSection[] {
    return NAV_SECTIONS
      .map((section) => ({
        label: section.label,
        items: section.items.filter((item) => this.canAccess(item.roles)),
      }))
      .filter((section) => section.items.length > 0);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-theme', this.isDarkMode);
  }

  logout() {
    this.authService.logout();
  }
}
