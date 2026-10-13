"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Play,
  Pause,
  Clock,
  Eye,
  Send,
  MessageSquare,
  CheckCircle2,
  Users,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FileText,
  Mail,
  Sliders,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { StoredCampaign, StoredCampaignLead } from "@/lib/store";

interface CampaignDetailModalProps {
  campaignId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (updated: StoredCampaign) => void;
}

export function CampaignDetailModal({
  campaignId,
  isOpen,
  onClose,
  onStatusChange,
}: CampaignDetailModalProps) {
  const [campaign, setCampaign] = useState<StoredCampaign | null>(null);
  const [leads, setLeads] = useState<StoredCampaignLead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "steps" | "leads" | "settings">("overview");
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    if (!campaignId || !isOpen) return;

    const loadCampaignDetails = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/campaigns/${campaignId}`);
        const data = await res.json();
        if (data.success) {
          setCampaign(data.campaign);
          setLeads(data.leads || []);
        }
      } catch (err) {
        console.error("Error loading campaign details", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaignDetails();
  }, [campaignId, isOpen]);

  if (!isOpen || !campaignId) return null;

  const handleToggleStatus = async () => {
    if (!campaign) return;
    try {
      setIsTogglingStatus(true);
      const newStatus = campaign.status === "active" ? "paused" : "active";
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaign(data.campaign);
        if (onStatusChange) onStatusChange(data.campaign);
      }
    } catch (err) {
      console.error("Status toggle error", err);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const metrics = campaign?.metrics || {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    bounced: 0,
    unsubscribed: 0,
  };

  const openRate = metrics.delivered > 0 ? ((metrics.opened / metrics.delivered) * 100).toFixed(1) : "0.0";
  const replyRate = metrics.delivered > 0 ? ((metrics.replied / metrics.delivered) * 100).toFixed(1) : "0.0";
  const clickRate = metrics.delivered > 0 ? ((metrics.clicked / metrics.delivered) * 100).toFixed(1) : "0.0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#11141d] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-[#0e1119]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  {campaign?.name || "Campaign Details"}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    campaign?.status === "active"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                  }`}
                >
                  {campaign?.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                From: {campaign?.fromName} &lt;{campaign?.fromEmail}&gt; • {campaign?.steps?.length || 0} Step Cadence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                campaign?.status === "active"
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {campaign?.status === "active" ? (
                <>
                  <Pause className="h-3 w-3" />
                  <span>Pause Sending</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span>Resume Sequence</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-6 py-2.5 bg-neutral-100/60 dark:bg-[#151924] border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-4 text-xs">
          {[
            { id: "overview", label: "Analytics & Funnel" },
            { id: "steps", label: `Sequence Steps (${campaign?.steps?.length || 0})` },
            { id: "leads", label: `Leads & Activity (${leads.length})` },
            { id: "settings", label: "Pacing & Safeguards" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-1 font-semibold transition-all relative ${
                activeTab === t.id
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-neutral-400 font-mono">
              Loading campaign metrics and lead logs…
            </div>
          ) : (
            <>
              {/* TAB 1: CONVERSION FUNNEL & OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Metric Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e]">
                      <p className="text-[10px] text-neutral-400 uppercase font-mono">Total Sent</p>
                      <p className="text-xl font-bold font-mono mt-0.5">{metrics.sent}</p>
                      <p className="text-[10px] text-emerald-500 font-medium mt-0.5">
                        {metrics.delivered} Delivered ({metrics.bounced} Bounces)
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e]">
                      <p className="text-[10px] text-neutral-400 uppercase font-mono">Open Rate</p>
                      <p className="text-xl font-bold font-mono text-blue-500 mt-0.5">{openRate}%</p>
                      <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        {metrics.opened} Unique Opens
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e]">
                      <p className="text-[10px] text-neutral-400 uppercase font-mono">Click-Through</p>
                      <p className="text-xl font-bold font-mono text-indigo-500 mt-0.5">{clickRate}%</p>
                      <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        {metrics.clicked} Link Clicks
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e]">
                      <p className="text-[10px] text-neutral-400 uppercase font-mono">Reply Rate</p>
                      <p className="text-xl font-bold font-mono text-emerald-500 mt-0.5">{replyRate}%</p>
                      <p className="text-[10px] text-emerald-500 font-medium mt-0.5">
                        {metrics.replied} Positive Replies
                      </p>
                    </div>
                  </div>

                  {/* Classical Conversion Funnel Visualization */}
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-[#12151e] space-y-4">
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                      <span>Conversion Funnel Analytics</span>
                      <span className="text-[11px] font-mono text-neutral-400">Audience: {campaign?.audienceCount || 0} Leads</span>
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">1. Delivered to Primary Inbox</span>
                          <span className="font-mono text-neutral-500">{metrics.delivered} (100%)</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full w-full rounded-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">2. Opened (Read Receipts)</span>
                          <span className="font-mono text-blue-600 font-bold">{metrics.opened} ({openRate}%)</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, Number(openRate)))}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">3. Proposal / Demo Link Clicked</span>
                          <span className="font-mono text-indigo-600 font-bold">{metrics.clicked} ({clickRate}%)</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, Number(clickRate)))}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">4. High Intent Reply (Goal)</span>
                          <span className="font-mono text-emerald-600 font-bold">{metrics.replied} ({replyRate}%)</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, Number(replyRate)))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SEQUENCE STEPS */}
              {activeTab === "steps" && (
                <div className="space-y-4">
                  {campaign?.steps?.map((step, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold font-mono">
                            Step {step.stepNumber}
                          </span>
                          <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                            {step.subject}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {idx === 0 ? "Immediate Send" : `Wait ${step.delayDays} days`}
                        </span>
                      </div>

                      {step.sendAsReply && (
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded inline-block">
                          ✓ Sent as reply in same thread (In-Reply-To header active)
                        </div>
                      )}

                      <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#161a25] border border-neutral-200 dark:border-neutral-800 text-xs font-sans text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                        {step.body}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: LEADS & REAL-TIME ACTIVITY LOG */}
              {activeTab === "leads" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e] overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-neutral-50 dark:bg-[#151924] border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                        <tr>
                          <th className="py-2.5 px-4 font-semibold">Lead Contact</th>
                          <th className="py-2.5 px-4 font-semibold">Company & Role</th>
                          <th className="py-2.5 px-4 font-semibold">Cadence Status</th>
                          <th className="py-2.5 px-4 font-semibold">Step</th>
                          <th className="py-2.5 px-4 font-semibold">Engagement History</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                        {leads.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-neutral-400">
                              No individual lead records found for this campaign.
                            </td>
                          </tr>
                        ) : (
                          leads.map((ld) => (
                            <tr key={ld.id} className="hover:bg-neutral-50 dark:hover:bg-[#161a25]">
                              <td className="py-3 px-4">
                                <p className="font-semibold text-neutral-900 dark:text-white">
                                  {ld.firstName} {ld.lastName}
                                </p>
                                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                                  {ld.email}
                                </p>
                              </td>
                              <td className="py-3 px-4">
                                <p className="text-neutral-800 dark:text-neutral-200">{ld.company}</p>
                                <p className="text-[11px] text-neutral-400">{ld.jobTitle}</p>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    ld.status === "replied"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                      : ld.status === "opened" || ld.status === "clicked"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                      : ld.status === "sent"
                                      ? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  }`}
                                >
                                  {ld.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono">
                                Step {ld.currentStep}
                              </td>
                              <td className="py-3 px-4 text-[11px] text-neutral-500 font-mono">
                                {ld.lastEventTimestamp} ({ld.openCount} opens)
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: PACING & SAFEGUARDS */}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-[#12151e] space-y-3">
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Sliders className="h-4 w-4 text-blue-500" />
                      Delivery Throttle & Sending Window
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-neutral-400 font-mono text-[10px]">ACTIVE DAYS</p>
                        <p className="font-semibold text-neutral-900 dark:text-white mt-0.5">
                          {campaign?.schedule?.days?.join(", ") || "Mon - Fri"}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400 font-mono text-[10px]">TIME WINDOW</p>
                        <p className="font-semibold text-neutral-900 dark:text-white mt-0.5">
                          {campaign?.schedule?.startTime} – {campaign?.schedule?.endTime} ({campaign?.schedule?.timezone})
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400 font-mono text-[10px]">PACING JITTER</p>
                        <p className="font-semibold text-emerald-600 mt-0.5">
                          {campaign?.schedule?.delaySeconds}s randomized interval
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-[#12151e] space-y-3">
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Deliverability & Stopping Safeguards
                    </h3>
                    <ul className="text-xs space-y-2 text-neutral-700 dark:text-neutral-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Stop sequence automatically when lead replies: <strong>{campaign?.settings?.stopOnReply ? "Enabled" : "Disabled"}</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Plaintext MIME delivery for anti-spam filtering: <strong>{campaign?.settings?.sendAsPlaintext ? "Enabled" : "Disabled"}</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>CAN-SPAM Registered Address: <code className="font-mono text-[11px]">{campaign?.compliance?.physicalAddress}</code></span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
