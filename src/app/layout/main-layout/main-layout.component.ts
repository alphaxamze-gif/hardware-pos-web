import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit {
  user: any;
  isSidebarOpen = true;
  isDarkMode = false;
  today = new Date();
  isMobile = false;

  private readonly MOBILE_BP = 900;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit() {
    const saved = localStorage.getItem('theme');
    this.isDarkMode = saved === 'dark';
    this.applyTheme();
    this.syncViewport(true);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isMobile) {
          this.isSidebarOpen = false;
        }
      });
  }

  @HostListener('window:resize')
  onResize() {
    this.syncViewport(false);
  }

  /** Keep mobile/desktop sidebar state consistent with viewport. */
  private syncViewport(forceInit: boolean) {
    const mobile = typeof window !== 'undefined' && window.innerWidth < this.MOBILE_BP;
    if (forceInit || mobile !== this.isMobile) {
      this.isMobile = mobile;
      this.isSidebarOpen = !mobile; // desktop open, mobile closed by default
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeMobileSidebar() {
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
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
