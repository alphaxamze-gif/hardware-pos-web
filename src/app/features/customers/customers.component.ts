import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../core/models';
import { CustomerService } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];

  searchTerm = '';
  showInactive = false;
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  showForm = false;
  editingCustomer: Customer | null = null;

  form = {
    name: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: 0,
  };

  constructor(
    private customerService: CustomerService,
    private authService: AuthService
  ) {}

  get canManageInactive(): boolean {
    const role = this.authService.getUser()?.role;
    return role === 'ADMIN' || role === 'MANAGER';
  }

  get inactiveCount(): number {
    return this.customers.filter((c) => c.isActive === false).length;
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers || [];
        this.loading = false;
        this.applyFilters();
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Failed to load customers.';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    let list = this.customers;

    if (!this.showInactive) {
      list = list.filter((c) => c.isActive !== false);
    }

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((customer) =>
        [customer.name, customer.phone, customer.email]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term))
      );
    }

    this.filteredCustomers = list;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onShowInactiveChange(): void {
    this.applyFilters();
  }

  openCreateForm(): void {
    this.editingCustomer = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.form = {
      name: '',
      phone: '',
      email: '',
      address: '',
      creditLimit: 0,
    };
    this.showForm = true;
  }

  openEditForm(customer: Customer): void {
    this.editingCustomer = customer;
    this.errorMessage = '';
    this.successMessage = '';
    this.form = {
      name: customer.name,
      phone: customer.phone ?? '',
      email: customer.email ?? '',
      address: customer.address ?? '',
      creditLimit: customer.creditLimit ?? 0,
    };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingCustomer = null;
  }

  saveCustomer(): void {
    if (!this.form.name.trim()) {
      this.errorMessage = 'Customer name is required';
      return;
    }

    const payload = {
      name: this.form.name.trim(),
      phone: this.form.phone.trim() || undefined,
      email: this.form.email.trim() || undefined,
      address: this.form.address.trim() || undefined,
      creditLimit: Math.max(0, Number(this.form.creditLimit) || 0),
    };

    this.saving = true;
    this.errorMessage = '';

    const wasEditing = !!this.editingCustomer;
    const req$ = this.editingCustomer
      ? this.customerService.updateCustomer(this.editingCustomer.id, payload)
      : this.customerService.createCustomer(payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = wasEditing
          ? 'Customer updated'
          : 'Customer created';
        this.closeForm();
        this.loadCustomers();
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage =
          error?.error?.message || 'Failed to save customer.';
      },
    });
  }

  deleteCustomer(customer: Customer): void {
    const due = Number(customer.currentDue) || 0;

    let message = `Remove "${customer.name}" from the customer list?\n\nThey will leave this list and cannot be selected for new credit sales. History is kept.`;

    if (due > 0) {
      message =
        `WARNING: ${customer.name} still owes KES ${due.toLocaleString()}.\n\n` +
        `Removing them does NOT clear the debt. The balance remains until a payment is recorded.\n\n` +
        `Continue and remove from the list?`;
    }

    if (!window.confirm(message)) return;

    this.errorMessage = '';
    this.customerService.deleteCustomer(customer.id).subscribe({
      next: () => {
        this.successMessage =
          due > 0
            ? `Customer removed. Outstanding due KES ${due.toLocaleString()} is still on record.`
            : 'Customer removed from list';
        this.loadCustomers();
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Could not remove customer.';
      },
    });
  }

  reactivate(customer: Customer): void {
    this.errorMessage = '';
    this.customerService
      .updateCustomer(customer.id, { isActive: true } as any)
      .subscribe({
        next: () => {
          this.successMessage = 'Customer restored to list';
          this.loadCustomers();
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message || 'Could not restore customer.';
        },
      });
  }

  trackByCustomerId(_index: number, customer: Customer): string {
    return customer.id;
  }
}
