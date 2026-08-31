import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Blobs, Reveal, Words } from "@/components/site/Reveal";
import { EmptyState, PostCard } from "@/components/site/Cards";
import { fetchPublishedPosts } from "@/lib/content";
import { site } from "@/lib/site";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: `Blog — ${site.name}` },
      {
        name: "description",
        content: `Design cases, development notes and automation playbooks from the ${site.name} studio.`,
      },
      { property: "og:title", content: `Blog — ${site.name}` },
      { property: "og:description", content: "Design cases, dev notes and automation playbooks." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [tag, setTag] = useState("All Posts");
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["posts"], queryFn: () => fetchPublishedPosts() });

  const tags = useMemo(
    () => ["All Posts", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))],
    [posts],
  );
  const visible = tag === "All Posts" ? posts : posts.filter((p) => p.category === tag);

  return (
    <main className="relative px-5 pb-24 pt-16 lg:px-8">
      <Blobs />
      <div className="mx-auto max-w-7xl">
        <h1 className="display-xl text-5xl sm:text-7xl lg:text-8xl">
          <Words text="Blog" />
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          Notes on design, engineering and automation — written while we build.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                tag === t ? "border-transparent bg-ink text-ink-foreground" : "border-border hover:bg-secondary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <PostCard post={p} />
            </Reveal>
          ))}
        </div>

        {!isLoading && visible.length === 0 && (
          <div className="mt-10">
            <EmptyState title="No posts published yet" hint="Write your first article in the admin panel." />
          </div>
        )}
      </div>
    </main>
  );
}
