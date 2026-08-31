import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Blobs, Words } from "@/components/site/Reveal";
import { submitLead } from "@/lib/leads.functions";
import { budgets, interests, site } from "@/lib/site";


export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact — ${site.name}` },
      {
        name: "description",
        content: "Tell us about your project — websites, e-commerce, SaaS or automation. We reply within a day.",
      },
      { property: "og:title", content: `Contact — ${site.name}` },
      { property: "og:description", content: "Hey! Tell us all the things about your project." },
    ],
  }),
  component: Contact,
});

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
        active
          ? "border-transparent bg-ink text-ink-foreground"
          : "border-border hover:-translate-y-0.5 hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}

function Contact() {
  const [selected, setSelected] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const sendLead = useServerFn(submitLead);

  const toggle = (item: string) =>
    setSelected((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !details.trim()) {
      toast.error("Name, email and project details are required.");
      return;
    }
    setSending(true);
    try {
      await sendLead({
        data: {
          name: name.trim(),
          email: email.trim(),
          interests: selected,
          budget: budget || null,
          message: details.trim(),
        },
      });
    } catch {
      setSending(false);
      toast.error("Something went wrong. Please email us directly.");
      return;
    }
    setSending(false);
    setDone(true);
    toast.success("Thanks! We'll get back to you within one business day.");
    setName("");
    setEmail("");
    setDetails("");
    setSelected([]);
    setBudget("");
  };


  return (
    <main className="relative px-5 pb-24 pt-16 lg:px-8">
      <Blobs />
      <div className="mx-auto max-w-4xl">
        <h1 className="display-xl text-5xl sm:text-7xl lg:text-8xl">
          <Words text="Hey! Tell us all" />
          <br />
          <Words text="the things" className="text-gradient" />
        </h1>

        <form onSubmit={submit} className="mt-16 space-y-14">
          <fieldset>
            <legend className="font-display text-2xl font-semibold">I'm interested in...</legend>
            <div className="mt-6 flex flex-wrap gap-3">
              {interests.map((i) => (
                <Chip key={i} label={i} active={selected.includes(i)} onClick={() => toggle(i)} />
              ))}
            </div>
          </fieldset>

          <div className="grid gap-8 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-3 w-full border-b border-border bg-transparent pb-3 text-lg outline-none transition-colors focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">Your email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className="mt-3 w-full border-b border-border bg-transparent pb-3 text-lg outline-none transition-colors focus:border-primary"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Tell us about your project</span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="Goals, timeline, links to anything relevant..."
              className="mt-3 w-full resize-none border-b border-border bg-transparent pb-3 text-lg outline-none transition-colors focus:border-primary"
            />
          </label>

          <fieldset>
            <legend className="font-display text-2xl font-semibold">Project budget (USD)</legend>
            <div className="mt-6 flex flex-wrap gap-3">
              {budgets.map((b) => (
                <Chip key={b} label={b} active={budget === b} onClick={() => setBudget(b === budget ? "" : b)} />
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-6">
            <button
              type="submit"
              disabled={sending}
              className="bg-ink group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-ink-foreground disabled:opacity-60"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send request
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            {done ? <p className="text-sm text-muted-foreground">Request received — talk soon.</p> : null}
          </div>
        </form>

        <div className="mt-24 grid gap-8 border-t border-border pt-12 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Email</p>
            <a href={`mailto:${site.email}`} className="mt-2 block text-lg font-medium">
              {site.email}
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Phone</p>
            <a href={`tel:${site.phone}`} className="mt-2 block text-lg font-medium">
              {site.phone}
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {site.officeLabel}
            </p>
            <p className="mt-2 text-lg font-medium">{site.office}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
