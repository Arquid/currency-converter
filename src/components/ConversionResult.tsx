import type { ConversionState, Currency, RateHistoryPoint } from "../types";
import { formatCurrency } from "../utils/format";
import { RateSparkline } from "./RateSparkline";

interface Props {
  state: ConversionState;
  isRefreshing: boolean;
  amount: number;
  from: Currency;
  to: Currency;
  onRefresh: () => void;
  history: RateHistoryPoint[];
}

export function ConversionResult({ state, isRefreshing, amount, from, to, onRefresh, history }: Props) {
  const { rate, status, error, updatedAt } = state;

  if (status === 'loading') {
    return <div className='result-box'><p className='result-meta'>Fetching currency...</p></div>;
  }

  if (status === "error") {
    return (
      <div className="result-box result-box--error">
        <p className="result-error">⚠ {error}</p>
        <button className="refresh-btn" onClick={onRefresh}>Try again</button>
      </div>
    );
  }

  if (rate === null || isNaN(amount)) {
    return <div className="result-box"><p className="result-meta">Enter the amount for conversion</p></div>;
  }

  return (
    <div className={`result-box result-box--success${isRefreshing ? " result-box--refreshing" : ""}`}>
      <p className="result-from">{from.flag} {formatCurrency(amount, from.code)}</p>
      <p className="result-to">{to.flag} {formatCurrency(amount * rate, to.code)}</p>
      <div className="result-footer">
        <span className="result-rate">1 {from.code} = {rate.toFixed(4)} {to.code}</span>
        {updatedAt && (
          <button className="refresh-btn" onClick={onRefresh} disabled={isRefreshing}>
            {isRefreshing ? "↻ Updating…" : `↻ ${updatedAt}`}
          </button>
        )}
      </div>
      <RateSparkline points={history} fromCode={from.code} toCode={to.code} />
    </div>
  );
}
