"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Send,
  Users,
  Lock,
  ChevronRight,
  Globe,
  DollarSign,
  HelpCircle,
  FileCheck,
  Smartphone,
  Server,
  Sparkles,
  Apple,
  TrendingUp,
  Wand2,
  Layers,
  ChevronDown
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroDashboardPreview } from "@/components/HeroDashboardPreview";
import { TechCloudBackground } from "@/components/TechCloudBackground";
import { TechServerRibbon } from "@/components/TechServerRibbon";
import { ClientSetupModal } from "@/components/ClientSetupModal";

export default function HomePage() {
  const [calculatorUsers, setCalculatorUsers] = useState<number>(5);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  // Dynamic Animated Word Rotator in Hero Statement
  const animatedStatements = [
    "Close High-Ticket Clients.",
    "Track Proposal Opens in Real-Time.",
    "Eliminate \$7/User Monthly Fees.",
    "Automate Cold Outreach with AI.",
    "Guarantee 100% Inbox Placement.",
  ];
  const [statementIndex, setStatementIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatementIndex((prev) => (prev + 1) % animatedStatements.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const googleCost = calculatorUsers * 7.20 * 12; // $7.20/user/mo
  const zegaCost = 4.50 * 12; // $4.50/mo flat
  const annualSavings = Math.round(googleCost - zegaCost);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-[#090a0f] text-[#121212] dark:text-[#f3f4f6] transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Top Announcement Bar */}
        <section
          aria-label="Announcement"
          className="border-b border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] py-2.5 px-4 text-center transition-colors"
        >
          <p className="text-xs font-medium text-[#706f6c] dark:text-[#9ca3af] flex items-center justify-center gap-2 flex-wrap">
            <span className="rounded bg-[#edf3ec] dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-[#2b5930] dark:text-emerald-400 border border-[#d6e6d5] dark:border-emerald-800">
              New: Zega AI Studio
            </span>
            <span>
              Now with AI Proposal Generator, Client Read Receipts & Instant Domain DNS Sync.
            </span>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 font-semibold text-[#121212] dark:text-white hover:underline underline-offset-2 ml-1"
            >
              Explore AI Plans <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </p>
        </section>

        {/* HERO SECTION WITH TECH CLOUD CYBERNETIC BACKGROUND */}
        <section className="relative w-full overflow-hidden pt-16 pb-20 border-b border-[#eaeaea]/80 dark:border-[#202636]/80">
          <TechCloudBackground />

          <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
            <div className="max-w-3xl mx-auto space-y-6">
            {/* Tech Server Cloud Infrastructure Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-300 dark:border-neutral-700/80 bg-white/90 dark:bg-[#11141e]/90 backdrop-blur-md px-4 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Cloud Mail Cluster
              </span>
              <span>•</span>
              <span className="text-neutral-900 dark:text-white font-medium">ZegaCloud Network</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-neutral-500">100% Ad-Free NVMe</span>
            </div>

            {/* Dynamic Animated Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#121212] dark:text-white leading-[1.12]">
              Professional Business Email That Helps You{" "}
              <span className="block mt-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600 dark:from-white dark:via-blue-300 dark:to-emerald-400 transition-all duration-500 underline decoration-neutral-300 dark:decoration-neutral-700 underline-offset-8">
                {animatedStatements[statementIndex]}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#706f6c] dark:text-[#9ca3af] leading-relaxed max-w-2xl mx-auto font-normal">
              Dedicated cloud mail infrastructure with built-in client read receipts, Zega AI proposal writer, automated cold sequences, and instant custom domain DNS routing. Stop paying Google Workspace \$7/mo for every single mailbox.
            </p>

            {/* High-End Nested Island CTAs (Button-in-Button Architecture) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto group inline-flex items-center justify-between gap-5 rounded-full bg-[#121212] dark:bg-white pl-7 pr-2.5 py-2.5 text-base font-semibold text-white dark:text-[#121212] shadow-xl hover:shadow-2xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100"
              >
                <span>Start Free with Your Domain</span>
                <div className="h-9 w-9 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </div>
              </Link>
              <Link
                href="/app"
                className="w-full sm:w-auto group inline-flex items-center justify-center gap-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-[#12151e]/80 backdrop-blur-md px-6 py-3.5 text-base font-medium text-[#121212] dark:text-[#f3f4f6] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                <Eye className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                <span>Try Live Webmail Demo</span>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Available on Play Store and Apple Store - Clickable Modal Trigger */}
            <div className="pt-3 flex flex-col items-center gap-2">
              <p className="text-xs text-[#706f6c] dark:text-[#9ca3af] font-medium">
                Sync on Mobile, Tablet & Desktop Clients
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeviceModalOpen(true)}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700/80 bg-white/90 dark:bg-[#12151e]/90 px-4 py-2 text-xs text-[#121212] dark:text-white shadow-sm hover:border-neutral-400 dark:hover:border-neutral-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <img src="/branding/apple-icon.svg" alt="Apple" className="h-4 w-4 dark:invert" />
                  <div className="text-left">
                    <p className="text-[9px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider leading-none">Connect with</p>
                    <p className="font-semibold leading-tight text-xs">Apple Mail & iOS</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeviceModalOpen(true)}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700/80 bg-white/90 dark:bg-[#12151e]/90 px-4 py-2 text-xs text-[#121212] dark:text-white shadow-sm hover:border-neutral-400 dark:hover:border-neutral-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <img src="/branding/google-play-icon.svg" alt="Google Play" className="h-4 w-4" />
                  <div className="text-left">
                    <p className="text-[9px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider leading-none">Connect with</p>
                    <p className="font-semibold leading-tight text-xs">Android & Outlook</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Micro-Trust Highlights */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-[#706f6c] dark:text-[#9ca3af]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                2 Free Mailboxes with any ZegaCloud Domain
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Dedicated SMTP/IMAP SSL Gateways
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Zero Ads, Zero Scraping, 100% Privacy
              </span>
            </div>
          </div>

          {/* HIGH-FIDELITY REDESIGNED HERO DASHBOARD PREVIEW */}
          <HeroDashboardPreview />
          </div>
        </section>

        {/* LIVE TECH CLOUD SERVER INFRASTRUCTURE TELEMETRY RIBBON */}
        <TechServerRibbon />

        {/* PROBLEM & SOLUTION: THE 3 SMALL BUSINESS HEADACHES */}
        <section id="comparison" className="border-t border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#0c0e14] py-20 px-4 sm:px-6 lg:px-8 transition-colors">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#706f6c] dark:text-[#9ca3af]">
                Why Switch From Google & Microsoft
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#121212] dark:text-white">
                Built For Businesses, Not IT Monopolies.
              </h2>
              <p className="text-base text-[#706f6c] dark:text-[#9ca3af]">
                Every business owner encounters the same three frustrations with legacy email providers. Here is how Zega Mail fixes them.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Per-Seat Tax */}
              <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#12151e] p-7 space-y-4 flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shadow-sm">
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-700 dark:text-red-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#121212] dark:text-white">
                    1. The \$7/User Per-Seat Penalty
                  </h3>
                  <p className="text-sm text-[#706f6c] dark:text-[#9ca3af] leading-relaxed">
                    Google Workspace and Microsoft 365 charge \$7.20 to \$12.50 per person per month. If you have 6 team members and 3 shared inboxes (`sales@`, `info@`, `support@`), your bill is over <strong>\$700/year</strong> just for email addresses.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#eaeaea] dark:border-[#202636]">
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-[#edf3ec] dark:bg-emerald-950/50 border border-[#d6e6d5] dark:border-emerald-800 p-2.5 rounded-lg">
                    <strong>The Zega Mail Fix:</strong> Flat \$4.50/mo for up to 10 mailboxes. No per-seat extortion.
                  </p>
                </div>
              </div>

              {/* Card 2: Blind Outbound */}
              <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#12151e] p-7 space-y-4 flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shadow-sm">
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-400">
                    <Eye className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#121212] dark:text-white">
                    2. The Blind Outreach Problem
                  </h3>
                  <p className="text-sm text-[#706f6c] dark:text-[#9ca3af] leading-relaxed">
                    You send a critical quotation, invoice, or proposal to a prospect and hear nothing for days. Did they read it? Did they ignore it? Or did it end up in spam? You have no visibility without buying \$30/mo sales extensions.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#eaeaea] dark:border-[#202636]">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 bg-[#e1f3fe] dark:bg-blue-950/50 border border-[#cbe4fb] dark:border-blue-800 p-2.5 rounded-lg">
                    <strong>The Zega Mail Fix:</strong> Native read receipts & open notifications built straight into your webmail.
                  </p>
                </div>
              </div>

              {/* Card 3: DNS Nightmares */}
              <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#12151e] p-7 space-y-4 flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shadow-sm">
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#121212] dark:text-white">
                    3. The Complicated DNS Nightmare
                  </h3>
                  <p className="text-sm text-[#706f6c] dark:text-[#9ca3af] leading-relaxed">
                    Google and Zoho expect non-technical business owners to manually write raw TXT strings, generate 2048-bit DKIM keys, and troubleshoot cryptic MX records. One typo and your emails go directly to recipient junk folders.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#eaeaea] dark:border-[#202636]">
                  <p className="text-xs font-semibold text-neutral-800 dark:text-amber-300 bg-[#fbf3db] dark:bg-amber-950/50 border border-[#eddcb3] dark:border-amber-800 p-2.5 rounded-lg">
                    <strong>The Zega Mail Fix:</strong> 1-Click ZegaCloud DNS verification. SPF, DKIM, and DMARC validated automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE SAVINGS CALCULATOR */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-8 sm:p-12 shadow-sm space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#706f6c] dark:text-[#9ca3af]">
                Instant ROI Calculator
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#121212] dark:text-white">
                See How Much Your Business Saves Every Year
              </h2>
              <p className="text-sm text-[#706f6c] dark:text-[#9ca3af]">
                Drag the slider to match your team size or number of needed mailboxes.
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#121212] dark:text-white">Number of Business Mailboxes:</span>
                <span className="font-mono font-bold text-lg text-[#121212] dark:text-white bg-neutral-100 dark:bg-neutral-800 px-3 py-0.5 rounded border border-[#eaeaea] dark:border-[#202636]">
                  {calculatorUsers} {calculatorUsers === 1 ? "mailbox" : "mailboxes"}
                </span>
              </div>

              <label htmlFor="user-slider" className="sr-only">
                Number of mailboxes slider
              </label>
              <input
                id="user-slider"
                type="range"
                min="1"
                max="25"
                value={calculatorUsers}
                onChange={(e) => setCalculatorUsers(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#121212] dark:accent-white"
              />
              <div className="flex justify-between text-xs text-[#706f6c] dark:text-[#9ca3af] font-mono">
                <span>1 user</span>
                <span>10 users</span>
                <span>25 users</span>
              </div>
            </div>

            {/* Comparison Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#eaeaea] dark:border-[#202636] text-center">
              <div className="p-4 rounded-xl bg-[#faf9f6] dark:bg-[#181d28] border border-[#eaeaea] dark:border-[#202636]">
                <p className="text-xs text-[#706f6c] dark:text-[#9ca3af] mb-1">Google Workspace</p>
                <p className="text-2xl font-semibold font-mono text-red-600 line-through">
                  \${Math.round(googleCost)}/yr
                </p>
                <p className="text-[11px] text-[#706f6c] dark:text-[#9ca3af] mt-1">(\$7.20/user/mo)</p>
              </div>

              <div className="p-4 rounded-xl bg-[#edf3ec] dark:bg-emerald-950/40 border border-[#d6e6d5] dark:border-emerald-800">
                <p className="text-xs text-[#2b5930] dark:text-emerald-300 font-medium mb-1">Zega Mail Growth</p>
                <p className="text-2xl font-semibold font-mono text-[#2b5930] dark:text-emerald-400">
                  \${zegaCost}/yr
                </p>
                <p className="text-[11px] text-[#2b5930] dark:text-emerald-300 mt-1">(\$4.50 flat/mo)</p>
              </div>

              <div className="p-4 rounded-xl bg-[#121212] dark:bg-black text-white border border-neutral-800">
                <p className="text-xs text-neutral-400 mb-1">Your Net Annual Savings</p>
                <p className="text-3xl font-semibold font-mono text-emerald-400">
                  +\${annualSavings > 0 ? annualSavings : 30}/yr
                </p>
                <p className="text-[11px] text-neutral-300 mt-1">Money kept in your business</p>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-[#121212] dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm"
              >
                <span>Switch to Zega Mail & Save \${annualSavings > 0 ? annualSavings : 30}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES GRID INCLUDING ZEGA AI & CAMPAIGNS */}
        <section id="features" className="border-t border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#0c0e14] py-20 px-4 sm:px-6 lg:px-8 transition-colors">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#706f6c] dark:text-[#9ca3af]">
                Product & AI Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#121212] dark:text-white">
                Everything Your Business Needs To Look Professional
              </h2>
              <p className="text-base text-[#706f6c] dark:text-[#9ca3af]">
                Zero clutter, zero tracking cookies, and no annoying corporate ads. Just pristine email that works on every screen.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1: AI Writing Studio */}
              <div className="rounded-[1.75rem] p-1.5 bg-neutral-200/60 dark:bg-white/5 border border-neutral-300/80 dark:border-white/10 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all shadow-sm">
                <div className="rounded-[calc(1.75rem-0.375rem)] bg-white dark:bg-[#11141e] p-6 space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-[#121212] dark:text-white text-base">
                      Zega AI Outreach Assistant
                    </h3>
                    <p className="text-sm text-[#706f6c] dark:text-[#9ca3af] leading-relaxed">
                      Draft high-converting client proposals, generate smart 1-click replies, and polish communication tone directly inside your webmail composer.
                    </p>
                  </div>
                  <Link
                    href="/app?tab=ai"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline pt-2"
                  >
                    <span>Draft Proposal with AI</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Feature 2: Titan-Style Read Receipts */}
              <div className="rounded-[1.75rem] p-1.5 bg-neutral-200/60 dark:bg-white/5 border border-neutral-300/80 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all shadow-sm">
                <div className="rounded-[calc(1.75rem-0.375rem)] bg-white dark:bg-[#11141e] p-6 space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Eye className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-[#121212] dark:text-white text-base">
                      Native Client Read Receipts
                    </h3>
                    <p className="text-sm text-[#706f6c] dark:text-[#9ca3af] leading-relaxed">
                      Receive discreet timestamped alerts the exact moment a prospective customer opens your quotation, estimate, or contract proposal.
                    </p>
                  </div>
                  <Link
                    href="/app?tab=mail"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-2"
                  >
                    <span>Test Read Receipts in App</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Feature 3: Cold Outreach Sequences */}
              <div className="rounded-[1.75rem] p-1.5 bg-neutral-200/60 dark:bg-white/5 border border-neutral-300/80 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all shadow-sm">
                <div className="rounded-[calc(1.75rem-0.375rem)] bg-white dark:bg-[#11141e] p-6 space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-[#121212] dark:text-white text-base">
                      Outreach Campaigns & Analytics
                    </h3>
                    <p className="text-sm text-[#706f6c] dark:text-[#9ca3af] leading-relaxed">
                      Create targeted email sequences for new leads, automate invoice reminders, and view real-time open and click statistics.
                    </p>
                  </div>
                  <Link
                    href="/app?tab=campaigns"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-2"
                  >
                    <span>Launch Sequences in App</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Feature 4: Custom Domain */}
              <div className="rounded-[1.75rem] p-1.5 bg-neutral-200/60 dark:bg-white/5 border border-neutral-300/80 dark:border-white/10 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-sm">
                <div className="rounded-[calc(1.75rem-0.375rem)] bg-white dark:bg-[#11141e] p-6 space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#121212] flex items-center justify-center">
                      <Globe className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-[#121212] dark:text-white text-base">
                      Custom Domain & Automated DNS Sync
                    </h3>
                    <p className="text-sm text-[#706f6c] dark:text-[#9ca3af] leading-relaxed">
                      Send from `you@yourbrand.com`. Connect your existing domain or register a new domain with instant automated DNS verification.
                    </p>
                  </div>
                  <Link
                    href="/app?tab=domains"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white hover:underline pt-2"
                  >
                    <span>Manage Domains & DNS</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Feature 5: Mobile & Desktop Sync */}
              <div className="rounded-[1.75rem] p-1.5 bg-neutral-200/60 dark:bg-white/5 border border-neutral-300/80 dark:border-white/10 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-sm">
                <div className="rounded-[calc(1.75rem-0.375rem)] bg-white dark:bg-[#11141e] p-6 space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#121212] flex items-center justify-center">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-[#121212] dark:text-white text-base">
                      Apple Mail, Outlook & Android
                    </h3>
                    <p className="text-sm text-[#706f6c] dark:text-[#9ca3af] leading-relaxed">
                      Connect instantly via secure SSL IMAP & SMTP. Works smoothly on your iPhone Mail, Android, Mac, Thunderbird, and Windows clients.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeviceModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white hover:underline pt-2 text-left"
                  >
                    <span>View Client Setup Guide</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Feature 6: Security */}
              <div className="rounded-[1.75rem] p-1.5 bg-neutral-200/60 dark:bg-white/5 border border-neutral-300/80 dark:border-white/10 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-sm">
                <div className="rounded-[calc(1.75rem-0.375rem)] bg-white dark:bg-[#11141e] p-6 space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#121212] flex items-center justify-center">
                      <Lock className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-[#121212] dark:text-white text-base">
                      AES-256-GCM Vault Security
                    </h3>
                    <p className="text-sm text-[#706f6c] dark:text-[#9ca3af] leading-relaxed">
                      Credentials are authenticated through SaaS sessions with encrypted storage at rest. Your main organization account is never coupled to raw passwords.
                    </p>
                  </div>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white hover:underline pt-2"
                  >
                    <span>Start Encrypted Session</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM HIGH-END CTA */}
        <section className="relative border-t border-[#eaeaea] dark:border-[#202636] bg-neutral-100/70 dark:bg-[#07090e] py-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden transition-colors">
          <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
            <div className="w-[500px] h-[300px] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/90 dark:bg-[#12151e]/90 px-4 py-1 text-xs text-neutral-600 dark:text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Instant Cloud Activation</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#121212] dark:text-white">
              Ready to Upgrade Your Business Communications?
            </h2>

            <p className="text-base sm:text-lg text-[#706f6c] dark:text-[#9ca3af] max-w-xl mx-auto">
              Join hundreds of business owners saving thousands every year on email costs while enjoying high inbox delivery, automated client billing, and AI proposal assistance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto group inline-flex items-center justify-between gap-5 rounded-full bg-[#121212] dark:bg-white pl-7 pr-2.5 py-2.5 text-base font-semibold text-white dark:text-[#121212] shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-[0.98]"
              >
                <span>Get Started Now — It’s Free</span>
                <div className="h-9 w-9 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#12151e] px-6 py-3.5 text-base font-medium text-[#121212] dark:text-white hover:bg-neutral-50 dark:hover:bg-[#1c2232] transition-colors shadow-sm"
              >
                <span>Compare All Pricing Tiers & AI Limits</span>
              </Link>
            </div>
          </div>
        </section>

        {/* MOBILE & DESKTOP CLIENT CONFIGURATION MODAL */}
        <ClientSetupModal isOpen={isDeviceModalOpen} onClose={() => setIsDeviceModalOpen(false)} />
      </main>

      <Footer onOpenClientSetup={() => setIsDeviceModalOpen(true)} />
    </div>
  );
}
