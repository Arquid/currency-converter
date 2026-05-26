import type { Currency } from '../types';

interface Props {
  value: string;
  onChange: (code: string) => void;
  label: string;
  currencies: Currency[];
}

export function CurrencySelect({ value, onChange, label, currencies}: Props) {
  return (
    <div className='select-wrapper'>
      <label className='field-label' htmlFor={`select-${label}`}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='currency-select'
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code} - {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}