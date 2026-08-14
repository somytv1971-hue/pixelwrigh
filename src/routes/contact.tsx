import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { Blobs, Words } from "@/components/site/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { budgets, interests, site } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Nuvora" },
      {
        name: "description",
        content: "Tell us about your project — websites, e-commerce, SaaS or automation. We reply within a day.",
      },
      { property: "og:title", content: "Contact — Nuvora" },
      { property: "og:description", content: "Hey! Tell us all the things about your project." },
    ],
  }),
  component: Contact;
});

function Contact() {
  return null;
}
