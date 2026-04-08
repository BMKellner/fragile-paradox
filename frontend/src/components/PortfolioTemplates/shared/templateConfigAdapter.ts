import type { Experience, OverviewData, PersonalInformation, Project } from "@/constants/ResumeFormat";
import {
  type SectionConfig,
  SectionType,
  type TemplateConfig,
  type TemplateId,
  buildParsedResumeFromTemplateInput,
  hasRenderableSectionContent,
  normalizeTemplateConfig,
  type SectionConfigFor,
} from "@/lib/template-config";

type TemplateConfigInput = {
  templateId: TemplateId;
  templateConfig?: TemplateConfig;
  personalInformation?: PersonalInformation;
  overviewData?: OverviewData;
  projects?: Project[];
  experience?: Experience[];
  skills?: string[];
  mainColor?: string;
  backgroundColor?: string;
};

const modeFromBackground = (backgroundColor?: string): "light" | "dark" | undefined => {
  if (!backgroundColor) return undefined;

  const color = backgroundColor.trim();
  const fullHex =
    /^#[0-9a-fA-F]{3}$/.test(color)
      ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
      : color;

  if (!/^#[0-9a-fA-F]{6}$/.test(fullHex)) return undefined;

  const r = Number.parseInt(fullHex.slice(1, 3), 16);
  const g = Number.parseInt(fullHex.slice(3, 5), 16);
  const b = Number.parseInt(fullHex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 180 ? "light" : "dark";
};

export const resolveTemplateConfigFromProps = (
  input: TemplateConfigInput
): TemplateConfig => {
  const resumeData = buildParsedResumeFromTemplateInput({
    personalInformation: input.personalInformation,
    overviewData: input.overviewData,
    projects: input.projects,
    experience: input.experience,
    skills: input.skills,
  });

  return normalizeTemplateConfig({
    templateId: input.templateId,
    resumeData,
    config: input.templateConfig,
    fallbackTheme: {
      primaryColor: input.mainColor,
      backgroundColor: input.backgroundColor,
      mode: modeFromBackground(input.backgroundColor),
    },
  });
};

export const enabledSections = (config: TemplateConfig): SectionConfig[] => {
  return config.sections.filter(
    (section) => section.enabled && hasRenderableSectionContent(section)
  );
};

export const firstSectionOfType = <T extends SectionType>(
  config: TemplateConfig,
  type: T
): SectionConfigFor<T> | undefined => {
  return config.sections.find(
    (section): section is SectionConfigFor<T> =>
      section.type === type &&
      section.enabled &&
      hasRenderableSectionContent(section)
  );
};

export const sectionOfType = <T extends SectionType>(
  section: SectionConfig,
  type: T
): section is SectionConfigFor<T> => {
  return section.type === type;
};
