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

  // Sandbox OAuth Simulator Modal State
  const [sandboxProvider, setSandboxProvider] = useState<"google" | "github" | null>(null);
  const [sandboxEmail, setSandboxEmail] = useState("alex.founder@zegacloud.com");
  const [sandboxName, setSandboxName] = useState("Alex Founder");
  const [isSandboxSubmitting, setIsSandboxSubmitting] = useState(false);

  // Detect query params for sandbox or errors
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sandboxParam = params.get("oauth_sandbox");
      if (sandboxParam === "google" || sandboxParam === "github") {
        setSandboxProvider(sandboxParam);
      }
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

  const handleOAuthClick = (provider: "google" | "github") => {
    window.location.href = `/api/auth/${provider}`;
  };

  const handleSandboxLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxEmail.trim()) return;

    setIsSandboxSubmitting(true);
    try {
      const res = await fetch("/api/auth/oauth-sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: sandboxProvider,
          name: sandboxName.trim() || sandboxEmail.split("@")[0],
          email: sandboxEmail.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSandboxProvider(null);
        router.push(data.redirectUrl || "/app");
      } else {
        setErrorMessage(data.error || "OAuth sandbox error.");
        setIsSandboxSubmitting(false);
      }
    } catch (err) {
      setErrorMessage("Sandbox connection error.");
      setIsSandboxSubmitting(false);
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
                  Or continue with
                </span>
              </div>
            </div>

            {/* Real OAuth Providers (Google, GitHub, WHMCS SSO) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleOAuthClick("google")}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#161a25] px-4 py-2.5 text-xs font-medium text-[#121212] dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <img src="/branding/google-icon.svg" alt="Google" className="h-4 w-4" />
                <span>Sign in with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthClick("github")}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#161a25] px-4 py-2.5 text-xs font-medium text-[#121212] dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>Sign in with GitHub</span>
              </button>

              <button
                type="button"
                onClick={handleWhmcsSSO}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 px-4 py-2.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors shadow-sm"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>ZegaCloud One-Click Client SSO</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-[#706f6c] dark:text-[#9ca3af]">
            Don’t have a business email account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#121212] dark:text-white hover:underline underline-offset-2"
            >
              Start free with your domain →
            </Link>
          </div>
        </div>
      </main>

      {/* Developer Sandbox OAuth Simulator Modal */}
      {sandboxProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                {sandboxProvider === "google" ? (
                  <img src="/branding/google-icon.svg" alt="Google" className="h-4 w-4" />
                ) : (
                  <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                <h3 className="text-xs font-bold text-[#121212] dark:text-white capitalize">
                  {sandboxProvider} OAuth Simulator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSandboxProvider(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 p-2.5 text-[11px] text-blue-900 dark:text-blue-300">
              To connect real live Google/GitHub accounts, set <code>GOOGLE_CLIENT_ID</code> or <code>GITHUB_CLIENT_ID</code> in <code>.env.local</code>.
            </div>

            <form onSubmit={handleSandboxLogin} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Profile Name
                </label>
                <input
                  type="text"
                  required
                  value={sandboxName}
                  onChange={(e) => setSandboxName(e.target.value)}
                  className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] px-3 py-1.5 text-xs text-[#121212] dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Verified Email
                </label>
                <input
                  type="email"
                  required
                  value={sandboxEmail}
                  onChange={(e) => setSandboxEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] px-3 py-1.5 text-xs text-[#121212] dark:text-white font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSandboxSubmitting}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSandboxSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Sign In as {sandboxProvider === "google" ? "Google" : "GitHub"} User</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
