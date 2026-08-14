import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Blobs, Reveal, Words } from "@/components/site/Reveal";
import { EmptyState, PostCard, ProjectCard } from "@/components/site/Cards";
import { fetchProjects, fetchPublishedPosts } from "@/lib/content";
import { faqs, processSteps, site, topServices } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nuvora — Digital design & development agency" },
      {
        name: "description",
        content:
          "We design and build websites, e-commerce stores, SaaS products and AI automation for companies ready to move beyond the ordinary.",
      },
      { property: "og:title", content: "Nuvora — Digital design & development agency" },
      {
        property: "og:description",
        content: "Websites, e-commerce, SaaS and automation built by a small senior team.",
      },
    ],
  }),
  component: Index,
});

function Marquee() {
  const items = ["Websites", "E-commerce", "SaaS", "Automation", "AI assistants", "Branding", "Motion"];
  return (
    <div className="border-y border-border py-5">
      <div className="flex w-max animate-marquee gap-10">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={`${item}-${i}`} className="font-display text-xl font-semibold text-muted-foreground">
            {item} <span className="text-gradient">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section ref={ref} className="relative overflow-hidden px-5 pb-16 pt-16 lg:px-8 lg:pt-24">
      <Blobs />
      <div className="mx-auto max-w-5xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
        >
          <span className="bg-brand h-2 w-2 rounded-full" /> Available for new projects · {site.office}
        </motion.p>
        <h1 className="display-xl text-[3rem] sm:text-[4.5rem] lg:text-[6rem]">
          <Words text="Digital design &" />
          <br />
          <span className="text-gradient">
            <Words text="development agency" />
          </span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.8 }}
          className="mx-auto mt-7 max-w-xl text-base text-muted-foreground sm:text-lg"
        >
          We design and build digital products, brands and websites for companies ready to move beyond the
          ordinary.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <Link
            to="/contact"
            className="bg-ink group flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-ink-foreground"
          >
            Start a project
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/our-work"
            className="rounded-full border border-border px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            See our work
          </Link>
        </motion.div>
      </div>

      <motion.div
        style={{ scale, y }}
        className="shadow-soft mx-auto mt-16 aspect-[16/8] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-ink"
      >
        <div className="bg-brand relative h-full w-full opacity-90">
          <div className="absolute inset-0 grid place-items-center px-8 text-center">
            <p className="font-display text-2xl font-bold text-ink-foreground sm:text-4xl lg:text-5xl">
              Design that performs. Code that lasts.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-ink px-5 py-24 text-ink-foreground lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="display-xl text-5xl sm:text-7xl">FAQ</h2>
        <div className="mt-14">
          {faqs.map((f, i) => (
            <div key={f.q} className="border-t border-white/15">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="text-base font-medium sm:text-lg">{f.q}</span>
                <Plus
                  className={`h-5 w-5 shrink-0 transition-transform duration-300 ${open === i ? "rotate-45" : ""}`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                className="overflow-hidden"
              >
                <p className="max-w-3xl pb-7 text-sm leading-relaxed text-white/65">{f.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Index() {
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: () => fetchProjects() });
  const { data: posts = [] } = useQuery({ queryKey: ["posts", 3], queryFn: () => fetchPublishedPosts(3) });

  return (
    <main>
      <Hero />
      <Marquee />

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <h2 className="display-xl min-w-0 text-4xl sm:text-6xl">Selected work</h2>
              <Link to="/our-work" className="text-sm font-semibold underline underline-offset-4">
                All projects
              </Link>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2">
            {projects.slice(0, 4).map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06} className={i % 2 === 1 ? "sm:mt-16" : ""}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
          {projects.length === 0 && (
            <div className="mt-10">
              <EmptyState
                title="Projects will appear here"
                hint="Add your first project from the admin panel and it shows up instantly."
              />
            </div>
          )}
        </div>
      </section>

      <section className="bg-secondary/50 px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <h2 className="display-xl text-4xl sm:text-6xl">Our solutions</h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {topServices.map((s, i) => (
              <Reveal key={s.slug} delay={i * 0.05}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-border bg-background p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
                >
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      0{i + 1}
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold">{s.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.short}</p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <h2 className="display-xl text-4xl sm:text-6xl">How we work</h2>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.07}>
                <p className="text-gradient font-display text-5xl font-bold">{s.n}</p>
                <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <h2 className="display-xl min-w-0 text-4xl sm:text-6xl">From the blog</h2>
              <Link to="/blog" className="text-sm font-semibold underline underline-offset-4">
                All articles
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <PostCard post={p} />
              </Reveal>
            ))}
          </div>
          {posts.length === 0 && (
            <div className="mt-10">
              <EmptyState title="No articles published yet" hint="Write your first post in the admin panel." />
            </div>
          )}
        </div>
      </section>

      <Faq />
    </main>
  );
}
