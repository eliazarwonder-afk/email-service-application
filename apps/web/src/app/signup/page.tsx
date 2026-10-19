"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Globe,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Building2,
  Phone,
  Hash,
  Lock,
  User,
  KeyRound,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ZegaLogo } from "@/components/ZegaLogo";

export default function SignupPage() {
  const router = useRouter();

  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cacNumber, setCacNumber] = useState("");
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Verification Step State
  const [step, setStep] = useState<"register" | "verify">("register");
  const [verificationCode, setVerificationCode] = useState("");
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Submission & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Sandbox OAuth Modal State
  const [sandboxProvider, setSandboxProvider] = useState<"google" | "github" | null>(null);
  const [sandboxEmail, setSandboxEmail] = useState("");
  const [sandboxName, setSandboxName] = useState("");

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Initial Registration Submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          companyName: companyName.trim() || undefined,
          phoneNumber: phoneNumber.trim() || undefined,
          cacNumber: cacNumber.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to create account. Please check your details.");
        setIsSubmitting(false);
        return;
      }

      setStep("verify");
      setSuccessMessage(data.message || "Confirmation code dispatched to your email!");
      if (data.previewCode) {
        setPreviewCode(data.previewCode);
      }
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMessage("Could not connect to registration service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle 6-Digit Email Verification
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setErrorMessage("Please enter the 6-digit confirmation code.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: verificationCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Invalid code. Please recheck or click Resend.");
        setIsVerifying(false);
        return;
      }

      setSuccessMessage("Email confirmed! Redirecting to custom domain setup…");
      setTimeout(() => {
        router.push("/onboarding/domain");
      }, 900);
    } catch (err: any) {
      setErrorMessage("Verification service connection error. Please try again.");
      setIsVerifying(false);
    }
  };

  // Handle Resend Verification Code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage("A fresh 6-digit confirmation code has been sent!");
        if (data.previewCode) setPreviewCode(data.previewCode);
        setResendCooldown(60);
      } else {
        setErrorMessage(data.error || "Failed to resend code.");
      }
    } catch (err) {
      setErrorMessage("Error communicating with mail server.");
    }
  };

  // Handle OAuth initiation
  const handleOAuthClick = (provider: "google" | "github") => {
    // Navigate directly to OAuth route which checks credentials or opens sandbox
    window.location.href = `/api/auth/${provider}`;
  };

  // Handle Sandbox OAuth Simulation
  const handleSandboxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxEmail.trim()) return;

    setIsSubmitting(true);
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
        router.push(data.redirectUrl || "/onboarding/domain");
      } else {
        setErrorMessage(data.error || "Sandbox login failed.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setErrorMessage("Sandbox service error.");
      setIsSubmitting(false);
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
              {step === "register"
                ? "Create your business email account. No credit card required to start."
                : `Enter the 6-digit confirmation code sent to ${email}`}
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-2">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                step === "register"
                  ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
              }`}
            >
              1. Account Creation
            </span>
            <span className="text-neutral-400">→</span>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                step === "verify"
                  ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
              }`}
            >
              2. Email Confirmation
            </span>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-6 shadow-sm space-y-5">
            {errorMessage && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 p-2.5 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* STEP 1: REGISTRATION FORM */}
            {step === "register" && (
              <>
                {/* Social One-Click Sign Up Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleOAuthClick("google")}
                    className="w-full inline-flex items-center justify-center gap-2.5 rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#161a25] px-4 py-2.5 text-xs font-medium text-[#121212] dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    <img src="/branding/google-icon.svg" alt="Google" className="h-4 w-4" />
                    <span>Sign up with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthClick("github")}
                    className="w-full inline-flex items-center justify-center gap-2.5 rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#161a25] px-4 py-2.5 text-xs font-medium text-[#121212] dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>Sign up with GitHub</span>
                  </button>
                </div>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#eaeaea] dark:border-[#202636]" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white dark:bg-[#12151e] px-2 text-[#706f6c] dark:text-[#9ca3af]">
                      Or register with work email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#121212] dark:text-white">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Tunde Adebayo"
                        className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] pl-9 pr-3.5 py-2.5 text-xs text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#121212] dark:text-white">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tunde@mycompany.ng"
                        className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] pl-9 pr-3.5 py-2.5 text-xs text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#121212] dark:text-white">
                      Create Password
                    </label>
                    <div className="relative">
                      <Lock className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] pl-9 pr-3.5 py-2.5 text-xs text-[#121212] dark:text-white font-mono focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                      />
                    </div>
                  </div>

                  {/* Optional Details Toggle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowOptionalFields(!showOptionalFields)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
                    >
                      <span>{showOptionalFields ? "Hide business details" : "+ Add company name & phone (Optional)"}</span>
                    </button>
                  </div>

                  {showOptionalFields && (
                    <div className="space-y-2.5 pt-2 border-t border-[#eaeaea] dark:border-[#202636]">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                          Company / Organization Name (Optional)
                        </label>
                        <div className="relative">
                          <Building2 className="h-3.5 w-3.5 absolute left-3 top-2.5 text-neutral-400" />
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. Adebayo Tech Ventures Ltd"
                            className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] pl-9 pr-3 py-2 text-xs text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="h-3.5 w-3.5 absolute left-3 top-2.5 text-neutral-400" />
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="+234 803 000 0000"
                              className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] pl-9 pr-3 py-2 text-xs text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                            CAC / Reg No.
                          </label>
                          <div className="relative">
                            <Hash className="h-3.5 w-3.5 absolute left-3 top-2.5 text-neutral-400" />
                            <input
                              type="text"
                              value={cacNumber}
                              onChange={(e) => setCacNumber(e.target.value)}
                              placeholder="RC-1234567"
                              className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] pl-9 pr-3 py-2 text-xs text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#121212] dark:bg-white px-4 py-2.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition-colors shadow-sm mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Sending confirmation code…</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account & Verify Email</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* STEP 2: EMAIL CONFIRMATION CODE */}
            {step === "verify" && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="text-center space-y-1.5 pb-1">
                  <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#121212] dark:text-white">
                    Confirm your email address
                  </h3>
                  <p className="text-xs text-[#706f6c] dark:text-[#9ca3af]">
                    We sent a 6-digit confirmation code to <span className="font-semibold text-[#121212] dark:text-white">{email}</span>
                  </p>
                </div>

                {previewCode && (
                  <div className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 text-[11px] text-blue-900 dark:text-blue-300 flex items-center justify-between">
                    <span>Dev Preview Code: <strong className="font-mono text-xs">{previewCode}</strong></span>
                    <button
                      type="button"
                      onClick={() => setVerificationCode(previewCode)}
                      className="text-[10px] underline hover:no-underline font-semibold"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-center text-[#121212] dark:text-white">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.5em] font-mono text-xl py-2.5 rounded-xl border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d] focus-visible:ring-2 focus-visible:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || verificationCode.length < 6}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#121212] dark:bg-white px-4 py-2.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Verifying code…</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Proceed to Domain Setup</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep("register")}
                    className="text-[#706f6c] dark:text-[#9ca3af] hover:text-[#121212] dark:hover:text-white"
                  >
                    ← Edit email
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleResendCode}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="text-center text-xs text-[#706f6c] dark:text-[#9ca3af]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#121212] dark:text-white hover:underline underline-offset-2"
            >
              Sign in to your webmail →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
