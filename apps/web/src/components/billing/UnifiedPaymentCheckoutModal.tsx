"use client";

import React, { useState } from "react";
import {
  X,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
  Smartphone,
  Globe,
  Coins
} from "lucide-react";
import { useCurrency } from "@/components/CurrencyProvider";
import { PLAN_PRICING, formatPlanPrice, SupportedCurrency } from "@/lib/geo";

interface UnifiedPaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: "starter" | "growth" | "pro";
  onPaymentSuccess?: (newPlan: string) => void;
}

export function UnifiedPaymentCheckoutModal({
  isOpen,
  onClose,
  defaultPlan = "growth",
  onPaymentSuccess,
}: UnifiedPaymentCheckoutModalProps) {
  const { currency, setCurrency, isAfrica, isNigeria } = useCurrency();
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "growth" | "pro">(defaultPlan);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("annually");
  
  // Payment Gateway Tab: paystack | flutterwave | stripe | crypto
  const [gateway, setGateway] = useState<"paystack" | "flutterwave" | "stripe" | "crypto">(
    isNigeria ? "paystack" : isAfrica ? "flutterwave" : "stripe"
  );

  const [cryptoAsset, setCryptoAsset] = useState<"usdt_trc20" | "btc" | "eth" | "sol">("usdt_trc20");
  const [step, setStep] = useState<"select" | "pay" | "confirmed">("select");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [txHashInput, setTxHashInput] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txConfirmed, setTxConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const currentPricing = formatPlanPrice(selectedPlan, currency, billingCycle === "annually");
  const isAnnual = billingCycle === "annually";

  const cryptoDepositAddresses = {
    usdt_trc20: {
      network: "TRON (TRC-20)",
      address: "TZeGaC1oudMailUSDT2026PaymentNodeAddrX9",
      memoRequired: false,
    },
    btc: {
      network: "Bitcoin Native SegWit (Bech32)",
      address: "bc1qzegacloudmailnode2026btcpaycluster9",
      memoRequired: false,
    },
    eth: {
      network: "Ethereum (ERC-20)",
      address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      memoRequired: false,
    },
    sol: {
      network: "Solana (SPL)",
      address: "ZegaMailClusterPaySolanaNode111111111111",
      memoRequired: false,
    },
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Submit Order Initiation
  const handleInitiatePayment = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle,
          gateway,
          currency,
          cryptoAsset: gateway === "crypto" ? cryptoAsset : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderData(data);
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }
        setStep("pay");
      } else {
        setErrorMessage(data.error || "Unable to initialize order.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Crypto Transaction
  const handleConfirmCryptoPayment = async () => {
    if (!txHashInput.trim()) {
      setErrorMessage("Please enter your transaction hash or TX ID.");
      return;
    }

    setTxSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData?.orderId,
          invoiceId: orderData?.invoiceId,
          txHash: txHashInput.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTxConfirmed(true);
        setStep("confirmed");
        if (onPaymentSuccess) onPaymentSuccess(selectedPlan);
      } else {
        setErrorMessage(data.error || "Verification in progress. We will activate your node once confirmed.");
      }
    } catch (err: any) {
      setErrorMessage("Network error during verification.");
    } finally {
      setTxSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {step === "select" && "Upgrade Your Business Email Plan"}
                {step === "pay" && "Complete Payment"}
                {step === "confirmed" && "Subscription Activated!"}
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                WHMCS Billing &bull; Encrypted TLS 1.3 &bull; Instant Mailbox Quota Allocation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: PLAN & GATEWAY SELECTION */}
          {step === "select" && (
            <div className="space-y-6">
              {/* Billing Cycle & Currency Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                {/* Billing Cycle */}
                <div className="inline-flex rounded-xl p-1 bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      billingCycle === "monthly"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("annually")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      billingCycle === "annually"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>Annual Billing</span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1 rounded font-bold">
                      -20%
                    </span>
                  </button>
                </div>

                {/* Currency Switcher */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium text-[11px]">Currency:</span>
                  <div className="inline-flex rounded-xl p-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {(["USD", "NGN", "EUR", "GBP"] as SupportedCurrency[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                          currency === c
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3 Tier Plan Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["starter", "growth", "pro"] as const).map((planId) => {
                  const info = PLAN_PRICING[planId];
                  const price = formatPlanPrice(planId, currency, isAnnual);
                  const isSelected = selectedPlan === planId;

                  return (
                    <div
                      key={planId}
                      onClick={() => setSelectedPlan(planId)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          {info.name.split(" ")[0]}
                        </span>
                        {planId === "growth" && (
                          <span className="text-[9px] font-mono uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                            Popular
                          </span>
                        )}
                      </div>

                      <div className="mb-3">
                        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                          {price.formatted}
                        </span>
                        <span className="text-xs text-slate-400">/mo</span>
                      </div>

                      <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>{info.mailboxes}</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>{info.storage}</span>
                        </li>
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* PAYMENT GATEWAY TABS */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Select Payment Gateway
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Paystack (Nigeria & Africa) */}
                  <button
                    type="button"
                    onClick={() => setGateway("paystack")}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      gateway === "paystack"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>🇳🇬 Paystack</span>
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Bank Transfer, Cards &amp; USSD
                    </span>
                  </button>

                  {/* Flutterwave (Africa) */}
                  <button
                    type="button"
                    onClick={() => setGateway("flutterwave")}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      gateway === "flutterwave"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>🌍 Flutterwave</span>
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Mobile Money &amp; Cards
                    </span>
                  </button>

                  {/* Stripe (Global Cards) */}
                  <button
                    type="button"
                    onClick={() => setGateway("stripe")}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      gateway === "stripe"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                      <span>Stripe</span>
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      Visa, Mastercard &amp; Apple Pay
                    </span>
                  </button>

                  {/* Crypto (On-Chain) */}
                  <button
                    type="button"
                    onClick={() => setGateway("crypto")}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      gateway === "crypto"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Coins className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Crypto</span>
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      USDT, BTC, ETH, SOL
                    </span>
                  </button>
                </div>
              </div>

              {/* Crypto Asset Selector (Only shown if crypto is selected) */}
              {gateway === "crypto" && (
                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Choose Cryptocurrency:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["usdt_trc20", "btc", "eth", "sol"] as const).map((coin) => (
                      <button
                        key={coin}
                        type="button"
                        onClick={() => setCryptoAsset(coin)}
                        className={`p-2 rounded-xl text-xs font-mono font-semibold uppercase text-center border ${
                          cryptoAsset === coin
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {coin.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary and Next Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total Billed Today:</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {currency === "NGN"
                      ? `₦${(currentPricing.amount * (isAnnual ? 12 : 1)).toLocaleString()}`
                      : `${currentPricing.symbol}${(currentPricing.amount * (isAnnual ? 12 : 1)).toFixed(2)}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSubmitting ? "animate-spin" : "hidden"}`} />
                  <span>{isSubmitting ? "Connecting Gateway..." : "Proceed to Checkout"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CRYPTO DEPOSIT INSTRUCTIONS */}
          {step === "pay" && gateway === "crypto" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Deposit Destination ({cryptoDepositAddresses[cryptoAsset].network})
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                    Awaiting Blockchain Confirmation
                  </span>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 font-mono mb-1">Send exact deposit to:</p>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate mr-2">
                      {cryptoDepositAddresses[cryptoAsset].address}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(cryptoDepositAddresses[cryptoAsset].address, "addr")}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedField === "addr" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enter Transaction Hash / TXID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0x8a92... or TRC20 TXID"
                    value={txHashInput}
                    onChange={(e) => setTxHashInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep("select")}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  &larr; Back
                </button>

                <button
                  type="button"
                  onClick={handleConfirmCryptoPayment}
                  disabled={txSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${txSubmitting ? "animate-spin" : "hidden"}`} />
                  <span>{txSubmitting ? "Verifying On-Chain..." : "Confirm Payment"}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMED */}
          {step === "confirmed" && (
            <div className="py-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Payment Successfully Verified!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Your WHMCS order (#{orderData?.orderId || "ZORD-892"}) has been activated. Mailbox quotas and high-speed NVMe limits are now updated.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                >
                  Return to Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
