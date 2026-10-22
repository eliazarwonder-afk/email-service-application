"use client";

import React from "react";
import {
  Inbox,
  Send,
  FileText,
  Archive,
  ShieldAlert,
  Trash2,
  Star,
  FolderPlus,
  BarChart3,
  Sparkles,
  Globe,
  Users,
  Settings,
  Edit3,
  HardDrive,
  ChevronRight,
  Plus
} from "lucide-react";

interface CustomFolder {
  id: string;
  name: string;
  color?: string;
}

interface DashboardSidebarProps {
  activeTab: "mail" | "ai" | "campaigns" | "contacts" | "domains" | "settings";
  setActiveTab: (tab: "mail" | "ai" | "campaigns" | "contacts" | "domains" | "settings") => void;
  selectedFolder: string;
  setSelectedFolder: (folder: string) => void;
  customFolders: CustomFolder[];
  messages: Array<{ folder: string; isRead?: boolean }>;
  onOpenCompose: () => void;
  onOpenNewFolder: () => void;
  onOpenUpgradeModal: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentOrgPlan?: string;
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  selectedFolder,
  setSelectedFolder,
  customFolders,
  messages,
  onOpenCompose,
  onOpenNewFolder,
  onOpenUpgradeModal,
  isSidebarOpen,
  setIsSidebarOpen,
  currentOrgPlan = "GROWTH",
}: DashboardSidebarProps) {
  const inboxCount = messages.filter((m) => m.folder === "inbox" && m.isRead === false).length;
  const totalInbox = messages.filter((m) => m.folder === "inbox").length;
  const sentCount = messages.filter((m) => m.folder === "sent" || m.folder === "tracked").length;
  const draftsCount = messages.filter((m) => m.folder === "drafts").length;
  const spamCount = messages.filter((m) => m.folder === "spam").length;

  const mailFolders = [
    { id: "inbox", label: "Inbox", icon: Inbox, count: inboxCount || totalInbox, isUnreadBadge: inboxCount > 0 },
    { id: "starred", label: "Starred", icon: Star, count: 0 },
    { id: "sent", label: "Sent", icon: Send, count: sentCount },
    { id: "drafts", label: "Drafts", icon: FileText, count: draftsCount },
    { id: "archive", label: "Archive", icon: Archive, count: 0 },
    { id: "spam", label: "Spam", icon: ShieldAlert, count: spamCount, isSpam: true },
    { id: "trash", label: "Trash", icon: Trash2, count: 0 },
  ];

  const workspaceLinks = [
    { id: "campaigns" as const, label: "Campaigns & Sequences", icon: BarChart3, badge: "Cold Mail" },
    { id: "ai" as const, label: "AI Outreach Studio", icon: Sparkles, badge: "Copilot" },
    { id: "domains" as const, label: "Domain DNS & Routing", icon: Globe, badge: "2048 DKIM" },
    { id: "contacts" as const, label: "Client Directory", icon: Users },
    { id: "settings" as const, label: "Settings & Team", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 bg-slate-50/80 dark:bg-[#0c1017] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-200 ease-in-out select-none shrink-0 ${
          isSidebarOpen
            ? "translate-x-0 w-64 opacity-100"
            : "-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:opacity-0 md:overflow-hidden pointer-events-none"
        }`}
      >
        {/* Top Section: Prominent Gmail/Zoho Compose Button */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <button
            type="button"
            onClick={() => {
              onOpenCompose();
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] px-5 py-3.5 text-sm font-semibold text-white shadow-md hover:shadow-lg shadow-blue-500/20 transition-all duration-150"
          >
            <Edit3 className="h-4 w-4" />
            <span>Compose Email</span>
            <kbd className="ml-auto hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-700/60 text-blue-100">
              C
            </kbd>
          </button>

          {/* Standard Folders Navigation (Gmail/Zoho style active pill) */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-1.5 block">
              Mailbox
            </span>

            {mailFolders.map((folder) => {
              const Icon = folder.icon;
              const isSelected = activeTab === "mail" && selectedFolder === folder.id;

              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => {
                    setActiveTab("mail");
                    setSelectedFolder(folder.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`h-4 w-4 ${
                        isSelected
                          ? "text-blue-600 dark:text-blue-400"
                          : folder.isSpam
                          ? "text-rose-500"
                          : "text-slate-400"
                      }`}
                    />
                    <span className="truncate">{folder.label}</span>
                  </span>

                  {folder.count !== undefined && folder.count > 0 && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        folder.isUnreadBadge
                          ? "bg-blue-600 text-white"
                          : folder.isSpam
                          ? "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {folder.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Workspace Apps Section */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-1.5 block">
              Workspaces & Tools
            </span>

            {workspaceLinks.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`h-4 w-4 ${
                        isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>

                  {item.badge && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Labels / Folders */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Labels & Tags
              </span>
              <button
                type="button"
                onClick={onOpenNewFolder}
                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Create New Folder"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {customFolders.length === 0 ? (
              <p className="px-3 text-[11px] text-slate-400 italic">No custom labels</p>
            ) : (
              customFolders.map((fld) => {
                const count = messages.filter((m) => m.folder === fld.id).length;
                const isSelected = activeTab === "mail" && selectedFolder === fld.id;

                return (
                  <button
                    key={fld.id}
                    type="button"
                    onClick={() => {
                      setActiveTab("mail");
                      setSelectedFolder(fld.id);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: fld.color || "#3b82f6" }}
                      />
                      <span className="truncate">{fld.name}</span>
                    </span>

                    {count > 0 && (
                      <span className="text-[10px] font-mono px-1.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Section: Mailbox Storage Quota Card */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0c1017] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <HardDrive className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Storage Used</span>
            </span>
            <span className="font-mono text-[11px] font-semibold text-slate-900 dark:text-slate-200">
              18% (0.9 GB)
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-[18%] rounded-full transition-all" />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-slate-400 font-mono">5.0 GB Quota</span>
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Get More
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
