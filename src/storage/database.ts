import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer, Transaction } from '@/types';

const KEYS = {
  customers: '@bukukios/customers',
  transactions: '@bukukios/transactions',
  initialized: '@bukukios/initialized',
  profile: '@bukukios/profile',
};

export interface Profile {
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
}

const DEFAULT_PROFILE: Profile = { name: 'Admin Toko', email: 'admin@bukukios.id', initials: 'AS' };

export async function getProfile(): Promise<Profile> {
  const raw = await AsyncStorage.getItem(KEYS.profile);
  return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

const SEED_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Ahmad Hidayat', phone: '0812-3456-7890', initials: 'AH', totalDebt: 1250000, status: 'aktif', category: 'Grosir', since: 'Jan 2023' },
  { id: '2', name: 'Siti Pertiwi', phone: '0877-9988-1122', initials: 'SP', totalDebt: 0, status: 'lunas', category: 'Eceran', since: 'Mar 2023' },
  { id: '3', name: 'Budi Wijaya', phone: '0852-1122-3344', initials: 'BW', totalDebt: 450000, status: 'aktif', category: 'Grosir', since: 'Jun 2023' },
  { id: '4', name: 'Rina Diana', phone: '0821-6677-8899', initials: 'RD', totalDebt: 3100000, status: 'aktif', category: 'Grosir', since: 'Feb 2023' },
  { id: '5', name: 'Dedi Kurniawan', phone: '0899-4455-6677', initials: 'DK', totalDebt: 0, status: 'lunas', category: 'Eceran', since: 'Apr 2023' },
];

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 't1', customerId: '1', type: 'utang', amount: 1500000, description: 'Pembelian Sembako', invoice: 'INV #10928', location: 'Toko Pusat', date: '15 Okt 2023, 10:30', status: 'UTANG' },
  { id: 't2', customerId: '1', type: 'bayar', amount: 500000, description: 'Pembayaran Cicilan', invoice: '', location: 'Transfer Bank BCA', date: '12 Okt 2023, 14:15', status: 'BAYAR' },
  { id: 't3', customerId: '1', type: 'utang', amount: 3250000, description: 'Pembelian Peralatan', invoice: 'INV #10885', location: 'Cabang Utara', date: '05 Okt 2023, 09:00', status: 'UTANG' },
  { id: 't4', customerId: '3', type: 'utang', amount: 450000, description: 'Pembelian Sembako', invoice: 'INV #10712', location: 'Toko Pusat', date: '01 Okt 2023, 11:20', status: 'UTANG' },
  { id: 't5', customerId: '4', type: 'utang', amount: 3100000, description: 'Pembelian Elektronik', invoice: 'INV #10654', location: 'Toko Pusat', date: '28 Sep 2023, 16:45', status: 'UTANG' },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function initializeDatabase(): Promise<void> {
  const done = await AsyncStorage.getItem(KEYS.initialized);
  if (done === 'true') return;
  await AsyncStorage.setItem(KEYS.customers, JSON.stringify(SEED_CUSTOMERS));
  await AsyncStorage.setItem(KEYS.transactions, JSON.stringify(SEED_TRANSACTIONS));
  await AsyncStorage.setItem(KEYS.initialized, 'true');
}

export async function getCustomers(): Promise<Customer[]> {
  const raw = await AsyncStorage.getItem(KEYS.customers);
  return raw ? JSON.parse(raw) : [];
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  const customers = await getCustomers();
  return customers.find((c) => c.id === id);
}

export async function saveCustomer(customer: Customer): Promise<void> {
  const customers = await getCustomers();
  const idx = customers.findIndex((c) => c.id === customer.id);
  if (idx >= 0) {
    customers[idx] = customer;
  } else {
    customers.push(customer);
  }
  await AsyncStorage.setItem(KEYS.customers, JSON.stringify(customers));
}

export async function getTransactions(): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(KEYS.transactions);
  return raw ? JSON.parse(raw) : [];
}

export async function getCustomerTransactions(customerId: string): Promise<Transaction[]> {
  const all = await getTransactions();
  return all.filter((t) => t.customerId === customerId);
}

export function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export async function saveTransaction(
  customerId: string,
  type: 'utang' | 'bayar',
  amount: number,
  description: string,
  date: Date,
  dueDate?: Date,
): Promise<void> {
  const transactions = await getTransactions();
  const newTx: Transaction = {
    id: generateId(),
    customerId,
    type,
    amount,
    description,
    invoice: type === 'utang' ? `INV #${Math.floor(Math.random() * 90000) + 10000}` : '',
    location: type === 'utang' ? 'Toko Pusat' : 'Pembayaran Tunai',
    date: formatDate(date),
    status: type === 'utang' ? 'UTANG' : 'BAYAR',
    dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
  };
  transactions.push(newTx);
  await AsyncStorage.setItem(KEYS.transactions, JSON.stringify(transactions));

  const customer = await getCustomer(customerId);
  if (customer) {
    customer.totalDebt += type === 'utang' ? amount : -amount;
    if (customer.totalDebt < 0) customer.totalDebt = 0;
    customer.status = customer.totalDebt > 0 ? 'aktif' : 'lunas';
    await saveCustomer(customer);
  }
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.customers);
  await AsyncStorage.removeItem(KEYS.transactions);
  await AsyncStorage.removeItem(KEYS.initialized);
  await initializeDatabase();
}

export function isOverdue(dueDateStr?: string): boolean {
  if (!dueDateStr) return false;
  const due = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function daysUntilDue(dueDateStr?: string): number {
  if (!dueDateStr) return Infinity;
  const due = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = due.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDueDate(dueDateStr?: string): string {
  if (!dueDateStr) return '';
  const due = new Date(dueDateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${due.getDate()} ${months[due.getMonth()]} ${due.getFullYear()}`;
}

export async function updateTransaction(
  transactionId: string,
  updates: Partial<Pick<Transaction, 'amount' | 'description' | 'date' | 'dueDate' | 'type' | 'customerId'>>,
): Promise<void> {
  const transactions = await getTransactions();
  const idx = transactions.findIndex((t) => t.id === transactionId);
  if (idx < 0) return;

  const oldTx = transactions[idx];
  const oldAmount = oldTx.amount;
  const oldType = oldTx.type;
  const oldCustomerId = oldTx.customerId;

  const newType = updates.type ?? oldType;
  const newCustomerId = updates.customerId ?? oldCustomerId;
  const newAmount = updates.amount ?? oldAmount;

  Object.assign(transactions[idx], { ...updates, type: newType, customerId: newCustomerId });

  await AsyncStorage.setItem(KEYS.transactions, JSON.stringify(transactions));

  // Revert old transaction effect on old customer
  const oldCustomer = await getCustomer(oldCustomerId);
  if (oldCustomer) {
    if (oldType === 'utang') {
      oldCustomer.totalDebt -= oldAmount;
    } else {
      oldCustomer.totalDebt += oldAmount;
    }
    if (oldCustomer.totalDebt < 0) oldCustomer.totalDebt = 0;
    oldCustomer.status = oldCustomer.totalDebt > 0 ? 'aktif' : 'lunas';
    await saveCustomer(oldCustomer);
  }

  // Apply new transaction effect on new customer
  if (newCustomerId !== oldCustomerId) {
    const newCustomer = await getCustomer(newCustomerId);
    if (newCustomer) {
      if (newType === 'utang') {
        newCustomer.totalDebt += newAmount;
      } else {
        newCustomer.totalDebt -= newAmount;
      }
      if (newCustomer.totalDebt < 0) newCustomer.totalDebt = 0;
      newCustomer.status = newCustomer.totalDebt > 0 ? 'aktif' : 'lunas';
      await saveCustomer(newCustomer);
    }
  } else {
    const customer = oldCustomer;
    if (customer) {
      if (newType === 'utang') {
        customer.totalDebt += newAmount;
      } else {
        customer.totalDebt -= newAmount;
      }
      if (customer.totalDebt < 0) customer.totalDebt = 0;
      customer.status = customer.totalDebt > 0 ? 'aktif' : 'lunas';
      await saveCustomer(customer);
    }
  }
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  const transactions = await getTransactions();
  const idx = transactions.findIndex((t) => t.id === transactionId);
  if (idx < 0) return;

  const tx = transactions[idx];
  transactions.splice(idx, 1);
  await AsyncStorage.setItem(KEYS.transactions, JSON.stringify(transactions));

  const customer = await getCustomer(tx.customerId);
  if (customer) {
    if (tx.type === 'utang') {
      customer.totalDebt -= tx.amount;
    } else {
      customer.totalDebt += tx.amount;
    }
    if (customer.totalDebt < 0) customer.totalDebt = 0;
    customer.status = customer.totalDebt > 0 ? 'aktif' : 'lunas';
    await saveCustomer(customer);
  }
}

export async function deleteCustomer(customerId: string): Promise<boolean> {
  const customer = await getCustomer(customerId);
  if (!customer) return false;
  if (customer.totalDebt > 0) return false;

  const customers = await getCustomers();
  const filtered = customers.filter((c) => c.id !== customerId);
  await AsyncStorage.setItem(KEYS.customers, JSON.stringify(filtered));

  const transactions = await getTransactions();
  const filteredTx = transactions.filter((t) => t.customerId !== customerId);
  await AsyncStorage.setItem(KEYS.transactions, JSON.stringify(filteredTx));

  return true;
}
