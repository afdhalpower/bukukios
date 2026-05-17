const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export { MONTHS };

export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split(' ');
  const day = parseInt(parts[0], 10);
  const month = MONTHS.indexOf(parts[1]);
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

export function formatDateInput(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function parseDateInput(text: string): Date | null {
  const parts = text.split('/');
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parseInt(parts[2], 10);
  const date = new Date(y, m, d);
  if (isNaN(date.getTime())) return null;
  if (date.getDate() !== d || date.getMonth() !== m || date.getFullYear() !== y) return null;
  return date;
}

export function formatRupiah(n: number): string {
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
}

export function getCurrentMonthYear(): string {
  const now = new Date();
  return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}
