import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Blobs, Reveal, Words, MaskReveal } from "@/components/site/Reveal";
import { Magnetic, Parallax } from "@/components/site/Motion";
import { EmptyState, PostCard, ProjectCard } from "@/components/site/Cards";
import { TechBackground } from "@/components/site/TechBackground";
import { fetchProjects, fetchPublishedPosts } from "@/lib/content";
import { clientStats, faqs, processSteps, site, testimonials, topServices, whyCopy } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${site.name} — ${site.tagline}` },
      {
        name: "description",
        content:
          "We design and build websites, e-commerce stores, SaaS products and AI automation for companies ready to move beyond the ordinary.",
      },
      { property: "og:title", content: `${site.name} — ${site.tagline}` },
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
    <div className="group border-y border-border py-5">
      <div className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused]">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={`${item}-${i}`} className="font-display text-xl font-semibold text-muted-foreground">
            {item} <span className="text-gradient">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const scenes = [
  { bg: "bg-scene-1", label: "Websites", caption: "Experience real estate agility" },
  { bg: "bg-scene-2", label: "SaaS", caption: "Dashboards people actually enjoy" },
  { bg: "bg-scene-3", label: "E-commerce", caption: "Stores built to convert" },
  { bg: "bg-scene-4", label: "Automation", caption: "Work that runs itself" },
];

/** Auto-cycling label reel inside the hero. */
function HeroLabelReel() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % scenes.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-8 flex items-center justify-center gap-6">
      {scenes.map((s, idx) => (
        <motion.button
          key={s.label}
          type="button"
          onClick={() => setI(idx)}
          className={`relative text-xs font-semibold uppercase tracking-[0.22em] transition-colors duration-300 ${
            idx === i ? "text-white" : "text-white/35 hover:text-white/55"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {s.label}
          {idx === i && (
            <motion.span
              layoutId="hero-tab"
              className="absolute -bottom-2 left-0 right-0 mx-auto h-0.5 w-full rounded-full bg-gradient-to-r from-violet to-fuchsia"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="hero-grain relative flex min-h-[100dvh] items-center overflow-hidden">
      {/* ── Background layer ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <TechBackground />
      </motion.div>

      {/* ── Dark overlay for text readability ── */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {/* ── Content ── */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-[3] mx-auto w-full max-w-5xl px-5 py-24 text-center lg:px-8"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md"
        >
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-violet to-fuchsia" />
          Available for new projects · Global Remote Team
        </motion.p>

        <h1 className="display-xl text-[3rem] text-white sm:text-[4.5rem] lg:text-[6rem]">
          <Words text="Digital design &" />
          <br />
          <span className="bg-gradient-to-r from-violet via-fuchsia to-cyan bg-clip-text text-transparent">
            <Words text="development agency" />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.8 }}
          className="mx-auto mt-7 max-w-xl text-base text-white/60 sm:text-lg"
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
          <Magnetic>
            <Link
              to="/contact"
              data-cursor-label="Go"
              className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet to-fuchsia px-7 py-3.5 text-sm font-semibold text-white"
            >
              <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
              <span className="relative">Start a project</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              to="/our-work"
              className="group relative flex items-center overflow-hidden rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm"
            >
              <span className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
              <span className="relative">See our work</span>
            </Link>
          </Magnetic>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <HeroLabelReel />
        </motion.div>
      </motion.div>

      {/* ── Bottom fade to page background ── */}
      <div className="absolute inset-x-0 bottom-0 z-[2] h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}


function ClientCard({
  testimonial,
  index,
  progress,
}: {
  testimonial: (typeof testimonials)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const reduceMotion = useReducedMotion();
  const isLowerCard = index > 2;
  const startX = index === 0 ? "100%" : index === 2 ? "-100%" : "0%";
  const startY = index === 1 ? "0%" : isLowerCard ? "-72%" : "46%";
  const startRotate = index === 0 ? -8 : index === 2 ? 8 : isLowerCard ? -4 : 0;
  const x = useTransform(progress, [0.08, 0.78], [reduceMotion ? "0%" : startX, "0%"]);
  const y = useTransform(progress, [0.08, 0.78], [reduceMotion ? "0%" : startY, "0%"]);
  const rotate = useTransform(progress, [0.08, 0.78], [reduceMotion ? 0 : startRotate, 0]);
  const opacity = useTransform(progress, [0, 0.16], [0, 1]);
  const scale = useTransform(progress, [0.08, 0.78], [reduceMotion ? 1 : 0.92, 1]);

  return (
    <motion.figure
      style={{ x, y, rotate, opacity, scale, zIndex: 10 - index }}
      className={`relative flex min-h-64 flex-col justify-between border border-border p-7 md:min-h-72 ${
        index % 2 === 1 ? "bg-accent" : "bg-secondary"
      } ${isLowerCard ? "md:col-start-2" : ""}`}
    >
      <span className="font-display text-4xl leading-none text-foreground/25">”</span>
      <blockquote className="mt-4 text-sm leading-relaxed text-foreground/80">{testimonial.quote}</blockquote>
      <figcaption className="mt-8 border-t border-foreground/10 pt-4">
        <p className="font-display text-xl font-bold">{testimonial.client}</p>
        <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
          {testimonial.role}
        </p>
      </figcaption>
    </motion.figure>
  );
}

/** Scroll-linked fan-to-grid sequence matched to the supplied client animation. */
function Clients() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });

  return (
    <section ref={ref} className="overflow-hidden px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal y={18}>
          <h2 className="display-xl text-center text-4xl sm:text-5xl lg:text-6xl">
            <Words text="Trusted by our clients" />
          </h2>
        </Reveal>

        <div className="relative mt-16 grid gap-3 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <ClientCard key={t.client} testimonial={t} index={i} progress={scrollYProgress} />
          ))}
        </div>

        <div className="mt-24 border-t border-border pt-10">
          <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Why {site.name}
            </p>
            <Reveal>
              <p className="max-w-2xl text-lg leading-relaxed sm:text-xl">{whyCopy}</p>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-3 md:grid-cols-3">
            {clientStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 90, rotate: i === 0 ? -4 : i === 2 ? 4 : 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: false, margin: "-8%" }}
                transition={{ duration: 0.85, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={`h-full border border-border p-8 ${i % 2 === 0 ? "bg-accent" : "bg-secondary"}`}>
                  <span className="bg-brand block h-2 w-2 rounded-full" />
                  <p className="font-display mt-10 text-4xl font-bold sm:text-5xl">{s.value}</p>
                  <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-ink px-5 py-24 text-ink-foreground lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="display-xl text-5xl sm:text-7xl"><Words text="FAQ" /></h2>
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
              <h2 className="display-xl min-w-0 text-4xl sm:text-6xl"><Words text="Selected work" /></h2>
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

      <Clients />



      <section className="bg-secondary/50 px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <h2 className="display-xl text-4xl sm:text-6xl"><Words text="Our solutions" /></h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {topServices.map((s, i) => (
              <Reveal key={s.slug} delay={i * 0.05}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  data-cursor-label="Open"
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border bg-background p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-soft"
                >
                  <span className="bg-brand absolute inset-x-0 bottom-0 h-1 -translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0" />
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
            <h2 className="display-xl text-4xl sm:text-6xl"><Words text="How we work" /></h2>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.07}>
                <Parallax distance={24}>
                  <p className="text-gradient font-display text-5xl font-bold">{s.n}</p>
                </Parallax>
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
              <h2 className="display-xl min-w-0 text-4xl sm:text-6xl"><Words text="From the blog" /></h2>
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
