/**
 * Geo-Location & Currency Telemetry
 * Automatically detects whether the visitor is connecting from Nigeria / Africa or Global
 * Provides currency conversion rates, drastic promotional discounts, and formatting.
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
 * Standard & Drastic Launch Promo Plan Pricing Definitions
 * Calibrated specifically for the Nigerian market & global launch affordability.
 */
export const PLAN_PRICING = {
  free: {
    name: "Free Forever",
    mailboxes: "2 Free Mailboxes",
    mailboxCount: 2,
    storage: "2 GB NVMe Pool",
    domains: "1 Custom Domain",
    promo: {
      monthlyUsd: 0,
      annualMonthlyUsd: 0,
      monthlyNgn: 0,
      annualMonthlyNgn: 0,
    },
    regular: {
      monthlyUsd: 0,
      annualMonthlyUsd: 0,
      monthlyNgn: 0,
      annualMonthlyNgn: 0,
    },
  },
  starter: {
    name: "Starter Business",
    mailboxes: "Up to 10 Mailboxes",
    mailboxCount: 10,
    storage: "25 GB NVMe Pool",
    domains: "1 Custom Domain",
    // Drastic Promotional Launch Pricing (70%+ OFF)
    promo: {
      monthlyUsd: 2.50,
      annualMonthlyUsd: 1.99,
      monthlyNgn: 1900,
      annualMonthlyNgn: 1500,
    },
    // Standard Reference Pricing
    regular: {
      monthlyUsd: 5.00,
      annualMonthlyUsd: 4.50,
      monthlyNgn: 7500,
      annualMonthlyNgn: 6500,
    },
  },
  growth: {
    name: "Growth Agency",
    mailboxes: "Up to 30 Mailboxes",
    mailboxCount: 30,
    storage: "75 GB NVMe Pool",
    domains: "5 Custom Domains",
    popular: true,
    // Drastic Promotional Launch Pricing (75% OFF)
    promo: {
      monthlyUsd: 6.00,
      annualMonthlyUsd: 4.99,
      monthlyNgn: 5500,
      annualMonthlyNgn: 4500,
    },
    // Standard Reference Pricing
    regular: {
      monthlyUsd: 14.00,
      annualMonthlyUsd: 12.00,
      monthlyNgn: 21000,
      annualMonthlyNgn: 18000,
    },
  },
  pro: {
    name: "Enterprise Pro",
    mailboxes: "Unlimited Mailboxes",
    mailboxCount: 100, // baseline for calculation
    storage: "200 GB NVMe Pool",
    domains: "Unlimited Domains",
    // Drastic Promotional Launch Pricing (70% OFF)
    promo: {
      monthlyUsd: 15.00,
      annualMonthlyUsd: 12.99,
      monthlyNgn: 15000,
      annualMonthlyNgn: 12500,
    },
    // Standard Reference Pricing
    regular: {
      monthlyUsd: 35.00,
      annualMonthlyUsd: 29.00,
      monthlyNgn: 52000,
      annualMonthlyNgn: 43500,
    },
  },
};

/**
 * Formats a price nicely based on the selected currency, incorporating promotional pricing.
 */
export function formatPlanPrice(
  planId: "free" | "starter" | "growth" | "pro",
  currency: SupportedCurrency,
  isAnnual: boolean = true
): {
  formatted: string;
  amount: number;
  regularFormatted: string;
  regularAmount: number;
  discountPercent: number;
  perMailboxFormatted: string;
  symbol: string;
  currency: SupportedCurrency;
} {
  const plan = PLAN_PRICING[planId] || PLAN_PRICING.starter;
  const symbol = CURRENCY_SYMBOLS[currency] || "$";
  const mailboxCount = plan.mailboxCount || 10;

  if (planId === "free") {
    return {
      formatted: `${symbol}0`,
      amount: 0,
      regularFormatted: `${symbol}0`,
      regularAmount: 0,
      discountPercent: 0,
      perMailboxFormatted: `${symbol}0/mailbox`,
      symbol,
      currency,
    };
  }

  if (currency === "NGN") {
    const promoAmt = isAnnual ? plan.promo.annualMonthlyNgn : plan.promo.monthlyNgn;
    const regularAmt = isAnnual ? plan.regular.annualMonthlyNgn : plan.regular.monthlyNgn;
    const discount = Math.round(((regularAmt - promoAmt) / regularAmt) * 100);
    const perMailbox = Math.round(promoAmt / mailboxCount);

    return {
      formatted: `${symbol}${promoAmt.toLocaleString()}`,
      amount: promoAmt,
      regularFormatted: `${symbol}${regularAmt.toLocaleString()}`,
      regularAmount: regularAmt,
      discountPercent: discount,
      perMailboxFormatted: `${symbol}${perMailbox.toLocaleString()}/mailbox`,
      symbol,
      currency,
    };
  }

  if (currency === "EUR") {
    const usdPromo = isAnnual ? plan.promo.annualMonthlyUsd : plan.promo.monthlyUsd;
    const usdRegular = isAnnual ? plan.regular.annualMonthlyUsd : plan.regular.monthlyUsd;
    const promoAmt = Number((usdPromo * EXCHANGE_RATES.EUR).toFixed(2));
    const regularAmt = Number((usdRegular * EXCHANGE_RATES.EUR).toFixed(2));
    const discount = Math.round(((regularAmt - promoAmt) / regularAmt) * 100);
    const perMailbox = (promoAmt / mailboxCount).toFixed(2);

    return {
      formatted: `${symbol}${promoAmt.toFixed(2)}`,
      amount: promoAmt,
      regularFormatted: `${symbol}${regularAmt.toFixed(2)}`,
      regularAmount: regularAmt,
      discountPercent: discount,
      perMailboxFormatted: `${symbol}${perMailbox}/mailbox`,
      symbol,
      currency,
    };
  }

  if (currency === "GBP") {
    const usdPromo = isAnnual ? plan.promo.annualMonthlyUsd : plan.promo.monthlyUsd;
    const usdRegular = isAnnual ? plan.regular.annualMonthlyUsd : plan.regular.monthlyUsd;
    const promoAmt = Number((usdPromo * EXCHANGE_RATES.GBP).toFixed(2));
    const regularAmt = Number((usdRegular * EXCHANGE_RATES.GBP).toFixed(2));
    const discount = Math.round(((regularAmt - promoAmt) / regularAmt) * 100);
    const perMailbox = (promoAmt / mailboxCount).toFixed(2);

    return {
      formatted: `${symbol}${promoAmt.toFixed(2)}`,
      amount: promoAmt,
      regularFormatted: `${symbol}${regularAmt.toFixed(2)}`,
      regularAmount: regularAmt,
      discountPercent: discount,
      perMailboxFormatted: `${symbol}${perMailbox}/mailbox`,
      symbol,
      currency,
    };
  }

  // Default USD
  const promoAmt = isAnnual ? plan.promo.annualMonthlyUsd : plan.promo.monthlyUsd;
  const regularAmt = isAnnual ? plan.regular.annualMonthlyUsd : plan.regular.monthlyUsd;
  const discount = Math.round(((regularAmt - promoAmt) / regularAmt) * 100);
  const perMailbox = (promoAmt / mailboxCount).toFixed(2);

  return {
    formatted: `${symbol}${promoAmt.toFixed(2)}`,
    amount: promoAmt,
    regularFormatted: `${symbol}${regularAmt.toFixed(2)}`,
    regularAmount: regularAmt,
    discountPercent: discount,
    perMailboxFormatted: `${symbol}${perMailbox}/mailbox`,
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
      countryCode: "NG",
      countryName: "Nigeria",
      isAfrica: true,
      isNigeria: true,
      defaultCurrency: "NGN",
    };
  }

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const languages = navigator.languages || [navigator.language || ""];
    const offset = new Date().getTimezoneOffset(); // in minutes, Nigeria UTC+1 is -60

    const isLagos = timeZone.includes("Lagos") || timeZone.includes("Porto-Novo") || timeZone.includes("Douala") || (offset === -60 && timeZone.includes("Africa"));
    const isAfrica = timeZone.includes("Africa") || languages.some((l) => l.includes("NG") || l.includes("GH") || l.includes("KE") || l.includes("ZA") || l.includes("EG")) || offset === -60;

    if (isLagos || languages.some((l) => l.includes("NG") || l.includes("-NG")) || (offset === -60 && timeZone.includes("Africa"))) {
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

    const isUk = timeZone.includes("London") || languages.some((l) => l.includes("GB") || l.includes("-GB"));
    if (isUk) {
      return {
        countryCode: "GB",
        countryName: "United Kingdom",
        isAfrica: false,
        isNigeria: false,
        defaultCurrency: "GBP",
      };
    }

    const isEurope = timeZone.includes("Europe") || languages.some((l) => l.includes("FR") || l.includes("DE") || l.includes("ES") || l.includes("IT"));
    if (isEurope) {
      return {
        countryCode: "EU",
        countryName: "Europe",
        isAfrica: false,
        isNigeria: false,
        defaultCurrency: "EUR",
      };
    }
  } catch (e) {
    // ignore
  }

  return {
    countryCode: "NG",
    countryName: "Nigeria",
    isAfrica: true,
    isNigeria: true,
    defaultCurrency: "NGN",
  };
}
