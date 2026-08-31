import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { Blobs, Reveal, Words } from "@/components/site/Reveal";
import { EmptyState, ProjectCard } from "@/components/site/Cards";
import { fetchProjects } from "@/lib/content";
import { automationChildren, serviceBySlug, site } from "@/lib/site";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = serviceBySlug(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: `Service not found — ${site.name}` }, { name: "robots", content: "noindex" }] };
    }
    const { service } = loaderData;
    return {
      meta: [
        { title: `${service.name} — ${site.name}` },
        { name: "description", content: service.intro.slice(0, 155) },
        { property: "og:title", content: `${service.name} — ${site.name}` },
        { property: "og:description", content: service.short },
      ],
    };
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { service } = Route.useLoaderData();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", service.slug],
    queryFn: () => fetchProjects(service.slug),
  });

  return (
    <main className="relative pb-24 pt-16">
      <Blobs />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {service.parent ? "Automation" : "Service"}
        </p>
        <h1 className="display-xl mt-4 text-4xl sm:text-6xl lg:text-7xl">
          <Words text={service.headline} />
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">{service.intro}</p>
        <Link
          to="/contact"
          className="bg-ink group mt-10 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-ink-foreground"
        >
          Discuss this service
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>

        <div className="mt-20 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <h2 className="display-xl text-3xl sm:text-4xl">What you get</h2>
          <ul className="space-y-4">
            {service.deliverables.map((d, i) => (
              <Reveal key={d} delay={i * 0.05}>
                <li className="flex items-start gap-3 border-b border-border pb-4">
                  <span className="bg-brand mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full">
                    <Check className="h-3.5 w-3.5 text-ink-foreground" />
                  </span>
                  <span className="text-base">{d}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        {service.slug === "automation" && (
          <div className="mt-20">
            <h2 className="display-xl text-3xl sm:text-4xl">Automation channels</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {automationChildren.map((c) => (
                <Link
                  key={c.slug}
                  to="/services/$slug"
                  params={{ slug: c.slug }}
                  className="block rounded-3xl border border-border p-6 transition-all hover:-translate-y-1 hover:shadow-soft"
                >
                  <h3 className="text-lg font-semibold">{c.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.short}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-24">
          <h2 className="display-xl text-3xl sm:text-5xl">{service.name} projects</h2>
          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
          {!isLoading && projects.length === 0 && (
            <div className="mt-8">
              <EmptyState
                title="No projects added for this service yet"
                hint="Upload work for this service from the admin panel."
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
