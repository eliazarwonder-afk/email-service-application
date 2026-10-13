"use client";

import React, { useState } from "react";
import {
  X,
  Smartphone,
  Laptop,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Mail,
  ChevronRight,
  Download
} from "lucide-react";

interface ClientSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export function ClientSetupModal({ isOpen, onClose, defaultEmail = "you@yourcompany.com" }: ClientSetupModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeClientTab, setActiveClientTab] = useState<"apple" | "android" | "outlook">("apple");

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-[2rem] p-1.5 bg-neutral-200/80 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 shadow-2xl">
        <div className="rounded-[calc(2rem-0.375rem)] bg-white dark:bg-[#10131c] p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>SSL Encrypted Mail Gateway</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Connect Apple Mail, Android & Outlook
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Sync your business email with your phone and desktop using industry-standard IMAP & SMTP.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Client Tab Switcher */}
          <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-900/80 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveClientTab("apple")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                activeClientTab === "apple"
                  ? "bg-white dark:bg-[#181d28] text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <img src="/branding/apple-icon.svg" alt="Apple" className="h-3.5 w-3.5 dark:invert" />
              <span>Apple Mail / iOS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveClientTab("android")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                activeClientTab === "android"
                  ? "bg-white dark:bg-[#181d28] text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <img src="/branding/google-play-icon.svg" alt="Android" className="h-3.5 w-3.5" />
              <span>Android / Gmail App</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveClientTab("outlook")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                activeClientTab === "outlook"
                  ? "bg-white dark:bg-[#181d28] text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Laptop className="h-3.5 w-3.5 text-blue-500" />
              <span>Outlook / PC</span>
            </button>
          </div>

          {/* Connection Credentials Box */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Server Hostnames & Ports
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* IMAP */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141822] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900 dark:text-white">Incoming (IMAP)</span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                    SSL/TLS
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400">Server Hostname</p>
                  <div className="flex items-center justify-between font-mono font-medium text-neutral-800 dark:text-neutral-200">
                    <span>mail.zegamail.com</span>
                    <button
                      type="button"
                      onClick={() => handleCopy("mail.zegamail.com", "imap-host")}
                      className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1"
                    >
                      {copiedKey === "imap-host" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400">Port</p>
                  <p className="font-mono font-semibold text-neutral-900 dark:text-white">993</p>
                </div>
              </div>

              {/* SMTP */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141822] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900 dark:text-white">Outgoing (SMTP)</span>
                  <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                    SSL/TLS
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400">Server Hostname</p>
                  <div className="flex items-center justify-between font-mono font-medium text-neutral-800 dark:text-neutral-200">
                    <span>smtp.zegamail.com</span>
                    <button
                      type="button"
                      onClick={() => handleCopy("smtp.zegamail.com", "smtp-host")}
                      className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1"
                    >
                      {copiedKey === "smtp-host" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400">Port</p>
                  <p className="font-mono font-semibold text-neutral-900 dark:text-white">465</p>
                </div>
              </div>
            </div>

            {/* Quick Step Guide */}
            <div className="p-3.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5">
              <p className="font-semibold text-neutral-900 dark:text-white">Quick 2-Step Setup:</p>
              <ol className="list-decimal list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                <li>Go to your phone’s <strong>Mail Settings → Add Account → Other / IMAP</strong>.</li>
                <li>Enter your full business email address and password, then paste the hostnames above.</li>
              </ol>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">
              Compatible with iOS 14+, Android 10+, Outlook 2016+, and macOS Mail
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold shadow-sm hover:opacity-90"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
