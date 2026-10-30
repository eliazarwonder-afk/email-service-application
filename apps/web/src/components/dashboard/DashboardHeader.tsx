"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
  User,
  BarChart3,
  Mail,
  Users,
  CreditCard,
  Send,
  Star,
  FileText,
  Archive,
  Trash2,
  AlertOctagon,
  Inbox,
  Sparkles,
  PenSquare,
  Calendar,
  ArrowRight,
  Command,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { ZegaLogo } from "@/components/ZegaLogo";
import { sanitizeSearchQuery } from "@/lib/validation";

interface CommandItem {
  id: string;
  category: "Quick Actions" | "Workspaces & Tools" | "Mailbox Navigation" | "Settings & Config" | "Preferences";
  title: string;
  description: string;
  icon: React.ElementType;
  keywords: string[];
  shortcut?: string;
  onSelect: () => void;
}

interface DashboardHeaderProps {
  activeTab: "mail" | "ai" | "campaigns" | "contacts" | "settings";
  setActiveTab: (tab: "mail" | "ai" | "campaigns" | "contacts" | "settings") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentDomain?: { domainName?: string };
  currentUser?: { name?: string; email?: string; role?: string };
  currentOrg?: { name?: string; plan?: string };
  messages?: any[];
  contacts?: any[];
  onOpenCompose: () => void;
  onComposeTo?: (email: string) => void;
  onSelectFolder: (folder: string) => void;
  onSelectMessage: (id: string) => void;
  onOpenClientModal: () => void;
  onOpenDomainModal?: () => void;
  onOpenUpgradeModal: () => void;
  onLogout: () => void;
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
  messages = [],
  contacts = [],
  onOpenCompose,
  onComposeTo,
  onSelectFolder,
  onSelectMessage,
  onOpenClientModal,
  onOpenDomainModal,
  onOpenUpgradeModal,
  onLogout,
  isSidebarOpen,
  setIsSidebarOpen,
}: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
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

  // Comprehensive System Commands, Functions & Navigation
  const allCommands = useMemo<CommandItem[]>(() => {
    return [
      {
        id: "cmd_compose",
        category: "Quick Actions",
        title: "Compose New Email",
        description: "Open composer to draft and send a message",
        icon: PenSquare,
        shortcut: "C",
        keywords: ["compose", "new", "email", "write", "send", "message", "draft", "outbox", "mailto"],
        onSelect: () => {
          onOpenCompose();
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_inbox",
        category: "Mailbox Navigation",
        title: "Inbox",
        description: "View incoming business emails and threads",
        icon: Inbox,
        keywords: ["inbox", "incoming", "received", "unread", "messages", "threads", "primary"],
        onSelect: () => {
          onSelectFolder("inbox");
          setActiveTab("mail");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_campaigns",
        category: "Workspaces & Tools",
        title: "Campaigns & Cadences",
        description: "Multi-mailbox sender rotation, cold email sequences & drip outreach",
        icon: BarChart3,
        keywords: ["campaign", "cadence", "outreach", "cold mail", "drip", "rotation", "leads", "sequence", "blasts"],
        onSelect: () => {
          setActiveTab("campaigns");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_ai",
        category: "Workspaces & Tools",
        title: "AI Email Copy Studio",
        description: "Generate high-converting personalized email templates with AI",
        icon: Sparkles,
        keywords: ["ai", "studio", "copy", "generator", "template", "writer", "prompt", "sales", "gpt", "assistant"],
        onSelect: () => {
          setActiveTab("ai");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_contacts",
        category: "Workspaces & Tools",
        title: "Contacts & Lead Directory",
        description: "Manage client directory, CSV bulk import, and custom contact lists",
        icon: Users,
        keywords: ["contacts", "clients", "leads", "directory", "lists", "csv", "import", "bulk upload", "address book"],
        onSelect: () => {
          setActiveTab("contacts");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_sent",
        category: "Mailbox Navigation",
        title: "Sent Mail",
        description: "View delivered messages and live tracking receipts",
        icon: Send,
        keywords: ["sent", "outbound", "delivered", "outgoing", "receipts", "tracking"],
        onSelect: () => {
          onSelectFolder("sent");
          setActiveTab("mail");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_starred",
        category: "Mailbox Navigation",
        title: "Starred Messages",
        description: "Flagged and bookmarked important correspondence",
        icon: Star,
        keywords: ["starred", "favorite", "flagged", "saved", "pinned", "important"],
        onSelect: () => {
          onSelectFolder("starred");
          setActiveTab("mail");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_drafts",
        category: "Mailbox Navigation",
        title: "Drafts",
        description: "Saved incomplete and pending email drafts",
        icon: FileText,
        keywords: ["drafts", "unsent", "pending", "in-progress"],
        onSelect: () => {
          onSelectFolder("drafts");
          setActiveTab("mail");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_archive",
        category: "Mailbox Navigation",
        title: "Archive",
        description: "Archived historical correspondence",
        icon: Archive,
        keywords: ["archive", "archived", "history", "old", "storage"],
        onSelect: () => {
          onSelectFolder("archive");
          setActiveTab("mail");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_spam",
        category: "Mailbox Navigation",
        title: "Spam & Junk Filter",
        description: "Filtered suspicious and promotional mail",
        icon: AlertOctagon,
        keywords: ["spam", "junk", "filter", "blocked", "phishing"],
        onSelect: () => {
          onSelectFolder("spam");
          setActiveTab("mail");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_trash",
        category: "Mailbox Navigation",
        title: "Trash & Deleted",
        description: "Deleted messages and recovery bin",
        icon: Trash2,
        keywords: ["trash", "deleted", "bin", "recycle", "remove"],
        onSelect: () => {
          onSelectFolder("trash");
          setActiveTab("mail");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_mobile",
        category: "Settings & Config",
        title: "Mobile & Client Setup",
        description: "IMAP, POP3, and SMTP setup for iPhone, Apple Mail, Outlook & Android",
        icon: Smartphone,
        keywords: ["mobile", "iphone", "apple mail", "outlook", "android", "thunderbird", "imap", "smtp", "sync", "phone"],
        onSelect: () => {
          onOpenClientModal();
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_settings",
        category: "Settings & Config",
        title: "Mailbox Settings & Profile",
        description: "Display name, mailbox credentials, and general settings",
        icon: Settings,
        keywords: ["settings", "account", "profile", "display name", "password", "preferences"],
        onSelect: () => {
          setActiveTab("settings");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_signature",
        category: "Settings & Config",
        title: "Email Signature & Disclaimer",
        description: "Customize rich HTML email signature and 2048-bit DKIM legal disclaimer",
        icon: FileText,
        keywords: ["signature", "sign-off", "footer", "disclaimer", "dkim", "branding"],
        onSelect: () => {
          setActiveTab("settings");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_vacation",
        category: "Settings & Config",
        title: "Vacation Responder (Out of Office)",
        description: "Configure automated out-of-office message and holiday dates",
        icon: Calendar,
        keywords: ["vacation", "out of office", "ooo", "autoresponder", "away", "auto reply", "holiday"],
        onSelect: () => {
          setActiveTab("settings");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_catchall",
        category: "Settings & Config",
        title: "Domain Catch-All Routing",
        description: "Forward unmatched incoming domain emails to a designated mailbox",
        icon: Globe,
        keywords: ["catchall", "catch-all", "routing", "forwarding", "domain", "alias"],
        onSelect: () => {
          setActiveTab("settings");
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_billing",
        category: "Settings & Config",
        title: "Billing & Subscription Portal",
        description: "Manage subscription plan, invoices, and storage upgrades",
        icon: CreditCard,
        keywords: ["billing", "plan", "quota", "invoices", "upgrade", "subscription", "storage"],
        onSelect: () => {
          onOpenUpgradeModal();
          setIsSearchOpen(false);
        },
      },
      {
        id: "cmd_theme",
        category: "Preferences",
        title: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        description: theme === "dark" ? "Switch to high-contrast crisp light interface" : "Switch to sleek night theme",
        icon: theme === "dark" ? Sun : Moon,
        keywords: ["dark mode", "light mode", "theme", "appearance", "toggle theme", "night", "day"],
        onSelect: () => {
          toggleTheme();
          setIsSearchOpen(false);
        },
      },
    ];
  }, [theme, toggleTheme, onOpenCompose, onSelectFolder, setActiveTab, onOpenClientModal, onOpenUpgradeModal]);

  // Matching Commands / Menus / Features
  const matchingCommands = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // Default view: top recommended shortcuts
      return allCommands.slice(0, 8);
    }
    return allCommands.filter((cmd) => {
      if (cmd.title.toLowerCase().includes(q)) return true;
      if (cmd.description.toLowerCase().includes(q)) return true;
      if (cmd.category.toLowerCase().includes(q)) return true;
      return cmd.keywords.some((k) => k.toLowerCase().includes(q));
    });
  }, [searchQuery, allCommands]);

  // Matching Emails
  const matchingEmails = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || !messages.length) return [];
    return messages
      .filter((m) => {
        return (
          m.subject?.toLowerCase().includes(q) ||
          m.from?.toLowerCase().includes(q) ||
          m.body?.toLowerCase().includes(q)
        );
      })
      .slice(0, 4);
  }, [searchQuery, messages]);

  // Matching Contacts
  const matchingContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || !contacts.length) return [];
    return contacts
      .filter((c) => {
        return (
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.jobTitle?.toLowerCase().includes(q)
        );
      })
      .slice(0, 3);
  }, [searchQuery, contacts]);

  // Unified Flat Results for Keyboard Arrow Navigation
  type SearchResultItem =
    | { kind: "command"; item: CommandItem }
    | { kind: "email"; item: any }
    | { kind: "contact"; item: any };

  const flatResults = useMemo<SearchResultItem[]>(() => {
    const list: SearchResultItem[] = [];
    matchingCommands.forEach((cmd) => list.push({ kind: "command", item: cmd }));
    matchingEmails.forEach((email) => list.push({ kind: "email", item: email }));
    matchingContacts.forEach((contact) => list.push({ kind: "contact", item: contact }));
    return list;
  }, [matchingCommands, matchingEmails, matchingContacts]);

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setIsSearchOpen(true);
      return;
    }

    if (e.key === "Escape") {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
      return;
    }

    if (flatResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flatResults[selectedIndex];
      if (target) {
        if (target.kind === "command") {
          target.item.onSelect();
        } else if (target.kind === "email") {
          onSelectMessage(target.item.id);
          setActiveTab("mail");
          setIsSearchOpen(false);
        } else if (target.kind === "contact") {
          if (onComposeTo) {
            onComposeTo(target.item.email);
          } else {
            onOpenCompose();
          }
          setIsSearchOpen(false);
        }
      }
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] px-4 flex items-center justify-between gap-3 shrink-0 z-30 transition-colors select-none">
      {/* LEFT: Hamburger Toggle & Brand Lockup */}
      <div className="flex items-center gap-3 shrink-0 min-w-0">
        <button
          type="button"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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

      {/* CENTER: Functional Command Search Bar & Feature Finder */}
      <div className="flex-1 max-w-2xl mx-2 sm:mx-6 relative" ref={searchContainerRef}>
        <div className="relative flex items-center w-full">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(sanitizeSearchQuery(e.target.value, 80));
              if (!isSearchOpen) setIsSearchOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search mail, contacts, or features (e.g. compose, campaigns, settings)..."
            className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:focus:bg-slate-900 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-full pl-10 pr-10 py-2 transition-all outline-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              aria-label="Clear Search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="absolute right-3.5 text-slate-400 pointer-events-none flex items-center gap-1">
              <span className="text-[10px] font-mono border border-slate-300 dark:border-slate-700 px-1 rounded text-slate-400 hidden md:inline">
                /
              </span>
            </div>
          )}
        </div>

        {/* FLOATING COMMAND PALETTE / SEARCH DROPDOWN */}
        {isSearchOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 max-h-[460px] overflow-y-auto rounded-2xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            {flatResults.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  No matching functions or results for &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-[11px] text-slate-400">
                  Try searching for <span className="text-blue-600 dark:text-blue-400 font-mono">compose</span>,{" "}
                  <span className="text-blue-600 dark:text-blue-400 font-mono">campaigns</span>,{" "}
                  <span className="text-blue-600 dark:text-blue-400 font-mono">contacts</span>, or{" "}
                  <span className="text-blue-600 dark:text-blue-400 font-mono">settings</span>.
                </p>
              </div>
            ) : (
              <>
                {/* 1. FUNCTIONS & ACTIONS */}
                {matchingCommands.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>{searchQuery ? "Matching Functions & Menus" : "Quick Actions & Navigation"}</span>
                      <span className="font-mono text-[9px] text-slate-400">{matchingCommands.length} available</span>
                    </div>

                    <div className="space-y-0.5">
                      {matchingCommands.map((cmd) => {
                        const globalIndex = flatResults.findIndex(
                          (r) => r.kind === "command" && r.item.id === cmd.id
                        );
                        const isSelected = globalIndex === selectedIndex;
                        const Icon = cmd.icon;

                        return (
                          <button
                            key={cmd.id}
                            type="button"
                            onClick={() => cmd.onSelect()}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500/30 font-medium"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`p-1.5 rounded-lg shrink-0 ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold truncate">{cmd.title}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {cmd.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {cmd.category}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. MATCHING EMAILS */}
                {matchingEmails.length > 0 && (
                  <div className="space-y-1 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Matching Emails &amp; Threads</span>
                      <span className="font-mono text-[9px] text-slate-400">{matchingEmails.length} found</span>
                    </div>

                    <div className="space-y-0.5">
                      {matchingEmails.map((msg) => {
                        const globalIndex = flatResults.findIndex(
                          (r) => r.kind === "email" && r.item.id === msg.id
                        );
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={msg.id}
                            type="button"
                            onClick={() => {
                              onSelectMessage(msg.id);
                              setActiveTab("mail");
                              setIsSearchOpen(false);
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500/30"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`p-1.5 rounded-lg shrink-0 ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                <Mail className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold truncate">{msg.subject || "(No Subject)"}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  From: {msg.from} • {msg.body?.slice(0, 45)}…
                                </p>
                              </div>
                            </div>

                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {msg.date || "Mailbox"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. MATCHING CONTACTS */}
                {matchingContacts.length > 0 && (
                  <div className="space-y-1 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Matching Contacts &amp; Leads</span>
                      <span className="font-mono text-[9px] text-slate-400">{matchingContacts.length} found</span>
                    </div>

                    <div className="space-y-0.5">
                      {matchingContacts.map((contact) => {
                        const globalIndex = flatResults.findIndex(
                          (r) => r.kind === "contact" && r.item.id === contact.id
                        );
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={contact.id}
                            type="button"
                            onClick={() => {
                              if (onComposeTo) {
                                onComposeTo(contact.email);
                              } else {
                                onOpenCompose();
                              }
                              setIsSearchOpen(false);
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500/30"
                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`p-1.5 rounded-lg shrink-0 ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                <User className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold truncate">{contact.name}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                  {contact.email} {contact.company ? `• ${contact.company}` : ""}
                                </p>
                              </div>
                            </div>

                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 shrink-0">
                              Send Email →
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* KEYBOARD SHORTCUTS FOOTER */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80 px-2">
              <div className="flex items-center gap-3">
                <span>
                  Navigate <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">↑</kbd>{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">↓</kbd>
                </span>
                <span>
                  Select <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">↵</kbd>
                </span>
                <span>
                  Close <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Esc</kbd>
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">ZegaMail Spotlight</span>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Quick Apps Navigation, Domain Status & User Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Workspace Quick Tabs (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("mail")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
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
            onClick={() => setActiveTab("contacts")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "contacts"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Contacts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
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
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-mono text-slate-700 dark:text-slate-300"
          title="Mailbox Domain: Active & Encrypted"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="truncate max-w-[130px] font-medium">{currentDomain?.domainName || "acmedesign.co"}</span>
        </div>

        {/* Connect Phone / Mobile App Setup */}
        <button
          type="button"
          onClick={onOpenClientModal}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors cursor-pointer"
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
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                  {currentUser?.email || "alex@acmedesign.co"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-medium">
                    Active Mailbox
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-medium uppercase font-mono">
                    {currentOrg?.plan || "GROWTH"}
                  </span>
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
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  <span>Account &amp; Signatures</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenClientModal();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium cursor-pointer"
                >
                  <Smartphone className="h-4 w-4 text-slate-400" />
                  <span>Mobile &amp; Client Setup</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenUpgradeModal();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2.5 font-medium cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Billing &amp; Subscription</span>
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 font-semibold cursor-pointer"
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
