import { ParsedResume } from "@/constants/ResumeFormat";
import { TemplateConfig } from "@/lib/template-config";
import { EditorCanvasStateV1 } from "@/lib/editor-canvas";

export type CustomSectionType =
  | "header"
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "contact";

export type CustomSectionLayout = "default" | "centered" | "split" | "cards";

export interface CustomSectionStyle {
  fontSize?: "small" | "medium" | "large";
  fontWeight?: "normal" | "medium" | "bold";
  spacing?: "compact" | "normal" | "spacious";
}

export interface CustomLayoutSection {
  id: string;
  type: CustomSectionType;
  layout: CustomSectionLayout;
  visible: boolean;
  style?: CustomSectionStyle;
}

export interface CustomLayoutTemplateV1 {
  schema_version: 1;
  template_type: "foliage_custom_layout";
  exported_at: string;
  settings: {
    selected_color: string;
    display_mode: "light" | "dark";
  };
  sections: CustomLayoutSection[];
}

export interface PortfolioDataWithCustomTemplate extends ParsedResume {
  __custom_template?: CustomLayoutTemplateV1;
  __template_config?: TemplateConfig;
  __editor_canvas?: EditorCanvasStateV1;
}

export function buildCustomLayoutTemplate(params: {
  sections: CustomLayoutSection[];
  selectedColor: string;
  displayMode: "light" | "dark";
}): CustomLayoutTemplateV1 {
  return {
    schema_version: 1,
    template_type: "foliage_custom_layout",
    exported_at: new Date().toISOString(),
    settings: {
      selected_color: params.selectedColor,
      display_mode: params.displayMode,
    },
    sections: params.sections,
  };
}

export function serializeCustomLayoutTemplate(
  template: CustomLayoutTemplateV1
): string {
  return JSON.stringify(template, null, 2);
}

export function tryParseCustomLayoutTemplate(
  value: string | null
): CustomLayoutTemplateV1 | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<CustomLayoutTemplateV1>;
    const hasValidSettings =
      !!parsed.settings &&
      typeof parsed.settings.selected_color === "string" &&
      (parsed.settings.display_mode === "light" ||
        parsed.settings.display_mode === "dark");

    if (
      parsed.schema_version === 1 &&
      parsed.template_type === "foliage_custom_layout" &&
      Array.isArray(parsed.sections) &&
      hasValidSettings
    ) {
      return parsed as CustomLayoutTemplateV1;
    }
  } catch {
    return null;
  }

  return null;
}
