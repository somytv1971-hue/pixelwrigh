import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Calendar, Facebook, Instagram, Linkedin } from "lucide-react";
import { Magnetic } from "@/components/site/Motion";
import { Words } from "@/components/site/Reveal";
import { Logo } from "./Logo";
import { site, topServices } from "@/lib/site";

function SocialIcon({ label }: { label: string }) {
  if (label === "Facebook") return <Facebook className="h-4 w-4" />;
  if (label === "Instagram") return <Instagram className="h-4 w-4" />;
  if (label === "LinkedIn") return <Linkedin className="h-4 w-4" />;
  if (label === "Twitter" || label === "X") {
    return (
      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  return <Linkedin className="h-4 w-4" />;
}

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
          <div className="min-w-0 space-y-6">
            <Logo light />
            <div>
              <a
                href={site.meetingUrl || "https://calendly.com/rjrisuan/30min"}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-label="Book"
                className="group inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-black shadow-soft transition-all duration-300 hover:scale-[1.03] hover:bg-white/95 hover:shadow-white/20 active:scale-[0.98]"
              >
                <Calendar className="h-4 w-4 text-primary transition-transform duration-300 group-hover:rotate-12" />
                Book Your Meeting
                <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/80">
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
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/25 hover:text-white"
              >
                <SocialIcon label={s.label} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
