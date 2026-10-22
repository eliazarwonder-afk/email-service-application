"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { ZegaLogo } from "./ZegaLogo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6]/95 dark:bg-[#090a0f]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Lockup with Real ZegaMail Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100 rounded-md p-1"
          >
            <ZegaLogo variant="full" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium text-[#706f6c] dark:text-[#9ca3af]">
          <Link
            href="/#features"
            className="hover:text-[#121212] dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded px-1.5 py-1"
          >
            Features
          </Link>
          <Link
            href="/#comparison"
            className="hover:text-[#121212] dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded px-1.5 py-1"
          >
            Compare vs Google
          </Link>
          <Link
            href="/pricing"
            className="hover:text-[#121212] dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded px-1.5 py-1"
          >
            Pricing & AI
          </Link>
          <Link
            href="/app"
            className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100 hover:text-black dark:hover:text-white font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded px-1.5 py-1"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live App Preview
          </Link>
        </nav>

        {/* Action Buttons + Theme Toggle */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-2 text-[#706f6c] dark:text-[#9ca3af] hover:text-[#121212] dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-neutral-700" />
            )}
          </button>

          <Link
            href="/login"
            className="rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/90 dark:bg-[#12151e]/90 px-4 py-1.5 text-xs font-semibold text-[#121212] dark:text-[#f3f4f6] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            Sign In
          </Link>
          <Link
            href="/pricing"
            className="group inline-flex items-center gap-2 rounded-full bg-[#121212] dark:bg-white pl-4 pr-1.5 py-1.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-sm active:scale-[0.98]"
          >
            <span>Get Started</span>
            <div className="h-6 w-6 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-2 text-[#706f6c] dark:text-neutral-300"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
            className="rounded-lg p-2 text-[#706f6c] dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#706f6c] dark:text-[#9ca3af] hover:text-[#121212] dark:hover:text-white"
          >
            Features
          </Link>
          <Link
            href="/#comparison"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#706f6c] dark:text-[#9ca3af] hover:text-[#121212] dark:hover:text-white"
          >
            Compare vs Google & Zoho
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#706f6c] dark:text-[#9ca3af] hover:text-[#121212] dark:hover:text-white"
          >
            Pricing & AI Outreach
          </Link>
          <Link
            href="/app"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100"
          >
            Live Webmail & Campaigns App
          </Link>
          <div className="pt-3 border-t border-[#eaeaea] dark:border-[#202636] flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#161a25] px-3.5 py-2 text-sm font-medium text-[#121212] dark:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-lg bg-[#121212] dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-[#121212]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
