"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  HelpCircle,
  X,
  CreditCard,
  Zap,
  Building,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Layers,
  ChevronDown
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCurrency } from "@/components/CurrencyProvider";
import { formatPlanPrice, SupportedCurrency, CURRENCY_SYMBOLS } from "@/lib/geo";
import {
  AnimatedShield,
  AnimatedMail,
  AnimatedServer,
  AnimatedGlobe,
  AnimatedCheckCheck,
  AnimatedCreditCard,
} from "@/components/ui/AnimatedIcon";

export default function PricingPage() {
  const { currency, setCurrency, symbol, isAfrica, isNigeria } = useCurrency();
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");

  // Calculated Pricing Tiers based on selected currency and billing cycle
  const starterPrice = formatPlanPrice("starter", currency, billingCycle === "annual");
  const growthPrice = formatPlanPrice("growth", currency, billingCycle === "annual");
  const proPrice = formatPlanPrice("pro", currency, billingCycle === "annual");

  const getWhmcsPlanUrl = (plan: "starter" | "growth" | "pro") => {
    const pids = { starter: 1, growth: 2, pro: 3 };
    const cycle = billingCycle === "annual" ? "annually" : "monthly";
    return `https://billing.zegacloud.com/cart.php?a=add&pid=${pids[plan]}&billingcycle=${cycle}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-[#090a0f] text-[#121212] dark:text-[#f3f4f6] transition-colors selection:bg-blue-500/20">
      <Navbar />

      <main className="flex-1 py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* HEADER SECTION */}
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151e] px-4 py-1.5 text-xs text-slate-600 dark:text-slate-400 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-900 dark:text-white">Predictable Flat-Rate Email</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">Zero Per-Seat Taxes</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Enterprise Business Email. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Without the Monopoly Tax.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Google Workspace and Microsoft charge <strong className="text-slate-900 dark:text-white">\$7 to \$12 per user every month</strong>. 
            ZegaMail gives your entire team private, NVMe-hosted mailboxes, verified delivery status ticks, and outreach tools at one flat rate.
          </p>

          {/* CURRENCY & BILLING CYCLE TOGGLE CONTROLS */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Currency Selector Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151e] shadow-xs">
              {(["USD", "NGN", "EUR", "GBP"] as SupportedCurrency[]).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrency(cur)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currency === cur
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {CURRENCY_SYMBOLS[cur]} {cur}
                </button>
              ))}
            </div>

            {/* Annual vs Monthly Toggle */}
            <div className="flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151e] shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  billingCycle === "annual"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Geo-Detection Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <AnimatedGlobe size={16} />
            <span>
              {isNigeria
                ? "Auto-detected location: Nigeria. Instant Paystack & Flutterwave checkout enabled."
                : isAfrica
                ? "Auto-detected location: Africa. Local Mobile Money & Card payment active."
                : "Auto-detected location: Global. Instant Stripe Card & Crypto payments active."}
            </span>
          </div>

          {/* NIGERIA & GLOBAL LAUNCH PROMO BANNER */}
          <div className="rounded-2xl border border-rose-300 dark:border-rose-900 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-rose-950/50 dark:via-amber-950/40 dark:to-orange-950/50 p-4 text-center shadow-xs">
            <div className="inline-flex items-center gap-2 text-rose-700 dark:text-rose-400 font-extrabold text-xs uppercase tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-rose-600" />
              <span>🔥 Limited-Time Launch Promo — Drastically Reduced Flat-Rate Tiers (Up to 77% OFF)</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-2xl mx-auto">
              Get dedicated business email for your entire team starting at just <strong className="text-slate-900 dark:text-white font-mono">{starterPrice.formatted}/mo</strong> total. No per-seat penalties.
            </p>
          </div>
        </section>

        {/* 4 CORE PRICING CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CARD 1: Domain-Linked Free Tier */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151e] p-6 flex flex-col justify-between space-y-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Domain Owners
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Free Forever</span>
                  <AnimatedMail size={22} />
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Included free with any active domain registered or hosted on ZegaCloud.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {symbol}0
                  </span>
                  <span className="text-xs text-slate-500 font-sans">/month</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Lifetime free with your domain.
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2 font-medium text-slate-900 dark:text-white">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>2 Free Mailboxes</strong> (e.g., info@, support@)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>2 GB Pooled Storage</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Verified Delivery Ticks (Sent ✓)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Webmail & SSL IMAP/POP3</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>SpamAssassin & Virus Shield</span>
                </div>
              </div>
            </div>

            <Link
              href="/signup?plan=free"
              className="w-full text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors block"
            >
              Claim Free Mailboxes
            </Link>
          </div>

          {/* CARD 2: Starter Plan */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151e] p-6 flex flex-col justify-between space-y-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Solo Founders & Creators
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Starter</span>
                  <AnimatedShield size={22} />
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Bring your existing domain or buy a new one. Full business email suite.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {starterPrice.formatted}
                  </span>
                  <span className="text-sm line-through text-slate-400 font-sans">
                    {starterPrice.regularFormatted}
                  </span>
                  <span className="text-xs text-slate-500 font-sans">/mo flat</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.5">
                    Save {starterPrice.discountPercent}%
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                    ({starterPrice.perMailboxFormatted})
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {billingCycle === "annual" ? "Billed annually (Launch Promo)" : "Billed monthly"}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2 font-medium text-slate-900 dark:text-white">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Up to 10 Mailboxes</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>25 GB Fast NVMe Storage Pool</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>1 Custom Domain Connection</span>
                </div>
                <div className="flex items-start gap-2 font-medium text-blue-700 dark:text-blue-300">
                  <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Sent ✓ & Delivered ✓✓ Ticks</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>500 Outbound Template Drafts/mo</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Apple Mail & Outlook IMAP/SMTP</span>
                </div>
              </div>
            </div>

            <a
              href={getWhmcsPlanUrl("starter")}
              className="w-full text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs block"
            >
              Get Starter
            </a>
          </div>

          {/* CARD 3: Business Growth (Featured / Google Killer) */}
          <div className="relative rounded-2xl border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-[#151924] p-6 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 text-white px-3.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Most Popular</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  The Google Workspace Killer
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Growth</span>
                  <AnimatedServer size={22} />
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  For growing agencies, creative studios, and multi-team businesses.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {growthPrice.formatted}
                  </span>
                  <span className="text-sm line-through text-slate-400 font-sans">
                    {growthPrice.regularFormatted}
                  </span>
                  <span className="text-xs text-slate-500 font-sans">/mo flat</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.5">
                    Save {growthPrice.discountPercent}%
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                    ({growthPrice.perMailboxFormatted})
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  Saves \$600+ (₦1,000,000+) vs Google Workspace.
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2 font-medium text-slate-900 dark:text-white">
                  <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Up to 30 Mailboxes</strong></span>
                </div>
                <div className="flex items-start gap-2 font-medium text-slate-900 dark:text-white">
                  <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>75 GB</strong> High-Speed NVMe Pool</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>5 Custom Domains Setup</span>
                </div>
                <div className="flex items-start gap-2 text-blue-900 dark:text-blue-200 bg-blue-50/70 dark:bg-blue-950/40 p-2 rounded-lg font-medium">
                  <AnimatedCheckCheck size={16} />
                  <span>Verified 250 OK Server Delivery Status</span>
                </div>
                <div className="flex items-start gap-2 text-indigo-900 dark:text-indigo-200 bg-indigo-50/70 dark:bg-indigo-950/40 p-2 rounded-lg font-medium">
                  <FileText className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>3,000 Outreach & Proposal Drafts/mo</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Outreach Campaigns Engine (1,500 leads/mo)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>1-Click Automated DNS Telemetry (SPF, DKIM, DMARC)</span>
                </div>
              </div>
            </div>

            <a
              href={getWhmcsPlanUrl("growth")}
              className="w-full text-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Get Growth Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* CARD 4: Enterprise Pro */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151e] p-6 flex flex-col justify-between space-y-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Scale & High Volume
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Enterprise Pro</span>
                  <AnimatedCreditCard size={22} />
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  For large agencies, corporate fleets, and high-volume outreach teams.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {proPrice.formatted}
                  </span>
                  <span className="text-sm line-through text-slate-400 font-sans">
                    {proPrice.regularFormatted}
                  </span>
                  <span className="text-xs text-slate-500 font-sans">/mo flat</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.5">
                    Save {proPrice.discountPercent}%
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium font-sans">
                    Unlimited Mailboxes
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {billingCycle === "annual" ? "Billed annually (Launch Promo)" : "Billed monthly"}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2 font-medium text-slate-900 dark:text-white">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Unlimited Mailboxes</strong></span>
                </div>
                <div className="flex items-start gap-2 font-medium text-slate-900 dark:text-white">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>200 GB</strong> High-Speed NVMe Storage</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Unlimited Custom Domains</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Dedicated IP Reputation & Warmup Shield</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>10,000 Outreach Template Dispatches/mo</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>1-Click ZegaCloud Client Area SSO</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Priority 24/7 SLA Phone & Ticket Support</span>
                </div>
              </div>
            </div>

            <a
              href={getWhmcsPlanUrl("pro")}
              className="w-full text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs block"
            >
              Get Enterprise Pro
            </a>
          </div>
        </section>

        {/* COMPARISON TABLE: ZEGA MAIL VS GOOGLE WORKSPACE */}
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151e] p-8 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Transparent Feature Comparison
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Why thousands of businesses are leaving per-seat SaaS platforms.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Feature & Capability</th>
                  <th className="py-3 px-4 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/20 rounded-t-lg">
                    ZegaMail Flat-Rate
                  </th>
                  <th className="py-3 px-4">Google Workspace</th>
                  <th className="py-3 px-4">Microsoft 365</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    Cost for 10 Mailboxes
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 bg-blue-50/50 dark:bg-blue-950/20">
                    {currency === "NGN" ? "₦1,500/mo flat (Promo)" : "$1.99/mo flat (Promo)"}
                  </td>
                  <td className="py-3.5 px-4 text-red-600 dark:text-red-400 font-mono">
                    {currency === "NGN" ? "₦110,000/mo ($7.20/user)" : "$72.00/mo ($7.20/user)"}
                  </td>
                  <td className="py-3.5 px-4 text-red-600 dark:text-red-400 font-mono">
                    {currency === "NGN" ? "₦90,000/mo ($6.00/user)" : "$60.00/mo ($6.00/user)"}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    Verified Delivery Status Ticks
                  </td>
                  <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-950/20">
                    Sent ✓ & Delivered ✓✓ (RFC 3461)
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">None (Requires invasive 3rd-party plugins)</td>
                  <td className="py-3.5 px-4 text-slate-400">None without manual read receipts</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    Cold Outreach & Contact Lists Engine
                  </td>
                  <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-950/20">
                    Built-in (Multi-step Sequences)
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">Requires Lemlist / Instantly (+\$59/mo)</td>
                  <td className="py-3.5 px-4 text-slate-400">Not supported natively</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    Data Privacy & Ad Profiling
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-medium bg-blue-50/50 dark:bg-blue-950/20">
                    100% Zero-Ad Policy (Private NVMe)
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">Data ingested for Google ecosystem profiles</td>
                  <td className="py-3.5 px-4 text-slate-400">Telemetry tracked across MS Graph</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    Global & African Payment Gateways
                  </td>
                  <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-950/20">
                    Paystack, Flutterwave, Stripe, Crypto
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">Only US Dollar cards (Fails in Africa)</td>
                  <td className="py-3.5 px-4 text-slate-400">US Dollar Credit Cards Only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Clear answers regarding domains, setup, billing, and mailbox migrations.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Can I bring my own domain name?",
                a: "Yes. You can connect any domain from GoDaddy, Namecheap, Cloudflare, NameSilo, or your preferred registrar. We provide one-click DNS records (MX, SPF, 2048-bit DKIM, and DMARC) that set up in under 2 minutes.",
              },
              {
                q: "How does the flat-rate pricing work?",
                a: "Instead of paying $7.20 for every new employee, intern, or contractor, ZegaMail charges one fixed rate for your business. For example, on the Growth plan, you can create up to 30 mailboxes for just $12/month (or ₦18,000/month) total.",
              },
              {
                q: "Which payment methods are accepted?",
                a: "We support Paystack for Nigerian bank accounts and cards, Flutterwave for Pan-African mobile money and cards, Stripe for global credit and debit cards, and automated Crypto settlement (USDT TRC-20, BTC, ETH, and SOL).",
              },
              {
                q: "What are Verified Delivery Status Ticks?",
                a: "Unlike email trackers that insert invisible spying images (which spam filters often block), ZegaMail queries the receiving mail server using RFC 3461 SMTP acknowledgement. You receive a checkmark (Sent ✓) and a double checkmark (Delivered ✓✓) when the remote server returns 250 OK.",
              },
              {
                q: "Does ZegaMail work with Apple Mail, Outlook, and mobile apps?",
                a: "Yes. Every mailbox includes full IMAP, POP3, and SMTP support with TLS 1.3 encryption. You can connect iPhone Mail, Android, Thunderbird, and Outlook seamlessly.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12151e] p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold text-sm text-slate-900 dark:text-white">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade Your Business Email?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Join thousands of businesses saving over 80% on email costs with enterprise deliverability and 100% privacy.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={getWhmcsPlanUrl("growth")}
              className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-lg inline-block"
            >
              Start 14-Day Free Growth Trial
            </a>
            <Link
              href="/app"
              className="px-6 py-3 rounded-xl border border-white/30 text-white font-semibold text-xs hover:bg-white/10 transition-colors"
            >
              Explore Interactive Demo
            </Link>
          </div>
        </section>
      </main>

      <Footer />


    </div>
  );
}
