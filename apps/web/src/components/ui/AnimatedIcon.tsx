"use client";

import React from "react";

interface AnimatedIconProps {
  className?: string;
  size?: number;
}

/**
 * 1. Animated Shield Lock (Security, 2048-bit DKIM, TLS 1.3)
 */
export function AnimatedShield({ className = "w-6 h-6", size = 24 }: AnimatedIconProps) {
  return (
    <div className={`relative group inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Background Soft Pulse Glow */}
      <span className="absolute -inset-1 rounded-full bg-blue-500/15 group-hover:bg-blue-500/30 blur-sm transition-all duration-300" />
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative transition-transform duration-300 group-hover:scale-110 text-blue-600 dark:text-blue-400"
      >
        {/* Shield Outer Path */}
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="transition-all duration-300 group-hover:stroke-blue-500" />
        {/* Checkmark with stroke-dash draw animation */}
        <path
          d="m9 12 2 2 4-4"
          className="stroke-emerald-500 transition-all duration-500 group-hover:stroke-emerald-400"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

/**
 * 2. Animated Mail Send (Business Email, Exim MTA, Fast Dispatch)
 */
export function AnimatedMail({ className = "w-6 h-6", size = 24 }: AnimatedIconProps) {
  return (
    <div className={`relative group inline-flex items-center justify-center shrink-0 ${className}`}>
      <span className="absolute -inset-1 rounded-full bg-blue-500/15 group-hover:bg-blue-500/30 blur-sm transition-all duration-300" />
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 text-blue-600 dark:text-blue-400"
      >
        <rect width="20" height="16" x="2" y="4" rx="3" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        {/* Animated Speed Lines on Hover */}
        <path d="M7 15h4" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 stroke-blue-500" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/**
 * 3. Animated Server Cluster (Anycast Infrastructure, NVMe Storage)
 */
export function AnimatedServer({ className = "w-6 h-6", size = 24 }: AnimatedIconProps) {
  return (
    <div className={`relative group inline-flex items-center justify-center shrink-0 ${className}`}>
      <span className="absolute -inset-1 rounded-full bg-emerald-500/15 group-hover:bg-emerald-500/30 blur-sm transition-all duration-300" />
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative transition-transform duration-300 group-hover:scale-105 text-emerald-600 dark:text-emerald-400"
      >
        <rect width="20" height="8" x="2" y="2" rx="2" key="top-blade" />
        <rect width="20" height="8" x="2" y="14" rx="2" key="bottom-blade" />
        <line x1="6" x2="6.01" y1="6" y2="6" strokeWidth="2.5" className="stroke-emerald-500 animate-pulse" />
        <line x1="6" x2="6.01" y1="18" y2="18" strokeWidth="2.5" className="stroke-blue-500 animate-pulse delay-150" />
        <line x1="10" x2="18" y1="6" y2="6" className="stroke-slate-400" />
        <line x1="10" x2="18" y1="18" y2="18" className="stroke-slate-400" />
      </svg>
    </div>
  );
}

/**
 * 4. Animated Globe DNS (Anycast Routing, Domain Health)
 */
export function AnimatedGlobe({ className = "w-6 h-6", size = 24 }: AnimatedIconProps) {
  return (
    <div className={`relative group inline-flex items-center justify-center shrink-0 ${className}`}>
      <span className="absolute -inset-1 rounded-full bg-sky-500/15 group-hover:bg-sky-500/30 blur-sm transition-all duration-300" />
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative transition-transform duration-500 group-hover:rotate-45 text-sky-600 dark:text-sky-400"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    </div>
  );
}

/**
 * 5. Animated AI Sparkles (Outreach Copilot, Copy Generation)
 */
export function AnimatedSparkles({ className = "w-6 h-6", size = 24 }: AnimatedIconProps) {
  return (
    <div className={`relative group inline-flex items-center justify-center shrink-0 ${className}`}>
      <span className="absolute -inset-1 rounded-full bg-amber-500/15 group-hover:bg-amber-500/30 blur-sm transition-all duration-300" />
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative transition-transform duration-500 group-hover:rotate-180 group-hover:scale-110 text-amber-500 dark:text-amber-400"
      >
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
      </svg>
    </div>
  );
}

/**
 * 6. Animated Check (Verified 250 OK Handshake, Deliverability Ticks)
 */
export function AnimatedCheckCheck({ className = "w-6 h-6", size = 24 }: AnimatedIconProps) {
  return (
    <div className={`relative group inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative transition-transform duration-200 group-hover:scale-110 text-emerald-600 dark:text-emerald-400"
      >
        <path d="M18 6 7 17l-5-5" className="transition-all duration-300" />
        <path d="m22 10-7.5 7.5L13 16" className="stroke-emerald-500 transition-all duration-500" />
      </svg>
    </div>
  );
}

/**
 * 7. Animated Credit Card / Payment (Stripe, Paystack, Flutterwave)
 */
export function AnimatedCreditCard({ className = "w-6 h-6", size = 24 }: AnimatedIconProps) {
  return (
    <div className={`relative group inline-flex items-center justify-center shrink-0 ${className}`}>
      <span className="absolute -inset-1 rounded-full bg-blue-500/15 group-hover:bg-blue-500/30 blur-sm transition-all duration-300" />
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105 text-blue-600 dark:text-blue-400"
      >
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
        <line x1="6" x2="10" y1="15" y2="15" className="stroke-emerald-500" strokeWidth="2" />
      </svg>
    </div>
  );
}
