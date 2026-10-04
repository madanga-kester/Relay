import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Currency = "KSh" | "USD" | "EUR" | "GBP";
export const CURRENCY_OPTIONS: Currency[] = ["KSh", "USD", "EUR", "GBP"];
export const DEFAULT_CURRENCY: Currency = "KSh";
export const CURRENCY = DEFAULT_CURRENCY;
let activeCurrency: Currency = DEFAULT_CURRENCY;

export function formatCurrency(amount: number, decimals = 2, currency: Currency = activeCurrency) {
  return `${currency} ${amount.toLocaleString("en-KE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function formatCompactCurrency(amount: number, currency: Currency = activeCurrency) {
  return formatCurrency(amount, Number.isInteger(amount) ? 0 : 2, currency);
}

type CurrencyContextValue = { currency: Currency; setCurrency: (currency: Currency) => void; format: (amount: number, decimals?: number) => string };
const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem("relay-currency") as Currency | null;
    const initial = saved && CURRENCY_OPTIONS.includes(saved) ? saved : DEFAULT_CURRENCY;
    activeCurrency = initial;
    return initial;
  });
  useEffect(() => { activeCurrency = currency; localStorage.setItem("relay-currency", currency); }, [currency]);
  const value = useMemo(() => ({ currency, setCurrency: (next: Currency) => { activeCurrency = next; setCurrencyState(next); }, format: (amount: number, decimals = 2) => formatCurrency(amount, decimals, currency) }), [currency]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
