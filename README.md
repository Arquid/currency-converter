# Currency Converter

A real-time currency converter built with Vite, React and TypeScript. Exchange rates are fetched from the [Frankfurter API](https://api.frankfurter.app) — free, no API key required.

## Features

- Real-time exchange rates (European Central Bank data)
- 14 currencies supported
- Swap currencies with one click
- Input validation with error messages
- Manual rate refresh
- Dark mode support
- Fully typed with TypeScript

## Tech Stack

- [Vite](https://vitejs.dev/) — build tool
- [React 19](https://react.dev/) — UI framework
- [TypeScript](https://www.typescriptlang.org/) — type safety
- [Frankfurter API](https://api.frankfurter.app) — exchange rates

## Project Structure

```
src/
├── components/
│   ├── CurrencySelect.tsx    # Currency dropdown
│   └── ConversionResult.tsx  # Result display
├── hooks/
│   └── useExchangeRate.ts    # API logic & state
├── types/
│   └── index.ts              # Shared TypeScript types
├── utils/
│   ├── api.ts                # Frankfurter API client
│   ├── currencies.ts         # Currency list
│   └── format.ts             # Number formatting helpers
├── App.tsx
└── App.css
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/Arquid/currency-converter.git
cd currency-converter
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## License

MIT
