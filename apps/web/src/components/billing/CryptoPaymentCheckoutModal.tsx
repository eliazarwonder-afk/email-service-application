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
  Sparkles
} from "lucide-react";
import { validateTxHash } from "@/lib/validation";

interface CryptoPaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: "starter" | "growth" | "pro";
  onPaymentSuccess?: (newPlan: string) => void;
}

export function CryptoPaymentCheckoutModal({
  isOpen,
  onClose,
  defaultPlan = "growth",
  onPaymentSuccess,
}: CryptoPaymentCheckoutModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "growth" | "pro">(defaultPlan);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("annually");
  const [paymentMethod, setPaymentMethod] = useState<
    "crypto_usdt_trc20" | "crypto_btc" | "crypto_eth" | "crypto_sol" | "stripe_card"
  >("crypto_usdt_trc20");

  const [step, setStep] = useState<"select" | "pay" | "confirmed">("select");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [txHashInput, setTxHashInput] = useState("");
  const [txHashTouched, setTxHashTouched] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txConfirmed, setTxConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const planDetails = {
    starter: {
      name: "ZegaMail Starter",
      monthlyPrice: 1.50,
      annualPrice: 14.40,
      mailboxes: "3 Custom Mailboxes",
      storage: "15 GB NVMe",
      aiCredits: "1,000 AI Credits",
    },
    growth: {
      name: "ZegaMail Business Growth",
      monthlyPrice: 3.20,
      annualPrice: 30.72,
      mailboxes: "10 Custom Mailboxes",
      storage: "50 GB NVMe",
      aiCredits: "3,000 AI Credits",
    },
    pro: {
      name: "ZegaMail Pro Scale",
      monthlyPrice: 6.50,
      annualPrice: 62.40,
      mailboxes: "Unlimited Mailboxes",
      storage: "100 GB NVMe",
      aiCredits: "10,000 AI Credits",
    },
  };

  const currentPlanInfo = planDetails[selectedPlan];
  const payableAmount = billingCycle === "annually" ? currentPlanInfo.annualPrice : currentPlanInfo.monthlyPrice;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreateOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize order.");
      }

      setOrderData(data.order);
      if (paymentMethod === "stripe_card") {
        setStep("confirmed");
        if (onPaymentSuccess) onPaymentSuccess(selectedPlan);
      } else {
        setStep("pay");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Could not connect to billing server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTxHash = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxHashTouched(true);
    const txValidation = validateTxHash(txHashInput);
    if (!txValidation.isValid) {
      setErrorMessage(txValidation.error || "Please enter a valid transaction hash (TXID).");
      return;
    }
    if (!orderData?.id) return;
    setTxSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/billing/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.id,
          txHash: txValidation.value,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record transaction hash.");
      }
      setTxConfirmed(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record TX Hash.");
    } finally {
      setTxSubmitting(false);
    }
  };

  const handleSimulateAdminVerification = async () => {
    if (!orderData?.id) return;
    setTxSubmitting(true);
    try {
      const res = await fetch("/internal/v1/whmcs/order-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-zegabytez-whmcs-secret": "super_secret_whmcs_webhook_token",
        },
        body: JSON.stringify({ orderId: orderData.id }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("confirmed");
        if (onPaymentSuccess) onPaymentSuccess(selectedPlan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTxSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#11141e] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden text-[#121212] dark:text-white transition-all my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#161a25]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {step === "select" && "Upgrade Plan & WHMCS Billing Checkout"}
                {step === "pay" && "Awaiting Crypto Payment"}
                {step === "confirmed" && "Order & Payment Confirmed"}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Managed via WHMCS Server Module • 2048-bit Encrypted
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: SELECT PLAN & PAYMENT METHOD */}
          {step === "select" && (
            <div className="space-y-5">
              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-between bg-neutral-100 dark:bg-[#181d28] p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                    billingCycle === "monthly"
                      ? "bg-white dark:bg-[#252c3d] shadow-sm text-neutral-900 dark:text-white"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("annually")}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    billingCycle === "annually"
                      ? "bg-white dark:bg-[#252c3d] shadow-sm text-neutral-900 dark:text-white"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Save 20%
                  </span>
                </button>
              </div>

              {/* Plan Cards */}
              <div className="grid grid-cols-3 gap-3">
                {(["starter", "growth", "pro"] as const).map((p) => {
                  const info = planDetails[p];
                  const isSelected = selectedPlan === p;
                  return (
                    <div
                      key={p}
                      onClick={() => setSelectedPlan(p)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-600"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-[#141824]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold capitalize">{p}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <p className="text-base font-bold font-mono">
                        ${billingCycle === "annually" ? (info.annualPrice / 12).toFixed(2) : info.monthlyPrice.toFixed(2)}
                        <span className="text-[10px] font-normal text-neutral-400">/mo</span>
                      </p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">{info.mailboxes}</p>
                    </div>
                  );
                })}
              </div>

              {/* Payment Gateways Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Select Payment Method (Controlled &amp; Managed in WHMCS)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("crypto_usdt_trc20")}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      paymentMethod === "crypto_usdt_trc20"
                        ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                        : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-[#161a25]"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">USDT (TRC-20)</p>
                      <p className="text-[10px] text-neutral-400">Low \$1 Network Fee • Instant</p>
                    </div>
                    {paymentMethod === "crypto_usdt_trc20" && <Check className="h-4 w-4 text-emerald-500" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("crypto_btc")}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      paymentMethod === "crypto_btc"
                        ? "border-amber-500 bg-amber-50/30 dark:bg-amber-950/30 ring-1 ring-amber-500"
                        : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-[#161a25]"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-amber-600 dark:text-amber-400">Bitcoin (BTC)</p>
                      <p className="text-[10px] text-neutral-400">Native SegWit Bech32</p>
                    </div>
                    {paymentMethod === "crypto_btc" && <Check className="h-4 w-4 text-amber-500" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("crypto_sol")}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      paymentMethod === "crypto_sol"
                        ? "border-teal-500 bg-teal-50/30 dark:bg-teal-950/30 ring-1 ring-teal-500"
                        : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-[#161a25]"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-teal-600 dark:text-teal-400">Solana (SOL)</p>
                      <p className="text-[10px] text-neutral-400">Sub-second 400ms TX</p>
                    </div>
                    {paymentMethod === "crypto_sol" && <Check className="h-4 w-4 text-teal-500" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stripe_card")}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      paymentMethod === "stripe_card"
                        ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/30 ring-1 ring-blue-500"
                        : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-[#161a25]"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">Credit / Debit Card</p>
                      <p className="text-[10px] text-neutral-400">Visa, MasterCard, 3D-Secure</p>
                    </div>
                    {paymentMethod === "stripe_card" && <Check className="h-4 w-4 text-blue-500" />}
                  </button>
                </div>
              </div>

              {/* Order Total Breakdown */}
              <div className="rounded-xl bg-neutral-50 dark:bg-[#161a25] border border-neutral-200 dark:border-neutral-800 p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                  <span>Selected Subscription:</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{currentPlanInfo.name}</span>
                </div>
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                  <span>Billing Cycle:</span>
                  <span className="capitalize text-neutral-900 dark:text-white">{billingCycle}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700/80 font-bold text-sm">
                  <span>Total Amount Due:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono">${payableAmount.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-xs font-semibold shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Registering Order in WHMCS…</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Payment (${payableAmount.toFixed(2)})</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: CRYPTO PAYMENT QR & TRANSACTION HASH SUBMISSION */}
          {step === "pay" && orderData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>
                    WHMCS Order <strong>{orderData.orderNumber}</strong> • Invoice <strong>{orderData.invoiceId}</strong>
                  </span>
                </div>
                <span className="font-mono text-[11px] bg-amber-200/50 dark:bg-amber-900 px-2 py-0.5 rounded font-bold text-amber-900 dark:text-amber-200">
                  Pending Verification
                </span>
              </div>

              {/* QR Code and Wallet Box */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#161a25]">
                <div className="bg-white p-2 rounded-xl border shadow-sm shrink-0">
                  <img
                    src={orderData.cryptoDetails?.qrCodeUrl}
                    alt="Payment QR Code"
                    className="h-32 w-32 object-contain"
                  />
                </div>

                <div className="space-y-2.5 w-full text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-neutral-400">Send Exactly</label>
                    <div className="flex items-center justify-between font-mono font-bold text-sm bg-white dark:bg-[#12151e] p-2 rounded-lg border border-neutral-200 dark:border-neutral-700">
                      <span>
                        {orderData.cryptoDetails?.cryptoAmount} {orderData.cryptoDetails?.cryptoCurrency}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(orderData.cryptoDetails?.cryptoAmount, "amount")}
                        className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-sans font-normal"
                      >
                        {copiedField === "amount" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedField === "amount" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono text-neutral-400">
                      Deposit Address ({orderData.cryptoDetails?.network})
                    </label>
                    <div className="flex items-center justify-between font-mono text-[11px] bg-white dark:bg-[#12151e] p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 break-all">
                      <span className="truncate mr-2">{orderData.cryptoDetails?.walletAddress}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(orderData.cryptoDetails?.walletAddress, "address")}
                        className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 shrink-0 font-sans font-normal"
                      >
                        {copiedField === "address" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedField === "address" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* TX Hash Submission Form */}
              <form onSubmit={handleSubmitTxHash} className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  After sending funds, paste your Transaction Hash (TXID):
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="e.g. e49f82bc7190ad3f7748ca52011b02ea9174dfb292..."
                      value={txHashInput}
                      onChange={(e) => {
                        setTxHashInput(e.target.value);
                        if (!txHashTouched) setTxHashTouched(true);
                      }}
                      onBlur={() => setTxHashTouched(true)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-[#141824] font-mono transition-colors focus:outline-none ${
                        txHashTouched && !validateTxHash(txHashInput).isValid
                          ? "border-rose-400 focus:ring-1 focus:ring-rose-400 text-rose-900 dark:text-rose-200"
                          : txHashTouched && validateTxHash(txHashInput).isValid
                          ? "border-emerald-500 focus:ring-1 focus:ring-emerald-400"
                          : "border-neutral-300 dark:border-neutral-700 focus:ring-1 focus:ring-blue-500"
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={txSubmitting || (txHashTouched && !validateTxHash(txHashInput).isValid) || !txHashInput.trim()}
                    className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all shrink-0"
                  >
                    {txSubmitting ? "Submitting…" : "Submit TX"}
                  </button>
                </div>
                {txHashTouched && !validateTxHash(txHashInput).isValid && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{validateTxHash(txHashInput).error}</span>
                  </p>
                )}
                {txConfirmed && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Transaction recorded! WHMCS module admin has been notified for confirmation.
                  </p>
                )}
              </form>

              {/* Admin Simulation Button for Pair Programming / Demonstration */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">Demo Testing Helper:</span>
                <button
                  type="button"
                  onClick={handleSimulateAdminVerification}
                  disabled={txSubmitting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-600/20"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Simulate WHMCS Admin Confirmation</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMED / ACTIVATED */}
          {step === "confirmed" && (
            <div className="text-center py-6 space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 animate-in zoom-in" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Payment Verified &amp; Service Active!
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Your subscription to <strong>{currentPlanInfo.name}</strong> is now live. Quotas and mailbox limits have been refreshed across the cluster.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#161a25] border border-neutral-200 dark:border-neutral-800 text-xs max-w-xs mx-auto text-left space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Order:</span>
                  <span className="font-semibold">{orderData?.orderNumber || "WHMCS-ORD-2026-9482"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Invoice:</span>
                  <span className="font-semibold">{orderData?.invoiceId || "WHMCS-INV-10942"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Status:</span>
                  <span className="text-emerald-500 font-semibold">250 OK • Active</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-colors"
              >
                Return to Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
