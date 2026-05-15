import { getCustomers, getTransactions } from '@/storage/database';
import { formatRupiah } from '@/utils/formatters';

export interface BackupData {
  version: string;
  exportedAt: string;
  customers: any[];
  transactions: any[];
}

export async function exportCSV(): Promise<string> {
  const transactions = await getTransactions();
  const customers = await getCustomers();

  const customerMap = new Map(customers.map((c) => [c.id, c.name]));

  let csv = 'No,Tanggal,Pelanggan,Jenis,Jumlah,Deskripsi,Invoice,Status\n';
  transactions.forEach((tx, i) => {
    csv += `${i + 1},"${tx.date}","${customerMap.get(tx.customerId) || 'Unknown'}","${tx.type}",${tx.amount},"${tx.description}","${tx.invoice}","${tx.status}"\n`;
  });

  return csv;
}

export async function exportTextReport(): Promise<string> {
  const customers = await getCustomers();
  const transactions = await getTransactions();

  let report = 'LAPORAN BUKUKIOS\n';
  report += `Tanggal Export: ${new Date().toLocaleDateString('id-ID')}\n`;
  report += `${'='.repeat(50)}\n\n`;

  const totalUtang = customers.reduce((sum, c) => sum + c.totalDebt, 0);
  const totalDibayar = transactions.filter((t) => t.type === 'bayar').reduce((sum, t) => sum + t.amount, 0);

  report += `RINGKASAN\n`;
  report += `Total Pelanggan: ${customers.length}\n`;
  report += `Total Transaksi: ${transactions.length}\n`;
  report += `Total Piutang: ${formatRupiah(totalUtang)}\n`;
  report += `Total Dibayar: ${formatRupiah(totalDibayar)}\n\n`;

  report += `${'='.repeat(50)}\n`;
  report += `DAFTAR PELANGGAN\n`;
  report += `${'='.repeat(50)}\n\n`;

  customers.forEach((c) => {
    report += `${c.name} (${c.category})\n`;
    report += `  Telepon: ${c.phone}\n`;
    report += `  Saldo: ${formatRupiah(c.totalDebt)}\n`;
    report += `  Status: ${c.status}\n\n`;
  });

  report += `${'='.repeat(50)}\n`;
  report += `RIWAYAT TRANSAKSI\n`;
  report += `${'='.repeat(50)}\n\n`;

  transactions.forEach((tx, i) => {
    const customerName = customers.find((c) => c.id === tx.customerId)?.name || 'Unknown';
    report += `${i + 1}. [${tx.type.toUpperCase()}] ${tx.description}\n`;
    report += `   Pelanggan: ${customerName}\n`;
    report += `   Jumlah: ${formatRupiah(tx.amount)}\n`;
    report += `   Tanggal: ${tx.date}\n`;
    if (tx.invoice) report += `   Invoice: ${tx.invoice}\n`;
    report += '\n';
  });

  return report;
}

export async function backupJSON(): Promise<string> {
  const customers = await getCustomers();
  const transactions = await getTransactions();

  const backup: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    customers,
    transactions,
  };

  return JSON.stringify(backup, null, 2);
}
