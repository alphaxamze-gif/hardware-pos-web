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
  expandedId: string | null = null;

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
        s.paymentMethod?.toLowerCase().includes(t) ||
        s.items?.some((i: any) =>
          i.product?.name?.toLowerCase().includes(t)
        )
    );
  }

  /** Unpaid portion of this sale only (not full customer account due). */
  balance(sale: any): number {
    const total = Number(sale.totalAmount) || 0;
    const paid = Number(sale.amountPaid) || 0;
    return Math.max(0, total - paid);
  }

  isPaid(sale: any): boolean {
    return this.balance(sale) === 0;
  }

  methodLabel(method: string): string {
    switch (method) {
      case 'CASH':
        return 'Cash';
      case 'CREDIT':
        return 'Credit';
      case 'MPESA':
        return 'M-Pesa';
      case 'BANK':
        return 'Bank';
      default:
        return method || '—';
    }
  }

  itemsSummary(sale: any): string {
    const n = sale.items?.length || 0;
    if (n === 0) return '0 items';
    if (n === 1) {
      const line = sale.items[0];
      const name = line.product?.name || 'Item';
      return `${name} × ${line.quantity}`;
    }
    return `${n} items`;
  }

  toggleExpand(sale: any) {
    this.expandedId = this.expandedId === sale.id ? null : sale.id;
  }

  isExpanded(sale: any): boolean {
    return this.expandedId === sale.id;
  }
}
