import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/content";

export const Route = createFileRoute("/admin/posts/")({
  component: AdminPosts,
});

function AdminPosts() {
  const qc = useQueryClient();
  const { data: posts = [] } = useQuery({
    queryKey: ["admin", "posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const remove = async (id: string) => {
    if (!window.confirm("Delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Post deleted");
    void qc.invalidateQueries({ queryKey: ["admin", "posts"] });
    void qc.invalidateQueries({ queryKey: ["posts"] });
  };

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <h1 className="display-xl min-w-0 text-3xl sm:text-4xl">Blog posts</h1>
        <Link
          to="/admin/posts/$id"
          params={{ id: "new" }}
          className="bg-ink shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold text-ink-foreground"
        >
          New post
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {posts.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-background p-5"
          >
            <div className="min-w-0">
              <Link to="/admin/posts/$id" params={{ id: p.id }} className="truncate font-semibold hover:text-primary">
                {p.title || "Untitled"}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {p.category} · {p.status} · {formatDate(p.published_at ?? p.created_at)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void remove(p.id)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No posts yet.
          </p>
        )}
      </div>
    </div>
  );
}
