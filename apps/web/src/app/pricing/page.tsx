"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, HelpCircle, Shield, Sparkles, X, Wand2, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CryptoPaymentCheckoutModal } from "@/components/billing/CryptoPaymentCheckoutModal";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<"starter" | "growth" | "pro">("growth");

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-[#090a0f] text-[#121212] dark:text-[#f3f4f6] transition-colors">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] px-3.5 py-1 text-xs text-[#706f6c] dark:text-[#9ca3af]">
            <span className="font-semibold text-neutral-900 dark:text-white">Flat-Rate Pricing</span>
            <span>•</span>
            <span>Includes Zega AI Assistant</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#121212] dark:text-white">
            Predictable Pricing For Your Business Email.
          </h1>

          <p className="text-base sm:text-lg text-[#706f6c] dark:text-[#9ca3af] leading-relaxed">
            Stop paying \$7 every month for every new employee or intern. One flat monthly rate gives your business professional mailboxes, AI proposal drafting, and verified delivery status ticks.
          </p>

          {/* Billing Cycle Switch */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <div className="inline-flex items-center rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-md px-3.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                  billingCycle === "monthly"
                    ? "bg-[#121212] dark:bg-white text-white dark:text-[#121212] shadow-sm"
                    : "text-[#706f6c] dark:text-[#9ca3af] hover:text-[#121212] dark:hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`rounded-md px-3.5 py-1.5 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                  billingCycle === "annual"
                    ? "bg-[#121212] dark:bg-white text-white dark:text-[#121212] shadow-sm"
                    : "text-[#706f6c] dark:text-[#9ca3af] hover:text-[#121212] dark:hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.2">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Free Forever */}
          <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-6 flex flex-col justify-between space-y-6 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shadow-sm">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Domain-Linked
                </span>
                <h2 className="text-xl font-semibold text-[#121212] dark:text-white">Free Forever</h2>
                <p className="text-xs text-[#706f6c] dark:text-[#9ca3af]">
                  Free with any domain registered or hosted via ZegaCloud.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-bold text-[#121212] dark:text-white tabular-nums">\$0</span>
                  <span className="text-xs text-[#706f6c] dark:text-[#9ca3af]">/month</span>
                </div>
                <p className="text-[11px] text-[#706f6c] dark:text-[#9ca3af] mt-1 font-sans">
                  Free for the lifetime of your active domain.
                </p>
              </div>

              <div className="border-t border-[#eaeaea] dark:border-[#202636] pt-4 space-y-2.5 text-xs text-[#706f6c] dark:text-[#9ca3af]">
                <div className="flex items-start gap-2 text-[#121212] dark:text-white font-medium">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>2 Free Mailboxes</strong> (`info@`, `support@`)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>2 GB storage per mailbox</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Webmail + SSL IMAP/POP3</span>
                </div>
                <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                  <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                  <span><strong>50 AI Generation Credits</strong>/mo</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Anti-spam & virus filter</span>
                </div>
              </div>
            </div>

            <Link
              href="/signup?plan=free"
              className="w-full text-center rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] py-2.5 text-xs font-semibold text-[#121212] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Claim Free Mailboxes
            </Link>
          </div>

          {/* Card 2: Starter / Solo */}
          <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-6 flex flex-col justify-between space-y-6 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shadow-sm">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Solo Founder
                </span>
                <h2 className="text-xl font-semibold text-[#121212] dark:text-white">Starter</h2>
                <p className="text-xs text-[#706f6c] dark:text-[#9ca3af]">
                  Bring any custom domain from GoDaddy, Namecheap or Cloudflare.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-bold text-[#121212] dark:text-white tabular-nums">
                    {billingCycle === "annual" ? "\$1.00" : "\$1.20"}
                  </span>
                  <span className="text-xs text-[#706f6c] dark:text-[#9ca3af]">/month flat</span>
                </div>
                <p className="text-[11px] text-[#706f6c] dark:text-[#9ca3af] mt-1 font-sans">
                  Total for all mailboxes combined.
                </p>
              </div>

              <div className="border-t border-[#eaeaea] dark:border-[#202636] pt-4 space-y-2.5 text-xs text-[#706f6c] dark:text-[#9ca3af]">
                <div className="flex items-start gap-2 text-[#121212] dark:text-white font-medium">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Up to 3 Mailboxes</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>10 GB shared cloud storage</span>
                </div>
                <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                  <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                  <span><strong>500 AI Generation Credits</strong>/mo</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Use any custom domain</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Apple Mail & Outlook sync</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCheckoutPlan("starter");
                setIsCheckoutModalOpen(true);
              }}
              className="w-full text-center rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] py-2.5 text-xs font-semibold text-[#121212] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Get Started Starter (Crypto / Card)
            </button>
          </div>

          {/* Card 3: Business Growth (Featured) */}
          <div className="relative rounded-2xl border-2 border-neutral-900 dark:border-neutral-100 bg-white dark:bg-[#151924] p-6 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#121212] dark:bg-white text-white dark:text-[#121212] px-3.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Most Popular
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  The Google Killer
                </span>
                <h2 className="text-xl font-semibold text-[#121212] dark:text-white">Business Growth</h2>
                <p className="text-xs text-[#706f6c] dark:text-[#9ca3af]">
                  Complete client outreach suite for growing agencies and teams.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-bold text-[#121212] dark:text-white tabular-nums">
                    {billingCycle === "annual" ? "\$3.75" : "\$4.50"}
                  </span>
                  <span className="text-xs text-[#706f6c] dark:text-[#9ca3af]">/month flat</span>
                </div>
                <p className="text-[11px] text-[#2b5930] dark:text-emerald-400 font-medium mt-1 font-sans">
                  Saves \$600+/yr vs Google Workspace.
                </p>
              </div>

              <div className="border-t border-[#eaeaea] dark:border-[#202636] pt-4 space-y-2.5 text-xs text-[#706f6c] dark:text-[#9ca3af]">
                <div className="flex items-start gap-2 text-[#121212] dark:text-white font-medium">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Up to 10 Mailboxes</strong></span>
                </div>
                <div className="flex items-start gap-2 text-[#121212] dark:text-white font-medium">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>50 GB</strong> shared fast storage</span>
                </div>
                <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/40 p-1.5 rounded font-medium">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>3,000 AI Credits</strong>/mo (Proposals & Smart Replies)</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-900 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-1.5 rounded font-medium">
                  <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Verified Delivery Status Ticks (Sent / Delivered ✓✓)</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Outreach Campaigns Engine (1,500 leads/mo)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>1-Click Automated DNS verification</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCheckoutPlan("growth");
                setIsCheckoutModalOpen(true);
              }}
              className="w-full text-center rounded-lg bg-[#121212] dark:bg-white py-2.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-md"
            >
              Start 14-Day Free Trial (Crypto / Card)
            </button>
          </div>

          {/* Card 4: Unlimited Pro */}
          <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-6 flex flex-col justify-between space-y-6 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shadow-sm">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Scale & High Volume
                </span>
                <h2 className="text-xl font-semibold text-[#121212] dark:text-white">Unlimited Pro</h2>
                <p className="text-xs text-[#706f6c] dark:text-[#9ca3af]">
                  Zero limits on mailbox count. Built for high-volume delivery.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-bold text-[#121212] dark:text-white tabular-nums">
                    {billingCycle === "annual" ? "\$10.00" : "\$12.00"}
                  </span>
                  <span className="text-xs text-[#706f6c] dark:text-[#9ca3af]">/month flat</span>
                </div>
                <p className="text-[11px] text-[#706f6c] dark:text-[#9ca3af] mt-1 font-sans">
                  Unlimited mailboxes on 1 domain.
                </p>
              </div>

              <div className="border-t border-[#eaeaea] dark:border-[#202636] pt-4 space-y-2.5 text-xs text-[#706f6c] dark:text-[#9ca3af]">
                <div className="flex items-start gap-2 text-[#121212] dark:text-white font-medium">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Unlimited Mailboxes</strong></span>
                </div>
                <div className="flex items-start gap-2 text-[#121212] dark:text-white font-medium">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>200 GB</strong> storage pool</span>
                </div>
                <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 font-semibold">
                  <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                  <span><strong>Unlimited AI Credits</strong> & Auto-Sequences</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Dedicated Outbound IP pool & Warmup</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Audit logging & 30-day backups</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCheckoutPlan("pro");
                setIsCheckoutModalOpen(true);
              }}
              className="w-full text-center rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] py-2.5 text-xs font-semibold text-[#121212] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Choose Unlimited Pro (Crypto / Card)
            </button>
          </div>
        </div>

        {/* DETAILED HEAD-TO-HEAD COMPARISON TABLE */}
        <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-8 space-y-6 shadow-sm overflow-x-auto">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[#121212] dark:text-white">
              Feature Comparison vs Google & Zoho
            </h2>
            <p className="text-xs text-[#706f6c] dark:text-[#9ca3af]">
              How Zega Mail saves your budget while delivering modern AI and business tools.
            </p>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#eaeaea] dark:border-[#202636] text-[#706f6c] dark:text-[#9ca3af]">
                <th className="py-3 font-semibold text-neutral-900 dark:text-white w-1/3">Feature</th>
                <th className="py-3 font-semibold text-[#121212] dark:text-white bg-[#edf3ec]/60 dark:bg-emerald-950/40 px-3 rounded-t-lg">
                  Zega Mail (Growth)
                </th>
                <th className="py-3 font-semibold text-neutral-600 dark:text-neutral-300 px-3">Google Workspace</th>
                <th className="py-3 font-semibold text-neutral-600 dark:text-neutral-300 px-3">Zoho Mail (Standard)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea] dark:divide-[#202636]">
              <tr>
                <td className="py-3 font-medium text-[#121212] dark:text-white">Monthly Cost for 10 Mailboxes</td>
                <td className="py-3 px-3 bg-[#edf3ec]/40 dark:bg-emerald-950/20 font-mono font-bold text-[#2b5930] dark:text-emerald-400">
                  \$4.50 / mo flat
                </td>
                <td className="py-3 px-3 font-mono text-red-600">\$72.00 / mo (\$7.20/user)</td>
                <td className="py-3 px-3 font-mono">\$12.50 to \$40.00 / mo</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-[#121212] dark:text-white">AI Proposal & Reply Assistant</td>
                <td className="py-3 px-3 bg-[#edf3ec]/40 dark:bg-emerald-950/20 font-semibold text-emerald-700 dark:text-emerald-300">
                  ✓ 3,000 credits included
                </td>
                <td className="py-3 px-3 text-neutral-500">Requires \$30/mo Gemini add-on</td>
                <td className="py-3 px-3 text-neutral-500">Basic / Limited</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-[#121212] dark:text-white">Delivery Status Ticks (Sent ✓ / Delivered ✓✓)</td>
                <td className="py-3 px-3 bg-[#edf3ec]/40 dark:bg-emerald-950/20 font-semibold text-emerald-700 dark:text-emerald-300">
                  ✓ Built-in (DSN RFC 3461)
                </td>
                <td className="py-3 px-3 text-neutral-500">Requires \$20+/mo extensions</td>
                <td className="py-3 px-3 text-neutral-500">Basic / manual confirmation</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-[#121212] dark:text-white">IMAP & POP3 External Client Access</td>
                <td className="py-3 px-3 bg-[#edf3ec]/40 dark:bg-emerald-950/20 font-semibold text-emerald-700 dark:text-emerald-300">
                  ✓ Free on all plans
                </td>
                <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300">✓ Included</td>
                <td className="py-3 px-3 text-red-600 font-medium">Locked on free tier</td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-[#121212] dark:text-white">Automated Domain Provisioning & DNS Sync</td>
                <td className="py-3 px-3 bg-[#edf3ec]/40 dark:bg-emerald-950/20 font-semibold text-emerald-700 dark:text-emerald-300">
                  ✓ Native integration
                </td>
                <td className="py-3 px-3 text-neutral-500">Not supported</td>
                <td className="py-3 px-3 text-neutral-500">Not supported</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      {/* Crypto & Card Payment Checkout Modal */}
      <CryptoPaymentCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        defaultPlan={checkoutPlan}
      />

      <Footer />
    </div>
  );
}
