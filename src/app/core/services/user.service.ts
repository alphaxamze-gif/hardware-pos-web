import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.apiUrl);
  }

  getById(id: string): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateUserPayload): Observable<AppUser> {
    return this.http.post<AppUser>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateUserPayload): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.apiUrl}/${id}`, payload);
  }

  /** Backend DELETE soft-deactivates the user. */
  deactivate(id: string): Observable<AppUser | { message: string }> {
    return this.http.delete<AppUser | { message: string }>(`${this.apiUrl}/${id}`);
  }
}
