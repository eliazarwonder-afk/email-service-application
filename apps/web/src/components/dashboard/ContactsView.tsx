"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Users,
  Plus,
  Mail,
  Sparkles,
  Upload,
  Download,
  Search,
  FolderPlus,
  Tag,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  X,
  ExternalLink,
  ChevronDown,
  Layers,
  Phone,
  Briefcase,
  Building,
} from "lucide-react";
import { validateEmail, validateFullName, sanitizeText } from "@/lib/validation";

export interface ContactList {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  color?: string;
  createdAt?: string;
}

export interface ContactItem {
  id: string;
  orgId?: string;
  listId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  company: string;
  jobTitle?: string;
  phone?: string;
  relationship: string;
  relationshipColor: "blue" | "amber" | "emerald" | "purple" | "slate";
  opens?: string;
  notes?: string;
  createdAt?: string;
}

interface ContactsViewProps {
  onSendEmail: (email: string) => void;
  onDraftAi: (name: string, company: string) => void;
}

export function ContactsView({ onSendEmail, onDraftAi }: ContactsViewProps) {
  // State
  const [lists, setLists] = useState<ContactList[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isAddContactOpen, setIsAddContactOpen] = useState<boolean>(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);
  const [isCreateListOpen, setIsCreateListOpen] = useState<boolean>(false);

  // Form: Single Contact
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactJobTitle, setContactJobTitle] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactListId, setContactListId] = useState("lst_general");
  const [contactRelationship, setContactRelationship] = useState("Prospect Lead");
  const [contactFormError, setContactFormError] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Form: Create List
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [newListColor, setNewListColor] = useState("blue");
  const [listFormError, setListFormError] = useState("");
  const [isSubmittingList, setIsSubmittingList] = useState(false);

  // Form: Bulk Import
  const [importTargetListId, setImportTargetListId] = useState("lst_general");
  const [importRawText, setImportRawText] = useState("");
  const [parsedPreview, setParsedPreview] = useState<Array<Partial<ContactItem>>>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importError, setImportError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Contacts & Lists from API
  const fetchContactsData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/contacts?listId=${selectedListId}&search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setLists(data.lists || []);
        setContacts(data.contacts || []);
        if (data.lists?.length > 0 && contactListId === "lst_general" && !data.lists.some((l: any) => l.id === "lst_general")) {
          setContactListId(data.lists[0].id);
          setImportTargetListId(data.lists[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContactsData();
  }, [selectedListId, searchQuery]);

  // Handle Single Contact Submit
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactFormError("");

    const emailCheck = validateEmail(contactEmail, "Contact Email");
    if (!emailCheck.isValid) {
      setContactFormError(emailCheck.error || "Please enter a valid email address.");
      return;
    }

    if (!contactName.trim()) {
      setContactFormError("Please enter contact name.");
      return;
    }

    try {
      setIsSubmittingContact(true);
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: emailCheck.value,
          company: contactCompany,
          jobTitle: contactJobTitle,
          phone: contactPhone,
          listId: contactListId,
          relationship: contactRelationship,
          relationshipColor:
            contactRelationship === "Contract Sent" || contactRelationship === "Customer"
              ? "emerald"
              : contactRelationship === "Proposal Active"
              ? "blue"
              : contactRelationship === "Follow-up Due"
              ? "purple"
              : "amber",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddContactOpen(false);
        setContactName("");
        setContactEmail("");
        setContactCompany("");
        setContactJobTitle("");
        setContactPhone("");
        fetchContactsData();
      } else {
        setContactFormError(data.error || "Failed to add contact.");
      }
    } catch (err: any) {
      setContactFormError(err.message || "Network error adding contact.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Handle Create List Submit
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    setListFormError("");

    if (!newListName.trim()) {
      setListFormError("Please enter a list name.");
      return;
    }

    try {
      setIsSubmittingList(true);
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_list",
          name: newListName,
          description: newListDesc,
          color: newListColor,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCreateListOpen(false);
        setNewListName("");
        setNewListDesc("");
        setNewListColor("blue");
        fetchContactsData();
        if (data.list?.id) {
          setSelectedListId(data.list.id);
        }
      } else {
        setListFormError(data.error || "Failed to create list.");
      }
    } catch (err: any) {
      setListFormError(err.message || "Network error creating list.");
    } finally {
      setIsSubmittingList(false);
    }
  };

  // Parse CSV string into contact items
  const parseCsvText = (rawText: string) => {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setParsedPreview([]);
      return;
    }

    const preview: Array<Partial<ContactItem>> = [];
    // Check if line 0 is a header
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes("email") || firstLine.includes("name");
    const dataLines = hasHeader ? lines.slice(1) : lines;

    for (const line of dataLines) {
      // Split by comma or tab or semicolon
      const parts = line.split(/[,;\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ""));
      if (parts.length === 0) continue;

      let name = "";
      let email = "";
      let company = "";
      let jobTitle = "";
      let phone = "";

      // Find email part
      const emailIdx = parts.findIndex((p) => p.includes("@"));
      if (emailIdx !== -1) {
        email = parts[emailIdx];
        if (emailIdx > 0) {
          name = parts.slice(0, emailIdx).join(" ");
        }
        if (parts.length > emailIdx + 1) company = parts[emailIdx + 1];
        if (parts.length > emailIdx + 2) jobTitle = parts[emailIdx + 2];
        if (parts.length > emailIdx + 3) phone = parts[emailIdx + 3];
      } else if (parts.length >= 2) {
        name = parts[0];
        email = parts[1];
        if (parts.length > 2) company = parts[2];
        if (parts.length > 3) jobTitle = parts[3];
      } else {
        email = parts[0];
        name = parts[0].split("@")[0];
      }

      if (email && email.includes("@")) {
        preview.push({
          name: name || email.split("@")[0],
          email,
          company: company || "Organization",
          jobTitle: jobTitle || "Lead",
          phone,
          relationship: "Prospect Lead",
          relationshipColor: "blue",
        });
      }
    }

    setParsedPreview(preview);
  };

  // Handle File Upload Change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      setImportRawText(text);
      parseCsvText(text);
    };
    reader.readAsText(file);
  };

  // Handle Bulk Import Submit
  const handleBulkImportSubmit = async () => {
    if (parsedPreview.length === 0) {
      setImportError("No valid contacts with email addresses were detected. Please check CSV format.");
      return;
    }

    try {
      setIsImporting(true);
      setImportError("");
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_import",
          listId: importTargetListId,
          contacts: parsedPreview,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsBulkImportOpen(false);
        setImportRawText("");
        setParsedPreview([]);
        setImportFileName("");
        fetchContactsData();
        setSelectedListId(importTargetListId);
      } else {
        setImportError(data.error || "Failed to import contacts.");
      }
    } catch (err: any) {
      setImportError(err.message || "Network error during bulk import.");
    } finally {
      setIsImporting(false);
    }
  };

  // Handle Delete Contact
  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to remove this contact?")) return;
    try {
      const res = await fetch(`/api/contacts?id=${contactId}&type=contact`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) => prev.filter((c) => c.id !== contactId));
      }
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };

  // Handle Delete List
  const handleDeleteList = async (listId: string, listName: string) => {
    if (listId === "lst_general") {
      alert("The General Directory list cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to delete the list "${listName}"? Contacts will be moved to General Directory.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/contacts?id=${listId}&type=list`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSelectedListId("all");
        fetchContactsData();
      }
    } catch (err) {
      console.error("Failed to delete list:", err);
    }
  };

  // Export Contacts to CSV
  const handleExportCsv = () => {
    if (contacts.length === 0) {
      alert("No contacts to export.");
      return;
    }

    const headers = ["Name", "Email", "Company", "Job Title", "Phone", "Relationship", "List"];
    const rows = contacts.map((c) => {
      const listName = lists.find((l) => l.id === c.listId)?.name || "General";
      return [
        `"${c.name}"`,
        `"${c.email}"`,
        `"${c.company}"`,
        `"${c.jobTitle || ""}"`,
        `"${c.phone || ""}"`,
        `"${c.relationship}"`,
        `"${listName}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zegamail-contacts-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample CSV Template
  const handleDownloadSampleCsv = () => {
    const sample = `First Name,Last Name,Email,Company,Job Title,Phone
Sarah,Jenkins,s.jenkins@meridiancorp.com,Meridian Corp,VP Operations,+1 (555) 234-5678
David,Miller,david@hyperscaletech.com,HyperScale Tech,VP Marketing,+1 (555) 876-5432
Elena,Rostova,elena@vanguarddigital.io,Vanguard Digital,Head of Growth,+44 20 7946 0912
Marcus,Thorne,marcus@apexlogistics.com,Apex Logistics,Managing Director,+1 (555) 345-6789`;

    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "zegamail-sample-contacts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Active list info
  const activeList = useMemo(() => {
    if (selectedListId === "all") {
      return { id: "all", name: "All Contacts", description: "All contacts across every list in your organization." };
    }
    return lists.find((l) => l.id === selectedListId) || { id: selectedListId, name: "Selected List", description: "" };
  }, [selectedListId, lists]);

  // Color helper for lists
  const getListBadgeColor = (color?: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "purple":
        return "bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "amber":
        return "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "rose":
        return "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "indigo":
        return "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      default:
        return "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto select-none">
      {/* HEADER & ACTION CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Contacts &amp; Audience Lists</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize clients into distinct contact lists, bulk upload CSV databases, and launch targeted AI outreach.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Bulk Upload CSV Button */}
          <button
            type="button"
            onClick={() => {
              setIsBulkImportOpen(true);
              setImportRawText("");
              setParsedPreview([]);
              setImportError("");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/50 px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-xs"
          >
            <Upload className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Bulk Upload CSV</span>
          </button>

          {/* Add Contact Button */}
          <button
            type="button"
            onClick={() => {
              setIsAddContactOpen(true);
              setContactFormError("");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* LIST SELECTION PILLS & MANAGE LISTS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* "All Contacts" Pill */}
          <button
            type="button"
            onClick={() => setSelectedListId("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              selectedListId === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Contacts</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedListId === "all" ? "bg-blue-700 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {contacts.length}
            </span>
          </button>

          {/* Custom Lists Pills */}
          {lists.map((lst) => {
            const isSelected = selectedListId === lst.id;
            return (
              <div key={lst.id} className="relative group inline-flex items-center">
                <button
                  type="button"
                  onClick={() => setSelectedListId(lst.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      lst.color === "emerald"
                        ? "bg-emerald-500"
                        : lst.color === "purple"
                        ? "bg-purple-500"
                        : lst.color === "amber"
                        ? "bg-amber-500"
                        : lst.color === "rose"
                        ? "bg-rose-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <span>{lst.name}</span>
                </button>

                {lst.id !== "lst_general" && (
                  <button
                    type="button"
                    title={`Delete ${lst.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(lst.id, lst.name);
                    }}
                    className="ml-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-0.5 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Create New List Button */}
          <button
            type="button"
            onClick={() => {
              setIsCreateListOpen(true);
              setListFormError("");
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span>+ New List</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, company..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* CONTACTS TABLE CONTAINER */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] shadow-sm overflow-hidden">
        {/* Table Subheader */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0e131d] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">{activeList.name}</span>
            {activeList.description && (
              <span className="text-slate-400 ml-2 hidden sm:inline">— {activeList.description}</span>
            )}
          </div>
          <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            Showing {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead className="bg-slate-50/40 dark:bg-[#0e131d]/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Name &amp; Email</th>
                <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Company &amp; Title</th>
                <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Contact List</th>
                <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Relationship Status</th>
                <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Engagement Telemetry</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading contacts...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {searchQuery ? "No matching contacts found" : "No contacts in this list yet"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Add a contact individually or upload a CSV database with one click.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddContactOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700"
                        >
                          + Add Contact
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsBulkImportOpen(true)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Upload CSV
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => {
                  const assignedList = lists.find((l) => l.id === contact.listId);
                  return (
                    <tr key={contact.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {contact.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{contact.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{contact.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <div className="font-medium text-slate-900 dark:text-white">{contact.company}</div>
                        <div className="text-[11px] text-slate-400">{contact.jobTitle || "—"}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${getListBadgeColor(
                            assignedList?.color
                          )}`}
                        >
                          <Tag className="h-2.5 w-2.5 opacity-70" />
                          <span>{assignedList?.name || "General"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                            contact.relationshipColor === "emerald"
                              ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : contact.relationshipColor === "purple"
                              ? "bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              : contact.relationshipColor === "amber"
                              ? "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                              : "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {contact.relationship}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {contact.opens || "No emails recorded"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSendEmail(contact.email)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <Mail className="h-3 w-3" />
                            <span>Email</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDraftAi(contact.name, contact.company)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>AI Draft</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Delete contact"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD CONTACT */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e131d] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Add New Contact</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAddContactOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {contactFormError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{contactFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(sanitizeText(e.target.value, 70))}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Company</label>
                  <input
                    type="text"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(sanitizeText(e.target.value, 70))}
                    placeholder="e.g. Meridian Corp"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Job Title</label>
                  <input
                    type="text"
                    value={contactJobTitle}
                    onChange={(e) => setContactJobTitle(sanitizeText(e.target.value, 70))}
                    placeholder="e.g. VP Operations"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(sanitizeText(e.target.value, 30))}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Assign to List</label>
                  <select
                    value={contactListId}
                    onChange={(e) => setContactListId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
                  >
                    {lists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Relationship Status</label>
                <select
                  value={contactRelationship}
                  onChange={(e) => setContactRelationship(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Prospect Lead">Prospect Lead (Uncontacted)</option>
                  <option value="Proposal Active">Proposal Active (Evaluating)</option>
                  <option value="Contract Sent">Contract Sent (Closing)</option>
                  <option value="Customer">Active Customer</option>
                  <option value="Follow-up Due">Follow-up Due</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmittingContact ? "Saving..." : "Save Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK UPLOAD CSV */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e131d] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-600" />
                <span>Bulk Upload Contacts (CSV / TSV)</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsBulkImportOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {importError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* Target List Selector & Sample Template Download */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5">
                  <label className="font-semibold text-slate-900 dark:text-white block">Import into List:</label>
                  <select
                    value={importTargetListId}
                    onChange={(e) => setImportTargetListId(e.target.value)}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-medium"
                  >
                    {lists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:underline self-start sm:self-auto"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>

              {/* Drag & Drop File Selector */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="h-10 w-10 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {importFileName ? importFileName : "Click to select CSV file, or drag and drop"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Supports UTF-8 CSV or TSV with Name, Email, Company headers.</p>
              </div>

              {/* Paste Raw CSV Alternative */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Or Paste Raw CSV Data:</span>
                  {parsedPreview.length > 0 && (
                    <span className="text-emerald-600 font-mono font-bold">✓ {parsedPreview.length} Contacts Parsed</span>
                  )}
                </label>
                <textarea
                  rows={4}
                  value={importRawText}
                  onChange={(e) => {
                    setImportRawText(e.target.value);
                    parseCsvText(e.target.value);
                  }}
                  placeholder="name, email, company, jobTitle&#10;Sarah Jenkins, sarah@meridian.com, Meridian Corp, VP Operations&#10;David Miller, david@hyperscale.com, HyperScale Tech, VP Marketing"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white font-mono leading-relaxed"
                />
              </div>

              {/* Parsed Preview Table */}
              {parsedPreview.length > 0 && (
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Preview (First {Math.min(parsedPreview.length, 4)} rows):
                  </span>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-36 overflow-y-auto">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <tr>
                          <th className="py-1.5 px-3">Name</th>
                          <th className="py-1.5 px-3">Email</th>
                          <th className="py-1.5 px-3">Company</th>
                          <th className="py-1.5 px-3">Job Title</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedPreview.slice(0, 4).map((item, idx) => (
                          <tr key={idx} className="bg-white dark:bg-slate-900">
                            <td className="py-1.5 px-3 font-semibold">{item.name}</td>
                            <td className="py-1.5 px-3 text-blue-600 dark:text-blue-400">{item.email}</td>
                            <td className="py-1.5 px-3">{item.company}</td>
                            <td className="py-1.5 px-3">{item.jobTitle}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBulkImportOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isImporting || parsedPreview.length === 0}
                  onClick={handleBulkImportSubmit}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {isImporting ? "Importing..." : `Import ${parsedPreview.length} Contacts`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE NEW LIST */}
      {isCreateListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e131d] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-blue-600" />
                <span>Create New Contact List</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateListOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {listFormError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{listFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateList} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">List Name *</label>
                <input
                  type="text"
                  required
                  value={newListName}
                  onChange={(e) => setNewListName(sanitizeText(e.target.value, 60))}
                  placeholder="e.g. Inbound Marketing Q4"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Description (Optional)</label>
                <input
                  type="text"
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(sanitizeText(e.target.value, 150))}
                  placeholder="Brief note on audience segment"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">Color Tag</label>
                <div className="flex items-center gap-2.5">
                  {[
                    { id: "blue", bg: "bg-blue-500" },
                    { id: "emerald", bg: "bg-emerald-500" },
                    { id: "purple", bg: "bg-purple-500" },
                    { id: "amber", bg: "bg-amber-500" },
                    { id: "rose", bg: "bg-rose-500" },
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setNewListColor(col.id)}
                      className={`h-7 w-7 rounded-full ${col.bg} flex items-center justify-center transition-transform ${
                        newListColor === col.id ? "ring-2 ring-offset-2 ring-blue-600 scale-110" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      {newListColor === col.id && <span className="text-white text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateListOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingList}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmittingList ? "Creating..." : "Create List"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
