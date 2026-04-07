import type {
  Experience,
  OverviewData,
  PersonalInformation,
  Project,
} from "@/constants/ResumeFormat";
import type { TemplateConfig } from "@/lib/template-config-types";

export type ModernMinimalistProps = {
  personalInformation?: PersonalInformation;
  overviewData?: OverviewData;
  projects?: Project[];
  experience?: Experience[];
  skills?: string[];
  mainColor?: string;
  backgroundColor?: string;
  templateConfig?: TemplateConfig;
};

export type TabKey =
  | "home"
  | "about"
  | "projects"
  | "skills"
  | "experience"
  | "blog"
  | "testimonials"
  | "contact";

export type SectionTab = {
  id: TabKey;
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
  description: string;
  employedDates: string;
  bullets: string[];
  tags: string[];
};

export type SkillCategory = {
  title: string;
  skills: string[];
};

export type PortfolioStats = {
  yearsExperience: string;
  projectCount: string;
  specialization: string;
  impact: string;
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
  wide?: boolean;
};
