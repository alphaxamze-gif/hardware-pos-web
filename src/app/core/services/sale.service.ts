import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SaleItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalePayload {
  customerId?: string;
  invoiceNumber?: string;
  notes?: string;
  discount?: number;
  taxAmount?: number;
  amountPaid?: number;
  paymentMethod?: 'CASH' | 'CREDIT' | 'MPESA' | 'BANK';
  items: SaleItemInput[];
}

@Injectable({ providedIn: 'root' })
export class SaleService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/sales`;

  constructor(private http: HttpClient) {}

  getSales(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getSale(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createSale(payload: CreateSalePayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
