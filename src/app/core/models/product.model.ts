import { Category } from './category.model';

/** Unit values matching backend Prisma Unit enum */
export type ProductUnit =
  | 'PIECE'
  | 'BAG'
  | 'KG'
  | 'METER'
  | 'FOOT'
  | 'LITER'
  | 'BOX'
  | 'SET'
  | 'TONNE';

export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  categoryId: string;
  category?: Pick<Category, 'id' | 'name'> | Category;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number;
  unit: ProductUnit;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
