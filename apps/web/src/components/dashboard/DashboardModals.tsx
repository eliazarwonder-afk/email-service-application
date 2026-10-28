"use client";

import React, { useState } from "react";
import {
  X,
  Smartphone,
  Globe,
  FolderPlus,
  UserPlus,
  CheckCircle2,
  ExternalLink,
  Laptop,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  validateDomain,
  validateFolderName,
  validateFullName,
  validateMailboxUsername,
} from "@/lib/validation";
import { FormField } from "@/components/ui/FormField";

interface DashboardModalsProps {
  // Mobile / Client Setup Modal
  isClientModalOpen: boolean;
  onCloseClientModal: () => void;
  // Domain Search & Order Modal
  isWhmcsDomainModalOpen: boolean;
  onCloseWhmcsDomainModal: () => void;
  whmcsSearchDomain: string;
  setWhmcsSearchDomain: (val: string) => void;
  whmcsDomainAvailable: boolean | null;
  isOrderingDomain: boolean;
  domainOrderSuccess: string;
  onOrderWhmcsDomain: (e: React.FormEvent) => void;
  onSearchWhmcsDomain: (domain: string) => void;
  // New Custom Folder Modal
  isNewFolderModalOpen: boolean;
  onCloseNewFolderModal: () => void;
  newFolderName: string;
  setNewFolderName: (val: string) => void;
  newFolderColor: string;
  setNewFolderColor: (val: string) => void;
  onCreateFolder: (e: React.FormEvent) => void;
  // Provision Team Member Modal
  isAddMemberModalOpen: boolean;
  onCloseAddMemberModal: () => void;
  newMemberName: string;
  setNewMemberName: (val: string) => void;
  newMemberEmailPrefix: string;
  setNewMemberEmailPrefix: (val: string) => void;
  newMemberRole: string;
  setNewMemberRole: (val: string) => void;
  newMemberQuotaMb: number;
  setNewMemberQuotaMb: (val: number) => void;
  memberSuccessMessage: string;
  onCreateMember: (e: React.FormEvent) => void;
  currentDomainName?: string;
}

export function DashboardModals({
  isClientModalOpen,
  onCloseClientModal,
  isWhmcsDomainModalOpen,
  onCloseWhmcsDomainModal,
  whmcsSearchDomain,
  setWhmcsSearchDomain,
  whmcsDomainAvailable,
  isOrderingDomain,
  domainOrderSuccess,
  onOrderWhmcsDomain,
  onSearchWhmcsDomain,
  isNewFolderModalOpen,
  onCloseNewFolderModal,
  newFolderName,
  setNewFolderName,
  newFolderColor,
  setNewFolderColor,
  onCreateFolder,
  isAddMemberModalOpen,
  onCloseAddMemberModal,
  newMemberName,
  setNewMemberName,
  newMemberEmailPrefix,
  setNewMemberEmailPrefix,
  newMemberRole,
  setNewMemberRole,
  newMemberQuotaMb,
  setNewMemberQuotaMb,
  memberSuccessMessage,
  onCreateMember,
  currentDomainName = "acmedesign.co",
}: DashboardModalsProps) {
  // Modal internal validation states
  const [domainInputTouched, setDomainInputTouched] = useState(false);
  const [folderInputTouched, setFolderInputTouched] = useState(false);
  const [memberNameTouched, setMemberNameTouched] = useState(false);
  const [memberPrefixTouched, setMemberPrefixTouched] = useState(false);

  const domainVal = whmcsSearchDomain.trim() ? validateDomain(whmcsSearchDomain) : { isValid: false, error: "Please enter a domain name." };
  const folderVal = newFolderName.trim() ? validateFolderName(newFolderName) : { isValid: false, error: "Folder name is required." };
  const memberNameVal = newMemberName.trim() ? validateFullName(newMemberName, "Full Name") : { isValid: false, error: "Full name is required." };
  const memberPrefixVal = newMemberEmailPrefix.trim() ? validateMailboxUsername(newMemberEmailPrefix) : { isValid: false, error: "Mailbox prefix is required." };
  return (
    <>
      {/* 1. CONNECT PHONE & DESKTOP IMAP/SMTP MODAL */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Connect Phone &amp; Desktop
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Native sync for Apple Mail, Outlook, &amp; Thunderbird
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseClientModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Incoming Server (IMAP SSL)
              </h4>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 text-[10px]">Server Host</p>
                  <p className="font-mono font-medium text-slate-800 dark:text-slate-200">mail.zegamail.com</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 text-[10px]">Port / Encryption</p>
                  <p className="font-mono font-medium text-slate-800 dark:text-slate-200">993 (SSL/TLS)</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Outgoing Server (SMTP SSL)
              </h4>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 text-[10px]">Server Host</p>
                  <p className="font-mono font-medium text-slate-800 dark:text-slate-200">smtp.zegamail.com</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 text-[10px]">Port / Encryption</p>
                  <p className="font-mono font-medium text-slate-800 dark:text-slate-200">465 (SSL/TLS)</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onCloseClientModal}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REGISTER / ORDER DOMAIN MODAL */}
      {isWhmcsDomainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Register New Domain
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Instant DNS configuration &amp; DKIM provisioning
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseWhmcsDomainModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {domainOrderSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{domainOrderSuccess}</span>
              </div>
            )}

            <form onSubmit={onOrderWhmcsDomain} className="space-y-4">
              <FormField
                id="whmcsSearchDomain"
                label="Enter Domain Name"
                required
                error={domainInputTouched && !domainVal.isValid ? domainVal.error : null}
                isValid={domainInputTouched && domainVal.isValid}
                helperText={!domainInputTouched ? "Check real-time availability across Global Anycast DNS" : undefined}
              >
                <div className="flex gap-2">
                  <input
                    id="whmcsSearchDomain"
                    type="text"
                    required
                    placeholder="e.g. acmepreferred.com"
                    value={whmcsSearchDomain}
                    onChange={(e) => {
                      setWhmcsSearchDomain(e.target.value.toLowerCase().trim());
                      if (!domainInputTouched) setDomainInputTouched(true);
                    }}
                    onBlur={() => setDomainInputTouched(true)}
                    className={`flex-1 rounded-xl border px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 font-mono transition-colors ${
                      domainInputTouched && !domainVal.isValid
                        ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500"
                        : domainInputTouched && domainVal.isValid
                        ? "border-emerald-500/70 bg-emerald-50/10 focus:ring-emerald-500"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus:ring-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDomainInputTouched(true);
                      if (domainVal.isValid) onSearchWhmcsDomain(whmcsSearchDomain);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                  >
                    Check
                  </button>
                </div>
              </FormField>

              {whmcsDomainAvailable !== null && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    whmcsDomainAvailable
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  <span className="font-semibold">
                    {whmcsDomainAvailable
                      ? `✓ ${whmcsSearchDomain} is available! ($12.00/yr)`
                      : `✗ ${whmcsSearchDomain} is already registered.`}
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseWhmcsDomainModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOrderingDomain}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {isOrderingDomain ? "Registering..." : "Register & Connect DNS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. NEW CUSTOM FOLDER MODAL */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-blue-600" />
                <span>Create Custom Folder</span>
              </h3>
              <button
                type="button"
                onClick={onCloseNewFolderModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={onCreateFolder} className="space-y-4">
              <FormField
                id="newFolderName"
                label="Folder Name"
                required
                error={folderInputTouched && !folderVal.isValid ? folderVal.error : null}
                isValid={folderInputTouched && folderVal.isValid}
                helperText={!folderInputTouched ? "Organize incoming client leads and receipts" : undefined}
              >
                <input
                  id="newFolderName"
                  type="text"
                  required
                  placeholder="e.g. VIP Clients, Invoices, Partners"
                  value={newFolderName}
                  onChange={(e) => {
                    setNewFolderName(e.target.value);
                    if (!folderInputTouched) setFolderInputTouched(true);
                  }}
                  onBlur={() => setFolderInputTouched(true)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 transition-colors ${
                    folderInputTouched && !folderVal.isValid
                      ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500"
                      : folderInputTouched && folderVal.isValid
                      ? "border-emerald-500/70 bg-emerald-50/10 focus:ring-emerald-500"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus:ring-blue-500"
                  }`}
                />
              </FormField>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Label Color
                </label>
                <div className="flex items-center gap-2.5">
                  {["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#ef4444", "#64748b"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewFolderColor(color)}
                      className={`h-7 w-7 rounded-full border-2 transition-transform ${
                        newFolderColor === color
                          ? "scale-110 border-slate-900 dark:border-white shadow-xs"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseNewFolderModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. PROVISION TEAM MEMBER MODAL */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Provision Mailbox Member
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Add new user under @{currentDomainName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseAddMemberModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {memberSuccessMessage && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{memberSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={onCreateMember} className="space-y-3.5">
              <FormField
                id="newMemberName"
                label="Full Name"
                required
                error={memberNameTouched && !memberNameVal.isValid ? memberNameVal.error : null}
                isValid={memberNameTouched && memberNameVal.isValid}
                helperText={!memberNameTouched ? "e.g. Jordan Rivera" : undefined}
              >
                <input
                  id="newMemberName"
                  type="text"
                  required
                  placeholder="e.g. Jordan Rivera"
                  value={newMemberName}
                  onChange={(e) => {
                    setNewMemberName(e.target.value);
                    if (!memberNameTouched) setMemberNameTouched(true);
                  }}
                  onBlur={() => setMemberNameTouched(true)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 transition-colors ${
                    memberNameTouched && !memberNameVal.isValid
                      ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500"
                      : memberNameTouched && memberNameVal.isValid
                      ? "border-emerald-500/70 bg-emerald-50/10 focus:ring-emerald-500"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus:ring-blue-500"
                  }`}
                />
              </FormField>

              <FormField
                id="newMemberEmailPrefix"
                label="Mailbox Prefix"
                required
                error={memberPrefixTouched && !memberPrefixVal.isValid ? memberPrefixVal.error : null}
                isValid={memberPrefixTouched && memberPrefixVal.isValid}
                helperText={!memberPrefixTouched ? "Letters, numbers, dots, and hyphens only" : undefined}
              >
                <div className={`flex items-center rounded-xl border bg-slate-50 dark:bg-slate-900/60 overflow-hidden focus-within:ring-2 transition-colors ${
                  memberPrefixTouched && !memberPrefixVal.isValid
                    ? "border-rose-400 focus-within:ring-rose-500"
                    : memberPrefixTouched && memberPrefixVal.isValid
                    ? "border-emerald-500/70 focus-within:ring-emerald-500"
                    : "border-slate-200 dark:border-slate-800 focus-within:ring-blue-500"
                }`}>
                  <input
                    id="newMemberEmailPrefix"
                    type="text"
                    required
                    placeholder="jordan"
                    value={newMemberEmailPrefix}
                    onChange={(e) => {
                      setNewMemberEmailPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""));
                      if (!memberPrefixTouched) setMemberPrefixTouched(true);
                    }}
                    onBlur={() => setMemberPrefixTouched(true)}
                    className="flex-1 bg-transparent px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <span className="px-3 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 py-2 border-l border-slate-200 dark:border-slate-800 font-mono">
                    @{currentDomainName}
                  </span>
                </div>
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role &amp; Permission
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                    <option value="Billing">Billing Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dedicated Quota
                  </label>
                  <select
                    value={newMemberQuotaMb}
                    onChange={(e) => setNewMemberQuotaMb(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value={5000}>5.0 GB Quota</option>
                    <option value={10000}>10.0 GB Quota</option>
                    <option value={25000}>25.0 GB Quota</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseAddMemberModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                >
                  Provision Mailbox
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
