import type { Currency } from "../types";

export const CURRENCIES: Currency[] = [
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "SEK", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone", flag: "🇩🇰" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "PLN", name: "Polish Złoty", flag: "🇵🇱" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
];

export function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}