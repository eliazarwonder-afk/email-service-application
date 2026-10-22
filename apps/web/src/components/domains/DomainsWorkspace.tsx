"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  Lock,
  ArrowRight,
  Server,
  Layers,
} from "lucide-react";
import { StoredDomain } from "@/lib/store";
import { validateDomain } from "@/lib/validation";

interface DomainsWorkspaceProps {
  initialDomains?: StoredDomain[];
  onMailboxOpen?: () => void;
}

export function DomainsWorkspace({ initialDomains = [], onMailboxOpen }: DomainsWorkspaceProps) {
  const [domains, setDomains] = useState<StoredDomain[]>(initialDomains);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"managed" | "search" | "connect">("managed");

  // Domain Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ fullDomain: string; tld: string; price: string; available: boolean }>
  >([]);
  const [registerSuccess, setRegisterSuccess] = useState("");

  // Connect Domain State
  const [connectDomainName, setConnectDomainName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDomain, setConnectedDomain] = useState<StoredDomain | null>(null);

  // Validation Errors
  const [searchDomainError, setSearchDomainError] = useState("");
  const [connectDomainError, setConnectDomainError] = useState("");

  // Copied DNS record state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadDomains = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/domains");
      const data = await res.json();
      if (data.success) {
        setDomains(data.domains || []);
      }
    } catch (err) {
      console.error("Load domains error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const handleSearchDomains = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchDomainError("");
    if (!searchQuery.trim()) return;

    let q = searchQuery.trim().toLowerCase().replace(/^[a-z]+:\/\//i, "").replace(/\/.*$/, "");
    if (!q.includes(".")) q = q + ".com";

    const domCheck = validateDomain(q);
    if (!domCheck.isValid) {
      setSearchDomainError(domCheck.error || "Please enter a valid domain to search.");
      return;
    }

    try {
      setIsSearching(true);
      setSearchResults([]);
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", domainName: domCheck.value }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results || []);
      }
    } catch (err) {
      setSearchDomainError("Network error while searching domain.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegisterDomain = async (domainName: string) => {
    try {
      setIsSearching(true);
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", domainName }),
      });
      const data = await res.json();
      if (data.success) {
        setRegisterSuccess(`Domain ${domainName} successfully registered!`);
        await loadDomains();
        setActiveTab("managed");
      }
    } catch (err) {
      console.error("Register error", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConnectDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectDomainError("");
    if (!connectDomainName.trim()) return;

    const domCheck = validateDomain(connectDomainName);
    if (!domCheck.isValid) {
      setConnectDomainError(domCheck.error || "Please enter a valid custom domain (e.g. acme.com).");
      return;
    }

    try {
      setIsConnecting(true);
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "connect",
          domainName: domCheck.value,
          domainType: "existing",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConnectedDomain(data.domain);
        await loadDomains();
      }
    } catch (err) {
      console.error("Connect error", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleVerifyDns = async (domainId: string) => {
    try {
      const res = await fetch("/api/domains", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId }),
      });
      const data = await res.json();
      if (data.success) {
        await loadDomains();
      }
    } catch (err) {
      console.error("Verify DNS error", err);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <main className="flex-1 p-3 sm:p-6 max-w-5xl mx-auto w-full space-y-4 sm:space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            Enterprise Domain & DNS Infrastructure
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
              Multi-Domain Active
            </span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your organization&apos;s verified business domains, instant TLD registration, and automated 2048-bit DNS authentication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDomains}
            title="Refresh domains"
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 text-xs font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Register Domain</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("managed")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === "managed"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
          }`}
        >
          Managed Domains ({domains.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === "search"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
          }`}
        >
          Search & Register New
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("connect")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === "connect"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
          }`}
        >
          Connect Existing Domain
        </button>
      </div>

      {registerSuccess && (
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{registerSuccess}</span>
        </div>
      )}

      {/* TAB 1: MANAGED DOMAINS LIST */}
      {activeTab === "managed" && (
        <div className="space-y-4">
          {domains.map((dom) => (
            <div
              key={dom.id}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#11141d] p-6 shadow-sm space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <span>{dom.domainName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {dom.domainType === "zegacloud" ? "ZegaCloud Direct" : "Custom Connected"}
                      </span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      Domain Record: #{dom.whmcsOrderId || "ZCL-DOM-90214"} • DNS Cluster: ZegaCloud Global Anycast
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {dom.verified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>All DNS Records Active</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleVerifyDns(dom.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Verify DNS Propagation</span>
                    </button>
                  )}
                </div>
              </div>

              {/* DNS Health Badges Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161a25]">
                  <p className="text-[10px] font-mono text-neutral-400 uppercase">MX Routing</p>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>mail.zegamail.com</span>
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">Priority 10</p>
                </div>

                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161a25]">
                  <p className="text-[10px] font-mono text-neutral-400 uppercase">SPF Policy</p>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>v=spf1 include…</span>
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">Hardened Anti-Spoof</p>
                </div>

                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161a25]">
                  <p className="text-[10px] font-mono text-neutral-400 uppercase">DKIM Signature</p>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5 flex items-center gap-1">
                    {dom.dkimStatus === "verified" ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span>2048-bit RSA Active</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        <span>Pending Check</span>
                      </>
                    )}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">default._domainkey</p>
                </div>

                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161a25]">
                  <p className="text-[10px] font-mono text-neutral-400 uppercase">DMARC Policy</p>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5 flex items-center gap-1">
                    {dom.dmarcStatus === "verified" ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span>p=quarantine</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        <span>Pending Check</span>
                      </>
                    )}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">_dmarc host</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: DOMAIN SEARCH & REGISTRATION */}
      {activeTab === "search" && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#11141d] p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Search & Register Business Domains
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Instantly register business domains directly through ZegaCloud with automatic DNS configuration.
            </p>
          </div>

          <form onSubmit={handleSearchDomains} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (searchDomainError) setSearchDomainError("");
                  }}
                  placeholder="Enter domain name (e.g. acmecreativestudio)"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-neutral-50/50 dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 font-medium transition-colors ${
                    searchDomainError
                      ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500"
                      : "border-neutral-200 dark:border-neutral-800 focus:ring-blue-500"
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
              >
                {isSearching ? "Searching…" : "Check Availability"}
              </button>
            </div>

            {searchDomainError && (
              <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{searchDomainError}</span>
              </p>
            )}
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Available Extensions & Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((res) => (
                  <div
                    key={res.fullDomain}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-[#161a25] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">
                        {res.fullDomain}
                      </p>
                      <p className="text-xs text-emerald-600 font-semibold font-mono mt-0.5">
                        {res.price} • Includes 2 Free Mailboxes Forever
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRegisterDomain(res.fullDomain)}
                      disabled={isSearching}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Register Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONNECT EXISTING DOMAIN */}
      {activeTab === "connect" && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#11141d] p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Connect Domain You Already Own
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Add any custom domain from your own registrar and route it to ZegaCloud mail infrastructure.
            </p>
          </div>

          <form onSubmit={handleConnectDomain} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={connectDomainName}
                onChange={(e) => {
                  setConnectDomainName(e.target.value);
                  if (connectDomainError) setConnectDomainError("");
                }}
                placeholder="e.g. mycompany.com"
                className={`flex-1 px-4 py-2.5 rounded-xl border bg-neutral-50/50 dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 font-medium transition-colors ${
                  connectDomainError
                    ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500"
                    : "border-neutral-200 dark:border-neutral-800 focus:ring-blue-500"
                }`}
              />
              <button
                type="submit"
                disabled={isConnecting || !connectDomainName.trim()}
                className="px-6 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold transition-all disabled:opacity-50 shrink-0"
              >
                {isConnecting ? "Adding…" : "Add Domain & View DNS"}
              </button>
            </div>

            {connectDomainError && (
              <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{connectDomainError}</span>
              </p>
            )}
          </form>

          {/* DNS Records Instruction Card */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#151924] p-5 space-y-4">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between">
              <span>Required DNS Records for Full Mail Routing</span>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                Copy to your DNS provider
              </span>
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              {[
                {
                  id: "mx",
                  type: "MX",
                  host: "@",
                  value: "mail.zegamail.com",
                  priority: "Priority: 10",
                },
                {
                  id: "spf",
                  type: "TXT",
                  host: "@",
                  value: "v=spf1 include:spf.zegamail.com ~all",
                  priority: "-",
                },
                {
                  id: "dkim",
                  type: "TXT",
                  host: "default._domainkey",
                  value:
                    "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA32X+ZegaCloud2026DKIMKey...",
                  priority: "-",
                },
                {
                  id: "dmarc",
                  type: "TXT",
                  host: "_dmarc",
                  value: "v=DMARC1; p=quarantine; sp=quarantine",
                  priority: "-",
                },
              ].map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-lg bg-white dark:bg-[#12151e] border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                        {rec.type}
                      </span>
                      <span className="text-neutral-500 font-semibold">{rec.host}</span>
                    </div>
                    <span className="text-neutral-900 dark:text-neutral-200 break-all text-[11px] sm:text-xs">
                      {rec.value}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(rec.value, rec.id)}
                    className="self-end sm:self-auto p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white shrink-0"
                    title="Copy record"
                  >
                    {copiedKey === rec.id ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
