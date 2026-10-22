"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ZegaLogo } from "@/components/ZegaLogo";
import {
  Code,
  Terminal,
  Shield,
  Layers,
  Copy,
  Check,
  Play,
  ArrowRight,
  ExternalLink,
  Server,
  Zap,
  CheckCircle2,
  RefreshCw,
  Cpu,
} from "lucide-react";

interface ApiEndpoint {
  id: string;
  method: "GET" | "POST" | "PATCH";
  path: string;
  title: string;
  category: string;
  auth: "Public" | "Session Cookie" | "Bearer / Cron Token" | "WHMCS Secret / HMAC";
  description: string;
  sampleBody?: string;
  sampleCurl: string;
  sampleFetch: string;
  testParams?: Record<string, string>;
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    id: "health",
    method: "GET",
    path: "/api/health",
    title: "System Health Probe",
    category: "System & Reliability",
    auth: "Public",
    description: "Lightweight zero-overhead health check utilized by Docker, Coolify Sentinel, and load balancers to ensure service uptime.",
    sampleCurl: "curl -X GET https://mail.zegacloud.com/api/health",
    sampleFetch: `fetch('/api/health')\n  .then(r => r.json())\n  .then(console.log);`,
  },
  {
    id: "auth-login",
    method: "POST",
    path: "/api/auth/login",
    title: "Authenticate & Session Token",
    category: "Authentication",
    auth: "Public",
    description: "Authenticates organization users, applies brute-force rate-limiting, and issues an HttpOnly SameSite=Lax session cookie.",
    sampleBody: JSON.stringify({ email: "owner@zegacloud.com", password: "password123" }, null, 2),
    sampleCurl: `curl -X POST https://mail.zegacloud.com/api/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d '{"email":"owner@zegacloud.com","password":"password123"}'`,
    sampleFetch: `fetch('/api/auth/login', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ email: 'owner@zegacloud.com', password: 'password123' })\n}).then(r => r.json());`,
  },
  {
    id: "mail-send",
    method: "POST",
    path: "/api/mail",
    title: "Dispatch Email via cPanel Exim Bridge",
    category: "Mail Transport",
    auth: "Session Cookie",
    description: "Dispatches live outbound mail via direct TLS 1.3 cPanel SMTP with RFC 3461 DSN delivery notification acknowledgement (250 OK).",
    sampleBody: JSON.stringify(
      {
        to: "recipient@company.com",
        subject: "Contract Agreement & Next Steps",
        content: "Hello team, please find our verified cloud agreement attached.",
        isHtml: false,
      },
      null,
      2
    ),
    sampleCurl: `curl -X POST https://mail.zegacloud.com/api/mail \\\n  -H "Content-Type: application/json" \\\n  --cookie "zega_session=ses_YOUR_TOKEN" \\\n  -d '{"to":"recipient@company.com","subject":"Hello","content":"Meeting at 2pm"}'`,
    sampleFetch: `fetch('/api/mail', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ to: 'recipient@company.com', subject: 'Hello', content: 'Meeting at 2pm' })\n});`,
  },
  {
    id: "mail-list",
    method: "GET",
    path: "/api/mail?folder=inbox",
    title: "Query Inbound & Outbound Messages",
    category: "Mail Transport",
    auth: "Session Cookie",
    description: "Retrieves mailbox messages with RFC 3461 delivery status ticks (sent, delivered, bounced), attachment manifests, and custom folder classification.",
    sampleCurl: `curl -X GET "https://mail.zegacloud.com/api/mail?folder=inbox" \\\n  --cookie "zega_session=ses_YOUR_TOKEN"`,
    sampleFetch: `fetch('/api/mail?folder=inbox').then(r => r.json());`,
  },
  {
    id: "billing-checkout",
    method: "POST",
    path: "/api/billing/checkout",
    title: "Create Subscription Order & Crypto Invoice",
    category: "Billing & Cryptocurrency",
    auth: "Session Cookie",
    description: "Creates a WHMCS billing order for Starter, Growth, or Pro plans, generating high-precision receiving deposit addresses across TRON, BTC, ETH, and SOL.",
    sampleBody: JSON.stringify(
      {
        planId: "growth",
        billingCycle: "monthly",
        paymentMethod: "crypto_usdt_trc20",
      },
      null,
      2
    ),
    sampleCurl: `curl -X POST https://mail.zegacloud.com/api/billing/checkout \\\n  -H "Content-Type: application/json" \\\n  --cookie "zega_session=ses_YOUR_TOKEN" \\\n  -d '{"planId":"growth","billingCycle":"monthly","paymentMethod":"crypto_usdt_trc20"}'`,
    sampleFetch: `fetch('/api/billing/checkout', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ planId: 'growth', billingCycle: 'monthly', paymentMethod: 'crypto_usdt_trc20' })\n});`,
  },
  {
    id: "billing-orders",
    method: "GET",
    path: "/api/billing/orders",
    title: "List Orders & Invoices",
    category: "Billing & Cryptocurrency",
    auth: "Session Cookie",
    description: "Lists all WHMCS-registered orders, associated invoices, and cryptocurrency settlement statuses.",
    sampleCurl: `curl -X GET https://mail.zegacloud.com/api/billing/orders \\\n  --cookie "zega_session=ses_YOUR_TOKEN"`,
    sampleFetch: `fetch('/api/billing/orders').then(r => r.json());`,
  },
  {
    id: "crypto-scanner",
    method: "GET",
    path: "/api/cron/crypto-scanner",
    title: "Automated On-Chain Scanner Worker",
    category: "Billing & Cryptocurrency",
    auth: "Bearer / Cron Token",
    description: "Scans all pending cryptocurrency orders against live blockchain nodes (TronGrid, Blockstream, Cloudflare ETH, Solana Beta) and auto-activates confirmed services.",
    sampleCurl: `curl -X GET https://mail.zegacloud.com/api/cron/crypto-scanner \\\n  -H "Authorization: Bearer zegacloud-cron-secret"`,
    sampleFetch: `fetch('/api/cron/crypto-scanner', {\n  headers: { 'Authorization': 'Bearer zegacloud-cron-secret' }\n}).then(r => r.json());`,
  },
  {
    id: "whmcs-order-verify",
    method: "POST",
    path: "/api/internal/v1/whmcs/order-verify",
    title: "WHMCS Webhook: Activate Order & Service",
    category: "WHMCS Integration",
    auth: "WHMCS Secret / HMAC",
    description: "Internal webhook called by the WHMCS server module or addon to immediately activate and provision an organization upon payment.",
    sampleBody: JSON.stringify({ orderId: "ord_init_002" }, null, 2),
    sampleCurl: `curl -X POST https://mail.zegacloud.com/api/internal/v1/whmcs/order-verify \\\n  -H "Content-Type: application/json" \\\n  -H "x-zegabytez-whmcs-secret: super_secret_whmcs_webhook_token" \\\n  -d '{"orderId":"ord_init_002"}'`,
    sampleFetch: `fetch('/api/internal/v1/whmcs/order-verify', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n    'x-zegabytez-whmcs-secret': 'super_secret_whmcs_webhook_token'\n  },\n  body: JSON.stringify({ orderId: 'ord_init_002' })\n});`,
  },
];

export default function ApiDocumentationPage() {
  const [selectedId, setSelectedId] = useState<string>("health");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const activeEndpoint = ENDPOINTS.find((e) => e.id === selectedId) || ENDPOINTS[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch(activeEndpoint.path, {
        method: activeEndpoint.method,
        headers: { "Content-Type": "application/json" },
        body: activeEndpoint.sampleBody && activeEndpoint.method === "POST" ? activeEndpoint.sampleBody : undefined,
      });
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message, note: "Request executed. Check server console or credentials." }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <ZegaLogo variant="icon" imgClassName="h-8 w-auto" />
            <div className="leading-tight">
              <span className="font-bold text-lg text-white">ZegaMail</span>
              <span className="text-[10px] text-cyan-400 font-mono block tracking-wider uppercase">DEVELOPER PLATFORM</span>
            </div>
          </Link>
          <span className="hidden md:inline-flex items-center gap-1.5 ml-4 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            OpenAPI 3.1.0 Ready
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            openapi.json
          </a>
          <Link
            href="/app"
            className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
          >
            Open Mailbox <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800/80 p-5 bg-slate-900/30">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> API Endpoints
          </div>

          <div className="space-y-1">
            {ENDPOINTS.map((ep) => {
              const isSelected = ep.id === selectedId;
              const methodColor =
                ep.method === "GET"
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800/60"
                  : ep.method === "POST"
                  ? "bg-blue-950 text-blue-300 border-blue-800/60"
                  : "bg-amber-950 text-amber-300 border-amber-800/60";

              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setSelectedId(ep.id);
                    setTestResponse(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 ${
                    isSelected
                      ? "bg-slate-800 text-white font-medium shadow-sm border border-slate-700"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] border ${methodColor}`}>
                    {ep.method}
                  </span>
                  <span className="truncate flex-1 font-mono text-[11px]">{ep.path}</span>
                </button>
              );
            })}
          </div>

          {/* Integration Specs Box */}
          <div className="mt-8 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400" /> Authentication Types
            </div>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li>
                <strong className="text-slate-300">Session Cookie:</strong> <code className="text-cyan-300">zega_session</code>
              </li>
              <li>
                <strong className="text-slate-300">Cron / RPC:</strong> <code className="text-cyan-300">Bearer &lt;token&gt;</code>
              </li>
              <li>
                <strong className="text-slate-300">WHMCS Module:</strong> <code className="text-cyan-300">x-zegabytez-whmcs-secret</code>
              </li>
            </ul>
          </div>
        </aside>

        {/* Right Details Panel */}
        <main className="flex-1 p-6 md:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${
                    activeEndpoint.method === "GET"
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800/60"
                      : activeEndpoint.method === "POST"
                      ? "bg-blue-950 text-blue-300 border-blue-800/60"
                      : "bg-amber-950 text-amber-300 border-amber-800/60"
                  }`}
                >
                  {activeEndpoint.method}
                </span>
                <span className="text-lg md:text-xl font-bold font-mono text-white">{activeEndpoint.path}</span>
              </div>
              <p className="text-sm text-slate-300 max-w-2xl">{activeEndpoint.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" /> Auth: {activeEndpoint.auth}
              </span>
            </div>
          </div>

          {/* Sample Request Body */}
          {activeEndpoint.sampleBody && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400">JSON Request Payload</span>
                <button
                  onClick={() => handleCopy(activeEndpoint.sampleBody!, "body")}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition-colors"
                >
                  {copiedKey === "body" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "body" ? "Copied" : "Copy JSON"}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                {activeEndpoint.sampleBody}
              </pre>
            </div>
          )}

          {/* Code Snippets (cURL & Fetch) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* cURL Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" /> cURL Command
                </span>
                <button
                  onClick={() => handleCopy(activeEndpoint.sampleCurl, "curl")}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition-colors"
                >
                  {copiedKey === "curl" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "curl" ? "Copied" : "Copy cURL"}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto h-40">
                {activeEndpoint.sampleCurl}
              </pre>
            </div>

            {/* JavaScript / TypeScript Fetch Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-cyan-400" /> JavaScript / TypeScript Fetch
                </span>
                <button
                  onClick={() => handleCopy(activeEndpoint.sampleFetch, "fetch")}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition-colors"
                >
                  {copiedKey === "fetch" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === "fetch" ? "Copied" : "Copy Fetch"}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto h-40">
                {activeEndpoint.sampleFetch}
              </pre>
            </div>
          </div>

          {/* Live Request Simulator & Interactive Tester */}
          <div className="border border-slate-800 rounded-2xl p-5 bg-gradient-to-b from-slate-900/60 to-slate-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">Live In-Browser API Simulator</span>
              </div>
              <button
                onClick={handleRunTest}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Execute Live Request
              </button>
            </div>

            {testResponse && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">Response Payload:</span>
                <pre className="p-4 rounded-xl bg-slate-950 border border-cyan-800/40 font-mono text-xs text-emerald-300 overflow-x-auto max-h-64">
                  {testResponse}
                </pre>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
