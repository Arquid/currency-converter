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

export interface ExchangeRateHistoryResponse {
  amount: number;
  base: string;
  start_date: string;
  end_date: string;
  rates: Record<string, Record<string, number>>;
}

export interface RateHistoryPoint {
  date: string;
  rate: number;
}

export type ConversionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ConversionState {
  rate: number | null;
  status: ConversionStatus;
  error: string | null;
  updatedAt: string | null;
}