import React from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] dark:bg-[#090a0f] text-[#121212] dark:text-[#f3f4f6] p-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
        <Mail className="h-7 w-7" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">404</h1>
      <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
        Page Not Found
      </h2>
      <p className="text-sm text-neutral-500 max-w-md mb-8">
        The workspace view or endpoint you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/app"
        className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-2.5 text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Webmail</span>
      </Link>
    </div>
  );
}
