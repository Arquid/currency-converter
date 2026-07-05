import type { ExchangeRateResponse } from "../types";

const BASE_URL = "/api";

export async function fetchExchangeRate(
  from: string,
  to: string
): Promise<number> {
  if (from === to) return 1;

  let res: Response;

  try {
    res = await fetch(`${BASE_URL}/latest?from=${from}&to=${to}`);
  } catch {
    throw new Error("Could not connect. Check your internet connection and try again.");
  }

  if (!res.ok) {
    throw new Error(
      res.status >= 500
        ? "The exchange rate service is currently unavailable. Please try again later."
        : "Could not fetch the exchange rate. Please try again."
    );
  }

  const data: ExchangeRateResponse = await res.json();
  const rate = data.rates[to];

  if (rate === undefined) {
    throw new Error(`Exchange rate for ${to} is not available right now.`);
  }

  return rate;
}