"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Inbox,
  Send,
  FileText,
  AlertOctagon,
  Trash2,
  Globe,
  Mail,
  Key,
  Settings,
  Plus,
  RefreshCw,
  Search,
  Check,
  Copy,
  Laptop,
  X,
  ArrowRight,
  ShieldCheck,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  UserCheck,
  BarChart3,
  Sparkles,
  Wand2,
  Users,
  Layers,
  Paperclip,
  TrendingUp,
  CreditCard,
  Building,
  Lock,
  Sun,
  Moon,
  Smartphone,
  Star,
  Archive,
  Sliders,
  DollarSign,
  LogOut,
  Folder,
  FolderPlus,
  ShieldAlert,
  Tag,
  AlertTriangle,
  User,
  UserPlus,
  Calendar,
  Edit3,
  AtSign,
  Shield,
  ArrowLeft
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { ZegaLogo } from "@/components/ZegaLogo";
import { CampaignsWorkspace } from "@/components/campaigns/CampaignsWorkspace";
import { FullComposeWorkspace } from "@/components/mail/FullComposeWorkspace";
import { DomainsWorkspace } from "@/components/domains/DomainsWorkspace";

interface EmailMessage {
  id: string | number;
  from: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  date: string;
  preview: string;
  body: string;
  folder: string;
  isRead?: boolean;
  tracked?: boolean;
  openCount?: number;
  lastOpened?: string;
  device?: string;
  followUpDue?: string;
  isHtml?: boolean;
  attachments?: { name: string; size: string; type: string }[];
}

export default function WebmailAppPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState<
    "mail" | "ai" | "campaigns" | "contacts" | "domains" | "settings"
  >("mail");
  const [selectedFolder, setSelectedFolder] = useState<string>("inbox");
  const [selectedMessageId, setSelectedMessageId] = useState<string | number>("msg_1");
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isFullComposeOpen, setIsFullComposeOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isWhmcsDomainModalOpen, setIsWhmcsDomainModalOpen] = useState(false);
  const [isNewMailboxModalOpen, setIsNewMailboxModalOpen] = useState(false);

  // Custom Folders & Templates
  const [customFolders, setCustomFolders] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#3b82f6");

  // Authenticated User & Database State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentOrg, setCurrentOrg] = useState<any>(null);
  const [currentDomain, setCurrentDomain] = useState<any>(null);
  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Messages State
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Compose State
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [enableTracking, setEnableTracking] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState("");

  // AI Studio State
  const [aiLeadName, setAiLeadName] = useState("David Miller");
  const [aiLeadCompany, setAiLeadCompany] = useState("HyperScale Tech");
  const [aiTone, setAiTone] = useState<"persuasive" | "professional" | "concise">("persuasive");
  const [aiPrompt, setAiPrompt] = useState(
    "Offer a 15-minute quick audit of their current web app performance and explain how our team delivers 99.99% uptime with dedicated SLA."
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedAiEmail, setGeneratedAiEmail] = useState(
    `Subject: Quick observation on HyperScale Tech's web infrastructure\n\nHi David,\n\nI noticed HyperScale Tech recently announced your European expansion—congratulations on the milestone!\n\nGrowing traffic often introduces unexpected latency and mail deliverability spikes. We built dedicated hybrid mail infrastructure that maintains guaranteed 99.99% inbox placement without paying $7/seat enterprise penalties.\n\nWould you be open to a 10-minute sync this Thursday at 3:00 PM to review a quick deliverability diagnostic we ran for your domain?\n\nBest regards,\nAlex Carter\nAcme Creative Studio`
  );

  // WHMCS Domain Search State
  const [whmcsSearchDomain, setWhmcsSearchDomain] = useState("");
  const [whmcsDomainAvailable, setWhmcsDomainAvailable] = useState<boolean | null>(null);
  const [isOrderingDomain, setIsOrderingDomain] = useState(false);
  const [domainOrderSuccess, setDomainOrderSuccess] = useState("");

  // Mobile Webmail Drill-down Navigation State
  const [mobileMailView, setMobileMailView] = useState<"folders" | "list" | "message">("list");

  // Settings Workspace: Admin vs Member Perspective View
  const [settingsPerspective, setSettingsPerspective] = useState<"admin" | "member">("admin");

  // Admin Settings State (Team Members, Mailbox Quotas, Domain Routing, Compliance)
  const [adminTeamMembers, setAdminTeamMembers] = useState([
    { id: "usr_1", name: "Alex Carter", email: "alex@acmedesign.co", role: "Owner", quotaMb: 10000, usedMb: 620, status: "Active", lastActive: "Active now" },
    { id: "usr_2", name: "Sarah Jenkins", email: "sales@acmedesign.co", role: "Admin", quotaMb: 10000, usedMb: 240, status: "Active", lastActive: "12m ago" },
    { id: "usr_3", name: "Support Desk", email: "support@acmedesign.co", role: "Member", quotaMb: 5000, usedMb: 85, status: "Active", lastActive: "1h ago" },
    { id: "usr_4", name: "Dev Ops Routing", email: "devops@acmedesign.co", role: "Member", quotaMb: 5000, usedMb: 30, status: "Suspended", lastActive: "3d ago" },
  ]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmailPrefix, setNewMemberEmailPrefix] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Member");
  const [newMemberQuotaMb, setNewMemberQuotaMb] = useState(5000);
  const [memberSuccessMessage, setMemberSuccessMessage] = useState("");

  const [catchAllEnabled, setCatchAllEnabled] = useState(true);
  const [catchAllForwardEmail, setCatchAllForwardEmail] = useState("alex@acmedesign.co");
  const [globalDisclaimer, setGlobalDisclaimer] = useState(
    "CONFIDENTIALITY NOTICE: This transmission is intended only for the use of the individual or entity to which it is addressed. If you are not the intended recipient, please notify the sender immediately and delete this communication."
  );
  const [disclaimerSaved, setDisclaimerSaved] = useState(false);
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [dailySendingLimit, setDailySendingLimit] = useState(500);
  const [sessionTimeout, setSessionTimeout] = useState("8hours");

  // Regular User (Member) Settings State (Profile, Signature, Out of Office, Forwarding, App Passwords)
  const [userProfileName, setUserProfileName] = useState("Alex Carter");
  const [userJobTitle, setUserJobTitle] = useState("Lead Creative Director");
  const [userRecoveryPhone, setUserRecoveryPhone] = useState("+1 (555) 392-8014");
  const [profileSaved, setProfileSaved] = useState(false);

  const [userSignature, setUserSignature] = useState(
    `Alex Carter\nLead Creative Director • Acme Creative Studio\nDirect: +1 (555) 392-8014 | acmedesign.co\nEncrypted with 2048-bit DKIM via ZegaMail`
  );
  const [sigAutoInsertNew, setSigAutoInsertNew] = useState(true);
  const [sigIncludeReplies, setSigIncludeReplies] = useState(true);
  const [sigSaved, setSigSaved] = useState(false);

  const [vacationResponderActive, setVacationResponderActive] = useState(false);
  const [vacationStartDate, setVacationStartDate] = useState("2026-10-20");
  const [vacationEndDate, setVacationEndDate] = useState("2026-10-27");
  const [vacationSubject, setVacationSubject] = useState("Out of Office: Thank you for your email");
  const [vacationMessage, setVacationMessage] = useState(
    "Thank you for contacting me. I am currently out of the office with limited email access through Oct 27, 2026. For urgent project inquiries, please contact our team at sales@acmedesign.co."
  );
  const [vacationOnlyContacts, setVacationOnlyContacts] = useState(false);
  const [vacationSaved, setVacationSaved] = useState(false);

  const [forwardingEnabled, setForwardingEnabled] = useState(false);
  const [forwardingAddress, setForwardingAddress] = useState("alex.carter.personal@gmail.com");
  const [forwardKeepCopy, setForwardKeepCopy] = useState(true);
  const [spamSensitivity, setSpamSensitivity] = useState<"standard" | "aggressive" | "relaxed">("standard");

  const [appPasswords, setAppPasswords] = useState([
    { id: "app_1", name: "iPhone Apple Mail", created: "2026-09-14", lastUsed: "Today at 2:15 PM" },
    { id: "app_2", name: "MacBook Air Thunderbird", created: "2026-10-02", lastUsed: "Yesterday" },
  ]);
  const [newAppName, setNewAppName] = useState("");
  const [generatedAppPass, setGeneratedAppPass] = useState("");

  // Fetch real authenticated session from database
  const loadSession = async () => {
    try {
      setIsLoadingAuth(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
        setCurrentOrg(data.org);
        setCurrentDomain(data.domain);
        setMailboxes(data.mailboxes || []);
        setIsDemoMode(false);
      } else {
        // Fallback demo state
        setCurrentUser(data.user || { name: "Alex Carter", email: "sales@acmedesign.co", role: "owner" });
        setCurrentOrg(data.org || { name: "Acme Creative Studio Ltd", plan: "growth", whmcsClientId: "WHMCS-CL-40192" });
        setCurrentDomain(data.domain || { domainName: "acmedesign.co" });
        setMailboxes(data.mailboxes || []);
        setIsDemoMode(true);
      }
    } catch (err) {
      console.error("Session load error", err);
      setIsDemoMode(true);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Fetch real messages from database API
  const loadMessages = async () => {
    try {
      setIsLoadingMessages(true);
      const res = await fetch("/api/mail");
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
        if (data.messages.length > 0 && !selectedMessageId) {
          setSelectedMessageId(data.messages[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadFolders = async () => {
    try {
      const res = await fetch("/api/folders");
      const data = await res.json();
      if (data.success && data.folders) {
        setCustomFolders(data.folders);
      }
    } catch (err) {
      console.error("Failed to load folders", err);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.success && data.templates) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error("Failed to load templates", err);
    }
  };

  const handleMoveMessage = async (messageId: string | number, targetFolder: string) => {
    try {
      const res = await fetch("/api/mail", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, folder: targetFolder }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, folder: targetFolder } : m))
        );
      }
    } catch (err) {
      console.error("Error moving message", err);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim(), color: newFolderColor }),
      });
      const data = await res.json();
      if (data.success && data.folder) {
        setCustomFolders((prev) => [...prev, data.folder]);
        setIsNewFolderModalOpen(false);
        setNewFolderName("");
      }
    } catch (err) {
      console.error("Error creating folder", err);
    }
  };

  useEffect(() => {
    loadSession();
    loadMessages();
    loadFolders();
    loadTemplates();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["mail", "ai", "campaigns", "contacts", "domains", "settings"].includes(tab)) {
        setActiveTab(tab as any);
      }
    }
  }, []);

  const activeMessage = messages.find((m) => m.id === selectedMessageId) || messages[0];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleSwitchDemoPersona = async (email: string, pass: string) => {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });
    await loadSession();
    await loadMessages();
  };

  const handleGenerateAi = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      setIsGeneratingAi(false);
      setGeneratedAiEmail(
        `Subject: Tailored Web & Mail Infrastructure Proposal for ${aiLeadCompany}\n\nHi ${aiLeadName.split(" ")[0]},\n\nI reviewed ${aiLeadCompany}'s latest operations updates. With your current growth trajectory, email deliverability and SLA reliability are critical for maintaining enterprise deal velocity.\n\nWe provide dedicated, ad-free business mail infrastructure with built-in client read receipts and verified DNS encryption, cutting software overhead by over $600/year.\n\n${aiPrompt}\n\nWould 15 minutes on Thursday work for a quick walk-through?\n\nBest,\n${currentUser?.name || "Alex Carter"}\n${currentOrg?.name || "Acme Creative Studio"}`
      );
    }, 700);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const res = await fetch("/api/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: composeTo,
          subject: composeSubject,
          body: composeBody,
          enableTracking,
        }),
      });

      const data = await res.json();

      if (data.success && data.message) {
        setMessages([data.message, ...messages]);
        setSelectedMessageId(data.message.id);
        setSelectedFolder(enableTracking ? "tracked" : "sent");
        setIsSending(false);
        setSendSuccessMessage(
          enableTracking
            ? "Message saved to database with real-time Read Receipt tracking active!"
            : "Message sent and stored in database!"
        );

        setTimeout(() => {
          setIsComposeOpen(false);
          setSendSuccessMessage("");
          setComposeTo("");
          setComposeSubject("");
          setComposeBody("");
        }, 1100);
      }
    } catch (err) {
      alert("Failed to save outgoing email.");
      setIsSending(false);
    }
  };

  const handleOrderWhmcsDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrderingDomain(true);
    setDomainOrderSuccess("");

    try {
      const res = await fetch("/api/domains/whmcs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainName: whmcsSearchDomain }),
      });

      const data = await res.json();
      if (data.success) {
        setDomainOrderSuccess(
          `Domain ${whmcsSearchDomain} successfully ordered and registered under your organization profile (${data.whmcsOrderId})!`
        );
        setCurrentDomain(data.domain);
        setTimeout(() => {
          setIsWhmcsDomainModalOpen(false);
          setDomainOrderSuccess("");
          setWhmcsSearchDomain("");
          setWhmcsDomainAvailable(null);
        }, 1500);
      }
    } catch (err) {
      alert("Domain ordering error");
    } finally {
      setIsOrderingDomain(false);
    }
  };

  const handleToggleMemberStatus = (id: string) => {
    setAdminTeamMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus = m.status === "Active" ? "Suspended" : "Active";
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleChangeMemberRole = (id: string, newRole: string) => {
    setAdminTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
  };

  const handleChangeMemberQuota = (id: string, newQuotaMb: number) => {
    setAdminTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, quotaMb: newQuotaMb } : m))
    );
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmailPrefix.trim()) return;

    const email = `${newMemberEmailPrefix.trim().toLowerCase()}@${currentDomain?.domainName || "acmedesign.co"}`;
    const newMember = {
      id: `usr_${Date.now()}`,
      name: newMemberName.trim(),
      email,
      role: newMemberRole,
      quotaMb: newMemberQuotaMb,
      usedMb: 0,
      status: "Active",
      lastActive: "Just now",
    };

    setAdminTeamMembers((prev) => [...prev, newMember]);
    setMemberSuccessMessage(`Mailbox ${email} provisioned with ${newMemberQuotaMb / 1000} GB quota!`);
    setTimeout(() => {
      setIsAddMemberModalOpen(false);
      setNewMemberName("");
      setNewMemberEmailPrefix("");
      setMemberSuccessMessage("");
    }, 1200);
  };

  const handleSaveDisclaimer = () => {
    setDisclaimerSaved(true);
    setTimeout(() => setDisclaimerSaved(false), 2000);
  };

  const handleSaveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSaveSignature = () => {
    setSigSaved(true);
    setTimeout(() => setSigSaved(false), 2000);
  };

  const handleSaveVacation = () => {
    setVacationSaved(true);
    setTimeout(() => setVacationSaved(false), 2000);
  };

  const handleGenerateAppPassword = () => {
    if (!newAppName.trim()) return;
    const randomPass = Array.from({ length: 4 }, () =>
      Math.random().toString(36).substring(2, 6)
    ).join("-");
    const newEntry = {
      id: `app_${Date.now()}`,
      name: newAppName.trim(),
      created: "Just now",
      lastUsed: "Never",
    };
    setAppPasswords((prev) => [...prev, newEntry]);
    setGeneratedAppPass(randomPass);
    setNewAppName("");
  };

  const handleRevokeAppPassword = (id: string) => {
    setAppPasswords((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredMessages = messages.filter((m) => {
    const matchesFolder =
      selectedFolder === "tracked"
        ? m.tracked === true
        : selectedFolder === "sent"
        ? m.folder === "sent" || m.folder === "tracked"
        : m.folder === selectedFolder;

    const matchesSearch =
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.body.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFolder && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-[#090a0f] text-[#121212] dark:text-[#f3f4f6] transition-colors">
      {/* GUIDED DEMO MODE BANNER (When in preview mode) */}
      {isDemoMode && (
        <aside aria-label="Demo Mode Navigation" className="border-b border-blue-200 dark:border-blue-900 bg-blue-50/90 dark:bg-blue-950/70 py-2 px-4 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between flex-wrap gap-2 transition-colors">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-semibold">Interactive Guided Demo:</span>
            <span>
              Previewing workspace as <strong>{currentUser?.name || "Alex Carter"}</strong> ({currentUser?.email || "sales@acmedesign.co"})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-blue-700 dark:text-blue-300">Quick Persona:</span>
            <button
              type="button"
              onClick={() => handleSwitchDemoPersona("owner@zegacloud.com", "OwnerDemo#2026")}
              className="px-2 py-0.5 rounded bg-white dark:bg-[#161a25] border border-blue-200 dark:border-blue-800 text-[10px] font-medium hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              Owner (Admin)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchDemoPersona("sales@acmedesign.co", "SalesDemo#2026")}
              className="px-2 py-0.5 rounded bg-white dark:bg-[#161a25] border border-blue-200 dark:border-blue-800 text-[10px] font-medium hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              Sales Lead
            </button>
            <button
              type="button"
              onClick={() => handleSwitchDemoPersona("support@zegacloud.com", "SupportDemo#2026")}
              className="px-2 py-0.5 rounded bg-white dark:bg-[#161a25] border border-blue-200 dark:border-blue-800 text-[10px] font-medium hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              Support Desk
            </button>
            <Link
              href="/signup"
              className="ml-2 inline-flex items-center gap-1 rounded bg-blue-700 text-white px-2.5 py-0.5 font-semibold text-[11px] hover:bg-blue-800"
            >
              <span>Create Real Account</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </aside>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT VERTICAL DOCK (Inspired by AdFlux / Persana references) */}
        <aside
          aria-label="Application Dock"
          className="hidden md:flex w-16 border-r border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#0d1017] flex-col items-center justify-between py-4 shrink-0 transition-colors z-20"
        >
          <div className="flex flex-col items-center space-y-4">
            <Link
              href="/"
              className="hover:scale-105 transition-transform"
              title="Return to Zega Mail Homepage"
            >
              <ZegaLogo variant="icon" />
            </Link>

            <div className="w-8 border-t border-[#eaeaea] dark:border-[#202636]" />

            {/* Navigation Icon Buttons */}
            <nav className="flex flex-col items-center space-y-2">
              <button
                type="button"
                onClick={() => setActiveTab("mail")}
                title="Webmail & Proposals"
                className={`p-2.5 rounded-xl transition-colors relative ${
                  activeTab === "mail"
                    ? "bg-[#121212] text-white dark:bg-white dark:text-[#121212] shadow-sm"
                    : "text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`}
              >
                <Mail className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                title="Zega AI Outreach Studio"
                className={`p-2.5 rounded-xl transition-colors relative ${
                  activeTab === "ai"
                    ? "bg-[#121212] text-amber-400 dark:bg-white dark:text-amber-600 shadow-sm"
                    : "text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`}
              >
                <Sparkles className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("campaigns")}
                title="Outreach Campaigns & Performance"
                className={`p-2.5 rounded-xl transition-colors relative ${
                  activeTab === "campaigns"
                    ? "bg-[#121212] text-emerald-400 dark:bg-white dark:text-emerald-600 shadow-sm"
                    : "text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`}
              >
                <BarChart3 className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("contacts")}
                title="Contacts & Leads"
                className={`p-2.5 rounded-xl transition-colors relative ${
                  activeTab === "contacts"
                    ? "bg-[#121212] text-white dark:bg-white dark:text-[#121212] shadow-sm"
                    : "text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`}
              >
                <Users className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("domains")}
                title="Domains & DNS Routing"
                className={`p-2.5 rounded-xl transition-colors relative ${
                  activeTab === "domains"
                    ? "bg-[#121212] text-white dark:bg-white dark:text-[#121212] shadow-sm"
                    : "text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`}
              >
                <Globe className="h-5 w-5" />
              </button>
            </nav>
          </div>

          {/* Bottom Actions: Dark Mode + Admin Settings + User Avatar */}
          <div className="flex flex-col items-center space-y-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              title="Admin & Organization Settings"
              className={`p-2.5 rounded-xl transition-colors ${
                activeTab === "settings"
                  ? "bg-[#121212] text-white dark:bg-white dark:text-[#121212]"
                  : "text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200 dark:hover:bg-neutral-800"
              }`}
            >
              <Settings className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>

            <div
              className="h-9 w-9 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold shadow-sm cursor-pointer"
              title={`${currentUser?.name || "User"} (${currentUser?.role || "Owner"})`}
            >
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "AC"}
            </div>
          </div>
        </aside>

        {/* MAIN WORKSPACE BODY */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0 relative">
          {/* Top Bar with Domain Indicator & Mobile Controls */}
          <header className="h-14 border-b border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] px-3 sm:px-6 flex items-center justify-between transition-colors shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-[#121212] dark:text-white capitalize truncate">
                {activeTab === "mail" && "Webmail"}
                {activeTab === "ai" && "AI Studio"}
                {activeTab === "campaigns" && "Campaigns"}
                {activeTab === "contacts" && "Contacts"}
                {activeTab === "domains" && "Domains"}
                {activeTab === "settings" && "Settings"}
              </span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 text-[10px] sm:text-[11px] font-mono text-emerald-800 dark:text-emerald-300 truncate max-w-[120px] sm:max-w-none">
                {currentDomain?.domainName || "acmedesign.co"}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="md:hidden p-1.5 rounded-lg text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsClientModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#161a25] px-3 py-1.5 text-xs font-medium text-[#706f6c] dark:text-[#9ca3af] hover:text-[#121212] dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm"
              >
                <img src="/branding/apple-icon.svg" alt="Apple" className="h-3 w-3 dark:invert" />
                <span>Connect Phone</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWhmcsDomainModalOpen(true)}
                className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg bg-[#121212] dark:bg-white text-white dark:text-[#121212] px-2.5 sm:px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Register Domain</span>
                <span className="sm:hidden text-[11px]">Domain</span>
              </button>
            </div>
          </header>

          {/* TAB 1: WEBMAIL WORKSPACE */}
          {activeTab === "mail" && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              {/* Secondary Folders Column */}
              <aside
                className={`${
                  mobileMailView === "folders" ? "flex col-span-12" : "hidden"
                } md:flex md:col-span-2 border-r border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#0e1119] p-3.5 flex-col justify-between transition-colors overflow-y-auto`}
              >
                <div className="space-y-4">
                  {/* Mobile Folder Top Header */}
                  <div className="flex md:hidden items-center justify-between pb-3 border-b border-[#eaeaea] dark:border-[#202636]">
                    <span className="text-xs font-bold text-[#121212] dark:text-white flex items-center gap-1.5">
                      <Folder className="h-4 w-4 text-blue-500" />
                      <span>Mailbox Folders</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setMobileMailView("list")}
                      className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-bold"
                    >
                      Done
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFullComposeOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#121212] dark:bg-white px-3 py-2.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Compose Email</span>
                    <kbd className="hidden sm:inline ml-auto bg-neutral-800 dark:bg-neutral-200 text-neutral-300 dark:text-neutral-700 text-[9px]">C</kbd>
                  </button>

                  <nav className="space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFolder("inbox");
                        setMobileMailView("list");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        selectedFolder === "inbox"
                          ? "bg-white dark:bg-[#181d28] border border-[#eaeaea] dark:border-[#293348] font-semibold text-[#121212] dark:text-white shadow-sm"
                          : "text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Inbox className="h-3.5 w-3.5" /> Primary
                      </span>
                      <span className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1.5 rounded">
                        {messages.filter((m) => m.folder === "inbox").length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFolder("tracked");
                        setMobileMailView("list");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        selectedFolder === "tracked"
                          ? "bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 font-semibold text-blue-900 dark:text-blue-300 shadow-sm"
                          : "text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Tracked Proposals
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/60 px-1.5 rounded">
                        Receipts
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFolder("sent");
                        setMobileMailView("list");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        selectedFolder === "sent"
                          ? "bg-white dark:bg-[#181d28] border border-[#eaeaea] dark:border-[#293348] font-semibold text-[#121212] dark:text-white shadow-sm"
                          : "text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Send className="h-3.5 w-3.5" /> Sent Mail
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFolder("drafts");
                        setMobileMailView("list");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        selectedFolder === "drafts"
                          ? "bg-white dark:bg-[#181d28] border border-[#eaeaea] dark:border-[#293348] font-semibold text-[#121212] dark:text-white shadow-sm"
                          : "text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" /> Drafts
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFolder("archive");
                        setMobileMailView("list");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        selectedFolder === "archive"
                          ? "bg-white dark:bg-[#181d28] border border-[#eaeaea] dark:border-[#293348] font-semibold text-[#121212] dark:text-white shadow-sm"
                          : "text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Archive className="h-3.5 w-3.5" /> Archive
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFolder("spam");
                        setMobileMailView("list");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        selectedFolder === "spam"
                          ? "bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 font-semibold text-red-700 dark:text-red-400 shadow-sm"
                          : "text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="h-3.5 w-3.5 text-red-500" /> Spam / Junk
                      </span>
                      <span className="font-mono text-[10px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-1.5 rounded font-bold">
                        {messages.filter((m) => m.folder === "spam").length}
                      </span>
                    </button>

                    {/* Custom Folders Section */}
                    <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
                      <div className="flex items-center justify-between px-1 mb-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                          Custom Folders
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsNewFolderModalOpen(true)}
                          title="Create custom folder"
                          className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 p-0.5"
                        >
                          <FolderPlus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {customFolders.map((fld) => {
                        const count = messages.filter((m) => m.folder === fld.id).length;
                        return (
                          <button
                            key={fld.id}
                            type="button"
                            onClick={() => {
                              setSelectedFolder(fld.id);
                              setMobileMailView("list");
                            }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors ${
                              selectedFolder === fld.id
                                ? "bg-white dark:bg-[#181d28] border border-[#eaeaea] dark:border-[#293348] font-semibold text-[#121212] dark:text-white shadow-sm"
                                : "text-[#706f6c] dark:text-[#9ca3af] hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: fld.color || "#3b82f6" }}
                              />
                              <span className="truncate">{fld.name}</span>
                            </span>
                            {count > 0 && (
                              <span className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1.5 rounded">
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </nav>
                </div>

                {/* Storage Meter */}
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#706f6c] dark:text-[#9ca3af]">
                    <span>Storage Pool</span>
                    <span className="font-mono tabular-nums">18% used</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#121212] dark:bg-white h-full w-[18%]" />
                  </div>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    0.9 GB / 5.0 GB ({currentOrg?.plan?.toUpperCase() || "GROWTH"})
                  </p>
                </div>
              </aside>

              {/* Message List Column */}
              <section
                aria-label="Message List"
                className={`${
                  mobileMailView === "list" ? "flex col-span-12" : "hidden"
                } md:flex md:col-span-4 border-r border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] flex-col overflow-hidden transition-colors`}
              >
                {/* Mobile Folder Selector & Compose Bar */}
                <div className="flex md:hidden items-center justify-between px-3 py-2 bg-[#faf9f6] dark:bg-[#0e1119] border-b border-[#eaeaea] dark:border-[#202636] text-xs">
                  <button
                    type="button"
                    onClick={() => setMobileMailView("folders")}
                    className="inline-flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white"
                  >
                    <Folder className="h-3.5 w-3.5 text-blue-500" />
                    <span className="capitalize">{selectedFolder}</span>
                    <span className="font-mono text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.2 rounded font-normal">
                      {filteredMessages.length}
                    </span>
                    <ChevronDown className="h-3 w-3 text-neutral-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFullComposeOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
                  >
                    <Send className="h-3 w-3" />
                    <span>Compose</span>
                  </button>
                </div>

                <div className="p-3 border-b border-[#eaeaea] dark:border-[#202636] flex items-center gap-2 bg-[#faf9f6] dark:bg-[#0e1119]">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search messages, clients, proposals…"
                      className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#161a25] pl-8 pr-3 py-1.5 text-xs text-[#121212] dark:text-white placeholder-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={loadMessages}
                    title="Refresh"
                    className="rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#161a25] p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingMessages ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-[#eaeaea] dark:divide-[#202636]">
                  {filteredMessages.length === 0 ? (
                    <div className="p-8 text-center text-xs text-neutral-400">
                      No emails found in this folder.
                    </div>
                  ) : (
                    filteredMessages.map((msg) => (
                      <article
                        key={msg.id}
                        onClick={() => {
                          setSelectedMessageId(msg.id);
                          setMobileMailView("message");
                        }}
                        className={`p-3.5 cursor-pointer transition-colors text-left ${
                          selectedMessageId === msg.id
                            ? "bg-neutral-100 dark:bg-[#1b212f] border-l-2 border-l-[#121212] dark:border-l-blue-400"
                            : "hover:bg-neutral-50 dark:hover:bg-[#161a25]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span
                            className={`truncate ${
                              msg.isRead === false
                                ? "font-bold text-[#121212] dark:text-white"
                                : "font-medium text-[#706f6c] dark:text-[#9ca3af]"
                            }`}
                          >
                            {msg.from}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono shrink-0 ml-2">
                            {msg.date}
                          </span>
                        </div>

                        <p
                          className={`text-xs truncate ${
                            msg.isRead === false
                              ? "font-semibold text-[#121212] dark:text-white"
                              : "text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          {msg.subject}
                        </p>

                        <p className="text-[11px] text-[#706f6c] dark:text-[#9ca3af] line-clamp-1 mt-1 leading-snug">
                          {msg.preview}
                        </p>

                        {/* Titan-style Read Receipt indicator tag */}
                        {msg.tracked && (
                          <div className="mt-2 flex items-center gap-1.5">
                            {msg.openCount && msg.openCount > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded bg-[#e1f3fe] dark:bg-blue-950/70 px-1.5 py-0.5 text-[10px] font-medium text-[#1a5c88] dark:text-blue-300 border border-[#cbe4fb] dark:border-blue-800">
                                <Eye className="h-3 w-3" />
                                <span>Opened {msg.lastOpened} ({msg.openCount}x)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                <Clock className="h-3 w-3" />
                                <span>Delivered to Inbox</span>
                              </span>
                            )}
                          </div>
                        )}
                      </article>
                    ))
                  )}
                </div>
              </section>

              {/* Reading View */}
              <main
                aria-label="Reading Pane"
                className={`${
                  mobileMailView === "message" ? "flex col-span-12" : "hidden"
                } md:flex md:col-span-6 bg-white dark:bg-[#11141d] flex-col justify-between overflow-y-auto transition-colors`}
              >
                {/* Mobile Back Button Header */}
                <div className="flex md:hidden items-center justify-between p-3 border-b border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#0e1119] shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileMailView("list")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to {selectedFolder}</span>
                  </button>
                  <span className="text-[10px] font-mono text-neutral-400 capitalize bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                    {activeMessage?.folder}
                  </span>
                </div>

                {activeMessage ? (
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Spam Alert Banner */}
                    {activeMessage.folder === "spam" && (
                      <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50/80 dark:bg-red-950/40 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-xs font-bold text-red-900 dark:text-red-200">
                              Suspicious Email Alert — Flagged by ZegaCloud DNS Reputation
                            </span>
                          </div>
                          <span className="rounded bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-800 px-2 py-0.5 text-[10px] font-mono font-bold text-red-800 dark:text-red-300">
                            Spam Filter Active
                          </span>
                        </div>
                        <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                          This email was classified as unsolicited or suspicious. External tracking pixels and hyperlinks have been disarmed for your organization&apos;s security.
                        </p>
                        <div className="pt-2 border-t border-red-200 dark:border-red-900 flex items-center gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() => handleMoveMessage(activeMessage.id, "inbox")}
                            className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                          >
                            ✓ Mark as Not Spam (Move to Inbox)
                          </button>
                          <span className="text-red-300">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              handleMoveMessage(activeMessage.id, "archive");
                            }}
                            className="font-semibold text-red-700 dark:text-red-400 hover:underline"
                          >
                            Delete / Archive
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Titan-style Read Receipt Alert Banner if Tracked */}
                    {activeMessage.tracked && (
                      <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                            <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                              Client Read Receipt Timeline
                            </span>
                          </div>
                          <span className="rounded bg-white dark:bg-[#161a25] border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-800 dark:text-blue-300">
                            {activeMessage.openCount} Total Opens
                          </span>
                        </div>
                        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                          Recipient opened this email <strong>{activeMessage.lastOpened}</strong> on{" "}
                          <span className="font-mono text-[11px]">{activeMessage.device}</span>.
                        </p>
                        {activeMessage.followUpDue && (
                          <div className="pt-2 border-t border-blue-200 dark:border-blue-900 flex items-center justify-between text-[11px] text-blue-900 dark:text-blue-300">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                              Next recommended follow-up: {activeMessage.followUpDue}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setComposeTo(activeMessage.toEmail);
                                setComposeSubject(`Follow-up: ${activeMessage.subject}`);
                                setComposeBody(`Hi Sarah,\n\nFollowing up on the proposal I shared yesterday to see if you have any questions…`);
                                setIsComposeOpen(true);
                              }}
                              className="font-semibold underline hover:text-blue-950 dark:hover:text-white"
                            >
                              Send Follow-up Now →
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Header */}
                    <div className="space-y-3 border-b border-[#eaeaea] dark:border-[#202636] pb-5">
                      <h1 className="text-xl font-semibold text-[#121212] dark:text-white">
                        {activeMessage.subject}
                      </h1>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#121212] dark:text-white">
                              {activeMessage.from}
                            </span>
                            <span className="font-mono text-neutral-400">
                              &lt;{activeMessage.fromEmail}&gt;
                            </span>
                          </div>
                          <p className="text-neutral-400 font-mono text-[11px]">
                            To: {activeMessage.toEmail}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 rounded bg-[#edf3ec] dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-medium text-[#2b5930] dark:text-emerald-400 border border-[#d6e6d5] dark:border-emerald-800">
                            <ShieldCheck className="h-3 w-3" />
                            <span>SPF & DKIM Validated</span>
                          </span>
                          <span className="text-[11px] font-mono text-[#706f6c] dark:text-[#9ca3af]">
                            {activeMessage.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Message Body Content */}
                    {activeMessage.isHtml ? (
                      <div
                        className="text-xs text-[#121212] dark:text-neutral-200 leading-relaxed font-sans max-w-none"
                        dangerouslySetInnerHTML={{ __html: activeMessage.body }}
                      />
                    ) : (
                      <div className="text-xs text-[#121212] dark:text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans">
                        {activeMessage.body}
                      </div>
                    )}

                    {/* Attachment chips if present */}
                    {activeMessage.attachments && activeMessage.attachments.length > 0 && (
                      <div className="pt-3 border-t border-[#eaeaea] dark:border-[#202636]">
                        <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-2">
                          Attachments ({activeMessage.attachments.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {activeMessage.attachments.map((att, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] text-xs font-medium"
                            >
                              <FileText className="h-4 w-4 text-red-500" />
                              <span>{att.name}</span>
                              <span className="text-[10px] text-neutral-400 font-mono">{att.size}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-[#706f6c]">
                    Select an email to view its content.
                  </div>
                )}

                {/* Action Bar */}
                {activeMessage && (
                  <div className="p-3 sm:p-4 border-t border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#0e1119] flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setComposeTo(
                            activeMessage.fromEmail.includes("@acmedesign.co")
                              ? activeMessage.toEmail
                              : activeMessage.fromEmail
                          );
                          setComposeSubject(`Re: ${activeMessage.subject}`);
                          setIsFullComposeOpen(true);
                        }}
                        className="rounded-lg bg-[#121212] dark:bg-white px-3 py-1.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm"
                      >
                        Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("ai");
                          setAiPrompt(`Write a confident, friendly reply to: ${activeMessage.subject}`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#161a25] px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span className="hidden sm:inline">Smart AI Reply</span>
                        <span className="sm:hidden text-[11px]">AI Reply</span>
                      </button>

                      {/* Move to Folder Dropdown */}
                      <div className="flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-neutral-200 dark:border-neutral-800">
                        <Folder className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <select
                          value={activeMessage.folder}
                          onChange={(e) => {
                            handleMoveMessage(activeMessage.id, e.target.value);
                            setMobileMailView("list");
                          }}
                          className="rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#161a25] px-2 py-1 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none"
                        >
                          <option value="inbox">Move: Inbox</option>
                          <option value="archive">Move: Archive</option>
                          <option value="spam">Move: Spam</option>
                          {customFolders.map((f) => (
                            <option key={f.id} value={f.id}>
                              Move: {f.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <span className="hidden sm:inline text-[11px] text-[#706f6c] dark:text-[#9ca3af] font-mono">
                      AES-256 Encrypted Session
                    </span>
                  </div>
                )}
              </main>
            </div>
          )}

          {/* TAB 2: ZEGA AI OUTREACH STUDIO */}
          {activeTab === "ai" && (
            <main className="flex-1 p-6 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
              <div className="md:col-span-5 space-y-4">
                <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-[#121212] dark:text-white">
                          AI Generator
                        </h2>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          Powered by ZegaCloud LLM
                        </p>
                      </div>
                    </div>
                    <span className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-mono font-semibold">
                      2,450 / 3,000 Credits
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-[#121212] dark:text-white">
                      Lead / Prospect Name
                    </label>
                    <input
                      type="text"
                      value={aiLeadName}
                      onChange={(e) => setAiLeadName(e.target.value)}
                      className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-[#121212] dark:text-white">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={aiLeadCompany}
                      onChange={(e) => setAiLeadCompany(e.target.value)}
                      className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-[#121212] dark:text-white">
                      Tone & Voice
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["persuasive", "professional", "concise"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setAiTone(t)}
                          className={`p-1.5 rounded-lg text-xs capitalize border ${
                            aiTone === t
                              ? "bg-[#121212] dark:bg-white text-white dark:text-[#121212] font-semibold"
                              : "border-[#eaeaea] dark:border-[#202636] text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-[#121212] dark:text-white">
                      Proposal Prompt / Objectives
                    </label>
                    <textarea
                      rows={4}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] p-2.5 text-xs resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAi}
                    disabled={isGeneratingAi}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#121212] dark:bg-white px-4 py-2.5 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm"
                  >
                    <Wand2 className="h-3.5 w-3.5 text-amber-400" />
                    <span>{isGeneratingAi ? "Generating High-Converting Copy…" : "Generate Email Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Right Generated Copy Output */}
              <div className="md:col-span-7 flex flex-col space-y-4">
                <div className="flex-1 rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] p-5 flex flex-col justify-between shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#eaeaea] dark:border-[#202636] pb-3">
                      <span className="text-xs font-semibold flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span>Live Generated Email</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                        Estimated Open Rate: 68%+
                      </span>
                    </div>

                    <textarea
                      rows={12}
                      value={generatedAiEmail}
                      onChange={(e) => setGeneratedAiEmail(e.target.value)}
                      className="w-full text-xs font-sans p-3 rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] resize-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-[#eaeaea] dark:border-[#202636] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedAiEmail);
                        alert("Copied AI email to clipboard!");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#eaeaea] dark:border-[#202636] px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setComposeBody(generatedAiEmail);
                        setComposeSubject(`Proposal for ${aiLeadCompany}`);
                        setComposeTo("client@example.com");
                        setIsComposeOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#121212] dark:bg-white text-white dark:text-[#121212] px-4 py-1.5 text-xs font-semibold shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Send in Webmail</span>
                    </button>
                  </div>
                </div>
              </div>
            </main>
          )}

          {/* TAB 3: CAMPAIGNS & OUTREACH */}
          {activeTab === "campaigns" && (
            <CampaignsWorkspace mailboxes={mailboxes} orgPlan={currentOrg?.plan} />
          )}

          {/* TAB 4: CONTACTS & CLIENTS */}
          {activeTab === "contacts" && (
            <main className="flex-1 p-3 sm:p-6 max-w-6xl mx-auto w-full space-y-4 sm:space-y-6 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-[#121212] dark:text-white">
                    Client & Lead Directory
                  </h1>
                  <p className="text-xs text-neutral-500">
                    Manage business contacts, track engagement history, and send personalized proposals.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => alert("Add contact dialog")}
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-lg bg-[#121212] dark:bg-white text-white dark:text-[#121212] px-3.5 py-2 text-xs font-semibold shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Contact</span>
                </button>
              </div>

              <div className="rounded-xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                  <thead className="bg-[#faf9f6] dark:bg-[#0e1119] border-b border-[#eaeaea] dark:border-[#202636] text-[#706f6c] dark:text-[#9ca3af]">
                    <tr>
                      <th className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">Name & Email</th>
                      <th className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">Company</th>
                      <th className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">Relationship</th>
                      <th className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">Read Receipts</th>
                      <th className="py-3 px-4 text-right font-semibold text-neutral-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaea] dark:divide-[#202636]">
                    <tr>
                      <td className="py-3.5 px-4 font-medium text-[#121212] dark:text-white">
                        Sarah Jenkins &lt;s.jenkins@meridiancorp.com&gt;
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500">Meridian Corp</td>
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                          Proposal Active
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-blue-600 font-mono text-[11px]">3 opens recorded</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setComposeTo("s.jenkins@meridiancorp.com");
                            setIsComposeOpen(true);
                          }}
                          className="text-xs font-semibold text-[#121212] dark:text-white hover:underline"
                        >
                          Send Email
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3.5 px-4 font-medium text-[#121212] dark:text-white">
                        David Miller &lt;david@hyperscaletech.com&gt;
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500">HyperScale Tech</td>
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                          Prospect Lead
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">No emails yet</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("ai");
                            setAiLeadName("David Miller");
                            setAiLeadCompany("HyperScale Tech");
                          }}
                          className="text-xs font-semibold text-amber-600 hover:underline"
                        >
                          Draft with AI
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
            </main>
          )}

          {/* TAB 5: DOMAINS & ENTERPRISE DNS WORKSPACE */}
          {activeTab === "domains" && (
            <DomainsWorkspace
              initialDomains={currentDomain ? [currentDomain] : []}
              onMailboxOpen={() => setIsNewMailboxModalOpen(true)}
            />
          )}

          {/* TAB 6: ADMIN & ORGANIZATION SETTINGS (WITH ADMIN VS MEMBER ROLE VIEWS) */}
          {activeTab === "settings" && (
            <main className="flex-1 p-3 sm:p-6 max-w-5xl mx-auto w-full space-y-5 sm:space-y-6 overflow-y-auto">
              {/* Header and Perspective Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-[#121212] dark:text-white flex items-center gap-2">
                    Organization & Mailbox Settings
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold border border-blue-300 dark:border-blue-800">
                      RBAC Enforced
                    </span>
                  </h1>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {settingsPerspective === "admin"
                      ? "Super Admin controls: Team mailbox quotas, catch-all routing, 2FA policies & cloud billing."
                      : "Personal Mailbox controls: Display profile, custom HTML signature, vacation auto-responder & app passwords."}
                  </p>
                </div>

                {/* Perspective Toggle: Admin (Owner) vs User (Member) */}
                <div className="inline-flex rounded-xl p-1 border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#161a25] self-start sm:self-auto shadow-sm">
                  <button
                    type="button"
                    onClick={() => setSettingsPerspective("admin")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      settingsPerspective === "admin"
                        ? "bg-white dark:bg-[#1f2637] text-neutral-900 dark:text-white shadow-sm"
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                    }`}
                  >
                    <Building className="h-3.5 w-3.5 text-blue-500" />
                    <span>👑 Super Admin (Owner View)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsPerspective("member")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      settingsPerspective === "member"
                        ? "bg-white dark:bg-[#1f2637] text-neutral-900 dark:text-white shadow-sm"
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                    }`}
                  >
                    <User className="h-3.5 w-3.5 text-emerald-500" />
                    <span>👤 Mailbox User (Member View)</span>
                  </button>
                </div>
              </div>

              {/* PERSPECTIVE A: SUPER ADMIN & ORGANIZATION OWNER */}
              {settingsPerspective === "admin" && (
                <div className="space-y-6">
                  {/* Organization Profile Card */}
                  <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold">
                          {currentOrg?.name ? currentOrg.name.slice(0, 2).toUpperCase() : "AC"}
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-[#121212] dark:text-white">
                            {currentOrg?.name || "Acme Creative Studio Ltd"}
                          </h2>
                          <p className="text-xs text-neutral-400 font-mono">
                            Client Account ID: #{currentOrg?.whmcsClientId?.replace("WHMCS", "ZCL") || "ZCL-CL-40192"}
                          </p>
                        </div>
                      </div>

                      <span className="self-start sm:self-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 border border-emerald-300 dark:border-emerald-800">
                        {currentOrg?.plan?.toUpperCase() || "GROWTH"} Plan • Flat Monthly Billing
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 text-xs">
                      <div className="space-y-1">
                        <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                          Tenant Super Admin Email
                        </label>
                        <input
                          type="email"
                          readOnly
                          value={currentUser?.email || "alex@acmedesign.co"}
                          className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] p-2 text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                          Primary Verified Domain
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={currentDomain?.domainName || "acmedesign.co"}
                          className="w-full rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] p-2 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Team Members & Mailbox Quotas (RBAC) */}
                  <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-[#121212] dark:text-white flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>Team Mailbox Directory & Storage Quotas</span>
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Allocate storage limits, assign administrative privileges, or suspend departed employees.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddMemberModalOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>+ Add Mailbox Member</span>
                      </button>
                    </div>

                    {/* Member List Table with Horizontal Scroll */}
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                          <thead className="bg-[#faf9f6] dark:bg-[#0e1119] border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                            <tr>
                              <th className="py-2.5 px-3.5 font-semibold text-neutral-900 dark:text-white">Member & Mailbox</th>
                              <th className="py-2.5 px-3.5 font-semibold text-neutral-900 dark:text-white">Role</th>
                              <th className="py-2.5 px-3.5 font-semibold text-neutral-900 dark:text-white">Storage Quota</th>
                              <th className="py-2.5 px-3.5 font-semibold text-neutral-900 dark:text-white">Status</th>
                              <th className="py-2.5 px-3.5 text-right font-semibold text-neutral-900 dark:text-white">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {adminTeamMembers.map((member) => (
                              <tr key={member.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#161a25]/60 transition-colors">
                                <td className="py-3 px-3.5">
                                  <div className="font-semibold text-neutral-900 dark:text-white">
                                    {member.name}
                                  </div>
                                  <div className="text-[11px] text-neutral-400 font-mono">
                                    {member.email}
                                  </div>
                                </td>

                                <td className="py-3 px-3.5">
                                  <select
                                    value={member.role}
                                    onChange={(e) => handleChangeMemberRole(member.id, e.target.value)}
                                    className="rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] px-2 py-1 text-[11px] font-medium text-neutral-800 dark:text-neutral-200"
                                  >
                                    <option value="Owner">Owner</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Member">Member</option>
                                    <option value="Billing">Billing</option>
                                  </select>
                                </td>

                                <td className="py-3 px-3.5">
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={member.quotaMb}
                                      onChange={(e) => handleChangeMemberQuota(member.id, Number(e.target.value))}
                                      className="rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] px-2 py-1 text-[11px] font-mono text-neutral-800 dark:text-neutral-200"
                                    >
                                      <option value={2000}>2 GB</option>
                                      <option value={5000}>5 GB</option>
                                      <option value={10000}>10 GB</option>
                                      <option value={25000}>25 GB</option>
                                      <option value={50000}>50 GB</option>
                                    </select>
                                    <span className="text-[10px] text-neutral-400 font-mono">
                                      ({member.usedMb} MB used)
                                    </span>
                                  </div>
                                </td>

                                <td className="py-3 px-3.5">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                                      member.status === "Active"
                                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                                        : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300"
                                    }`}
                                  >
                                    <span className={`h-1.5 w-1.5 rounded-full ${member.status === "Active" ? "bg-emerald-500" : "bg-red-500"}`} />
                                    {member.status}
                                  </span>
                                </td>

                                <td className="py-3 px-3.5 text-right space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleMemberStatus(member.id)}
                                    className={`text-[11px] font-semibold hover:underline ${
                                      member.status === "Active" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                                    }`}
                                  >
                                    {member.status === "Active" ? "Suspend" : "Re-activate"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => alert(`Temporary reset password token sent to ${member.email}`)}
                                    className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:underline"
                                  >
                                    Reset Password
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Organization Domain Routing & Catch-All */}
                  <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] p-5 sm:p-6 shadow-sm space-y-4">
                    <h2 className="text-sm sm:text-base font-bold text-[#121212] dark:text-white flex items-center gap-2">
                      <AtSign className="h-4 w-4 text-emerald-500" />
                      <span>Domain Routing & Catch-All Ingestion</span>
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Ensure zero lost leads by catching typos and enforcing global compliance disclaimers across all outgoing messages.
                    </p>

                    <div className="space-y-4 pt-2">
                      {/* Catch-all Switch */}
                      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#151924] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white">
                            Catch-All Routing (*@{currentDomain?.domainName || "acmedesign.co"})
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            Route all unassigned email addresses to your designated administrator mailbox instead of bouncing.
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="email"
                            value={catchAllForwardEmail}
                            onChange={(e) => setCatchAllForwardEmail(e.target.value)}
                            disabled={!catchAllEnabled}
                            placeholder="admin@domain.com"
                            className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e] text-xs font-mono disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => setCatchAllEnabled(!catchAllEnabled)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              catchAllEnabled
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                            }`}
                          >
                            {catchAllEnabled ? "Enabled" : "Disabled"}
                          </button>
                        </div>
                      </div>

                      {/* Global Outbound Legal Disclaimer */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                            <span>Global Company Email Disclaimer (Appended to Outbound Mail)</span>
                          </label>
                          {disclaimerSaved && (
                            <span className="text-[11px] text-emerald-600 font-bold">Saved!</span>
                          )}
                        </div>
                        <textarea
                          rows={3}
                          value={globalDisclaimer}
                          onChange={(e) => setGlobalDisclaimer(e.target.value)}
                          className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#161a25] text-xs text-neutral-800 dark:text-neutral-200 font-sans"
                        />
                        <button
                          type="button"
                          onClick={handleSaveDisclaimer}
                          className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-bold transition-colors"
                        >
                          Save Legal Disclaimer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Security, Authentication & Compliance Policies */}
                  <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] p-5 sm:p-6 shadow-sm space-y-4">
                    <h2 className="text-sm sm:text-base font-bold text-[#121212] dark:text-white flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-500" />
                      <span>Security & Authentication Governance</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Enforce 2FA */}
                      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#151924] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">Strict 2FA Enforcement</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            Require two-factor authentication for all team members.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnforce2FA(!enforce2FA)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            enforce2FA
                              ? "bg-purple-600 text-white shadow-sm"
                              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                          }`}
                        >
                          {enforce2FA ? "Enforced" : "Optional"}
                        </button>
                      </div>

                      {/* Daily Outbound Limit */}
                      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#151924] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">Outbound Rate Safeguard</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            Daily sending limit per mailbox to prevent spam.
                          </p>
                        </div>
                        <select
                          value={dailySendingLimit}
                          onChange={(e) => setDailySendingLimit(Number(e.target.value))}
                          className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e] font-mono text-xs"
                        >
                          <option value={250}>250/day</option>
                          <option value={500}>500/day</option>
                          <option value={1000}>1,000/day</option>
                          <option value={2500}>2,500/day</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Cloud Billing & Pooled Storage */}
                  <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="h-5 w-5 text-emerald-600" />
                        <div>
                          <h3 className="text-sm font-bold text-[#121212] dark:text-white">
                            Consolidated Invoicing & Storage Pool
                          </h3>
                          <p className="text-xs text-neutral-500 font-mono">
                            Enterprise Account ID: #{currentOrg?.whmcsClientId?.replace("WHMCS", "ZCL") || "ZCL-CL-40192"}
                          </p>
                        </div>
                      </div>

                      <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5">
                        Active Subscription
                      </span>
                    </div>

                    {/* Pooled Storage Meter */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-neutral-500 font-mono text-[11px]">
                        <span>Pooled Storage Utilization: 22.0 GB / 50.0 GB</span>
                        <span className="font-bold text-neutral-900 dark:text-white">44% Allocated</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[44%]" />
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between border-t border-[#eaeaea] dark:border-[#202636] gap-2">
                      <span className="text-xs font-mono text-neutral-500">
                        Flat Monthly Billing: Active • Managed by ZegaCloud Infrastructure
                      </span>
                      <button
                        type="button"
                        onClick={() => alert("Opening ZegaCloud Consolidated Invoicing...")}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                      >
                        <span>Open Billing Portal & Invoices</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PERSPECTIVE B: REGULAR MAILBOX USER (MEMBER VIEW) */}
              {settingsPerspective === "member" && (
                <div className="space-y-6">
                  {/* Personal Profile & Identity */}
                  <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-[#121212] dark:text-white flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <span>Personal Profile & Work Identity</span>
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Configure how your name and contact details display on outgoing emails.
                        </p>
                      </div>
                      {profileSaved && <span className="text-xs text-emerald-600 font-bold">Profile Saved!</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-semibold text-neutral-700 dark:text-neutral-300">Display Name</label>
                        <input
                          type="text"
                          value={userProfileName}
                          onChange={(e) => setUserProfileName(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161a25]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-neutral-700 dark:text-neutral-300">Job Title / Department</label>
                        <input
                          type="text"
                          value={userJobTitle}
                          onChange={(e) => setUserJobTitle(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161a25]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-neutral-700 dark:text-neutral-300">Mailbox Address (Managed)</label>
                        <input
                          type="email"
                          readOnly
                          value={currentUser?.email || "alex@acmedesign.co"}
                          className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#161a25] font-mono opacity-80"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-neutral-700 dark:text-neutral-300">Recovery Mobile Phone</label>
                        <input
                          type="text"
                          value={userRecoveryPhone}
                          onChange={(e) => setUserRecoveryPhone(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161a25]"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-bold transition-all shadow-sm"
                    >
                      Save Profile Changes
                    </button>
                  </div>

                  {/* Personal HTML Email Signature */}
                  <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-[#121212] dark:text-white flex items-center gap-2">
                          <Edit3 className="h-4 w-4 text-amber-500" />
                          <span>Personal Email Signature</span>
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Rendered at the bottom of your outgoing messages and proposals.
                        </p>
                      </div>
                      {sigSaved && <span className="text-xs text-emerald-600 font-bold">Signature Saved!</span>}
                    </div>

                    <div className="space-y-3">
                      <textarea
                        rows={4}
                        value={userSignature}
                        onChange={(e) => setUserSignature(e.target.value)}
                        className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#161a25] text-xs font-mono"
                        placeholder="Add your HTML or text signature here..."
                      />

                      <div className="flex flex-wrap gap-4 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sigAutoInsertNew}
                            onChange={(e) => setSigAutoInsertNew(e.target.checked)}
                            className="rounded border-neutral-300 text-blue-600"
                          />
                          <span className="text-neutral-700 dark:text-neutral-300">
                            Automatically insert signature on new messages
                          </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sigIncludeReplies}
                            onChange={(e) => setSigIncludeReplies(e.target.checked)}
                            className="rounded border-neutral-300 text-blue-600"
                          />
                          <span className="text-neutral-700 dark:text-neutral-300">
                            Include signature on replies and forwards
                          </span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveSignature}
                        className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-bold transition-all shadow-sm"
                      >
                        Save Signature
                      </button>
                    </div>
                  </div>

                  {/* Out of Office / Vacation Auto-Responder */}
                  <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-[#121212] dark:text-white flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-emerald-500" />
                          <span>Out of Office / Vacation Auto-Responder</span>
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Automatically notify senders when you are away on leave or vacation.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setVacationResponderActive(!vacationResponderActive)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          vacationResponderActive
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        {vacationResponderActive ? "Active" : "Disabled"}
                      </button>
                    </div>

                    {vacationSaved && <span className="text-xs text-emerald-600 font-bold">Auto-Responder Saved!</span>}

                    <div className="space-y-3 pt-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold text-neutral-700 dark:text-neutral-300">Start Date</label>
                          <input
                            type="date"
                            value={vacationStartDate}
                            onChange={(e) => setVacationStartDate(e.target.value)}
                            disabled={!vacationResponderActive}
                            className="w-full p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] disabled:opacity-50"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-neutral-700 dark:text-neutral-300">End Date</label>
                          <input
                            type="date"
                            value={vacationEndDate}
                            onChange={(e) => setVacationEndDate(e.target.value)}
                            disabled={!vacationResponderActive}
                            className="w-full p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-neutral-700 dark:text-neutral-300">Subject</label>
                        <input
                          type="text"
                          value={vacationSubject}
                          onChange={(e) => setVacationSubject(e.target.value)}
                          disabled={!vacationResponderActive}
                          className="w-full p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-neutral-700 dark:text-neutral-300">Auto-Reply Message</label>
                        <textarea
                          rows={3}
                          value={vacationMessage}
                          onChange={(e) => setVacationMessage(e.target.value)}
                          disabled={!vacationResponderActive}
                          className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] disabled:opacity-50"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={vacationOnlyContacts}
                          onChange={(e) => setVacationOnlyContacts(e.target.checked)}
                          disabled={!vacationResponderActive}
                          className="rounded border-neutral-300 text-blue-600 disabled:opacity-50"
                        />
                        <span className="text-neutral-700 dark:text-neutral-300">
                          Only send auto-response to senders in my contact list
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={handleSaveVacation}
                        disabled={!vacationResponderActive}
                        className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                      >
                        Save Auto-Responder
                      </button>
                    </div>
                  </div>

                  {/* Mail Forwarding & Spam Rules */}
                  <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] p-5 sm:p-6 shadow-sm space-y-4">
                    <h2 className="text-sm sm:text-base font-bold text-[#121212] dark:text-white flex items-center gap-2">
                      <Send className="h-4 w-4 text-blue-500" />
                      <span>Email Forwarding & Spam Filtering Rules</span>
                    </h2>

                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#151924] space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-white">Auto-Forward Incoming Mail</p>
                            <p className="text-[11px] text-neutral-500">
                              Forward a copy of every message received to another external email.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setForwardingEnabled(!forwardingEnabled)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              forwardingEnabled
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                            }`}
                          >
                            {forwardingEnabled ? "Forwarding On" : "Off"}
                          </button>
                        </div>

                        {forwardingEnabled && (
                          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                            <input
                              type="email"
                              value={forwardingAddress}
                              onChange={(e) => setForwardingAddress(e.target.value)}
                              placeholder="external@gmail.com"
                              className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25]"
                            />
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={forwardKeepCopy}
                                onChange={(e) => setForwardKeepCopy(e.target.checked)}
                                className="rounded border-neutral-300 text-blue-600"
                              />
                              <span className="text-neutral-700 dark:text-neutral-300">
                                Keep a copy in my ZegaCloud inbox
                              </span>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Spam sensitivity */}
                      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#151924] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">Spam Filter Sensitivity</p>
                          <p className="text-[11px] text-neutral-500">
                            Automatic Bayesian and DNS reputation filtering.
                          </p>
                        </div>
                        <select
                          value={spamSensitivity}
                          onChange={(e) => setSpamSensitivity(e.target.value as any)}
                          className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs capitalize"
                        >
                          <option value="standard">Standard (Recommended)</option>
                          <option value="aggressive">Aggressive (Quarantine more)</option>
                          <option value="relaxed">Relaxed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* App Passwords & Connected Devices */}
                  <div className="rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#11141d] p-5 sm:p-6 shadow-sm space-y-4">
                    <h2 className="text-sm sm:text-base font-bold text-[#121212] dark:text-white flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-indigo-500" />
                      <span>App-Specific Passwords (Apple Mail, Outlook, Thunderbird)</span>
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Generate unique, revocable passwords to connect your email clients without exposing your primary account credentials.
                    </p>

                    {/* Generate app password */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAppName}
                        onChange={(e) => setNewAppName(e.target.value)}
                        placeholder="Device / App name (e.g. iPad Pro Mail)"
                        className="flex-1 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161a25] text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateAppPassword}
                        disabled={!newAppName.trim()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                      >
                        Generate Password
                      </button>
                    </div>

                    {generatedAppPass && (
                      <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-emerald-900 dark:text-emerald-200">
                            Your Generated App Password:
                          </p>
                          <p className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                            {generatedAppPass}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedAppPass);
                            alert("Copied app password!");
                          }}
                          className="px-3 py-1 rounded bg-white dark:bg-[#161a25] border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-200"
                        >
                          Copy
                        </button>
                      </div>
                    )}

                    {/* Active app passwords list */}
                    <div className="space-y-2 pt-1 text-xs">
                      {appPasswords.map((app) => (
                        <div
                          key={app.id}
                          className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#151924] flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-neutral-900 dark:text-white">{app.name}</p>
                            <p className="text-[11px] text-neutral-400 font-mono">
                              Created: {app.created} • Last Used: {app.lastUsed}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRevokeAppPassword(app.id)}
                            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                          >
                            Revoke Access
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </main>
          )}
        </div>
      </div>

      {/* DOMAIN REGISTRATION & SEARCH MODAL */}
      {isWhmcsDomainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Globe className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-sm text-[#121212] dark:text-white">
                  Register Business Domain
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWhmcsDomainModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              Search and register business domains directly through ZegaCloud. Verified DNS records (MX, SPF, DKIM, DMARC) are pre-configured automatically.
            </p>

            {domainOrderSuccess && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{domainOrderSuccess}</span>
              </div>
            )}

            <form onSubmit={handleOrderWhmcsDomain} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="mybrandname.com"
                  value={whmcsSearchDomain}
                  onChange={(e) => {
                    setWhmcsSearchDomain(e.target.value);
                    setWhmcsDomainAvailable(null);
                  }}
                  className="flex-1 rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] px-3.5 py-2 text-xs font-mono"
                />
                <button
                  type="submit"
                  disabled={isOrderingDomain}
                  className="rounded-lg bg-[#121212] dark:bg-white text-white dark:text-[#121212] px-4 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  {isOrderingDomain ? "Processing…" : "Check & Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPOSE EMAIL MODAL */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#0e1119]">
              <span className="text-xs font-semibold text-[#121212] dark:text-white flex items-center gap-2">
                <Send className="h-3.5 w-3.5" />
                <span>New Message</span>
              </span>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {sendSuccessMessage ? (
              <div className="p-8 text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <Check className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-[#121212] dark:text-white">
                  {sendSuccessMessage}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="p-4 space-y-3 flex-1 flex flex-col">
                <div className="flex items-center gap-2 border-b border-[#eaeaea] dark:border-[#202636] pb-2">
                  <label htmlFor="compose-to" className="text-xs font-medium text-neutral-400 w-12">
                    To:
                  </label>
                  <input
                    id="compose-to"
                    type="email"
                    required
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder="client@company.com"
                    className="flex-1 text-xs bg-transparent focus-visible:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 border-b border-[#eaeaea] dark:border-[#202636] pb-2">
                  <label htmlFor="compose-subject" className="text-xs font-medium text-neutral-400 w-12">
                    Subject:
                  </label>
                  <input
                    id="compose-subject"
                    type="text"
                    required
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="Proposal: Q4 Project Scope"
                    className="flex-1 text-xs bg-transparent focus-visible:outline-none"
                  />
                </div>

                {/* Read Receipt & Tracking Toggle */}
                <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                      Client Read Receipt & Open Tracking
                    </span>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableTracking}
                      onChange={(e) => setEnableTracking(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-9 h-5 rounded-full transition-colors ${
                        enableTracking ? "bg-[#121212] dark:bg-white" : "bg-neutral-300 dark:bg-neutral-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white dark:bg-[#121212] transition-transform transform mt-0.5 ${
                          enableTracking ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                  </label>
                </div>

                <div className="flex-1">
                  <textarea
                    required
                    rows={8}
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="Write your email here…"
                    className="w-full text-xs p-2 rounded-lg border border-[#eaeaea] dark:border-[#202636] bg-[#faf9f6] dark:bg-[#161a25] focus-visible:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    Press <kbd>Esc</kbd> to cancel
                  </span>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#121212] dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-[#121212] hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSending ? "Dispatching…" : "Send Email"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EXTERNAL CLIENT SETUP MODAL */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#121212] dark:text-white">
                  Connect iPhone, Mac Mail or Outlook
                </h2>
                <p className="text-xs text-neutral-500">
                  Standard SSL IMAP & SMTP endpoints for your custom domain email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Incoming Server (IMAP SSL)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#faf9f6] dark:bg-[#161a25] border border-[#eaeaea] dark:border-[#202636]">
                  <p className="text-neutral-400 text-[10px]">Host</p>
                  <p className="font-mono font-medium">mail.zegamail.com</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#faf9f6] dark:bg-[#161a25] border border-[#eaeaea] dark:border-[#202636]">
                  <p className="text-neutral-400 text-[10px]">Port</p>
                  <p className="font-mono font-medium">993 (SSL/TLS)</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Outgoing Server (SMTP SSL)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#faf9f6] dark:bg-[#161a25] border border-[#eaeaea] dark:border-[#202636]">
                  <p className="text-neutral-400 text-[10px]">Host</p>
                  <p className="font-mono font-medium">smtp.zegamail.com</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#faf9f6] dark:bg-[#161a25] border border-[#eaeaea] dark:border-[#202636]">
                  <p className="text-neutral-400 text-[10px]">Port</p>
                  <p className="font-mono font-medium">465 (SSL/TLS)</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="rounded-lg bg-[#121212] dark:bg-white text-white dark:text-[#121212] px-4 py-2 text-xs font-semibold"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-PAGE COMPOSE WORKSPACE */}
      <FullComposeWorkspace
        isOpen={isFullComposeOpen}
        onClose={() => setIsFullComposeOpen(false)}
        templates={templates}
        mailboxes={
          mailboxes.length > 0
            ? mailboxes
            : [{ emailAddress: currentUser?.email || "sales@acmedesign.co", role: "Primary" }]
        }
        onSendSuccess={(newMsg) => {
          setMessages((prev) => [newMsg, ...prev]);
          setSelectedMessageId(newMsg.id);
          setSelectedFolder(newMsg.tracked ? "tracked" : "sent");
          setIsFullComposeOpen(false);
        }}
      />

      {/* NEW CUSTOM FOLDER MODAL */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-amber-500" />
                <span>Create Custom Folder</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewFolderModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Clients, Product Launches"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Label Color
                </label>
                <div className="flex items-center gap-2">
                  {["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#ef4444", "#64748b"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewFolderColor(color)}
                      className={`h-7 w-7 rounded-full border-2 transition-transform ${
                        newFolderColor === color
                          ? "scale-110 border-black dark:border-white shadow-sm"
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
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-xl hover:opacity-90 shadow-sm"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROVISION TEAM MEMBER MODAL */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                    Provision Mailbox Member
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Add user under {currentDomain}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {memberSuccessMessage && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{memberSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateMember} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Rivera"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Mailbox Email Prefix
                </label>
                <div className="flex items-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500">
                  <input
                    type="text"
                    required
                    placeholder="jordan"
                    value={newMemberEmailPrefix}
                    onChange={(e) => setNewMemberEmailPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                    className="flex-1 bg-transparent px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />
                  <span className="px-3 text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800/60 py-2 border-l border-neutral-200 dark:border-neutral-800 font-mono">
                    @{currentDomain}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Role & Permission
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="member">Member (Mailbox)</option>
                    <option value="admin">Admin (Manage Team)</option>
                    <option value="billing">Billing Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Dedicated Quota
                  </label>
                  <select
                    value={newMemberQuotaMb}
                    onChange={(e) => setNewMemberQuotaMb(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={2048}>2.0 GB Storage</option>
                    <option value={5120}>5.0 GB Storage</option>
                    <option value={10240}>10.0 GB Storage</option>
                    <option value={25600}>25.0 GB Storage</option>
                    <option value={51200}>50.0 GB Storage</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-sm transition-colors"
                >
                  Provision Mailbox
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0b0d14]/95 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800/80 flex md:hidden items-center justify-around py-1.5 px-1 shadow-lg"
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab("mail");
            setMobileMailView("list");
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === "mail"
              ? "text-amber-600 dark:text-amber-400 font-semibold"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <Mail className="h-4 w-4 mb-0.5" />
          <span className="text-[10px]">Mail</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("campaigns")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === "campaigns"
              ? "text-amber-600 dark:text-amber-400 font-semibold"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <Send className="h-4 w-4 mb-0.5" />
          <span className="text-[10px]">Campaigns</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === "ai"
              ? "text-amber-600 dark:text-amber-400 font-semibold"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <Sparkles className="h-4 w-4 mb-0.5" />
          <span className="text-[10px]">AI Copilot</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contacts")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === "contacts"
              ? "text-amber-600 dark:text-amber-400 font-semibold"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <Users className="h-4 w-4 mb-0.5" />
          <span className="text-[10px]">Contacts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("domains")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === "domains"
              ? "text-amber-600 dark:text-amber-400 font-semibold"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <Globe className="h-4 w-4 mb-0.5" />
          <span className="text-[10px]">Domains</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === "settings"
              ? "text-amber-600 dark:text-amber-400 font-semibold"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <Settings className="h-4 w-4 mb-0.5" />
          <span className="text-[10px]">Settings</span>
        </button>
      </nav>
    </div>
  );
}
