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

export interface PurchaseRecord {
  id: string;
  invoiceNumber?: string | null;
  totalAmount?: number;
  amountPaid?: number;
  notes?: string | null;
  createdAt?: string;
  supplier?: { id: string; name: string };
  items?: {
    quantity: number;
    unitCost: number;
    product?: { id: string; name: string; unit?: string };
  }[];
}

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/purchases`;

  constructor(private http: HttpClient) {}

  getPurchases(): Observable<PurchaseRecord[]> {
    return this.http.get<PurchaseRecord[]>(this.apiUrl);
  }

  createPurchase(payload: CreatePurchasePayload): Observable<unknown> {
    return this.http.post(this.apiUrl, payload);
  }
}
