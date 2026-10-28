"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SupportedCurrency, CURRENCY_SYMBOLS, detectClientRegion } from "@/lib/geo";

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  symbol: string;
  isAfrica: boolean;
  isNigeria: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "NGN",
  setCurrency: () => {},
  symbol: "₦",
  isAfrica: true,
  isNigeria: true,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>("NGN");
  const [isAfrica, setIsAfrica] = useState(true);
  const [isNigeria, setIsNigeria] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("zegamail_currency") as SupportedCurrency | null;
    if (saved && ["USD", "NGN", "EUR", "GBP"].includes(saved)) {
      setCurrencyState(saved);
      setIsNigeria(saved === "NGN");
      setIsAfrica(saved === "NGN");
    } else {
      const geo = detectClientRegion();
      setCurrencyState(geo.defaultCurrency);
      setIsAfrica(geo.isAfrica);
      setIsNigeria(geo.isNigeria);
    }
  }, []);

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    localStorage.setItem("zegamail_currency", c);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        symbol: CURRENCY_SYMBOLS[currency] || "$",
        isAfrica,
        isNigeria,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
