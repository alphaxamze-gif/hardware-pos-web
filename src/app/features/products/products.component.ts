import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: any[] = [];
  loading = true;
  error = '';
  success = '';
  searchTerm = '';
  /** Default false = soft-deleted products leave the main list */
  showInactive = false;

  showForm = false;
  saving = false;
  editingId: string | null = null;

  form = {
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    costPrice: 0,
    sellingPrice: 0,
    currentStock: 0,
    minStockLevel: 0,
    unit: 'PIECE',
  };

  units = ['PIECE', 'BAG', 'KG', 'METER', 'FOOT', 'LITER', 'BOX', 'SET', 'TONNE'];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService
  ) {}

  get canManageInactive(): boolean {
    const role = this.authService.getUser()?.role;
    return role === 'ADMIN' || role === 'MANAGER';
  }

  get activeCategories() {
    return this.categories.filter((c) => c.isActive !== false);
  }

  get inactiveCount(): number {
    return this.products.filter((p) => p.isActive === false).length;
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.loading = true;
    this.error = '';
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data || [];
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load products';
        this.loading = false;
      },
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data || [];
      },
      error: () => {
        this.categories = [];
      },
    });
  }

  applyFilters() {
    let list = this.products;

    // Soft-deleted leave the main list unless ADMIN/MANAGER toggles them on
    if (!this.showInactive) {
      list = list.filter((p) => p.isActive !== false);
    }

    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.sku?.toLowerCase().includes(term) ||
          p.category?.name?.toLowerCase().includes(term)
      );
    }

    this.filteredProducts = list;
  }

  onSearch() {
    this.applyFilters();
  }

  onShowInactiveChange() {
    this.applyFilters();
  }

  isLowStock(product: any): boolean {
    return Number(product.currentStock) <= Number(product.minStockLevel);
  }

  openCreate() {
    this.editingId = null;
    this.showForm = true;
    this.error = '';
    this.success = '';
    this.form = {
      name: '',
      sku: '',
      description: '',
      categoryId: this.activeCategories[0]?.id || '',
      costPrice: 0,
      sellingPrice: 0,
      currentStock: 0,
      minStockLevel: 0,
      unit: 'PIECE',
    };
  }

  openEdit(product: any) {
    this.editingId = product.id;
    this.showForm = true;
    this.error = '';
    this.success = '';
    this.form = {
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      categoryId: product.categoryId || product.category?.id || '',
      costPrice: product.costPrice ?? 0,
      sellingPrice: product.sellingPrice ?? 0,
      currentStock: product.currentStock ?? 0,
      minStockLevel: product.minStockLevel ?? 0,
      unit: product.unit || 'PIECE',
    };
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  save() {
    this.error = '';
    this.success = '';

    if (!this.form.name.trim()) {
      this.error = 'Product name is required';
      return;
    }
    if (!this.form.categoryId) {
      this.error = 'Select a category first';
      return;
    }
    if (this.form.sellingPrice === null || this.form.sellingPrice < 0) {
      this.error = 'Selling price is required';
      return;
    }

    this.saving = true;

    if (this.editingId) {
      this.productService
        .updateProduct(this.editingId, {
          name: this.form.name.trim(),
          sku: this.form.sku.trim() || undefined,
          description: this.form.description.trim() || undefined,
          categoryId: this.form.categoryId,
          costPrice: Number(this.form.costPrice) || 0,
          sellingPrice: Number(this.form.sellingPrice),
          minStockLevel: Number(this.form.minStockLevel) || 0,
          unit: this.form.unit as any,
        })
        .subscribe({
          next: () => {
            this.saving = false;
            this.showForm = false;
            this.editingId = null;
            this.success = 'Product updated';
            this.loadProducts();
          },
          error: (err) => {
            this.saving = false;
            this.error = err.error?.message || 'Update failed';
          },
        });
      return;
    }

    this.productService
      .createProduct({
        name: this.form.name.trim(),
        sku: this.form.sku.trim() || undefined,
        description: this.form.description.trim() || undefined,
        categoryId: this.form.categoryId,
        costPrice: Number(this.form.costPrice) || 0,
        sellingPrice: Number(this.form.sellingPrice),
        currentStock: Number(this.form.currentStock) || 0,
        minStockLevel: Number(this.form.minStockLevel) || 0,
        unit: this.form.unit as any,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.showForm = false;
          this.success = 'Product created';
          this.loadProducts();
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.message || 'Failed to create product';
        },
      });
  }

  remove(product: any) {
    if (
      !confirm(
        `Remove "${product.name}" from the catalogue? It will leave this list and cannot be sold. History (sales/purchases) is kept.`
      )
    ) {
      return;
    }
    this.error = '';
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.success = 'Product removed from catalogue';
        this.loadProducts();
      },
      error: (err) => {
        this.error = err.error?.message || 'Remove failed';
      },
    });
  }

  reactivate(product: any) {
    this.error = '';
    this.productService.updateProduct(product.id, { isActive: true }).subscribe({
      next: () => {
        this.success = 'Product restored to catalogue';
        this.loadProducts();
      },
      error: (err) => {
        this.error = err.error?.message || 'Restore failed';
      },
    });
  }
}
