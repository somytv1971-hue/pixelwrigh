import { Link } from "@tanstack/react-router";
import { Dribbble, Github, Linkedin, Youtube } from "lucide-react";
import { Magnetic } from "@/components/site/Motion";
import { Words } from "@/components/site/Reveal";
import { Logo } from "./Logo";
import { site, topServices } from "@/lib/site";

const icons = [Dribbble, Github, Youtube, Linkedin];

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="bg-brand absolute -bottom-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-24 text-center lg:px-8 lg:py-32">
          <h2 className="display-xl text-4xl sm:text-6xl lg:text-7xl">
            <Words text="Have an idea?" />
          </h2>
          <Magnetic className="mt-2 inline-block" strength={0.28}>
            <Link
              to="/contact"
              data-cursor-label="Talk"
              className="display-xl inline-block border-b-2 border-white/60 text-4xl transition-colors hover:border-white sm:text-6xl lg:text-7xl"
            >
              Tell us about it
            </Link>
          </Magnetic>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0 space-y-8">
            <Logo light />
            <div className="flex flex-col items-start gap-3">
              <a
                href={`mailto:${site.email}`}
                className="rounded-full border border-white/25 px-5 py-2.5 text-sm transition-colors hover:bg-white/10"
              >
                {site.email}
              </a>

              <a
                href={`tel:${site.phone}`}
                className="rounded-full border border-white/25 px-5 py-2.5 text-sm transition-colors hover:bg-white/10"
              >
                +88 {site.phone}
              </a>
            </div>
            <p className="text-sm leading-relaxed">
              <span className="mr-2 text-[0.65rem] font-semibold uppercase tracking-widest text-white/50">
                {site.officeLabel}
              </span>
              <br />
              {site.office}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-14 gap-y-3 text-sm text-left">
            <Link to="/services" className="text-white/70 transition-colors hover:text-white">
              Services
            </Link>
            <Link to="/blog" className="text-white/70 transition-colors hover:text-white">
              Blog
            </Link>
            <Link to="/our-work" className="text-white/70 transition-colors hover:text-white">
              Our work
            </Link>
            <Link
              to="/services/$slug"
              params={{ slug: "automation" }}
              className="text-white/70 transition-colors hover:text-white"
            >
              Automation
            </Link>
            <Link to="/about" className="text-white/70 transition-colors hover:text-white">
              About
            </Link>
            <Link to="/contact" className="text-white/70 transition-colors hover:text-white">
              Contact
            </Link>
            {topServices.slice(0, 2).map((s) => (
              <Link
                key={s.slug}
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="text-white/70 transition-colors hover:text-white"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6">
          <p className="min-w-0 text-xs text-white/50">
            © {site.year}, {site.name} · {site.tagline}
          </p>
          <div className="flex shrink-0 gap-2">
            {site.socials.map((s, i) => {
              const Icon = icons[i] ?? Dribbble;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/25"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
