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
  AtSign
} from "lucide-react";

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
              ? "Super Admin perspective: Manage team mailboxes, quotas, catch-all routing & crypto invoices."
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
                  <span>Upgrade (Crypto &amp; Card)</span>
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
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span>Orders, Invoices &amp; Crypto Payments</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Subscriptions and transaction receipts. Pay with USDT, Bitcoin, Solana, or Credit Card.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ New Order / Upgrade</span>
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[640px]">
                  <thead className="bg-slate-50 dark:bg-[#0e131d] border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-white">Order &amp; Invoice #</th>
                      <th className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-white">Subscription</th>
                      <th className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-white">Gateway</th>
                      <th className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-white">Amount</th>
                      <th className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-white">Crypto TX</th>
                      <th className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {billingOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-5 text-center text-slate-400">
                          No active billing orders found.
                        </td>
                      </tr>
                    ) : (
                      billingOrders.map((ord: any) => (
                        <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 px-3.5 font-mono">
                            <span className="font-semibold text-slate-900 dark:text-white">{ord.orderNumber}</span>
                            <br />
                            <span className="text-[10px] text-slate-400">{ord.invoiceId}</span>
                          </td>
                          <td className="py-2.5 px-3.5">
                            <span className="font-medium text-slate-900 dark:text-white">{ord.planName}</span>
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300">
                            {ord.paymentMethodName}
                          </td>
                          <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900 dark:text-white">
                            ${Number(ord.amount).toFixed(2)} USD
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-[10px]">
                            {ord.cryptoDetails?.txHash ? (
                              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                {ord.cryptoDetails.txHash.slice(0, 8)}...
                              </span>
                            ) : (
                              <span className="text-slate-400">Card / Fiat</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                              <Check className="h-3 w-3" /> Paid &amp; Active
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Team Members & Mailbox Quotas */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  <span>Team Mailboxes &amp; Quotas</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allocate dedicated storage quotas and RBAC roles across team accounts.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenAddMemberModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Provision Member</span>
              </button>
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
                  value={userProfileName}
                  onChange={(e) => setUserProfileName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Job Title</label>
                <input
                  type="text"
                  value={userJobTitle}
                  onChange={(e) => setUserJobTitle(e.target.value)}
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
              value={userSignature}
              onChange={(e) => setUserSignature(e.target.value)}
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
                    onChange={(e) => setVacationSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Message</label>
                  <textarea
                    rows={3}
                    value={vacationMessage}
                    onChange={(e) => setVacationMessage(e.target.value)}
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
