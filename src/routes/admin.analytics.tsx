import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Users,
  Inbox,
  CheckCircle2,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Filter,
  RefreshCw,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  computeAnalytics,
  formatCurrency,
  getStoredLeadStatuses,
  saveLeadStatus,
  type LeadStatus,
  type TimeframeRange,
} from "@/lib/analytics";
import { formatDate } from "@/lib/content";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalyticsPage,
});

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  new: {
    label: "New",
    bg: "bg-blue-500/10",
    text: "text-blue-500 dark:text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-amber-500/10",
    text: "text-amber-500 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
  },
  proposal: {
    label: "Proposal Sent",
    bg: "bg-purple-500/10",
    text: "text-purple-500 dark:text-purple-400",
    border: "border-purple-500/20",
    dot: "bg-purple-500",
  },
  converted: {
    label: "Converted / Won",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed / Lost",
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    dot: "bg-muted-foreground",
  },
};

function CustomChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <div className="mt-2 space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-semibold text-foreground">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

function AdminAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<TimeframeRange>("30d");
  const [activeMetric, setActiveMetric] = useState<"all" | "visitors" | "leads">("all");
  const [leadStatuses, setLeadStatuses] = useState<Record<string, LeadStatus>>({});

  // Initialize and listen for lead status updates
  useEffect(() => {
    setLeadStatuses(getStoredLeadStatuses());

    const handleUpdate = () => {
      setLeadStatuses(getStoredLeadStatuses());
    };
    window.addEventListener("lead-status-updated", handleUpdate);
    return () => window.removeEventListener("lead-status-updated", handleUpdate);
  }, []);

  // Fetch real leads from Supabase
  const { data: leads = [], refetch, isRefetching } = useQuery({
    queryKey: ["admin", "analytics", "leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Calculate full analytical dataset
  const analytics = useMemo(() => {
    return computeAnalytics(leads, timeframe, leadStatuses);
  }, [leads, timeframe, leadStatuses]);

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    saveLeadStatus(leadId, newStatus);
    setLeadStatuses((prev) => ({ ...prev, [leadId]: newStatus }));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="display-xl text-3xl sm:text-4xl">Analytics & Growth</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time traffic performance, conversion funnel, and client lead pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Timeframe Selector */}
          <div className="inline-flex rounded-full border border-border bg-background p-1 shadow-xs">
            {(
              [
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
                { id: "1y", label: "1 Year" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeframe(t.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeframe === t.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isRefetching}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
            title="Refresh metrics"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Executive Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Visitors */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Visitors
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight text-foreground">
              {analytics.totalVisitors.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" /> +{analytics.visitorsChange}%
            </span>
            <span className="text-muted-foreground">vs previous period</span>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {analytics.totalPageviews.toLocaleString()} total pageviews
          </div>
        </div>

        {/* Inquiries / Leads */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Project Leads
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan/10 text-cyan-600 dark:text-cyan-400">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-gradient font-display text-3xl font-bold tracking-tight">
              {analytics.totalLeads.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" /> +{analytics.leadsChange}%
            </span>
            <span className="text-muted-foreground">inbound briefs</span>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {leads.length} recorded in database
          </div>
        </div>

        {/* Converted Leads & Win Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Converted Clients
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight text-foreground">
              {analytics.convertedLeads}
            </span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              ({analytics.conversionRate}% rate)
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" /> +{analytics.conversionRateChange}%
            </span>
            <span className="text-muted-foreground">lead-to-client win rate</span>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {formatCurrency(analytics.convertedRevenue)} closed revenue
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Pipeline
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-fuchsia/10 text-fuchsia-600 dark:text-fuchsia-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight text-foreground">
              {formatCurrency(analytics.pipelineValue)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Avg duration:</span>
            <span className="font-semibold text-foreground">{analytics.avgDuration}</span>
            <span className="text-muted-foreground">• Bounce:</span>
            <span className="font-semibold text-foreground">{analytics.bounceRate}</span>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Estimated from client budget ranges
          </div>
        </div>
      </div>

      {/* Main Interactive Graph: Visitors & Leads Over Time */}
      <div className="rounded-2xl border border-border bg-background p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Traffic & Inquiries Trend</h2>
            <p className="text-xs text-muted-foreground">
              Daily visitor volume, page engagement, and qualified lead acquisitions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveMetric("all")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeMetric === "all"
                  ? "bg-ink text-ink-foreground"
                  : "border border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Combined View
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("visitors")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeMetric === "visitors"
                  ? "bg-ink text-ink-foreground"
                  : "border border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Visitors Only
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("leads")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeMetric === "leads"
                  ? "bg-ink text-ink-foreground"
                  : "border border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Leads Only
            </button>
          </div>
        </div>

        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
              />
              {(activeMetric === "all" || activeMetric === "visitors") && (
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name="Visitors"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorVisitors)"
                />
              )}
              {activeMetric === "all" && (
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  name="Pageviews"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorPageviews)"
                />
              )}
              {(activeMetric === "all" || activeMetric === "leads") && (
                <Area
                  type="monotone"
                  dataKey="leads"
                  name="Inquiries (Leads)"
                  stroke="#ec4899"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel & Lead Flow */}
      <div className="rounded-2xl border border-border bg-background p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Client Acquisition Funnel</h2>
            <p className="text-xs text-muted-foreground">
              Conversion pathway from anonymous visitors to signed clients.
            </p>
          </div>
          <span className="text-xs font-semibold text-primary">
            Overall Conversion: {analytics.conversionRate}%
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {analytics.funnel.map((step, idx) => (
            <div key={step.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary font-mono text-[10px] font-bold text-foreground">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-foreground">{step.stage}</span>
                  <span className="hidden text-muted-foreground sm:inline">— {step.description}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-foreground">{step.count.toLocaleString()}</span>
                  <span className="w-12 text-right font-mono text-muted-foreground">
                    {step.percentage}%
                  </span>
                </div>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(3, step.percentage)}%`,
                    background:
                      idx === 0
                        ? "#8b5cf6"
                        : idx === 1
                        ? "#a855f7"
                        : idx === 2
                        ? "#06b6d4"
                        : idx === 3
                        ? "#ec4899"
                        : "#10b981",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Grid: Traffic Sources & Service Demand */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic Sources Breakdown */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-foreground">Traffic Channels</h2>
          <p className="text-xs text-muted-foreground">Where your agency visitors originate from.</p>

          <div className="mt-4 flex flex-col items-center sm:flex-row sm:items-center sm:justify-between">
            <div className="h-56 w-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analytics.trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex-1 space-y-2 sm:mt-0 sm:pl-6">
              {analytics.trafficSources.map((source) => (
                <div key={source.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: source.color }} />
                    <span className="font-medium text-foreground">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{source.value.toLocaleString()}</span>
                    <span className="w-8 text-right font-mono font-semibold text-foreground">
                      {source.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Demand Breakdown */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-foreground">Top Inquired Services</h2>
          <p className="text-xs text-muted-foreground">Service interest breakdown based on client briefs.</p>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.serviceDemand}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(var(--border))" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "oklch(var(--foreground))" }}
                  width={110}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="count" name="Inquiries" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Devices & Technology breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        {analytics.deviceDistribution.map((d) => (
          <div key={d.device} className="rounded-2xl border border-border bg-background p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-foreground">
                  {d.device === "Desktop" && <Laptop className="h-4 w-4" />}
                  {d.device === "Mobile" && <Smartphone className="h-4 w-4" />}
                  {d.device === "Tablet" && <Tablet className="h-4 w-4" />}
                </div>
                <span className="font-semibold text-foreground">{d.device}</span>
              </div>
              <span className="font-display text-lg font-bold text-foreground">{d.percentage}%</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full" style={{ width: `${d.percentage}%`, backgroundColor: d.color }} />
            </div>
            <div className="mt-2 text-right text-xs text-muted-foreground">
              {d.count.toLocaleString()} visits
            </div>
          </div>
        ))}
      </div>

      {/* Live Lead Conversion Tracker Table */}
      <div className="rounded-2xl border border-border bg-background p-6 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Lead Conversion Pipeline</h2>
            <p className="text-xs text-muted-foreground">
              Update lead status to recalculate live conversion rates and win metrics.
            </p>
          </div>
          <Link
            to="/admin/leads"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            View all leads <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 font-semibold">Client Name</th>
                <th className="pb-3 font-semibold">Contact</th>
                <th className="pb-3 font-semibold">Budget</th>
                <th className="pb-3 font-semibold">Services</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Conversion Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {leads.slice(0, 8).map((lead) => {
                const currentStatus = leadStatuses[lead.id] || "new";
                const config = STATUS_CONFIG[currentStatus];

                return (
                  <tr key={lead.id} className="hover:bg-secondary/40">
                    <td className="py-3.5 font-semibold text-foreground">{lead.name}</td>
                    <td className="py-3.5 text-muted-foreground">
                      <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                        {lead.email}
                      </a>
                    </td>
                    <td className="py-3.5 font-medium text-foreground">
                      {lead.budget ? (
                        <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px]">
                          {lead.budget}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 text-muted-foreground">
                      <div className="flex max-w-[200px] flex-wrap gap-1">
                        {lead.interests?.slice(0, 2).map((i) => (
                          <span key={i} className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px]">
                            {i}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 text-muted-foreground">{formatDate(lead.created_at)}</td>
                    <td className="py-3.5 text-right">
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-2xs outline-none transition-colors cursor-pointer ${config.bg} ${config.text} ${config.border}`}
                      >
                        <option value="new">● New</option>
                        <option value="contacted">● Contacted</option>
                        <option value="proposal">● Proposal Sent</option>
                        <option value="converted">● Converted / Won</option>
                        <option value="closed">● Closed / Lost</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No lead submissions recorded yet. New contact briefs will appear here automatically.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
