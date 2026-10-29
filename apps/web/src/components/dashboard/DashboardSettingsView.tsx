"use client";

import React from "react";
import {
  Building,
  User,
  CreditCard,
  DollarSign,
  Plus,
  Check,
  Clock,
  ShieldCheck,
  UserPlus,
  Lock,
  Globe,
  Sliders,
  Smartphone,
  Trash2,
  CheckCircle2,
  Calendar,
  AtSign,
  ExternalLink
} from "lucide-react";
import { sanitizeText } from "@/lib/validation";

interface DashboardSettingsViewProps {
  settingsPerspective: "admin" | "member";
  setSettingsPerspective: (val: "admin" | "member") => void;
  currentOrg: any;
  currentUser: any;
  currentDomain: any;
  billingOrders: any[];
  onOpenUpgradeModal: () => void;
  onOpenAddMemberModal: () => void;
  adminTeamMembers: any[];
  onToggleMemberStatus: (id: string) => void;
  onChangeMemberRole: (id: string, role: string) => void;
  onChangeMemberQuota: (id: string, quota: number) => void;
  catchAllEnabled: boolean;
  setCatchAllEnabled: (val: boolean) => void;
  catchAllForwardEmail: string;
  setCatchAllForwardEmail: (val: string) => void;
  globalDisclaimer: string;
  setGlobalDisclaimer: (val: string) => void;
  disclaimerSaved: boolean;
  onSaveDisclaimer: () => void;
  enforce2FA: boolean;
  setEnforce2FA: (val: boolean) => void;
  dailySendingLimit: number;
  setDailySendingLimit: (val: number) => void;
  sessionTimeout: string;
  setSessionTimeout: (val: string) => void;
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
  settingsPerspective,
  setSettingsPerspective,
  currentOrg,
  currentUser,
  currentDomain,
  billingOrders,
  onOpenUpgradeModal,
  onOpenAddMemberModal,
  adminTeamMembers,
  onToggleMemberStatus,
  onChangeMemberRole,
  onChangeMemberQuota,
  catchAllEnabled,
  setCatchAllEnabled,
  catchAllForwardEmail,
  setCatchAllForwardEmail,
  globalDisclaimer,
  setGlobalDisclaimer,
  disclaimerSaved,
  onSaveDisclaimer,
  enforce2FA,
  setEnforce2FA,
  dailySendingLimit,
  setDailySendingLimit,
  sessionTimeout,
  setSessionTimeout,
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
  return (
    <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6 overflow-y-auto select-none">
      {/* Header and Perspective Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Settings &amp; Access Controls</span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900">
              RBAC Enforced
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {settingsPerspective === "admin"
              ? "Super Admin perspective: Manage team mailboxes, quotas, catch-all routing & billing."
              : "User perspective: Configure personal signature, vacation auto-responder & mobile app passwords."}
          </p>
        </div>

        {/* Perspective Toggle: Admin (Owner) vs User (Member) */}
        <div className="inline-flex rounded-xl p-1 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#111625] self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setSettingsPerspective("admin")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              settingsPerspective === "admin"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Building className="h-3.5 w-3.5 text-blue-600" />
            <span>👑 Super Admin</span>
          </button>
          <button
            type="button"
            onClick={() => setSettingsPerspective("member")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              settingsPerspective === "member"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User className="h-3.5 w-3.5 text-emerald-600" />
            <span>👤 Member Profile</span>
          </button>
        </div>
      </div>

      {/* PERSPECTIVE A: SUPER ADMIN & ORGANIZATION OWNER */}
      {settingsPerspective === "admin" && (
        <div className="space-y-6">
          {/* Organization Profile Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {currentOrg?.name ? currentOrg.name.slice(0, 2).toUpperCase() : "AC"}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {currentOrg?.name || "Acme Creative Studio Ltd"}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Client Account ID: #{currentOrg?.whmcsClientId?.replace("WHMCS", "ZCL") || "ZCL-CL-40192"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold px-3 py-1 border border-emerald-200 dark:border-emerald-800">
                  {currentOrg?.plan?.toUpperCase() || "GROWTH"} Plan • Flat Monthly Billing
                </span>
                <button
                  type="button"
                  onClick={onOpenUpgradeModal}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Manage Plan &amp; Upgrade</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Tenant Super Admin Email
                </label>
                <input
                  type="email"
                  readOnly
                  value={currentUser?.email || "alex@acmedesign.co"}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs font-mono text-slate-700 dark:text-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Primary Verified Domain
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentDomain?.domainName || "acmedesign.co"}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs font-mono text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Billing Orders & Invoices */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span>Billing &amp; Subscription Management</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Subscriptions, payment methods, receipts, and upgrades are managed via the ZegaCloud Client Portal.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <a
                  href="https://billing.zegacloud.com/clientarea.php?action=invoices"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-all"
                >
                  <span>View Invoices &amp; Billing</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">Active Plan:</span>
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-200 dark:border-emerald-800 uppercase">
                    {currentOrg?.plan || "GROWTH"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Flat domain billing with unlimited aliases, guaranteed inbox deliverability, and round-the-clock priority support.
                </p>
              </div>
              <a
                href="https://billing.zegacloud.com/upgrade.php"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                <span>Change Plan</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Team Members & Mailbox Quotas */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                    <span>Team Mailboxes &amp; Quotas</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View active team mailboxes provisioned for your company domain.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://billing.zegacloud.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Manage in ZegaCloud Portal</span>
                  </a>
                </div>
              </div>

              {/* Cloud Provisioning Architecture Notice */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start sm:items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
                  <span>
                    <strong>Titan-Style Mailbox Architecture:</strong> New mailboxes (e.g. <code>support@acmedesign.co</code>), domain additions, and subscription upgrades are managed centrally via the <strong>ZegaCloud Client Area</strong>. Each mailbox receives dedicated login credentials for webmail.
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                  <thead className="bg-slate-50 dark:bg-[#0e131d] border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-white">User &amp; Mailbox</th>
                      <th className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-white">Role</th>
                      <th className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-white">Storage Quota</th>
                      <th className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-white">Status</th>
                      <th className="py-2.5 px-3.5 text-right font-semibold text-slate-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {adminTeamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3.5">
                          <span className="font-semibold text-slate-900 dark:text-white">{member.name}</span>
                          <div className="text-[11px] text-slate-400 font-mono">{member.email}</div>
                        </td>
                        <td className="py-3 px-3.5">
                          <select
                            value={member.role}
                            onChange={(e) => onChangeMemberRole(member.id, e.target.value)}
                            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
                          >
                            <option value="Owner">Owner</option>
                            <option value="Admin">Admin</option>
                            <option value="Member">Member</option>
                          </select>
                        </td>
                        <td className="py-3 px-3.5">
                          <select
                            value={member.quotaMb}
                            onChange={(e) => onChangeMemberQuota(member.id, Number(e.target.value))}
                            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
                          >
                            <option value={5000}>5.0 GB Quota</option>
                            <option value={10000}>10.0 GB Quota</option>
                            <option value={25000}>25.0 GB Quota</option>
                          </select>
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              member.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => onToggleMemberStatus(member.id)}
                            className="text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400"
                          >
                            {member.status === "Active" ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERSPECTIVE B: MAILBOX USER (MEMBER VIEW) */}
      {settingsPerspective === "member" && (
        <div className="space-y-6">
          {/* Member Profile */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span>Personal Profile &amp; Display Name</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Display Name</label>
                <input
                  type="text"
                  maxLength={70}
                  value={userProfileName}
                  onChange={(e) => setUserProfileName(sanitizeText(e.target.value, 70))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Job Title</label>
                <input
                  type="text"
                  maxLength={70}
                  value={userJobTitle}
                  onChange={(e) => setUserJobTitle(sanitizeText(e.target.value, 70))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onSaveProfile}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                {profileSaved ? "✓ Profile Saved" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Email Signature */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AtSign className="h-4 w-4 text-blue-600" />
              <span>Email Signature</span>
            </h2>

            <textarea
              rows={4}
              maxLength={1000}
              value={userSignature}
              onChange={(e) => setUserSignature(sanitizeText(e.target.value, 1000))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs text-slate-900 dark:text-white resize-none font-mono"
            />

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onSaveSignature}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                {sigSaved ? "✓ Signature Saved" : "Save Signature"}
              </button>
            </div>
          </div>

          {/* Vacation Responder */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>Vacation Auto-Responder (Out of Office)</span>
              </h2>

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
              <div className="space-y-3 pt-2 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Start Date</label>
                    <input
                      type="date"
                      value={vacationStartDate}
                      onChange={(e) => setVacationStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">End Date</label>
                    <input
                      type="date"
                      value={vacationEndDate}
                      onChange={(e) => setVacationEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                  <input
                    type="text"
                    value={vacationSubject}
                    onChange={(e) => setVacationSubject(sanitizeText(e.target.value, 150))}
                    placeholder="Out of Office: Automated Response"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Message</label>
                  <textarea
                    rows={3}
                    value={vacationMessage}
                    onChange={(e) => setVacationMessage(sanitizeText(e.target.value, 2000))}
                    placeholder="I am currently away from my inbox..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 text-xs resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={onSaveVacation}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                  >
                    {vacationSaved ? "✓ Auto-Responder Saved" : "Save Responder"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
