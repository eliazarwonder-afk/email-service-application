"use client";

import React from "react";
import { Plus, Users, Mail, Sparkles } from "lucide-react";

interface ContactsViewProps {
  onSendEmail: (email: string) => void;
  onDraftAi: (name: string, company: string) => void;
}

export function ContactsView({ onSendEmail, onDraftAi }: ContactsViewProps) {
  const contacts = [
    {
      id: "cnt_1",
      name: "Sarah Jenkins",
      email: "s.jenkins@meridiancorp.com",
      company: "Meridian Corp",
      relationship: "Proposal Active",
      relationshipColor: "blue",
      opens: "3 opens recorded",
    },
    {
      id: "cnt_2",
      name: "David Miller",
      email: "david@hyperscaletech.com",
      company: "HyperScale Tech",
      relationship: "Prospect Lead",
      relationshipColor: "amber",
      opens: "No emails yet",
    },
    {
      id: "cnt_3",
      name: "Elena Rostova",
      email: "elena@vanguarddigital.io",
      company: "Vanguard Digital",
      relationship: "Contract Sent",
      relationshipColor: "emerald",
      opens: "7 opens recorded",
    },
    {
      id: "cnt_4",
      name: "Marcus Thorne",
      email: "marcus@apexlogistics.com",
      company: "Apex Logistics",
      relationship: "Follow-up Due",
      relationshipColor: "purple",
      opens: "1 open recorded",
    },
  ];

  return (
    <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6 overflow-y-auto select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Client & Lead Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise business contacts, engagement telemetry, and single-click personalized outreach.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("New contact dialog")}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Contact</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[640px]">
            <thead className="bg-slate-50 dark:bg-[#0e131d] border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Name & Email</th>
                <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Company</th>
                <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Relationship</th>
                <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Read Telemetry</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    <div className="font-semibold">{contact.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{contact.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{contact.company}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                        contact.relationshipColor === "blue"
                          ? "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900"
                          : contact.relationshipColor === "emerald"
                          ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                          : contact.relationshipColor === "purple"
                          ? "bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900"
                          : "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900"
                      }`}
                    >
                      {contact.relationship}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{contact.opens}</td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => onSendEmail(contact.email)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      <span>Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDraftAi(contact.name, contact.company)}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>AI Draft</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
