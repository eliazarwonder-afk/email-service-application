"use client";

import React, { useState } from "react";
import {
  Square,
  CheckSquare,
  MinusSquare,
  RefreshCw,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  Star,
  ShieldAlert,
  FolderInput,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter
} from "lucide-react";

interface MailToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onArchiveSelected?: () => void;
  onDeleteSelected?: () => void;
  onMarkReadSelected?: () => void;
  onMarkUnreadSelected?: () => void;
  onSpamSelected?: () => void;
  activeFilter: "all" | "unread" | "starred";
  setActiveFilter: (filter: "all" | "unread" | "starred") => void;
  folderName: string;
}

export function MailToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onRefresh,
  isLoading,
  onArchiveSelected,
  onDeleteSelected,
  onMarkReadSelected,
  onMarkUnreadSelected,
  onSpamSelected,
  activeFilter,
  setActiveFilter,
  folderName,
}: MailToolbarProps) {
  const [isSelectDropdownOpen, setIsSelectDropdownOpen] = useState(false);

  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isSomeSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e131d] px-3 sm:px-4 flex items-center justify-between shrink-0 transition-colors select-none text-xs">
      {/* LEFT: Checkbox Selection & Batch Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Checkbox with Dropdown Trigger */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isAllSelected ? "Deselect all" : "Select all"}
          >
            {isAllSelected ? (
              <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            ) : isSomeSelected ? (
              <MinusSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Refresh Icon Button */}
        <button
          type="button"
          onClick={onRefresh}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Refresh messages"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
        </button>

        {/* Action icons when messages are selected */}
        {selectedCount > 0 ? (
          <div className="flex items-center gap-1 ml-1 sm:ml-2 pl-2 border-l border-slate-200 dark:border-slate-800 animate-in fade-in duration-100">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mr-1 hidden sm:inline">
              {selectedCount} selected
            </span>

            {onArchiveSelected && (
              <button
                type="button"
                onClick={onArchiveSelected}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Archive"
              >
                <Archive className="h-4 w-4" />
              </button>
            )}

            {onSpamSelected && (
              <button
                type="button"
                onClick={onSpamSelected}
                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Report Spam"
              >
                <ShieldAlert className="h-4 w-4" />
              </button>
            )}

            {onDeleteSelected && (
              <button
                type="button"
                onClick={onDeleteSelected}
                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            {onMarkReadSelected && (
              <button
                type="button"
                onClick={onMarkReadSelected}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Mark as Read"
              >
                <MailOpen className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          /* Quick Filter Pills (All / Unread / Starred) like Zoho/Gmail tabs */
          <div className="flex items-center gap-1 ml-1 sm:ml-2">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("unread")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                activeFilter === "unread"
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Unread
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("starred")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
                activeFilter === "starred"
                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Star className="h-3 w-3" />
              <span>Starred</span>
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: Folder Title, Count & Pagination */}
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <span className="text-[11px] font-mono hidden sm:inline">
          {totalCount === 0 ? "0 messages" : `1–${totalCount} of ${totalCount}`}
        </span>

        <div className="flex items-center">
          <button
            type="button"
            disabled
            className="p-1 rounded text-slate-300 dark:text-slate-600 cursor-not-allowed"
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled
            className="p-1 rounded text-slate-300 dark:text-slate-600 cursor-not-allowed"
            aria-label="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
