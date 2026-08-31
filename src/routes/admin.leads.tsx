import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { BarChart3, Filter, CheckCircle2, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/content";
import {
  getStoredLeadStatuses,
  saveLeadStatus,
  type LeadStatus,
} from "@/lib/analytics";

export const Route = createFileRoute("/admin/leads")({
  component: AdminLeads,
});

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  new: {
    label: "New",
    bg: "bg-blue-500/10",
    text: "text-blue-500 dark:text-blue-400",
    border: "border-blue-500/20",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-amber-500/10",
    text: "text-amber-500 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  proposal: {
    label: "Proposal Sent",
    bg: "bg-purple-500/10",
    text: "text-purple-500 dark:text-purple-400",
    border: "border-purple-500/20",
  },
  converted: {
    label: "Converted / Won",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  closed: {
    label: "Closed / Lost",
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
  },
};

function AdminLeads() {
  const [filter, setFilter] = useState<string>("all");
  const [leadStatuses, setLeadStatuses] = useState<Record<string, LeadStatus>>({});

  useEffect(() => {
    setLeadStatuses(getStoredLeadStatuses());
    const handleUpdate = () => setLeadStatuses(getStoredLeadStatuses());
    window.addEventListener("lead-status-updated", handleUpdate);
    return () => window.removeEventListener("lead-status-updated", handleUpdate);
  }, []);

  const { data: leads = [] } = useQuery({
    queryKey: ["admin", "leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    saveLeadStatus(leadId, newStatus);
    setLeadStatuses((prev) => ({ ...prev, [leadId]: newStatus }));
  };

  const filteredLeads = useMemo(() => {
    if (filter === "all") return leads;
    return leads.filter((l) => (leadStatuses[l.id] || "new") === filter);
  }, [leads, filter, leadStatuses]);

  const stats = useMemo(() => {
    const counts = { all: leads.length, new: 0, contacted: 0, converted: 0 };
    leads.forEach((l) => {
      const s = leadStatuses[l.id] || "new";
      if (s === "new") counts.new++;
      if (s === "contacted" || s === "proposal") counts.contacted++;
      if (s === "converted") counts.converted++;
    });
    return counts;
  }, [leads, leadStatuses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="display-xl text-3xl sm:text-4xl">Client Enquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage incoming project requests and track conversion progress.
          </p>
        </div>

        <Link
          to="/admin/analytics"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold shadow-xs hover:bg-secondary"
        >
          <BarChart3 className="h-4 w-4 text-primary" /> View Conversion Analytics
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {[
          { id: "all", label: `All (${stats.all})` },
          { id: "new", label: `New (${stats.new})` },
          { id: "contacted", label: `In Progress (${stats.contacted})` },
          { id: "converted", label: `Won / Converted (${stats.converted})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.id
                ? "bg-ink text-ink-foreground shadow-xs"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lead Cards */}
      <div className="space-y-4">
        {filteredLeads.map((l) => {
          const currentStatus = leadStatuses[l.id] || "new";
          const config = STATUS_CONFIG[currentStatus];

          return (
            <div key={l.id} className="rounded-2xl border border-border bg-background p-6 shadow-xs">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <p className="font-display text-lg font-bold text-foreground">{l.name}</p>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${config.bg} ${config.text} ${config.border}`}
                    >
                      {config.label}
                    </span>
                  </div>
                  <a
                    href={`mailto:${l.email}`}
                    className="mt-1 block text-sm font-medium text-primary hover:underline"
                  >
                    {l.email}
                  </a>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(l.id, e.target.value as LeadStatus)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold shadow-2xs outline-none cursor-pointer ${config.bg} ${config.text} ${config.border}`}
                  >
                    <option value="new">● New Inquiry</option>
                    <option value="contacted">● Contacted</option>
                    <option value="proposal">● Proposal Sent</option>
                    <option value="converted">● Converted / Won</option>
                    <option value="closed">● Closed / Lost</option>
                  </select>
                  <p className="shrink-0 text-xs text-muted-foreground">{formatDate(l.created_at)}</p>
                </div>
              </div>

              {l.interests?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {l.interests.map((i) => (
                    <span key={i} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                      {i}
                    </span>
                  ))}
                </div>
              ) : null}

              {l.budget ? (
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  Target Budget: <span className="font-semibold text-foreground">{l.budget}</span>
                </p>
              ) : null}

              {l.message ? (
                <div className="mt-3 rounded-xl bg-secondary/40 p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground">Project Details:</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{l.message}</p>
                </div>
              ) : null}
            </div>
          );
        })}

        {filteredLeads.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">No enquiries found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {filter !== "all" ? "Try clearing the active filter." : "Client briefs will show up here as visitors submit them."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
