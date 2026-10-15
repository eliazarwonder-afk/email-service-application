import React from "react";
import Link from "next/link";
import { Shield, CheckCircle2 } from "lucide-react";
import { ZegaLogo } from "./ZegaLogo";

interface FooterProps {
  onOpenClientSetup?: () => void;
}

export function Footer({ onOpenClientSetup }: FooterProps) {
  return (
    <footer className="relative border-t border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#090a0f] text-[#706f6c] dark:text-[#9ca3af] text-sm transition-colors overflow-hidden">
      {/* Animated cybernetic server grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-60 -z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-server-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-neutral-300 dark:text-neutral-800" />
            </pattern>
            <linearGradient id="footer-glow-beam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-server-grid)" />
          <line x1="0%" y1="1" x2="100%" y2="1" stroke="url(#footer-glow-beam)" strokeWidth="2" className="animate-pulse" />
        </svg>
      </div>

      {/* Cyber aurora ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[150px] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[90px] pointer-events-none animate-pulseGlow" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Column with Authentic ZegaMail Logo */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <ZegaLogo variant="full" />
            </div>

            <p className="text-sm text-[#706f6c] dark:text-[#9ca3af] max-w-sm leading-relaxed">
              Ad-free, privacy-first business email, AI writing assistant, and client outreach campaigns for founders, agencies, and growing teams. Stop paying \$7 per mailbox every month.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/40 px-3 py-1 text-xs text-emerald-800 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational • 99.99% Uptime SLA</span>
            </div>

            {/* App Store & Play Store Badges with Real SVGs */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-[#121212] dark:text-white mb-2">
                Available on Mobile & Desktop
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={onOpenClientSetup}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] px-3 py-1.5 text-xs text-[#121212] dark:text-white shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <img src="/branding/apple-icon.svg" alt="Apple" className="h-4 w-4 dark:invert" />
                  <div className="text-left">
                    <p className="text-[9px] text-neutral-500 leading-none">Download on</p>
                    <p className="font-semibold leading-tight text-[11px]">Apple App Store</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onOpenClientSetup}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] px-3 py-1.5 text-xs text-[#121212] dark:text-white shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <img src="/branding/google-play-icon.svg" alt="Google Play" className="h-4 w-4" />
                  <div className="text-left">
                    <p className="text-[9px] text-neutral-500 leading-none">Get it on</p>
                    <p className="font-semibold leading-tight text-[11px]">Google Play Store</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Links Column 1: Product */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#121212] dark:text-white">
              Product & AI
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/app?tab=mail" className="hover:text-[#121212] dark:hover:text-white transition-colors">
                  Business Webmail
                </Link>
              </li>
              <li>
                <Link href="/app?tab=mail" className="hover:text-[#121212] dark:hover:text-white transition-colors">
                  Delivery Status Ticks
                </Link>
              </li>
              <li>
                <Link href="/app?tab=ai" className="hover:text-[#121212] dark:hover:text-white transition-colors">
                  AI Email & Reply Generator
                </Link>
              </li>
              <li>
                <Link href="/app?tab=campaigns" className="hover:text-[#121212] dark:hover:text-white transition-colors">
                  Email Outreach Campaigns
                </Link>
              </li>
              <li>
                <Link href="/app?tab=domains" className="hover:text-[#121212] dark:hover:text-white transition-colors">
                  Domain & DNS Health
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#121212] dark:hover:text-white transition-colors">
                  Flat-Rate Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Compare */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#121212] dark:text-white">
              Compare
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="hover:text-[#121212] dark:hover:text-white transition-colors">
                  vs Google Workspace
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#121212] dark:hover:text-white transition-colors">
                  vs Microsoft 365
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#121212] dark:hover:text-white transition-colors">
                  vs Zoho Mail
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#121212] dark:hover:text-white transition-colors">
                  vs Titan Email
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Security & Trust */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#121212] dark:text-white">
              Security & Trust
            </h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>AES-256-GCM Encryption</span>
              </li>
              <li className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>DKIM, SPF & DMARC Enforced</span>
              </li>
              <li>
                <span className="text-neutral-500">Zero Data Mining / Ad-Free</span>
              </li>
              <li>
                <span className="text-neutral-500">Automated Cloud Billing & Provisioning</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#eaeaea] dark:border-[#202636] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8d8c89]">
          <p>© 2026 Zegabytez Limited. All rights reserved. Zega Mail is an official product of ZegaCloud.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#121212] dark:hover:text-white cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-[#121212] dark:hover:text-white cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-[#121212] dark:hover:text-white cursor-pointer">Security Whitepaper</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
