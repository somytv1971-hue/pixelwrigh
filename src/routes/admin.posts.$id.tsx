import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { CoverPicker, Field, TagInput, inputClass } from "@/components/admin/Fields";
import { supabase } from "@/integrations/supabase/client";
import { readingTime, slugify } from "@/lib/content";

export const Route = createFileRoute("/admin/posts/$id")({
  component: PostEditor,
});

const categories = ["Design Cases", "Design Tips", "Development", "Automation", "Studio News"];

type Form = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  content: string;
  cover_url: string | null;
  tags: string[];
  status: "draft" | "published";
  seo_title: string;
  seo_description: string;
};

const empty: Form = {
  title: "",
  slug: "",
  excerpt: "",
  category: categories[0]!,
  content: "",
  cover_url: null,
  tags: [],
  status: "draft",
  seo_title: "",
  seo_description: "",
};

function PostEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(empty);
  const [slugLocked, setSlugLocked] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: post } = useQuery({
    queryKey: ["admin", "post", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!post) return;
    setSlugLocked(true);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      category: post.category,
      content: post.content,
      cover_url: post.cover_url,
      tags: post.tags ?? [],
      status: post.status === "published" ? "published" : "draft",
      seo_title: post.seo_title ?? "",
      seo_description: post.seo_description ?? "",
    });
  }, [post]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (status: Form["status"]) => {
    if (!form.title.trim()) {
      toast.error("A title is required.");
      return;
    }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt.trim() || null,
      category: form.category,
      content: form.content,
      cover_url: form.cover_url,
      tags: form.tags,
      status,
      read_minutes: readingTime(form.content),
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      published_at: status === "published" ? (post?.published_at ?? new Date().toISOString()) : null,
      author_id: userData.user?.id ?? null,
    };

    const res = isNew
      ? await supabase.from("posts").insert(payload).select("id").single()
      : await supabase.from("posts").update(payload).eq("id", id).select("id").single();

    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(status === "published" ? "Post published" : "Draft saved");
    void qc.invalidateQueries({ queryKey: ["admin", "posts"] });
    void qc.invalidateQueries({ queryKey: ["posts"] });
    if (isNew) void navigate({ to: "/admin/posts/$id", params: { id: res.data.id } });
  };

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <h1 className="display-xl min-w-0 truncate text-3xl sm:text-4xl">{isNew ? "New post" : "Edit post"}</h1>
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
            placeholder="Post title"
            className="font-display w-full bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/50"
          />
          <MarkdownEditor value={form.content} onChange={(v) => set("content", v)} />
        </div>

        <aside className="space-y-6">
          <Field label="Cover image">
            <CoverPicker value={form.cover_url} onChange={(url) => set("cover_url", url)} />
          </Field>
          <Field label="Slug" hint="Used in the article URL.">
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugLocked(true);
                set("slug", slugify(e.target.value));
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputClass}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Excerpt" hint="Shown on cards and in search results.">
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>
          <Field label="Tags">
            <TagInput value={form.tags} onChange={(t) => set("tags", t)} />
          </Field>
          <Field label="SEO title">
            <input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} className={inputClass} />
          </Field>
          <Field label="SEO description">
            <textarea
              value={form.seo_description}
              onChange={(e) => set("seo_description", e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>
          <p className="text-xs text-muted-foreground">
            Status: {form.status} · {readingTime(form.content)} min read
          </p>
        </aside>
      </div>
    </div>
  );
}
