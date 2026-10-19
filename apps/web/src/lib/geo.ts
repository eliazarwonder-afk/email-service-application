/**
 * Geo-Location & Currency Telemetry
 * Automatically detects whether the visitor is connecting from Nigeria / Africa or Global
 * Provides currency conversion rates and formatting.
 */

export type SupportedCurrency = "USD" | "NGN" | "EUR" | "GBP";

export interface GeoLocationInfo {
  countryCode: string;
  countryName: string;
  isAfrica: boolean;
  isNigeria: boolean;
  defaultCurrency: SupportedCurrency;
}

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: "$",
  NGN: "₦",
  EUR: "€",
  GBP: "£",
};

// Fixed conversion matrix calibrated for enterprise parity
export const EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  USD: 1.0,
  NGN: 1500.0,
  EUR: 0.92,
  GBP: 0.78,
};

/**
 * Standard Plan Pricing Definitions across USD & NGN
 */
export const PLAN_PRICING = {
  starter: {
    monthlyUsd: 5.00,
    annualMonthlyUsd: 4.50,
    monthlyNgn: 7500,
    annualMonthlyNgn: 6500,
    name: "Starter Business",
    mailboxes: "Up to 10 Mailboxes",
    storage: "25 GB NVMe Pool",
    domains: "1 Custom Domain",
  },
  growth: {
    monthlyUsd: 14.00,
    annualMonthlyUsd: 12.00,
    monthlyNgn: 21000,
    annualMonthlyNgn: 18000,
    name: "Growth Agency",
    mailboxes: "Up to 30 Mailboxes",
    storage: "75 GB NVMe Pool",
    domains: "5 Custom Domains",
    popular: true,
  },
  pro: {
    monthlyUsd: 35.00,
    annualMonthlyUsd: 29.00,
    monthlyNgn: 52000,
    annualMonthlyNgn: 43500,
    name: "Enterprise Pro",
    mailboxes: "Unlimited Mailboxes",
    storage: "200 GB NVMe Pool",
    domains: "Unlimited Domains",
  },
};

/**
 * Formats a price nicely based on the selected currency.
 */
export function formatPlanPrice(
  planId: "starter" | "growth" | "pro",
  currency: SupportedCurrency,
  isAnnual: boolean = true
): { formatted: string; amount: number; symbol: string; currency: SupportedCurrency } {
  const plan = PLAN_PRICING[planId];
  const symbol = CURRENCY_SYMBOLS[currency];

  if (currency === "NGN") {
    const amount = isAnnual ? plan.annualMonthlyNgn : plan.monthlyNgn;
    return {
      formatted: `${symbol}${amount.toLocaleString()}`,
      amount,
      symbol,
      currency,
    };
  }

  if (currency === "EUR") {
    const usdAmount = isAnnual ? plan.annualMonthlyUsd : plan.monthlyUsd;
    const amount = Number((usdAmount * EXCHANGE_RATES.EUR).toFixed(2));
    return {
      formatted: `${symbol}${amount.toFixed(2)}`,
      amount,
      symbol,
      currency,
    };
  }

  if (currency === "GBP") {
    const usdAmount = isAnnual ? plan.annualMonthlyUsd : plan.monthlyUsd;
    const amount = Number((usdAmount * EXCHANGE_RATES.GBP).toFixed(2));
    return {
      formatted: `${symbol}${amount.toFixed(2)}`,
      amount,
      symbol,
      currency,
    };
  }

  // Default USD
  const amount = isAnnual ? plan.annualMonthlyUsd : plan.monthlyUsd;
  return {
    formatted: `${symbol}${amount.toFixed(2)}`,
    amount,
    symbol,
    currency,
  };
}

/**
 * Client-side detection based on timeZone and navigator settings
 */
export function detectClientRegion(): GeoLocationInfo {
  if (typeof window === "undefined") {
    return {
      countryCode: "US",
      countryName: "United States",
      isAfrica: false,
      isNigeria: false,
      defaultCurrency: "USD",
    };
  }

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const languages = navigator.languages || [navigator.language || ""];

    const isLagos = timeZone.includes("Lagos");
    const isAfrica = timeZone.includes("Africa") || languages.some((l) => l.includes("NG") || l.includes("GH") || l.includes("KE"));

    if (isLagos || languages.some((l) => l.includes("NG") || l.includes("-NG"))) {
      return {
        countryCode: "NG",
        countryName: "Nigeria",
        isAfrica: true,
        isNigeria: true,
        defaultCurrency: "NGN",
      };
    }

    if (isAfrica) {
      return {
        countryCode: "AFR",
        countryName: "Africa",
        isAfrica: true,
        isNigeria: false,
        defaultCurrency: "NGN",
      };
    }
  } catch (e) {
    // ignore
  }

  return {
    countryCode: "US",
    countryName: "United States",
    isAfrica: false,
    isNigeria: false,
    defaultCurrency: "USD",
  };
}
