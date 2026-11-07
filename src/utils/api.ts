import type { ExchangeRateResponse, ExchangeRateHistoryResponse, RateHistoryPoint } from "../types";

const configuredBaseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = (configuredBaseUrl || "/api").replace(/\/+$/, "");

const REQUEST_TIMEOUT_MS = 10_000;

interface RequestOptions {
  signal?: AbortSignal;
}

// Fetches a URL and gives up after REQUEST_TIMEOUT_MS. The caller can cancel the
// request with `signal`. A cancelled request rejects with its original
// AbortError, which callers should ignore instead of showing it to the user.
async function request(url: string, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) cancel();

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (signal?.aborted) throw err;
    if (timedOut) {
      throw new Error("The exchange rate service did not respond in time. Please try again.", { cause: err });
    }
    throw new Error("Could not connect. Check your internet connection and try again.", { cause: err });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}

export async function fetchExchangeRate(
  from: string,
  to: string,
  { signal }: RequestOptions = {}
): Promise<number> {
  if (from === to) return 1;

  const res = await request(`${BASE_URL}/latest?from=${from}&to=${to}`, signal);

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

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function fetchExchangeRateHistory(
  from: string,
  to: string,
  { days = 30, signal }: RequestOptions & { days?: number } = {}
): Promise<RateHistoryPoint[]> {
  if (from === to) return [];

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  const res = await request(
    `${BASE_URL}/${toISODate(start)}..${toISODate(end)}?from=${from}&to=${to}`,
    signal
  );

  if (!res.ok) {
    throw new Error(
      res.status >= 500
        ? "The exchange rate service is currently unavailable. Please try again later."
        : "Could not fetch the rate history. Please try again."
    );
  }

  const data: ExchangeRateHistoryResponse = await res.json();

  return Object.entries(data.rates)
    .map(([date, ratesForDate]) => ({ date, rate: ratesForDate[to] }))
    .filter((point): point is RateHistoryPoint => point.rate !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date));
}