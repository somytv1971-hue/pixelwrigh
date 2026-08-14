import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { Post, Project } from "@/lib/content";
import { formatDate } from "@/lib/content";
import { Tilt } from "@/components/site/Motion";
import { MaskReveal } from "@/components/site/Reveal";

export function ProjectCard({ project }: { project: Project }) {
  const body = (
    <>
      <Tilt>
        <MaskReveal className="relative aspect-[4/3] w-full rounded-3xl bg-secondary">
          {project.cover_url ? (
            <img
              src={project.cover_url}
              alt={project.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
            />
          ) : (
            <div className="bg-brand h-full w-full opacity-70 transition-transform duration-[900ms] group-hover:scale-110" />
          )}
          <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
        </MaskReveal>
      </Tilt>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">
            <span className="story-link">{project.title}</span>
          </h3>
          <motion.p
            className="mt-1 line-clamp-2 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {project.summary}
          </motion.p>
        </div>
        <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:translate-x-1.5" />
      </div>
    </>
  );

  return project.live_url ? (
    <a
      href={project.live_url}
      target="_blank"
      rel="noreferrer"
      data-cursor-label="View"
      className="group block"
    >
      {body}
    </a>
  ) : (
    <div className="group block" data-cursor-label="View">
      {body}
    </div>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link to="/blog/$slug" params={{ slug: post.slug }} data-cursor-label="Read" className="group block">
      <Tilt>
        <MaskReveal className="relative aspect-[16/10] w-full rounded-3xl bg-secondary">
          {post.cover_url ? (
            <img
              src={post.cover_url}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
            />
          ) : (
            <div className="bg-brand h-full w-full opacity-70 transition-transform duration-[900ms] group-hover:scale-110" />
          )}
          <span className="absolute left-4 top-4 z-10 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur transition-transform duration-500 group-hover:-translate-y-0.5">
            {post.category}
          </span>
        </MaskReveal>
      </Tilt>
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
