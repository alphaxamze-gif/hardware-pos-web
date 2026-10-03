import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaleService } from '../../core/services/sale.service';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-history.component.html',
  styleUrl: './sales-history.component.css',
})
export class SalesHistoryComponent implements OnInit {
  sales: any[] = [];
  filtered: any[] = [];
  loading = true;
  error = '';
  search = '';

  constructor(private saleService: SaleService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.saleService.getSales().subscribe({
      next: (data) => {
        this.sales = data || [];
        this.applySearch();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load sales';
        this.loading = false;
      },
    });
  }

  applySearch() {
    const t = this.search.toLowerCase().trim();
    if (!t) {
      this.filtered = this.sales;
      return;
    }
    this.filtered = this.sales.filter(
      (s) =>
        s.invoiceNumber?.toLowerCase().includes(t) ||
        s.customer?.name?.toLowerCase().includes(t) ||
        s.paymentMethod?.toLowerCase().includes(t)
    );
  }
}
