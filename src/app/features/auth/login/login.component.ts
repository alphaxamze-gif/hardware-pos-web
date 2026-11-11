import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type Step = 'email' | 'password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  step: Step = 'email';
  email = '';
  password = '';
  error = '';
  loading = false;
  shake = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  get label(): string {
    return this.step === 'email' ? 'Email' : 'Password';
  }

  private triggerShake(): void {
    this.shake = false;
    requestAnimationFrame(() => {
      this.shake = true;
      setTimeout(() => (this.shake = false), 400);
    });
  }

  onNext(): void {
    this.error = '';
    if (this.step === 'email') {
      const v = this.email.trim();
      if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        this.triggerShake();
        this.error = 'Enter a valid email';
        return;
      }
      this.step = 'password';
      return;
    }
    this.submit();
  }

  onBack(): void {
    if (this.loading) return;
    this.error = '';
    if (this.step === 'password') {
      this.password = '';
      this.step = 'email';
    }
  }

  onEnter(e: Event): void {
    e.preventDefault();
    this.onNext();
  }

  submit(): void {
    if (!this.password.trim()) {
      this.triggerShake();
      this.error = 'Enter your password';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.loading = false;
        const role = this.auth.getUser()?.role;
        if (role === 'CASHIER') {
          this.router.navigateByUrl('/sales');
        } else {
          this.router.navigateByUrl('/dashboard');
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Login failed. Please try again.';
        this.triggerShake();
      },
    });
  }
}
