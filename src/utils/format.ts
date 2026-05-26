export function formatCurrency(value: number, currencyCode: string): string {
  return new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: currencyCode === 'JPY' ? 0 : 4,
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