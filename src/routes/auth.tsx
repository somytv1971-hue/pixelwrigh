import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { Blobs } from "@/components/site/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Nuvora studio" },
      { name: "description", content: "Sign in to the Nuvora content studio to manage posts and projects." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Sign in — Nuvora studio" },
      { property: "og:description", content: "Studio access for the Nuvora team." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) void navigate({ to: "/admin" });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Account created. You can sign in now.");
      setMode("signin");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    void navigate({ to: "/admin" });
  };

  return (
    <main className="relative grid min-h-screen place-items-center px-5">
      <Blobs />
      <div className="w-full max-w-sm">
        <Logo />
        <h1 className="display-xl mt-8 text-3xl">{mode === "signin" ? "Studio sign in" : "Create studio account"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The first account created becomes the studio admin.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="bg-ink flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-ink-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-sm text-muted-foreground underline underline-offset-4"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
