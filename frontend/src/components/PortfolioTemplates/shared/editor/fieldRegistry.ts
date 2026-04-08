import {
  SectionType,
  type SectionConfig,
  type SectionContentByType,
  type TemplateConfig,
} from "@/lib/template-config";
import type { CanvasEditorField } from "@/components/PortfolioTemplates/shared/editor/types";

const asText = (value: unknown): string => (typeof value === "string" ? value : "");

const heroFields = (
  content: SectionContentByType[SectionType.Hero],
  navLabel: string
): CanvasEditorField[] => [
  { path: "navLabel", label: "Nav Label", value: navLabel },
  { path: "content.eyebrow", label: "Eyebrow", value: asText(content.eyebrow) },
  { path: "content.fullName", label: "Full Name", value: asText(content.fullName) },
  { path: "content.careerName", label: "Career Name", value: asText(content.careerName) },
  { path: "content.summary", label: "Summary", value: asText(content.summary), multiline: true },
];

const commonTitleFields = (
  navLabel: string,
  title: unknown,
  subtitle: unknown
): CanvasEditorField[] => [
  { path: "navLabel", label: "Nav Label", value: navLabel },
  { path: "content.title", label: "Section Title", value: asText(title) },
  {
    path: "content.subtitle",
    label: "Section Subtitle",
    value: asText(subtitle),
    multiline: true,
  },
];

export function getSectionEditableFields(section: SectionConfig): CanvasEditorField[] {
  const navLabel = section.navLabel ?? "";
  switch (section.type) {
    case SectionType.Hero:
      return heroFields(section.content, navLabel);
    case SectionType.About:
    case SectionType.Projects:
    case SectionType.Skills:
    case SectionType.Experience:
    case SectionType.Education:
    case SectionType.Certifications:
    case SectionType.Blog:
    case SectionType.Testimonials:
    case SectionType.Contact:
      return commonTitleFields(
        navLabel,
        (section.content as { title?: unknown }).title,
        (section.content as { subtitle?: unknown }).subtitle
      );
    default:
      return [{ path: "navLabel", label: "Nav Label", value: navLabel }];
  }
}

export function updateSectionField(
  config: TemplateConfig,
  sectionId: string,
  fieldPath: string,
  value: string
): TemplateConfig {
  const pathParts = fieldPath.split(".");
  if (!pathParts.length) return config;

  return {
    ...config,
    sections: config.sections.map((section) => {
      if (section.id !== sectionId) return section;

      if (fieldPath === "navLabel") {
        return { ...section, navLabel: value };
      }

      const draft: Record<string, unknown> = {
        ...section,
        content: { ...((section.content as unknown) as Record<string, unknown>) },
      };

      let cursor: Record<string, unknown> = draft;
      for (let i = 0; i < pathParts.length - 1; i += 1) {
        const key = pathParts[i];
        const current = cursor[key];
        if (typeof current !== "object" || current === null || Array.isArray(current)) {
          cursor[key] = {};
        }
        cursor = cursor[key] as Record<string, unknown>;
      }

      cursor[pathParts[pathParts.length - 1]] = value;
      return draft as SectionConfig;
    }),
  };
}

