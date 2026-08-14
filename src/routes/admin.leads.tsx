import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/content";

export const Route = createFileRoute("/admin/leads")({
  component: AdminLeads,
});

function AdminLeads() {
  const { data: leads = [] } = useQuery({
    queryKey: ["admin", "leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div>
      <h1 className="display-xl text-3xl sm:text-4xl">Leads</h1>
      <div className="mt-8 space-y-4">
        {leads.map((l) => (
          <div key={l.id} className="rounded-2xl border border-border bg-background p-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{l.name}</p>
                <a href={`mailto:${l.email}`} className="text-sm text-primary">
                  {l.email}
                </a>
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">{formatDate(l.created_at)}</p>
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
            {l.budget ? <p className="mt-3 text-sm text-muted-foreground">Budget: {l.budget}</p> : null}
            {l.message ? <p className="mt-3 whitespace-pre-wrap text-sm">{l.message}</p> : null}
          </div>
        ))}
        {leads.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No enquiries yet.
          </p>
        )}
      </div>
    </div>
  );
}
