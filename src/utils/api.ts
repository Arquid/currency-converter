import type { ExchangeRateResponse } from "../types";

const BASE_URL = "/api";

export async function fetchExchangeRate(
  from: string,
  to: string
): Promise<number> {
  if (from === to) return 1;

  const res = await fetch(`${BASE_URL}/latest?from=${from}&to=${to}`);

  if (!res.ok) {
    throw new Error(`Api get error: ${res.status}`);
  }

  const data: ExchangeRateResponse = await res.json();
  const rate = data.rates[to];

  if (rate === undefined) {
    throw new Error(`Currency ${to} not available`);
  }

  return rate;
}