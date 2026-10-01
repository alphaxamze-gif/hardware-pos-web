import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppUser,
  CreateUserPayload,
  UserRole,
  UserService,
} from '../../core/services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  users: AppUser[] = [];
  loading = false;
  error = '';
  success = '';

  showForm = false;
  editingId: string | null = null;

  form = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'CASHIER' as UserRole,
    isActive: true,
  };

  roles: UserRole[] = ['ADMIN', 'MANAGER', 'CASHIER'];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to load users';
      },
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.showForm = true;
    this.success = '';
    this.error = '';
    this.form = {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'CASHIER',
      isActive: true,
    };
  }

  openEdit(user: AppUser): void {
    this.editingId = user.id;
    this.showForm = true;
    this.success = '';
    this.error = '';
    this.form = {
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    };
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  save(): void {
    this.error = '';
    this.success = '';

    if (this.editingId) {
      const payload: {
        firstName: string;
        lastName: string;
        role: UserRole;
        isActive: boolean;
        password?: string;
      } = {
        firstName: this.form.firstName.trim(),
        lastName: this.form.lastName.trim(),
        role: this.form.role,
        isActive: this.form.isActive,
      };
      if (this.form.password.trim()) {
        payload.password = this.form.password;
      }

      this.userService.update(this.editingId, payload).subscribe({
        next: () => {
          this.success = 'User updated';
          this.showForm = false;
          this.loadUsers();
        },
        error: (err) => {
          this.error = err?.error?.message || 'Update failed';
        },
      });
      return;
    }

    const createPayload: CreateUserPayload = {
      email: this.form.email.trim(),
      password: this.form.password,
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      role: this.form.role,
    };

    if (
      !createPayload.email ||
      !createPayload.password ||
      !createPayload.firstName ||
      !createPayload.lastName
    ) {
      this.error = 'All fields are required for a new user';
      return;
    }

    this.userService.create(createPayload).subscribe({
      next: () => {
        this.success = 'User created';
        this.showForm = false;
        this.loadUsers();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Create failed';
      },
    });
  }

  deactivate(user: AppUser): void {
    if (!confirm(`Deactivate ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    this.userService.deactivate(user.id).subscribe({
      next: () => {
        this.success = 'User deactivated';
        this.loadUsers();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Deactivate failed';
      },
    });
  }

  activate(user: AppUser): void {
    this.userService.update(user.id, { isActive: true }).subscribe({
      next: () => {
        this.success = 'User activated';
        this.loadUsers();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Activate failed';
      },
    });
  }
}
