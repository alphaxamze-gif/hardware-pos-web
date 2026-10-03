import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  filteredCategories: any[] = [];
  loading = true;
  error = '';
  success = '';
  searchTerm = '';
  showForm = false;
  saving = false;
  editingId: string | null = null;
  form = { name: '', description: '' };

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.error = '';
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data || [];
        this.filteredCategories = this.categories;
        this.loading = false;
        this.onSearch();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load categories';
        this.loading = false;
      },
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredCategories = this.categories;
      return;
    }
    this.filteredCategories = this.categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
    );
  }

  openCreate() {
    this.editingId = null;
    this.showForm = true;
    this.error = '';
    this.success = '';
    this.form = { name: '', description: '' };
  }

  openEdit(category: any) {
    this.editingId = category.id;
    this.showForm = true;
    this.error = '';
    this.success = '';
    this.form = {
      name: category.name || '',
      description: category.description || '',
    };
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  save() {
    if (!this.form.name.trim()) {
      this.error = 'Category name is required';
      return;
    }
    this.saving = true;
    this.error = '';

    const payload = {
      name: this.form.name.trim(),
      description: this.form.description.trim() || undefined,
    };

    const req$ = this.editingId
      ? this.categoryService.updateCategory(this.editingId, payload)
      : this.categoryService.createCategory(payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.editingId = null;
        this.success = this.editingId ? 'Category updated' : 'Category created';
        this.loadCategories();
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Save failed';
      },
    });
  }

  remove(category: any) {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    this.error = '';
    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.success = 'Category deleted';
        this.loadCategories();
      },
      error: (err) => {
        this.error =
          err.error?.message ||
          'Cannot delete — products may still use this category';
      },
    });
  }
}
