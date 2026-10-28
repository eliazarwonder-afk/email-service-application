"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Check,
  CheckCheck,
  ShieldCheck,
  Lock,
  Server,
  Sparkles,
  RefreshCw,
  Mail,
  ArrowRight,
  FileText,
  Zap,
} from "lucide-react";

export function MailDeliveryHeroAnimation() {
  // Animation phases: "composing" -> "encrypting" -> "in_transit" -> "delivered"
  const [phase, setPhase] = useState<"composing" | "encrypting" | "in_transit" | "delivered">("composing");
  const [progress, setProgress] = useState(0);
  const [latency, setLatency] = useState(18);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (phase === "composing") {
      setProgress(10);
      timer = setTimeout(() => setPhase("encrypting"), 1400);
    } else if (phase === "encrypting") {
      setProgress(40);
      timer = setTimeout(() => setPhase("in_transit"), 1200);
    } else if (phase === "in_transit") {
      setProgress(75);
      timer = setTimeout(() => {
        setPhase("delivered");
        setProgress(100);
        setLatency(Math.floor(Math.random() * 8) + 16);
      }, 1400);
    } else if (phase === "delivered") {
      // Hold on delivered state for 3.5 seconds before looping
      timer = setTimeout(() => {
        setPhase("composing");
        setProgress(0);
      }, 3500);
    }

    return () => clearTimeout(timer);
  }, [phase]);

  const handleManualTrigger = () => {
    setPhase("encrypting");
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      {/* Outer Card with subtle glow */}
      <div className="relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-[#0c1017]/90 backdrop-blur-md p-6 sm:p-7 shadow-xl shadow-blue-500/5 transition-all">
        {/* Header telemetry bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Live Delivery Telemetry
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              RFC 3461 DSN Handshake
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Latency: <strong className="text-emerald-600 dark:text-emerald-400">{latency}ms</strong>
            </span>
            <button
              type="button"
              onClick={handleManualTrigger}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            >
              <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: phase !== "delivered" ? "1s" : "0s" }} />
              <span>Simulate Send</span>
            </button>
          </div>
        </div>

        {/* Dynamic Multi-Stage Visual Pipeline */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative">
          {/* Connector Rail (Background Line) */}
          <div className="hidden md:block absolute left-1/6 right-1/6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-800 -z-0">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 transition-all duration-700 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* STAGE 1: SENDER NODE */}
          <div className={`relative z-10 rounded-xl p-4 border transition-all ${
            phase === "composing"
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-md"
              : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Outbound Mailbox
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                <Send className="w-3 h-3" />
                <span>Dispatch</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>you@company.com</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Subj: Contract &amp; Launch Scope.pdf
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Port: 465 SMTPS</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">
                {phase === "composing" ? "Queueing..." : "Dispatched ✓"}
              </span>
            </div>
          </div>

          {/* STAGE 2: CLOUD SECURITY & ANYCAST ROUTING (CENTER) */}
          <div className={`relative z-10 rounded-xl p-4 border transition-all text-center ${
            phase === "encrypting" || phase === "in_transit"
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-lg"
              : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60"
          }`}>
            <div className="mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300"
              style={{
                backgroundColor: phase === "encrypting" || phase === "in_transit" ? "#4f46e5" : "#e2e8f0",
                color: phase === "encrypting" || phase === "in_transit" ? "#ffffff" : "#64748b",
              }}
            >
              {phase === "encrypting" ? (
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              ) : phase === "in_transit" ? (
                <Zap className="w-5 h-5 animate-bounce" />
              ) : (
                <Server className="w-5 h-5" />
              )}
            </div>

            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
              Cloud Mail Engine
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              TLS 1.3 • 2048-bit DKIM Signed
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold"
              style={{
                backgroundColor: phase === "encrypting" || phase === "in_transit" ? "rgba(99, 102, 241, 0.15)" : "rgba(148, 163, 184, 0.1)",
                color: phase === "encrypting" || phase === "in_transit" ? "#6366f1" : "#94a3b8",
              }}
            >
              {phase === "composing" && "Standby"}
              {phase === "encrypting" && "Applying DKIM RSA Signature..."}
              {phase === "in_transit" && "Anycast Routing to MX..."}
              {phase === "delivered" && "250 OK Acknowledged"}
            </div>
          </div>

          {/* STAGE 3: RECIPIENT INBOX & VERIFIED TICKS */}
          <div className={`relative z-10 rounded-xl p-4 border transition-all ${
            phase === "delivered"
              ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-xl"
              : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recipient Inbox
              </span>
              <div className="flex items-center gap-1">
                {phase === "delivered" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCheck className="w-4 h-4 text-emerald-600 animate-in zoom-in" />
                    <span>Delivered ✓✓</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Sent ✓</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${phase === "delivered" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                <span>client@targetfirm.com</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Primary Inbox (Zero Spam)
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 text-[10px] flex items-center justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={`font-mono font-bold ${phase === "delivered" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                {phase === "delivered" ? "250 2.0.0 OK: Accepted" : "Awaiting handshake..."}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Guarantee Banner */}
        <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Guaranteed Delivery Status Ticks:</strong> Real-time confirmation that your outreach or invoice reached the client mail server.
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full shrink-0">
            99.98% Deliverability Rate
          </span>
        </div>
      </div>
    </div>
  );
}
