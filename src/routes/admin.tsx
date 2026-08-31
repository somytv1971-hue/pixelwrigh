import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BarChart3, FileText, FolderKanban, Inbox, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { site } from "@/lib/site";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Studio — ${site.name} admin` },
      { name: "description", content: `Manage ${site.name} blog posts, projects and leads.` },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: `Studio — ${site.name} admin` },
      { property: "og:description", content: "Internal content studio." },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, exact: false },
  { to: "/admin/posts", label: "Blog posts", icon: FileText, exact: false },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban, exact: false },
  { to: "/admin/leads", label: "Leads", icon: Inbox, exact: false },
] as const;

function AdminLayout() {
  const { session, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading studio…</div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-5 text-center">
        <div>
          <h1 className="display-xl text-3xl">No studio access</h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            This account doesn't have the admin role. Ask an existing admin to grant access.
          </p>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="bg-ink mt-6 rounded-full px-6 py-3 text-sm font-semibold text-ink-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 lg:flex-row lg:px-8">
        <aside className="lg:w-60 lg:shrink-0">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="mt-8 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                activeProps={{ className: "bg-ink text-ink-foreground" }}
                inactiveProps={{ className: "hover:bg-background" }}
                className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => void supabase.auth.signOut()}
              className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-background"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
