/**
 * Matches GET /api/dashboard response from backend getDashboardStats().
 */
export interface DashboardStats {
  todaySales: number;
  todayCollection: number;
  customerDues: number;
  supplierDues: number;
  stockValue: number;
  stockCostValue: number;
  monthlyExpenses: number;
  lowStockCount: number;
  availableProducts: number;
}
