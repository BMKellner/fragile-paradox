import { ParsedResume } from "@/constants/ResumeFormat";
import { TemplateConfig } from "@/lib/template-config";

export type CustomSectionType =
  | "header"
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "contact";

export type CustomSectionLayout = "default" | "centered" | "split" | "cards";
export type CustomLayoutMode = "stack" | "grid";
export type CustomFontFamily =
  | "inter"
  | "lora"
  | "space-grotesk"
  | "ibm-plex-sans"
  | "jetbrains-mono";

export const CUSTOM_FONT_STACKS: Record<CustomFontFamily, string> = {
  inter: '"Inter", "Segoe UI", Roboto, sans-serif',
  lora: '"Lora", "Georgia", "Times New Roman", serif',
  "space-grotesk": '"Space Grotesk", "Avenir Next", "Segoe UI", sans-serif',
  "ibm-plex-sans": '"IBM Plex Sans", "Segoe UI", Roboto, sans-serif',
  "jetbrains-mono": '"JetBrains Mono", "IBM Plex Mono", "SFMono-Regular", monospace',
};

export const CUSTOM_FONT_OPTIONS: Array<{ id: CustomFontFamily; label: string }> = [
  { id: "inter", label: "Inter Sans" },
  { id: "lora", label: "Lora Serif" },
  { id: "space-grotesk", label: "Space Grotesk" },
  { id: "ibm-plex-sans", label: "IBM Plex Sans" },
  { id: "jetbrains-mono", label: "JetBrains Mono" },
];

export interface CustomSectionStyle {
  fontSize?: "small" | "medium" | "large";
  fontWeight?: "normal" | "medium" | "bold";
  spacing?: "compact" | "normal" | "spacious";
  fontFamily?: CustomFontFamily;
  widthPercent?: number;
  minHeightPx?: number;
  scale?: number;
  gridRow?: number;
  gridOrder?: number;
  gridColumnSpan?: number;
  gridRowSpan?: number;
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

export interface CustomLayoutTemplateV2 {
  schema_version: 2;
  template_type: "foliage_custom_layout";
  exported_at: string;
  settings: {
    selected_color: string;
    display_mode: "light" | "dark";
    font_family: CustomFontFamily;
    layout_mode: CustomLayoutMode;
    grid_columns: number;
    grid_gap: number;
    section_scale: number;
  };
  sections: CustomLayoutSection[];
}

export type CustomLayoutTemplate = CustomLayoutTemplateV2;

export interface PortfolioDataWithCustomTemplate extends ParsedResume {
  __custom_template?: CustomLayoutTemplateV1 | CustomLayoutTemplateV2;
  __template_config?: TemplateConfig;
}

export const DEFAULT_CUSTOM_LAYOUT_SECTIONS: CustomLayoutSection[] = [
  {
    id: "header-1",
    type: "header",
    layout: "default",
    visible: true,
  },
  {
    id: "about-1",
    type: "about",
    layout: "default",
    visible: true,
  },
  {
    id: "experience-1",
    type: "experience",
    layout: "cards",
    visible: true,
    style: { gridColumnSpan: 2 },
  },
  {
    id: "projects-1",
    type: "projects",
    layout: "cards",
    visible: true,
    style: { gridColumnSpan: 2 },
  },
  {
    id: "skills-1",
    type: "skills",
    layout: "cards",
    visible: true,
  },
  {
    id: "education-1",
    type: "education",
    layout: "default",
    visible: true,
  },
  {
    id: "contact-1",
    type: "contact",
    layout: "split",
    visible: true,
    style: { gridColumnSpan: 2 },
  },
];

export const DEFAULT_CUSTOM_LAYOUT_SETTINGS: CustomLayoutTemplateV2["settings"] = {
  selected_color: "#2563EB",
  display_mode: "light",
  font_family: "inter",
  layout_mode: "stack",
  grid_columns: 2,
  grid_gap: 20,
  section_scale: 1,
};

const VALID_SECTION_TYPES = new Set<CustomSectionType>([
  "header",
  "about",
  "experience",
  "projects",
  "skills",
  "education",
  "contact",
]);

const VALID_SECTION_LAYOUTS = new Set<CustomSectionLayout>([
  "default",
  "centered",
  "split",
  "cards",
]);

const VALID_FONT_SIZES = new Set<NonNullable<CustomSectionStyle["fontSize"]>>([
  "small",
  "medium",
  "large",
]);

const VALID_FONT_WEIGHTS = new Set<NonNullable<CustomSectionStyle["fontWeight"]>>([
  "normal",
  "medium",
  "bold",
]);

const VALID_SPACING = new Set<NonNullable<CustomSectionStyle["spacing"]>>([
  "compact",
  "normal",
  "spacious",
]);

const VALID_FONT_FAMILIES = new Set<CustomFontFamily>(
  Object.keys(CUSTOM_FONT_STACKS) as CustomFontFamily[]
);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const asNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const asString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeColor = (value: unknown, fallback: string): string => {
  const stringValue = asString(value);
  if (!stringValue) return fallback;

  if (/^#[0-9a-fA-F]{6}$/.test(stringValue)) return stringValue;
  if (/^#[0-9a-fA-F]{3}$/.test(stringValue)) {
    const [, r, g, b] = stringValue;
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return fallback;
};

const normalizeSettings = (
  settings: Partial<CustomLayoutTemplateV2["settings"]> | undefined,
  fallback: CustomLayoutTemplateV2["settings"] = DEFAULT_CUSTOM_LAYOUT_SETTINGS
): CustomLayoutTemplateV2["settings"] => {
  const fontFamily =
    settings?.font_family && VALID_FONT_FAMILIES.has(settings.font_family)
      ? settings.font_family
      : fallback.font_family;

  const layoutMode =
    settings?.layout_mode === "grid" || settings?.layout_mode === "stack"
      ? settings.layout_mode
      : fallback.layout_mode;

  return {
    selected_color: normalizeColor(settings?.selected_color, fallback.selected_color),
    display_mode: settings?.display_mode === "dark" ? "dark" : "light",
    font_family: fontFamily,
    layout_mode: layoutMode,
    grid_columns: clamp(Math.round(asNumber(settings?.grid_columns, fallback.grid_columns)), 1, 4),
    grid_gap: clamp(Math.round(asNumber(settings?.grid_gap, fallback.grid_gap)), 8, 56),
    section_scale: clamp(asNumber(settings?.section_scale, fallback.section_scale), 0.75, 1.5),
  };
};

const normalizeSectionStyle = (
  style: CustomSectionStyle | null | undefined,
  maxGridColumns: number,
  fallbackIndex: number
): CustomSectionStyle => {
  const safeColumns = Math.max(1, maxGridColumns);
  const fallbackRow = Math.floor(fallbackIndex / safeColumns) + 1;
  const fallbackOrder = (fallbackIndex % safeColumns) + 1;

  return {
    fontSize: style?.fontSize && VALID_FONT_SIZES.has(style.fontSize) ? style.fontSize : "medium",
    fontWeight:
      style?.fontWeight && VALID_FONT_WEIGHTS.has(style.fontWeight)
        ? style.fontWeight
        : "normal",
    spacing: style?.spacing && VALID_SPACING.has(style.spacing) ? style.spacing : "normal",
    fontFamily:
      style?.fontFamily && VALID_FONT_FAMILIES.has(style.fontFamily)
        ? style.fontFamily
        : undefined,
    widthPercent: clamp(Math.round(asNumber(style?.widthPercent, 100)), 5, 100),
    minHeightPx: clamp(Math.round(asNumber(style?.minHeightPx, 160)), 100, 640),
    scale: clamp(asNumber(style?.scale, 1), 0.75, 1.5),
    gridRow: clamp(Math.round(asNumber(style?.gridRow, fallbackRow)), 1, 99),
    gridOrder: clamp(Math.round(asNumber(style?.gridOrder, fallbackOrder)), 1, 999),
    gridColumnSpan: clamp(Math.round(asNumber(style?.gridColumnSpan, 1)), 1, maxGridColumns),
    gridRowSpan: clamp(Math.round(asNumber(style?.gridRowSpan, 1)), 1, 6),
  };
};

const normalizeSection = (
  section: unknown,
  index: number,
  maxGridColumns: number
): CustomLayoutSection => {
  const raw = isRecord(section) ? (section as Partial<CustomLayoutSection>) : {};
  const safeType = raw.type && VALID_SECTION_TYPES.has(raw.type) ? raw.type : "about";
  const safeId = asString(raw.id) || `${safeType}-${index + 1}`;
  const rawLayout = typeof raw.layout === "string" ? raw.layout : undefined;

  return {
    id: safeId,
    type: safeType,
    layout:
      rawLayout && VALID_SECTION_LAYOUTS.has(rawLayout as CustomSectionLayout)
        ? (rawLayout as CustomSectionLayout)
        : "default",
    visible: typeof raw.visible === "boolean" ? raw.visible : true,
    style: normalizeSectionStyle(raw.style ?? undefined, maxGridColumns, index),
  };
};

const normalizeSections = (
  sections: CustomLayoutSection[] | undefined,
  maxGridColumns: number
): CustomLayoutSection[] => {
  const source = Array.isArray(sections) && sections.length ? sections : DEFAULT_CUSTOM_LAYOUT_SECTIONS;
  return source.map((section, index) => normalizeSection(section, index, maxGridColumns));
};

const upgradeV1ToV2 = (template: CustomLayoutTemplateV1): CustomLayoutTemplateV2 => {
  const normalizedSettings = normalizeSettings({
    selected_color: template.settings?.selected_color,
    display_mode: template.settings?.display_mode,
  });

  return {
    schema_version: 2,
    template_type: "foliage_custom_layout",
    exported_at: asString(template.exported_at) || new Date().toISOString(),
    settings: normalizedSettings,
    sections: normalizeSections(template.sections, normalizedSettings.grid_columns),
  };
};

export function buildCustomLayoutTemplate(params: {
  sections: CustomLayoutSection[];
  selectedColor: string;
  displayMode: "light" | "dark";
  settings?: Partial<CustomLayoutTemplateV2["settings"]>;
}): CustomLayoutTemplateV2 {
  const settings = normalizeSettings({
    ...params.settings,
    selected_color: params.selectedColor,
    display_mode: params.displayMode,
  });

  return {
    schema_version: 2,
    template_type: "foliage_custom_layout",
    exported_at: new Date().toISOString(),
    settings,
    sections: normalizeSections(params.sections, settings.grid_columns),
  };
}

export function serializeCustomLayoutTemplate(
  template: CustomLayoutTemplate
): string {
  return JSON.stringify(template, null, 2);
}

export function tryParseCustomLayoutTemplate(
  value: string | null
): CustomLayoutTemplate | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as
      | Partial<CustomLayoutTemplateV1>
      | Partial<CustomLayoutTemplateV2>;

    if (parsed?.template_type !== "foliage_custom_layout") {
      return null;
    }

    if (parsed.schema_version === 2) {
      const settings = normalizeSettings(
        (parsed.settings as Partial<CustomLayoutTemplateV2["settings"]> | undefined) ?? undefined
      );

      return {
        schema_version: 2,
        template_type: "foliage_custom_layout",
        exported_at: asString(parsed.exported_at) || new Date().toISOString(),
        settings,
        sections: normalizeSections(
          Array.isArray(parsed.sections) ? (parsed.sections as CustomLayoutSection[]) : undefined,
          settings.grid_columns
        ),
      };
    }

    if (parsed.schema_version === 1) {
      const legacy = parsed as CustomLayoutTemplateV1;
      if (!Array.isArray(legacy.sections) || !legacy.settings) return null;
      return upgradeV1ToV2(legacy);
    }
  } catch {
    return null;
  }

  return null;
}
