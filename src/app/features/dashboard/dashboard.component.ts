import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  error = '';
  periodLabel = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.periodLabel = this.formatToday();
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.error = '';

    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Unable to load dashboard data';
        this.loading = false;
      },
    });
  }

  private formatToday(): string {
    return new Date().toLocaleDateString('en-KE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
