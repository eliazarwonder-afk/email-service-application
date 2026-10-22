"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Coins,
  Lock,
  User,
  Mail,
  Building2,
} from "lucide-react";
import { useCurrency } from "@/components/CurrencyProvider";
import { PLAN_PRICING, formatPlanPrice, SupportedCurrency } from "@/lib/geo";
import { ZegaLogo } from "@/components/ZegaLogo";
import {
  validateEmail,
  validatePassword,
  validateDomain,
  validateFullName,
  validateTxHash,
} from "@/lib/validation";
import { FormField } from "@/components/ui/FormField";

interface UnifiedPaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: "free" | "starter" | "growth" | "pro";
  initialPlan?: "free" | "starter" | "growth" | "pro";
  domainNameToRegister?: string;
  clientEmail?: string;
  clientName?: string;
  onPaymentSuccess?: (newPlan: string) => void;
}

export function UnifiedPaymentCheckoutModal({
  isOpen,
  onClose,
  defaultPlan = "growth",
  initialPlan,
  domainNameToRegister,
  clientEmail,
  clientName,
  onPaymentSuccess,
}: UnifiedPaymentCheckoutModalProps) {
  const router = useRouter();
  const { currency, setCurrency, isAfrica, isNigeria } = useCurrency();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "starter" | "growth" | "pro">(initialPlan || defaultPlan);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("annually");

  // User input fields (for unauthenticated checkout or free claim)
  const [inputName, setInputName] = useState(clientName || "");
  const [inputEmail, setInputEmail] = useState(clientEmail || "");
  const [inputPassword, setInputPassword] = useState("");
  const [inputDomain, setInputDomain] = useState(domainNameToRegister || "");
  const [txHashInput, setTxHashInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Field touched states for validation feedback
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedDomain, setTouchedDomain] = useState(false);
  const [touchedName, setTouchedName] = useState(false);
  const [touchedTxHash, setTouchedTxHash] = useState(false);

  // Real-time validations
  const emailVal = validateEmail(inputEmail, "Work Email");
  const passVal = validatePassword(inputPassword, 8);
  const domainVal = inputDomain.trim() ? validateDomain(inputDomain) : { isValid: true, value: "" };
  const nameVal = inputName.trim() ? validateFullName(inputName, "Name") : { isValid: true, value: "" };
  const txVal = validateTxHash(txHashInput);

  // Payment Gateway Tab: paystack | flutterwave | stripe | crypto
  const [gateway, setGateway] = useState<"paystack" | "flutterwave" | "stripe" | "crypto">(
    isNigeria ? "paystack" : isAfrica ? "flutterwave" : "stripe"
  );

  const [cryptoAsset, setCryptoAsset] = useState<"usdt_trc20" | "btc" | "eth" | "sol">("usdt_trc20");
  const [step, setStep] = useState<"select" | "pay" | "confirmed">("select");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check auth session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        setIsLoadingAuth(true);
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setIsAuthenticated(true);
          if (!inputEmail) setInputEmail(data.user.email);
          if (!inputName) setInputName(data.user.name);
          if (!inputDomain && data.domain?.domainName) setInputDomain(data.domain.domainName);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    }

    if (isOpen) {
      if (initialPlan) setSelectedPlan(initialPlan);
      if (domainNameToRegister) setInputDomain(domainNameToRegister);
      checkSession();
    }
  }, [isOpen, initialPlan, domainNameToRegister]);

  if (!isOpen) return null;

  const isFreePlan = selectedPlan === "free";
  const currentPricing = formatPlanPrice(selectedPlan, currency, billingCycle === "annually");
  const isAnnual = billingCycle === "annually";

  const cryptoDepositAddresses = {
    usdt_trc20: {
      network: "TRON (TRC-20)",
      address: "TZeGaC1oudMailUSDT2026PaymentNodeAddrX9",
    },
    btc: {
      network: "Bitcoin Native SegWit (Bech32)",
      address: "bc1qzegacloudmailnode2026btcpaycluster9",
    },
    eth: {
      network: "Ethereum (ERC-20)",
      address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    },
    sol: {
      network: "Solana (SPL)",
      address: "ZegaMailClusterPaySolanaNode111111111111",
    },
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Submit Order Initiation / Free Plan Activation
  const handleInitiateOrder = async () => {
    setErrorMessage("");

    if (!isAuthenticated) {
      setTouchedEmail(true);
      setTouchedPassword(true);
      if (inputDomain.trim()) setTouchedDomain(true);
      if (inputName.trim()) setTouchedName(true);

      const emailCheck = validateEmail(inputEmail, "Work Email");
      if (!emailCheck.isValid) {
        setErrorMessage(emailCheck.error || "Please enter a valid work email address.");
        return;
      }

      const passCheck = validatePassword(inputPassword, 8);
      if (!passCheck.isValid) {
        setErrorMessage(passCheck.error || "Master password must be at least 8 characters long.");
        return;
      }

      if (inputDomain.trim()) {
        const domCheck = validateDomain(inputDomain);
        if (!domCheck.isValid) {
          setErrorMessage(domCheck.error || "Please enter a valid domain name (e.g. yourcompany.com).");
          return;
        }
      }

      if (inputName.trim()) {
        const nameCheck = validateFullName(inputName, "Full Name");
        if (!nameCheck.isValid) {
          setErrorMessage(nameCheck.error || "Please enter a valid name.");
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const emailCheck = validateEmail(inputEmail);
      const cleanEmail = emailCheck.isValid ? emailCheck.value : inputEmail.trim().toLowerCase();
      const cleanDomain = inputDomain.trim() ? validateDomain(inputDomain).value : undefined;

      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle,
          gateway: isFreePlan ? "free_tier" : gateway,
          currency,
          clientEmail: cleanEmail,
          clientName: inputName.trim() || cleanEmail.split("@")[0],
          password: inputPassword || undefined,
          domainName: cleanDomain,
          domainNameToRegister: cleanDomain || domainNameToRegister || undefined,
          cryptoAsset: gateway === "crypto" ? cryptoAsset : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderData(data);

        // If Free Plan or direct redirect returned
        if (data.isFreePlan || data.redirectUrl) {
          if (onPaymentSuccess) onPaymentSuccess(selectedPlan);
          window.location.href = data.redirectUrl || "/app?welcome=activated";
          return;
        }

        // Paid crypto checkout moves to payment screen
        setStep("pay");
      } else {
        setErrorMessage(data.error || "Unable to initialize order. Please check your details.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Crypto Transaction
  const handleConfirmCryptoPayment = async () => {
    setTouchedTxHash(true);
    const txCheck = validateTxHash(txHashInput);

    if (!txCheck.isValid) {
      setErrorMessage(txCheck.error || "Please enter a valid transaction hash or TXID.");
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
          txHash: txCheck.value,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep("confirmed");
        if (onPaymentSuccess) onPaymentSuccess(selectedPlan);
        setTimeout(() => {
          window.location.href = "/app?payment=crypto_confirmed";
        }, 1200);
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
            <ZegaLogo variant="icon" imgClassName="h-8.5 w-auto" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isFreePlan
                  ? "Claim 2 Free Mailboxes (Forever Free)"
                  : domainNameToRegister
                  ? `Register ${domainNameToRegister} & Hosting`
                  : step === "select"
                  ? "Configure Your Business Email"
                  : step === "pay"
                  ? "Complete Payment"
                  : "Subscription Activated!"}
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

          {/* STEP 1: CONFIGURATION & SELECTION */}
          {step === "select" && (
            <div className="space-y-6">
              {/* PLAN SELECTOR TABS */}
              <div className="grid grid-cols-4 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                {(["free", "starter", "growth", "pro"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPlan(p)}
                    className={`py-2 rounded-lg capitalize transition-all ${
                      selectedPlan === p
                        ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {p === "free" ? "Free Forever" : p}
                  </button>
                ))}
              </div>

              {/* ACCOUNT & DOMAIN SETUP (If user is not logged in) */}
              {!isAuthenticated && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-blue-600" />
                      <span>Account & Webmail Credentials</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Instant Session Access</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      id="inputName"
                      label="Full Name / Business Name"
                      error={touchedName && !nameVal.isValid ? nameVal.error : null}
                      isValid={touchedName && nameVal.isValid && !!inputName.trim()}
                      helperText={!touchedName ? "e.g. Alex Carter" : undefined}
                    >
                      <input
                        id="inputName"
                        type="text"
                        value={inputName}
                        onChange={(e) => {
                          setInputName(e.target.value);
                          if (!touchedName) setTouchedName(true);
                        }}
                        onBlur={() => setTouchedName(true)}
                        placeholder="Alex Carter"
                        className={`w-full rounded-xl border px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 transition-colors ${
                          touchedName && !nameVal.isValid
                            ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500"
                            : touchedName && nameVal.isValid && inputName.trim()
                            ? "border-emerald-500/70 bg-emerald-50/10 focus:ring-emerald-500"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161a25] focus:ring-blue-500"
                        }`}
                      />
                    </FormField>

                    <FormField
                      id="inputEmail"
                      label="Work / Contact Email"
                      required
                      error={touchedEmail && !emailVal.isValid ? emailVal.error : null}
                      isValid={touchedEmail && emailVal.isValid}
                      helperText={!touchedEmail ? "Direct mailbox activation recipient" : undefined}
                    >
                      <input
                        id="inputEmail"
                        type="email"
                        required
                        value={inputEmail}
                        onChange={(e) => {
                          setInputEmail(e.target.value);
                          if (!touchedEmail) setTouchedEmail(true);
                        }}
                        onBlur={() => setTouchedEmail(true)}
                        placeholder="you@company.com"
                        className={`w-full rounded-xl border px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 transition-colors font-mono ${
                          touchedEmail && !emailVal.isValid
                            ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500"
                            : touchedEmail && emailVal.isValid
                            ? "border-emerald-500/70 bg-emerald-50/10 focus:ring-emerald-500"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161a25] focus:ring-blue-500"
                        }`}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <FormField
                      id="inputPassword"
                      label="Master Password"
                      required
                      error={touchedPassword && !passVal.isValid ? passVal.error : null}
                      isValid={touchedPassword && passVal.isValid}
                      helperText={
                        touchedPassword && passVal.isValid
                          ? `Password strength: ${passVal.strength.toUpperCase()}`
                          : "At least 8 characters"
                      }
                    >
                      <input
                        id="inputPassword"
                        type="password"
                        value={inputPassword}
                        onChange={(e) => {
                          setInputPassword(e.target.value);
                          if (!touchedPassword) setTouchedPassword(true);
                        }}
                        onBlur={() => setTouchedPassword(true)}
                        placeholder="••••••••••••"
                        className={`w-full rounded-xl border px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 transition-colors font-mono ${
                          touchedPassword && !passVal.isValid
                            ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500"
                            : touchedPassword && passVal.isValid
                            ? "border-emerald-500/70 bg-emerald-50/10 focus:ring-emerald-500"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161a25] focus:ring-blue-500"
                        }`}
                      />
                    </FormField>

                    <FormField
                      id="inputDomain"
                      label="Business Domain"
                      error={touchedDomain && !domainVal.isValid ? domainVal.error : null}
                      isValid={touchedDomain && domainVal.isValid && !!inputDomain.trim()}
                      helperText={!touchedDomain ? "e.g. acmestudio.com" : undefined}
                    >
                      <input
                        id="inputDomain"
                        type="text"
                        value={inputDomain}
                        onChange={(e) => {
                          setInputDomain(e.target.value);
                          if (!touchedDomain) setTouchedDomain(true);
                        }}
                        onBlur={() => setTouchedDomain(true)}
                        placeholder="acmestudio.com"
                        className={`w-full rounded-xl border px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 transition-colors font-mono ${
                          touchedDomain && !domainVal.isValid
                            ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500"
                            : touchedDomain && domainVal.isValid && inputDomain.trim()
                            ? "border-emerald-500/70 bg-emerald-50/10 focus:ring-emerald-500"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161a25] focus:ring-blue-500"
                        }`}
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {/* FREE PLAN SPECIFIC VIEW */}
              {isFreePlan ? (
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
                        Lifetime Free Tier
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        Domain-Linked Free Business Email
                      </h3>
                    </div>
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      {currency === "NGN" ? "₦0" : "$0"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Activate 2 full NVMe-hosted mailboxes on your custom domain with verified delivery ticks, SPF, and 2048-bit DKIM keys. Zero charges, no credit card required.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> 2 Free Mailboxes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> 2 GB NVMe Storage
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Verified Delivery Ticks
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> SSL IMAP / Webmail
                    </span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleInitiateOrder}
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 shadow-md transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Provisioning Free Mailboxes…</span>
                        </>
                      ) : (
                        <>
                          <span>Claim 2 Free Mailboxes & Launch Webmail</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* PAID PLANS VIEW (Starter, Growth, Pro) */
                <div className="space-y-6">
                  {/* Billing Cycle Switcher */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
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
                        <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold px-1 py-0.5">
                          Save 20%
                        </span>
                      </button>
                    </div>

                    {/* Currency Selector */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {(["USD", "NGN", "EUR", "GBP"] as SupportedCurrency[]).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCurrency(c)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            currency === c
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PAYMENT GATEWAY TABS */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-slate-900 dark:text-white">
                      Select Payment Gateway
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setGateway("paystack")}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          gateway === "paystack"
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500"
                            : "border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          🇳🇬 Paystack
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Bank, Cards & USSD
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGateway("flutterwave")}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          gateway === "flutterwave"
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500"
                            : "border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          🌍 Flutterwave
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Pan-Africa Mobile
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGateway("stripe")}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          gateway === "stripe"
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500"
                            : "border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                          <span>Stripe</span>
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Visa, Mastercard
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGateway("crypto")}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          gateway === "crypto"
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500"
                            : "border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Crypto</span>
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          USDT, BTC, SOL
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Crypto Asset Selector */}
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
                      onClick={handleInitiateOrder}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 shadow-md transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Initiating Checkout…</span>
                        </>
                      ) : (
                        <>
                          <span>Proceed to Payment</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CRYPTO PAYMENT VERIFICATION SCREEN */}
          {step === "pay" && orderData && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-emerald-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Send Crypto to ZegaCloud Settlement Node
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        Network: {cryptoDepositAddresses[cryptoAsset]?.network}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {orderData.cryptoDetails?.cryptoAmount || "$12.00"}{" "}
                    {cryptoAsset.toUpperCase().split("_")[0]}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Deposit Wallet Address:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={orderData.cryptoDetails?.walletAddress || cryptoDepositAddresses[cryptoAsset]?.address}
                      className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161a25] px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 select-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          orderData.cryptoDetails?.walletAddress || cryptoDepositAddresses[cryptoAsset]?.address,
                          "address"
                        )
                      }
                      className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                    >
                      {copiedField === "address" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <FormField
                    id="txHashInput"
                    label="Paste Your Transaction Hash / TXID"
                    required
                    error={touchedTxHash && !txVal.isValid ? txVal.error : null}
                    isValid={touchedTxHash && txVal.isValid}
                    helperText={!touchedTxHash ? "Transaction ID from your wallet or exchange receipt" : undefined}
                  >
                    <input
                      id="txHashInput"
                      type="text"
                      value={txHashInput}
                      onChange={(e) => {
                        setTxHashInput(e.target.value);
                        if (!touchedTxHash) setTouchedTxHash(true);
                      }}
                      onBlur={() => setTouchedTxHash(true)}
                      placeholder="e.g. 0x8f2d... or 5K7e9b..."
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:ring-2 transition-colors ${
                        touchedTxHash && !txVal.isValid
                          ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500"
                          : touchedTxHash && txVal.isValid
                          ? "border-emerald-500/70 bg-emerald-50/10 focus:ring-emerald-500"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161a25] focus:ring-blue-500"
                      }`}
                    />
                  </FormField>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmCryptoPayment}
                  disabled={txSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 shadow-md transition-all"
                >
                  {txSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Verifying On-Chain…</span>
                    </>
                  ) : (
                    <>
                      <span>Submit TX Hash & Activate Webmail</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMED */}
          {step === "confirmed" && (
            <div className="py-8 text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Payment Confirmed & Account Activated!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your business email quota has been allocated on ZegaCloud WHMCS. Redirecting to your mailbox…
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
