export type TransactionType = 'utang' | 'bayar';

export type CustomerStatus = 'aktif' | 'lunas';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  initials: string;
  totalDebt: number;
  status: CustomerStatus;
  category: string;
  since: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  type: TransactionType;
  amount: number;
  description: string;
  invoice: string;
  location: string;
  date: string;
  status: 'UTANG' | 'BAYAR';
  dueDate?: string; // ISO date string YYYY-MM-DD
}
