import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../core/models';
import { CustomerService } from '../../core/services/customer.service';

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

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers || [];
        this.filteredCustomers = this.customers;
        this.loading = false;
        this.onSearch();
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Failed to load customers.';
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredCustomers = this.customers;
      return;
    }
    this.filteredCustomers = this.customers.filter((customer) =>
      [customer.name, customer.phone, customer.email]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
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

    // currentDue is system-owned — never sent
    const payload = {
      name: this.form.name.trim(),
      phone: this.form.phone.trim() || undefined,
      email: this.form.email.trim() || undefined,
      address: this.form.address.trim() || undefined,
      creditLimit: Math.max(0, Number(this.form.creditLimit) || 0),
    };

    this.saving = true;
    this.errorMessage = '';

    const req$ = this.editingCustomer
      ? this.customerService.updateCustomer(this.editingCustomer.id, payload)
      : this.customerService.createCustomer(payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = this.editingCustomer
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
    if (!window.confirm(`Delete customer "${customer.name}"?`)) return;

    this.errorMessage = '';
    this.customerService.deleteCustomer(customer.id).subscribe({
      next: () => {
        this.successMessage = 'Customer deleted';
        this.loadCustomers();
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message ||
          'Cannot delete — customer may have sales or dues.';
      },
    });
  }

  trackByCustomerId(_index: number, customer: Customer): string {
    return customer.id;
  }
}
