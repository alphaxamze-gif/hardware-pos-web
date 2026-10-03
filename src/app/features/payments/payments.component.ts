import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, PaymentMethod, PaymentType } from '../../core/services/payment.service';
import { CustomerService } from '../../core/services/customer.service';
import { SupplierService } from '../../core/services/supplier.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css',
})
export class PaymentsComponent implements OnInit {
  payments: any[] = [];
  customers: any[] = [];
  suppliers: any[] = [];

  loading = true;
  submitting = false;
  error = '';
  success = '';

  type: PaymentType = 'CUSTOMER_PAYMENT';
  customerId = '';
  supplierId = '';
  amount: number | null = null;
  paymentMethod: PaymentMethod = 'CASH';
  reference = '';
  notes = '';

  constructor(
    private paymentService: PaymentService,
    private customerService: CustomerService,
    private supplierService: SupplierService
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.error = '';
    let left = 3;
    const done = () => {
      left -= 1;
      if (left <= 0) this.loading = false;
    };

    this.paymentService.getPayments().subscribe({
      next: (data) => {
        this.payments = data || [];
        done();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load payments';
        done();
      },
    });

    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = (data || []).filter(
          (c: any) => c.isActive !== false && Number(c.currentDue) > 0
        );
        done();
      },
      error: () => {
        this.customers = [];
        done();
      },
    });

    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = (data || []).filter(
          (s: any) => s.isActive !== false && Number(s.currentDue) > 0
        );
        done();
      },
      error: () => {
        this.suppliers = [];
        done();
      },
    });
  }

  get selectedCustomerDue(): number {
    const c = this.customers.find((x) => x.id === this.customerId);
    return c ? Number(c.currentDue) || 0 : 0;
  }

  get selectedSupplierDue(): number {
    const s = this.suppliers.find((x) => x.id === this.supplierId);
    return s ? Number(s.currentDue) || 0 : 0;
  }

  get maxAmount(): number {
    return this.type === 'CUSTOMER_PAYMENT'
      ? this.selectedCustomerDue
      : this.selectedSupplierDue;
  }

  onTypeChange() {
    this.customerId = '';
    this.supplierId = '';
    this.amount = null;
    this.error = '';
  }

  fillFullDue() {
    const max = this.maxAmount;
    if (max > 0) this.amount = max;
  }

  submit() {
    this.error = '';
    this.success = '';

    const amt = Number(this.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      this.error = 'Amount must be greater than 0';
      return;
    }

    if (this.type === 'CUSTOMER_PAYMENT') {
      if (!this.customerId) {
        this.error = 'Select a customer with outstanding due';
        return;
      }
      if (amt > this.selectedCustomerDue) {
        this.error = `Amount cannot exceed customer due (KES ${this.selectedCustomerDue.toLocaleString()})`;
        return;
      }
    } else {
      if (!this.supplierId) {
        this.error = 'Select a supplier with outstanding due';
        return;
      }
      if (amt > this.selectedSupplierDue) {
        this.error = `Amount cannot exceed supplier due (KES ${this.selectedSupplierDue.toLocaleString()})`;
        return;
      }
    }

    this.submitting = true;

    this.paymentService
      .createPayment({
        type: this.type,
        amount: amt,
        paymentMethod: this.paymentMethod,
        reference: this.reference.trim() || undefined,
        notes: this.notes.trim() || undefined,
        customerId:
          this.type === 'CUSTOMER_PAYMENT' ? this.customerId : undefined,
        supplierId:
          this.type === 'SUPPLIER_PAYMENT' ? this.supplierId : undefined,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.success = `Payment of KES ${amt.toLocaleString()} recorded`;
          this.amount = null;
          this.reference = '';
          this.notes = '';
          this.customerId = '';
          this.supplierId = '';
          this.loadAll();
        },
        error: (err) => {
          this.submitting = false;
          this.error = err.error?.message || 'Payment failed';
        },
      });
  }
}
