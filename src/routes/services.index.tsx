import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Blobs, Reveal, Words } from "@/components/site/Reveal";
import { automationChildren, topServices } from "@/lib/site";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services — Nuvora" },
      {
        name: "description",
        content:
          "Website build, e-commerce, SaaS development and automation including Facebook, WhatsApp, YouTube and AI assistants.",
      },
      { property: "og:title", content: "Services — Nuvora" },
      { property: "og:description", content: "Websites, commerce, SaaS and automation services." },
    ],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  return (
    <main className="relative px-5 pb-24 pt-16 lg:px-8">
      <Blobs />
      <div className="mx-auto max-w-7xl">
        <h1 className="display-xl text-5xl sm:text-7xl lg:text-8xl">
          <Words text="Services" />
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          Four core practices, one senior team. Pick a starting point and we shape the rest around your goals.
        </p>

        <div className="mt-16 divide-y divide-border border-y border-border">
          {topServices.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.05}>
              <Link
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="group grid gap-4 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center"
              >
                <h2 className="font-display text-3xl font-bold transition-colors group-hover:text-primary sm:text-4xl">
                  {s.name}
                </h2>
                <p className="text-sm text-muted-foreground">{s.short}</p>
                <ArrowRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-2" />
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-20">
          <h2 className="display-xl text-3xl sm:text-4xl">Automation, in detail</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {automationChildren.map((s, i) => (
              <Reveal key={s.slug} delay={i * 0.05}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="block h-full rounded-3xl border border-border p-6 transition-all hover:-translate-y-1 hover:shadow-soft"
                >
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.short}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
