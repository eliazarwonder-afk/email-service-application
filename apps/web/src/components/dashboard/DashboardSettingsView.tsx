"use client";

import React from "react";
import {
  User,
  CreditCard,
  ShieldCheck,
  Lock,
  Globe,
  Sliders,
  Smartphone,
  Trash2,
  CheckCircle2,
  Calendar,
  AtSign,
  ExternalLink,
  Mail,
  Server,
  KeyRound,
  Check,
  Building2,
  Crown,
} from "lucide-react";
import { sanitizeText } from "@/lib/validation";

interface DashboardSettingsViewProps {
  settingsPerspective?: "admin" | "member";
  setSettingsPerspective?: (val: "admin" | "member") => void;
  currentOrg: any;
  currentUser: any;
  currentDomain: any;
  billingOrders?: any[];
  onOpenUpgradeModal?: () => void;
  onOpenAddMemberModal?: () => void;
  adminTeamMembers?: any[];
  onToggleMemberStatus?: (id: string) => void;
  onChangeMemberRole?: (id: string, role: string) => void;
  onChangeMemberQuota?: (id: string, quota: number) => void;
  catchAllEnabled: boolean;
  setCatchAllEnabled: (val: boolean) => void;
  catchAllForwardEmail: string;
  setCatchAllForwardEmail: (val: string) => void;
  globalDisclaimer?: string;
  setGlobalDisclaimer?: (val: string) => void;
  disclaimerSaved?: boolean;
  onSaveDisclaimer?: () => void;
  enforce2FA?: boolean;
  setEnforce2FA?: (val: boolean) => void;
  dailySendingLimit?: number;
  setDailySendingLimit?: (val: number) => void;
  sessionTimeout?: string;
  setSessionTimeout?: (val: string) => void;
  userProfileName: string;
  setUserProfileName: (val: string) => void;
  userJobTitle: string;
  setUserJobTitle: (val: string) => void;
  userRecoveryPhone: string;
  setUserRecoveryPhone: (val: string) => void;
  profileSaved: boolean;
  onSaveProfile: () => void;
  userSignature: string;
  setUserSignature: (val: string) => void;
  sigAutoInsertNew: boolean;
  setSigAutoInsertNew: (val: boolean) => void;
  sigIncludeReplies: boolean;
  setSigIncludeReplies: (val: boolean) => void;
  sigSaved: boolean;
  onSaveSignature: () => void;
  vacationResponderActive: boolean;
  setVacationResponderActive: (val: boolean) => void;
  vacationStartDate: string;
  setVacationStartDate: (val: string) => void;
  vacationEndDate: string;
  setVacationEndDate: (val: string) => void;
  vacationSubject: string;
  setVacationSubject: (val: string) => void;
  vacationMessage: string;
  setVacationMessage: (val: string) => void;
  vacationSaved: boolean;
  onSaveVacation: () => void;
  forwardingEnabled: boolean;
  setForwardingEnabled: (val: boolean) => void;
  forwardingAddress: string;
  setForwardingAddress: (val: string) => void;
  appPasswords: any[];
  newAppName: string;
  setNewAppName: (val: string) => void;
  generatedAppPass: string;
  onGenerateAppPassword: () => void;
  onRevokeAppPassword: (id: string) => void;
}

export function DashboardSettingsView({
  currentOrg,
  currentUser,
  currentDomain,
  onOpenUpgradeModal,
  catchAllEnabled,
  setCatchAllEnabled,
  catchAllForwardEmail,
  setCatchAllForwardEmail,
  userProfileName,
  setUserProfileName,
  userJobTitle,
  setUserJobTitle,
  userRecoveryPhone,
  setUserRecoveryPhone,
  profileSaved,
  onSaveProfile,
  userSignature,
  setUserSignature,
  sigAutoInsertNew,
  setSigAutoInsertNew,
  sigIncludeReplies,
  setSigIncludeReplies,
  sigSaved,
  onSaveSignature,
  vacationResponderActive,
  setVacationResponderActive,
  vacationStartDate,
  setVacationStartDate,
  vacationEndDate,
  setVacationEndDate,
  vacationSubject,
  setVacationSubject,
  vacationMessage,
  setVacationMessage,
  vacationSaved,
  onSaveVacation,
  forwardingEnabled,
  setForwardingEnabled,
  forwardingAddress,
  setForwardingAddress,
  appPasswords,
  newAppName,
  setNewAppName,
  generatedAppPass,
  onGenerateAppPassword,
  onRevokeAppPassword,
}: DashboardSettingsViewProps) {
  // Check if current authenticated mailbox has administrative privileges
  const isAdmin =
    currentUser?.role === "owner" ||
    currentUser?.role === "admin" ||
    currentUser?.role === "superadmin" ||
    currentUser?.isAdmin === true;

  const mailboxEmail = currentUser?.email || "user@acmedesign.co";
  const domainName = currentDomain?.domainName || mailboxEmail.split("@")[1] || "acmedesign.co";

  return (
    <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6 overflow-y-auto select-none">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Mailbox Settings</span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900">
              Personal &amp; Domain Config
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure your personal mailbox profile, auto-responders, email signature, and mobile client setup.
          </p>
        </div>

        {/* Quick Identity Card */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e131d] self-start sm:self-auto shadow-xs">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            {mailboxEmail.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {currentUser?.name || userProfileName || "Mailbox User"}
            </div>
            <div className="text-[11px] text-slate-400 font-mono leading-tight">{mailboxEmail}</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* CARD 1: PROFILE & DISPLAY NAME */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span>Mailbox Identity &amp; Profile</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">@{domainName}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Display Name</label>
              <input
                type="text"
                maxLength={70}
                value={userProfileName}
                onChange={(e) => setUserProfileName(sanitizeText(e.target.value, 70))}
                placeholder="e.g. Alex Carter"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Job Title / Department</label>
              <input
                type="text"
                maxLength={70}
                value={userJobTitle}
                onChange={(e) => setUserJobTitle(sanitizeText(e.target.value, 70))}
                placeholder="e.g. Managing Partner"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Mailbox Email Address</label>
              <input
                type="email"
                readOnly
                value={mailboxEmail}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 p-2.5 text-xs text-slate-500 font-mono cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Recovery Phone (SMS Alerts)</label>
              <input
                type="tel"
                maxLength={30}
                value={userRecoveryPhone}
                onChange={(e) => setUserRecoveryPhone(sanitizeText(e.target.value, 30))}
                placeholder="+1 (555) 019-2831"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onSaveProfile}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {profileSaved ? "✓ Profile Saved" : "Save Profile"}
            </button>
          </div>
        </div>

        {/* CARD 2: EMAIL SIGNATURE */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AtSign className="h-4 w-4 text-blue-600" />
              <span>Email Signature</span>
            </h2>
            <span className="text-[11px] text-slate-400">Appended to outgoing messages</span>
          </div>

          <div className="space-y-3">
            <textarea
              rows={4}
              maxLength={1000}
              value={userSignature}
              onChange={(e) => setUserSignature(sanitizeText(e.target.value, 1000))}
              placeholder="Best regards,&#10;Alex Carter | Managing Partner&#10;Acme Creative Studio | www.acmedesign.co"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs text-slate-900 dark:text-white resize-none font-mono leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sigAutoInsertNew}
                    onChange={(e) => setSigAutoInsertNew(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Insert on new messages</span>
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sigIncludeReplies}
                    onChange={(e) => setSigIncludeReplies(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Include on replies &amp; forwards</span>
                </label>
              </div>

              <button
                type="button"
                onClick={onSaveSignature}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {sigSaved ? "✓ Signature Saved" : "Save Signature"}
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: VACATION AUTO-RESPONDER */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>Vacation Auto-Responder (Out of Office)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically reply to incoming messages when away or unavailable.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={vacationResponderActive}
                onChange={(e) => setVacationResponderActive(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-9 h-5 rounded-full transition-colors ${
                  vacationResponderActive ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform mt-0.5 ${
                    vacationResponderActive ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
          </div>

          {vacationResponderActive && (
            <div className="space-y-3 pt-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Start Date</label>
                  <input
                    type="date"
                    value={vacationStartDate}
                    onChange={(e) => setVacationStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">End Date</label>
                  <input
                    type="date"
                    value={vacationEndDate}
                    onChange={(e) => setVacationEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Auto-Reply Subject</label>
                <input
                  type="text"
                  value={vacationSubject}
                  onChange={(e) => setVacationSubject(sanitizeText(e.target.value, 150))}
                  placeholder="Out of Office: Automated Response"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Response Message</label>
                <textarea
                  rows={3}
                  value={vacationMessage}
                  onChange={(e) => setVacationMessage(sanitizeText(e.target.value, 2000))}
                  placeholder="Thank you for your message. I am currently away from my inbox..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onSaveVacation}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  {vacationSaved ? "✓ Auto-Responder Saved" : "Save Auto-Responder"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CARD 4: MOBILE & DESKTOP SETUP (IMAP/SMTP & APP PASSWORDS) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span>Mobile &amp; Desktop Email Client Configuration</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Connect Apple Mail, Microsoft Outlook, Thunderbird, or Android to this mailbox.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              SSL / TLS 1.3 Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* Incoming IMAP */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between font-sans">
                <span>Incoming Server (IMAP)</span>
                <span className="text-emerald-600 text-[10px]">Port 993 (SSL)</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                Server: <span className="font-bold text-slate-900 dark:text-white">mail.zegacloud.com</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                Username: <span className="font-bold text-slate-900 dark:text-white">{mailboxEmail}</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                Security: <span className="text-blue-600">SSL/TLS (Encrypted)</span>
              </div>
            </div>

            {/* Outgoing SMTP */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between font-sans">
                <span>Outgoing Server (SMTP)</span>
                <span className="text-emerald-600 text-[10px]">Port 465 (SSL)</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                Server: <span className="font-bold text-slate-900 dark:text-white">mail.zegacloud.com</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                Username: <span className="font-bold text-slate-900 dark:text-white">{mailboxEmail}</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                Security: <span className="text-blue-600">SSL/TLS (RFC 3461 DSN)</span>
              </div>
            </div>
          </div>

          {/* App Specific Passwords Generator */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                <span>Dedicated App Passwords</span>
              </h3>
              <span className="text-[11px] text-slate-400">Generate isolated keys for mobile phones and mail apps</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={newAppName}
                onChange={(e) => setNewAppName(sanitizeText(e.target.value, 40))}
                placeholder="e.g. iPhone Mail, Outlook Laptop"
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 text-xs"
              />
              <button
                type="button"
                onClick={onGenerateAppPassword}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs shadow-xs hover:opacity-90 transition-opacity"
              >
                Generate Key
              </button>
            </div>

            {generatedAppPass && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold">Your New App Password:</span>{" "}
                  <code className="font-mono bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded font-bold text-amber-900 dark:text-amber-100">
                    {generatedAppPass}
                  </code>
                </div>
                <span className="text-[10px] text-amber-700 dark:text-amber-300">Copy now; not shown again</span>
              </div>
            )}

            {appPasswords && appPasswords.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                {appPasswords.map((pw: any) => (
                  <div key={pw.id} className="p-2.5 flex items-center justify-between text-xs bg-white dark:bg-slate-900">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{pw.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">Created {pw.createdAt}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRevokeAppPassword(pw.id)}
                      className="text-rose-600 text-[11px] font-semibold hover:underline"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CARD 5: DOMAIN & SUBSCRIPTION SERVICES */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Globe className="h-3.5 w-3.5 text-blue-500" />
            <span>Domain &amp; Subscription Controls</span>
          </div>

          {/* Catch-All Routing */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span>Domain Catch-All Routing ({domainName})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Forward incoming emails sent to non-existent addresses on your domain to a designated inbox.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={catchAllEnabled}
                  onChange={(e) => setCatchAllEnabled(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-9 h-5 rounded-full transition-colors ${
                    catchAllEnabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform mt-0.5 ${
                      catchAllEnabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </label>
            </div>

            {catchAllEnabled && (
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Forward Unmatched Messages To:
                </label>
                <input
                  type="email"
                  value={catchAllForwardEmail}
                  onChange={(e) => setCatchAllForwardEmail(e.target.value)}
                  placeholder={`admin@${domainName}`}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Centralized Billing & Plan Subscription */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span>Plan Invoices &amp; Client Portal Subscription</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Account subscriptions, domain additions, and receipts are managed via the ZegaCloud Client Portal.
                </p>
              </div>

              <a
                href="https://billing.zegacloud.com/clientarea.php?action=invoices"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
              >
                <span>Open ZegaCloud Billing &amp; Invoices</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Active Plan: </span>
                <span className="font-bold text-emerald-600 uppercase">
                  {currentOrg?.plan || "GROWTH"}
                </span>
                <span className="text-slate-400 ml-2">• Flat Domain Rate • Verified Inbox Delivery</span>
              </div>
              <a
                href="https://billing.zegacloud.com/upgrade.php"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Manage Upgrades →
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
