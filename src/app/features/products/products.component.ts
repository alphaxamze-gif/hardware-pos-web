import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';

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
    private categoryService: CategoryService
  ) {}

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
        this.filteredProducts = this.products;
        this.loading = false;
        this.onSearch();
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

  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredProducts = this.products;
      return;
    }
    this.filteredProducts = this.products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.category?.name?.toLowerCase().includes(term)
    );
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
      categoryId: this.categories[0]?.id || '',
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
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    this.error = '';
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.success = 'Product deleted';
        this.loadProducts();
      },
      error: (err) => {
        this.error =
          err.error?.message ||
          'Delete failed (product may already be used in sales)';
      },
    });
  }
}
