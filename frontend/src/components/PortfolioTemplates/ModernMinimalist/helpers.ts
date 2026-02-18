import type {
  Experience,
  OverviewData,
  PersonalInformation,
  Project,
} from "@/constants/ResumeFormat";
import type {
  BlogPreview,
  NormalizedExperience,
  NormalizedProject,
  PortfolioStats,
  SkillCategory,
  Testimonial,
} from "./types";

const URL_REGEX = /(https?:\/\/[^\s)]+)/g;

const splitText = (value: string): string[] =>
  value
    .split(/\n|\.|;|\u2022|\-/g)
    .map((part) => part.trim())
    .filter(Boolean);

const extractUrls = (value: string): string[] => {
  const found = value.match(URL_REGEX);
  return found?.map((item) => item.trim()) ?? [];
};

const estimateYears = (experience: NormalizedExperience[]): string => {
  const years = experience
    .flatMap((item) => item.employedDates.match(/\b(19|20)\d{2}\b/g) ?? [])
    .map((year) => Number.parseInt(year, 10))
    .filter((year) => Number.isFinite(year));

  if (!years.length) {
    return experience.length ? `${Math.max(2, experience.length)}+ Years` : "Growing";
  }

  const earliest = Math.min(...years);
  const latest = Math.max(...years);
  const span = Math.max(1, latest - earliest + 1);
  return `${span}+ Years`;
};

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9+.#\-\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const unique = (items: string[]): string[] => Array.from(new Set(items));

export const sanitizeHexColor = (value?: string, fallback = "#ef4444"): string => {
  if (!value) return fallback;
  const normalized = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) return normalized;
  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    const [, r, g, b] = normalized;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return fallback;
};

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
  career_name: overview?.career_name ?? "Full Stack Developer",
  resume_summary:
    overview?.resume_summary ??
    "I design and build resilient digital products with careful attention to performance, accessibility, and interaction quality.",
});

export const normalizeProjects = (
  projects: Array<Project | string> | undefined,
  skills: string[]
): NormalizedProject[] => {
  const safeSkills = skills.filter(Boolean);

  return (projects ?? []).map((project, index) => {
    const current =
      typeof project === "string"
        ? { title: project, description: "" }
        : {
            title: project?.title ?? "Untitled Project",
            description: project?.description ?? "",
          };

    const description = current.description.trim();
    const urls = extractUrls(description);
    const highlights = splitText(description).slice(0, 3);
    const fallbackHighlights = [
      "Structured with maintainable architecture",
      "Optimized for speed and accessibility",
      "Crafted with polished UI details",
    ];

    const tags = safeSkills.length
      ? safeSkills.slice(index % safeSkills.length, (index % safeSkills.length) + 3)
      : ["Web", "UI", "Performance"];

    return {
      title: current.title,
      description:
        description ||
        "A production-ready solution focused on usability, reliability, and clean engineering.",
      highlights: highlights.length ? highlights : fallbackHighlights,
      tags: unique(tags),
      links: {
        demo: urls[0],
        code: urls[1],
      },
    };
  });
};

export const normalizeExperience = (
  experience: Array<Experience | string> | undefined,
  skills: string[]
): NormalizedExperience[] => {
  const safeSkills = unique(skills.filter(Boolean));

  return (experience ?? []).map((entry, index) => {
    const current =
      typeof entry === "string"
        ? {
            company: entry,
            description: "",
            employed_dates: "",
          }
        : {
            company: entry?.company ?? "Company",
            description: entry?.description ?? "",
            employed_dates: entry?.employed_dates ?? "",
          };

    const bullets = splitText(current.description).slice(0, 4);
    const descriptionText = bullets.join(" ").toLowerCase();
    const tags = safeSkills.filter((skill) => descriptionText.includes(skill.toLowerCase())).slice(0, 4);

    return {
      company: current.company,
      description: current.description,
      employedDates: current.employed_dates,
      bullets: bullets.length ? bullets : ["Drove delivery for high-impact product initiatives."],
      tags: tags.length
        ? tags
        : safeSkills.length
          ? safeSkills.slice(
              index % Math.max(safeSkills.length, 1),
              (index % Math.max(safeSkills.length, 1)) + 3
            )
          : ["Architecture", "Delivery", "Collaboration"],
    };
  });
};

export const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const categorizeSkills = (skills: string[]): SkillCategory[] => {
  const source = unique(skills.filter(Boolean));
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
    "ruby",
    "c",
    "c++",
    "c#",
    "php",
    "swift",
    "kotlin",
    "rust",
    "sql",
  ]);

  const frameworkTokens = new Set([
    "react",
    "next",
    "vue",
    "angular",
    "svelte",
    "tailwind",
    "node",
    "express",
    "nestjs",
    "spring",
    "django",
    "flask",
    "graphql",
  ]);

  const databaseTokens = new Set([
    "postgres",
    "mysql",
    "sqlite",
    "mongodb",
    "redis",
    "supabase",
    "firebase",
    "dynamodb",
    "prisma",
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

  const fallback = source.slice(0, 8);

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
): PortfolioStats => {
  const specialization = overview.career_name
    ? overview.career_name
    : "Product Engineer";

  return {
    yearsExperience: estimateYears(experience),
    projectCount: `${projects.length || 1}+ Projects`,
    specialization,
    impact: `${Math.max(3, skills.length)} Core Skills`,
  };
};

export const buildBlogPreview = (
  projects: NormalizedProject[],
  overview: OverviewData
): BlogPreview => {
  const today = new Date();
  const date = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const words = overview.resume_summary.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(words / 220));

  return {
    date,
    readingTime: `${readingMinutes} min read`,
    title:
      projects[0]?.title
        ? `How I built ${projects[0].title}`
        : "Designing dependable software systems",
    excerpt:
      overview.resume_summary.slice(0, 190) +
      (overview.resume_summary.length > 190 ? "..." : ""),
    tags: ["Engineering", "Product", "Performance"],
  };
};

export const buildTestimonials = (
  fullName: string,
  careerName: string
): Testimonial[] => [
  {
    quote:
      "Clear communication, thoughtful planning, and execution quality made the entire project feel predictable and calm.",
    author: "Jordan Lee",
    role: "Product Manager",
    company: "Northstar Labs",
    wide: true,
  },
  {
    quote:
      `${fullName} brought strong ${careerName || "engineering"} depth and elevated both product quality and developer experience.`,
    author: "Avery Morgan",
    role: "Engineering Lead",
    company: "Helios Digital",
  },
  {
    quote:
      "From architecture decisions to final polish, the collaboration was fast, thoughtful, and consistently reliable.",
    author: "Taylor Kim",
    role: "Founder",
    company: "Orbit Studio",
  },
];
