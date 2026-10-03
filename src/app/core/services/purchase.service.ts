import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreatePurchasePayload {
  supplierId: string;
  invoiceNumber?: string;
  notes?: string;
  amountPaid?: number;
  items: {
    productId: string;
    quantity: number;
    unitCost: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/purchases`;

  constructor(private http: HttpClient) {}

  createPurchase(payload: CreatePurchasePayload): Observable<unknown> {
    return this.http.post(this.apiUrl, payload);
  }
}
