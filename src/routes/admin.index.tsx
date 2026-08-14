import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [posts, published, projects, leads] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
      ]);
      return {
        posts: posts.count ?? 0,
        published: published.count ?? 0,
        projects: projects.count ?? 0,
        leads: leads.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Total posts", value: data?.posts ?? 0 },
    { label: "Published", value: data?.published ?? 0 },
    { label: "Projects", value: data?.projects ?? 0 },
    { label: "Leads", value: data?.leads ?? 0 },
  ];

  return (
    <div>
      <h1 className="display-xl text-3xl sm:text-4xl">Studio</h1>
      <p className="mt-2 text-sm text-muted-foreground">Write posts, upload projects, read new enquiries.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-background p-6">
            <p className="text-gradient font-display text-4xl font-bold">{c.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/admin/posts/$id"
          params={{ id: "new" }}
          className="bg-ink rounded-full px-6 py-3 text-sm font-semibold text-ink-foreground"
        >
          New blog post
        </Link>
        <Link
          to="/admin/projects/$id"
          params={{ id: "new" }}
          className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold"
        >
          New project
        </Link>
      </div>
    </div>
  );
}
