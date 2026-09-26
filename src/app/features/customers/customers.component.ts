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
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];

  searchTerm = '';
  loading = false;
  errorMessage = '';

  showForm = false;
  editingCustomer: Customer | null = null;

  form = {
    name: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: 0
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
        this.customers = customers;
        this.filteredCustomers = customers;
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage =
          error?.error?.message || 'Failed to load customers.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredCustomers = this.customers;
      return;
    }

    this.filteredCustomers = this.customers.filter((customer) =>
      [
        customer.name,
        customer.phone,
        customer.email
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }

  openCreateForm(): void {
    this.editingCustomer = null;

    this.form = {
      name: '',
      phone: '',
      email: '',
      address: '',
      creditLimit: 0
    };

    this.showForm = true;
  }

  openEditForm(customer: Customer): void {
    this.editingCustomer = customer;

    this.form = {
      name: customer.name,
      phone: customer.phone ?? '',
      email: customer.email ?? '',
      address: customer.address ?? '',
      creditLimit: customer.creditLimit
    };

    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingCustomer = null;
  }

  saveCustomer(): void {
    if (!this.form.name.trim()) {
      return;
    }

    const payload = {
      name: this.form.name.trim(),
      phone: this.form.phone.trim() || null,
      email: this.form.email.trim() || null,
      address: this.form.address.trim() || null,
      creditLimit: Number(this.form.creditLimit)
    };

    this.loading = true;
    this.errorMessage = '';

    if (this.editingCustomer) {
      this.customerService
        .updateCustomer(this.editingCustomer.id, payload)
        .subscribe({
          next: () => {
            this.closeForm();
            this.loadCustomers();
          },
          error: (error) => {
            console.error(error);
            this.errorMessage =
              error?.error?.message || 'Failed to update customer.';
            this.loading = false;
          }
        });
    } else {
      this.customerService.createCustomer(payload).subscribe({
        next: () => {
          this.closeForm();
          this.loadCustomers();
        },
        error: (error) => {
          console.error(error);
          this.errorMessage =
            error?.error?.message || 'Failed to create customer.';
          this.loading = false;
        }
      });
    }
  }

  deleteCustomer(customer: Customer): void {
    const confirmed = window.confirm(
      `Delete customer "${customer.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.customerService.deleteCustomer(customer.id).subscribe({
      next: () => {
        this.loadCustomers();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage =
          error?.error?.message || 'Failed to delete customer.';
        this.loading = false;
      }
    });
  }

  trackByCustomerId(_index: number, customer: Customer): string {
    return customer.id;
  }
}