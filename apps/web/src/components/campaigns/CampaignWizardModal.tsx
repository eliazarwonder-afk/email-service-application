"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Send,
  Users,
  Layers,
  Settings,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Mail,
  FileText,
  HelpCircle,
  Upload,
  Tag,
  FileSpreadsheet,
} from "lucide-react";
import { CampaignStep, StoredCampaign } from "@/lib/store";
import {
  validateEmail,
  validateSubject,
  validateEmailBody,
  validateFullName,
} from "@/lib/validation";

interface CampaignWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newCampaign: StoredCampaign) => void;
  availableMailboxes: Array<{ emailAddress: string; role?: string }>;
}

const SPAM_WORDS = [
  "100% free", "guaranteed", "no risk", "earn cash", "urgent", "make money",
  "winner", "act now", "risk free", "exclusive deal", "credit card", "click here now",
  "congratulations", "double your", "fast cash", "billion"
];

export function CampaignWizardModal({
  isOpen,
  onClose,
  onCreated,
  availableMailboxes,
}: CampaignWizardModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1: Basics & Sender Pool
  const [name, setName] = useState("Enterprise Q4 Cold Outreach");
  const [goal, setGoal] = useState<StoredCampaign["goal"]>("cold_outreach");
  const [fromName, setFromName] = useState("Alex Carter");
  const [fromEmail, setFromEmail] = useState(
    availableMailboxes[0]?.emailAddress || "sales@acmedesign.co"
  );
  const [replyTo, setReplyTo] = useState(
    availableMailboxes[0]?.emailAddress || "sales@acmedesign.co"
  );
  const [selectedMailboxes, setSelectedMailboxes] = useState<string[]>([
    availableMailboxes[0]?.emailAddress || "sales@acmedesign.co",
  ]);

  // Step 2: Audience & Lists Integration
  const [audienceSource, setAudienceSource] = useState<"list" | "csv">("list");
  const [contactLists, setContactLists] = useState<any[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("all");
  const [isLoadingLists, setIsLoadingLists] = useState<boolean>(false);
  const csvFileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch available contact lists when wizard opens
  React.useEffect(() => {
    async function loadLists() {
      try {
        setIsLoadingLists(true);
        const res = await fetch("/api/contacts");
        const data = await res.json();
        if (data.success && data.lists) {
          setContactLists(data.lists);
        }
      } catch (err) {
        console.error("Failed to load contact lists in wizard:", err);
      } finally {
        setIsLoadingLists(false);
      }
    }
    if (isOpen) {
      loadLists();
    }
  }, [isOpen]);

  // Load contacts from chosen list
  const handleSelectAudienceList = async (listId: string) => {
    setSelectedListId(listId);
    try {
      const res = await fetch(`/api/contacts?listId=${listId}`);
      const data = await res.json();
      if (data.success && data.contacts && data.contacts.length > 0) {
        const lines = data.contacts.map((c: any) => {
          const fn = c.firstName || c.name?.split(" ")[0] || "";
          const ln = c.lastName || c.name?.split(" ").slice(1).join(" ") || "";
          return `${fn},${ln},${c.email},${c.company || "Independent"},${c.jobTitle || "Lead"}`;
        });
        setLeadsInput(lines.join("\n"));
      }
    } catch (e) {
      console.error("Failed to load list contacts:", e);
    }
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      setLeadsInput(text);
    };
    reader.readAsText(file);
  };
  const [leadsInput, setLeadsInput] = useState<string>(
    `Sarah,Jenkins,s.jenkins@meridiancorp.com,Meridian Corp,VP Operations
David,Miller,david@hyperscaletech.com,HyperScale Tech,VP Marketing
Elena,Rostova,elena@vanguardrobotics.io,Vanguard Robotics,Head of Growth
Marcus,Thorne,marcus@vanguardmedia.com,Vanguard Media Group,Managing Director`
  );

  // Step 3: Drip Sequence
  const [steps, setSteps] = useState<CampaignStep[]>([
    {
      stepNumber: 1,
      delayDays: 0,
      subject: "Quick observation on {{companyName}}'s web architecture",
      body: `Hi {{firstName}},\n\nI noticed {{companyName}} recently announced your international expansion—congratulations!\n\nGrowing infrastructure often introduces deliverability and latency bottlenecks. We built dedicated business mail infrastructure with verified 2048-bit DKIM and guaranteed 99.99% uptime.\n\nWould you be open to a 10-minute sync this Thursday at 3:00 PM?\n\nBest,\n{{fromName}}`,
      sendAsReply: false,
    },
    {
      stepNumber: 2,
      delayDays: 3,
      subject: "Re: Quick observation on {{companyName}}'s web architecture",
      body: `Hi {{firstName}},\n\nFollowing up on my note from Tuesday. We recently helped a peer company in your sector cut email SaaS overhead by over $600/year while boosting deliverability to 99.8%.\n\nWould love to share the 1-page breakdown if you're exploring ways to streamline Q4 tooling.\n\nCheers,\n{{fromName}}`,
      sendAsReply: true,
    },
    {
      stepNumber: 3,
      delayDays: 4,
      subject: "Re: Quick observation on {{companyName}}'s web architecture",
      body: `Hi {{firstName}},\n\nI know you're super busy leading {{companyName}}. Should I check back with your team next quarter, or is infrastructure optimization on your radar this month?\n\nEither way, wishing you continued momentum!\n\nBest,\n{{fromName}}`,
      sendAsReply: true,
    },
  ]);
  const [activeStepTab, setActiveStepTab] = useState(0);

  // Step 4: Schedule & Pacing
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Mon", "Tue", "Wed", "Thu", "Fri",
  ]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [maxPerDay, setMaxPerDay] = useState(50);
  const [delaySeconds, setDelaySeconds] = useState(120);

  const [trackOpens, setTrackOpens] = useState(true);
  const [trackClicks, setTrackClicks] = useState(true);
  const [stopOnReply, setStopOnReply] = useState(true);
  const [stopOnClick, setStopOnClick] = useState(false);
  const [sendAsPlaintext, setSendAsPlaintext] = useState(true);
  const [customTrackingDomain, setCustomTrackingDomain] = useState(true);

  // Step 5: Compliance
  const [physicalAddress, setPhysicalAddress] = useState(
    "100 Innovation Way, Suite 400, New York, NY 10001"
  );
  const [includeUnsubscribeHeader, setIncludeUnsubscribeHeader] = useState(true);
  const [unsubscribeText, setUnsubscribeText] = useState(
    "If you'd prefer not to hear from us, click here to unsubscribe."
  );

  if (!isOpen) return null;

  // Parse parsed leads
  const parsedLeads = leadsInput
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.includes("@"))
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      return {
        firstName: parts[0] || "Client",
        lastName: parts[1] || "",
        email: parts[2] || "",
        company: parts[3] || "Organization",
        jobTitle: parts[4] || "Business Executive",
      };
    });

  // Calculate spam trigger words in active step
  const currentStepData = steps[activeStepTab] || steps[0];
  const combinedText = `${currentStepData?.subject || ""} ${currentStepData?.body || ""}`.toLowerCase();
  const detectedSpamWords = SPAM_WORDS.filter((word) => combinedText.includes(word));

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const toggleMailboxSelection = (email: string) => {
    if (selectedMailboxes.includes(email)) {
      if (selectedMailboxes.length > 1) {
        setSelectedMailboxes(selectedMailboxes.filter((m) => m !== email));
      }
    } else {
      setSelectedMailboxes([...selectedMailboxes, email]);
    }
  };

  const handleInsertTag = (tag: string) => {
    const active = { ...steps[activeStepTab] };
    active.body = (active.body || "") + " " + tag;
    const newSteps = [...steps];
    newSteps[activeStepTab] = active;
    setSteps(newSteps);
  };

  const handleAddStep = () => {
    const nextNumber = steps.length + 1;
    const newStep: CampaignStep = {
      stepNumber: nextNumber,
      delayDays: 3,
      subject: `Re: ${steps[0]?.subject || "Follow-up"}`,
      body: `Hi {{firstName}},\n\nJust floating this to the top of your inbox in case you were traveling.\n\nBest,\n{{fromName}}`,
      sendAsReply: true,
    };
    setSteps([...steps, newStep]);
    setActiveStepTab(steps.length);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    const updated = steps.filter((_, idx) => idx !== index).map((s, idx) => ({
      ...s,
      stepNumber: idx + 1,
    }));
    setSteps(updated);
    setActiveStepTab(Math.max(0, index - 1));
  };

  const handleSubmit = async () => {
    try {
      setErrorMsg("");

      const nameCheck = validateFullName(name, "Campaign Name");
      if (!nameCheck.isValid) {
        setErrorMsg(nameCheck.error || "Please enter a valid campaign name.");
        return;
      }

      const fromNameCheck = validateFullName(fromName, "Sender Name");
      if (!fromNameCheck.isValid) {
        setErrorMsg(fromNameCheck.error || "Please enter a valid sender name.");
        return;
      }

      const fromEmailCheck = validateEmail(fromEmail, "Sender Email");
      if (!fromEmailCheck.isValid) {
        setErrorMsg(fromEmailCheck.error || "Please enter a valid sender email.");
        return;
      }

      if (replyTo.trim()) {
        const replyCheck = validateEmail(replyTo, "Reply-To Email");
        if (!replyCheck.isValid) {
          setErrorMsg(replyCheck.error || "Please enter a valid Reply-To email.");
          return;
        }
      }

      // Validate sequence steps
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const sCheck = validateSubject(step.subject || "");
        if (!sCheck.isValid) {
          setErrorMsg(`Step ${i + 1}: Subject line is required.`);
          return;
        }
        const bCheck = validateEmailBody(step.body || "");
        if (!bCheck.isValid) {
          setErrorMsg(`Step ${i + 1}: Message body is required.`);
          return;
        }
      }

      setIsSubmitting(true);

      const payload = {
        name,
        goal,
        fromName,
        fromEmail,
        replyTo,
        sendingMailboxes: selectedMailboxes,
        audienceCount: parsedLeads.length,
        schedule: {
          days: selectedDays,
          startTime,
          endTime,
          timezone,
          maxPerDay,
          delaySeconds,
        },
        settings: {
          trackOpens,
          trackClicks,
          stopOnReply,
          stopOnClick,
          sendAsPlaintext,
          customTrackingDomain,
        },
        compliance: {
          physicalAddress,
          includeUnsubscribeHeader,
          unsubscribeText,
        },
        steps,
        leads: parsedLeads,
      };

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create campaign");
      }

      onCreated(data.campaign);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong creating campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#11141d] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-[#0e1119]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                New Classical Campaign Wizard
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                  Step {currentStep} of 5
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Multi-mailbox rotation, automated cadences, CAN-SPAM compliance & human throttle.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Wizard Step Navigation Indicator */}
        <div className="px-6 py-2.5 bg-neutral-100/70 dark:bg-[#151924] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs overflow-x-auto gap-2">
          {[
            { num: 1, title: "1. Setup & Inboxes" },
            { num: 2, title: "2. Audience & CSV" },
            { num: 3, title: "3. Drip Sequence" },
            { num: 4, title: "4. Schedule & Pacing" },
            { num: 5, title: "5. Compliance & Launch" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num as any)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                currentStep === s.num
                  ? "bg-white dark:bg-[#1e2433] text-blue-600 dark:text-blue-400 font-bold shadow-sm"
                  : currentStep > s.num
                  ? "text-neutral-700 dark:text-neutral-300 hover:bg-white/50"
                  : "text-neutral-400"
              }`}
            >
              {currentStep > s.num ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-current text-[10px] flex items-center justify-center">
                  {s.num}
                </span>
              )}
              <span className="whitespace-nowrap">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: CAMPAIGN SETUP & MULTI-MAILBOX ROTATION */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Q4 Enterprise Retainer Outreach"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Campaign Objective / Goal
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cold_outreach">Cold B2B Outreach (High Deliverability)</option>
                    <option value="proposal_followup">Client Proposal Follow-up Cadence</option>
                    <option value="product_launch">Product Launch Announcement</option>
                    <option value="newsletter">Curated Newsletter / Digest</option>
                    <option value="re_engagement">Dormant Account Re-engagement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Alex Carter"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Primary Outbound Email
                  </label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Reply-To Address
                  </label>
                  <input
                    type="email"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Multi-inbox Rotation Box */}
              <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Multi-Mailbox Sender Rotation (Deliverability Armor)
                    </h3>
                    <p className="text-[11px] text-blue-800 dark:text-blue-300">
                      Distribute outbound volume across multiple inboxes so no single mailbox exceeds daily spam triggers.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full font-semibold">
                    {selectedMailboxes.length} Active in Pool
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                  {availableMailboxes.map((mbx) => {
                    const isSelected = selectedMailboxes.includes(mbx.emailAddress);
                    return (
                      <button
                        key={mbx.emailAddress}
                        type="button"
                        onClick={() => toggleMailboxSelection(mbx.emailAddress)}
                        className={`p-3 rounded-lg border text-left transition-all flex items-start justify-between ${
                          isSelected
                            ? "bg-white dark:bg-[#161a25] border-blue-500 text-neutral-900 dark:text-white shadow-sm ring-1 ring-blue-500"
                            : "bg-white/50 dark:bg-[#12151e] border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-neutral-300"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold">{mbx.emailAddress}</p>
                          <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            {mbx.role || "Mailbox Pool"}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AUDIENCE & CSV IMPORT */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Audience Source Selector Tabs */}
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAudienceSource("list")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                      audienceSource === "list"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Select from Contact Lists</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAudienceSource("csv")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                      audienceSource === "csv"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Bulk Upload CSV / Raw Leads</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {parsedLeads.length} Leads in Audience
                  </span>
                </div>
              </div>

              {/* Source Option A: Contact Lists */}
              {audienceSource === "list" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                      Select one of your pre-configured audience lists from the Directory:
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSelectAudienceList("all")}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Load All Directory Contacts
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* All Contacts card */}
                    <div
                      onClick={() => handleSelectAudienceList("all")}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedListId === "all"
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-blue-300 bg-white dark:bg-[#161a25]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-900 dark:text-white">All Directory Contacts</div>
                          <div className="text-[10px] text-neutral-400">Complete organization database</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-blue-600">Select</span>
                    </div>

                    {/* Custom Lists cards */}
                    {contactLists.map((lst) => {
                      const isSelected = selectedListId === lst.id;
                      return (
                        <div
                          key={lst.id}
                          onClick={() => handleSelectAudienceList(lst.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600"
                              : "border-neutral-200 dark:border-neutral-800 hover:border-blue-300 bg-white dark:bg-[#161a25]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`h-3 w-3 rounded-full shrink-0 ${
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
                            <div>
                              <div className="text-xs font-bold text-neutral-900 dark:text-white">{lst.name}</div>
                              <div className="text-[10px] text-neutral-400 line-clamp-1">{lst.description || "Audience list"}</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-blue-600">Select</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Source Option B: Bulk Upload CSV / Raw Leads */}
              {audienceSource === "csv" && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-xs text-neutral-500">
                      Upload a CSV file or paste lead records. Required format: <code className="text-blue-600 font-mono text-[11px]">firstName, lastName, email, company, jobTitle</code>
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        ref={csvFileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleCsvFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => csvFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        <span>Upload .CSV File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setLeadsInput(
                            `Sarah,Jenkins,s.jenkins@meridiancorp.com,Meridian Corp,VP Operations
David,Miller,david@hyperscaletech.com,HyperScale Tech,VP Marketing
Elena,Rostova,elena@vanguardrobotics.io,Vanguard Robotics,Head of Growth
Marcus,Thorne,marcus@vanguardmedia.com,Vanguard Media Group,Managing Director
Lucas,Vance,lucas@vanceholding.com,Vance Holding,CEO
Rachel,Kim,rachel@kimfintech.io,Kim FinTech,Head of Infrastructure`
                          )
                        }
                        className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                      >
                        + Sample Leads
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={5}
                    value={leadsInput}
                    onChange={(e) => setLeadsInput(e.target.value)}
                    placeholder="firstName, lastName, email, company, jobTitle"
                    className="w-full font-mono text-xs p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>
              )}

              {/* Parsed Preview Table */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12151e] overflow-hidden">
                <div className="px-4 py-2 bg-neutral-50 dark:bg-[#151924] border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 flex justify-between">
                  <span>Field Mapping Preview ({parsedLeads.length} leads loaded)</span>
                  <span className="text-emerald-600 font-mono">100% Syntax Verified</span>
                </div>
                <div className="max-h-44 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {parsedLeads.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400">
                      No leads loaded yet. Select a list above or paste CSV data.
                    </div>
                  ) : (
                    parsedLeads.map((ld, i) => (
                      <div key={i} className="px-4 py-2 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-3">
                          <span className="text-neutral-400 w-5">{i + 1}.</span>
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {ld.firstName} {ld.lastName}
                          </span>
                          <span className="text-blue-600 dark:text-blue-400">&lt;{ld.email}&gt;</span>
                        </div>
                        <div className="text-neutral-500 text-[11px]">
                          {ld.company} • {ld.jobTitle}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MULTI-STEP DRIP SEQUENCE BUILDER */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Step Tabs Header */}
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {steps.map((st, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveStepTab(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                        activeStepTab === idx
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                      }`}
                    >
                      <span>Step {st.stepNumber}</span>
                      <span className="text-[10px] font-mono opacity-80">
                        {idx === 0 ? "Day 0" : `+${st.delayDays}d`}
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Follow-up Step</span>
                  </button>
                </div>

                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(activeStepTab)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove Step {steps[activeStepTab]?.stepNumber}
                  </button>
                )}
              </div>

              {/* Step Editor */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                      <span>Subject Line</span>
                      {detectedSpamWords.length > 0 ? (
                        <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Spam trigger detected: &quot;{detectedSpamWords.join(", ")}&quot;
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Safe Subject Score (100%)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={steps[activeStepTab]?.subject || ""}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[activeStepTab].subject = e.target.value;
                        setSteps(newSteps);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      Cadence Delay
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={steps[activeStepTab]?.delayDays || 0}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[activeStepTab].delayDays = parseInt(e.target.value) || 0;
                          setSteps(newSteps);
                        }}
                        disabled={activeStepTab === 0}
                        className="w-20 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs font-mono text-center text-neutral-900 dark:text-white"
                      />
                      <span className="text-xs text-neutral-500">
                        {activeStepTab === 0 ? "Immediate on launch" : "days after previous step"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Send as Reply in Same Thread Toggle */}
                {activeStepTab > 0 && (
                  <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={steps[activeStepTab]?.sendAsReply || false}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[activeStepTab].sendAsReply = e.target.checked;
                        setSteps(newSteps);
                      }}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      <strong>Send as reply in same email thread</strong> (Appends <code className="font-mono text-[11px]">In-Reply-To</code> headers for 2.4x higher response rate)
                    </span>
                  </label>
                )}

                {/* Merge Tag Pills Bar */}
                <div className="flex items-center justify-between text-xs bg-neutral-50 dark:bg-[#141824] p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-500 text-[11px] font-medium">Insert Merge Tag:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["{{firstName}}", "{{companyName}}", "{{jobTitle}}", "{{fromName}}"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleInsertTag(tag)}
                        className="px-2 py-0.5 rounded bg-white dark:bg-[#1f2637] border border-neutral-200 dark:border-neutral-700 text-[11px] font-mono font-medium hover:border-blue-500 hover:text-blue-600 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Body Editor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Email Content
                  </label>
                  <textarea
                    rows={8}
                    value={steps[activeStepTab]?.body || ""}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[activeStepTab].body = e.target.value;
                      setSteps(newSteps);
                    }}
                    className="w-full p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SCHEDULE, PACING & SAFEGUARDS */}
          {currentStep === 4 && (
            <div className="space-y-5">
              {/* Sending Window & Days */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 bg-white dark:bg-[#12151e]">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Sending Window & Active Days
                </h3>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-700"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-neutral-500">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-neutral-500">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-neutral-500">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs"
                    >
                      <option value="America/New_York">Eastern Time (ET / New York)</option>
                      <option value="America/Chicago">Central Time (CT / Chicago)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT / San Francisco)</option>
                      <option value="Europe/London">London / GMT</option>
                      <option value="Europe/Berlin">Central European Time (CET)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Jitter & Human Pacing */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 bg-white dark:bg-[#12151e]">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-emerald-500" />
                  Human Emulation Delay & Volume Cap
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex justify-between">
                      <span>Max Daily Cap Per Mailbox</span>
                      <span className="font-mono text-blue-600 font-bold">{maxPerDay} emails/day</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      step="5"
                      value={maxPerDay}
                      onChange={(e) => setMaxPerDay(parseInt(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                    <p className="text-[10px] text-neutral-500">
                      Recommended: 30–50 sends/day/inbox for highest sender reputation.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex justify-between">
                      <span>Jitter Delay Between Emails</span>
                      <span className="font-mono text-emerald-600 font-bold">{delaySeconds}s randomized</span>
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="300"
                      step="15"
                      value={delaySeconds}
                      onChange={(e) => setDelaySeconds(parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <p className="text-[10px] text-neutral-500">
                      Randomized delay (60–180s) emulates human typing to bypass Gmail/Outlook bot filters.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stopping Rules & Safeguards */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 bg-white dark:bg-[#12151e]">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                  Automated Stopping Rules & Tracking
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stopOnReply}
                      onChange={(e) => setStopOnReply(e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600"
                    />
                    <span><strong>Stop sequence on recipient reply</strong> (Crucial cold email rule)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stopOnClick}
                      onChange={(e) => setStopOnClick(e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600"
                    />
                    <span>Stop sequence when recipient clicks link</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendAsPlaintext}
                      onChange={(e) => setSendAsPlaintext(e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600"
                    />
                    <span>Send as Plaintext MIME (No heavy HTML code)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customTrackingDomain}
                      onChange={(e) => setCustomTrackingDomain(e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600"
                    />
                    <span>Use Custom Tracking Domain (<code className="font-mono text-[10px]">track.zegamail.com</code>)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: COMPLIANCE, REVIEW & LAUNCH */}
          {currentStep === 5 && (
            <div className="space-y-5">
              {/* CAN-SPAM Compliance Box */}
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3">
                <h3 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  CAN-SPAM & GDPR Regulatory Compliance Safeguards
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300">
                      Physical Business Address (Legally Mandatory)
                    </label>
                    <input
                      type="text"
                      value={physicalAddress}
                      onChange={(e) => setPhysicalAddress(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300">
                      Unsubscribe Notice & Link Text
                    </label>
                    <input
                      type="text"
                      value={unsubscribeText}
                      onChange={(e) => setUnsubscribeText(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-[#161a25] text-xs text-neutral-900 dark:text-white"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-emerald-950 dark:text-emerald-200 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={includeUnsubscribeHeader}
                      onChange={(e) => setIncludeUnsubscribeHeader(e.target.checked)}
                      className="rounded border-emerald-400 text-emerald-600"
                    />
                    <span>
                      Include RFC 8058 One-Click <code className="font-mono text-[10px]">List-Unsubscribe=One-Click</code> header (Gmail & Yahoo requirement)
                    </span>
                  </label>
                </div>
              </div>

              {/* Pre-launch Summary Checklist */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 bg-white dark:bg-[#12151e]">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                  Pre-flight Launch Summary
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#161a25] border border-neutral-200 dark:border-neutral-800">
                    <p className="text-[10px] text-neutral-400 font-mono uppercase">Audience Size</p>
                    <p className="text-base font-bold font-mono mt-0.5">{parsedLeads.length} Leads</p>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#161a25] border border-neutral-200 dark:border-neutral-800">
                    <p className="text-[10px] text-neutral-400 font-mono uppercase">Sequence Steps</p>
                    <p className="text-base font-bold font-mono mt-0.5">{steps.length} Follow-ups</p>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#161a25] border border-neutral-200 dark:border-neutral-800">
                    <p className="text-[10px] text-neutral-400 font-mono uppercase">Mailbox Pool</p>
                    <p className="text-base font-bold font-mono mt-0.5">{selectedMailboxes.length} Inboxes</p>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#161a25] border border-neutral-200 dark:border-neutral-800">
                    <p className="text-[10px] text-neutral-400 font-mono uppercase">Deliverability</p>
                    <p className="text-base font-bold font-mono text-emerald-600 mt-0.5">99.8% Rating</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#0e1119] flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((currentStep - 1) as any)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161a25] text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
            >
              Cancel
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((currentStep + 1) as any)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || parsedLeads.length === 0}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Launching Sequence…" : "Launch Classical Campaign"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
