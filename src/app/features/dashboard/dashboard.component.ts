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

  /** Precomputed SVG polylines for sparklines (viewBox 0 0 100 28). */
  sparks: Record<string, string> = {};

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
        this.sparks = {
          todaySales: this.buildSpark(data.todaySales, 7),
          todayCollection: this.buildSpark(data.todayCollection, 7),
          customerDues: this.buildSpark(data.customerDues, 7),
          supplierDues: this.buildSpark(data.supplierDues, 7),
          stockValue: this.buildSpark(data.stockValue, 7),
          stockCostValue: this.buildSpark(data.stockCostValue, 7),
          monthlyExpenses: this.buildSpark(data.monthlyExpenses, 7),
          lowStockCount: this.buildSpark(data.lowStockCount, 7),
        };
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

  /**
   * Deterministic mini-series from a seed value so the sparkline is stable
   * for the same number (until we have real time-series from the API).
   */
  private buildSpark(seed: number, points: number): string {
    const n = Math.max(0, Number(seed) || 0);
    const vals: number[] = [];
    let x = (n * 9301 + 49297) % 233280;
    for (let i = 0; i < points; i++) {
      x = (x * 9301 + 49297) % 233280;
      const noise = x / 233280;
      const trend = n === 0 ? 0.15 : 0.35 + (i / (points - 1)) * 0.45;
      vals.push(trend * 0.7 + noise * 0.3);
    }
    if (n > 0) {
      vals[vals.length - 1] = Math.min(1, vals[vals.length - 1] + 0.15);
    }
    const max = Math.max(...vals, 0.01);
    const min = Math.min(...vals);
    const range = max - min || 1;
    const coords = vals.map((v, i) => {
      const px = (i / (points - 1)) * 100;
      const py = 26 - ((v - min) / range) * 22;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    });
    return coords.join(' ');
  }
}
