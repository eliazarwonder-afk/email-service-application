"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Globe,
  ArrowRight,
  Sparkles,
  Server,
  Lock,
  Mail,
  Check,
  Search,
  ExternalLink,
  RefreshCw,
  Building2,
  Users,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ZegaLogo } from "@/components/ZegaLogo";
import { useCurrency } from "@/components/CurrencyProvider";
import { UnifiedPaymentCheckoutModal } from "@/components/billing/UnifiedPaymentCheckoutModal";
import { validateDomain } from "@/lib/validation";

export default function SignupGatewayPage() {
  const router = useRouter();
  const { currency, symbol, isNigeria } = useCurrency();

  // Domain Pre-Check State
  const [domainSearchQuery, setDomainSearchQuery] = useState("");
  const [isSearchingDomain, setIsSearchingDomain] = useState(false);
  const [domainResult, setDomainResult] = useState<any>(null);
  const [searchError, setSearchError] = useState("");

  // SSO & Modal State
  const [isSsoLoading, setIsSsoLoading] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<"free" | "starter" | "growth" | "pro">("growth");
  const [targetDomainForModal, setTargetDomainForModal] = useState<string>("");

  const handleDomainSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainSearchQuery.trim()) return;

    // Sanitize domain query
    let query = domainSearchQuery.trim().toLowerCase().replace(/^[a-z]+:\/\//i, "").replace(/\/.*$/, "");
    if (!query.includes(".")) {
      query = query + ".com";
    }

    const domCheck = validateDomain(query);
    if (!domCheck.isValid) {
      setSearchError(domCheck.error || "Please enter a valid domain name (e.g. yourcompany.com).");
      return;
    }

    setIsSearchingDomain(true);
    setSearchError("");
    setDomainResult(null);

    try {
      const res = await fetch(`/api/domains/search?q=${encodeURIComponent(domCheck.value)}`);
      const data = await res.json();

      if (data.success && data.primary) {
        setDomainResult(data.primary);
      } else {
        setSearchError(data.error || "Unable to check domain availability.");
      }
    } catch (err: any) {
      setSearchError("Network error while searching domain availability.");
    } finally {
      setIsSearchingDomain(false);
    }
  };

  const handleWhmcsSSO = async () => {
    setIsSsoLoading(true);
    try {
      const res = await fetch("/api/auth/whmcs-sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "owner@zegacloud.com" }),
      });
      const data = await res.json();
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        router.push("/app");
      }
    } catch (err) {
      router.push("/app");
    } finally {
      setIsSsoLoading(false);
    }
  };

  const openCheckoutWithDomain = (plan: "free" | "starter" | "growth" | "pro", domainName?: string) => {
    setSelectedPlanForModal(plan);
    if (domainName) {
      setTargetDomainForModal(domainName);
    }
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-[#090a0f] text-[#121212] dark:text-[#f3f4f6] transition-colors selection:bg-blue-500/20">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        {/* HEADER SECTION */}
        <div className="text-center space-y-4 max-w-2xl mx-auto flex flex-col items-center">
          <ZegaLogo variant="full" className="mx-auto mb-1" />

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 px-3.5 py-1 text-xs text-blue-800 dark:text-blue-300 font-medium">
            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>ZegaCloud Secure Provisioning Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Get Your Business Email on ZegaCloud
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Like Titan Mail and Google Workspace with web hosting partners, ZegaMail business accounts, custom domains, and DNS security are provisioned through the <strong>ZegaCloud Platform</strong>.
          </p>
        </div>

        {/* DOMAIN AVAILABILITY CHECKER BAR */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151e] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Check Domain Availability on ZegaCloud</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Check whether your business name is available or connect an existing registered domain.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full self-start sm:self-auto">
              Live DNS Cluster Ready
            </span>
          </div>

          <form onSubmit={handleDomainSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={domainSearchQuery}
                onChange={(e) => setDomainSearchQuery(e.target.value)}
                placeholder="e.g. acmestudio.com or mybusiness.ng"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#161a25] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isSearchingDomain || !domainSearchQuery.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 shadow-sm transition-all shrink-0"
            >
              {isSearchingDomain ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Checking availability…</span>
                </>
              ) : (
                <>
                  <span>Search Domain</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Search Result Feedback */}
          {searchError && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 p-3 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {domainResult && (
            <div
              className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                domainResult.status === "available"
                  ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/40"
                  : "border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/40"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {domainResult.domain}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      domainResult.status === "available"
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-600 text-white"
                    }`}
                  >
                    {domainResult.status === "available" ? "Available" : "Registered"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {domainResult.status === "available" ? (
                    <>
                      Standard registration:{" "}
                      <strong className="text-slate-900 dark:text-white">
                        {isNigeria
                          ? `₦${domainResult.priceAnnualNgn?.toLocaleString() || "17,500"}`
                          : `$${domainResult.priceAnnualUsd || "12.00"}`}
                        /year
                      </strong>{" "}
                      with free 2048-bit DKIM & DNS zone pre-setup.
                    </>
                  ) : (
                    "This domain is already registered. You can still link your existing DNS to ZegaMail!"
                  )}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {domainResult.status === "available" ? (
                  <button
                    type="button"
                    onClick={() => openCheckoutWithDomain("growth", domainResult.domain)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>Order on ZegaCloud</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openCheckoutWithDomain("starter", domainResult.domain)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>Connect Domain to ZegaMail</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3 GATEWAY PATHWAYS (TITAN / WHMCS MODEL) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PATHWAY 1: New Business Email Plan */}
          <div className="rounded-2xl border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-[#12151e] p-6 flex flex-col justify-between shadow-lg relative">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Sparkles className="h-5 w-5" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Recommended For Businesses
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Order on ZegaCloud
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Select your flat-rate email plan. Get up to 30 mailboxes, high-speed NVMe storage, and automated DNS routing from <strong>₦1,500/mo</strong> or <strong>$3.90/mo</strong> flat.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>No per-user monthly penalties</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Pay with Paystack, Stripe or Crypto</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Instant quota provisioning</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/pricing"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 shadow-sm transition-all"
              >
                <span>View Plans & Checkout</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* PATHWAY 2: ZegaCloud Client SSO */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151e] p-6 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Existing ZegaCloud Client
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  1-Click ZegaCloud SSO
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Already have hosting, domains, or an active account in the ZegaCloud Client Area? Access webmail directly with cryptographic HMAC-SHA256 Single Sign-On.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>No separate password required</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Synchronized with active services</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Instant admin organization access</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={handleWhmcsSSO}
                disabled={isSsoLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-semibold text-xs py-2.5 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-all shadow-xs"
              >
                {isSsoLoading ? (
                  <span>Authenticating SSO…</span>
                ) : (
                  <>
                    <span>Sign In via ZegaCloud SSO</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PATHWAY 3: Mailbox Login (Team Members) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151e] p-6 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Users className="h-5 w-5" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Employees & Staff
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Mailbox User Sign In
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  If your administrator or IT department has already assigned you a business email address (e.g. <code>you@company.com</code>), log in directly to your webmail mailbox.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span>Access emails, contacts & AI Studio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span>Works on mobile web and desktop</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span>Supports IMAP for Apple Mail & Outlook</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs"
              >
                <span>Sign In to Mailbox</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS / FAQ ACCORDION SUMMARY */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151e] p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Why is registration handled via ZegaCloud?</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-white">
                1. Dedicated DNS & Reputation Protection
              </p>
              <p>
                Unlike consumer webmail services where anyone can register disposable spam addresses, ZegaMail provisions dedicated 2048-bit DKIM keys, SPF records, and DMARC policies on our Anycast cloud cluster for your verified company domain.
              </p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-white">
                2. Unified Billing & Centralized Team Seats
              </p>
              <p>
                Business administrators manage their invoices, team quotas, renewals, and payment methods (Paystack, Stripe, Crypto) in one unified ZegaCloud dashboard without juggling multiple disjointed logins.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Unified Payment Checkout Modal */}
      <UnifiedPaymentCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        initialPlan={selectedPlanForModal}
        domainNameToRegister={targetDomainForModal || undefined}
        onPaymentSuccess={() => {
          setIsCheckoutModalOpen(false);
          router.push("/app?onboarding=complete");
        }}
      />
    </div>
  );
}
