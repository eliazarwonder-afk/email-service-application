"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  Search,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  Phone,
  Hash,
  Sparkles,
  Server,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { UnifiedPaymentCheckoutModal } from "@/components/billing/UnifiedPaymentCheckoutModal";
import { useCurrency } from "@/components/CurrencyProvider";
import {
  validateDomain,
  validateFullName,
  validatePhone,
  validateCacNumber,
} from "@/lib/validation";
import { FormField } from "@/components/ui/FormField";

interface DomainSearchResult {
  domain: string;
  status: "available" | "unavailable";
  priceUsd: number;
  priceNgn: number;
  tld: string;
}

export default function DomainOnboardingPage() {
  const router = useRouter();
  const { currency } = useCurrency();

  // User & Organization State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Optional Profile Fields
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cacNumber, setCacNumber] = useState("");
  const [showOptionalProfile, setShowOptionalProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Domain Path: "zegacloud" (Register New) | "existing" (Connect Own) | "sandbox" (Instant Test)
  const [domainPath, setDomainPath] = useState<"zegacloud" | "existing" | "sandbox">("zegacloud");

  // Search State for Path 1 (Register via ZegaCloud WHMCS)
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchPrimary, setSearchPrimary] = useState<DomainSearchResult | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<DomainSearchResult[]>([]);
  const [selectedDomainToRegister, setSelectedDomainToRegister] = useState<DomainSearchResult | null>(null);

  // Existing Domain State for Path 2
  const [existingDomainInput, setExistingDomainInput] = useState("");
  const [existingDnsRecords, setExistingDnsRecords] = useState<any[] | null>(null);
  const [isCheckingDns, setIsCheckingDns] = useState(false);
  const [dnsVerifiedSuccess, setDnsVerifiedSuccess] = useState(false);
  const [copiedRecord, setCopiedRecord] = useState<string | null>(null);

  // Sandbox State for Path 3
  const [sandboxPrefix, setSandboxPrefix] = useState("");
  const [isProvisioningSandbox, setIsProvisioningSandbox] = useState(false);

  // Field validation error states
  const [searchDomainError, setSearchDomainError] = useState("");
  const [existingDomainError, setExistingDomainError] = useState("");
  const [sandboxPrefixError, setSandboxPrefixError] = useState("");
  const [companyNameError, setCompanyNameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [cacNumberError, setCacNumberError] = useState("");

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanForDomain, setSelectedPlanForDomain] = useState<"starter" | "growth" | "pro">("starter");

  // Load session user
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          if (data.user.companyName) setCompanyName(data.user.companyName);
          if (data.user.phoneNumber) setPhoneNumber(data.user.phoneNumber);
          if (data.user.cacNumber) setCacNumber(data.user.cacNumber);
          if (data.user.name) {
            const prefix = data.user.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            setSearchQuery(prefix + "brand.com");
            setSandboxPrefix(prefix);
          }
        } else {
          // If unauthenticated, redirect to login
          router.push("/login?redirect=/onboarding/domain");
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setIsLoadingUser(false);
      }
    }
    loadUser();
  }, [router]);

  // Handle Domain Search (WHMCS Integration)
  const handleDomainSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchDomainError("");
    if (!searchQuery.trim()) return;

    let q = searchQuery.trim().toLowerCase().replace(/^[a-z]+:\/\//i, "").replace(/\/.*$/, "");
    if (!q.includes(".")) q = q + ".com";

    const domCheck = validateDomain(q);
    if (!domCheck.isValid) {
      setSearchDomainError(domCheck.error || "Please enter a valid domain name.");
      return;
    }

    setIsSearching(true);
    setSearchPrimary(null);
    setSelectedDomainToRegister(null);

    try {
      const res = await fetch(`/api/domains/search?domain=${encodeURIComponent(domCheck.value)}`);
      const data = await res.json();

      if (data.success && data.primary) {
        setSearchPrimary(data.primary);
        setSearchSuggestions(data.suggestions || []);
        if (data.primary.status === "available") {
          setSelectedDomainToRegister(data.primary);
        }
      } else {
        setSearchDomainError(data.error || "Domain lookup failed.");
      }
    } catch (err) {
      setSearchDomainError("Network error while querying domain.");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Existing Domain DNS Generation
  const handleGenerateDns = (e: React.FormEvent) => {
    e.preventDefault();
    setExistingDomainError("");
    if (!existingDomainInput.trim()) return;

    const domCheck = validateDomain(existingDomainInput);
    if (!domCheck.isValid) {
      setExistingDomainError(domCheck.error || "Please enter a valid existing business domain.");
      return;
    }

    const domain = domCheck.value;
    const records = [
      { type: "MX", host: "@", value: `mail.${domain}`, priority: 10, status: "pending" },
      { type: "TXT", host: "@", value: "v=spf1 include:spf.zegacloud.com ~all", status: "pending" },
      { type: "TXT", host: `default._domainkey.${domain}`, value: "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0...", status: "pending" },
      { type: "CNAME", host: "webmail", value: "mail.zegacloud.com", status: "pending" },
    ];
    setExistingDnsRecords(records);
  };

  // Handle Verify Existing DNS
  const handleVerifyDns = async () => {
    setIsCheckingDns(true);
    try {
      // Create domain in database
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainName: existingDomainInput.trim().toLowerCase(),
          domainType: "existing",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDnsVerifiedSuccess(true);
        setTimeout(() => {
          router.push("/app");
        }, 1200);
      }
    } catch (err) {
      console.error("DNS verification error:", err);
    } finally {
      setIsCheckingDns(false);
    }
  };

  // Handle Sandbox Instant Provisioning
  const handleProvisionSandbox = async () => {
    setSandboxPrefixError("");
    const cleanPrefix = (sandboxPrefix.trim().toLowerCase() || "demo").replace(/[^a-z0-9_-]/g, "");

    if (cleanPrefix.length < 2 || cleanPrefix.length > 30) {
      setSandboxPrefixError("Subdomain prefix must be between 2 and 30 characters.");
      return;
    }

    setIsProvisioningSandbox(true);
    const domain = cleanPrefix + ".zegamail.net";
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainName: domain,
          domainType: "sandbox",
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/app");
      }
    } catch (err) {
      console.error("Sandbox provisioning error:", err);
      setIsProvisioningSandbox(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRecord(id);
    setTimeout(() => setCopiedRecord(null), 1500);
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] dark:bg-[#090a0f]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-xs text-[#706f6c] dark:text-[#9ca3af]">Initializing your onboarding session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-[#090a0f] text-[#121212] dark:text-[#f3f4f6] transition-colors">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Progress Stepper */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Step 2 of 2: Domain Setup & Infrastructure</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121212] dark:text-white">
            Welcome to Zega Mail, {currentUser?.name || "Partner"}!
          </h1>
          <p className="text-xs sm:text-sm text-[#706f6c] dark:text-[#9ca3af] max-w-lg mx-auto">
            Your account is verified. Next, connect or register your business domain to activate your team mailboxes and delivery status ticks.
          </p>

          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Account Created
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
              <Globe className="h-4 w-4" /> Domain & Billing
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            <span className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Server className="h-4 w-4" /> Live Mailboxes
            </span>
          </div>
        </div>

        {/* Optional Business Details Collapsible */}
        <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#706f6c] dark:text-[#9ca3af]" />
              <span className="text-xs font-semibold text-[#121212] dark:text-white">
                Company & Tax Profile
              </span>
              <span className="text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                Optional
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowOptionalProfile(!showOptionalProfile)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {showOptionalProfile ? "Hide" : "+ Add company / CAC number"}
            </button>
          </div>

          {showOptionalProfile && (
            <div className="pt-2 border-t border-[#eaeaea] dark:border-[#202636] grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <Building2 className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Creative Ltd"
                    className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] pl-8 pr-3 py-1.5 text-xs text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                  Official Phone Number
                </label>
                <div className="relative">
                  <Phone className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +234 803 123 4567"
                    className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] pl-8 pr-3 py-1.5 text-xs text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                  CAC / Business Reg Number
                </label>
                <div className="relative">
                  <Hash className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={cacNumber}
                    onChange={(e) => setCacNumber(e.target.value)}
                    placeholder="RC-1948201 / BN-90214"
                    className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] pl-8 pr-3 py-1.5 text-xs text-[#121212] dark:text-white focus:bg-white dark:focus:bg-[#1a202d]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setDomainPath("zegacloud")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              domainPath === "zegacloud"
                ? "border-blue-600 bg-white dark:bg-[#161a25] ring-2 ring-blue-500/20 shadow-sm"
                : "border-[#eaeaea] dark:border-[#202636] bg-white/70 dark:bg-[#12151e] hover:border-neutral-300 dark:hover:border-neutral-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Globe className="h-4 w-4" />
              </span>
              <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                Recommended
              </span>
            </div>
            <h3 className="text-xs font-bold text-[#121212] dark:text-white">
              Register New via ZegaCloud
            </h3>
            <p className="text-[11px] text-[#706f6c] dark:text-[#9ca3af] mt-1">
              Automated domain search & instant DNS provisioning with 1-click checkout.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setDomainPath("existing")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              domainPath === "existing"
                ? "border-blue-600 bg-white dark:bg-[#161a25] ring-2 ring-blue-500/20 shadow-sm"
                : "border-[#eaeaea] dark:border-[#202636] bg-white/70 dark:bg-[#12151e] hover:border-neutral-300 dark:hover:border-neutral-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                <Server className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-mono text-neutral-500">GoDaddy / Namecheap</span>
            </div>
            <h3 className="text-xs font-bold text-[#121212] dark:text-white">
              Connect Existing Domain
            </h3>
            <p className="text-[11px] text-[#706f6c] dark:text-[#9ca3af] mt-1">
              Keep your existing registrar and verify MX, SPF & DKIM DNS records.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setDomainPath("sandbox")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              domainPath === "sandbox"
                ? "border-blue-600 bg-white dark:bg-[#161a25] ring-2 ring-blue-500/20 shadow-sm"
                : "border-[#eaeaea] dark:border-[#202636] bg-white/70 dark:bg-[#12151e] hover:border-neutral-300 dark:hover:border-neutral-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5">
                Instant Sandbox
              </span>
            </div>
            <h3 className="text-xs font-bold text-[#121212] dark:text-white">
              Instant @zegamail.net
            </h3>
            <p className="text-[11px] text-[#706f6c] dark:text-[#9ca3af] mt-1">
              Zero DNS propagation or payment needed. Instant testing mailbox.
            </p>
          </button>
        </div>

        {/* Tab 1 Content: WHMCS Domain Search */}
        {domainPath === "zegacloud" && (
          <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-6 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#121212] dark:text-white flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-600" />
                <span>Search Domain Availability</span>
              </h2>
              <p className="text-xs text-[#706f6c] dark:text-[#9ca3af]">
                Check real-time availability across global and Nigerian TLDs (.com, .ng, .com.ng, .org).
              </p>
            </div>

            <form onSubmit={handleDomainSearch} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (searchDomainError) setSearchDomainError("");
                    }}
                    placeholder="e.g. acmeglobal.com or mycompany.ng"
                    className={`w-full rounded-xl border pl-9 pr-4 py-2.5 text-xs text-[#121212] dark:text-white font-mono focus:bg-white dark:focus:bg-[#1a202d] focus-visible:outline-none focus-visible:ring-2 ${
                      searchDomainError
                        ? "border-rose-400 bg-rose-50/20 focus-visible:ring-rose-500"
                        : "border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] focus-visible:ring-blue-600"
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#121212] dark:bg-white px-5 py-2.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Checking availability…</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-3.5 w-3.5" />
                      <span>Search Domain</span>
                    </>
                  )}
                </button>
              </div>

              {searchDomainError && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{searchDomainError}</span>
                </p>
              )}
            </form>

            {/* Primary Search Result */}
            {searchPrimary && (
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  searchPrimary.status === "available"
                    ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30"
                    : "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {searchPrimary.status === "available" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className="font-mono text-sm font-bold text-[#121212] dark:text-white">
                      {searchPrimary.domain}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        searchPrimary.status === "available"
                          ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300"
                          : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300"
                      }`}
                    >
                      {searchPrimary.status === "available" ? "AVAILABLE" : "UNAVAILABLE"}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#706f6c] dark:text-[#9ca3af]">
                    {searchPrimary.status === "available"
                      ? "Ready for instant automated provisioning via ZegaCloud DNS."
                      : "This domain is already registered. Try an alternative extension below."}
                  </p>
                </div>

                {searchPrimary.status === "available" && (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#121212] dark:text-white">
                        {currency === "NGN"
                          ? `₦${searchPrimary.priceNgn.toLocaleString()}`
                          : `$${searchPrimary.priceUsd.toFixed(2)}`}
                      </span>
                      <span className="text-[10px] text-neutral-500 block">/ first year</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDomainToRegister(searchPrimary);
                        setIsCheckoutOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <span>Select & Proceed to Billing</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Suggestions Table */}
            {searchSuggestions.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-semibold text-[#706f6c] dark:text-[#9ca3af]">
                  Alternative TLD Suggestions:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchSuggestions.map((sug) => (
                    <div
                      key={sug.domain}
                      className="p-3 rounded-xl border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-mono font-semibold text-[#121212] dark:text-white">
                          {sug.domain}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Available • Instant Setup
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#121212] dark:text-white">
                          {currency === "NGN"
                            ? `₦${sug.priceNgn.toLocaleString()}`
                            : `$${sug.priceUsd.toFixed(2)}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDomainToRegister(sug);
                            setIsCheckoutOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-[#121212] dark:bg-white text-white dark:text-[#121212] text-[11px] font-semibold hover:opacity-90"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2 Content: Connect Existing Domain */}
        {domainPath === "existing" && (
          <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-6 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#121212] dark:text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                <span>Connect Your Existing Domain DNS Records</span>
              </h2>
              <p className="text-xs text-[#706f6c] dark:text-[#9ca3af]">
                Enter your existing domain to retrieve the required Exim/Dovecot MX, SPF, DKIM and CNAME records.
              </p>
            </div>

            <form onSubmit={handleGenerateDns} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={existingDomainInput}
                  onChange={(e) => {
                    setExistingDomainInput(e.target.value);
                    if (existingDomainError) setExistingDomainError("");
                  }}
                  placeholder="e.g. acmebrand.com"
                  required
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-xs text-[#121212] dark:text-white font-mono focus:bg-white dark:focus:bg-[#1a202d] outline-none focus:ring-2 transition-colors ${
                    existingDomainError
                      ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500"
                      : "border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] focus:ring-blue-600"
                  }`}
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#121212] dark:bg-white px-5 py-2.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0"
                >
                  <span>Generate DNS Records</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {existingDomainError && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{existingDomainError}</span>
                </p>
              )}
            </form>

            {existingDnsRecords && (
              <div className="space-y-4 pt-2">
                <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 p-3 text-xs text-blue-900 dark:text-blue-300">
                  Add these 4 DNS records at your current registrar (Cloudflare, GoDaddy, Namecheap, etc.):
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#eaeaea] dark:border-[#202636]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf9f6] dark:bg-[#161a25] border-b border-[#eaeaea] dark:border-[#202636] text-[#706f6c] dark:text-[#9ca3af]">
                      <tr>
                        <th className="p-2.5 font-semibold">Type</th>
                        <th className="p-2.5 font-semibold">Host / Name</th>
                        <th className="p-2.5 font-semibold">Value / Target</th>
                        <th className="p-2.5 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaeaea] dark:divide-[#202636] font-mono text-[11px]">
                      {existingDnsRecords.map((rec, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                          <td className="p-2.5 font-bold text-blue-600">{rec.type}</td>
                          <td className="p-2.5 truncate max-w-[120px]">{rec.host}</td>
                          <td className="p-2.5 truncate max-w-[280px] text-neutral-600 dark:text-neutral-400">
                            {rec.value}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(rec.value, `dns_${idx}`)}
                              className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500"
                            >
                              {copiedRecord === `dns_${idx}` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-[11px] text-[#706f6c] dark:text-[#9ca3af]">
                    DNS changes typically propagate within 5 to 15 minutes worldwide.
                  </p>

                  <button
                    type="button"
                    onClick={handleVerifyDns}
                    disabled={isCheckingDns || dnsVerifiedSuccess}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isCheckingDns ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Querying DNS Zones…</span>
                      </>
                    ) : dnsVerifiedSuccess ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Verified! Opening Webmail…</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Verify DNS & Activate Mailbox</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3 Content: Instant Sandbox */}
        {domainPath === "sandbox" && (
          <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-6 shadow-sm space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#121212] dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Instant Developer Sandbox Subdomain</span>
              </h2>
              <p className="text-xs text-[#706f6c] dark:text-[#9ca3af]">
                Try out the webmail interface, AI proposal writer, and delivery status ticks without purchasing or pointing a domain right now.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#121212] dark:text-white">
                Choose Sandbox Subdomain Prefix:
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={sandboxPrefix}
                  onChange={(e) => {
                    setSandboxPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""));
                    if (sandboxPrefixError) setSandboxPrefixError("");
                  }}
                  placeholder="mybrand"
                  className={`w-full rounded-l-xl border px-4 py-2.5 text-xs text-[#121212] dark:text-white font-mono focus:bg-white dark:focus:bg-[#1a202d] outline-none focus:ring-2 transition-colors ${
                    sandboxPrefixError
                      ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500"
                      : "border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] focus:ring-blue-600"
                  }`}
                />
                <span className="inline-flex items-center px-4 border border-l-0 border-[#eaeaea] dark:border-[#202636] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-mono rounded-r-xl">
                  .zegamail.net
                </span>
              </div>
              {sandboxPrefixError && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{sandboxPrefixError}</span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleProvisionSandbox}
              disabled={isProvisioningSandbox}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#121212] dark:bg-white px-5 py-2.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm disabled:opacity-50"
            >
              {isProvisioningSandbox ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Provisioning Instant Mailbox…</span>
                </>
              ) : (
                <>
                  <span>Launch Instant Test Environment</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </main>

      {/* Unified Payment Checkout Modal for Domain + Plan Purchase */}
      <UnifiedPaymentCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialPlan={selectedPlanForDomain}
        domainNameToRegister={selectedDomainToRegister?.domain}
        clientEmail={currentUser?.email}
        clientName={currentUser?.name}
      />
    </div>
  );
}
