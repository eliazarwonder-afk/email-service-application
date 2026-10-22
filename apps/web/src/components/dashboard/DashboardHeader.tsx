"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  X,
  SlidersHorizontal,
  Sun,
  Moon,
  Smartphone,
  Globe,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
  User,
  Sparkles,
  BarChart3,
  Mail,
  Users,
  CreditCard,
  Building
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { ZegaLogo } from "@/components/ZegaLogo";

interface DashboardHeaderProps {
  activeTab: "mail" | "ai" | "campaigns" | "contacts" | "domains" | "settings";
  setActiveTab: (tab: "mail" | "ai" | "campaigns" | "contacts" | "domains" | "settings") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentDomain?: { domainName?: string };
  currentUser?: { name?: string; email?: string; role?: string };
  currentOrg?: { name?: string; plan?: string };
  onOpenClientModal: () => void;
  onOpenDomainModal: () => void;
  onOpenUpgradeModal: () => void;
  onLogout: () => void;
  onSwitchPersona: (email: string, pass: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DashboardHeader({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  currentDomain,
  currentUser,
  currentOrg,
  onOpenClientModal,
  onOpenDomainModal,
  onOpenUpgradeModal,
  onLogout,
  onSwitchPersona,
  isSidebarOpen,
  setIsSidebarOpen,
}: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AC";

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] px-4 flex items-center justify-between gap-3 shrink-0 z-30 transition-colors select-none">
      {/* LEFT: Hamburger Toggle & Brand Lockup */}
      <div className="flex items-center gap-3 shrink-0 min-w-0">
        <button
          type="button"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform active:scale-[0.98]"
          title="Return to ZegaMail Home"
        >
          {/* Full logo on desktop and tablet */}
          <div className="hidden sm:flex items-center gap-2">
            <ZegaLogo variant="full" imgClassName="h-7 sm:h-8" />
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Workspace
            </span>
          </div>

          {/* Compact Icon logo on mobile */}
          <div className="sm:hidden flex items-center gap-1.5">
            <ZegaLogo variant="icon" imgClassName="h-7" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Mail</span>
          </div>
        </Link>
      </div>

      {/* CENTER: Gmail-style Rounded Search Pill */}
      <div className="flex-1 max-w-2xl mx-2 sm:mx-6">
        <div className="relative flex items-center w-full">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mail, contacts, or documents..."
            className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:focus:bg-slate-900 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-full pl-10 pr-10 py-2 transition-all outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label="Clear Search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="absolute right-3.5 text-slate-400 pointer-events-none">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Quick Apps Navigation, Domain Status & User Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Workspace Quick Tabs (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("mail")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "mail"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Mail</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("campaigns")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "campaigns"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Campaigns</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("domains")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "domains"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Domains</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "settings"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Verified Domain Pill */}
        <div
          onClick={onOpenDomainModal}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
          title="Domain DNS Status: Active & Encrypted"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate max-w-[130px] font-medium">{currentDomain?.domainName || "acmedesign.co"}</span>
        </div>

        {/* Connect Phone / Mobile App Setup */}
        <button
          type="button"
          onClick={onOpenClientModal}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors"
          title="Connect to Apple Mail, Outlook, or Thunderbird"
        >
          <Smartphone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Mobile Setup</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Dark/Light Mode"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="User profile and organization menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {initials}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111625] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Profile Card Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.name || "Alex Carter"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                  {currentUser?.email || "sales@acmedesign.co"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-[10px] font-medium capitalize">
                    {currentUser?.role || "Owner"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-medium uppercase font-mono">
                    {currentOrg?.plan || "GROWTH"}
                  </span>
                </div>
              </div>

              {/* Persona Switcher for Interactive Demo */}
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Switch Persona (Demo)
                </span>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchPersona("owner@zegacloud.com", "OwnerDemo#2026");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    👑 Workspace Owner (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchPersona("sales@acmedesign.co", "SalesDemo#2026");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    💼 Sales Lead (Member)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchPersona("support@zegacloud.com", "SupportDemo#2026");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    🎧 Support Desk (Routing)
                  </button>
                </div>
              </div>

              {/* Navigation Links inside User Dropdown */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("settings");
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  <span>Account & Quotas</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenUpgradeModal();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2.5 font-medium"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Billing & Subscription</span>
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
