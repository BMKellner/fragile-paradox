import type {
  Experience,
  OverviewData,
  PersonalInformation,
  Project,
} from "@/constants/ResumeFormat";

export type BuiltInTemplateId =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10";
export type TemplateId = BuiltInTemplateId | string;

export enum SectionType {
  Hero = "hero",
  About = "about",
  Projects = "projects",
  Skills = "skills",
  Experience = "experience",
  Education = "education",
  Certifications = "certifications",
  Blog = "blog",
  Testimonials = "testimonials",
  Contact = "contact",
}

export type ThemeMode = "light" | "dark";

export interface TemplateThemeConfig {
  palette: string;
  mode: ThemeMode;
  primaryColor: string;
  backgroundColor: string;
}

export type SectionStat = {
  label: string;
  value: string;
};

export type ProjectItem = {
  title: string;
  description: string;
  highlights: string[];
  tags: string[];
  links: {
    demo?: string;
    code?: string;
  };
};

export type SkillCategoryContent = {
  title: string;
  skills: string[];
};

export type ExperienceItem = {
  company: string;
  employedDates: string;
  bullets: string[];
  tags: string[];
};

export type EducationItem = {
  school: string;
  majors: string[];
  minors: string[];
  expectedGrad: string;
};

export type CertificationItem = {
  name: string;
  issuer: string;
  year: string;
};

export type TestimonialItem = {
  quote: string;
  author: string;
  role: string;
  company: string;
};

export interface HeroSectionContent {
  title: string;
  eyebrow: string;
  fullName: string;
  careerName: string;
  summary: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
}

export interface AboutSectionContent {
  title: string;
  subtitle: string;
  summary: string;
  educationLabel: string;
  educationDetails: string;
  stats: SectionStat[];
}

export interface ProjectsSectionContent {
  title: string;
  subtitle: string;
  items: ProjectItem[];
}

export interface SkillsSectionContent {
  title: string;
  subtitle: string;
  categories: SkillCategoryContent[];
}

export interface ExperienceSectionContent {
  title: string;
  subtitle: string;
  items: ExperienceItem[];
}

export interface EducationSectionContent {
  title: string;
  subtitle: string;
  entries: EducationItem[];
}

export interface CertificationsSectionContent {
  title: string;
  subtitle: string;
  entries: CertificationItem[];
}

export interface BlogSectionContent {
  title: string;
  subtitle: string;
  date: string;
  readingTime: string;
  postTitle: string;
  excerpt: string;
  tags: string[];
  ctaLabel: string;
}

export interface TestimonialsSectionContent {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

export interface ContactSectionContent {
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  ctaLabel: string;
}

export type SectionContentByType = {
  [SectionType.Hero]: HeroSectionContent;
  [SectionType.About]: AboutSectionContent;
  [SectionType.Projects]: ProjectsSectionContent;
  [SectionType.Skills]: SkillsSectionContent;
  [SectionType.Experience]: ExperienceSectionContent;
  [SectionType.Education]: EducationSectionContent;
  [SectionType.Certifications]: CertificationsSectionContent;
  [SectionType.Blog]: BlogSectionContent;
  [SectionType.Testimonials]: TestimonialsSectionContent;
  [SectionType.Contact]: ContactSectionContent;
};

export type SectionConfig = {
  [K in SectionType]: {
    id: string;
    type: K;
    enabled: boolean;
    navLabel?: string;
    variant?: string;
    content: SectionContentByType[K];
  };
}[SectionType];

export type SectionConfigFor<T extends SectionType> = Extract<SectionConfig, { type: T }>;

export interface TemplateConfig {
  templateId: TemplateId;
  theme: TemplateThemeConfig;
  sections: SectionConfig[];
}

export interface SectionLibraryEntry {
  type: SectionType;
  label: string;
  description: string;
  allowMultiple: boolean;
}

export interface ResumeTemplateInput {
  personalInformation?: PersonalInformation;
  overviewData?: OverviewData;
  projects?: Project[];
  experience?: Experience[];
  skills?: string[];
}
