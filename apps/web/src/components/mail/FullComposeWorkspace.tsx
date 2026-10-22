"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  Paperclip,
  Code,
  Eye,
  FileText,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Table as TableIcon,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ChevronDown,
  Bookmark,
  Layers,
  Sliders,
  AlertCircle,
  Minimize2,
} from "lucide-react";
import { StoredTemplate } from "@/lib/store";
import { validateEmail, validateSubject, validateEmailBody } from "@/lib/validation";

interface FullComposeWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSuccess: (msg: any) => void;
  mailboxes: Array<{ emailAddress: string; role?: string }>;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  templates?: StoredTemplate[];
}

export function FullComposeWorkspace({
  isOpen,
  onClose,
  onSendSuccess,
  mailboxes,
  initialTo = "",
  initialSubject = "",
  initialBody = "",
  templates = [],
}: FullComposeWorkspaceProps) {
  const [toEmail, setToEmail] = useState(initialTo);
  const [ccEmail, setCcEmail] = useState("");
  const [bccEmail, setBccEmail] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(
    initialBody ||
      `Hi David,\n\nI reviewed your current web app setup this morning and noticed a few opportunities to streamline latency and DNS deliverability.\n\nWe provide dedicated business mail infrastructure with verified 2048-bit DKIM encryption and guaranteed 99.99% uptime.\n\nWould you be open to a 15-minute sync this Thursday at 3:00 PM to review a quick diagnostic audit?\n\nBest regards,\nAlex Carter\nAcme Creative Studio`
  );

  // Editor mode: Visual (text) or Raw HTML/Code
  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual");
  const [selectedMailbox, setSelectedMailbox] = useState(
    mailboxes[0]?.emailAddress || "sales@acmedesign.co"
  );
  const [enableTracking, setEnableTracking] = useState(true);
  const [priority, setPriority] = useState<"normal" | "high">("normal");

  // Attachments State
  const [attachments, setAttachments] = useState<
    Array<{ name: string; size: string; type: string }>
  >([
    { name: "Retainer-Scope-v2.pdf", size: "1.8 MB", type: "pdf" },
  ]);

  // Templates Drawer & Custom Save
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateSuccess, setTemplateSuccess] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  // Insert merge tag into content
  const handleInsertMergeTag = (tag: string) => {
    setBody((prev) => prev + " " + tag);
  };

  // Format action helpers (for visual/markdown formatting)
  const applyFormatting = (prefix: string, suffix: string = "") => {
    setBody((prev) => `${prev}${prefix}formatted text${suffix}`);
  };

  const handleApplyTemplate = (tmpl: StoredTemplate) => {
    setSubject(tmpl.subject);
    setBody(tmpl.body);
    setIsTemplateDrawerOpen(false);
  };

  const handleSaveAsTemplate = async () => {
    if (!saveTemplateName.trim() || !subject.trim()) return;
    try {
      setIsSavingTemplate(true);
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveTemplateName.trim(),
          category: "proposals",
          subject: subject.trim(),
          body: body,
          isHtml: editorMode === "html",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTemplateSuccess(`Template "${saveTemplateName}" saved!`);
        setTimeout(() => setTemplateSuccess(""), 3000);
        setSaveTemplateName("");
      }
    } catch (err) {
      console.error("Save template error", err);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleAddAttachment = () => {
    const sampleFiles = [
      { name: "Client-Proposal-Acme.pdf", size: "2.4 MB", type: "pdf" },
      { name: "Architecture-Mockup.fig", size: "4.1 MB", type: "figma" },
      { name: "Statement-Statement-INV-40192.pdf", size: "840 KB", type: "pdf" },
      { name: "Company-Overview-Deck.pptx", size: "3.2 MB", type: "doc" },
    ];
    const nextFile = sampleFiles[attachments.length % sampleFiles.length];
    setAttachments([...attachments, nextFile]);
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    setErrorMessage("");

    const emailCheck = validateEmail(toEmail, "Recipient Email");
    if (!emailCheck.isValid) {
      setErrorMessage(emailCheck.error || "Please enter a valid recipient email address.");
      return;
    }

    const subjectCheck = validateSubject(subject);
    if (!subjectCheck.isValid) {
      setErrorMessage(subjectCheck.error || "Please enter a valid subject line.");
      return;
    }

    const bodyCheck = validateEmailBody(body);
    if (!bodyCheck.isValid) {
      setErrorMessage(bodyCheck.error || "Message body cannot be empty.");
      return;
    }

    if (showCcBcc && ccEmail.trim()) {
      const ccCheck = validateEmail(ccEmail, "Cc Email");
      if (!ccCheck.isValid) {
        setErrorMessage(ccCheck.error || "Please enter a valid Cc email address.");
        return;
      }
    }

    if (showCcBcc && bccEmail.trim()) {
      const bccCheck = validateEmail(bccEmail, "Bcc Email");
      if (!bccCheck.isValid) {
        setErrorMessage(bccCheck.error || "Please enter a valid Bcc email address.");
        return;
      }
    }

    try {
      setIsSending(true);
      setErrorMessage("");

      const res = await fetch("/api/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: emailCheck.value,
          subject: subjectCheck.value,
          body: bodyCheck.value,
          enableTracking: enableTracking,
          attachments: attachments,
          isHtml: editorMode === "html",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to deliver email.");
      }

      onSendSuccess(data.message);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#faf9f6] dark:bg-[#0e1119] flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Application Bar */}
      <header className="h-14 border-b border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
            <Send className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
              <span className="truncate max-w-[140px] sm:max-w-none">Full-Page Mail Composer</span>
              <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                Enterprise Studio
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Editor Mode Toggle: Visual vs Raw HTML */}
          <div className="inline-flex rounded-lg p-0.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#161a25]">
            <button
              type="button"
              onClick={() => setEditorMode("visual")}
              className={`px-2 sm:px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all ${
                editorMode === "visual"
                  ? "bg-white dark:bg-[#1f2637] text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Visual Mode</span>
              <span className="sm:hidden text-[11px]">Visual</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("html")}
              className={`px-2 sm:px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all ${
                editorMode === "html"
                  ? "bg-white dark:bg-[#1f2637] text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">&lt;/&gt; HTML</span>
              <span className="sm:hidden text-[11px]">HTML</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsTemplateDrawerOpen(!isTemplateDrawerOpen)}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            <Bookmark className="h-3.5 w-3.5 text-blue-500" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Exit Full-Page Mode"
            className="p-1.5 sm:p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Composer Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Writing Pane */}
        <div className="flex-1 flex flex-col overflow-y-auto p-3 sm:p-6 max-w-5xl mx-auto w-full space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email Headers Form Card */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e] p-4 space-y-3 shadow-sm">
            {/* Sender Inbox & Recipient */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider font-mono">
                  From (Mailbox Pool)
                </label>
                <select
                  value={selectedMailbox}
                  onChange={(e) => setSelectedMailbox(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161a25] text-xs font-mono text-neutral-900 dark:text-white"
                >
                  {mailboxes.map((mbx) => (
                    <option key={mbx.emailAddress} value={mbx.emailAddress}>
                      {mbx.emailAddress} ({mbx.role || "Mailbox"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider font-mono">
                    To Recipient
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showCcBcc ? "Hide Cc/Bcc" : "+ Cc / Bcc"}
                  </button>
                </div>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="s.jenkins@meridiancorp.com"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Optional Cc / Bcc */}
            {showCcBcc && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-400">Cc</label>
                  <input
                    type="text"
                    value={ccEmail}
                    onChange={(e) => setCcEmail(e.target.value)}
                    placeholder="legal@acmedesign.co"
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-neutral-400">Bcc</label>
                  <input
                    type="text"
                    value={bccEmail}
                    onChange={(e) => setBccEmail(e.target.value)}
                    placeholder="archive@acmedesign.co"
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Subject Line */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider font-mono">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Scope & Retainer Agreement for Meridian Corp"
                className="w-full px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Formatting & Merge Tag Toolbar */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e] p-2 flex flex-wrap items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => applyFormatting("**", "**")}
                title="Bold"
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("*", "*")}
                title="Italic"
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("<u>", "</u>")}
                title="Underline"
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              >
                <Underline className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("~~", "~~")}
                title="Strikethrough"
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              >
                <Strikethrough className="h-4 w-4" />
              </button>

              <span className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1" />

              <button
                type="button"
                onClick={() => applyFormatting("\n- ")}
                title="Bullet List"
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("\n1. ")}
                title="Numbered List"
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("\n> ")}
                title="Quote"
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              >
                <Quote className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("\n```\n", "\n```\n")}
                title="Code Block"
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              >
                <Code className="h-4 w-4" />
              </button>

              <span className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1" />

              <button
                type="button"
                onClick={() => applyFormatting("[Link Text](", ")")}
                title="Insert Link"
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  applyFormatting(
                    "\n| Item | Description | Rate |\n| --- | --- | --- |\n| 01 | Retainer SLA | $2,400 |\n"
                  )
                }
                title="Insert Pricing Table"
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              >
                <TableIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Merge Tag Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-neutral-400 font-mono">Merge Tags:</span>
              {["{{firstName}}", "{{companyName}}", "{{jobTitle}}"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertMergeTag(tag)}
                  className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#181d28] border border-neutral-200 dark:border-neutral-700 text-[10px] font-mono hover:border-blue-500 hover:text-blue-600"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Main Body Editor */}
          <div className="flex-1 min-h-[360px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e] p-4 shadow-sm flex flex-col">
            {editorMode === "html" ? (
              <div className="flex-1 flex flex-col">
                <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                  <Code className="h-3.5 w-3.5" />
                  <span>Direct HTML / Responsive Code Editor Mode</span>
                </div>
                <textarea
                  rows={16}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full flex-1 p-3 font-mono text-xs text-neutral-900 dark:text-emerald-400 bg-neutral-50 dark:bg-[#0e1119] rounded-lg border border-neutral-200 dark:border-neutral-800 focus:outline-none leading-relaxed"
                  placeholder="<div><h1>Custom Email Template</h1><p>Edit HTML directly…</p></div>"
                />
              </div>
            ) : (
              <textarea
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full flex-1 text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-none focus:outline-none font-sans leading-relaxed"
                placeholder="Compose your professional message here…"
              />
            )}
          </div>

          {/* Attachments Area */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e] p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-neutral-400" />
                <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">
                  Attachments & Documents ({attachments.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddAttachment}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                + Add Attachment
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#161a25] text-xs font-medium"
                >
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-neutral-800 dark:text-neutral-200">{att.name}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">({att.size})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="text-neutral-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Pre-flight Deliverability & Business Templates */}
        <aside className="hidden lg:flex w-80 border-l border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] flex-col p-5 space-y-5 overflow-y-auto shrink-0">
          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Deliverability & Security
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Verified 2048-bit DKIM & SMTP delivery confirmation.
            </p>
          </div>

          {/* Deliverability Options */}
          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableTracking}
                onChange={(e) => setEnableTracking(e.target.checked)}
                className="mt-0.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Delivery Confirmation (DSN Tick)
                </p>
                <p className="text-[10px] text-neutral-400">
                  Request recipient MTA delivery confirmation tick (Zoho/Gmail style double-tick ✓✓).
                </p>
              </div>
            </label>

            <div className="space-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <label className="text-[11px] font-semibold text-neutral-500">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#161a25] text-xs"
              >
                <option value="normal">Normal Business Priority</option>
                <option value="high">High Priority (Urgent SLA)</option>
              </select>
            </div>
          </div>

          {/* Business Templates Section */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5 text-blue-500" />
                <span>Business Templates</span>
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">
                {templates.length} Available
              </span>
            </div>

            <div className="space-y-1.5">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="w-full text-left p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161a25] hover:border-blue-500 transition-colors"
                >
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                    {tmpl.name}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5 capitalize">
                    {tmpl.category} • One-Click Apply
                  </p>
                </button>
              ))}
            </div>

            {/* Save Current Email as New Template */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2">
              <p className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                Save Current as Template
              </p>
              {templateSuccess && (
                <p className="text-[10px] text-emerald-600 font-bold">{templateSuccess}</p>
              )}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={saveTemplateName}
                  onChange={(e) => setSaveTemplateName(e.target.value)}
                  placeholder="Template Name"
                  className="flex-1 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleSaveAsTemplate}
                  disabled={isSavingTemplate || !saveTemplateName.trim()}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Send Action Footer */}
      <footer className="min-h-16 border-t border-[#eaeaea] dark:border-[#202636] bg-white dark:bg-[#12151e] px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0 shadow-lg">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            Discard / Close
          </button>
          <span className="hidden sm:inline text-xs text-neutral-400 font-mono truncate max-w-xs">
            Sending via {selectedMailbox} (2048-bit DKIM Validated)
          </span>
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={isSending || !toEmail.trim() || !subject.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold shadow-md transition-all disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{isSending ? "Delivering via ZegaMail…" : "Send Business Email"}</span>
        </button>
      </footer>
    </div>
  );
}
