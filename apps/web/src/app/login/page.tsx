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
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ZegaLogo } from "@/components/ZegaLogo";
import { validateEmail, validatePassword } from "@/lib/validation";
import { FormField } from "@/components/ui/FormField";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLaunching, setIsDemoLaunching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Field validation states
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);

  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password, 6);

  const isEmailValid = touchedEmail && emailValidation.isValid;
  const emailError = touchedEmail && !emailValidation.isValid ? emailValidation.error : null;

  const isPasswordValid = touchedPassword && passwordValidation.isValid;
  const passwordError = touchedPassword && !passwordValidation.isValid ? passwordValidation.error : null;

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

  const handleLaunchDemo = async () => {
    setIsLoading(true);
    setIsDemoLaunching(true);
    setErrorMessage("");
    setSuccessMessage("Launching interactive demo workspace…");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "alex@acmedesign.co", password: "SalesDemo#2026" }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/app?demo=true");
      } else {
        // Fallback demo redirect
        router.push("/app?demo=true");
      }
    } catch {
      router.push("/app?demo=true");
    }
  };

  const handleAutofillDemo = () => {
    setEmail("alex@acmedesign.co");
    setPassword("SalesDemo#2026");
    setTouchedEmail(true);
    setTouchedPassword(true);
    setErrorMessage("");
    setSuccessMessage('Loaded demo credentials (alex@acmedesign.co). Click "Sign In to Webmail" to continue.');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedEmail(true);
    setTouchedPassword(true);

    const emailCheck = validateEmail(email);
    const passCheck = validatePassword(password, 6);

    if (!emailCheck.isValid) {
      setErrorMessage(emailCheck.error || "Please enter a valid work email address.");
      return;
    }

    if (!passCheck.isValid) {
      setErrorMessage(passCheck.error || "Please enter your password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailCheck.value, password: passCheck.value }),
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
        body: JSON.stringify({ email: email || "alex@acmedesign.co" }),
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

          {/* 1-Click Interactive Demo Card */}
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 dark:text-blue-300">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Interactive Live Demo</span>
              </div>
              <span className="text-[10px] bg-white dark:bg-[#161a25] text-blue-700 dark:text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                Instant 1-Click
              </span>
            </div>

            <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
              Explore the full webmail workspace, cold outreach campaigns, AI copy studio, contacts, lists, and mobile sync with preloaded sample data.
            </p>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleLaunchDemo}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer disabled:opacity-50"
            >
              {isDemoLaunching ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Launching Demo Mailbox…</span>
                </>
              ) : (
                <>
                  <span>Launch Demo Mailbox (alex@acmedesign.co)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>

            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={handleAutofillDemo}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Or autofill credentials into form below
              </button>
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
              <FormField
                id="email"
                label="Work Email Address"
                required
                error={emailError}
                isValid={isEmailValid}
                helperText={!emailError ? "Use your company domain (e.g. you@acmepreferred.com)" : undefined}
              >
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!touchedEmail) setTouchedEmail(true);
                  }}
                  onBlur={() => setTouchedEmail(true)}
                  placeholder="you@company.com"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-[#121212] dark:text-white placeholder-neutral-400 focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 transition-colors ${
                    emailError
                      ? "border-rose-400 bg-rose-50/20 focus-visible:ring-rose-500"
                      : isEmailValid
                      ? "border-emerald-500/70 bg-emerald-50/10 focus-visible:ring-emerald-500"
                      : "border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] focus-visible:ring-neutral-900"
                  }`}
                />
              </FormField>

              <FormField
                id="password"
                label="Password"
                required
                error={passwordError}
                isValid={isPasswordValid}
                helperText={!passwordError ? "Must be at least 6 characters" : undefined}
              >
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (!touchedPassword) setTouchedPassword(true);
                    }}
                    onBlur={() => setTouchedPassword(true)}
                    placeholder="••••••••••••"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-[#121212] dark:text-white placeholder-neutral-400 focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 transition-colors font-mono pr-10 ${
                      passwordError
                        ? "border-rose-400 bg-rose-50/20 focus-visible:ring-rose-500"
                        : isPasswordValid
                        ? "border-emerald-500/70 bg-emerald-50/10 focus-visible:ring-emerald-500"
                        : "border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] focus-visible:ring-neutral-900"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-2.5 text-[#706f6c] dark:text-[#9ca3af] hover:text-[#121212] dark:hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#121212] dark:bg-white px-4 py-2.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 cursor-pointer"
              >
                {isLoading && !isDemoLaunching ? (
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/50 px-4 py-2.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors shadow-sm cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sign In with ZegaCloud Account</span>
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
