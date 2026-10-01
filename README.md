# Currency Converter

[![CI](https://github.com/Arquid/currency-converter/actions/workflows/ci.yml/badge.svg)](https://github.com/Arquid/currency-converter/actions/workflows/ci.yml)

A currency converter built with Vite, React and TypeScript. Exchange rates come from the [Frankfurter API](https://frankfurter.dev), which publishes the European Central Bank's daily reference rates — free, no API key required.

## Features

- Daily exchange rates (European Central Bank reference rates)
- 14 currencies supported: EUR, USD, GBP, JPY, CHF, SEK, NOK, DKK, CAD, AUD, CNY, INR, PLN, BRL
- Swap currencies with one click
- Rate history sparkline for the last 30 calendar days (business days only)
- Shareable links: the amount and currency pair are kept in the URL
- Input validation with error messages
- Manual rate refresh
- Dark mode support
- Fully typed with TypeScript

## Shareable Links

The current amount and currency pair are always reflected in the URL, so you can bookmark or share a specific conversion:

```
/?amount=250&from=USD&to=JPY
```

- `amount`: a non-negative number, with a dot or a comma as the decimal separator. Spaces are ignored, so `1 000` means 1000
- `from`, `to`: one of the supported currency codes listed above, in uppercase (for example `USD`; `usd` is ignored)

Each missing or invalid parameter falls back to its default (`100`, `EUR` and `USD`).

## Tech Stack

- [Vite](https://vite.dev/) — build tool
- [React 19](https://react.dev/) — UI framework
- [TypeScript](https://www.typescriptlang.org/) — type safety
- [Frankfurter API](https://frankfurter.dev) — exchange rates
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) — tests

## Project Structure

Abridged: configuration files, `src/main.tsx` and `src/index.css` are not listed.

```
.github/workflows/ci.yml      # CI: type check + tests
src/
├── components/
│   ├── CurrencySelect.tsx    # Currency dropdown
│   ├── ConversionResult.tsx  # Result display
│   ├── ErrorBoundary.tsx     # Top-level crash guard
│   ├── RateSparkline.tsx     # Rate history chart
│   └── RateSparkline.test.tsx
├── hooks/
│   ├── useExchangeRate.ts    # API logic & state
│   ├── useExchangeRate.test.ts
│   ├── useRateHistory.ts     # Rate history for the sparkline
│   └── useRateHistory.test.ts
├── types/
│   └── index.ts              # Shared TypeScript types
├── utils/
│   ├── api.ts                # Frankfurter API client
│   ├── api.test.ts
│   ├── currencies.ts         # Currency list
│   ├── currencies.test.ts
│   ├── format.ts             # Number formatting helpers
│   ├── format.test.ts
│   ├── url.ts                # Shareable-link (query string) helpers
│   └── url.test.ts
├── test/
│   └── setup.ts              # Vitest setup (jest-dom matchers)
├── App.tsx
├── App.test.tsx
└── App.css
```

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.13+ (or any newer version). npm comes with Node.js.

### Installation

```bash
git clone https://github.com/Arquid/currency-converter.git
cd currency-converter
npm ci
```

`npm ci` installs the exact versions from `package-lock.json`.

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The dev server proxies `/api` requests to the Frankfurter API (see `server.proxy` in `vite.config.ts`).

### Available Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (port 5173) |
| `npm run build` | Type check and build for production into `dist/` |
| `npm run preview` | Preview the production build (port 4173) |
| `npm run lint` | Run ESLint |
| `npm test` | Run the test suite once |

### Testing

```bash
npm test
```

Runs the test suite (Vitest with jsdom) once. It covers the API client, the hooks, the formatting and URL helpers, and most of the components. The error boundary and visual/CSS behavior are not covered by automated tests.

To run the tests in watch mode, use `npx vitest`.

Tests also run automatically in CI on every push and pull request to `main`.

## Deployment

The app requests rates from relative `/api/...` URLs. In development (`npm run dev`) and in `npm run preview`, Vite proxies `/api` to the Frankfurter API. A static host that only serves the contents of `dist/` has no such proxy, so rate requests would fail with a 404.

When you deploy, make your host forward `/api/*` to the Frankfurter API, so that `/api/<path>` maps to `https://api.frankfurter.dev/v1/<path>`. For example, a Netlify `_redirects` rule:

```
/api/*  https://api.frankfurter.dev/v1/:splat  200
```

## Troubleshooting

- **`Port 5173 is in use, trying another one...`**: Vite picks the next free port and prints it. To choose one yourself, run `npm run dev -- --port 3000`.
- **`EBADENGINE` warnings during install, or the dev server fails to start**: check `node -v` against the prerequisites above.
- **`Could not connect. Check your internet connection and try again.`**: the Frankfurter API is not reachable. Check your network connection and click **Try again**.

## Known Limitations

- **Amount format**: only a plain number is accepted. Grouped numbers with commas or dots, such as `1,000.50` or `1.000,50`, are rejected instead of guessed, because their meaning is ambiguous. Type `1000.50` instead. Other input, such as `12abc`, `1e3` or a negative number, also shows the validation error and no conversion.
- **Number format**: amounts and currency symbols are always formatted with the Finnish (`fi-FI`) locale, whatever the browser language is. For example `114,48 $` and `100,00 INR`.
- **Rate precision**: the rate line shows four decimals, so a small rate is rounded coarsely (`1 JPY = 0.0056 EUR`), while the converted amount is calculated from the exact rate.
- **Slow API**: requests have no timeout. If the API never answers, the app stays on `Fetching currency...` until you reload the page.

## License

[MIT](LICENSE)
