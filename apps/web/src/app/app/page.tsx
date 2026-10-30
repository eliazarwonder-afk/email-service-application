"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MailToolbar } from "@/components/dashboard/MailToolbar";
import { MailMessageRow, EmailMessage } from "@/components/dashboard/MailMessageRow";
import { MailReadingPane } from "@/components/dashboard/MailReadingPane";
import { FloatingComposer } from "@/components/dashboard/FloatingComposer";
import { ContactsView } from "@/components/dashboard/ContactsView";
import { AiStudioView } from "@/components/dashboard/AiStudioView";
import { DashboardSettingsView } from "@/components/dashboard/DashboardSettingsView";
import { DashboardModals } from "@/components/dashboard/DashboardModals";

import { CampaignsWorkspace } from "@/components/campaigns/CampaignsWorkspace";
import { FullComposeWorkspace } from "@/components/mail/FullComposeWorkspace";
import { MailboxSkeletonLoader } from "@/components/mail/MailboxSkeletonLoader";

export default function WebmailAppPage() {
  const router = useRouter();

  // Active Workspace Tab & Layout State
  const [activeTab, setActiveTab] = useState<"mail" | "ai" | "campaigns" | "contacts" | "settings">("mail");
  const [selectedFolder, setSelectedFolder] = useState<string>("inbox");
  const [selectedMessageId, setSelectedMessageId] = useState<string | number>("msg_1");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "starred">("all");
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string | number>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileMailView, setMobileMailView] = useState<"list" | "message">("list");

  // Modals & Composer State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isFullComposeOpen, setIsFullComposeOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isNewMailboxModalOpen, setIsNewMailboxModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const handleOpenUpgradePortal = () => {
    window.open("https://billing.zegacloud.com/upgrade.php", "_blank", "noopener,noreferrer");
  };

  // Custom Folders & Templates
  const [customFolders, setCustomFolders] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#2563eb");

  // Authenticated User & Database State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentOrg, setCurrentOrg] = useState<any>(null);
  const [currentDomain, setCurrentDomain] = useState<any>(null);
  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Messages & Contacts State
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
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

  // Settings Workspace: Admin vs Member Perspective View
  const [settingsPerspective, setSettingsPerspective] = useState<"admin" | "member">("admin");
  const [adminTeamMembers, setAdminTeamMembers] = useState([
    { id: "usr_1", name: "Alex Carter", email: "alex@acmedesign.co", role: "Owner", quotaMb: 10000, usedMb: 620, status: "Active", lastActive: "Active now" },
    { id: "usr_2", name: "Sarah Jenkins", email: "sales@acmedesign.co", role: "Admin", quotaMb: 10000, usedMb: 240, status: "Active", lastActive: "12m ago" },
    { id: "usr_3", name: "Support Desk", email: "support@acmedesign.co", role: "Member", quotaMb: 5000, usedMb: 85, status: "Active", lastActive: "1h ago" },
    { id: "usr_4", name: "Dev Ops Routing", email: "devops@acmedesign.co", role: "Member", quotaMb: 5000, usedMb: 30, status: "Suspended", lastActive: "3d ago" },
  ]);
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

  // Regular User (Member) Settings State
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
  const [vacationSaved, setVacationSaved] = useState(false);

  const [forwardingEnabled, setForwardingEnabled] = useState(false);
  const [forwardingAddress, setForwardingAddress] = useState("alex.carter.personal@gmail.com");

  const [appPasswords, setAppPasswords] = useState([
    { id: "app_1", name: "iPhone Apple Mail", created: "2026-09-14", lastUsed: "Today at 2:15 PM" },
    { id: "app_2", name: "MacBook Air Thunderbird", created: "2026-10-02", lastUsed: "Yesterday" },
  ]);
  const [newAppName, setNewAppName] = useState("");
  const [generatedAppPass, setGeneratedAppPass] = useState("");

  const [billingOrders, setBillingOrders] = useState<any[]>([]);

  // Fast Unified Bootstrap Loader
  const loadDashboardBootstrap = async () => {
    try {
      setIsLoadingAuth(true);
      setIsLoadingMessages(true);
      const res = await fetch("/api/bootstrap");
      const data = await res.json();

      if (data.success) {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setCurrentOrg(data.org);
          setCurrentDomain(data.domain);
          setMailboxes(data.mailboxes || []);
          setIsDemoMode(false);
        } else {
          setCurrentUser(data.user || { name: "Alex Carter", email: "sales@acmedesign.co", role: "owner" });
          setCurrentOrg(data.org || { name: "Acme Creative Studio Ltd", plan: "growth", whmcsClientId: "WHMCS-CL-40192" });
          setCurrentDomain(data.domain || { domainName: "acmedesign.co" });
          setMailboxes(data.mailboxes || []);
          setIsDemoMode(true);
        }

        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          if (!selectedMessageId) {
            setSelectedMessageId(data.messages[0].id);
          }
        }
        if (data.folders) setCustomFolders(data.folders);
        if (data.templates) setTemplates(data.templates);
        if (data.billingOrders) setBillingOrders(data.billingOrders);
        if (data.contacts) setContacts(data.contacts);
      }
    } catch (err) {
      console.error("Dashboard bootstrap error", err);
      setIsDemoMode(true);
    } finally {
      setIsLoadingAuth(false);
      setIsLoadingMessages(false);
    }
  };

  const loadBillingOrders = async () => {
    try {
      const res = await fetch("/api/billing/orders");
      const data = await res.json();
      if (data.success) setBillingOrders(data.orders || []);
    } catch (e) {}
  };

  const loadContacts = async () => {
    try {
      const res = await fetch("/api/contacts");
      const data = await res.json();
      if (data.success && data.contacts) setContacts(data.contacts);
    } catch (e) {}
  };

  const loadSession = loadDashboardBootstrap;
  const loadMessages = async () => {
    try {
      const res = await fetch("/api/mail");
      const data = await res.json();
      if (data.success && data.messages) setMessages(data.messages);
    } catch (e) {}
  };
  const loadFolders = async () => {};
  const loadTemplates = async () => {};

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
      const params = new URLSearchParams(window.location.search);
      const ssoToken = params.get("sso_token") || params.get("token");
      if (ssoToken) {
        window.location.href = `/api/auth/sso?token=${encodeURIComponent(ssoToken)}`;
        return;
      }
      const tab = params.get("tab");
      if (tab && ["mail", "ai", "campaigns", "contacts", "domains", "settings"].includes(tab)) {
        setActiveTab(tab as any);
      }
    }
    loadDashboardBootstrap();
  }, []);

  // Action Handlers
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

  const handleToggleStar = (id: string | number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m))
    );
  };

  const handleToggleRead = (id: string | number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: !m.isRead } : m))
    );
  };

  const handleDeleteMessage = (id: string | number) => {
    handleMoveMessage(id, "trash");
  };

  const handleArchiveMessage = (id: string | number) => {
    handleMoveMessage(id, "archive");
  };

  // Batch Selection Handlers
  const handleSelectAll = () => {
    const allIds = new Set(filteredMessages.map((m) => m.id));
    setSelectedMessageIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedMessageIds(new Set());
  };

  const handleToggleSelectOne = (id: string | number) => {
    setSelectedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleArchiveSelected = () => {
    selectedMessageIds.forEach((id) => handleArchiveMessage(id));
    setSelectedMessageIds(new Set());
  };

  const handleDeleteSelected = () => {
    selectedMessageIds.forEach((id) => handleDeleteMessage(id));
    setSelectedMessageIds(new Set());
  };

  const handleMarkReadSelected = () => {
    setMessages((prev) =>
      prev.map((m) => (selectedMessageIds.has(m.id) ? { ...m, isRead: true } : m))
    );
    setSelectedMessageIds(new Set());
  };

  const handleSpamSelected = () => {
    selectedMessageIds.forEach((id) => handleMoveMessage(id, "spam"));
    setSelectedMessageIds(new Set());
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleOpenCompose = (to = "", subject = "", body = "") => {
    setComposeTo(to);
    setComposeSubject(subject);
    setComposeBody(body);
    setIsComposeOpen(true);
  };

  const handleSelectFolder = (folder: string) => {
    setSelectedFolder(folder);
    setActiveTab("mail");
    setMobileMailView("list");
  };

  const handleSelectMessage = (id: string) => {
    setSelectedMessageId(id);
    setActiveTab("mail");
    setMobileMailView("message");
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
        setSelectedFolder("sent");
        setIsSending(false);
        setSendSuccessMessage("Message dispatched and delivered to recipient mail server (250 OK)!");

        setTimeout(() => {
          setIsComposeOpen(false);
          setSendSuccessMessage("");
          setComposeTo("");
          setComposeSubject("");
          setComposeBody("");
        }, 1100);
      }
    } catch (err) {
      alert("Failed to send outgoing email.");
      setIsSending(false);
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

  const handleToggleMemberStatus = (id: string) => {
    setAdminTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: m.status === "Active" ? "Suspended" : "Active" } : m))
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

  // Filtered Messages based on folder, search query, and active filter pill
  const filteredMessages = messages.filter((m) => {
    const matchesFolder =
      selectedFolder === "starred"
        ? m.isStarred === true
        : selectedFolder === "sent"
        ? m.folder === "sent" || m.folder === "tracked"
        : m.folder === selectedFolder;

    const matchesSearch =
      searchQuery === "" ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.body.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilterPill =
      activeFilter === "all"
        ? true
        : activeFilter === "unread"
        ? m.isRead === false
        : m.isStarred === true;

    return matchesFolder && matchesSearch && matchesFilterPill;
  });

  const activeMessage = messages.find((m) => m.id === selectedMessageId) || filteredMessages[0] || messages[0];

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      {/* INTERACTIVE GUIDED DEMO MODE BANNER */}
      {isDemoMode && (
        <aside
          aria-label="Demo Mode Notification"
          className="border-b border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/70 py-1.5 px-4 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between flex-wrap gap-2 transition-colors select-none shrink-0"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-semibold">Interactive Demo Mode:</span>
            <span>
              Previewing live mailbox workspace (<strong>{currentUser?.email || "alex@acmedesign.co"}</strong>)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenUpgradePortal()}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 text-white px-2.5 py-1 font-semibold text-[11px] hover:bg-blue-700 shadow-xs cursor-pointer"
            >
              <span>Get Your Domain Email</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </aside>
      )}

      {/* TOP UNIFIED GMAIL/ZOHO APP HEADER */}
      <DashboardHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentDomain={currentDomain}
        currentUser={currentUser}
        currentOrg={currentOrg}
        messages={messages}
        contacts={contacts}
        onOpenCompose={() => handleOpenCompose()}
        onComposeTo={(toEmail) => handleOpenCompose(toEmail)}
        onSelectFolder={handleSelectFolder}
        onSelectMessage={handleSelectMessage}
        onOpenClientModal={() => setIsClientModalOpen(true)}
        onOpenUpgradeModal={() => handleOpenUpgradePortal()}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* MAIN WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT UNIFIED SIDEBAR */}
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
          customFolders={customFolders}
          messages={messages}
          onOpenCompose={() => setIsComposeOpen(true)}
          onOpenNewFolder={() => setIsNewFolderModalOpen(true)}
          onOpenUpgradeModal={() => handleOpenUpgradePortal()}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          currentOrgPlan={currentOrg?.plan}
        />

        {/* WORKSPACE CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#0c1017] relative">
          {/* TAB 1: WEBMAIL WORKSPACE */}
          {activeTab === "mail" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Mail Toolbar (Select All, Actions, Filter Pills, Page Count) */}
              <MailToolbar
                selectedCount={selectedMessageIds.size}
                totalCount={filteredMessages.length}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onRefresh={loadMessages}
                isLoading={isLoadingMessages}
                onArchiveSelected={handleArchiveSelected}
                onDeleteSelected={handleDeleteSelected}
                onMarkReadSelected={handleMarkReadSelected}
                onSpamSelected={handleSpamSelected}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                folderName={selectedFolder}
              />

              {/* Dual-Pane View: Message List on Left, Reading Pane on Right */}
              <div className="flex-1 flex overflow-hidden">
                {/* Column 1: Message List */}
                <section
                  aria-label="Message List"
                  className={`${
                    mobileMailView === "message" ? "hidden" : "flex"
                  } md:flex flex-col w-full md:w-5/12 lg:w-4/12 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] overflow-y-auto shrink-0 select-none`}
                >
                  {isLoadingMessages ? (
                    <MailboxSkeletonLoader />
                  ) : filteredMessages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <p className="text-xs font-medium">No messages found in this folder.</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Try changing your search keywords or filter tab.
                      </p>
                    </div>
                  ) : (
                    filteredMessages.map((msg) => (
                      <MailMessageRow
                        key={msg.id}
                        message={msg}
                        isSelected={selectedMessageIds.has(msg.id)}
                        isActive={selectedMessageId === msg.id}
                        onSelect={(e, id) => {
                          e.stopPropagation();
                          handleToggleSelectOne(id);
                        }}
                        onClick={() => {
                          setSelectedMessageId(msg.id);
                          setMobileMailView("message");
                        }}
                        onToggleStar={(e, id) => {
                          e.stopPropagation();
                          handleToggleStar(id);
                        }}
                        onArchive={(e, id) => {
                          e.stopPropagation();
                          handleArchiveMessage(id);
                        }}
                        onDelete={(e, id) => {
                          e.stopPropagation();
                          handleDeleteMessage(id);
                        }}
                        onToggleRead={(e, id) => {
                          e.stopPropagation();
                          handleToggleRead(id);
                        }}
                        currentUserEmail={currentUser?.email}
                      />
                    ))
                  )}
                </section>

                {/* Column 2: Reading Pane */}
                <section
                  aria-label="Reading Pane"
                  className={`${
                    mobileMailView === "list" ? "hidden md:flex" : "flex"
                  } flex-1 flex-col overflow-hidden bg-white dark:bg-[#0c1017]`}
                >
                  <MailReadingPane
                    message={activeMessage}
                    onReply={(to, subject, body = "") => {
                      setComposeTo(to);
                      setComposeSubject(subject);
                      setComposeBody(body);
                      setIsComposeOpen(true);
                    }}
                    onSmartAiReply={(subject) => {
                      setActiveTab("ai");
                      setAiPrompt(`Write a confident, friendly reply to: ${subject}`);
                    }}
                    onArchive={(id) => handleArchiveMessage(id)}
                    onDelete={(id) => handleDeleteMessage(id)}
                    onMoveFolder={(id, folder) => handleMoveMessage(id, folder)}
                    onBack={() => setMobileMailView("list")}
                    currentUserEmail={currentUser?.email}
                  />
                </section>
              </div>
            </div>
          )}

          {/* TAB 2: AI OUTREACH STUDIO */}
          {activeTab === "ai" && (
            <AiStudioView
              leadName={aiLeadName}
              setLeadName={setAiLeadName}
              leadCompany={aiLeadCompany}
              setLeadCompany={setAiLeadCompany}
              tone={aiTone}
              setTone={setAiTone}
              prompt={aiPrompt}
              setPrompt={setAiPrompt}
              isGenerating={isGeneratingAi}
              onGenerate={handleGenerateAi}
              generatedEmail={generatedAiEmail}
              setGeneratedEmail={setGeneratedAiEmail}
              onSendInWebmail={(emailContent, subject) => {
                setComposeBody(emailContent);
                setComposeSubject(subject);
                setComposeTo("client@example.com");
                setIsComposeOpen(true);
              }}
            />
          )}

          {/* TAB 3: CAMPAIGNS & COLD OUTREACH */}
          {activeTab === "campaigns" && (
            <CampaignsWorkspace mailboxes={mailboxes} orgPlan={currentOrg?.plan} />
          )}

          {/* TAB 4: CONTACTS & CLIENT DIRECTORY */}
          {activeTab === "contacts" && (
            <ContactsView
              onSendEmail={(email) => {
                setComposeTo(email);
                setIsComposeOpen(true);
              }}
              onDraftAi={(name, company) => {
                setAiLeadName(name);
                setAiLeadCompany(company);
                setActiveTab("ai");
              }}
            />
          )}

          {/* TAB 6: SETTINGS & TEAM MANAGEMENT */}
          {activeTab === "settings" && (
            <DashboardSettingsView
              settingsPerspective={settingsPerspective}
              setSettingsPerspective={setSettingsPerspective}
              currentOrg={currentOrg}
              currentUser={currentUser}
              currentDomain={currentDomain}
              billingOrders={billingOrders}
              onOpenUpgradeModal={() => handleOpenUpgradePortal()}
              onOpenAddMemberModal={() => setIsAddMemberModalOpen(true)}
              adminTeamMembers={adminTeamMembers}
              onToggleMemberStatus={handleToggleMemberStatus}
              onChangeMemberRole={handleChangeMemberRole}
              onChangeMemberQuota={handleChangeMemberQuota}
              catchAllEnabled={catchAllEnabled}
              setCatchAllEnabled={setCatchAllEnabled}
              catchAllForwardEmail={catchAllForwardEmail}
              setCatchAllForwardEmail={setCatchAllForwardEmail}
              globalDisclaimer={globalDisclaimer}
              setGlobalDisclaimer={setGlobalDisclaimer}
              disclaimerSaved={disclaimerSaved}
              onSaveDisclaimer={() => {
                setDisclaimerSaved(true);
                setTimeout(() => setDisclaimerSaved(false), 2000);
              }}
              enforce2FA={enforce2FA}
              setEnforce2FA={setEnforce2FA}
              dailySendingLimit={dailySendingLimit}
              setDailySendingLimit={setDailySendingLimit}
              sessionTimeout={sessionTimeout}
              setSessionTimeout={setSessionTimeout}
              userProfileName={userProfileName}
              setUserProfileName={setUserProfileName}
              userJobTitle={userJobTitle}
              setUserJobTitle={setUserJobTitle}
              userRecoveryPhone={userRecoveryPhone}
              setUserRecoveryPhone={setUserRecoveryPhone}
              profileSaved={profileSaved}
              onSaveProfile={() => {
                setProfileSaved(true);
                setTimeout(() => setProfileSaved(false), 2000);
              }}
              userSignature={userSignature}
              setUserSignature={setUserSignature}
              sigAutoInsertNew={sigAutoInsertNew}
              setSigAutoInsertNew={setSigAutoInsertNew}
              sigIncludeReplies={sigIncludeReplies}
              setSigIncludeReplies={setSigIncludeReplies}
              sigSaved={sigSaved}
              onSaveSignature={() => {
                setSigSaved(true);
                setTimeout(() => setSigSaved(false), 2000);
              }}
              vacationResponderActive={vacationResponderActive}
              setVacationResponderActive={setVacationResponderActive}
              vacationStartDate={vacationStartDate}
              setVacationStartDate={setVacationStartDate}
              vacationEndDate={vacationEndDate}
              setVacationEndDate={setVacationEndDate}
              vacationSubject={vacationSubject}
              setVacationSubject={setVacationSubject}
              vacationMessage={vacationMessage}
              setVacationMessage={setVacationMessage}
              vacationSaved={vacationSaved}
              onSaveVacation={() => {
                setVacationSaved(true);
                setTimeout(() => setVacationSaved(false), 2000);
              }}
              forwardingEnabled={forwardingEnabled}
              setForwardingEnabled={setForwardingEnabled}
              forwardingAddress={forwardingAddress}
              setForwardingAddress={setForwardingAddress}
              appPasswords={appPasswords}
              newAppName={newAppName}
              setNewAppName={setNewAppName}
              generatedAppPass={generatedAppPass}
              onGenerateAppPassword={() => {
                if (!newAppName.trim()) return;
                const randomPass = Array.from({ length: 4 }, () =>
                  Math.random().toString(36).substring(2, 6)
                ).join("-");
                setAppPasswords((prev) => [
                  ...prev,
                  { id: `app_${Date.now()}`, name: newAppName.trim(), created: "Just now", lastUsed: "Never" },
                ]);
                setGeneratedAppPass(randomPass);
                setNewAppName("");
              }}
              onRevokeAppPassword={(id) => setAppPasswords((prev) => prev.filter((p) => p.id !== id))}
            />
          )}
        </div>
      </div>

      {/* DOCKED BOTTOM-RIGHT GMAIL-STYLE FLOATING COMPOSER */}
      <FloatingComposer
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onExpandToFull={() => {
          setIsComposeOpen(false);
          setIsFullComposeOpen(true);
        }}
        toEmail={composeTo}
        setToEmail={setComposeTo}
        subject={composeSubject}
        setSubject={setComposeSubject}
        body={composeBody}
        setBody={setComposeBody}
        enableTracking={enableTracking}
        setEnableTracking={setEnableTracking}
        onSend={handleSendEmail}
        isSending={isSending}
        sendSuccessMessage={sendSuccessMessage}
        onAiPolish={() => {
          setActiveTab("ai");
          setAiPrompt(`Polish and enhance this email draft:\n\n${composeBody}`);
          setIsComposeOpen(false);
        }}
      />

      {/* FULLSCREEN COMPOSE STUDIO WORKSPACE (Optional expansion) */}
      <FullComposeWorkspace
        isOpen={isFullComposeOpen}
        onClose={() => setIsFullComposeOpen(false)}
        templates={templates}
        mailboxes={
          mailboxes.length > 0
            ? mailboxes
            : [{ emailAddress: currentUser?.email || "sales@acmedesign.co", role: "Primary" }]
        }
        initialTo={composeTo}
        initialSubject={composeSubject}
        initialBody={composeBody}
        onSendSuccess={(newMsg) => {
          setMessages((prev) => [newMsg, ...prev]);
          setSelectedMessageId(newMsg.id);
          setSelectedFolder("sent");
          setIsFullComposeOpen(false);
        }}
      />

      {/* REUSABLE DASHBOARD MODALS */}
      <DashboardModals
        isClientModalOpen={isClientModalOpen}
        onCloseClientModal={() => setIsClientModalOpen(false)}
        isNewFolderModalOpen={isNewFolderModalOpen}
        onCloseNewFolderModal={() => setIsNewFolderModalOpen(false)}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        newFolderColor={newFolderColor}
        setNewFolderColor={setNewFolderColor}
        onCreateFolder={handleCreateFolder}
        isAddMemberModalOpen={isAddMemberModalOpen}
        onCloseAddMemberModal={() => setIsAddMemberModalOpen(false)}
        newMemberName={newMemberName}
        setNewMemberName={setNewMemberName}
        newMemberEmailPrefix={newMemberEmailPrefix}
        setNewMemberEmailPrefix={setNewMemberEmailPrefix}
        newMemberRole={newMemberRole}
        setNewMemberRole={setNewMemberRole}
        newMemberQuotaMb={newMemberQuotaMb}
        setNewMemberQuotaMb={setNewMemberQuotaMb}
        memberSuccessMessage={memberSuccessMessage}
        onCreateMember={handleCreateMember}
        currentDomainName={currentDomain?.domainName || "acmedesign.co"}
      />
    </div>
  );
}
