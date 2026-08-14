export const site = {
  name: "Pixelwright",
  tagline: "Digital design & development agency",
  email: "mdradyan30@gmail.com",
  phone: "01568793292",
  office: "Dhaka, Bangladesh",
  officeLabel: "MAIN OFFICE",
  year: 2026,
  socials: [
    { label: "Dribbble", href: "https://dribbble.com" },
    { label: "GitHub", href: "https://github.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
};

export type Service = {
  slug: string;
  name: string;
  short: string;
  headline: string;
  intro: string;
  deliverables: string[];
  parent?: string;
};

export const services: Service[] = [
  {
    slug: "website-build",
    name: "Website Build",
    short: "Marketing sites & platforms built to convert.",
    headline: "Websites that feel engineered, not templated",
    intro:
      "From positioning and copy structure to design systems and performant front-end code, we build marketing sites that load instantly and read beautifully on every screen.",
    deliverables: [
      "Brand-led UI design system",
      "Responsive, accessible front-end",
      "CMS-driven pages & blog",
      "Core Web Vitals tuning",
      "On-page SEO foundation",
    ],
  },
  {
    slug: "ecommerce-website-build",
    name: "E-commerce Website Build",
    short: "Storefronts engineered around checkout.",
    headline: "Stores designed for the second purchase",
    intro:
      "Product discovery, merchandising, and a checkout flow with as little friction as physically possible — wired into the payment and inventory stack you already use.",
    deliverables: [
      "Catalog & product page architecture",
      "Cart and one-page checkout UX",
      "Payments & shipping integration",
      "Abandoned cart automation",
      "Analytics and conversion tracking",
    ],
  },
  {
    slug: "saas-build",
    name: "SaaS Build",
    short: "Product UI, auth, billing, dashboards.",
    headline: "From idea to a product people pay for",
    intro:
      "We ship SaaS foundations: authentication, roles, billing, dashboards and the design system that keeps every future screen consistent.",
    deliverables: [
      "Product design & prototyping",
      "Auth, roles and permissions",
      "Subscription billing",
      "Admin & analytics dashboards",
      "Scalable database schema",
    ],
  },
  {
    slug: "automation",
    name: "Automation",
    short: "Workflows and AI that run without you.",
    headline: "Let the boring parts run themselves",
    intro:
      "We connect your channels, CRM and AI models into workflows that reply, qualify, publish and report — around the clock.",
    deliverables: [
      "Workflow mapping & audit",
      "Channel integrations",
      "AI response layer",
      "Dashboards & alerting",
      "Handover documentation",
    ],
  },
  {
    slug: "facebook-automation",
    name: "Facebook Automation",
    parent: "automation",
    short: "Comment, inbox and ad-lead automation.",
    headline: "Facebook that answers in seconds",
    intro:
      "Auto-replies for comments and Messenger, lead capture from ads straight into your CRM, and reporting that shows what actually converts.",
    deliverables: [
      "Messenger flows & quick replies",
      "Comment auto-response rules",
      "Lead-ad to CRM sync",
      "Broadcast & re-engagement",
      "Performance reporting",
    ],
  },
  {
    slug: "whatsapp-automation",
    name: "WhatsApp Automation",
    parent: "automation",
    short: "Cloud API flows, catalogs and support bots.",
    headline: "WhatsApp as your fastest sales channel",
    intro:
      "Official Cloud API setup, template messages, order updates and an AI support agent that escalates to a human at the right moment.",
    deliverables: [
      "Cloud API onboarding",
      "Template & flow design",
      "Order and delivery updates",
      "AI support agent",
      "Team inbox & routing",
    ],
  },
  {
    slug: "youtube-automation",
    name: "YouTube Automation",
    parent: "automation",
    short: "Publishing pipelines, SEO and repurposing.",
    headline: "A channel that publishes on rails",
    intro:
      "Scripting assistance, upload pipelines, metadata and thumbnail workflows, plus automatic repurposing into shorts and posts.",
    deliverables: [
      "Content pipeline setup",
      "Title, tag & description SEO",
      "Thumbnail workflow",
      "Shorts repurposing",
      "Analytics digest",
    ],
  },
  {
    slug: "ai-assistant",
    name: "AI Assistant",
    parent: "automation",
    short: "Custom assistants trained on your business.",
    headline: "An assistant that knows your business",
    intro:
      "Retrieval over your own documents, tool access to your systems, and guardrails so answers stay accurate and on-brand.",
    deliverables: [
      "Knowledge base ingestion",
      "Retrieval-augmented answers",
      "Tool & API actions",
      "Escalation & guardrails",
      "Usage analytics",
    ],
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
export const automationChildren = services.filter((s) => s.parent === "automation");
export const topServices = services.filter((s) => !s.parent);

export const interests = [
  "Site from scratch",
  "E-commerce",
  "SaaS product",
  "UX/UI design",
  "Automation",
  "AI assistant",
  "Branding",
];

export const budgets = ["1-5k", "5-10k", "10-25k", "25-50k", "> 50k"];

export const faqs = [
  {
    q: "What does a typical website project look like?",
    a: "Discovery and positioning, then design directions, then build and QA. Most marketing sites run 3-6 weeks end to end, with a weekly demo so nothing is a surprise.",
  },
  {
    q: "How do you price projects?",
    a: "Fixed scope, fixed price. After a short call we send a proposal with phases, deliverables and dates, so you always know what the next payment unlocks.",
  },
  {
    q: "Can you work with our existing brand and stack?",
    a: "Yes. We extend existing design systems and integrate with the CRM, payment and analytics tools you already run.",
  },
  {
    q: "Do you handle automation after launch?",
    a: "We do. Most clients continue on a monthly retainer covering automation, content pipelines and iterative improvements.",
  },
  {
    q: "Who owns the code and design files?",
    a: "You do, completely, from the first commit. Everything is handed over with documentation.",
  },
];

export const processSteps = [
  { n: "01", t: "Discover", d: "Goals, audience, competitors and the one metric that matters." },
  { n: "02", t: "Design", d: "Directions, then a full design system your team can grow into." },
  { n: "03", t: "Build", d: "Clean, fast, accessible code with weekly demos." },
  { n: "04", t: "Automate", d: "Wire in AI and workflows so the site keeps working after launch." },
];

export const testimonials = [
  {
    quote:
      "Nuvora completed a rebranding of our company website. The quality of the team's work exceeded my expectations, and since completion we have won a number of awards.",
    client: "Zelt",
    role: "HR platform",
  },
  {
    quote:
      "We worked with the Nuvora team over a several month project on a complete website rehaul, that included new copy, design, and code. Several things stood out in our interaction.",
    client: "LoanPro",
    role: "Modern credit platform",
  },
  {
    quote:
      "Nuvora was engaged in developing our website and additional marketing materials, including theming and various creative assignments. Their efforts were highly satisfactory.",
    client: "Potion",
    role: "Video personalisation",
  },
  {
    quote:
      "They moved faster than our in-house team and still shipped the most polished product surface we've ever launched. The handover documentation alone was worth it.",
    client: "Northwind",
    role: "Logistics SaaS",
  },
];

export const clientStats = [
  { value: "15+", label: "Years of experience" },
  { value: "Awarded", label: "Recognized by leading design awards" },
  { value: "300+", label: "Projects delivered worldwide" },
];

export const whyCopy =
  "For over 15 years, we've been helping startups, scale-ups and global companies transform ambitious ideas into successful digital products. Our work has earned international recognition, but what matters most to us is building long-term partnerships and delivering measurable business value.";
