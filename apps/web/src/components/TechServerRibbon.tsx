"use client";

import React from "react";
import { Server, ShieldCheck, Zap, Globe, Cpu, Radio } from "lucide-react";

export function TechServerRibbon() {
  return (
    <div className="border-y border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100/50 dark:bg-[#0b0e17]/80 backdrop-blur-md py-4 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-500 dark:text-neutral-400">
              Cloud Infrastructure:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">100% OPERATIONAL</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-neutral-600 dark:text-neutral-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-blue-500" />
              <span>NVMe Edge Clusters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>2048-bit DKIM / DMARC Quarantine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Edge Latency &lt; 15ms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-indigo-500" />
              <span>Zero IP Blacklists</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>Global DNS Synchronized</span>
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="text-neutral-800 dark:text-neutral-200 font-semibold">ZegaCloud Network</span>
          </div>
        </div>
      </div>
    </div>
  );
}
