import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthUser, UserRole } from '../../core/models';
import { FEATURE_ROLES } from '../../core/auth/role-permissions';

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

  /** Exposed for template role checks (backend-aligned). */
  readonly roles = FEATURE_ROLES;

  constructor(private authService: AuthService) {
    this.user = this.authService.getUser();
  }

  ngOnInit() {
    const saved = localStorage.getItem('theme');
    this.isDarkMode = saved === 'dark';
    this.applyTheme();
  }

  canAccess(allowed: UserRole[]): boolean {
    return this.authService.hasAnyRole(allowed);
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
