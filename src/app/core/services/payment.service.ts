import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type PaymentType = 'CUSTOMER_PAYMENT' | 'SUPPLIER_PAYMENT';
export type PaymentMethod = 'CASH' | 'CREDIT' | 'MPESA' | 'BANK';

export interface CreatePaymentPayload {
  type: PaymentType;
  amount: number;
  paymentMethod?: PaymentMethod;
  reference?: string;
  notes?: string;
  customerId?: string;
  supplierId?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/payments`;

  constructor(private http: HttpClient) {}

  getPayments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createPayment(payload: CreatePaymentPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
