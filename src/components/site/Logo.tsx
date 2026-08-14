import { Link } from "@tanstack/react-router";
import { site } from "@/lib/site";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label={`${site.name} home`}>
      <span className="bg-brand shadow-soft relative grid h-9 w-9 place-items-center rounded-[0.7rem] transition-transform duration-300 group-hover:rotate-12">
        <span className="font-display text-[1.05rem] font-bold text-primary-foreground">
          {site.name.charAt(0).toLowerCase()}
        </span>
      </span>
      <span
        className={`font-display text-[1.35rem] font-bold tracking-tight ${light ? "text-ink-foreground" : "text-foreground"}`}
      >
        {site.name.toLowerCase()}
        <span className="text-gradient">.</span>
      </span>
    </Link>
  );
}
