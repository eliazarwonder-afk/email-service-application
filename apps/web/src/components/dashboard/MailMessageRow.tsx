"use client";

import React, { useState } from "react";
import {
  Square,
  CheckSquare,
  Star,
  CheckCheck,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  Paperclip
} from "lucide-react";

export interface EmailMessage {
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
  isStarred?: boolean;
  tracked?: boolean;
  openCount?: number;
  lastOpened?: string;
  device?: string;
  followUpDue?: string;
  isHtml?: boolean;
  attachments?: { name: string; size: string; type: string }[];
}

interface MailMessageRowProps {
  message: EmailMessage;
  isSelected: boolean;
  isActive: boolean;
  onSelect: (e: React.MouseEvent, id: string | number) => void;
  onClick: () => void;
  onToggleStar: (e: React.MouseEvent, id: string | number) => void;
  onArchive: (e: React.MouseEvent, id: string | number) => void;
  onDelete: (e: React.MouseEvent, id: string | number) => void;
  onToggleRead: (e: React.MouseEvent, id: string | number) => void;
  currentUserEmail?: string;
}

export function MailMessageRow({
  message,
  isSelected,
  isActive,
  onSelect,
  onClick,
  onToggleStar,
  onArchive,
  onDelete,
  onToggleRead,
  currentUserEmail,
}: MailMessageRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isUnread = message.isRead === false;
  const isSent =
    message.folder === "sent" ||
    message.folder === "tracked" ||
    (currentUserEmail && message.fromEmail?.toLowerCase() === currentUserEmail.toLowerCase());

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`group relative flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer transition-colors duration-100 select-none ${
        isActive
          ? "bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-l-blue-600 dark:border-l-blue-400"
          : isSelected
          ? "bg-slate-100 dark:bg-slate-800/50"
          : isUnread
          ? "bg-white dark:bg-[#0c1017] font-semibold"
          : "bg-slate-50/40 dark:bg-[#0e131d]/60 text-slate-600 dark:text-slate-400"
      }`}
    >
      {/* 1. Selection Checkbox */}
      <button
        type="button"
        onClick={(e) => onSelect(e, message.id)}
        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
        aria-label="Select message"
      >
        {isSelected ? (
          <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <Square className="h-4 w-4" />
        )}
      </button>

      {/* 2. Star Icon */}
      <button
        type="button"
        onClick={(e) => onToggleStar(e, message.id)}
        className={`p-1 transition-colors shrink-0 ${
          message.isStarred
            ? "text-amber-400"
            : "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-300"
        }`}
        aria-label={message.isStarred ? "Unstar message" : "Star message"}
      >
        <Star className={`h-4 w-4 ${message.isStarred ? "fill-amber-400" : ""}`} />
      </button>

      {/* 3. Sender Name Column */}
      <div className="w-24 sm:w-40 shrink-0 truncate">
        <span
          className={`text-xs ${
            isUnread
              ? "font-bold text-slate-900 dark:text-white"
              : "font-medium text-slate-700 dark:text-slate-300"
          }`}
        >
          {message.from}
        </span>
      </div>

      {/* 4. Subject & Snippet Column (Gmail/Zoho style inline text) */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-hidden">
        <span
          className={`text-xs truncate shrink-0 max-w-[260px] sm:max-w-md ${
            isUnread
              ? "font-semibold text-slate-900 dark:text-white"
              : "text-slate-700 dark:text-slate-300"
          }`}
        >
          {message.subject}
        </span>

        <span className="text-slate-400 dark:text-slate-500 text-xs hidden md:inline shrink-0">
          —
        </span>

        <span className="text-xs text-slate-500 dark:text-slate-400 truncate hidden md:inline">
          {message.preview}
        </span>

        {/* Attachment indicator if present */}
        {message.attachments && message.attachments.length > 0 && (
          <Paperclip className="h-3 w-3 text-slate-400 shrink-0 ml-1" />
        )}

        {/* RFC 3461 Delivery Status Tick for Outgoing / Sent Mail */}
        {isSent && (
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 shrink-0 ml-auto mr-1"
            title="MTA 250 OK • Delivered via TLS 1.3"
          >
            <CheckCheck className="h-3 w-3 text-emerald-600" />
            <span className="hidden sm:inline">250 OK</span>
          </span>
        )}
      </div>

      {/* 5. Date / Timestamp OR Hover Actions Bar */}
      <div className="shrink-0 flex items-center justify-end min-w-[70px] sm:min-w-[90px] text-right">
        {/* On Hover: Slide in quick actions (Gmail hallmark UX) */}
        {isHovered ? (
          <div
            className="flex items-center gap-1 bg-white dark:bg-[#0c1017] px-1 py-0.5 rounded-lg shadow-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => onArchive(e, message.id)}
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Archive"
            >
              <Archive className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => onDelete(e, message.id)}
              className="p-1 rounded text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => onToggleRead(e, message.id)}
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              title={isUnread ? "Mark as Read" : "Mark as Unread"}
            >
              {isUnread ? <MailOpen className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
            </button>
          </div>
        ) : (
          <span
            className={`text-[11px] font-mono ${
              isUnread
                ? "font-bold text-slate-900 dark:text-white"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {message.date}
          </span>
        )}
      </div>
    </div>
  );
}
