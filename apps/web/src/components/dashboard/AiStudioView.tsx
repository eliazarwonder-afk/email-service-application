"use client";

import React from "react";
import { Sparkles, Wand2, Copy, Send, Check } from "lucide-react";

interface AiStudioViewProps {
  leadName: string;
  setLeadName: (val: string) => void;
  leadCompany: string;
  setLeadCompany: (val: string) => void;
  tone: "persuasive" | "professional" | "concise";
  setTone: (val: "persuasive" | "professional" | "concise") => void;
  prompt: string;
  setPrompt: (val: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  generatedEmail: string;
  setGeneratedEmail: (val: string) => void;
  onSendInWebmail: (emailContent: string, subject: string) => void;
}

export function AiStudioView({
  leadName,
  setLeadName,
  leadCompany,
  setLeadCompany,
  tone,
  setTone,
  prompt,
  setPrompt,
  isGenerating,
  onGenerate,
  generatedEmail,
  setGeneratedEmail,
  onSendInWebmail,
}: AiStudioViewProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto select-none">
      {/* Left Input Configuration Column */}
      <div className="md:col-span-5 space-y-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Outreach Copilot
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">
                  Zega Enterprise LLM
                </p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-400">
              2,450 / 3,000 Credits
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Prospect / Decision Maker Name
            </label>
            <input
              type="text"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="e.g. David Miller"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Company / Domain
            </label>
            <input
              type="text"
              value={leadCompany}
              onChange={(e) => setLeadCompany(e.target.value)}
              placeholder="e.g. HyperScale Tech"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Tone & Voice
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["persuasive", "professional", "concise"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`py-2 rounded-xl text-xs capitalize border transition-all ${
                    tone === t
                      ? "bg-blue-600 text-white font-semibold border-blue-600 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Proposal Hook / Context
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Provide a quick value hook or offer..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs text-slate-900 dark:text-white resize-none outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
            />
          </div>

          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 text-xs font-semibold shadow-sm transition-all"
          >
            <Wand2 className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Drafting High-Converting Copy…" : "Generate Email Copy"}</span>
          </button>
        </div>
      </div>

      {/* Right Generated Copy Output */}
      <div className="md:col-span-7 flex flex-col space-y-4">
        <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 flex flex-col justify-between shadow-sm space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Generated Outreach Proposal</span>
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Estimated Open Rate: 68%+
              </span>
            </div>

            <textarea
              rows={14}
              value={generatedEmail}
              onChange={(e) => setGeneratedEmail(e.target.value)}
              className="w-full text-xs font-sans p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-slate-900 dark:text-white resize-none outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const lines = generatedEmail.split("\n");
                const subjectLine = lines.find((l) => l.toLowerCase().startsWith("subject:")) || `Proposal for ${leadCompany}`;
                const cleanSubject = subjectLine.replace(/^subject:\s*/i, "").trim();
                const bodyLines = lines.filter((l) => !l.toLowerCase().startsWith("subject:")).join("\n").trim();
                onSendInWebmail(bodyLines, cleanSubject);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send in Webmail</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
