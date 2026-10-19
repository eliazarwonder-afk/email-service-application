"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  CheckCircle2,
  CheckCheck,
  Check,
  Shield,
  Zap,
  ArrowRight,
  Send,
  Users,
  Lock,
  ChevronDown,
  Globe,
  DollarSign,
  Smartphone,
  Server,
  Layers,
  Sparkles,
  HelpCircle,
  Eye,
  Sliders,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroDashboardPreview } from "@/components/HeroDashboardPreview";
import { ClientSetupModal } from "@/components/ClientSetupModal";

export default function HomePage() {
  const [calculatorUsers, setCalculatorUsers] = useState<number>(6);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const googleCost = calculatorUsers * 7.20 * 12; // $7.20/user/mo
  const zegaCost = 4.50 * 12; // $4.50/mo flat for up to 10 users
  const annualSavings = Math.max(0, Math.round(googleCost - zegaCost));

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
            <span>Dedicated cPanel Exim/Dovecot Mail Clusters with Verified Delivery Status Ticks.</span>
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
          {/* Subtle Clean Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-100/60 via-slate-50/20 to-transparent dark:from-blue-900/15 dark:via-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Category Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
              Set up <strong className="text-slate-800 dark:text-slate-200">you@company.com</strong> with guaranteed inbox delivery, Zoho-style verified delivery ticks, and zero tracking ads. Stop paying Google Workspace \$7/month for every single user.
            </p>

            {/* Clear Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <span>Start Free with Your Domain</span>
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
                Up to 10 mailboxes included
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
              <Server className="w-4 h-4 text-indigo-600" /> cPanel Anycast Clusters
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
              Built for businesses, not per-seat software monopolies.
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Legacy providers charge you per person every month. Here is how ZegaMail delivers enterprise-grade email for a fraction of the cost.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Flat Rate vs Per-Seat Tax */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  1. Eliminate the Per-Seat Tax
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Google Workspace and Office 365 charge \$7.20 to \$12.50 per user every month. If you have 6 team members and 3 shared inboxes (`sales@`, `info@`), your bill is over <strong>\$700/year</strong>.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <strong>ZegaMail Solution:</strong> Flat \$4.50/mo for up to 10 mailboxes. No per-user penalty.
                </p>
              </div>
            </div>

            {/* Card 2: Delivery Ticks */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <CheckCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  2. Verified Delivery Status Ticks
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ever send an urgent proposal or invoice and wonder if the client received it? Without invasive tracking pixels, ZegaMail uses native RFC 3461 SMTP acknowledgement to give you clear delivery ticks: <strong>Sent ✓</strong> and <strong>Delivered ✓✓ (250 OK)</strong>.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800">
                  <strong>ZegaMail Solution:</strong> Server-level 250 OK verification built directly into your inbox.
                </p>
              </div>
            </div>

            {/* Card 3: 100% Privacy & Zero Ads */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-900">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  3. 100% Privacy (Zero Ad Scraping)
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your communications contain proprietary client contracts, financial invoices, and intellectual property. ZegaMail runs on dedicated NVMe storage with TLS 1.3 encryption. We never parse your inbox to sell targeted ads.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-purple-900 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 p-2.5 rounded-lg border border-purple-200 dark:border-purple-800">
                  <strong>ZegaMail Solution:</strong> Private, encrypted, zero-telemetry business mail hosting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE ANNUAL SAVINGS CALCULATOR */}
        <section id="comparison" className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-lg space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                How much does your business overpay for email?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Drag the slider to see your immediate annual savings by switching to ZegaMail.
              </p>
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
                max="25"
                value={calculatorUsers}
                onChange={(e) => setCalculatorUsers(parseInt(e.target.value, 10))}
                suppressHydrationWarning
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <p className="text-xs text-slate-500 mb-1">Google Workspace Cost</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white line-through text-red-500/80">
                    \${Math.round(googleCost)}/yr
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">\$7.20/user/mo</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-1 font-semibold">ZegaMail Flat Cost</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    \${zegaCost}/yr
                  </p>
                  <p className="text-[10px] text-blue-500 mt-1">Flat \$4.50/mo</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1 font-semibold">Your Annual Savings</p>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    +\${annualSavings}/yr
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Reinvest in growth</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRANSPARENT PRICING GRID */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">
              Simple, Honest Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              One flat price for your entire domain.
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Pick the tier that fits your business. Upgrade or downgrade at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starter</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">\$4.50</span>
                  <span className="text-xs text-slate-500 font-medium">/month</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Perfect for solo founders, freelancers, and small startups.</p>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Up to 5 Mailboxes included
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> 10 GB Pooled NVMe Storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> 1 Custom Domain Setup
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Verified Delivery Status Ticks
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Apple Mail & Outlook IMAP/SMTP
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=starter"
                className="mt-8 w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-center font-semibold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Choose Starter
              </Link>
            </div>

            {/* Growth Plan (Recommended) */}
            <div className="rounded-2xl border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 p-8 flex flex-col justify-between shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] tracking-wide uppercase">
                Most Popular
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Growth</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">\$12.00</span>
                  <span className="text-xs text-slate-500 font-medium">/month</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">For growing agencies, creative studios, and sales teams.</p>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Up to 15 Mailboxes included
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> 50 GB Pooled Storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> 3 Custom Domains
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Multi-Touch Cold Outreach Engine
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Automated On-Chain Crypto Settlement
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=growth"
                className="mt-8 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold text-xs shadow-md transition-colors"
              >
                Start Growth Trial
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enterprise Pro</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">\$29.00</span>
                  <span className="text-xs text-slate-500 font-medium">/month</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">For scaling organizations needing unlimited mailboxes and high volume.</p>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Unlimited Mailboxes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> 200 GB High-Speed NVMe
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Unlimited Domains
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Dedicated cPanel Cluster Host
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Priority 24/7 SLA Support
                  </li>
                </ul>
              </div>

              <Link
                href="/signup?plan=pro"
                className="mt-8 w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-center font-semibold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Choose Enterprise Pro
              </Link>
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
                  a: "Unlike Google Workspace which charges \$7.20/mo per person, ZegaMail charges one flat price for your organization. Up to 10 mailboxes are included for just \$4.50/mo total.",
                },
                {
                  q: "Does this sync with Apple Mail, Outlook, and my iPhone?",
                  a: "Absolutely. We provide standard IMAP and SMTP configurations with TLS 1.3 security. It syncs across all desktop, web, and mobile email apps.",
                },
                {
                  q: "How do verified delivery ticks work?",
                  a: "When you send an email, our direct cPanel Exim bridge monitors the remote mail server's handshake. A single tick indicates MTA dispatch, and double ticks confirm a verified 250 OK delivery acknowledgement.",
                },
                {
                  q: "What payment methods are supported?",
                  a: "We support major credit cards via Stripe as well as automated on-chain cryptocurrency payments across USDT (TRC-20), Bitcoin (BTC), Ethereum (ETH), and Solana (SOL).",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? "rotate-180 text-blue-600" : ""}`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
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
                  href="/signup"
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm shadow-md transition-colors"
                >
                  Create Your Business Mailbox
                </Link>
                <Link
                  href="/docs"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors"
                >
                  Explore Developer API
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ClientSetupModal isOpen={isDeviceModalOpen} onClose={() => setIsDeviceModalOpen(false)} />
    </div>
  );
}
