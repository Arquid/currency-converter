import type { ConversionState, Currency } from "../types";
import { formatCurrency } from "../utils/format";

interface Props {
  state: ConversionState;
  amount: number;
  from: Currency;
  to: Currency;
  onRefresh: () => void;
}

export function ConversionResult({ state, amount, from, to, onRefresh}: Props) {
  const { rate, status, error, updatedAt} = state;

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
    <div className="result-box result-box--success">
      <p className="result-from">{from.flag} {formatCurrency(amount, from.code)}</p>
      <p className="result-to">{to.flag} {formatCurrency(amount * rate, to.code)}</p>
      <div className="result-footer">
        <span className="result-rate">1 {from.code} = {rate.toFixed(4)} {to.code}</span>
        {updatedAt && (
          <button className="refresh-btn" onClick={onRefresh}>↻ {updatedAt}</button>
        )}
      </div>
    </div>
  );
}