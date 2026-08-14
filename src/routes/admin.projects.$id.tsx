import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { CoverPicker, Field, TagInput, inputClass } from "@/components/admin/Fields";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/content";
import { services } from "@/lib/site";

export const Route = createFileRoute("/admin/projects/$id")({
  component: ProjectEditor,
});

type Form = {
  title: string;
  slug: string;
  summary: string;
  client: string;
  year: string;
  service_slug: string;
  live_url: string;
  content: string;
  cover_url: string | null;
  tags: string[];
  featured: boolean;
  sort_order: string;
  status: "draft" | "published";
};

const empty: Form = {
  title: "",
  slug: "",
  summary: "",
  client: "",
  year: String(new Date().getFullYear()),
  service_slug: services[0]!.slug,
  live_url: "",
  content: "",
  cover_url: null,
  tags: [],
  featured: false,
  sort_order: "0",
  status: "published",
};

function ProjectEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(empty);
  const [slugLocked, setSlugLocked] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: project } = useQuery({
    queryKey: ["admin", "project", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!project) return;
    setSlugLocked(true);
    setForm({
      title: project.title,
      slug: project.slug,
      summary: project.summary ?? "",
      client: project.client ?? "",
      year: project.year ? String(project.year) : "",
      service_slug: project.service_slug,
      live_url: project.live_url ?? "",
      content: project.content,
      cover_url: project.cover_url,
      tags: project.tags ?? [],
      featured: project.featured,
      sort_order: String(project.sort_order),
      status: project.status === "published" ? "published" : "draft",
    });
  }, [project]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (status: Form["status"]) => {
    if (!form.title.trim()) {
      toast.error("A title is required.");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      summary: form.summary.trim() || null,
      client: form.client.trim() || null,
      year: form.year ? Number(form.year) : null,
      service_slug: form.service_slug,
      live_url: form.live_url.trim() || null,
      content: form.content,
      cover_url: form.cover_url,
      tags: form.tags,
      featured: form.featured,
      sort_order: Number(form.sort_order) || 0,
      status,
    };

    const res = isNew
      ? await supabase.from("projects").insert(payload).select("id").single()
      : await supabase.from("projects").update(payload).eq("id", id).select("id").single();

    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(status === "published" ? "Project published" : "Draft saved");
    void qc.invalidateQueries({ queryKey: ["admin", "projects"] });
    void qc.invalidateQueries({ queryKey: ["projects"] });
    if (isNew) void navigate({ to: "/admin/projects/$id", params: { id: res.data.id } });
  };

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <h1 className="display-xl min-w-0 truncate text-3xl sm:text-4xl">
          {isNew ? "New project" : "Edit project"}
        </h1>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => void save("draft")}
            disabled={saving}
            className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => void save("published")}
            disabled={saving}
            className="bg-ink flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ink-foreground disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Publish
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <input
            value={form.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugLocked) set("slug", slugify(e.target.value));
            }}
            placeholder="Project title"
            className="font-display w-full bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/50"
          />
          <MarkdownEditor value={form.content} onChange={(v) => set("content", v)} />
        </div>

        <aside className="space-y-6">
          <Field label="Cover image">
            <CoverPicker value={form.cover_url} onChange={(url) => set("cover_url", url)} />
          </Field>
          <Field label="Service" hint="Decides which service page shows this project.">
            <select
              value={form.service_slug}
              onChange={(e) => set("service_slug", e.target.value)}
              className={inputClass}
            >
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Summary">
            <textarea
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>
          <Field label="Slug">
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugLocked(true);
                set("slug", slugify(e.target.value));
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Client">
            <input value={form.client} onChange={(e) => set("client", e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Year">
              <input value={form.year} onChange={(e) => set("year", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Order">
              <input
                value={form.sort_order}
                onChange={(e) => set("sort_order", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Live URL">
            <input
              value={form.live_url}
              onChange={(e) => set("live_url", e.target.value)}
              placeholder="https://"
              className={inputClass}
            />
          </Field>
          <Field label="Tags">
            <TagInput value={form.tags} onChange={(t) => set("tags", t)} />
          </Field>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4"
            />
            Feature on homepage
          </label>
        </aside>
      </div>
    </div>
  );
}
