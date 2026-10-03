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
        this.customers = data || [];
        done();
      },
      error: () => {
        this.customers = [];
        done();
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
      });
    }
    this.syncPaid();
  }

  setQty(line: CartLine, qty: number) {
    const q = Math.floor(Number(qty));
    if (!q || q < 1) {
      line.quantity = 1;
    } else if (q > line.maxStock) {
      line.quantity = line.maxStock;
      this.error = `Max stock for ${line.name}: ${line.maxStock}`;
    } else {
      line.quantity = q;
      this.error = '';
    }
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
    }
  }

  onDiscountChange() {
    if (this.paymentMethod === 'CASH') {
      this.amountPaid = this.total;
    }
  }

  completeSale() {
    this.error = '';
    this.success = '';

    if (this.cart.length === 0) {
      this.error = 'Add at least one product';
      return;
    }
    for (const line of this.cart) {
      if (line.quantity <= 0 || line.unitPrice <= 0) {
        this.error = 'Each line needs quantity and price greater than 0';
        return;
      }
    }
    if (this.paymentMethod === 'CREDIT' && !this.customerId) {
      this.error = 'Select a customer for credit sales';
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
        discount: Number(this.discount) || 0,
        taxAmount: 0,
        amountPaid: Number(this.amountPaid) || 0,
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
          this.success = `Sale completed — KES ${Number(sale.totalAmount || this.total).toLocaleString()}`;
          this.clearCart();
          this.paymentMethod = 'CASH';
          this.customerId = '';
          this.load();
        },
        error: (err) => {
          this.submitting = false;
          this.error = err.error?.message || 'Sale failed';
        },
      });
  }
}
