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
  const s = raw.replace(/\s/g, '');
  if (!/^(\d+([.,]\d*)?|[.,]\d+)$/.test(s)) return NaN;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

export function isValidAmount(raw: string): boolean {
  return raw.trim() === '' || !Number.isNaN(parseAmount(raw));
}