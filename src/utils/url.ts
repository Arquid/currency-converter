import { CURRENCIES } from "./currencies";
import { isValidAmount } from "./format";

export interface UrlState {
  amount: string;
  from: string;
  to: string;
}

function isKnownCurrency(code: string | null): code is string {
  return code !== null && CURRENCIES.some((c) => c.code === code);
}

export function readStateFromUrl(search: string): Partial<UrlState> {
  const params = new URLSearchParams(search);
  const amount = params.get("amount");
  const from = params.get("from");
  const to = params.get("to");

  const state: Partial<UrlState> = {};

  if (amount !== null && amount.trim() !== "" && isValidAmount(amount)) {
    state.amount = amount;
  }
  if (isKnownCurrency(from)) {
    state.from = from;
  }
  if (isKnownCurrency(to)) {
    state.to = to;
  }

  return state;
}

export function writeStateToUrl(state: UrlState): void {
  const params = new URLSearchParams({
    amount: state.amount,
    from: state.from,
    to: state.to,
  });

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, "", newUrl);
}
