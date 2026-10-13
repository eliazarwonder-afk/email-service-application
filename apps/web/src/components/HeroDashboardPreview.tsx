"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  Eye,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
  Clock,
  CheckCircle2,
  FileText,
  Paperclip,
  Wand2,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Sun,
  Moon
} from "lucide-react";

import { useTheme } from "./ThemeProvider";

export function HeroDashboardPreview() {
  const { theme } = useTheme();
  const [activePreviewTab, setActivePreviewTab] = useState<"mail" | "ai" | "campaigns">("mail");
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">(theme || "light");

  React.useEffect(() => {
    if (theme) setPreviewTheme(theme);
  }, [theme]);

  return (
    <div className="mt-14 max-w-5xl mx-auto rounded-[2rem] p-1.5 sm:p-2.5 bg-neutral-200/70 dark:bg-white/5 border border-neutral-300/70 dark:border-white/10 shadow-2xl backdrop-blur-md transition-all">
      <div className={`rounded-[calc(2rem-0.5rem)] border transition-all duration-300 overflow-hidden shadow-sm ${
        previewTheme === "dark"
          ? "bg-[#0f121a] border-[#252c3d] text-white shadow-black/60"
          : "bg-white border-[#eaeaea] text-[#121212] shadow-neutral-200/50"
      }`}>
        {/* Window Title Bar */}
        <div className={`flex items-center justify-between px-4 py-2.5 border-b text-xs transition-colors ${
          previewTheme === "dark"
            ? "bg-[#161a25] border-[#252c3d] text-neutral-400"
            : "bg-[#faf9f6] border-[#eaeaea] text-[#706f6c]"
        }`}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <span className="ml-2 font-mono text-[11px] font-medium truncate">
            mail.zegamail.com • Alex Carter (sales@acmedesign.co)
          </span>
        </div>

        {/* Mockup Controls: View Switcher + Theme Toggle */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center rounded-lg p-0.5 text-[11px] font-medium border ${
            previewTheme === "dark" ? "bg-[#10131c] border-[#252c3d]" : "bg-neutral-100 border-[#eaeaea]"
          }`}>
            <button
              type="button"
              onClick={() => setActivePreviewTab("mail")}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                activePreviewTab === "mail"
                  ? previewTheme === "dark" ? "bg-[#252c3d] text-white" : "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Inbox & Tracking
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab("ai")}
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                activePreviewTab === "ai"
                  ? previewTheme === "dark" ? "bg-[#252c3d] text-white" : "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Zega AI</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab("campaigns")}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                activePreviewTab === "campaigns"
                  ? previewTheme === "dark" ? "bg-[#252c3d] text-white" : "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Campaigns
            </button>
          </div>

          {/* Theme preview switch */}
          <button
            type="button"
            onClick={() => setPreviewTheme(previewTheme === "light" ? "dark" : "light")}
            title="Preview Dark Mode"
            className={`p-1.5 rounded-md border text-xs ${
              previewTheme === "dark"
                ? "bg-[#252c3d] border-[#364057] text-amber-300"
                : "bg-white border-[#eaeaea] text-neutral-700"
            }`}
          >
            {previewTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[440px] text-left">
        {/* Left Vertical App Dock (Inspired by Reference Image 1 & 2) */}
        <div className={`hidden md:flex md:col-span-1 border-r flex-col items-center justify-between py-4 ${
          previewTheme === "dark" ? "bg-[#141822] border-[#252c3d]" : "bg-[#faf9f6] border-[#eaeaea]"
        }`}>
          <div className="space-y-4 flex flex-col items-center">
            <div className="h-9 w-9 rounded-xl bg-[#121212] dark:bg-white text-white dark:text-[#121212] flex items-center justify-center font-bold text-xs">
              ZM
            </div>

            <button
              type="button"
              onClick={() => setActivePreviewTab("mail")}
              className={`p-2 rounded-lg transition-colors ${
                activePreviewTab === "mail"
                  ? previewTheme === "dark" ? "bg-[#252c3d] text-white" : "bg-neutral-200 text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              }`}
              title="Mailbox"
            >
              <Mail className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setActivePreviewTab("ai")}
              className={`p-2 rounded-lg transition-colors ${
                activePreviewTab === "ai"
                  ? previewTheme === "dark" ? "bg-[#252c3d] text-amber-400" : "bg-neutral-200 text-amber-600"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              }`}
              title="Zega AI Email Generator"
            >
              <Sparkles className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setActivePreviewTab("campaigns")}
              className={`p-2 rounded-lg transition-colors ${
                activePreviewTab === "campaigns"
                  ? previewTheme === "dark" ? "bg-[#252c3d] text-emerald-400" : "bg-neutral-200 text-emerald-700"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              }`}
              title="Campaign Analytics"
            >
              <BarChart3 className="h-4 w-4" />
            </button>

            <Link
              href="/app"
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              title="Contacts & Leads"
            >
              <Users className="h-4 w-4" />
            </Link>
          </div>

          <Link
            href="/app"
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
            title="Admin & Organization Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>

        {/* TAB 1: MAILBOX & TITAN-STYLE READ RECEIPTS */}
        {activePreviewTab === "mail" && (
          <>
            {/* Folder List */}
            <div className={`hidden md:block md:col-span-3 border-r p-3.5 space-y-4 ${
              previewTheme === "dark" ? "bg-[#11141d] border-[#252c3d]" : "bg-[#faf9f6]/40 border-[#eaeaea]"
            }`}>
              <Link
                href="/app"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#121212] dark:bg-white text-white dark:text-[#121212] py-2 px-3 text-xs font-semibold shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Write Email</span>
                <kbd className="ml-auto bg-neutral-800 dark:bg-neutral-200 text-neutral-300 dark:text-neutral-700 text-[9px]">C</kbd>
              </Link>

              <div className="space-y-1 text-xs">
                <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold ${
                  previewTheme === "dark" ? "bg-[#1e2433] text-white" : "bg-white border border-[#eaeaea] text-[#121212]"
                }`}>
                  <span className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> Primary
                  </span>
                  <span className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1.5 rounded">3</span>
                </div>
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5" /> Tracked Proposals
                  </span>
                  <span className="text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 px-1.5 rounded">2 opens</span>
                </div>
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-amber-500" /> Follow-ups
                  </span>
                  <span className="text-[10px]">1 due</span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-neutral-500">
                  <span>Storage Pool</span>
                  <span className="font-mono">18% used</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#121212] dark:bg-white h-full w-[18%]" />
                </div>
              </div>
            </div>

            {/* Email Message List */}
            <div className={`col-span-12 md:col-span-4 border-r p-3 space-y-2.5 ${
              previewTheme === "dark" ? "bg-[#141822] border-[#252c3d]" : "bg-white border-[#eaeaea]"
            }`}>
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 font-medium">
                <span>Recent Proposals & Conversations</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">100% Verified</span>
              </div>

              {/* Message 1 (Active) */}
              <div className={`p-3 rounded-xl border cursor-pointer transition-all ${
                previewTheme === "dark"
                  ? "border-blue-500/60 bg-[#1c2232] shadow-sm"
                  : "border-neutral-900 bg-neutral-50/80 shadow-sm"
              }`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold truncate">Sarah Jenkins (Meridian Corp)</span>
                  <span className="text-[10px] text-neutral-400 font-mono">10:42 AM</span>
                </div>
                <p className="text-xs font-medium truncate">
                  Re: Enterprise Retainer Proposal
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded bg-[#e1f3fe] dark:bg-blue-950/70 px-1.5 py-0.5 text-[10px] font-medium text-[#1a5c88] dark:text-blue-300 border border-[#cbe4fb] dark:border-blue-800">
                    <Eye className="h-3 w-3" /> Opened 4 mins ago (3x)
                  </span>
                </div>
              </div>

              {/* Message 2 */}
              <div className={`p-3 rounded-xl border transition-colors ${
                previewTheme === "dark" ? "border-[#252c3d] hover:bg-[#1a202d]" : "border-[#eaeaea] hover:bg-neutral-50"
              }`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">Apex Logistics Inc</span>
                  <span className="text-[10px] text-neutral-400 font-mono">Yesterday</span>
                </div>
                <p className="text-xs text-neutral-500 truncate">
                  Invoice #4029 Payment Confirmation
                </p>
              </div>

              {/* Message 3 */}
              <div className={`p-3 rounded-xl border transition-colors ${
                previewTheme === "dark" ? "border-[#252c3d] hover:bg-[#1a202d]" : "border-[#eaeaea] hover:bg-neutral-50"
              }`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">ZegaCloud DNS Engine</span>
                  <span className="text-[10px] text-neutral-400 font-mono">Oct 9</span>
                </div>
                <p className="text-xs text-neutral-500 truncate">
                  SPF, DKIM, DMARC 100% active on acmedesign.co
                </p>
              </div>
            </div>

            {/* Email Reading Pane with Titan-Style Tracking & Attachments */}
            <div className={`col-span-12 md:col-span-4 p-4 flex flex-col justify-between ${
              previewTheme === "dark" ? "bg-[#11141d]" : "bg-white"
            }`}>
              <div className="space-y-3">
                {/* Titan-style Read Receipt Callout */}
                <div className={`rounded-xl border p-3 flex items-start gap-2.5 text-xs ${
                  previewTheme === "dark"
                    ? "bg-blue-950/40 border-blue-900/60 text-blue-300"
                    : "bg-blue-50/70 border-blue-200 text-blue-900"
                }`}>
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold">Client Read Receipt Alert</p>
                    <p className="text-[11px] leading-relaxed">
                      Sarah Jenkins opened your proposal <strong>4m ago</strong> on macOS (Chrome). Attached PDF viewed 2 times.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm">
                    Re: Enterprise Retainer Proposal
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    From: s.jenkins@meridiancorp.com
                  </p>
                </div>

                <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-2 leading-relaxed border-t border-neutral-200 dark:border-neutral-800 pt-2.5">
                  <p>Hi Alex,</p>
                  <p>
                    We reviewed the retainer scope internally this morning. The leadership team is aligned on the dedicated SLA and custom API endpoint allocation.
                  </p>
                  <p>Let’s lock in tomorrow at 2:00 PM for a quick 10-minute kickoff review!</p>
                </div>

                {/* Attachment Chips (like Reference Image 2) */}
                <div className="pt-2">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5">
                    Attachments (2)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium ${
                      previewTheme === "dark" ? "bg-[#1b212f] border-[#293348]" : "bg-neutral-50 border-[#eaeaea]"
                    }`}>
                      <FileText className="h-3.5 w-3.5 text-red-500" />
                      <span>Retainer-Scope-v2.pdf</span>
                      <span className="text-[10px] text-neutral-400 font-mono">1.8 MB</span>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium ${
                      previewTheme === "dark" ? "bg-[#1b212f] border-[#293348]" : "bg-neutral-50 border-[#eaeaea]"
                    }`}>
                      <Paperclip className="h-3.5 w-3.5 text-blue-500" />
                      <span>Architecture-Spec.fig</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500" />
                  Auto follow-up set for tomorrow 9 AM
                </span>
                <Link
                  href="/app"
                  className="font-semibold underline hover:text-blue-500"
                >
                  Open in App →
                </Link>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: ZEGA AI EMAIL & CONTENT GENERATOR (Inspired by Reference Image 4) */}
        {activePreviewTab === "ai" && (
          <div className="col-span-12 md:col-span-11 p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left AI Controls & Prompts */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs">Zega AI Outreach Studio</h3>
                    <p className="text-[10px] text-neutral-400">Generate high-converting cold emails & smart replies</p>
                  </div>
                </div>
                <span className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-mono">
                  2,450 / 3,000 Credits
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-[11px]">Select Prospect / Lead</label>
                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  previewTheme === "dark" ? "bg-[#181d28] border-[#293348]" : "bg-neutral-50 border-[#eaeaea]"
                }`}>
                  <div>
                    <p className="font-medium text-xs">David Miller</p>
                    <p className="text-[10px] text-neutral-400">VP Marketing @ HyperScale Tech</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-mono">
                    High Fit (94%)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-[11px]">Goal & Tone of Email</label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className={`p-2 rounded-lg border text-center font-medium ${
                    previewTheme === "dark" ? "bg-amber-950/30 border-amber-800 text-amber-300" : "bg-amber-50 border-amber-300 text-amber-900"
                  }`}>
                    Proposal Follow-up
                  </div>
                  <div className={`p-2 rounded-lg border text-center text-neutral-400 ${
                    previewTheme === "dark" ? "border-[#293348]" : "border-[#eaeaea]"
                  }`}>
                    Cold Outreach Intro
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-[11px]">AI Instructions / Context</label>
                <textarea
                  readOnly
                  rows={3}
                  value="Offer a 15-minute quick audit of their current web app performance and explain how our team delivers 99.99% uptime."
                  className={`w-full p-2 rounded-lg border text-xs resize-none ${
                    previewTheme === "dark" ? "bg-[#141822] border-[#293348] text-neutral-300" : "bg-neutral-50 border-[#eaeaea] text-neutral-700"
                  }`}
                />
              </div>

              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#121212] dark:bg-white text-white dark:text-[#121212] py-2 text-xs font-semibold shadow-sm"
              >
                <Wand2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Regenerate with Zega AI</span>
              </button>
            </div>

            {/* Right Generated Preview */}
            <div className={`md:col-span-7 rounded-xl border p-4 flex flex-col justify-between space-y-3 ${
              previewTheme === "dark" ? "bg-[#181d28] border-[#293348]" : "bg-[#faf9f6] border-[#eaeaea]"
            }`}>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b pb-2 border-neutral-200 dark:border-neutral-800">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>AI-Generated Draft</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                    <span>Readability: 98%</span>
                    <span>•</span>
                    <span>Response Rate: High</span>
                  </div>
                </div>

                <div className="text-xs space-y-2 leading-relaxed text-neutral-700 dark:text-neutral-200 font-sans">
                  <p><strong>Subject:</strong> Quick observation on HyperScale Tech’s web infrastructure</p>
                  <p>Hi David,</p>
                  <p>
                    I noticed HyperScale Tech recently announced your European expansion—congratulations on the milestone!
                  </p>
                  <p>
                    Growing traffic often introduces unexpected latency and mail deliverability spikes. We built dedicated hybrid mail infrastructure that maintains guaranteed 99.99% inbox placement without paying \$7/seat enterprise penalties.
                  </p>
                  <p>
                    Would you be open to a 10-minute sync this Thursday at 3:00 PM to review a quick deliverability diagnostic we ran for your domain?
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-400 font-mono">
                  Personalized using LinkedIn + DNS signals
                </span>
                <Link
                  href="/app"
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Send to Client →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CAMPAIGNS & DELIVERABILITY ANALYTICS (Inspired by Reference Image 5) */}
        {activePreviewTab === "campaigns" && (
          <div className="col-span-12 md:col-span-11 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Email Campaign Performance</h3>
                <p className="text-[11px] text-neutral-400">Real-time statistics across active client sequences</p>
              </div>
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <span>+ Create Campaign</span>
              </Link>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-3 rounded-xl border ${
                previewTheme === "dark" ? "bg-[#181d28] border-[#293348]" : "bg-neutral-50 border-[#eaeaea]"
              }`}>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Campaigns Sent</p>
                <p className="text-xl font-bold font-mono mt-1">1,410</p>
                <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="h-3 w-3" /> +3.5% this month
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${
                previewTheme === "dark" ? "bg-[#181d28] border-[#293348]" : "bg-neutral-50 border-[#eaeaea]"
              }`}>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Emails Delivered</p>
                <p className="text-xl font-bold font-mono mt-1">98.9%</p>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Zero Spam Placement</p>
              </div>

              <div className={`p-3 rounded-xl border ${
                previewTheme === "dark" ? "bg-[#181d28] border-[#293348]" : "bg-neutral-50 border-[#eaeaea]"
              }`}>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Open Rate</p>
                <p className="text-xl font-bold font-mono text-blue-500 mt-1">65.5%</p>
                <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="h-3 w-3" /> +23.3% vs industry
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${
                previewTheme === "dark" ? "bg-[#181d28] border-[#293348]" : "bg-neutral-50 border-[#eaeaea]"
              }`}>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Reply Rate</p>
                <p className="text-xl font-bold font-mono text-emerald-500 mt-1">30.3%</p>
                <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="h-3 w-3" /> +27.9% high intent
                </p>
              </div>
            </div>

            {/* Mini Campaign Performance Table */}
            <div className={`rounded-xl border overflow-hidden text-xs ${
              previewTheme === "dark" ? "bg-[#161a25] border-[#293348]" : "bg-white border-[#eaeaea]"
            }`}>
              <div className="grid grid-cols-12 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold text-neutral-500">
                <span className="col-span-5">Campaign Sequence</span>
                <span className="col-span-2">Status</span>
                <span className="col-span-2 font-mono">Sent</span>
                <span className="col-span-3">Open & Reply Rates</span>
              </div>

              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                <div className="grid grid-cols-12 px-3 py-2.5 items-center">
                  <span className="col-span-5 font-medium truncate">Q4 Enterprise Retainer Outreach</span>
                  <span className="col-span-2">
                    <span className="rounded bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 text-[10px] font-bold">
                      Active
                    </span>
                  </span>
                  <span className="col-span-2 font-mono text-neutral-400">420 leads</span>
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-20 bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[68%]" />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-emerald-500">67.9%</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 px-3 py-2.5 items-center">
                  <span className="col-span-5 font-medium truncate">Automated Invoice Follow-ups</span>
                  <span className="col-span-2">
                    <span className="rounded bg-blue-500/10 text-blue-500 px-1.5 py-0.5 text-[10px] font-bold">
                      Continuous
                    </span>
                  </span>
                  <span className="col-span-2 font-mono text-neutral-400">184 sent</span>
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-20 bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[84%]" />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-blue-500">84.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
