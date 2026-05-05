import type { ParsedResume } from "@/constants/ResumeFormat";
import {
  buildBlogPreview,
  buildStats,
  buildTestimonials,
  categorizeSkills,
  normalizeExperience,
  normalizeOverview,
  normalizePersonalInfo,
  normalizeProjects,
} from "@/components/PortfolioTemplates/shared/portfolioData";
import {
  SectionType,
  type AboutSectionContent,
  type BlogSectionContent,
  type BuiltInTemplateId,
  type CertificationsSectionContent,
  type ContactSectionContent,
  type EducationItem,
  type EducationSectionContent,
  type ExperienceSectionContent,
  type HeroSectionContent,
  type ProjectsSectionContent,
  type ProjectItem,
  type ResumeTemplateInput,
  type SectionConfig,
  type SectionConfigFor,
  type SectionContentByType,
  type SectionLibraryEntry,
  type SkillsSectionContent,
  type TemplateConfig,
  type TemplateId,
  type TemplateThemeConfig,
  TEMPLATE_CONFIG_SCHEMA_VERSION,
  type TestimonialsSectionContent,
} from "@/lib/template-config-types";

const TEMPLATE_THEME_DEFAULTS: Record<BuiltInTemplateId, TemplateThemeConfig> = {
  "1": {
    palette: "modern-minimal",
    mode: "dark",
    primaryColor: "#ef4444",
    backgroundColor: "#0a0a0a",
  },
  "2": {
    palette: "classic-professional",
    mode: "light",
    primaryColor: "#1d4ed8",
    backgroundColor: "#f8fafc",
  },
  "3": {
    palette: "creative-bold",
    mode: "dark",
    primaryColor: "#ef4444",
    backgroundColor: "#111111",
  },
  "4": {
    palette: "elegant-sophisticated",
    mode: "dark",
    primaryColor: "#d4af37",
    backgroundColor: "#111111",
  },
  "5": {
    palette: "side-rail-pro",
    mode: "light",
    primaryColor: "#0f766e",
    backgroundColor: "#f8fafc",
  },
  "6": {
    palette: "editorial-story",
    mode: "light",
    primaryColor: "#7c2d12",
    backgroundColor: "#fdfbf7",
  },
  "7": {
    palette: "ide-clean",
    mode: "dark",
    primaryColor: "#22d3ee",
    backgroundColor: "#0b1221",
  },
  "8": {
    palette: "debug-template",
    mode: "light",
    primaryColor: "#f59e0b",
    backgroundColor: "#fffdf7",
  },
  "9": {
    palette: "bold-brand",
    mode: "dark",
    primaryColor: "#ff4d6d",
    backgroundColor: "#0b0b14",
  },
  "10": {
    palette: "minimal-creator-hub",
    mode: "light",
    primaryColor: "#16a34a",
    backgroundColor: "#f7faf7",
  },
};

const DEFAULT_SECTION_ORDER: SectionType[] = [
  SectionType.Hero,
  SectionType.About,
  SectionType.Experience,
  SectionType.Skills,
  SectionType.Projects,
  SectionType.Contact,
];

const CORE_REQUIRED_SECTION_TYPES: SectionType[] = [
  SectionType.Hero,
  SectionType.About,
  SectionType.Experience,
  SectionType.Skills,
  SectionType.Contact,
];

const DEPRECATED_SECTION_TYPES = new Set<SectionType>([
  SectionType.Blog,
  SectionType.Testimonials,
]);

const TITLE_BY_TYPE: Record<SectionType, string> = {
  [SectionType.Hero]: "Hero",
  [SectionType.About]: "About",
  [SectionType.Projects]: "Projects",
  [SectionType.Skills]: "Skills",
  [SectionType.Experience]: "Experience",
  [SectionType.Education]: "Education",
  [SectionType.Certifications]: "Certifications",
  [SectionType.Blog]: "Blog",
  [SectionType.Testimonials]: "Testimonials",
  [SectionType.Contact]: "Contact",
};

const SUBTITLE_BY_TYPE: Record<SectionType, string> = {
  [SectionType.Hero]: "",
  [SectionType.About]: "Focused on clean architecture, thoughtful interfaces, and scalable delivery.",
  [SectionType.Projects]: "Selected product and engineering work with measurable outcomes.",
  [SectionType.Skills]: "Core technologies grouped by discipline for quick scanning.",
  [SectionType.Experience]: "Career highlights with outcome-focused details.",
  [SectionType.Education]: "Academic background and relevant focus areas.",
  [SectionType.Certifications]: "Professional credentials and continuing education.",
  [SectionType.Blog]: "Writing focused on engineering process, product tradeoffs, and delivery lessons.",
  [SectionType.Testimonials]: "Feedback from collaborators across product, engineering, and leadership teams.",
  [SectionType.Contact]: "Interested in working together? Let's build something meaningful.",
};

const VARIANT_BY_TEMPLATE: Record<BuiltInTemplateId, Partial<Record<SectionType, string>>> = {
  "1": {
    [SectionType.Hero]: "modern-split",
    [SectionType.Projects]: "feature-grid",
    [SectionType.Contact]: "cta-stack",
  },
  "2": {
    [SectionType.Hero]: "classic-formal",
    [SectionType.Projects]: "stacked-cards",
    [SectionType.Contact]: "inline-links",
  },
  "3": {
    [SectionType.Hero]: "bold-gradient",
    [SectionType.Projects]: "mosaic",
    [SectionType.Contact]: "glass-card",
  },
  "4": {
    [SectionType.Hero]: "lux-serif",
    [SectionType.Projects]: "elevated-grid",
    [SectionType.Contact]: "signature-card",
  },
  "5": {
    [SectionType.Hero]: "identity-rail",
    [SectionType.Projects]: "stacked-feature-rows",
    [SectionType.Contact]: "rail-contact",
  },
  "6": {
    [SectionType.Hero]: "editorial-feature",
    [SectionType.Projects]: "case-study-columns",
    [SectionType.Contact]: "letter-signoff",
  },
  "7": {
    [SectionType.Hero]: "terminal-banner",
    [SectionType.Projects]: "panel-cards",
    [SectionType.Contact]: "inline-terminal",
  },
  "8": {
    [SectionType.Hero]: "narrative-intro",
    [SectionType.Experience]: "vertical-timeline",
    [SectionType.Contact]: "timeline-footer",
  },
  "9": {
    [SectionType.Hero]: "oversized-brand",
    [SectionType.Projects]: "hero-cards",
    [SectionType.Contact]: "bold-cta",
  },
  "10": {
    [SectionType.Hero]: "creator-compact",
    [SectionType.Skills]: "uses-grid",
    [SectionType.Contact]: "minimal-links",
  },
};

export const SECTION_LIBRARY: SectionLibraryEntry[] = [
  {
    type: SectionType.Hero,
    label: "Hero",
    description: "Primary headline, role, and intro copy.",
    allowMultiple: false,
  },
  {
    type: SectionType.About,
    label: "About",
    description: "Narrative summary with optional stats.",
    allowMultiple: false,
  },
  {
    type: SectionType.Projects,
    label: "Projects",
    description: "Project cards with links and highlights.",
    allowMultiple: true,
  },
  {
    type: SectionType.Skills,
    label: "Skills",
    description: "Skill groups or tags for quick scanning.",
    allowMultiple: false,
  },
  {
    type: SectionType.Experience,
    label: "Experience",
    description: "Work timeline with impact bullets.",
    allowMultiple: true,
  },
  {
    type: SectionType.Education,
    label: "Education",
    description: "Education entries and study details.",
    allowMultiple: false,
  },
  {
    type: SectionType.Certifications,
    label: "Certifications",
    description: "Certifications and credentials.",
    allowMultiple: true,
  },
  {
    type: SectionType.Contact,
    label: "Contact",
    description: "Contact links and CTA.",
    allowMultiple: false,
  },
];

const sanitizeHexColor = (value: string | undefined, fallback: string): string => {
  if (!value) return fallback;

  const normalized = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) return normalized;

  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    const [, r, g, b] = normalized;
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return fallback;
};

const templateThemeFor = (templateId: TemplateId): TemplateThemeConfig => {
  const key = String(templateId) as BuiltInTemplateId;
  return TEMPLATE_THEME_DEFAULTS[key] ?? TEMPLATE_THEME_DEFAULTS["1"];
};

const createSection = <T extends SectionType>(section: {
  id: string;
  type: T;
  enabled?: boolean;
  navLabel?: string;
  variant?: string;
  style?: Record<string, unknown>;
  props?: Record<string, unknown>;
  content: SectionContentByType[T];
}): SectionConfigFor<T> => {
  return {
    id: section.id,
    type: section.type,
    enabled: section.enabled ?? true,
    navLabel: section.navLabel || defaultNavLabel(section.type),
    variant: section.variant,
    style: section.style as SectionConfigFor<T>["style"],
    props: section.props,
    content: section.content,
  } as SectionConfigFor<T>;
};

export const getSectionLabel = (type: SectionType): string => TITLE_BY_TYPE[type];

const stringifyEducation = (education: EducationItem): string => {
  const parts = [
    ...education.majors,
    ...education.minors.map((minor) => `Minor: ${minor}`),
    education.expectedGrad ? `Expected ${education.expectedGrad}` : "",
  ].filter(Boolean);

  return parts.join(" | ");
};

const fallbackSectionId = (type: SectionType, index: number) => `${type}-${index + 1}`;

const defaultNavLabel = (type: SectionType): string => {
  if (type === SectionType.Hero) return "Home";
  return TITLE_BY_TYPE[type];
};

export function buildParsedResumeFromTemplateInput(
  input: ResumeTemplateInput
): ParsedResume {
  const personal = normalizePersonalInfo(input.personalInformation);
  const overview = normalizeOverview(input.overviewData);

  return {
    resume_pdf: "",
    portfolio_id: "",
    personal_information: personal,
    overview,
    projects: (input.projects ?? []).map((project) => ({
      title: project?.title ?? "Project",
      description: project?.description ?? "",
    })),
    skills: (input.skills ?? []).filter(Boolean),
    experience: (input.experience ?? []).map((entry) => ({
      company: entry?.company ?? "Company",
      description: entry?.description ?? "",
      employed_dates: entry?.employed_dates ?? "",
    })),
  };
}

const coerceArray = <T>(value: unknown, fallback: T[]): T[] => {
  return Array.isArray(value) ? (value as T[]) : fallback;
};

const asNonEmptyString = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : fallback;
};

const normalizeTextLine = (value: string): string => value.replace(/\s+/g, " ").trim();

const toComparableText = (value: string): string =>
  normalizeTextLine(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "");

const pickConciseDescription = (value: string): string => {
  const compact = normalizeTextLine(value);
  if (!compact) return "";

  const sentenceMatch = compact.match(/^.+?[.!?](?=\s|$)/);
  if (sentenceMatch) return sentenceMatch[0].trim();

  return compact;
};

const truncateWords = (value: string, maxWords: number): string => {
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value;
  return `${words.slice(0, maxWords).join(" ").replace(/[.,;:!?]+$/, "")}...`;
};

const resolveHeroSummary = (params: {
  seededHeroSummary?: string;
  overviewHeroSummary?: string;
  overviewResumeSummary?: string;
}): string => {
  const directCandidate = normalizeTextLine(params.seededHeroSummary || params.overviewHeroSummary || "");
  if (directCandidate) {
    return truncateWords(pickConciseDescription(directCandidate) || directCandidate, 22);
  }

  const resumeSummary = normalizeTextLine(params.overviewResumeSummary || "");
  if (!resumeSummary) return "";

  return truncateWords(pickConciseDescription(resumeSummary) || resumeSummary, 22);
};

const sanitizeProjectNarrative = (project: ProjectItem): ProjectItem => {
  const rawDescription = normalizeTextLine(project.description || "");
  const rawHighlights = (project.highlights ?? []).map((highlight) => normalizeTextLine(highlight)).filter(Boolean);
  const description = pickConciseDescription(rawDescription || rawHighlights[0] || "");
  const descriptionComparable = toComparableText(description);

  const highlights: string[] = [];
  const seen = new Set<string>();

  for (const highlight of rawHighlights) {
    const comparable = toComparableText(highlight);
    if (!comparable || seen.has(comparable)) continue;

    const overlapsDescription =
      descriptionComparable &&
      (comparable === descriptionComparable ||
        comparable.includes(descriptionComparable) ||
        descriptionComparable.includes(comparable));

    if (overlapsDescription) continue;

    seen.add(comparable);
    highlights.push(highlight);
    if (highlights.length >= 3) break;
  }

  return {
    ...project,
    description,
    highlights,
  };
};

export function createEmptySectionContent(type: SectionType): SectionContentByType[SectionType] {
  switch (type) {
    case SectionType.Hero:
      return {
        title: TITLE_BY_TYPE[type],
        eyebrow: "Portfolio",
        fullName: "Your Name",
        careerName: "",
        summary: "Write a concise value statement about your work and impact.",
        primaryCtaLabel: "Explore Projects",
        secondaryCtaLabel: "Copy Email",
      };
    case SectionType.About:
      return {
        title: TITLE_BY_TYPE[type],
        subtitle: SUBTITLE_BY_TYPE[type],
        summary: "Add a short professional summary.",
        educationLabel: "Education",
        educationDetails: "",
        stats: [
          { label: "Experience", value: "0+ Years" },
          { label: "Projects", value: "0+" },
        ],
      };
    case SectionType.Projects:
      return {
        title: TITLE_BY_TYPE[type],
        subtitle: SUBTITLE_BY_TYPE[type],
        items: [],
      };
    case SectionType.Skills:
      return {
        title: TITLE_BY_TYPE[type],
        subtitle: SUBTITLE_BY_TYPE[type],
        categories: [],
      };
    case SectionType.Experience:
      return {
        title: TITLE_BY_TYPE[type],
        subtitle: SUBTITLE_BY_TYPE[type],
        items: [],
      };
    case SectionType.Education:
      return {
        title: TITLE_BY_TYPE[type],
        subtitle: SUBTITLE_BY_TYPE[type],
        entries: [
          {
            school: "University",
            majors: ["Major"],
            minors: [],
            expectedGrad: "",
          },
        ],
      };
    case SectionType.Certifications:
      return {
        title: TITLE_BY_TYPE[type],
        subtitle: SUBTITLE_BY_TYPE[type],
        entries: [
          {
            name: "Certification Name",
            issuer: "Issuer",
            year: "",
          },
        ],
      };
    case SectionType.Blog:
      return {
        title: TITLE_BY_TYPE[type],
        subtitle: SUBTITLE_BY_TYPE[type],
        date: "",
        readingTime: "",
        postTitle: "Featured article title",
        excerpt: "Write a short summary of your featured post.",
        tags: ["Engineering"],
        ctaLabel: "View all posts",
      };
    case SectionType.Testimonials:
      return {
        title: TITLE_BY_TYPE[type],
        subtitle: SUBTITLE_BY_TYPE[type],
        items: [
          {
            quote: "Add a testimonial quote.",
            author: "Author Name",
            role: "Role",
            company: "Company",
          },
        ],
      };
    case SectionType.Contact:
      return {
        title: TITLE_BY_TYPE[type],
        subtitle: SUBTITLE_BY_TYPE[type],
        email: "hello@example.com",
        phone: "",
        address: "",
        linkedin: "",
        ctaLabel: "Send me an email",
      };
    default:
      return {
        title: "Section",
        subtitle: "",
      } as SectionContentByType[SectionType];
  }
}

const buildContentFromResume = (resumeData?: ParsedResume) => {
  const normalizedSeed = resumeData?.__normalized_seed;
  const seededSections = normalizedSeed?.sections;
  const personal = normalizePersonalInfo(resumeData?.personal_information);
  const overview = normalizeOverview(resumeData?.overview);
  const heroSummary = resolveHeroSummary({
    seededHeroSummary: seededSections?.hero?.summary,
    overviewHeroSummary: overview.hero_summary,
    overviewResumeSummary: overview.resume_summary,
  });
  const skillList = (resumeData?.skills ?? []).filter(Boolean);
  const projectsSource =
    seededSections?.projects?.items?.map((project) => ({
      title: project.title,
      description: project.description,
      highlights: project.highlights,
      tags: project.tags,
      links: {
        demo: project.links.demo || undefined,
        code: project.links.code || undefined,
      },
    })) ?? normalizeProjects(resumeData?.projects, skillList);
  const projectsList = projectsSource.map((project) => sanitizeProjectNarrative(project));
  const experienceList =
    seededSections?.experience?.items?.map((item) => ({
      company: item.company,
      employedDates: item.employedDates,
      bullets: item.bullets,
      tags: [],
    })) ??
    normalizeExperience(resumeData?.experience, skillList).map((item) => ({
      ...item,
      tags: [],
    }));
  const skillGroups =
    seededSections?.skills?.categories?.map((category) => ({
      title: category.title,
      skills: category.skills,
    })) ?? categorizeSkills(skillList);
  const stats = buildStats(projectsList, experienceList, skillList, overview);
  const blog = buildBlogPreview(projectsList, overview);
  const testimonials = buildTestimonials(personal.full_name, overview.career_name);

  const primaryEducation: EducationItem = {
    school: personal.education.school || "",
    majors: personal.education.majors || [],
    minors: personal.education.minors || [],
    expectedGrad: personal.education.expected_grad || "",
  };

  const educationDetails = stringifyEducation(primaryEducation);

  return {
    hero: {
      title: TITLE_BY_TYPE[SectionType.Hero],
      eyebrow: "Portfolio",
      fullName: seededSections?.hero?.fullName || personal.full_name,
      careerName: seededSections?.hero?.careerName || overview.career_name,
      summary: heroSummary,
      primaryCtaLabel: "Explore Projects",
      secondaryCtaLabel: personal.contact_info.email ? "Copy Email" : "Send Email",
    } satisfies HeroSectionContent,
    about: {
      title: TITLE_BY_TYPE[SectionType.About],
      subtitle: SUBTITLE_BY_TYPE[SectionType.About],
      summary: seededSections?.about?.summary || overview.resume_summary,
      educationLabel: seededSections?.about?.educationLabel || primaryEducation.school || "Education",
      educationDetails: seededSections?.about?.educationDetails ?? educationDetails,
      stats,
    } satisfies AboutSectionContent,
    projects: {
      title: TITLE_BY_TYPE[SectionType.Projects],
      subtitle: SUBTITLE_BY_TYPE[SectionType.Projects],
      items: projectsList,
    } satisfies ProjectsSectionContent,
    skills: {
      title: TITLE_BY_TYPE[SectionType.Skills],
      subtitle: SUBTITLE_BY_TYPE[SectionType.Skills],
      categories: skillGroups,
    } satisfies SkillsSectionContent,
    experience: {
      title: TITLE_BY_TYPE[SectionType.Experience],
      subtitle: SUBTITLE_BY_TYPE[SectionType.Experience],
      items: experienceList,
    } satisfies ExperienceSectionContent,
    education: {
      title: TITLE_BY_TYPE[SectionType.Education],
      subtitle: SUBTITLE_BY_TYPE[SectionType.Education],
      entries: primaryEducation.school || educationDetails ? [primaryEducation] : [],
    } satisfies EducationSectionContent,
    certifications: {
      title: TITLE_BY_TYPE[SectionType.Certifications],
      subtitle: SUBTITLE_BY_TYPE[SectionType.Certifications],
      entries: [],
    } satisfies CertificationsSectionContent,
    blog: {
      title: TITLE_BY_TYPE[SectionType.Blog],
      subtitle: SUBTITLE_BY_TYPE[SectionType.Blog],
      date: blog.date,
      readingTime: blog.readingTime,
      postTitle: blog.title,
      excerpt: blog.excerpt,
      tags: blog.tags,
      ctaLabel: "View all posts",
    } satisfies BlogSectionContent,
    testimonials: {
      title: TITLE_BY_TYPE[SectionType.Testimonials],
      subtitle: SUBTITLE_BY_TYPE[SectionType.Testimonials],
      items: testimonials,
    } satisfies TestimonialsSectionContent,
    contact: {
      title: TITLE_BY_TYPE[SectionType.Contact],
      subtitle: SUBTITLE_BY_TYPE[SectionType.Contact],
      email: seededSections?.contact?.email || personal.contact_info.email,
      phone: seededSections?.contact?.phone || personal.contact_info.phone,
      address: seededSections?.contact?.address || personal.contact_info.address,
      linkedin: seededSections?.contact?.linkedin || personal.contact_info.linkedin,
      ctaLabel: "Send me an email",
    } satisfies ContactSectionContent,
  };
};

const buildDefaultSections = (templateId: TemplateId, resumeData?: ParsedResume): SectionConfig[] => {
  const builtInId = String(templateId) as BuiltInTemplateId;
  const variants = VARIANT_BY_TEMPLATE[builtInId] ?? {};
  const content = buildContentFromResume(resumeData);
  const seededProjectsPresence = resumeData?.__normalized_seed?.section_presence?.projects;
  const shouldIncludeProjects =
    typeof seededProjectsPresence === "boolean"
      ? seededProjectsPresence
      : content.projects.items.length > 0;

  const sections: SectionConfig[] = [
    createSection({
      id: fallbackSectionId(SectionType.Hero, 0),
      type: SectionType.Hero,
      variant: variants[SectionType.Hero],
      content: content.hero,
    }),
    createSection({
      id: fallbackSectionId(SectionType.About, 0),
      type: SectionType.About,
      variant: variants[SectionType.About],
      content: content.about,
    }),
    createSection({
      id: fallbackSectionId(SectionType.Experience, 0),
      type: SectionType.Experience,
      variant: variants[SectionType.Experience],
      content: content.experience,
    }),
    createSection({
      id: fallbackSectionId(SectionType.Skills, 0),
      type: SectionType.Skills,
      variant: variants[SectionType.Skills],
      content: content.skills,
    }),
  ];

  if (shouldIncludeProjects) {
    sections.push(
      createSection({
        id: fallbackSectionId(SectionType.Projects, 0),
        type: SectionType.Projects,
        variant: variants[SectionType.Projects],
        content: content.projects,
      })
    );
  }

  sections.push(
    createSection({
      id: fallbackSectionId(SectionType.Contact, 0),
      type: SectionType.Contact,
      variant: variants[SectionType.Contact],
      content: content.contact,
    })
  );

  return sections;
};

export function createDefaultTemplateConfig(params: {
  templateId: TemplateId;
  resumeData?: ParsedResume;
  themeOverride?: Partial<TemplateThemeConfig>;
}): TemplateConfig {
  const baseTheme = templateThemeFor(params.templateId);
  const mergedTheme: TemplateThemeConfig = {
    ...baseTheme,
    ...params.themeOverride,
    primaryColor: sanitizeHexColor(params.themeOverride?.primaryColor, baseTheme.primaryColor),
    backgroundColor: sanitizeHexColor(params.themeOverride?.backgroundColor, baseTheme.backgroundColor),
    mode:
      params.themeOverride?.mode === "light" || params.themeOverride?.mode === "dark"
        ? params.themeOverride.mode
        : baseTheme.mode,
    palette: params.themeOverride?.palette ?? baseTheme.palette,
  };

  return {
    schema_version: TEMPLATE_CONFIG_SCHEMA_VERSION,
    templateId: params.templateId,
    theme: mergedTheme,
    sections: buildDefaultSections(params.templateId, params.resumeData),
  };
}

export function createSectionConfig(params: {
  templateId: TemplateId;
  type: SectionType;
  existingSections: SectionConfig[];
  resumeData?: ParsedResume;
}): SectionConfig {
  const countForType = params.existingSections.filter((section) => section.type === params.type).length;
  const builtInId = String(params.templateId) as BuiltInTemplateId;
  const variant = VARIANT_BY_TEMPLATE[builtInId]?.[params.type];

  const starterProject: ProjectItem = {
    title: "New Project",
    description: "Describe the project.",
    highlights: ["Key result"],
    tags: [],
    links: {},
  };

  const seed = buildContentFromResume(params.resumeData);
  let content = createEmptySectionContent(params.type) as SectionContentByType[typeof params.type];

  switch (params.type) {
    case SectionType.Projects: {
      const isFirstProjectsSection = countForType === 0;
      const projects =
        isFirstProjectsSection && seed.projects.items.length > 0
          ? seed.projects.items
          : [starterProject];
      content = {
        ...seed.projects,
        items: projects,
      } as SectionContentByType[typeof params.type];
      break;
    }
    case SectionType.Education:
      content =
        seed.education.entries.length > 0
          ? (seed.education as SectionContentByType[typeof params.type])
          : content;
      break;
    default:
      break;
  }

  return createSection({
    id: fallbackSectionId(params.type, countForType),
    type: params.type,
    variant,
    content,
  });
}

export function canAddSectionType(config: TemplateConfig, type: SectionType): boolean {
  if (DEPRECATED_SECTION_TYPES.has(type)) return false;

  const entry = SECTION_LIBRARY.find((candidate) => candidate.type === type);
  if (!entry) return false;
  if (entry.allowMultiple) return true;
  return !config.sections.some((section) => section.type === type);
}

export function getAddableSectionTypes(config: TemplateConfig): SectionLibraryEntry[] {
  return SECTION_LIBRARY.filter((entry) => canAddSectionType(config, entry.type));
}

export function getEnabledSections(config: TemplateConfig): SectionConfig[] {
  return config.sections.filter(
    (section) => section.enabled && hasRenderableSectionContent(section)
  );
}

export function hasRenderableSectionContent(section: SectionConfig): boolean {
  if (DEPRECATED_SECTION_TYPES.has(section.type)) return false;

  switch (section.type) {
    case SectionType.Projects:
      return (section.content as ProjectsSectionContent).items.length > 0;
    default:
      return true;
  }
}

export function getNavSections(config: TemplateConfig): Array<{ id: string; label: string }> {
  return getEnabledSections(config)
    .filter((section) => DEFAULT_SECTION_ORDER.includes(section.type))
    .map((section) => ({
      id: section.id,
      label: getSectionLabel(section.type),
    }));
}

export function validateTemplateConfig(config: TemplateConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.templateId) {
    errors.push("templateId is required");
  }
  if (!Number.isInteger(config.schema_version) || config.schema_version <= 0) {
    errors.push("schema_version must be a positive integer");
  }

  if (!config.theme) {
    errors.push("theme is required");
  }

  if (!Array.isArray(config.sections) || !config.sections.length) {
    errors.push("sections must be a non-empty array");
  }

  config.sections.forEach((section, index) => {
    if (!section.id) {
      errors.push(`sections[${index}].id is required`);
    }

    if (!Object.values(SectionType).includes(section.type)) {
      errors.push(`sections[${index}].type is invalid`);
    }

    if (typeof section.enabled !== "boolean") {
      errors.push(`sections[${index}].enabled must be boolean`);
    }

    if (section.navLabel !== undefined && typeof section.navLabel !== "string") {
      errors.push(`sections[${index}].navLabel must be string when provided`);
    }
    if (section.style !== undefined && typeof section.style !== "object") {
      errors.push(`sections[${index}].style must be object when provided`);
    }
    if (section.props !== undefined && typeof section.props !== "object") {
      errors.push(`sections[${index}].props must be object when provided`);
    }

    if (!section.content || typeof section.content !== "object") {
      errors.push(`sections[${index}].content is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

const normalizeSectionContent = (section: SectionConfig): SectionConfig => {
  switch (section.type) {
    case SectionType.Hero: {
      const fallback = createEmptySectionContent(section.type) as HeroSectionContent;
      const raw = section.content as Partial<HeroSectionContent>;
      return {
        ...section,
        content: {
          title: asNonEmptyString(raw.title, fallback.title),
          eyebrow: asNonEmptyString(raw.eyebrow, fallback.eyebrow),
          fullName: asNonEmptyString(raw.fullName, fallback.fullName),
          careerName: asNonEmptyString(raw.careerName, fallback.careerName),
          summary: asNonEmptyString(raw.summary, fallback.summary),
          primaryCtaLabel: asNonEmptyString(raw.primaryCtaLabel, fallback.primaryCtaLabel),
          secondaryCtaLabel: asNonEmptyString(raw.secondaryCtaLabel, fallback.secondaryCtaLabel),
        },
      };
    }
    case SectionType.About: {
      const fallback = createEmptySectionContent(section.type) as AboutSectionContent;
      const raw = section.content as Partial<AboutSectionContent>;
      const stats = coerceArray(raw.stats, fallback.stats).map((stat) => ({
        label: asNonEmptyString(stat?.label, "Label"),
        value: asNonEmptyString(stat?.value, "Value"),
      }));

      return {
        ...section,
        content: {
          title: asNonEmptyString(raw.title, fallback.title),
          subtitle: asNonEmptyString(raw.subtitle, fallback.subtitle),
          summary: asNonEmptyString(raw.summary, fallback.summary),
          educationLabel: asNonEmptyString(raw.educationLabel, fallback.educationLabel),
          educationDetails: typeof raw.educationDetails === "string" ? raw.educationDetails : fallback.educationDetails,
          stats,
        },
      };
    }
    case SectionType.Projects: {
      const fallback = createEmptySectionContent(section.type) as ProjectsSectionContent;
      const raw = section.content as Partial<ProjectsSectionContent>;
      const items = coerceArray(raw.items, fallback.items).map((item) => ({
        title: asNonEmptyString(item?.title, "Project"),
        description: asNonEmptyString(item?.description, "Project description"),
        highlights: coerceArray(item?.highlights, ["Project highlight"])
          .map((highlight) => asNonEmptyString(highlight, "Project highlight"))
          .filter(Boolean),
        tags: coerceArray(item?.tags, []).map((tag) => asNonEmptyString(tag, "")),
        links: {
          demo: typeof item?.links?.demo === "string" ? item.links.demo : undefined,
          code: typeof item?.links?.code === "string" ? item.links.code : undefined,
        },
      }));

      return {
        ...section,
        content: {
          title: asNonEmptyString(raw.title, fallback.title),
          subtitle: asNonEmptyString(raw.subtitle, fallback.subtitle),
          items,
        },
      };
    }
    case SectionType.Skills: {
      const fallback = createEmptySectionContent(section.type) as SkillsSectionContent;
      const raw = section.content as Partial<SkillsSectionContent>;
      const categories = coerceArray(raw.categories, fallback.categories).map((category) => ({
        title: asNonEmptyString(category?.title, "Skills"),
        skills: coerceArray(category?.skills, []).map((skill) => asNonEmptyString(skill, "")),
      }));

      return {
        ...section,
        content: {
          title: asNonEmptyString(raw.title, fallback.title),
          subtitle: asNonEmptyString(raw.subtitle, fallback.subtitle),
          categories,
        },
      };
    }
    case SectionType.Experience: {
      const fallback = createEmptySectionContent(section.type) as ExperienceSectionContent;
      const raw = section.content as Partial<ExperienceSectionContent>;
      const items = coerceArray(raw.items, fallback.items).map((item) => ({
        company: asNonEmptyString(item?.company, "Company"),
        employedDates: typeof item?.employedDates === "string" ? item.employedDates : "",
        bullets: coerceArray(item?.bullets, ["Impact bullet"]).map((bullet) => asNonEmptyString(bullet, "Impact bullet")),
        tags: [],
      }));

      return {
        ...section,
        content: {
          title: asNonEmptyString(raw.title, fallback.title),
          subtitle: asNonEmptyString(raw.subtitle, fallback.subtitle),
          items,
        },
      };
    }
    case SectionType.Education: {
      const fallback = createEmptySectionContent(section.type) as EducationSectionContent;
      const raw = section.content as Partial<EducationSectionContent>;
      const entries = coerceArray(raw.entries, fallback.entries).map((entry) => ({
        school: asNonEmptyString(entry?.school, "School"),
        majors: coerceArray(entry?.majors, []).map((major) => asNonEmptyString(major, "")),
        minors: coerceArray(entry?.minors, []).map((minor) => asNonEmptyString(minor, "")),
        expectedGrad: typeof entry?.expectedGrad === "string" ? entry.expectedGrad : "",
      }));

      return {
        ...section,
        content: {
          title: asNonEmptyString(raw.title, fallback.title),
          subtitle: asNonEmptyString(raw.subtitle, fallback.subtitle),
          entries,
        },
      };
    }
    case SectionType.Certifications: {
      const fallback = createEmptySectionContent(section.type) as CertificationsSectionContent;
      const raw = section.content as Partial<CertificationsSectionContent>;
      const entries = coerceArray(raw.entries, fallback.entries).map((entry) => ({
        name: asNonEmptyString(entry?.name, "Certification"),
        issuer: typeof entry?.issuer === "string" ? entry.issuer : "",
        year: typeof entry?.year === "string" ? entry.year : "",
      }));

      return {
        ...section,
        content: {
          title: asNonEmptyString(raw.title, fallback.title),
          subtitle: asNonEmptyString(raw.subtitle, fallback.subtitle),
          entries,
        },
      };
    }
    case SectionType.Blog: {
      const fallback = createEmptySectionContent(section.type) as BlogSectionContent;
      const raw = section.content as Partial<BlogSectionContent>;

      return {
        ...section,
        content: {
          title: asNonEmptyString(raw.title, fallback.title),
          subtitle: asNonEmptyString(raw.subtitle, fallback.subtitle),
          date: typeof raw.date === "string" ? raw.date : "",
          readingTime: typeof raw.readingTime === "string" ? raw.readingTime : "",
          postTitle: asNonEmptyString(raw.postTitle, fallback.postTitle),
          excerpt: asNonEmptyString(raw.excerpt, fallback.excerpt),
          tags: coerceArray(raw.tags, fallback.tags).map((tag) => asNonEmptyString(tag, "")),
          ctaLabel: asNonEmptyString(raw.ctaLabel, fallback.ctaLabel),
        },
      };
    }
    case SectionType.Testimonials: {
      const fallback = createEmptySectionContent(section.type) as TestimonialsSectionContent;
      const raw = section.content as Partial<TestimonialsSectionContent>;
      const items = coerceArray(raw.items, fallback.items).map((item) => ({
        quote: asNonEmptyString(item?.quote, "Strong execution and collaboration."),
        author: asNonEmptyString(item?.author, "Anonymous"),
        role: typeof item?.role === "string" ? item.role : "",
        company: typeof item?.company === "string" ? item.company : "",
      }));

      return {
        ...section,
        content: {
          title: asNonEmptyString(raw.title, fallback.title),
          subtitle: asNonEmptyString(raw.subtitle, fallback.subtitle),
          items,
        },
      };
    }
    case SectionType.Contact: {
      const fallback = createEmptySectionContent(section.type) as ContactSectionContent;
      const raw = section.content as Partial<ContactSectionContent>;

      return {
        ...section,
        content: {
          title: asNonEmptyString(raw.title, fallback.title),
          subtitle: asNonEmptyString(raw.subtitle, fallback.subtitle),
          email: typeof raw.email === "string" ? raw.email : "",
          phone: typeof raw.phone === "string" ? raw.phone : "",
          address: typeof raw.address === "string" ? raw.address : "",
          linkedin: typeof raw.linkedin === "string" ? raw.linkedin : "",
          ctaLabel: asNonEmptyString(raw.ctaLabel, fallback.ctaLabel),
        },
      };
    }
    default:
      return section;
  }
};

const appendMissingCoreSections = (
  sections: SectionConfig[],
  fallbackSections: SectionConfig[]
): SectionConfig[] => {
  const nextSections = [...sections];
  const sectionIds = new Set(nextSections.map((section) => section.id));

  CORE_REQUIRED_SECTION_TYPES.forEach((type) => {
    if (nextSections.some((section) => section.type === type)) {
      return;
    }

    const fallback =
      fallbackSections.find((section) => section.type === type) ??
      createSection({
        id: fallbackSectionId(type, nextSections.length),
        type,
        content: createEmptySectionContent(type) as SectionContentByType[typeof type],
      });

    let nextId = fallback.id;
    let attempt = 1;
    while (sectionIds.has(nextId)) {
      nextId = `${fallback.id}-restored-${attempt}`;
      attempt += 1;
    }

    sectionIds.add(nextId);
    nextSections.push({ ...fallback, id: nextId });
  });

  return nextSections;
};

export function normalizeTemplateConfig(params: {
  templateId: TemplateId;
  resumeData?: ParsedResume;
  config?: TemplateConfig | null;
  fallbackTheme?: Partial<TemplateThemeConfig>;
}): TemplateConfig {
  const defaultConfig = createDefaultTemplateConfig({
    templateId: params.templateId,
    resumeData: params.resumeData,
    themeOverride: params.fallbackTheme,
  });

  if (!params.config) return defaultConfig;

  const theme = {
    ...defaultConfig.theme,
    ...params.config.theme,
    primaryColor: sanitizeHexColor(params.config.theme?.primaryColor, defaultConfig.theme.primaryColor),
    backgroundColor: sanitizeHexColor(params.config.theme?.backgroundColor, defaultConfig.theme.backgroundColor),
    mode:
      params.config.theme?.mode === "light" || params.config.theme?.mode === "dark"
        ? params.config.theme.mode
        : defaultConfig.theme.mode,
    palette: params.config.theme?.palette || defaultConfig.theme.palette,
  };

  const sections = (Array.isArray(params.config.sections) ? params.config.sections : defaultConfig.sections)
    .filter(
      (section): section is SectionConfig =>
        Boolean(section && section.type && section.id) && !DEPRECATED_SECTION_TYPES.has(section.type)
    )
    .map((section, index) => {
      const normalizedSection: SectionConfig = {
        ...section,
        id: section.id || fallbackSectionId(section.type, index),
        enabled: typeof section.enabled === "boolean" ? section.enabled : true,
        navLabel:
          typeof section.navLabel === "string" && section.navLabel.trim()
            ? section.navLabel.trim()
            : defaultNavLabel(section.type),
        style:
          section.style && typeof section.style === "object"
            ? (section.style as SectionConfig["style"])
            : undefined,
        props:
          section.props && typeof section.props === "object"
            ? (section.props as SectionConfig["props"])
            : undefined,
      };

      return normalizeSectionContent(normalizedSection);
    });
  const sectionsWithCoreDefaults = appendMissingCoreSections(sections, defaultConfig.sections);

  return {
    schema_version:
      Number.isInteger(params.config.schema_version) && (params.config.schema_version as number) > 0
        ? (params.config.schema_version as number)
        : TEMPLATE_CONFIG_SCHEMA_VERSION,
    templateId: params.templateId,
    theme,
    sections: sectionsWithCoreDefaults.length ? sectionsWithCoreDefaults : defaultConfig.sections,
    user_template_id:
      typeof params.config.user_template_id === "string" && params.config.user_template_id.trim()
        ? params.config.user_template_id
        : undefined,
  };
}

export function withSectionEnabledState(
  sections: SectionConfig[],
  sectionId: string,
  enabled: boolean
): SectionConfig[] {
  return sections.map((section) => (section.id === sectionId ? { ...section, enabled } : section));
}

export function reorderSections(
  sections: SectionConfig[],
  draggedId: string,
  targetId: string
): SectionConfig[] {
  if (draggedId === targetId) return sections;

  const from = sections.findIndex((section) => section.id === draggedId);
  const to = sections.findIndex((section) => section.id === targetId);
  if (from < 0 || to < 0) return sections;

  const next = [...sections];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function updateSectionContent<T extends SectionType>(
  sections: SectionConfig[],
  sectionId: string,
  nextContent: Partial<SectionContentByType[T]>
): SectionConfig[] {
  return sections.map((section) => {
    if (section.id !== sectionId) return section;

    return {
      ...section,
      content: ({
        ...(section.content as unknown as Record<string, unknown>),
        ...(nextContent as unknown as Record<string, unknown>),
      } as unknown) as SectionContentByType[T],
    } as SectionConfig;
  });
}

export function ensureSectionOrder(sections: SectionConfig[]): SectionConfig[] {
  return [...sections].sort((a, b) => {
    const aOrder = DEFAULT_SECTION_ORDER.indexOf(a.type);
    const bOrder = DEFAULT_SECTION_ORDER.indexOf(b.type);
    return (aOrder === -1 ? DEFAULT_SECTION_ORDER.length : aOrder) - (bOrder === -1 ? DEFAULT_SECTION_ORDER.length : bOrder);
  });
}

export function sectionTitle(section: SectionConfig): string {
  const resolvedTitle = (section.content as { title?: unknown }).title;
  if (typeof resolvedTitle === "string" && resolvedTitle.trim()) {
    return resolvedTitle;
  }

  return TITLE_BY_TYPE[section.type as SectionType] || "Section";
}

export function serializeTemplateConfig(config: TemplateConfig): string {
  return JSON.stringify(config);
}

export function deserializeTemplateConfig(value: string | null): TemplateConfig | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as TemplateConfig;
  } catch {
    return null;
  }
}
