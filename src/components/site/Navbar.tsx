import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { automationChildren, topServices } from "@/lib/site";

const links = [
  { label: "Home", to: "/" },
  { label: "Our work", to: "/our-work" },
  { label: "Services", to: "/services", dropdown: true },
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
];

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false);
    setHover(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-border/70 bg-background/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:px-8">
        <div className="flex min-w-0 items-center">
          <Logo />
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) =>
            l.dropdown ? (
              <div
                key={l.label}
                className="relative"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => {
                  setHover(false);
                  setSubOpen(false);
                }}
              >
                <Link
                  to={l.to}
                  className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{ className: "text-foreground" }}
                >
                  {l.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                <AnimatePresence>
                  {hover && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.2 }}
                      className="shadow-soft absolute left-0 top-full w-72 rounded-3xl border border-border bg-popover p-2"
                    >
                      {topServices.map((s) =>
                        s.slug === "automation" ? (
                          <div
                            key={s.slug}
                            className="relative"
                            onMouseEnter={() => setSubOpen(true)}
                            onMouseLeave={() => setSubOpen(false)}
                          >
                            <Link
                              to="/services/$slug"
                              params={{ slug: s.slug }}
                              className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                            >
                              {s.name}
                              <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                            </Link>
                            <AnimatePresence>
                              {subOpen && (
                                <motion.div
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -6 }}
                                  transition={{ duration: 0.18 }}
                                  className="shadow-soft absolute left-full top-0 ml-2 w-64 rounded-3xl border border-border bg-popover p-2"
                                >
                                  {automationChildren.map((c) => (
                                    <Link
                                      key={c.slug}
                                      to="/services/$slug"
                                      params={{ slug: c.slug }}
                                      className="block rounded-2xl px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                                    >
                                      {c.name}
                                    </Link>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link
                            key={s.slug}
                            to="/services/$slug"
                            params={{ slug: s.slug }}
                            className="block rounded-2xl px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                          >
                            {s.name}
                          </Link>
                        ),
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={l.label}
                to={l.to}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ),
          )}
          <Link
            to="/contact"
            className="bg-ink ml-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ink-foreground transition-transform duration-300 hover:scale-105"
          >
            Contact
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="bg-ink grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-foreground lg:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {links.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  className="block rounded-2xl px-3 py-3 text-base font-medium hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 rounded-2xl bg-secondary/60 p-2">
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Services
                </p>
                {topServices.concat(automationChildren).map((s) => (
                  <Link
                    key={s.slug}
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    className={`block rounded-xl px-3 py-2 text-sm hover:bg-background ${s.parent ? "pl-6 text-muted-foreground" : ""}`}
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
              <Link
                to="/contact"
                className="bg-ink mt-3 block rounded-full px-5 py-3 text-center text-sm font-semibold text-ink-foreground"
              >
                Contact
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
