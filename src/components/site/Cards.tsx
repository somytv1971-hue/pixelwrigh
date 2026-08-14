import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Post, Project } from "@/lib/content";
import { formatDate } from "@/lib/content";

export function ProjectCard({ project }: { project: Project }) {
  const body = (
    <>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-secondary">
        {project.cover_url ? (
          <img
            src={project.cover_url}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="bg-brand h-full w-full opacity-70" />
        )}
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.summary}</p>
        </div>
        <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
      </div>
    </>
  );

  return project.live_url ? (
    <a href={project.live_url} target="_blank" rel="noreferrer" className="group block">
      {body}
    </a>
  ) : (
    <div className="group block">{body}</div>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link to="/blog/$slug" params={{ slug: post.slug }} className="group block">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-secondary">
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="bg-brand h-full w-full opacity-70" />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold">
          {post.category}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold leading-snug transition-colors group-hover:text-primary">
        {post.title}
      </h3>
      <p className="mt-2 text-xs text-muted-foreground">
        {formatDate(post.published_at ?? post.created_at)} · {post.read_minutes} min read
      </p>
    </Link>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border px-6 py-16 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
