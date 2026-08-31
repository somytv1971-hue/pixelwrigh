import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Blobs, Reveal, Words } from "@/components/site/Reveal";
import { EmptyState, ProjectCard } from "@/components/site/Cards";
import { fetchProjects } from "@/lib/content";
import { services, site } from "@/lib/site";

export const Route = createFileRoute("/our-work")({
  head: () => ({
    meta: [
      { title: `Our work — ${site.name}` },
      {
        name: "description",
        content: `Selected websites, e-commerce stores, SaaS products and automation systems built by ${site.name}.`,
      },
      { property: "og:title", content: `Our work — ${site.name}` },
      { property: "og:description", content: "A selection of projects across web, commerce, SaaS and AI." },
    ],
  }),
  component: OurWork,
});

function OurWork() {
  const [filter, setFilter] = useState<string>("all");
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchProjects(),
  });

  const visible = filter === "all" ? projects : projects.filter((p) => p.service_slug === filter);

  return (
    <main className="relative px-5 pb-24 pt-16 lg:px-8">
      <Blobs />
      <div className="mx-auto max-w-7xl">
        <h1 className="display-xl text-5xl sm:text-7xl lg:text-8xl">
          <Words text="Our work" />
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          Products and platforms we designed, built and keep improving.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {[{ slug: "all", name: "All" }, ...services].map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => setFilter(s.slug)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                filter === s.slug
                  ? "border-transparent bg-ink text-ink-foreground"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>

        {!isLoading && visible.length === 0 && (
          <div className="mt-10">
            <EmptyState title="No projects here yet" hint="Upload projects from the admin panel." />
          </div>
        )}
      </div>
    </main>
  );
}
