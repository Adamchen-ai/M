import React from 'react';
import { type Currency } from '../types/index';
import { GoldIcon } from './GoldIcon';

interface CurrencyInputProps {
  label: string;
  amount: number;
  onAmountChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  currencies: Currency[];
  isReadOnly?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  amount,
  onAmountChange,
  selectedCurrency,
  onCurrencyChange,
  currencies,
  isReadOnly = false,
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
      <div className="flex rounded-md shadow-sm bg-slate-700 border border-slate-600 focus-within:ring-2 focus-within:ring-cyan-500">
        <div className="relative flex-grow">
          <input
            type="number"
            value={isReadOnly ? amount.toFixed(2) : amount || ''}
            onChange={onAmountChange}
            readOnly={isReadOnly}
            className={`w-full bg-transparent p-3 text-lg text-white placeholder-slate-400 focus:outline-none ${isReadOnly ? 'cursor-default' : ''}`}
            placeholder="0.00"
            aria-label={`${label} amount`}
          />
        </div>
        <div className="relative flex items-center bg-slate-600 rounded-r-md border-l border-slate-500">
          {selectedCurrency.isMetal ? (
            <GoldIcon className="w-6 h-auto ml-3" />
          ) : (
            <img
              src={`https://flagcdn.com/w40/${selectedCurrency.countryCode.toLowerCase()}.png`}
              alt={`${selectedCurrency.name} flag`}
              className="w-6 h-auto ml-3 rounded-sm"
              aria-hidden="true"
            />
          )}
          <select
            value={selectedCurrency.code}
            onChange={(e) => {
              const newCurrency = currencies.find(c => c.code === e.target.value);
              if (newCurrency) {
                onCurrencyChange(newCurrency);
              }
            }}
            className="h-full appearance-none bg-transparent text-white font-semibold py-3 pl-2 pr-8 text-base focus:outline-none focus:ring-0"
            aria-label={`${label} currency`}
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-300">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
