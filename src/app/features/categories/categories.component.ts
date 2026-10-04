import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';

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
  showInactive = false;
  showForm = false;
  saving = false;
  editingId: string | null = null;
  form = { name: '', description: '' };

  constructor(
    private categoryService: CategoryService,
    private authService: AuthService
  ) {}

  get canManageInactive(): boolean {
    const role = this.authService.getUser()?.role;
    return role === 'ADMIN' || role === 'MANAGER';
  }

  get inactiveCount(): number {
    return this.categories.filter((c) => c.isActive === false).length;
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.error = '';
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data || [];
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load categories';
        this.loading = false;
      },
    });
  }

  applyFilters() {
    let list = this.categories;
    if (!this.showInactive) {
      list = list.filter((c) => c.isActive !== false);
    }
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(term) ||
          c.description?.toLowerCase().includes(term)
      );
    }
    this.filteredCategories = list;
  }

  onSearch() {
    this.applyFilters();
  }

  onShowInactiveChange() {
    this.applyFilters();
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

    const wasEditing = !!this.editingId;
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
        this.success = wasEditing ? 'Category updated' : 'Category created';
        this.loadCategories();
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Save failed';
      },
    });
  }

  remove(category: any) {
    if (
      !confirm(
        `Remove category "${category.name}" from the list? Linked products keep history.`
      )
    ) {
      return;
    }
    this.error = '';
    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.success = 'Category removed from list';
        this.loadCategories();
      },
      error: (err) => {
        this.error = err.error?.message || 'Remove failed';
      },
    });
  }

  reactivate(category: any) {
    this.error = '';
    this.categoryService
      .updateCategory(category.id, { isActive: true } as any)
      .subscribe({
        next: () => {
          this.success = 'Category restored';
          this.loadCategories();
        },
        error: (err) => {
          this.error = err.error?.message || 'Restore failed';
        },
      });
  }
}
