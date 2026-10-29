"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  Play,
  Pause,
  Eye,
  Mail,
  Users,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  BarChart3,
  Clock,
  Layers,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { StoredCampaign } from "@/lib/store";
import { CampaignWizardModal } from "./CampaignWizardModal";
import { CampaignDetailModal } from "./CampaignDetailModal";
import { sanitizeSearchQuery } from "@/lib/validation";

interface CampaignsWorkspaceProps {
  mailboxes: Array<{ emailAddress: string; role?: string }>;
  orgPlan?: string;
}

export function CampaignsWorkspace({ mailboxes, orgPlan = "GROWTH" }: CampaignsWorkspaceProps) {
  const [campaigns, setCampaigns] = useState<StoredCampaign[]>([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalDelivered: 0,
    activeCount: 0,
    openRate: 67.9,
    replyRate: 21.2,
    clickRate: 32.8,
    deliverabilityRate: 99.8,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "completed">("all");

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed loading campaigns", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleToggleStatus = async (c: StoredCampaign) => {
    try {
      const newStatus = c.status === "active" ? "paused" : "active";
      const res = await fetch(`/api/campaigns/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns((prev) =>
          prev.map((item) => (item.id === c.id ? data.campaign : item))
        );
      }
    } catch (err) {
      console.error("Error toggling campaign status", err);
    }
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete campaign "${name}"?`)) return;
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Error deleting campaign", err);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.fromEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="flex-1 p-3 sm:p-6 max-w-6xl mx-auto w-full space-y-4 sm:space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            Classical Campaign & Cadence Engine
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold border border-blue-300 dark:border-blue-800">
              Multi-Inbox Ready
            </span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Deliverability-armored cadences, automated multi-step sequences, human pacing & CAN-SPAM compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadCampaigns}
            title="Refresh campaigns"
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-neutral-500 hover:text-neutral-900 dark:hover:text-white shadow-sm transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#11141d] shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Total Outbound</p>
            <Mail className="h-3.5 w-3.5 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold font-mono mt-1 text-neutral-900 dark:text-white">
            {stats.totalSent.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="h-3 w-3" /> {stats.deliverabilityRate}% Deliverability
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#11141d] shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Active Sequences</p>
            <Layers className="h-3.5 w-3.5 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold font-mono mt-1 text-neutral-900 dark:text-white">
            {stats.activeCount}
          </p>
          <p className="text-[10px] text-neutral-500 font-mono mt-1">
            Across {mailboxes.length > 0 ? mailboxes.length : 2} Mailboxes
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#11141d] shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Avg Open Rate</p>
            <Eye className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {stats.openRate}%
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 mt-1">
            <TrendingUp className="h-3 w-3" /> +24% vs industry baseline
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#11141d] shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Client Reply Rate</p>
            <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.replyRate}%
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            High intent conversions
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#11141d] p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(sanitizeSearchQuery(e.target.value))}
            placeholder="Search campaigns, senders…"
            maxLength={100}
            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#161a25] pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {(["all", "active", "paused", "completed"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                statusFilter === filter
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Table & List */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#11141d] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[640px]">
          <thead className="bg-neutral-50 dark:bg-[#0e1119] border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
            <tr>
              <th className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">Campaign & Strategy</th>
              <th className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">Status</th>
              <th className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">Audience & Steps</th>
              <th className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">Open Rate</th>
              <th className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">Replies</th>
              <th className="py-3 px-4 text-right font-semibold text-neutral-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                  No email campaigns found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredCampaigns.map((camp) => {
                const delivered = camp.metrics?.delivered || 0;
                const opens = camp.metrics?.opened || 0;
                const replies = camp.metrics?.replied || 0;
                const openPct = delivered > 0 ? ((opens / delivered) * 100).toFixed(1) : "0.0";
                const replyPct = delivered > 0 ? ((replies / delivered) * 100).toFixed(1) : "0.0";

                return (
                  <tr key={camp.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#161a25]/60 transition-colors">
                    {/* Name & Strategy */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCampaignId(camp.id);
                            setIsDetailModalOpen(true);
                          }}
                          className="font-semibold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-left"
                        >
                          {camp.name}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500">
                        <span className="font-mono text-neutral-400">{camp.fromEmail}</span>
                        <span>•</span>
                        <span className="capitalize">{camp.goal.replace("_", " ")}</span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(camp)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all ${
                          camp.status === "active"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:opacity-80"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:opacity-80"
                        }`}
                      >
                        {camp.status === "active" ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Paused</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Audience & Steps */}
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                        {camp.audienceCount} leads
                      </p>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {camp.steps?.length || 1} cadence steps
                      </p>
                    </td>

                    {/* Open Rate */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {openPct}%
                      </span>
                      <p className="text-[10px] text-neutral-400 font-mono">{opens} opens</p>
                    </td>

                    {/* Replies */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {replyPct}%
                      </span>
                      <p className="text-[10px] text-neutral-400 font-mono">{replies} replies</p>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCampaignId(camp.id);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                          View Funnel
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                          title="Delete campaign"
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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

      {/* Creation Wizard Modal */}
      <CampaignWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreated={(newCamp) => {
          setCampaigns((prev) => [newCamp, ...prev]);
          loadCampaigns();
        }}
        availableMailboxes={
          mailboxes.length > 0
            ? mailboxes
            : [
                { emailAddress: "sales@acmedesign.co", role: "Outreach Desk" },
                { emailAddress: "alex@acmedesign.co", role: "Admin Desk" },
              ]
        }
      />

      {/* Detail & Funnel Modal */}
      <CampaignDetailModal
        campaignId={selectedCampaignId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCampaignId(null);
        }}
        onStatusChange={() => loadCampaigns()}
      />
    </main>
  );
}
