export function formatCurrency(value: number, currencyCode: string): string {
  const isJPY = currencyCode === 'JPY';

  return new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: isJPY ? 0 : 2,
    maximumFractionDigits: isJPY ? 0 : 4,
  }).format(value);
}

export function parseAmount(raw: string): number {
  return parseFloat(raw.replace(',', '.'));
}

export function isValidAmount(raw: string): boolean {
  if (raw.trim() === '') return true;
  const n = parseFloat(raw.replace(',', '.'));
  return !isNaN(n) && n >= 0;
}