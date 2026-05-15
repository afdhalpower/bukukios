import { Customer, Transaction } from '@/types';

export const customers: Customer[] = [
  {
    id: '1',
    name: 'Ahmad Hidayat',
    phone: '0812-3456-7890',
    initials: 'AH',
    totalDebt: 1250000,
    status: 'aktif',
    category: 'Grosir',
    since: 'Jan 2023',
  },
  {
    id: '2',
    name: 'Siti Pertiwi',
    phone: '0877-9988-1122',
    initials: 'SP',
    totalDebt: 0,
    status: 'lunas',
    category: 'Eceran',
    since: 'Mar 2023',
  },
  {
    id: '3',
    name: 'Budi Wijaya',
    phone: '0852-1122-3344',
    initials: 'BW',
    totalDebt: 450000,
    status: 'aktif',
    category: 'Grosir',
    since: 'Jun 2023',
  },
  {
    id: '4',
    name: 'Rina Diana',
    phone: '0821-6677-8899',
    initials: 'RD',
    totalDebt: 3100000,
    status: 'aktif',
    category: 'Grosir',
    since: 'Feb 2023',
  },
  {
    id: '5',
    name: 'Dedi Kurniawan',
    phone: '0899-4455-6677',
    initials: 'DK',
    totalDebt: 0,
    status: 'lunas',
    category: 'Eceran',
    since: 'Apr 2023',
  },
];

export const transactions: Transaction[] = [
  {
    id: 't1',
    customerId: '1',
    type: 'utang',
    amount: 1500000,
    description: 'Pembelian Sembako',
    invoice: 'INV #10928',
    location: 'Toko Pusat',
    date: '15 Okt 2023, 10:30',
    status: 'UTANG',
  },
  {
    id: 't2',
    customerId: '1',
    type: 'bayar',
    amount: 500000,
    description: 'Pembayaran Cicilan',
    invoice: '',
    location: 'Transfer Bank BCA',
    date: '12 Okt 2023, 14:15',
    status: 'BAYAR',
  },
  {
    id: 't3',
    customerId: '1',
    type: 'utang',
    amount: 3250000,
    description: 'Pembelian Peralatan',
    invoice: 'INV #10885',
    location: 'Cabang Utara',
    date: '05 Okt 2023, 09:00',
    status: 'UTANG',
  },
  {
    id: 't4',
    customerId: '3',
    type: 'utang',
    amount: 450000,
    description: 'Pembelian Sembako',
    invoice: 'INV #10712',
    location: 'Toko Pusat',
    date: '01 Okt 2023, 11:20',
    status: 'UTANG',
  },
  {
    id: 't5',
    customerId: '4',
    type: 'utang',
    amount: 3100000,
    description: 'Pembelian Elektronik',
    invoice: 'INV #10654',
    location: 'Toko Pusat',
    date: '28 Sep 2023, 16:45',
    status: 'UTANG',
  },
];

export function getCustomerTransactions(customerId: string): Transaction[] {
  return transactions.filter((t) => t.customerId === customerId);
}

export function getCustomer(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}
