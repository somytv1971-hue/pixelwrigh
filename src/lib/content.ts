import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

export const readingTime = (markdown: string) =>
  Math.max(1, Math.round(markdown.trim().split(/\s+/).filter(Boolean).length / 200));

export const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "";

export async function fetchPublishedPosts(limit?: number) {
  let query = supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchPostBySlug(slug: string) {
  const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchProjects(serviceSlug?: string) {
  let query = supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (serviceSlug) query = query.eq("service_slug", serviceSlug);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function uploadMedia(file: File) {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage
    .from("media")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (signError) throw signError;
  return data.signedUrl;
}
