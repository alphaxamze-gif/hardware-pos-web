import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  currentDue?: number;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/suppliers`;

  constructor(private http: HttpClient) {}

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl);
  }

  createSupplier(data: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  }): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, data);
  }
}
