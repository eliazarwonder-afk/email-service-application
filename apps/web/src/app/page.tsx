"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Check,
  ArrowRight,
  Eye,
  Zap,
  Globe,
  Lock,
  Mail,
  ChevronDown,
  Smartphone,
  ExternalLink,
  Sliders,
  Server,
  DollarSign,
  TrendingDown,
  Coins,
  CreditCard,
  Building,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { getWhmcsCartUrl } from "@/lib/config";
import { Footer } from "@/components/Footer";
import { HeroDashboardPreview } from "@/components/HeroDashboardPreview";
import { ClientSetupModal } from "@/components/ClientSetupModal";
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

export default function HomePage() {
  const { currency, setCurrency, symbol, isAfrica, isNigeria } = useCurrency();
  const [calculatorUsers, setCalculatorUsers] = useState<number>(6);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Billing cycle
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");

  const getWhmcsPlanUrl = (plan: "free" | "starter" | "growth" | "pro") => {
    const pids: Record<string, number> = {
      free: parseInt(process.env.NEXT_PUBLIC_WHMCS_FREE_PID || "1", 10),
      starter: 1,
      growth: 2,
      pro: 3,
    };
    const cycle = plan === "free" ? "free" : (billingCycle === "annual" ? "annually" : "monthly");
    const cartUrl = getWhmcsCartUrl({ pid: pids[plan], billingcycle: cycle });
    return cartUrl !== "#" ? cartUrl : `/signup?plan=${plan}&cycle=${cycle}`;
  };

  // Calculated pricing tiers
  const freePrice = formatPlanPrice("free", currency, billingCycle === "annual");
  const starterPrice = formatPlanPrice("starter", currency, billingCycle === "annual");
  const growthPrice = formatPlanPrice("growth", currency, billingCycle === "annual");
  const proPrice = formatPlanPrice("pro", currency, billingCycle === "annual");

  // Accurate Geo & Currency Savings Calculation
  const isAnnual = billingCycle === "annual";
  const googleMonthlyRate =
    currency === "NGN" ? 10800 : currency === "EUR" ? 6.60 : currency === "GBP" ? 5.60 : 7.20;
  const totalGoogleCost = Math.round(calculatorUsers * googleMonthlyRate * 12);

  // Scaled Flat-rate ZegaMail Cost
  const zegaAnnualRate =
    calculatorUsers <= 2
      ? 0
      : calculatorUsers <= 10
      ? (currency === "NGN" ? (isAnnual ? 18000 : 22800) : currency === "EUR" ? (isAnnual ? 21.90 : 27.60) : currency === "GBP" ? (isAnnual ? 18.60 : 23.40) : (isAnnual ? 23.88 : 30.00))
      : calculatorUsers <= 30
      ? (currency === "NGN" ? (isAnnual ? 54000 : 66000) : currency === "EUR" ? (isAnnual ? 55.10 : 66.20) : currency === "GBP" ? (isAnnual ? 46.70 : 56.10) : (isAnnual ? 59.88 : 72.00))
      : (currency === "NGN" ? (isAnnual ? 150000 : 180000) : currency === "EUR" ? (isAnnual ? 143.40 : 165.60) : currency === "GBP" ? (isAnnual ? 121.50 : 140.40) : (isAnnual ? 155.88 : 180.00));

  const totalAnnualSavings = Math.max(0, Math.round(totalGoogleCost - zegaAnnualRate));

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans selection:bg-blue-600/20 selection:text-blue-700">
      <Navbar />

      <main className="flex-1">
        {/* Subtle Announcement Banner */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 py-2.5 px-4 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium inline-flex items-center gap-2 flex-wrap justify-center">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              New Release
            </span>
            <span>Enterprise High-Performance Mail Infrastructure with Verified Delivery Status Ticks.</span>
            <Link
              href="/pricing"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              See Plans <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>

        {/* HERO SECTION: Clean, Authoritative, High-Converting */}
        <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-100/60 via-slate-50/20 to-transparent dark:from-blue-900/15 dark:via-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Category Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Dedicated Business Email Infrastructure</span>
              <span className="text-slate-400">•</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">100% Ad-Free</span>
            </div>

            {/* Clear, High-Impact Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Professional business email for your custom domain.
            </h1>

            {/* Benefit-Focused Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Set up <strong className="text-slate-800 dark:text-slate-200">you@company.com</strong> with guaranteed inbox delivery, verified delivery ticks (Sent ✓ and Delivered ✓✓), and zero tracking ads. Stop paying Google Workspace \$7/month for every single user.
            </p>

            {/* Clear Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/signup?plan=free"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <span>Claim 2 Free Mailboxes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Try Live Webmail Demo</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 font-bold" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 font-bold" />
                2 Free mailboxes included forever
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 font-bold" />
                Works with Apple Mail & Outlook
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 font-bold" />
                100% Private (No data scraping)
              </span>
            </div>
          </div>

          {/* Interactive Webmail Interface Preview */}
          <HeroDashboardPreview />
        </section>

        {/* LOGO & CLIENT TRUST SECTION */}
        <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 py-10 px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
            Compatible with all standard email clients & protocols
          </p>
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 md:gap-14 text-slate-600 dark:text-slate-400 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" /> Apple Mail (iOS / Mac)
            </span>
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-600" /> Microsoft Outlook
            </span>
            <span className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" /> Android & Thunderbird
            </span>
            <span className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" /> Global NVMe Anycast Clusters
            </span>
          </div>
        </section>

        {/* THE 3 CORE ADVANTAGES OVER GOOGLE / MICROSOFT */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">
              Why Switch to ZegaMail
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Built for businesses that want privacy, delivery, and sane pricing.
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              The modern alternative to monopoly email suites that charge you for every single team member.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <AnimatedDollarSign size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Zero Per-User Tax
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Google Workspace and Office 365 charge \$7.20 to \$12.50 per user every month. If you have 6 team members and 3 shared inboxes (<code>sales@</code>, <code>info@</code>), your bill is over <strong>\$700/year</strong>.
              </p>
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800">
                <strong>ZegaMail Solution:</strong> Flat predictable rates. Up to 30 mailboxes included for one flat fee.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <AnimatedCheckCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Verified Delivery Status Ticks
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Wondering whether your invoice or sales proposal actually landed in the client inbox or vanished into spam? ZegaMail monitors server delivery handshakes in real time.
              </p>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <strong>ZegaMail Solution:</strong> Single tick (✓) for dispatched, double ticks (✓✓) for confirmed delivery.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <AnimatedShield size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                100% Private. No Ad Profiling.
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Free webmail providers ingest your company emails to train predictive behavioral ad models. Your sensitive contracts, invoices, and client lists should never be commoditized.
              </p>
              <p className="text-xs font-semibold text-purple-900 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 p-2.5 rounded-lg border border-purple-200 dark:border-purple-800">
                <strong>ZegaMail Solution:</strong> Private, encrypted, zero-telemetry business mail hosting.
              </p>
            </div>
          </div>
        </section>

        {/* INTERACTIVE ANNUAL SAVINGS CALCULATOR WITH CURRENCY SWITCHER */}
        <section id="comparison" className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-lg space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                How much does your business overpay for email?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select your currency and drag the slider to calculate your exact savings.
              </p>

              {/* CURRENCY SELECTOR PILLS */}
              <div className="pt-2 flex items-center justify-center gap-1.5">
                {(["USD", "NGN", "EUR", "GBP"] as SupportedCurrency[]).map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setCurrency(cur)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currency === cur
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {CURRENCY_SYMBOLS[cur]} {cur}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Number of Mailboxes in your Company:
                </span>
                <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                  {calculatorUsers} Mailboxes
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="40"
                value={calculatorUsers}
                onChange={(e) => setCalculatorUsers(parseInt(e.target.value, 10))}
                suppressHydrationWarning
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <p className="text-xs text-slate-500 mb-1">Google Workspace Cost</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white line-through text-red-500/80">
                    {symbol}{totalGoogleCost.toLocaleString()}/yr
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {symbol}{Math.round(googleMonthlyRate).toLocaleString()}/user/mo
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-1 font-semibold">ZegaMail Flat Cost</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {symbol}{zegaAnnualRate.toLocaleString()}/yr
                  </p>
                  <p className="text-[10px] text-blue-500 mt-1 font-medium">
                    {calculatorUsers <= 2
                      ? "Free Forever Plan"
                      : `Flat ${symbol}${Math.round(zegaAnnualRate / 12).toLocaleString()}/mo for whole team`}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1 font-semibold">Your Annual Savings</p>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    +{symbol}{totalAnnualSavings.toLocaleString()}/yr
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    Reinvest in your business
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRANSPARENT PRICING GRID (INCLUDES FREE FOREVER TIER) */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">
              Simple, Honest Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              One flat price for your entire domain.
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Start 100% free with your domain, or pick a flat-rate tier with zero per-seat fees.
            </p>

            {/* Currency & Annual/Monthly Switcher */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {(["USD", "NGN", "EUR", "GBP"] as SupportedCurrency[]).map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setCurrency(cur)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      currency === cur
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {CURRENCY_SYMBOLS[cur]} {cur}
                  </button>
                ))}
              </div>

              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    billingCycle === "monthly"
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("annual")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    billingCycle === "annual"
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span>Annual</span>
                  <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold px-1 py-0.5">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 4-COLUMN RESPONSIVE PRICING GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* CARD 1: Free Forever Plan */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Free Forever</span>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {symbol}0
                  </span>
                  <span className="text-xs text-slate-500 font-sans">/mo flat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5">
                    No Card Needed
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium font-sans">
                    Free with Domain
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Ideal for solo creators and domain owners testing private business email.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 2 Free Mailboxes included
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 2 GB Fast NVMe Storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 1 Custom Domain Connection
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Verified Delivery Ticks (✓)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 100% Private (Zero Ads)
                  </li>
                </ul>
              </div>

              <a
                href={getWhmcsPlanUrl("free")}
                className="mt-8 w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-center font-semibold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors block"
              >
                Claim Free Mailboxes
              </a>
            </div>

            {/* CARD 2: Starter Plan */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starter</span>
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {starterPrice.formatted}
                  </span>
                  <span className="text-sm line-through text-slate-400 font-sans">
                    {starterPrice.regularFormatted}
                  </span>
                  <span className="text-xs text-slate-500 font-sans">/mo flat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.5">
                    Save {starterPrice.discountPercent}%
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                    ({starterPrice.perMailboxFormatted})
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Perfect for solo founders, freelancers, and small startups.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Up to 10 Mailboxes included
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> 25 GB Pooled NVMe Storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> 1 Custom Domain Setup
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Verified Delivery Ticks (✓✓)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Apple Mail & Outlook IMAP/SMTP
                  </li>
                </ul>
              </div>

              <a
                href={getWhmcsPlanUrl("starter")}
                className="mt-8 w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-center font-semibold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors block"
              >
                Choose Starter
              </a>
            </div>

            {/* CARD 3: Growth Plan (Recommended) */}
            <div className="rounded-2xl border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] tracking-wide uppercase flex items-center gap-1 shadow-sm">
                <Zap className="w-3 h-3 text-amber-300" />
                <span>Most Popular</span>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Growth</span>
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {growthPrice.formatted}
                  </span>
                  <span className="text-sm line-through text-slate-400 font-sans">
                    {growthPrice.regularFormatted}
                  </span>
                  <span className="text-xs text-slate-500 font-sans">/mo flat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.5">
                    Save {growthPrice.discountPercent}%
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                    ({growthPrice.perMailboxFormatted})
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">For growing agencies, creative studios, and sales teams.</p>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Up to 30 Mailboxes included
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> 75 GB Pooled NVMe Storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> 5 Custom Domains
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Multi-Touch Cold Outreach Engine
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Instant Cloud Provisioning
                  </li>
                </ul>
              </div>

              <a
                href={getWhmcsPlanUrl("growth")}
                className="mt-8 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold text-xs shadow-md transition-colors block"
              >
                Start Growth
              </a>
            </div>

            {/* CARD 4: Enterprise Pro Plan */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enterprise Pro</span>
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {proPrice.formatted}
                  </span>
                  <span className="text-sm line-through text-slate-400 font-sans">
                    {proPrice.regularFormatted}
                  </span>
                  <span className="text-xs text-slate-500 font-sans">/mo flat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.5">
                    Save {proPrice.discountPercent}%
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium font-sans">
                    Unlimited Mailboxes
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">For scaling organizations needing unlimited mailboxes and high volume.</p>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Unlimited Mailboxes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> 200 GB High-Speed NVMe
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Unlimited Domains
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Dedicated High-Speed Mail Cluster
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Priority 24/7 SLA Support
                  </li>
                </ul>
              </div>

              <a
                href={getWhmcsPlanUrl("pro")}
                className="mt-8 w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-center font-semibold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors block"
              >
                Choose Enterprise Pro
              </a>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Everything you need to know about migrating your business email.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "Can I keep my existing domain name?",
                  a: "Yes. You can connect any domain you own (from NameSilo, GoDaddy, Cloudflare, etc.). We provide simple DNS records (MX, SPF, DKIM) that configure in under 2 minutes.",
                },
                {
                  q: "How does the flat-rate pricing work?",
                  a: "Unlike Google Workspace which charges \$7.20/mo per person, ZegaMail charges one flat price for your organization. Up to 10 mailboxes are included for just \$1.99/mo total (₦1,500/mo in Nigeria).",
                },
                {
                  q: "Does this sync with Apple Mail, Outlook, and my iPhone?",
                  a: "Absolutely. We provide standard IMAP and SMTP configurations with TLS 1.3 security. It syncs across all desktop, web, and mobile email apps.",
                },
                {
                  q: "How do verified delivery ticks work?",
                  a: "When you send an email, our mail infrastructure monitors the recipient server's delivery handshake in real-time. A single tick (✓) indicates dispatch, and double ticks (✓✓) confirm verified inbox delivery acknowledgement.",
                },
                {
                  q: "What payment methods are supported?",
                  a: "We support Paystack (Nigerian bank transfers, USSD, and cards), Flutterwave (Pan-African Mobile Money & cards), Stripe (global Visa, Mastercard, Apple Pay), and automated on-chain cryptocurrency payments across USDT (TRC-20), Bitcoin (BTC), Ethereum (ETH), and Solana (SOL).",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left font-semibold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        openFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM FINAL CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="p-10 sm:p-14 rounded-3xl bg-blue-600 text-white space-y-6 shadow-xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Ready to stop overpaying for business email?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                Join thousands of businesses who switched from Google Workspace. Set up your custom domain in 60 seconds with zero risk.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup?plan=free"
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm shadow-md transition-colors block text-center"
                >
                  Claim 2 Free Mailboxes
                </Link>
                <Link
                  href="/pricing"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors"
                >
                  View All Paid Plans
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* SETUP CONFIGURATION MODAL */}
      <ClientSetupModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        defaultEmail="you@yourcompany.com"
      />


    </div>
  );
}

function AnimatedDollarSign({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-600 dark:text-blue-400"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
