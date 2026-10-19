"use client";

import React from "react";

export function MailboxSkeletonLoader() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0c1017] select-none animate-in fade-in duration-200">
      {/* 8 Shimmering Email Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-3 border-b border-slate-100 dark:border-slate-800/80"
          >
            {/* Checkbox Placeholder */}
            <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />

            {/* Star Placeholder */}
            <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />

            {/* Sender Name Placeholder */}
            <div
              className="h-3.5 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0"
              style={{ width: `${80 + (i % 3) * 30}px` }}
            />

            {/* Subject & Preview Placeholder */}
            <div className="flex-1 flex items-center gap-2 overflow-hidden">
              <div
                className="h-3.5 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse"
                style={{ width: `${140 + (i % 4) * 40}px` }}
              />
              <div
                className="h-3 rounded-md bg-slate-100 dark:bg-slate-800/50 animate-pulse hidden md:block"
                style={{ width: `${180 + (i % 3) * 50}px` }}
              />
            </div>

            {/* Date Placeholder */}
            <div className="w-14 h-3 rounded-md bg-slate-100 dark:bg-slate-800/60 animate-pulse shrink-0 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
