import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Blobs, Reveal, Words } from "@/components/site/Reveal";
import { processSteps, site } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Nuvora" },
      {
        name: "description",
        content:
          "Nuvora is a small senior studio in Dhaka designing and building websites, SaaS products and automation systems.",
      },
      { property: "og:title", content: "About — Nuvora" },
      { property: "og:description", content: "A small senior studio obsessed with craft and outcomes." },
    ],
  }),
  component: About,
});

const stats = [
  { k: "120+", v: "Projects shipped" },
  { k: "9", v: "Years in the craft" },
  { k: "14", v: "Countries served" },
  { k: "98%", v: "Clients who return" },
];

const values = [
  {
    t: "Craft over volume",
    d: "We take a small number of projects at a time so every screen gets senior attention.",
  },
  {
    t: "Design with intent",
    d: "Every animation, gradient and gap has a reason. Beauty is the by-product of clarity.",
  },
  {
    t: "Engineering that lasts",
    d: "Typed, tested, documented code. Fast on day one and still fast a year later.",
  },
  {
    t: "Radical transparency",
    d: "Weekly demos, shared boards, no surprises in scope or invoices.",
  },
];

export default About;

function About() {
  return (
    <main className="relative pb-24 pt-16">
      <Blobs />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <h1 className="display-xl text-5xl sm:text-7xl lg:text-8xl">
          <Words text="We build brands" />
          <br />
          <span className="text-gradient">
            <Words text="that feel alive" />
          </span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
          {site.name} is a design and development studio in {site.office}. We work with founders and marketing
          teams who care as much about the details as we do — combining product thinking, interface craft and
          automation into one delivery team.
        </p>

        <div className="shadow-soft mt-16 aspect-[16/7] overflow-hidden rounded-[2rem] bg-ink">
          <div className="bg-brand grid h-full w-full place-items-center px-8 text-center opacity-90">
            <p className="font-display text-2xl font-bold text-ink-foreground sm:text-4xl">
              A studio of designers, engineers and automation nerds.
            </p>
          </div>
        </div>

        <div className="mt-20 grid gap-10 border-y border-border py-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.k} delay={i * 0.05}>
              <p className="text-gradient font-display text-5xl font-bold">{s.k}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.v}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <h2 className="display-xl text-4xl sm:text-5xl">What we believe</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((v, i) => (
              <Reveal key={v.t} delay={i * 0.05}>
                <div className="h-full rounded-3xl border border-border p-7">
                  <h3 className="text-xl font-semibold">{v.t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-24">
          <h2 className="display-xl text-4xl sm:text-5xl">Our process</h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.06}>
                <p className="text-gradient font-display text-4xl font-bold">{s.n}</p>
                <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <Link
          to="/contact"
          className="bg-ink group mt-20 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-ink-foreground"
        >
          Work with us
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </main>
  );
}
