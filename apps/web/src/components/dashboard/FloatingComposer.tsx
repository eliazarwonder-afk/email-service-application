"use client";

import React, { useState } from "react";
import {
  X,
  Minus,
  Maximize2,
  Send,
  Paperclip,
  Sparkles,
  Trash2,
  CheckCheck,
  Check,
  Bold,
  Italic,
  Link as LinkIcon
} from "lucide-react";

interface FloatingComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onExpandToFull: () => void;
  toEmail: string;
  setToEmail: (val: string) => void;
  subject: string;
  setSubject: (val: string) => void;
  body: string;
  setBody: (val: string) => void;
  enableTracking: boolean;
  setEnableTracking: (val: boolean) => void;
  onSend: (e: React.FormEvent) => void;
  isSending: boolean;
  sendSuccessMessage: string;
  onAiPolish?: () => void;
}

export function FloatingComposer({
  isOpen,
  onClose,
  onExpandToFull,
  toEmail,
  setToEmail,
  subject,
  setSubject,
  body,
  setBody,
  enableTracking,
  setEnableTracking,
  onSend,
  isSending,
  sendSuccessMessage,
  onAiPolish,
}: FloatingComposerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [ccEmail, setCcEmail] = useState("");
  const [bccEmail, setBccEmail] = useState("");

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-0 right-4 sm:right-8 z-50 w-[95vw] sm:w-[540px] md:w-[600px] shadow-2xl rounded-t-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e131d] overflow-hidden flex flex-col transition-all duration-200 ${
        isMinimized ? "h-11" : "h-[540px] max-h-[85vh]"
      }`}
    >
      {/* Header Bar */}
      <div className="h-11 px-4 bg-slate-100 dark:bg-[#121824] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 select-none">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 truncate">
          <Send className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>{subject ? subject : "New Message"}</span>
        </span>

        <div className="flex items-center gap-1">
          {/* Minimize Button */}
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          {/* Fullscreen Workspace Button */}
          <button
            type="button"
            onClick={onExpandToFull}
            className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Open Fullscreen Compose Studio"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Discard & Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Composer Body when not minimized */}
      {!isMinimized && (
        <>
          {sendSuccessMessage ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <Check className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {sendSuccessMessage}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                MTA Status: 250 2.1.5 OK Delivered via TLS 1.3
              </p>
            </div>
          ) : (
            <form onSubmit={onSend} className="flex-1 flex flex-col overflow-hidden">
              {/* To: Input */}
              <div className="flex items-center px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 text-xs">
                <label className="text-slate-400 w-12 font-medium shrink-0">To</label>
                <input
                  type="email"
                  required
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="recipient@domain.com"
                  className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                />
                {!showCcBcc && (
                  <button
                    type="button"
                    onClick={() => setShowCcBcc(true)}
                    className="text-[11px] text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                  >
                    Cc/Bcc
                  </button>
                )}
              </div>

              {/* CC & BCC Inputs */}
              {showCcBcc && (
                <>
                  <div className="flex items-center px-4 py-1.5 border-b border-slate-100 dark:border-slate-800/80 text-xs bg-slate-50/50 dark:bg-slate-900/40">
                    <label className="text-slate-400 w-12 font-medium shrink-0">Cc</label>
                    <input
                      type="text"
                      value={ccEmail}
                      onChange={(e) => setCcEmail(e.target.value)}
                      placeholder="Optional cc addresses"
                      className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                    />
                  </div>
                  <div className="flex items-center px-4 py-1.5 border-b border-slate-100 dark:border-slate-800/80 text-xs bg-slate-50/50 dark:bg-slate-900/40">
                    <label className="text-slate-400 w-12 font-medium shrink-0">Bcc</label>
                    <input
                      type="text"
                      value={bccEmail}
                      onChange={(e) => setBccEmail(e.target.value)}
                      placeholder="Optional bcc addresses"
                      className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                    />
                  </div>
                </>
              )}

              {/* Subject Input */}
              <div className="flex items-center px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 text-xs">
                <label className="text-slate-400 w-12 font-medium shrink-0">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none font-medium"
                />
              </div>

              {/* Delivery Receipt (DSN) Toggle */}
              <div className="px-4 py-2 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] text-emerald-900 dark:text-emerald-300 font-medium">
                    Delivery Status Notification (Sent ✓ / Delivered ✓✓)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableTracking}
                    onChange={(e) => setEnableTracking(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-7 h-4 rounded-full transition-colors ${
                      enableTracking ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform mt-0.5 ${
                        enableTracking ? "translate-x-3.5" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </label>
              </div>

              {/* Message Body Input */}
              <div className="flex-1 p-4 overflow-y-auto">
                <textarea
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Compose your email here..."
                  className="w-full h-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 resize-none outline-none leading-relaxed font-sans"
                />
              </div>

              {/* Bottom Actions Bar */}
              <div className="h-14 px-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#121824] flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm hover:shadow transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSending ? "Sending..." : "Send"}</span>
                  </button>

                  {onAiPolish && (
                    <button
                      type="button"
                      onClick={onAiPolish}
                      className="p-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      title="Polish with AI"
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      setToEmail("");
                      setSubject("");
                      setBody("");
                      onClose();
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Discard Draft"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
