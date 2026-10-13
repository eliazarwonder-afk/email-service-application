"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2, ArrowRight, ShieldCheck, Globe, Sparkles, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ZegaLogo } from "@/components/ZegaLogo";

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [domainName, setDomainName] = useState("");
  const [domainType, setDomainType] = useState<"existing" | "zegacloud" | "sandbox">("existing");
  const [password, setPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"free" | "starter" | "growth" | "pro">("growth");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      if (!fullName || !email || !companyName || !password) {
        setErrorMessage("Please complete all account fields before continuing.");
        return;
      }
      setErrorMessage("");
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          companyName,
          domainName,
          domainType,
          plan: selectedPlan,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to create account. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage("Workspace created and registered in database! Provisioning mailboxes…");
      setTimeout(() => {
        router.push("/app");
      }, 900);
    } catch (err: any) {
      setErrorMessage("Network error connecting to database. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-[#090a0f] text-[#121212] dark:text-[#f3f4f6] transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Header with ZegaMail Logo */}
          <div className="text-center space-y-3 flex flex-col items-center">
            <ZegaLogo variant="full" className="mx-auto" />
            <p className="text-xs text-[#706f6c] dark:text-[#9ca3af]">
              Step {step} of 2 • 14-day free trial on all paid plans with instant activation.
            </p>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center justify-center gap-3">
            <div
              className={`h-1.5 w-16 rounded-full transition-colors ${
                step >= 1 ? "bg-[#121212] dark:bg-white" : "bg-neutral-200 dark:bg-neutral-800"
              }`}
            />
            <div
              className={`h-1.5 w-16 rounded-full transition-colors ${
                step >= 2 ? "bg-[#121212] dark:bg-white" : "bg-neutral-200 dark:bg-neutral-800"
              }`}
            />
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-semibold text-[#121212] dark:text-white"
                    >
                      Your Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] px-3.5 py-2.5 text-xs text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-[#121212] dark:text-white"
                    >
                      Your Work Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="s.jenkins@mycompany.com"
                      className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] px-3.5 py-2.5 text-xs text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="companyName"
                      className="block text-xs font-semibold text-[#121212] dark:text-white"
                    >
                      Company / Organization Name
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Creative Studio Ltd"
                      className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] px-3.5 py-2.5 text-xs text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-[#121212] dark:text-white"
                    >
                      Choose Account Master Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] px-3.5 py-2.5 text-xs text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 transition-colors font-mono"
                    />
                    <p className="text-[11px] text-[#706f6c] dark:text-[#9ca3af]">
                      Secures your Zega Mail organization and admin console.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#121212] dark:bg-white px-4 py-2.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                  >
                    <span>Continue to Domain Setup</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-[#121212] dark:text-white">
                      How would you like to set up your domain?
                    </label>

                    <div className="space-y-2">
                      <div
                        onClick={() => setDomainType("existing")}
                        className={`p-3 rounded-xl border cursor-pointer transition-colors text-xs flex items-start gap-2.5 ${
                          domainType === "existing"
                            ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-[#181d28]"
                            : "border-[#eaeaea] dark:border-[#202636] hover:bg-neutral-50 dark:hover:bg-[#161a25]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="domainType"
                          checked={domainType === "existing"}
                          onChange={() => setDomainType("existing")}
                          className="mt-0.5 text-neutral-900 focus:ring-neutral-900"
                        />
                        <div>
                          <p className="font-semibold text-[#121212] dark:text-white">
                            I already own a custom domain
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            Registered with GoDaddy, Namecheap, Cloudflare, etc.
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => setDomainType("zegacloud")}
                        className={`p-3 rounded-xl border cursor-pointer transition-colors text-xs flex items-start gap-2.5 ${
                          domainType === "zegacloud"
                            ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-[#181d28]"
                            : "border-[#eaeaea] dark:border-[#202636] hover:bg-neutral-50 dark:hover:bg-[#161a25]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="domainType"
                          checked={domainType === "zegacloud"}
                          onChange={() => setDomainType("zegacloud")}
                          className="mt-0.5 text-neutral-900 focus:ring-neutral-900"
                        />
                        <div>
                          <p className="font-semibold text-[#121212] dark:text-white flex items-center gap-1.5">
                            <span>Register new domain via ZegaCloud DNS</span>
                            <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-1.5">
                              2 Free Mailboxes
                            </span>
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            Provisioned automatically under your ZegaCloud organization with 1-click DNS configuration.
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => setDomainType("sandbox")}
                        className={`p-3 rounded-xl border cursor-pointer transition-colors text-xs flex items-start gap-2.5 ${
                          domainType === "sandbox"
                            ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-[#181d28]"
                            : "border-[#eaeaea] dark:border-[#202636] hover:bg-neutral-50 dark:hover:bg-[#161a25]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="domainType"
                          checked={domainType === "sandbox"}
                          onChange={() => setDomainType("sandbox")}
                          className="mt-0.5 text-neutral-900 focus:ring-neutral-900"
                        />
                        <div>
                          <p className="font-semibold text-[#121212] dark:text-white">
                            Instant Test Sandbox (`@zegamail.net`)
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            Zero DNS setup needed. Try out webmail immediately.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="domainName"
                      className="block text-xs font-semibold text-[#121212] dark:text-white"
                    >
                      {domainType === "sandbox"
                        ? "Desired Sandbox Prefix"
                        : "Your Business Domain"}
                    </label>
                    <div className="flex">
                      <input
                        id="domainName"
                        type="text"
                        required
                        value={domainName}
                        onChange={(e) => setDomainName(e.target.value)}
                        placeholder={
                          domainType === "sandbox" ? "mybusiness" : "mybusiness.com"
                        }
                        className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] px-3.5 py-2.5 text-xs text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 transition-colors font-mono"
                      />
                      {domainType === "sandbox" && (
                        <span className="inline-flex items-center px-3 border border-l-0 border-[#eaeaea] dark:border-[#202636] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-mono rounded-r-lg">
                          .zegamail.net
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#161a25] px-3.5 py-2.5 text-xs font-medium text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#121212] dark:bg-white px-4 py-2.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                    >
                      {isSubmitting ? (
                        <span>Registering in Database & Provisioning…</span>
                      ) : (
                        <>
                          <span>Create Workspace & Open Webmail</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
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
