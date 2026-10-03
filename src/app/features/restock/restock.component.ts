import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { SupplierService, Supplier } from '../../core/services/supplier.service';
import {
  PurchaseService,
  PurchaseRecord,
} from '../../core/services/purchase.service';

@Component({
  selector: 'app-restock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restock.component.html',
  styleUrl: './restock.component.css',
})
export class RestockComponent implements OnInit {
  products: any[] = [];
  suppliers: Supplier[] = [];
  history: PurchaseRecord[] = [];

  loading = true;
  saving = false;
  error = '';
  success = '';

  form = {
    productId: '',
    supplierId: '',
    quantity: 1,
    unitCost: 0,
    amountPaid: 0,
    notes: '',
    invoiceNumber: '',
  };

  selectedProduct: any = null;

  constructor(
    private productService: ProductService,
    private supplierService: SupplierService,
    private purchaseService: PurchaseService
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.error = '';
    let pending = 3;
    const done = () => {
      pending -= 1;
      if (pending <= 0) this.loading = false;
    };

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = (data || []).filter((p: any) => p.isActive !== false);
        if (this.form.productId) {
          this.onProductChange();
        }
        done();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load products';
        done();
      },
    });

    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data || [];
        done();
      },
      error: () => {
        this.suppliers = [];
        done();
      },
    });

    this.purchaseService.getPurchases().subscribe({
      next: (data) => {
        this.history = (data || []).slice(0, 20);
        done();
      },
      error: () => {
        this.history = [];
        done();
      },
    });
  }

  isLow(product: any): boolean {
    if (!product) return false;
    return Number(product.currentStock) <= Number(product.minStockLevel);
  }

  onProductChange() {
    this.selectedProduct =
      this.products.find((p) => p.id === this.form.productId) || null;
    if (this.selectedProduct) {
      this.form.unitCost = Number(this.selectedProduct.costPrice) || 0;
      this.syncAmountPaid();
    }
  }

  onQtyOrCostChange() {
    this.syncAmountPaid();
  }

  private syncAmountPaid() {
    this.form.amountPaid = this.lineTotal;
  }

  get lineTotal(): number {
    const q = Number(this.form.quantity) || 0;
    const c = Number(this.form.unitCost) || 0;
    return Math.round(q * c * 100) / 100;
  }

  get remainingDue(): number {
    return Math.max(0, this.lineTotal - (Number(this.form.amountPaid) || 0));
  }

  submit() {
    this.error = '';
    this.success = '';

    if (!this.form.productId) {
      this.error = 'Select a product';
      return;
    }
    const qty = Number(this.form.quantity);
    const cost = Number(this.form.unitCost);
    if (!qty || qty <= 0) {
      this.error = 'Quantity must be greater than 0';
      return;
    }
    if (!cost || cost <= 0) {
      this.error = 'Unit cost must be greater than 0';
      return;
    }
    const paid = Number(this.form.amountPaid);
    if (paid < 0) {
      this.error = 'Amount paid cannot be negative';
      return;
    }
    if (paid > this.lineTotal) {
      this.error = 'Amount paid cannot exceed line total';
      return;
    }

    this.saving = true;

    const run = (supplierId: string) => {
      this.purchaseService
        .createPurchase({
          supplierId,
          invoiceNumber: this.form.invoiceNumber.trim() || undefined,
          notes:
            this.form.notes.trim() ||
            `Restock: ${this.selectedProduct?.name || 'product'}`,
          amountPaid: paid,
          items: [
            {
              productId: this.form.productId,
              quantity: qty,
              unitCost: cost,
            },
          ],
        })
        .subscribe({
          next: () => {
            this.saving = false;
            this.success = `Restocked ${qty} ${this.selectedProduct?.unit || 'units'} of ${this.selectedProduct?.name || 'product'}`;
            this.form.quantity = 1;
            this.form.notes = '';
            this.form.invoiceNumber = '';
            this.syncAmountPaid();
            this.loadAll();
          },
          error: (err) => {
            this.saving = false;
            this.error = err.error?.message || 'Restock failed';
          },
        });
    };

    if (this.form.supplierId) {
      run(this.form.supplierId);
      return;
    }

    this.supplierService
      .createSupplier({ name: 'General Stock Supplier' })
      .subscribe({
        next: (s) => {
          this.suppliers = [...this.suppliers, s];
          this.form.supplierId = s.id;
          run(s.id);
        },
        error: (err) => {
          this.saving = false;
          this.error =
            err.error?.message ||
            'Supplier required. Create a supplier or try again.';
        },
      });
  }
}
