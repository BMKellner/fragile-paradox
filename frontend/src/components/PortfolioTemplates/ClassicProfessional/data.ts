import type { ExperienceItem, SectionStat } from "@/lib/template-config-types";

export interface TimelineExperienceEntry {
  id: string;
  commit: string;
  role: string;
  company: string;
  range: string;
  bullets: string[];
  tags: string[];
}

export interface AboutFact {
  id: string;
  label: string;
  heading: string;
  body: string;
}

export interface RadialStat {
  label: string;
  value: string;
  progress: number;
}

export const DEFAULT_TIMELINE_ENTRIES: TimelineExperienceEntry[] = [
  {
    id: "timeline-1",
    commit: "0000c31",
    role: "Senior Java Developer",
    company: "Northstar Platform",
    range: "Sep 2019 - Feb 2023",
    bullets: [
      "Led microservice modernization efforts for high-volume financial systems.",
      "Improved CI pipeline stability and reduced deployment rollback incidents.",
      "Partnered with product and QA to deliver complex releases on schedule.",
    ],
    tags: ["Java", "Spring Cloud", "Microservices"],
  },
  {
    id: "timeline-2",
    commit: "0000d88",
    role: "Backend Engineer",
    company: "Orbit Commerce",
    range: "Mar 2023 - Jan 2025",
    bullets: [
      "Built APIs powering personalization and checkout optimization programs.",
      "Introduced observability standards that improved MTTR for production incidents.",
      "Owned migration to event-driven workflows for asynchronous order processing.",
    ],
    tags: ["TypeScript", "PostgreSQL", "Kafka"],
  },
  {
    id: "timeline-3",
    commit: "0000ef2",
    role: "Full-Stack Engineer",
    company: "Atlas Labs",
    range: "Feb 2025 - Present",
    bullets: [
      "Designed and shipped partner-facing dashboards used across global teams.",
      "Tightened performance budgets to keep interaction latency under target.",
      "Mentored engineers on architecture reviews and production-readiness checks.",
    ],
    tags: ["Next.js", "Node.js", "AWS"],
  },
];

export const DEFAULT_RADIAL_STATS: RadialStat[] = [
  { label: "Years", value: "8+", progress: 82 },
  { label: "Success", value: "98%", progress: 98 },
  { label: "On-Time", value: "95%", progress: 95 },
  { label: "Uptime SLA", value: "99.9%", progress: 99.9 },
];

const parseRoleCompany = (rawCompany: string, fallbackRole: string) => {
  const separators = [" at ", " @ ", " - ", " | "];

  for (const separator of separators) {
    const [left, right] = rawCompany.split(separator).map((part) => part.trim());
    if (left && right) {
      return {
        role: left,
        company: right,
      };
    }
  }

  return {
    role: fallbackRole,
    company: rawCompany,
  };
};

const hashFromSeed = (seed: string): string => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(16).padStart(7, "0").slice(0, 7);
};

const numericProgress = (value: string, fallback: number): number => {
  const parsed = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(parsed)) return fallback;

  if (value.includes("%")) {
    return Math.min(100, Math.max(0, parsed));
  }

  return Math.min(100, Math.max(18, parsed * 10));
};

export const buildAboutFacts = (params: {
  summary: string;
  subtitle: string;
  educationDetails: string;
}): AboutFact[] => {
  const facts: AboutFact[] = [
    {
      id: "about-01",
      label: "01. about",
      heading: "About",
      body:
        params.summary ||
        "I build durable product systems with a strong bias for clarity, speed, and maintainability.",
    },
    {
      id: "about-02",
      label: "02. bio",
      heading: "Bio",
      body:
        params.subtitle ||
        "I care about architecture, UI quality, and delivery processes that scale cleanly.",
    },
  ];

  if (params.educationDetails) {
    facts.push({
      id: "about-03",
      label: "03. education",
      heading: "Education",
      body: params.educationDetails,
    });
  }

  return facts;
};

export const mapStatsToRadials = (stats: SectionStat[]): RadialStat[] => {
  if (!stats.length) return DEFAULT_RADIAL_STATS;

  return stats.slice(0, 4).map((stat, index) => {
    const fallback = DEFAULT_RADIAL_STATS[index] ?? DEFAULT_RADIAL_STATS[0];
    return {
      label: stat.label || fallback.label,
      value: stat.value || fallback.value,
      progress: numericProgress(stat.value || "", fallback.progress),
    };
  });
};

export const mapExperienceItemsToTimeline = (
  items: ExperienceItem[],
  fallbackRole: string
): TimelineExperienceEntry[] => {
  if (!items.length) return DEFAULT_TIMELINE_ENTRIES;

  return items.map((item, index) => {
    const parsed = parseRoleCompany(item.company || "Company", fallbackRole);

    return {
      id: `timeline-${index + 1}`,
      commit: hashFromSeed(`${item.company}-${item.employedDates}-${index}`),
      role: parsed.role,
      company: parsed.company,
      range: item.employedDates || "Present",
      bullets: item.bullets.length
        ? item.bullets
        : ["Delivered high-impact engineering work across product and platform."],
      tags: item.tags.length ? item.tags : ["Engineering"],
    };
  });
};
