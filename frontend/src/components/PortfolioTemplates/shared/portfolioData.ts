import type {
  Experience,
  OverviewData,
  PersonalInformation,
  Project,
} from "@/constants/ResumeFormat";
import type { TemplateConfig } from "@/lib/template-config";
import type { CanvasEditorBindings } from "@/components/PortfolioTemplates/shared/editor/types";

export type TemplateProps = {
  personalInformation?: PersonalInformation;
  overviewData?: OverviewData;
  projects?: Project[];
  experience?: Experience[];
  skills?: string[];
  mainColor?: string;
  backgroundColor?: string;
  templateConfig?: TemplateConfig;
  canvasEditor?: CanvasEditorBindings;
};

export type SectionId =
  | "home"
  | "about"
  | "projects"
  | "skills"
  | "experience"
  | "blog"
  | "testimonials"
  | "contact";

export type SectionTab = {
  id: SectionId;
  label: string;
};

export type NormalizedProject = {
  title: string;
  description: string;
  highlights: string[];
  tags: string[];
  links: {
    demo?: string;
    code?: string;
  };
};

export type NormalizedExperience = {
  company: string;
  employedDates: string;
  bullets: string[];
  tags: string[];
};

export type SkillCategory = {
  title: string;
  skills: string[];
};

export type PortfolioStat = {
  label: string;
  value: string;
};

export type BlogPreview = {
  date: string;
  readingTime: string;
  title: string;
  excerpt: string;
  tags: string[];
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
};

const urlRegex = /(https?:\/\/[^\s)]+)/g;

const splitText = (value: string): string[] =>
  value
    .split(/\n|\.|;|\u2022/g)
    .map((part) => part.trim())
    .filter(Boolean);

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9+.#\-\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const unique = (items: string[]): string[] => Array.from(new Set(items.filter(Boolean)));

export const sanitizeHexColor = (value?: string, fallback = "#2563eb"): string => {
  if (!value) return fallback;
  const normalized = value.trim();

  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) return normalized;
  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    const [, r, g, b] = normalized;
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return fallback;
};

export const getColorBrightness = (hex: string): number => {
  const normalized = sanitizeHexColor(hex).replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
};

export const isLightColor = (hex: string, threshold = 180): boolean => getColorBrightness(hex) > threshold;

export const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const normalizePersonalInfo = (data?: PersonalInformation): PersonalInformation => ({
  full_name: data?.full_name ?? "Your Name",
  contact_info: {
    email: data?.contact_info?.email ?? "hello@example.com",
    linkedin: data?.contact_info?.linkedin ?? "",
    phone: data?.contact_info?.phone ?? "",
    address: data?.contact_info?.address ?? "Remote",
  },
  education: {
    school: data?.education?.school ?? "",
    majors: data?.education?.majors ?? [],
    minors: data?.education?.minors ?? [],
    expected_grad: data?.education?.expected_grad ?? "",
  },
});

export const normalizeOverview = (overview?: OverviewData): OverviewData => ({
  career_name: overview?.career_name ?? "Software Engineer",
  resume_summary:
    overview?.resume_summary ??
    "I build product-focused software with strong foundations in architecture, usability, and performance.",
});

export const normalizeProjects = (
  projects: Array<Project | string> | undefined,
  skills: string[]
): NormalizedProject[] => {
  const safeSkills = unique(skills);

  return (projects ?? []).map((project, index) => {
    const current =
      typeof project === "string"
        ? { title: project, description: "" }
        : {
            title: project?.title ?? "Project",
            description: project?.description ?? "",
          };

    const description = current.description.trim();
    const highlights = splitText(description).slice(0, 3);
    const links = description.match(urlRegex) ?? [];

    const fallbackHighlights = [
      "Delivered a robust production implementation",
      "Improved usability and performance",
      "Maintained high engineering quality",
    ];

    const tags = safeSkills.length
      ? safeSkills.slice(index % safeSkills.length, (index % safeSkills.length) + 4)
      : ["Web", "Design", "Performance"];

    return {
      title: current.title,
      description:
        description ||
        "A focused solution designed for reliability, usability, and clear business impact.",
      highlights: highlights.length ? highlights : fallbackHighlights,
      tags: unique(tags),
      links: {
        demo: links[0],
        code: links[1],
      },
    };
  });
};

export const normalizeExperience = (
  experience: Array<Experience | string> | undefined,
  skills: string[]
): NormalizedExperience[] => {
  const safeSkills = unique(skills);

  return (experience ?? []).map((entry, index) => {
    const current =
      typeof entry === "string"
        ? {
            company: entry,
            employed_dates: "",
            description: "",
          }
        : {
            company: entry?.company ?? "Company",
            employed_dates: entry?.employed_dates ?? "",
            description: entry?.description ?? "",
          };

    const bullets = splitText(current.description).slice(0, 4);
    const fallbackBullets = [
      "Led implementation across critical product areas.",
      "Collaborated closely with cross-functional stakeholders.",
      "Improved quality through testing and maintainable architecture.",
    ];

    const asText = current.description.toLowerCase();
    const matchingTags = safeSkills.filter((skill) => asText.includes(skill.toLowerCase())).slice(0, 4);

    const tags = matchingTags.length
      ? matchingTags
      : safeSkills.length
        ? safeSkills.slice(index % safeSkills.length, (index % safeSkills.length) + 3)
        : ["Engineering", "Product", "Delivery"];

    return {
      company: current.company,
      employedDates: current.employed_dates,
      bullets: bullets.length ? bullets : fallbackBullets,
      tags,
    };
  });
};

export const categorizeSkills = (skills: string[]): SkillCategory[] => {
  const source = unique(skills);

  const buckets: Record<string, string[]> = {
    Languages: [],
    "Frameworks & Libraries": [],
    Databases: [],
    "Tools & Platforms": [],
  };

  const languageTokens = new Set([
    "javascript",
    "typescript",
    "python",
    "java",
    "go",
    "rust",
    "ruby",
    "php",
    "swift",
    "kotlin",
    "sql",
  ]);

  const frameworkTokens = new Set([
    "react",
    "next",
    "node",
    "express",
    "vue",
    "angular",
    "tailwind",
    "graphql",
    "django",
    "flask",
    "spring",
  ]);

  const databaseTokens = new Set([
    "postgres",
    "mysql",
    "mongodb",
    "redis",
    "sqlite",
    "supabase",
    "firebase",
    "prisma",
    "dynamodb",
  ]);

  source.forEach((skill) => {
    const tokens = tokenize(skill);

    if (tokens.some((token) => languageTokens.has(token))) {
      buckets.Languages.push(skill);
      return;
    }

    if (tokens.some((token) => frameworkTokens.has(token))) {
      buckets["Frameworks & Libraries"].push(skill);
      return;
    }

    if (tokens.some((token) => databaseTokens.has(token))) {
      buckets.Databases.push(skill);
      return;
    }

    buckets["Tools & Platforms"].push(skill);
  });

  const fallback = source.length ? source : ["Communication", "Problem Solving", "Mentoring", "Delivery"];

  return [
    {
      title: "Languages",
      skills: buckets.Languages.length ? buckets.Languages : fallback.slice(0, 2),
    },
    {
      title: "Frameworks & Libraries",
      skills: buckets["Frameworks & Libraries"].length
        ? buckets["Frameworks & Libraries"]
        : fallback.slice(2, 4),
    },
    {
      title: "Databases",
      skills: buckets.Databases.length ? buckets.Databases : fallback.slice(4, 6),
    },
    {
      title: "Tools & Platforms",
      skills: buckets["Tools & Platforms"].length
        ? buckets["Tools & Platforms"]
        : fallback.slice(6, 8),
    },
  ];
};

export const buildStats = (
  projects: NormalizedProject[],
  experience: NormalizedExperience[],
  skills: string[],
  overview: OverviewData
): PortfolioStat[] => {
  const years = experience
    .flatMap((item) => item.employedDates.match(/\b(19|20)\d{2}\b/g) ?? [])
    .map((year) => Number.parseInt(year, 10))
    .filter((year) => Number.isFinite(year));

  const span = years.length ? Math.max(1, Math.max(...years) - Math.min(...years) + 1) : Math.max(2, experience.length);

  return [
    { label: "Experience", value: `${span}+ Years` },
    { label: "Projects", value: `${projects.length || 1}+` },
    { label: "Role", value: overview.career_name || "Engineer" },
    { label: "Skills", value: `${Math.max(3, skills.length)} Core` },
  ];
};

export const buildBlogPreview = (
  projects: NormalizedProject[],
  overview: OverviewData
): BlogPreview => {
  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const words = overview.resume_summary.split(/\s+/).filter(Boolean).length;
  const readingTime = `${Math.max(1, Math.ceil(words / 220))} min read`;

  return {
    date,
    readingTime,
    title: projects[0]?.title ? `Building ${projects[0].title}: lessons from delivery` : "Building resilient product systems",
    excerpt:
      overview.resume_summary.length > 190
        ? `${overview.resume_summary.slice(0, 190)}...`
        : overview.resume_summary,
    tags: ["Engineering", "Product", "Architecture"],
  };
};

export const buildTestimonials = (
  name: string,
  role: string
): Testimonial[] => [
  {
    quote:
      "Execution was consistently structured, thoughtful, and highly dependable across planning and delivery.",
    author: "Morgan Reyes",
    role: "Product Manager",
    company: "Northstar Labs",
  },
  {
    quote: `${name} brought strong ${role || "technical"} leadership and improved both code quality and team velocity.`,
    author: "Avery Brooks",
    role: "Engineering Lead",
    company: "Orbit Systems",
  },
  {
    quote:
      "The final product balanced business needs with technical rigor and polished user experience.",
    author: "Jordan Kim",
    role: "Founder",
    company: "Signal Forge",
  },
];

export const defaultTabs: SectionTab[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "blog", label: "Blog" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
];

export const setupSectionObservers = (
  root: HTMLElement,
  tabs: SectionTab[],
  onActive: (id: SectionId) => void
): (() => void) => {
  const revealElements = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.dataset.visible = "true";
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  revealElements.forEach((element) => revealObserver.observe(element));

  const sectionElements = tabs
    .map((tab) => root.querySelector<HTMLElement>(`#${tab.id}`))
    .filter((element): element is HTMLElement => Boolean(element));

  const activeObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      const id = visible[0]?.target.id as SectionId | undefined;
      if (id) onActive(id);
    },
    { threshold: [0.2, 0.45], rootMargin: "-35% 0px -45% 0px" }
  );

  sectionElements.forEach((section) => activeObserver.observe(section));

  return () => {
    revealObserver.disconnect();
    activeObserver.disconnect();
  };
};
