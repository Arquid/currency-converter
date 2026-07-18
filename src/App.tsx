import { useState } from "react";
import { CurrencySelect } from "./components/CurrencySelect";
import { ConversionResult } from "./components/ConversionResult";
import { useExchangeRate } from "./hooks/useExchangeRate";
import { useRateHistory } from "./hooks/useRateHistory";
import { CURRENCIES, getCurrency } from "./utils/currencies";
import { parseAmount, isValidAmount } from "./utils/format";
import "./App.css";

export default function App() {
  const [amount, setAmount] = useState<string>("100");
  const [from, setFrom] = useState<string>("EUR");
  const [to, setTo] = useState<string>("USD");

  const { rate, status, error, updatedAt, isRefreshing, refresh } = useExchangeRate(from, to);
  const { points: history } = useRateHistory(from, to);

  const fromCurrency = getCurrency(from);
  const toCurrency = getCurrency(to);
  const numericAmount = parseAmount(amount);
  const amountInvalid = !isValidAmount(amount) && amount !== "";

  return (
    <main className="app">
      <header className="app-header">
        <p className="app-eyebrow">Currency converter</p>
        <h1 className="app-title">Real-time courses</h1>
      </header>

      <div className="card">
        <div className="field">
          <label className="field-label" htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={`amount-input${amountInvalid ? " amount-input--invalid" : ""}`}
          />
          {amountInvalid && <p className="field-error">Please enter a valid number.</p>}
        </div>

        <div className="currency-row">
          <CurrencySelect value={from} onChange={setFrom} label="Starting currency" currencies={CURRENCIES} />
          <button className="swap-btn" onClick={() => { setFrom(to); setTo(from); }} aria-label="Swap currencies">⇄</button>
          <CurrencySelect value={to} onChange={setTo} label="Target currency" currencies={CURRENCIES} />
        </div>
      </div>

      <ConversionResult
        state={{ rate, status, error, updatedAt }}
        isRefreshing={isRefreshing}
        amount={numericAmount}
        from={fromCurrency}
        to={toCurrency}
        onRefresh={refresh}
        history={history}
      />
    </main>
  );
}