"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Mail, Lock, Server, Cpu, CheckCircle2 } from "lucide-react";
import { ZegaLogo } from "./ZegaLogo";

interface DashboardLoadingSplashProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export function DashboardLoadingSplash({
  onComplete,
  minDurationMs = 1200,
}: DashboardLoadingSplashProps) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  const stages = [
    { label: "Authenticating encrypted workspace keys…", icon: Lock },
    { label: "Connecting to Anycast NVMe mail cluster…", icon: Server },
    { label: "Validating 2048-bit DKIM & TLS 1.3 gateway…", icon: ShieldCheck },
    { label: "Synchronizing client mailboxes & sequences…", icon: Mail },
    { label: "Workspace environment verified. Launching…", icon: CheckCircle2 },
  ];

  useEffect(() => {
    const stepDuration = minDurationMs / 4;

    const timer1 = setTimeout(() => {
      setStage(1);
      setProgress(40);
    }, stepDuration * 0.7);

    const timer2 = setTimeout(() => {
      setStage(2);
      setProgress(68);
    }, stepDuration * 1.5);

    const timer3 = setTimeout(() => {
      setStage(3);
      setProgress(90);
    }, stepDuration * 2.3);

    const timer4 = setTimeout(() => {
      setStage(4);
      setProgress(100);
    }, stepDuration * 3.1);

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsMounted(false);
        if (onComplete) onComplete();
      }, 500);
    }, minDurationMs + 200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(fadeTimer);
    };
  }, [minDurationMs, onComplete]);

  if (!isMounted) return null;

  const CurrentIcon = stages[stage]?.icon || Server;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07090e] text-white transition-opacity duration-500 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 40%, rgba(37, 99, 235, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 50% 60%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
          linear-gradient(to bottom, #07090e 0%, #0a0e17 100%)
        `,
      }}
    >
      {/* Decorative Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-6">
        {/* Pulsing Shield Logo with Orbital Ring */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
          <div className="relative h-20 w-20 rounded-2xl bg-[#0f1422] border border-blue-500/30 flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <ZegaLogo className="h-10 w-10 text-white" />
          </div>

          {/* Rotating Orbital Ping */}
          <div className="absolute -inset-2 rounded-2xl border border-blue-400/20 animate-spin" style={{ animationDuration: "6s" }} />
        </div>

        {/* Brand Title */}
        <div className="space-y-1 mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/50 text-[11px] font-mono text-blue-300 uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>ZegaCloud Cluster • 250 OK</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans mt-2">
            Loading Workspace
          </h2>
          <p className="text-xs text-neutral-400 font-normal">
            Preparing high-performance business email environment
          </p>
        </div>

        {/* Telemetry Stage & Indicator */}
        <div className="w-full bg-[#0c101a] border border-neutral-800/80 rounded-xl p-3.5 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-neutral-300 font-medium">
              <CurrentIcon className="h-4 w-4 text-blue-400 shrink-0 animate-pulse" />
              <span className="truncate text-left text-[11px] font-mono">
                {stages[stage]?.label}
              </span>
            </div>
            <span className="font-mono text-xs text-blue-400 font-bold ml-2 shrink-0">
              {progress}%
            </span>
          </div>

          {/* Animated Gradient Progress Track */}
          <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Micro Telemetry Footer */}
          <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono pt-1">
            <span>TLS 1.3 / AES-256</span>
            <span>Anycast Edge DNS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
