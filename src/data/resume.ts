export interface Link {
  label: string;
  href: string;
}

export interface Metric {
  value: string;
  label: string;
}

export interface Experience {
  company: string;
  /** One-line company blurb for the tooltip (max 100 characters). */
  about: string;
  role: string;
  location: string;
  period: string;
  context?: string;
  highlights: string[];
  tags: string[];
}

export interface Project {
  name: string;
  tagline: string;
  period: string;
  links?: Link[];
  stack: string[];
  highlights: string[];
}

/** Something built for AI agents to use: a skill, an MCP server, a plugin, a CLI… */
export interface AgentTool {
  name: string;
  /** What kind of thing it is, e.g. "Skill", "MCP server", "Plugin". */
  kind: string;
  tagline: string;
  /** Agents it works with, e.g. "Claude Code", "Codex". */
  worksWith: string[];
  /** One command to install it, shown with a copy button. */
  install?: string;
  links?: Link[];
  highlights: string[];
}

export interface SkillGroup {
  title: string;
  items: string[];
}

export interface Achievement {
  title: string;
  year: string;
  description: string;
}

export const profile = {
  name: "Jatin Bhargava",
  title: "Software Engineer",
  location: "Bengaluru, India",
  email: "jatinbhargava4@gmail.com",
  handle: "@JatinBhargava",
  avatar: "https://github.com/JatinBhargava.png?size=256",
  cover: "/cover.svg",
  resume: "/Jatin_Bhargava_SDE_Resume.pdf",
  company: "FIS Global",
  website: { label: "ouratlas.co.in", href: "https://ouratlas.co.in" },
  headline: {
    lead: 'I build backend systems that',
    /** Rotates on the header, one after another. */
    endings: [
      "don't flinch at 5M users.",
      'survive Friday deploys.',
      'turn 1s into 40ms.',
      'replay what Kafka dropped.',
      'page nobody at 3am.',
    ],
  },
  bio: 'Distributed systems, event-driven everything, and a healthy distrust of "it works on my machine". Currently making core banking boring (the good kind) at FIS Global.',
  github: "https://github.com/JatinBhargava",
  linkedin: "https://linkedin.com/in/jatinbhargava10",
  summary:
    "Backend engineer with 3+ years on production core banking and payments systems in Java, Spring Boot, and Apache Kafka at FIS Global, for a Tier-1 Australia / New Zealand bank serving 5M+ customers. My work spans account origination, transaction processing, and PIE / non-PIE investment-tax classification. I am strongest on scalable system design, event-driven architecture, REST API contracts, and PostgreSQL performance, and I ship containerized services to Kubernetes on Terraform-managed infrastructure.",
  links: [
    { label: "GitHub", href: "https://github.com/JatinBhargava" },
    { label: "LinkedIn", href: "https://linkedin.com/in/jatinbhargava10" },
    { label: "Email", href: "mailto:jatinbhargava4@gmail.com" },
  ] satisfies Link[],
};

export const metrics: Metric[] = [
  { value: "5M+", label: "customers served by the systems I build" },
  { value: "96%", label: "cut in profile read latency (1s → 40ms)" },
  { value: "30%", label: "fewer repeat production incidents" },
  { value: "~150h", label: "of manual recovery removed per year" },
];

export const experience: Experience[] = [
  {
    company: "FIS Global",
    about:
      "Fortune 500 fintech building core banking, payments and capital-markets software for global banks.",
    role: "Software Engineer I",
    location: "Bengaluru, India",
    period: "Sep 2023 – Present",
    context:
      "Core banking for a Tier-1 Australia / New Zealand bank, 5M+ customers",
    highlights: [
      "Re-architected nightly batch processing into Kafka event-driven messaging across distributed services with idempotent consumers, retry topics, and dead-letter handling. Failed records now recover in minutes instead of waiting for the next 24-hour window.",
      "Cut customer-profile read latency from 1s to 40ms (96%) with a Redis read-through cache over customer and account reference data, using TTL plus event-driven invalidation to keep cached reads consistent with origination updates.",
      "Reduced p95 latency roughly 35% on business-critical origination and transaction queries by redesigning PostgreSQL composite indexes and eliminating N+1 query patterns over tables spanning 5M+ records.",
      "Implemented PIE and non-PIE investment-tax handling in account origination, classifying each account's tax treatment at creation, and enforced PII protection via field-level encryption and masking for audit and regulatory requirements.",
      "Designed REST APIs across internal origination and customer services and authored the team's validation, versioning, and error-contract standards, now the default for new services, with JUnit 5 / Mockito tests gated in Jenkins CI.",
      "Deploy Spring Boot microservices as Docker containers to Kubernetes (Azure AKS) via Helm charts over Terraform-managed infrastructure, released through Jenkins CI/CD.",
      "Built self-service tooling to trace, replay, and reconcile stalled Kafka events across onboarding, origination, and transaction flows, and fixed the underlying consumer and idempotency defects, cutting repeat production incidents 30% and removing ~150 engineer-hours/year of manual recovery.",
    ],
    tags: [
      "Java 17/21",
      "Spring Boot",
      "Kafka",
      "Redis",
      "PostgreSQL",
      "Kubernetes",
      "Helm",
      "Terraform",
      "Azure",
    ],
  },
  {
    company: "HighRadius",
    about:
      "AI fintech SaaS that automates order-to-cash, treasury and record-to-report for enterprise finance.",
    role: "Software Developer Intern",
    location: "Remote",
    period: "Jan 2022 – Apr 2022",
    highlights: [
      "Built a full-stack Invoice Management System (React, Java, JDBC, MySQL) over 10K+ invoice records, with REST CRUD plus server-side search, filtering, and pagination, cutting lookup time 40%.",
      "Prepared the invoice dataset for ML: cleaned nulls, duplicates and inconsistent date formats, and engineered features such as payment terms, customer payment history and delay buckets.",
      "Trained a Random Forest classifier on those features to predict which customers were likely to pay late, so collections teams could follow up on at-risk invoices first.",
    ],
    tags: ["React", "Java", "JDBC", "MySQL", "REST", "Python", "pandas", "Random Forest"],
  },
];

export const projects: Project[] = [
  {
    name: "Atlas",
    tagline: "Travel magazine publishing platform",
    period: "Sep 2026 – Present",
    links: [{ label: "ouratlas.co.in", href: "https://ouratlas.co.in" }],
    stack: [
      "TypeScript",
      "React",
      "Express",
      "PostgreSQL",
      "AWS",
      "Docker",
      "OAuth2 / JWT",
      "Dodo",
    ],
    highlights: [
      "Shipped and operate a live subscription product: Google OAuth2, server-verified JWT sessions, PostgreSQL row-level security, and paid entitlement granted only by a signature-verified Dodo webhook, over an append-only ledger that tolerates unordered delivery.",
      "Built a streaming LLM integration (Anthropic / OpenAI) with document chunking.",
      "Deployed to AWS: containerized API on ECS Fargate behind an Application Load Balancer with Route 53 DNS and ACM TLS, SPA served from S3 via CloudFront, secrets in Secrets Manager, CloudWatch logs, and images published to ECR by GitHub Actions.",
    ],
  },
  {
    name: "Cold Email Desk",
    tagline: "AI job-search desk for startup cold outreach",
    period: "Oct 2026 – Present",
    links: [{ label: "coldemail.ouratlas.co.in", href: "https://coldemail.ouratlas.co.in" }],
    stack: [
      "TypeScript",
      "React",
      "Vite",
      "Vercel Functions",
      "Supabase",
      "PostgreSQL",
      "Claude API",
      "Tauri",
      "Dodo",
    ],
    highlights: [
      "Finds fresh roles and newly funded startups that match a user's profile, scores each one with Claude on five 1–5 signals (funding recency, investors, traction, team fit, skill fit) and drafts a tailored first email from the user's own achievements.",
      "Multi-user app on Vercel with Google sign-in and Supabase Postgres (14 tables behind row-level security); resumes are parsed by Claude to fill the profile, and an on-demand lookup finds verified work emails for people at each company.",
      "Tracks every email through sent, follow-up and reply stages with reminders, sells search credits through Dodo payments, and ships as a native macOS and Windows desktop app built with Tauri and released by GitHub Actions.",
    ],
  },
  {
    name: "Penguin Health",
    tagline: "RAG and agent assistant for personal medical reports",
    period: "Oct 2026",
    links: [{ label: "GitHub", href: "https://github.com/JatinBhargava/penguin-health" }],
    stack: [
      "Java",
      "Spring Boot",
      "PostgreSQL",
      "pgvector",
      "OpenAI",
      "PDFBox",
      "Flyway",
      "Docker",
    ],
    highlights: [
      "Ingests lab-report PDFs: extracts text with PDFBox, splits it into chunks, stores OpenAI embeddings in Postgres with pgvector, and answers questions with retrieval-augmented generation and source citations.",
      "Extracts structured health events (test, value, date) into a timeline, and runs a tool-calling agent that picks between vector search, latest-result and history tools over up to five reasoning steps.",
      "Built an evaluation harness that scores retrieval hit rate, answer groundedness and citation accuracy against a labelled question set (e.g. \"What was my HbA1c?\").",
    ],
  },
  {
    name: "Unsent",
    tagline: "Social journaling and long-form writing platform",
    period: "Jan 2026 – Aug 2026",
    links: [
      { label: "unsent.vercel.app", href: "https://unsent.vercel.app" },
      { label: "Frontend", href: "https://github.com/JatinBhargava/unsent-ui" },
      { label: "Backend", href: "https://github.com/JatinBhargava/unsent-core" },
    ],
    stack: [
      "Java",
      "Spring Boot",
      "Spring Security",
      "PostgreSQL",
      "WebSocket",
      "React",
      "TypeScript",
      "Stripe",
      "Docker",
      "Jenkins",
    ],
    highlights: [
      "Writing platform where people keep private or public diaries, send postcards, add friends and co-write stories, with an AI \"continue the story\" helper built on OpenAI.",
      "Multi-module Spring Boot backend with JWT and Google OAuth2 sign-in, real-time chat over WebSockets, Stripe payments with webhook handling, Flyway-managed Postgres and Caffeine caching.",
      "React 19 + TypeScript frontend on Vercel with a draft/publish writing flow; CI runs lint, build and Docker image publishing through GitHub Actions and Jenkins.",
    ],
  },
];

// Add new skills, MCP servers or plugins here; newest first.
export const agentTools: AgentTool[] = [
  {
    name: "repo-architecture",
    kind: "Skill",
    tagline: "Turns any code repository into an interactive system-design page",
    worksWith: ["Claude Code", "Codex"],
    install: "npx github:JatinBhargava/repo-architecture-skill",
    links: [{ label: "GitHub", href: "https://github.com/JatinBhargava/repo-architecture-skill" }],
    highlights: [
      "Reads a repo and draws its clients, services, databases and outside APIs, then plays real request flows (sign-in, payments, webhooks, background jobs) through the diagram one hop at a time.",
      "Every step cites the file and line it came from, and a validator checks that each citation exists, so nothing on the page is guessed.",
      "Outputs one self-contained HTML page plus an animated SVG, MP4 and GIF of a flow for READMEs and social posts.",
    ],
  },
  {
    name: "guided-launch-film",
    kind: "Skill",
    tagline: "Makes a cinematic 60-second product launch film with a guide character",
    worksWith: ["Claude Code"],
    highlights: [
      "Builds a 4K launch film on HyperFrames where a small \"buddy\" character walks the viewer through the product, with dry on-screen lines, an optional voice-over and a synthesized score.",
      "The guide lives on one overlay above every scene, so scenes can cut, zoom and dissolve underneath while it stays in frame.",
      "Used to make the launch film for Cold Email Desk.",
    ],
  },
];

export const skills: SkillGroup[] = [
  {
    title: "Languages",
    items: ["Java 8 / 11 / 17 / 21", "SQL", "TypeScript", "JavaScript", "C++"],
  },
  {
    title: "Backend & Data",
    items: [
      "Spring Boot",
      "Spring Data JPA",
      "Spring Security",
      "Hibernate",
      "REST APIs",
      "Microservices",
      "OpenAPI / Swagger",
      "Concurrency",
      "Apache Kafka",
      "Redis",
      "PostgreSQL",
      "MySQL",
    ],
  },
  {
    title: "Cloud & DevOps",
    items: [
      "Kubernetes (AKS)",
      "Docker",
      "Helm",
      "Terraform",
      "Azure (AKS, Event Hubs, Service Bus)",
      "AWS (ECS Fargate, ALB, Route 53, CloudFront, CloudWatch, EC2, S3)",
      "Jenkins",
      "GitHub Actions",
      "CI/CD",
      "Git",
      "Maven",
      "Flyway",
      "Linux",
    ],
  },
  {
    title: "Testing & Tooling",
    items: [
      "JUnit 5",
      "Mockito",
      "Integration Testing",
      "Postman",
      "Grafana",
      "Code Review",
      "Agile / Scrum",
    ],
  },
  {
    title: "AI & LLM",
    items: [
      "GitHub Copilot",
      "LLM Integration",
      "Prompt Engineering",
      "RAG",
      "Vector Search",
    ],
  },
];

export const education = {
  school: "SRM Institute of Science & Technology, KTR",
  location: "Chennai, India",
  degree: "B.Tech, Computer Science & Engineering",
  period: "Jul 2019 – Jun 2023",
  gpa: "9.20 / 10",
  note: "500+ Data Structures & Algorithms problems solved",
  coursework: [
    "Data Structures & Algorithms",
    "Object-Oriented Programming",
    "Operating Systems",
    "Computer Networks",
    "Database Management Systems",
    "Neural Networks",
  ],
};

export const achievements: Achievement[] = [
  {
    title: "FIS Global company-wide hackathon: stage 2",
    year: "2026",
    description:
      "Built an AI workflow that automates Wiki release documentation, cutting it from 2–3 days to under an hour.",
  },
  {
    title: "Regional Generative AI hackathon",
    year: "2025",
    description:
      "Built an LLM + RAG pipeline with vector search over defect and log history to auto-classify defects and surface root causes.",
  },
];

export interface Place {
  image: string;
  alt: string;
  caption: string;
  credit: { author: string; license: string; source: string };
}

/** Photos shown when a location name is clicked. Keys match `Experience.location`. */
export const places: Record<string, Place> = {
  "Bengaluru, India": {
    image: "/places/bengaluru.jpg",
    alt: "Bengaluru skyline with UB Tower and glass high-rises above the trees",
    caption: "Bengaluru, Karnataka · the Silicon Valley of India",
    credit: {
      author: "Gpkp",
      license: "CC BY-SA 4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:View_from_Visvesvaraya_Industrial_and_Technological_Museum_(2025)_02.jpg",
    },
  },
};

export interface UnusualAchievement {
  icon: "medal" | "runner" | "cricket" | "tennis";
  headline: string;
  detail: string;
  /** Shows a small "Now" badge for things still in progress. */
  current?: boolean;
}

/** Off-résumé wins. */
export const unusualAchievements: UnusualAchievement[] = [
  {
    icon: "medal",
    headline: "1st runner-up",
    detail: "In 7th and 8th standard, two years running",
  },
  {
    icon: "runner",
    headline: "District-level runner",
    detail: "Competed in running at district level",
  },
  {
    icon: "cricket",
    headline: "35 hundreds",
    detail: "Centuries scored in street cricket",
  },
  // \u2011 = non-breaking hyphen, so a set score never wraps mid-way.
  {
    icon: "tennis",
    headline: "Playing tennis",
    detail: "Best score line: 6\u20114, 6\u20114, 6\u20115",
    current: true,
  },
];

/** Right-rail "Latest trip" card: a magazine made with Atlas. */
export const latestTrip = {
  slug: 'kodaikanal',
  place: 'Kodaikanal',
  region: 'Tamil Nadu',
  when: 'September 2026',
  issueTitle: 'Kodaikanal: Where the Clouds Came Down to Meet Us',
  dek: 'An intimate travel story about rain, friendship, misty forests, and the quiet beauty of getting lost in the hills.',
  magazine: '/magazines/kodaikanal.pdf',
  cover: '/magazines/kodaikanal-cover.jpg',
  /** Pages pre-rendered from the PDF with `pdftoppm -r 170`. */
  pages: Array.from({ length: 11 }, (_, i) => `/magazines/kodaikanal/page-${String(i + 1).padStart(2, '0')}.jpg`),
};
