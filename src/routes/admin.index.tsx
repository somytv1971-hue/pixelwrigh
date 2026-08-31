import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  TrendingUp,
  Users,
  Inbox,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Sparkles,
  BarChart3,
  Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { computeAnalytics, formatCurrency, getStoredLeadStatuses } from "@/lib/analytics";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const [previewRange, setPreviewRange] = useState<"7d" | "30d">("7d");

  const { data: dbStats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [posts, published, projects, leads] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
      ]);
      return {
        posts: posts.count ?? 0,
        published: published.count ?? 0,
        projects: projects.count ?? 0,
        leadsList: leads.data ?? [],
        leadsCount: leads.data?.length ?? (leads.count ?? 0),
      };
    },
  });

  const analytics = useMemo(() => {
    const leads = dbStats?.leadsList ?? [];
    return computeAnalytics(leads, previewRange);
  }, [dbStats?.leadsList, previewRange]);

  const cards = [
    {
      label: "Visitors (30d)",
      value: analytics.totalVisitors.toLocaleString(),
      change: `+${analytics.visitorsChange}%`,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Leads",
      value: (dbStats?.leadsCount ?? analytics.totalLeads).toLocaleString(),
      change: `+${analytics.leadsChange}%`,
      icon: Inbox,
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan/10",
    },
    {
      label: "Converted Clients",
      value: `${analytics.convertedLeads} (${analytics.conversionRate}%)`,
      change: `+${analytics.conversionRateChange}% win`,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Pipeline Value",
      value: formatCurrency(analytics.pipelineValue),
      change: "Estimated",
      icon: DollarSign,
      color: "text-fuchsia-600 dark:text-fuchsia-400",
      bg: "bg-fuchsia/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="display-xl text-3xl sm:text-4xl">Studio Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your digital agency content, track traffic metrics, and close incoming leads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/analytics"
            className="bg-brand shadow-soft inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            <BarChart3 className="h-4 w-4" /> Live Analytics
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-background p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{c.label}</span>
              <div className={`grid h-8 w-8 place-items-center rounded-xl ${c.bg} ${c.color}`}>
                <c.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">{c.value}</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span>{c.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Chart Preview Banner */}
      <div className="rounded-2xl border border-border bg-background p-6 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">Traffic & Inquiries Pulse</h2>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Live Feed
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Recent visitor volume vs qualified lead conversion trend.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-full border border-border bg-background p-0.5">
              <button
                type="button"
                onClick={() => setPreviewRange("7d")}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  previewRange === "7d"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setPreviewRange("30d")}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  previewRange === "30d"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                30 Days
              </button>
            </div>

            <Link
              to="/admin/analytics"
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Full Report <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="mt-4 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.timeSeries} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="previewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-border bg-popover p-2 text-xs shadow-md">
                        <p className="font-semibold text-foreground">{label}</p>
                        <p className="text-primary">{payload[0]?.value} Visitors</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#previewGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Content Inventory & Action Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="text-xs font-semibold text-muted-foreground">Blog Articles</p>
          <p className="mt-2 text-gradient font-display text-3xl font-bold">{dbStats?.posts ?? 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">{dbStats?.published ?? 0} published live</p>
          <Link
            to="/admin/posts/$id"
            params={{ id: "new" }}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Write new post
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="text-xs font-semibold text-muted-foreground">Portfolio Projects</p>
          <p className="mt-2 text-gradient font-display text-3xl font-bold">{dbStats?.projects ?? 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">Showcase case studies</p>
          <Link
            to="/admin/projects/$id"
            params={{ id: "new" }}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add new project
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="text-xs font-semibold text-muted-foreground">Incoming Inquiries</p>
          <p className="mt-2 text-gradient font-display text-3xl font-bold">{dbStats?.leadsCount ?? 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">Client project briefs</p>
          <Link
            to="/admin/leads"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Review all leads <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
