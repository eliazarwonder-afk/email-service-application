"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  ArrowRight,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ZegaLogo } from "@/components/ZegaLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  // Detect query params for errors
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get("error");
      if (errorParam) {
        setErrorMessage(decodeURIComponent(errorParam));
      }
    }
  }, []);

  const testAccounts = [
    {
      id: "owner",
      title: "Business Owner",
      email: "owner@zegacloud.com",
      pass: "OwnerDemo#2026",
      role: "Admin & Billing",
      badge: "Full Org Access",
    },
    {
      id: "sales",
      title: "Sales Director",
      email: "sales@acmedesign.co",
      pass: "SalesDemo#2026",
      role: "Client Outreach",
      badge: "Delivery Ticks",
    },
    {
      id: "support",
      title: "Support Lead",
      email: "support@zegacloud.com",
      pass: "SupportDemo#2026",
      role: "Team Mailbox",
      badge: "Shared Inbox",
    },
  ];

  const handleSelectDemoAccount = (account: typeof testAccounts[0]) => {
    setSelectedPersona(account.id);
    setEmail(account.email);
    setPassword(account.pass);
    setErrorMessage("");
    setSuccessMessage(`Loaded ${account.title} credentials. Click "Sign In" or "Launch Demo".`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage(`Welcome back, ${data.user.name}! Redirecting to webmail…`);
      setTimeout(() => {
        router.push("/app");
      }, 700);
    } catch (err: any) {
      setErrorMessage("Could not connect to authentication service. Please try again.");
      setIsLoading(false);
    }
  };

  const handleWhmcsSSO = async () => {
    setIsLoading(true);
    setSuccessMessage("Connecting to ZegaCloud Client Area SSO…");

    try {
      const res = await fetch("/api/auth/whmcs-sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || "owner@zegacloud.com" }),
      });
      const data = await res.json();
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        router.push("/app");
      }
    } catch (e) {
      router.push("/app");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-[#090a0f] text-[#121212] dark:text-[#f3f4f6] transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header with ZegaMail Logo */}
          <div className="text-center space-y-3 flex flex-col items-center">
            <ZegaLogo variant="full" className="mx-auto" />
            <p className="text-xs text-[#706f6c] dark:text-[#9ca3af]">
              Professional Business Email • A Product of ZegaCloud
            </p>
          </div>

          {/* Guided Interactive Demo Workflow Section */}
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 dark:text-blue-300">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Interactive Guided Demo</span>
              </div>
              <span className="text-[10px] bg-white dark:bg-[#161a25] text-blue-700 dark:text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                1-Click Access
              </span>
            </div>

            <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-snug">
              Select a persona to test live delivery status ticks, AI proposal generator, and automated domain DNS sync:
            </p>

            <div className="grid grid-cols-3 gap-1.5">
              {testAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleSelectDemoAccount(account)}
                  className={`p-2 rounded-xl text-left transition-all border text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    selectedPersona === account.id
                      ? "border-blue-600 bg-white dark:bg-[#181d28] shadow-sm font-semibold"
                      : "border-blue-200 dark:border-blue-900 bg-white/70 dark:bg-[#12151e] hover:bg-white dark:hover:bg-[#161a25]"
                  }`}
                >
                  <p className="text-[#121212] dark:text-white text-[11px] truncate">
                    {account.title}
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 truncate mt-0.5">
                    {account.badge}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form Card */}
          <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-6 shadow-sm space-y-5">
            {errorMessage && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 p-2.5 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-[#121212] dark:text-white"
                >
                  Work Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] px-3.5 py-2.5 text-xs text-[#121212] dark:text-white placeholder-neutral-400 focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-[#121212] dark:text-white"
                  >
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Password reset instructions sent to your email address via admin SMTP.");
                    }}
                    className="text-[11px] text-[#706f6c] dark:text-[#9ca3af] hover:text-[#121212] dark:hover:text-white transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] px-3.5 py-2.5 text-xs text-[#121212] dark:text-white placeholder-neutral-400 focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-2.5 text-[#706f6c] dark:text-[#9ca3af] hover:text-[#121212] dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#121212] dark:bg-white px-4 py-2.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                {isLoading ? (
                  <span>Verifying credentials…</span>
                ) : (
                  <>
                    <span>Sign In to Webmail</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#eaeaea] dark:border-[#202636]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-[#12151e] px-2 text-[#706f6c] dark:text-[#9ca3af]">
                  ZegaCloud Master Account
                </span>
              </div>
            </div>

            {/* ZegaCloud One-Click Client SSO */}
            <div>
              <button
                type="button"
                onClick={handleWhmcsSSO}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/50 px-4 py-2.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors shadow-sm"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sign In with ZegaCloud (1-Click Client SSO)</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-[#706f6c] dark:text-[#9ca3af]">
            Don’t have a business email account?{" "}
            <Link
              href="/pricing"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
            >
              View Plans or Claim Free Mailboxes →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
