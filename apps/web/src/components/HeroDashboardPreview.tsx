"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Send,
  Star,
  FileText,
  Trash2,
  Archive,
  Search,
  Check,
  CheckCheck,
  PenTool,
  Paperclip,
  MoreVertical,
  ChevronDown,
  ExternalLink,
  Shield,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { validateEmail, validateSubject, sanitizeText } from "@/lib/validation";

interface PreviewEmail {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  starred: boolean;
  status: "sent" | "delivered";
  hasAttachment?: boolean;
}

const PREVIEW_EMAILS: PreviewEmail[] = [
  {
    id: "1",
    sender: "Sarah Jenkins",
    senderEmail: "s.jenkins@meridiancorp.com",
    subject: "Approved: Q4 Cloud Migration & Retainer Agreement",
    preview: "Hi Alex, we reviewed the revised service agreement and the leadership team has approved the scope...",
    time: "10:42 AM",
    unread: true,
    starred: true,
    status: "delivered",
    hasAttachment: true,
  },
  {
    id: "2",
    sender: "Acme Payments",
    senderEmail: "billing@zegacloud.com",
    subject: "Invoice #INV-2026-891 Settled ($49.00 USD)",
    preview: "Your monthly business email subscription has been confirmed via on-chain blockchain settlement...",
    time: "9:15 AM",
    unread: false,
    starred: false,
    status: "delivered",
    hasAttachment: true,
  },
  {
    id: "3",
    sender: "Marcus Vance",
    senderEmail: "m.vance@apexlogistics.co",
    subject: "DNS & Anycast Cluster Configuration Review",
    preview: "Our systems engineer verified the SPF, DKIM, and DMARC 2048-bit records on your custom domain...",
    time: "Yesterday",
    unread: false,
    starred: true,
    status: "delivered",
  },
  {
    id: "4",
    sender: "Elena Rostova",
    senderEmail: "elena@vanguarddesign.studio",
    subject: "Design Deliverables & Brand Guidelines Handover",
    preview: "Attached are the final SVG assets and typography guidelines for the client portal redesign...",
    time: "Oct 17",
    unread: false,
    starred: false,
    status: "sent",
    hasAttachment: true,
  },
];

export function HeroDashboardPreview() {
  const { theme } = useTheme();
  const [activeFolder, setActiveFolder] = useState<string>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<PreviewEmail>(PREVIEW_EMAILS[0]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("s.jenkins@meridiancorp.com");
  const [composeSubject, setComposeSubject] = useState("Re: Approved: Q4 Cloud Migration");
  const [composeBody, setComposeBody] = useState("Hi Sarah,\n\nThank you for the confirmation. We have queued the DNS cutover for 2:00 PM EST.\n\nBest regards,\nAlex");
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);
  const [sendFeedbackError, setSendFeedbackError] = useState(false);

  const handleSendSimulated = (e: React.FormEvent) => {
    e.preventDefault();
    const emailCheck = validateEmail(composeTo);
    if (!emailCheck.isValid) {
      setSendFeedback(emailCheck.error || "Invalid recipient email address");
      setSendFeedbackError(true);
      return;
    }
    const subjectCheck = validateSubject(composeSubject);
    if (!subjectCheck.isValid) {
      setSendFeedback(subjectCheck.error || "Invalid subject");
      setSendFeedbackError(true);
      return;
    }

    setSendFeedbackError(false);
    setSendFeedback("Dispatched via Encrypted TLS 1.3 • 250 OK");
    setTimeout(() => {
      setIsComposeOpen(false);
      setSendFeedback(null);
    }, 1800);
  };

  return (
    <div className="mt-12 max-w-5xl mx-auto rounded-2xl p-2 bg-slate-200/60 dark:bg-slate-800/40 border border-slate-300/80 dark:border-slate-700/60 shadow-2xl backdrop-blur-sm transition-all">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden shadow-sm flex flex-col">
        {/* Top App Bar - Clean Modern Webmail Styling */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>sales@acmedesign.co</span>
              <span className="text-slate-400 font-normal">• NVMe Cloud Mail Node</span>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <div className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-400 select-none cursor-default">
                Search in mail...
              </div>
            </div>
          </div>

          {/* Right Action Link */}
          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 transition-colors"
            >
              <span>View Full Webmail</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Webmail Split Workspace */}
        <div className="flex flex-col md:flex-row h-[420px]">
          {/* Left Sidebar */}
          <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Compose Button */}
              <button
                onClick={() => setIsComposeOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Compose</span>
              </button>

              {/* Folders List */}
              <nav className="space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveFolder("inbox")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeFolder === "inbox"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Inbox</span>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                    3
                  </span>
                </button>

                <button
                  onClick={() => setActiveFolder("starred")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeFolder === "starred"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Starred</span>
                </button>

                <button
                  onClick={() => setActiveFolder("sent")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeFolder === "sent"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Send className="w-4 h-4 text-slate-500" />
                  <span>Sent Mail</span>
                </button>

                <button
                  onClick={() => setActiveFolder("drafts")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeFolder === "drafts"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Drafts</span>
                </button>
              </nav>
            </div>

            {/* Storage Indicator */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                <span>Storage</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">2.1 GB / 25 GB</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: "8.4%" }} />
              </div>
            </div>
          </div>

          {/* Email Row List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 overflow-y-auto flex flex-col">
            <div className="p-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300 pl-1">Primary Messages</span>
              <span className="text-[11px] text-slate-400">4 total</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 flex-1">
              {PREVIEW_EMAILS.map((email) => {
                const isSelected = selectedEmail.id === email.id;
                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-3 text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-2 border-blue-600"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`truncate font-medium ${email.unread ? "font-bold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                        {email.sender}
                      </span>
                      <div className="flex items-center gap-1 shrink-0 text-slate-400 text-[11px]">
                        {email.status === "delivered" ? (
                          <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold" title="Delivered 250 OK">
                            <CheckCheck className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-400" title="Sent">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span>{email.time}</span>
                      </div>
                    </div>

                    <div className={`truncate mb-0.5 ${email.unread ? "font-semibold text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-400"}`}>
                      {email.subject}
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 line-clamp-1 text-[11px]">
                      {email.preview}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Email Detail View */}
          <div className="flex-1 p-5 overflow-y-auto bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                    {selectedEmail.subject}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    <CheckCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Delivered ✓✓ (250 OK)
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                    {selectedEmail.sender[0]}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmail.sender}</span>
                  <span className="text-slate-400">&lt;{selectedEmail.senderEmail}&gt;</span>
                </div>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedEmail.preview}
                {"\n\n"}
                We confirmed the DNS records: MX points to mail.zegacloud.com with priority 10, and DKIM 2048-bit keys are fully verified. All outbound traffic flows with RFC 3461 delivery receipts.
                {"\n\n"}
                Looking forward to our continued partnership.
              </div>

              {selectedEmail.hasAttachment && (
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 inline-flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-medium">Service_Agreement_Q4.pdf</span>
                  <span className="text-slate-400 text-[10px]">(1.4 MB)</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setIsComposeOpen(true)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Reply
              </button>
              <span className="text-[11px] text-slate-400 font-mono">Encrypted TLS 1.3 Transport</span>
            </div>
          </div>
        </div>

        {/* Gmail Docked Floating Compose Window */}
        {isComposeOpen && (
          <div className="absolute bottom-4 right-4 z-30 w-96 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3">
            <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">New Message</span>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendSimulated} className="p-3 space-y-2 text-xs">
              <div>
                <input
                  type="text"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="To"
                  className="w-full border-b border-slate-200 dark:border-slate-700 py-1 bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full border-b border-slate-200 dark:border-slate-700 py-1 bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                />
              </div>
              <div>
                <textarea
                  rows={4}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full py-1 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none resize-none font-sans"
                />
              </div>

              {sendFeedback && (
                <div className={`text-[11px] font-semibold p-1.5 rounded flex items-center gap-1.5 ${
                  sendFeedbackError
                    ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900"
                    : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900"
                }`}>
                  {sendFeedbackError ? <AlertCircle className="w-3 h-3 shrink-0" /> : <CheckCircle2 className="w-3 h-3 shrink-0" />}
                  <span>{sendFeedback}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow transition-colors"
                >
                  Send
                </button>
                <span className="text-[10px] text-slate-400">TLS 1.3 465 SSL</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
