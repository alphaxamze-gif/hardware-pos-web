import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CustomerService } from '../../core/services/customer.service';
import { SaleService } from '../../core/services/sale.service';

interface CartLine {
  productId: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
  imageUrl?: string | null;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.css',
})
export class PosComponent implements OnInit {
  products: any[] = [];
  customers: any[] = [];
  filteredProducts: any[] = [];
  cart: CartLine[] = [];

  search = '';
  loading = true;
  submitting = false;
  error = '';
  success = '';

  paymentMethod: 'CASH' | 'CREDIT' = 'CASH';
  customerId = '';
  discount = 0;
  amountPaid = 0;
  notes = '';

  constructor(
    private productService: ProductService,
    private customerService: CustomerService,
    private saleService: SaleService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    let left = 2;
    const done = () => {
      left -= 1;
      if (left <= 0) this.loading = false;
    };

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = (data || []).filter(
          (p: any) => p.isActive !== false && Number(p.currentStock) > 0
        );
        this.applySearch();
        done();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load products';
        done();
      },
    });

    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = (data || []).filter((c: any) => c.isActive !== false);
        done();
      },
      error: () => {
        this.customers = [];
        done();
      },
    });
  }

  reloadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = (data || []).filter((c: any) => c.isActive !== false);
      },
    });
  }

  applySearch() {
    const t = this.search.toLowerCase().trim();
    if (!t) {
      this.filteredProducts = this.products;
      return;
    }
    this.filteredProducts = this.products.filter(
      (p) =>
        p.name?.toLowerCase().includes(t) ||
        p.sku?.toLowerCase().includes(t) ||
        p.category?.name?.toLowerCase().includes(t)
    );
  }

  onImageError(event: Event) {
    const el = event.target as HTMLImageElement;
    el.style.display = 'none';
  }

  addToCart(product: any) {
    this.error = '';
    const existing = this.cart.find((c) => c.productId === product.id);
    const stock = Number(product.currentStock) || 0;
    if (stock <= 0) {
      this.error = `${product.name} is out of stock`;
      return;
    }
    if (existing) {
      if (existing.quantity >= stock) {
        this.error = `Only ${stock} ${product.unit} available`;
        return;
      }
      existing.quantity += 1;
    } else {
      this.cart.push({
        productId: product.id,
        name: product.name,
        unit: product.unit || 'PIECE',
        unitPrice: Number(product.sellingPrice) || 0,
        quantity: 1,
        maxStock: stock,
        imageUrl: product.imageUrl || null,
      });
    }
    this.syncPaid();
  }

  setQty(line: CartLine, raw: unknown) {
    let q = Math.floor(Number(raw));
    if (!Number.isFinite(q) || q < 1) {
      q = 1;
      this.error = 'Quantity must be at least 1';
    } else if (q > line.maxStock) {
      q = line.maxStock;
      this.error = `Max stock for ${line.name}: ${line.maxStock}`;
    } else {
      this.error = '';
    }
    line.quantity = q;
    this.syncPaid();
  }

  removeLine(productId: string) {
    this.cart = this.cart.filter((c) => c.productId !== productId);
    this.syncPaid();
  }

  clearCart() {
    this.cart = [];
    this.discount = 0;
    this.notes = '';
    this.syncPaid();
  }

  get subtotal(): number {
    return this.cart.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  }

  get total(): number {
    return Math.max(0, this.subtotal - (Number(this.discount) || 0));
  }

  get due(): number {
    return Math.max(0, this.total - (Number(this.amountPaid) || 0));
  }

  onPaymentMethodChange() {
    this.syncPaid();
  }

  private syncPaid() {
    if (this.paymentMethod === 'CASH') {
      this.amountPaid = this.total;
    } else if (this.paymentMethod === 'CREDIT') {
      if (this.amountPaid >= this.total || this.amountPaid < 0) {
        this.amountPaid = 0;
      }
    }
  }

  onDiscountChange() {
    const d = Number(this.discount);
    if (!Number.isFinite(d) || d < 0) {
      this.discount = 0;
    }
    this.syncPaid();
  }

  completeSale() {
    this.error = '';
    this.success = '';

    if (this.cart.length === 0) {
      this.error = 'Add at least one product';
      return;
    }

    for (const line of this.cart) {
      let q = Math.floor(Number(line.quantity));
      if (!Number.isFinite(q) || q < 1) {
        this.error = `Invalid quantity for ${line.name}. Must be at least 1.`;
        line.quantity = 1;
        return;
      }
      if (q > line.maxStock) {
        this.error = `Quantity for ${line.name} exceeds stock (${line.maxStock})`;
        line.quantity = line.maxStock;
        return;
      }
      line.quantity = q;

      const price = Number(line.unitPrice);
      if (!Number.isFinite(price) || price <= 0) {
        this.error = `Invalid unit price for ${line.name}`;
        return;
      }
      line.unitPrice = price;
    }

    if (this.paymentMethod === 'CREDIT' && !this.customerId) {
      this.error = 'Select a customer for credit sales';
      return;
    }

    if (this.paymentMethod === 'CREDIT' && this.due <= 0) {
      this.error =
        'Credit sale needs an unpaid balance. Set Amount paid below total (e.g. 0 for full credit).';
      return;
    }

    if (this.paymentMethod === 'CASH' && this.amountPaid < this.total) {
      this.error = 'Cash sale must be fully paid';
      return;
    }
    if (this.amountPaid > this.total) {
      this.error = 'Amount paid cannot exceed total';
      return;
    }

    this.submitting = true;

    this.saleService
      .createSale({
        customerId: this.customerId || undefined,
        notes: this.notes.trim() || undefined,
        discount: Math.max(0, Number(this.discount) || 0),
        taxAmount: 0,
        amountPaid: Math.max(0, Number(this.amountPaid) || 0),
        paymentMethod: this.paymentMethod,
        items: this.cart.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      })
      .subscribe({
        next: (sale) => {
          this.submitting = false;
          const dueMsg =
            this.paymentMethod === 'CREDIT' && this.due > 0
              ? ` — on account KES ${this.due.toLocaleString()}`
              : '';
          this.success = `Sale completed — KES ${Number(sale.totalAmount || this.total).toLocaleString()}${dueMsg}`;
          this.clearCart();
          this.paymentMethod = 'CASH';
          this.customerId = '';
          this.load();
          this.reloadCustomers();
        },
        error: (err) => {
          this.submitting = false;
          this.error = err.error?.message || 'Sale failed';
        },
      });
  }
}
