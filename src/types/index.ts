export interface Currency {
  code: string;
  name: string;
  flag: string;
}

export interface ExchangeRateResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export type ConversionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ConversionState {
  rate: number | null;
  status: ConversionStatus;
  error: string | null;
  updatedAt: string | null;
}