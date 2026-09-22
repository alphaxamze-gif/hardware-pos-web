/**
 * Customer entity as returned by the API.
 * currentDue is server-owned — do not send it on update payloads from the UI.
 */
export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  creditLimit: number;
  currentDue: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
