"use client";

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ChangeEvent,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";
import { ParsedResume } from "@/constants/ResumeFormat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Globe, ArrowLeft, Loader2, Save, Check, X, Upload } from "lucide-react";
import Header from "@/components/Header";
import {
  buildCustomLayoutTemplate,
  CUSTOM_FONT_OPTIONS,
  CUSTOM_FONT_STACKS,
  DEFAULT_CUSTOM_LAYOUT_SECTIONS,
  DEFAULT_CUSTOM_LAYOUT_SETTINGS,
  serializeCustomLayoutTemplate,
  tryParseCustomLayoutTemplate,
  type CustomFontFamily,
  type CustomLayoutMode,
  type CustomLayoutSection,
  type CustomLayoutTemplate,
  type PortfolioDataWithCustomTemplate,
} from "@/lib/custom-template";
import {
  deserializeTemplateConfig,
  normalizeTemplateConfig,
  serializeTemplateConfig,
  type TemplateConfig,
} from "@/lib/template-config";
import { fetchTemplateConfig, saveTemplateConfig } from "@/lib/template-config-api";

// personalInformation={personal_information}
//          overviewData={overview_data}
//          experience={experience_data}
//          skills={skills_data}
//          projects={projects_data}
//          mainColor={selectedColor}
//          backgroundColor={backgroundColor}

type TemplateComponentProps = {
  personalInformation?: ParsedResume["personal_information"];
  overviewData?: ParsedResume["overview"];
  projects?: ParsedResume["projects"];
  experience?: ParsedResume["experience"];
  skills?: ParsedResume["skills"];
  mainColor: string;
  backgroundColor: string;
  templateConfig?: TemplateConfig;
};

const templateLoadFallback = () => (
  <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-sm text-muted-foreground">
    Loading portfolio template...
  </div>
);

const templateComponentMap: Record<string, ComponentType<TemplateComponentProps>> = {
  "1": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/ModernMinimalist"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "2": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/ClassicProfessional"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "3": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/CreativeBold"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "4": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/ElegantSophisticated"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "5": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/SideRailPro"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "6": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/EditorialStory"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "7": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/IDEClean"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "8": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/TimelineNarrative"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "9": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/BoldBrand"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "10": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/MinimalCreatorHub"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
};

const LIGHT_DISPLAY_BG = "#F8FAFC";
const DARK_DISPLAY_BG = "#111111";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const modeToBackground = (mode: "light" | "dark"): string =>
  mode === "light" ? LIGHT_DISPLAY_BG : DARK_DISPLAY_BG;

const fontSizeClasses = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
} as const;

const headingSizeClasses = {
  small: "text-xl",
  medium: "text-2xl",
  large: "text-4xl",
} as const;

const spacingClasses = {
  compact: "space-y-2",
  normal: "space-y-4",
  spacious: "space-y-8",
} as const;

const fontWeightClasses = {
  normal: "font-normal",
  medium: "font-medium",
  bold: "font-bold",
} as const;

const sectionLabelByType: Record<CustomLayoutSection["type"], string> = {
  header: "Header",
  about: "About",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  education: "Education",
  contact: "Contact",
};

type CustomEditorTarget =
  | {
      kind: "global";
      panel: "theme" | "typography" | "layout";
    }
  | {
      kind: "section";
      sectionId: string;
    };

type ResizeDragState = {
  sectionId: string;
  gridRow: number;
  startX: number;
  startY: number;
  startWidthPercent: number;
  startMinHeightPx: number;
  layoutMode: CustomLayoutMode;
  containerWidth: number;
};

const normalizeLegacySections = (value: string | null): CustomLayoutSection[] | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as CustomLayoutSection[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const buildDefaultCustomLayout = (params?: {
  selectedColor?: string;
  displayMode?: "light" | "dark";
}): CustomLayoutTemplate =>
  buildCustomLayoutTemplate({
    sections: DEFAULT_CUSTOM_LAYOUT_SECTIONS,
    selectedColor: params?.selectedColor ?? DEFAULT_CUSTOM_LAYOUT_SETTINGS.selected_color,
    displayMode: params?.displayMode ?? DEFAULT_CUSTOM_LAYOUT_SETTINGS.display_mode,
    settings: {
      ...DEFAULT_CUSTOM_LAYOUT_SETTINGS,
      selected_color: params?.selectedColor ?? DEFAULT_CUSTOM_LAYOUT_SETTINGS.selected_color,
      display_mode: params?.displayMode ?? DEFAULT_CUSTOM_LAYOUT_SETTINGS.display_mode,
    },
  });

const sectionGridRow = (section: CustomLayoutSection, fallbackIndex: number): number =>
  clamp(Math.round(section.style?.gridRow ?? fallbackIndex + 1), 1, 99);

const sectionGridOrder = (section: CustomLayoutSection, fallbackIndex: number): number =>
  clamp(Math.round(section.style?.gridOrder ?? fallbackIndex + 1), 1, 999);

const sectionWidthPercent = (
  section: CustomLayoutSection,
  rowSize: number
): number => clamp(section.style?.widthPercent ?? Math.floor(100 / Math.max(rowSize, 1)), 5, 100);

const normalizeGridWidths = (sections: CustomLayoutSection[]): CustomLayoutSection[] => {
  if (!sections.length) return sections;

  const rowBuckets = new Map<number, CustomLayoutSection[]>();
  sections.forEach((section, index) => {
    const row = sectionGridRow(section, index);
    const bucket = rowBuckets.get(row) ?? [];
    bucket.push(section);
    rowBuckets.set(row, bucket);
  });

  const rowWidthById = new Map<string, number>();
  rowBuckets.forEach((rowSections) => {
    const widths = rowSections.map((section) => sectionWidthPercent(section, rowSections.length));
    const total = widths.reduce((sum, width) => sum + width, 0) || 1;
    rowSections.forEach((section, index) => {
      rowWidthById.set(section.id, Math.max(5, (widths[index] / total) * 100));
    });
  });

  return sections.map((section, index) => ({
    ...section,
    style: {
      ...section.style,
      gridRow: sectionGridRow(section, index),
      gridOrder: sectionGridOrder(section, index),
      widthPercent: rowWidthById.get(section.id) ?? sectionWidthPercent(section, 1),
    },
  }));
};

const sortSectionsForGrid = (sections: CustomLayoutSection[]): CustomLayoutSection[] =>
  [...normalizeGridWidths(sections)].sort((a, b) => {
    const rowDiff = sectionGridRow(a, 0) - sectionGridRow(b, 0);
    if (rowDiff !== 0) return rowDiff;
    return sectionGridOrder(a, 0) - sectionGridOrder(b, 0);
  });

const CustomTemplateRender = ({
  resumeData,
  mainColor,
  backgroundColor,
  layoutTemplate,
  isEditing = false,
  selectedSectionId,
  onSelectSection,
  onResizeSection,
}: {
  resumeData: ParsedResume;
  mainColor: string;
  backgroundColor: string;
  layoutTemplate: CustomLayoutTemplate;
  isEditing?: boolean;
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  onResizeSection?: (sectionId: string, patch: Partial<CustomLayoutSection["style"]>) => void;
}) => {
  const visibleSections = layoutTemplate.sections.filter((section) => section.visible);
  const sortedGridSections = sortSectionsForGrid(visibleSections);
  const gridRows = sortedGridSections.reduce<Array<{ row: number; sections: CustomLayoutSection[] }>>(
    (rows, section, index) => {
      const row = sectionGridRow(section, index);
      const existing = rows.find((entry) => entry.row === row);
      if (existing) {
        existing.sections.push(section);
      } else {
        rows.push({ row, sections: [section] });
      }
      return rows;
    },
    []
  );
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const resizeStateRef = useRef<ResizeDragState | null>(null);

  useEffect(() => {
    if (!isEditing || !onResizeSection) return;

    const onMouseMove = (event: MouseEvent) => {
      const state = resizeStateRef.current;
      if (!state) return;

      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;

      if (state.layoutMode === "stack") {
        const nextWidth = clamp(
          state.startWidthPercent + (deltaX / Math.max(state.containerWidth, 1)) * 100,
          35,
          100
        );
        const nextMinHeight = clamp(state.startMinHeightPx + deltaY, 100, 640);
        onResizeSection(state.sectionId, {
          widthPercent: Math.round(nextWidth),
          minHeightPx: Math.round(nextMinHeight),
        });
      } else {
        const nextWidth = clamp(
          state.startWidthPercent + (deltaX / Math.max(state.containerWidth, 1)) * 100,
          5,
          95
        );
        const nextMinHeight = clamp(state.startMinHeightPx + deltaY, 100, 640);
        onResizeSection(state.sectionId, {
          widthPercent: Math.round(nextWidth),
          gridRow: state.gridRow,
          minHeightPx: Math.round(nextMinHeight),
        });
      }
    };

    const onMouseUp = () => {
      resizeStateRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isEditing, onResizeSection]);

  const startResize = (
    event: ReactMouseEvent<HTMLButtonElement>,
    section: CustomLayoutSection,
    row: number,
    currentWidthPercent: number
  ) => {
    if (!isEditing || !onResizeSection || !canvasRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    const sectionStyle = section.style ?? {};
    resizeStateRef.current = {
      sectionId: section.id,
      gridRow: row,
      startX: event.clientX,
      startY: event.clientY,
      startWidthPercent: currentWidthPercent,
      startMinHeightPx: sectionStyle.minHeightPx ?? 160,
      layoutMode: layoutTemplate.settings.layout_mode,
      containerWidth: canvasRef.current.clientWidth,
    };
    document.body.style.cursor = "nwse-resize";
    document.body.style.userSelect = "none";
  };

  if (visibleSections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 max-w-4xl mx-auto text-center">
        <p className="text-gray-600">No visible sections in this custom layout.</p>
      </div>
    );
  }

  const globalFont = CUSTOM_FONT_STACKS[layoutTemplate.settings.font_family];
  const isGridLayout = layoutTemplate.settings.layout_mode === "grid";

  const renderSectionCard = (
    section: CustomLayoutSection,
    currentWidthPercent: number,
    rowNumber: number
  ) => {
    const sectionStyle = section.style ?? {};
    const fontSize = sectionStyle.fontSize ?? "medium";
    const spacing = sectionStyle.spacing ?? "normal";
    const fontWeight = sectionStyle.fontWeight ?? "normal";
    const scale = clamp(
      (sectionStyle.scale ?? 1) * layoutTemplate.settings.section_scale,
      0.75,
      1.5
    );
    const selected = selectedSectionId === section.id;

    const containerStyle: CSSProperties = {
      borderColor: `${mainColor}33`,
      minHeight: `${Math.round((sectionStyle.minHeightPx ?? 160) * scale)}px`,
      padding: `${Math.round(16 * scale)}px`,
      fontFamily: sectionStyle.fontFamily
        ? CUSTOM_FONT_STACKS[sectionStyle.fontFamily]
        : undefined,
    };

    if (isGridLayout) {
      containerStyle.flex = `${Math.max(currentWidthPercent, 5)} 1 0%`;
    } else {
      containerStyle.width = `${clamp(sectionStyle.widthPercent ?? 100, 35, 100)}%`;
      if (section.layout === "centered") {
        containerStyle.marginInline = "auto";
      }
    }

    const baseClass = `relative rounded-xl border bg-background/70 shadow-sm ${spacingClasses[spacing]}`;
    const selectableClass = isEditing
      ? `cursor-pointer transition-all ${selected ? "ring-2 ring-[var(--color-primary)] ring-offset-2" : "hover:ring-1 hover:ring-[var(--color-primary)]/60"}`
      : "";

    const headerClass = `${headingSizeClasses[fontSize]} ${fontWeightClasses[fontWeight]} mb-4`;
    const textClass = `${fontSizeClasses[fontSize]} ${fontWeightClasses[fontWeight]}`;

    const sectionCommonProps = {
      className: `${baseClass} ${selectableClass}`,
      style: containerStyle,
      onClick: () => {
        if (isEditing) onSelectSection?.(section.id);
      },
    };

    const resizeHandle = isEditing ? (
      <button
        type="button"
        className="absolute bottom-2 right-2 z-10 h-7 w-7 rounded-full border bg-background/90 text-xs text-muted-foreground hover:text-foreground"
        onMouseDown={(event) => startResize(event, section, rowNumber, currentWidthPercent)}
        aria-label={`Resize ${sectionLabelByType[section.type]} section`}
        title="Click and drag to resize"
      >
        ↘
      </button>
    ) : null;

    if (section.type === "header") {
      return (
        <section key={section.id} {...sectionCommonProps}>
          <h1 className={`${headingSizeClasses[fontSize]} font-bold mb-2`} style={{ color: mainColor }}>
            {resumeData.personal_information?.full_name || "Your Name"}
          </h1>
          <p className={`text-muted-foreground ${textClass}`}>
            {resumeData.overview?.career_name || "Your Title"}
          </p>
          {resizeHandle}
        </section>
      );
    }

    if (section.type === "about") {
      return (
        <section key={section.id} {...sectionCommonProps}>
          <h2 className={headerClass} style={{ color: mainColor }}>
            About
          </h2>
          <p className={`text-muted-foreground leading-relaxed ${textClass}`}>
            {resumeData.overview?.resume_summary || "No summary available."}
          </p>
          {resizeHandle}
        </section>
      );
    }

    if (section.type === "experience") {
      return (
        <section key={section.id} {...sectionCommonProps}>
          <h2 className={headerClass} style={{ color: mainColor }}>
            Experience
          </h2>
          <div className={section.layout === "cards" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}>
            {resumeData.experience?.map((exp, i) => (
              <div
                key={`${exp.company}-${i}`}
                className={section.layout === "cards" ? "rounded-md border p-3 bg-background" : ""}
              >
                <h3 className={`font-semibold ${textClass}`}>{exp.company}</h3>
                <p className="text-muted-foreground text-xs">{exp.employed_dates}</p>
                <p className={`mt-2 ${textClass}`}>{exp.description}</p>
              </div>
            ))}
          </div>
          {resizeHandle}
        </section>
      );
    }

    if (section.type === "projects") {
      return (
        <section key={section.id} {...sectionCommonProps}>
          <h2 className={headerClass} style={{ color: mainColor }}>
            Projects
          </h2>
          <div className={section.layout === "cards" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}>
            {resumeData.projects?.map((project, i) => (
              <div
                key={`${project.title}-${i}`}
                className={section.layout === "cards" ? "rounded-md border p-3 bg-background" : ""}
              >
                <h3 className={`font-semibold ${textClass}`} style={{ color: mainColor }}>
                  {project.title}
                </h3>
                <p className={`mt-2 ${textClass}`}>{project.description}</p>
              </div>
            ))}
          </div>
          {resizeHandle}
        </section>
      );
    }

    if (section.type === "skills") {
      return (
        <section key={section.id} {...sectionCommonProps}>
          <h2 className={headerClass} style={{ color: mainColor }}>
            Skills
          </h2>
          <div className={section.layout === "cards" ? "grid grid-cols-2 md:grid-cols-3 gap-2" : "flex flex-wrap gap-2"}>
            {resumeData.skills?.map((skill, i) => (
              <span
                key={`${skill}-${i}`}
                className="px-3 py-1 rounded-md text-sm border"
                style={{
                  backgroundColor: `${mainColor}1A`,
                  color: mainColor,
                  borderColor: `${mainColor}4D`,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
          {resizeHandle}
        </section>
      );
    }

    if (section.type === "education") {
      return (
        <section key={section.id} {...sectionCommonProps}>
          <h2 className={headerClass} style={{ color: mainColor }}>
            Education
          </h2>
          <h3 className={`font-semibold ${textClass}`}>
            {resumeData.personal_information?.education?.school || "School Name"}
          </h3>
          {resumeData.personal_information?.education?.majors?.length ? (
            <p className={`text-muted-foreground ${textClass}`}>
              Major: {resumeData.personal_information.education.majors.join(", ")}
            </p>
          ) : null}
          {resumeData.personal_information?.education?.expected_grad ? (
            <p className={`text-muted-foreground ${textClass}`}>
              Expected Graduation: {resumeData.personal_information.education.expected_grad}
            </p>
          ) : null}
          {resizeHandle}
        </section>
      );
    }

    if (section.type === "contact") {
      return (
        <section key={section.id} {...sectionCommonProps}>
          <h2 className={headerClass} style={{ color: mainColor }}>
            Contact
          </h2>
          <div className={section.layout === "split" ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-2"}>
            {resumeData.personal_information?.contact_info?.email ? (
              <p className={textClass}>
                Email: {resumeData.personal_information.contact_info.email}
              </p>
            ) : null}
            {resumeData.personal_information?.contact_info?.phone ? (
              <p className={textClass}>
                Phone: {resumeData.personal_information.contact_info.phone}
              </p>
            ) : null}
            {resumeData.personal_information?.contact_info?.linkedin ? (
              <p className={textClass}>
                LinkedIn: {resumeData.personal_information.contact_info.linkedin}
              </p>
            ) : null}
          </div>
          {resizeHandle}
        </section>
      );
    }

    return null;
  };

  return (
    <div
      className="p-4 sm:p-8"
      style={{
        backgroundColor,
        fontFamily: globalFont,
      }}
    >
      <div
        ref={canvasRef}
        className="mx-auto flex w-full max-w-[960px] flex-col"
        style={{ gap: `${layoutTemplate.settings.grid_gap}px` }}
      >
        {isGridLayout
          ? gridRows.map((rowEntry) => {
              const baseWidths = rowEntry.sections.map((section) =>
                sectionWidthPercent(section, rowEntry.sections.length)
              );
              const totalWidth = baseWidths.reduce((sum, value) => sum + value, 0) || 1;

              return (
                <div
                  key={`custom-row-${rowEntry.row}`}
                  className="flex w-full items-start"
                  style={{ gap: `${layoutTemplate.settings.grid_gap}px` }}
                >
                  {rowEntry.sections.map((section, index) => {
                    const normalizedWidth = (baseWidths[index] / totalWidth) * 100;
                    return renderSectionCard(section, normalizedWidth, rowEntry.row);
                  })}
                </div>
              );
            })
          : visibleSections.map((section, index) =>
              renderSectionCard(
                section,
                clamp(section.style?.widthPercent ?? 100, 35, 100),
                sectionGridRow(section, index)
              )
            )}
      </div>
    </div>
  );
};

// Full template render component
const FullTemplateRender = ({
  templateId,
  resumeData,
  mainColor,
  backgroundColor,
  templateConfig,
  customLayoutTemplate,
  customEditorEnabled,
  customEditorSelectedSectionId,
  onCustomEditorSelectSection,
  onCustomEditorResizeSection,
}: {
  templateId: string;
  resumeData: ParsedResume;
  mainColor: string;
  backgroundColor: string;
  templateConfig?: TemplateConfig;
  customLayoutTemplate?: CustomLayoutTemplate;
  customEditorEnabled?: boolean;
  customEditorSelectedSectionId?: string | null;
  onCustomEditorSelectSection?: (sectionId: string) => void;
  onCustomEditorResizeSection?: (
    sectionId: string,
    patch: Partial<CustomLayoutSection["style"]>
  ) => void;
}) => {

  const personal_information = resumeData.personal_information;
  const overview_data = resumeData.overview;
  const skills_data = resumeData.skills;
  const projects_data = resumeData.projects;
  const experience_data = resumeData.experience;

  if (templateId === "custom") {
    return (
      <CustomTemplateRender
        resumeData={resumeData}
        mainColor={mainColor}
        backgroundColor={backgroundColor}
        layoutTemplate={customLayoutTemplate ?? buildDefaultCustomLayout()}
        isEditing={customEditorEnabled}
        selectedSectionId={customEditorSelectedSectionId}
        onSelectSection={onCustomEditorSelectSection}
        onResizeSection={onCustomEditorResizeSection}
      />
    );
  }

  const SelectedTemplate = templateComponentMap[templateId];
  if (!SelectedTemplate) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 max-w-4xl mx-auto text-center">
        <p className="text-gray-600">Template {templateId} preview</p>
      </div>
    );
  }

  return (
    <SelectedTemplate
      personalInformation={personal_information}
      overviewData={overview_data}
      experience={experience_data}
      skills={skills_data}
      projects={projects_data}
      mainColor={mainColor}
      backgroundColor={backgroundColor}
      templateConfig={templateConfig}
    />
  );
};

export default function PreviewPage() {
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [mainColor, setMainColor] = useState<string>("#2563EB");
  const [backgroundColor, setBackgroundColor] = useState<string>(LIGHT_DISPLAY_BG);
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null);
  const [customLayoutTemplate, setCustomLayoutTemplate] = useState<CustomLayoutTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [customLayoutMessage, setCustomLayoutMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [customEditorTarget, setCustomEditorTarget] = useState<CustomEditorTarget>({
    kind: "global",
    panel: "theme",
  });
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeOptions, setResumeOptions] = useState<ResumeOption[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const router = useRouter();
  const info = useUser();
  const session = useMemo(() => createClient(), []);
  const customLayoutUploadRef = useRef<HTMLInputElement | null>(null);

  type ResumeOption = {
    id: string;
    title: string | null;
    file_path?: string | null;
    data: ParsedResume;
    created_at?: string | null;
  };

  const selectedCustomSection = useMemo(() => {
    if (customEditorTarget.kind !== "section" || !customLayoutTemplate) return null;
    return (
      customLayoutTemplate.sections.find((section) => section.id === customEditorTarget.sectionId) ??
      null
    );
  }, [customEditorTarget, customLayoutTemplate]);

  useEffect(() => {
    let isCancelled = false;

    const loadPreviewState = async () => {
      const storedResumeData = localStorage.getItem("resumeData");
      const storedTemplate = localStorage.getItem("selectedTemplate");
      const storedColor = localStorage.getItem("selectedColor");
      const storedMode = localStorage.getItem("selectedMode");
      const storedCustomSections = localStorage.getItem("customSections");
      const storedSerializedLayout = localStorage.getItem("customLayoutSerialized");
      const storedTemplateConfig = deserializeTemplateConfig(localStorage.getItem("templateConfig"));
      const parsedSerializedLayout = tryParseCustomLayoutTemplate(storedSerializedLayout);
      const legacySections = normalizeLegacySections(storedCustomSections);

      let parsedResume: ParsedResume | null = null;
      if (storedResumeData) {
        try {
          parsedResume = JSON.parse(storedResumeData) as ParsedResume;
          if (!isCancelled) setResumeData(parsedResume);
        } catch {
          parsedResume = null;
        }
      }

      const shouldLoadCustomTemplate =
        storedTemplate === "custom" ||
        (!storedTemplate && Boolean(parsedSerializedLayout || legacySections));

      if (shouldLoadCustomTemplate) {
        const fallbackMode = storedMode === "dark" ? "dark" : "light";
        const fallbackLayout = buildDefaultCustomLayout({
          selectedColor: storedColor || DEFAULT_CUSTOM_LAYOUT_SETTINGS.selected_color,
          displayMode: fallbackMode,
        });
        const resolvedCustomLayout =
          parsedSerializedLayout ??
          buildCustomLayoutTemplate({
            sections: legacySections ?? fallbackLayout.sections,
            selectedColor:
              storedColor ||
              fallbackLayout.settings.selected_color ||
              DEFAULT_CUSTOM_LAYOUT_SETTINGS.selected_color,
            displayMode: fallbackMode,
            settings: fallbackLayout.settings,
          });

        localStorage.setItem("customLayoutSerialized", serializeCustomLayoutTemplate(resolvedCustomLayout));
        localStorage.setItem("customSections", JSON.stringify(resolvedCustomLayout.sections));

        if (!isCancelled) {
          setSelectedTemplate("custom");
          setCustomLayoutTemplate(resolvedCustomLayout);
          setTemplateConfig(null);
          setMainColor(resolvedCustomLayout.settings.selected_color);
          setBackgroundColor(modeToBackground(resolvedCustomLayout.settings.display_mode));
        }
      } else if (storedTemplate) {
        if (!isCancelled) setCustomLayoutTemplate(null);
        if (!isCancelled) setSelectedTemplate(storedTemplate);

        if (storedTemplate !== "custom" && parsedResume) {
          let workingConfig = normalizeTemplateConfig({
            templateId: storedTemplate,
            resumeData: parsedResume,
            config: storedTemplateConfig,
            fallbackTheme: {
              primaryColor: storedColor || "#2563EB",
              backgroundColor: storedMode === "light" ? LIGHT_DISPLAY_BG : DARK_DISPLAY_BG,
              mode: storedMode === "light" ? "light" : "dark",
            },
          });

          const existingPortfolioId = localStorage.getItem("currentPortfolioId");
          if (existingPortfolioId) {
            try {
              const supabaseSession = await session.auth.getSession();
              const token = supabaseSession.data.session?.access_token;
              if (token) {
                const remoteConfig = await fetchTemplateConfig({
                  portfolioId: existingPortfolioId,
                  token,
                });
                if (remoteConfig) {
                  workingConfig = normalizeTemplateConfig({
                    templateId: storedTemplate,
                    resumeData: parsedResume,
                    config: remoteConfig,
                    fallbackTheme: {
                      primaryColor: storedColor || "#2563EB",
                      backgroundColor: storedMode === "light" ? LIGHT_DISPLAY_BG : DARK_DISPLAY_BG,
                      mode: storedMode === "light" ? "light" : "dark",
                    },
                  });
                }
              }
            } catch (error) {
              console.error("Error loading remote template config:", error);
            }
          }

          localStorage.setItem("templateConfig", serializeTemplateConfig(workingConfig));
          if (!isCancelled) setTemplateConfig(workingConfig);
        }
      }

      if (!isCancelled && storedTemplate !== "custom") {
        setMainColor(storedColor || "#2563EB");
        setBackgroundColor(storedMode === "light" ? LIGHT_DISPLAY_BG : DARK_DISPLAY_BG);
      }

      window.setTimeout(() => {
        if (!isCancelled) setIsGenerating(false);
      }, 2000);
    };

    loadPreviewState();

    return () => {
      isCancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!resumeData || !selectedTemplate || selectedTemplate === "custom") return;

    const normalized = normalizeTemplateConfig({
      templateId: selectedTemplate,
      resumeData,
      config: templateConfig,
      fallbackTheme: {
        primaryColor: mainColor,
        backgroundColor,
        mode: backgroundColor === LIGHT_DISPLAY_BG ? 'light' : 'dark',
      },
    });

    const nextSignature = serializeTemplateConfig(normalized);
    const currentSignature = templateConfig
      ? serializeTemplateConfig(templateConfig)
      : null;

    if (currentSignature !== nextSignature) {
      setTemplateConfig(normalized);
    }

    localStorage.setItem("templateConfig", nextSignature);
  }, [resumeData, selectedTemplate, mainColor, backgroundColor, templateConfig]);

  useEffect(() => {
    if (!customLayoutTemplate || selectedTemplate !== "custom") return;

    localStorage.setItem(
      "customLayoutSerialized",
      serializeCustomLayoutTemplate(customLayoutTemplate)
    );
    localStorage.setItem("customSections", JSON.stringify(customLayoutTemplate.sections));
    localStorage.setItem("selectedColor", customLayoutTemplate.settings.selected_color);
    localStorage.setItem("selectedMode", customLayoutTemplate.settings.display_mode);

    setMainColor((previous) =>
      previous === customLayoutTemplate.settings.selected_color
        ? previous
        : customLayoutTemplate.settings.selected_color
    );

    const resolvedBackground = modeToBackground(customLayoutTemplate.settings.display_mode);
    setBackgroundColor((previous) =>
      previous === resolvedBackground ? previous : resolvedBackground
    );
  }, [customLayoutTemplate, selectedTemplate]);

  useEffect(() => {
    if (!selectedTemplate) return;
    localStorage.setItem("selectedTemplate", selectedTemplate);
  }, [selectedTemplate]);

  useEffect(() => {
    if (selectedTemplate !== "custom") {
      if (
        customEditorTarget.kind !== "global" ||
        customEditorTarget.panel !== "theme"
      ) {
        setCustomEditorTarget({ kind: "global", panel: "theme" });
      }
      return;
    }

    if (
      customEditorTarget.kind === "section" &&
      customLayoutTemplate &&
      !customLayoutTemplate.sections.some((section) => section.id === customEditorTarget.sectionId)
    ) {
      setCustomEditorTarget({ kind: "global", panel: "theme" });
    }
  }, [selectedTemplate, customLayoutTemplate, customEditorTarget]);

  const updateCustomLayoutSettings = (
    patch: Partial<CustomLayoutTemplate["settings"]>
  ) => {
    setCustomLayoutTemplate((previous) => {
      if (!previous) return previous;

      return buildCustomLayoutTemplate({
        sections: previous.sections,
        selectedColor: patch.selected_color ?? previous.settings.selected_color,
        displayMode: patch.display_mode ?? previous.settings.display_mode,
        settings: {
          ...previous.settings,
          ...patch,
        },
      });
    });
  };

  const updateCustomSection = (
    sectionId: string,
    updater: (section: CustomLayoutSection) => CustomLayoutSection
  ) => {
    setCustomLayoutTemplate((previous) => {
      if (!previous) return previous;
      const nextSections = previous.sections.map((section) =>
        section.id === sectionId ? updater(section) : section
      );
      const normalizedSections =
        previous.settings.layout_mode === "grid"
          ? normalizeGridWidths(nextSections)
          : nextSections;

      return buildCustomLayoutTemplate({
        sections: normalizedSections,
        selectedColor: previous.settings.selected_color,
        displayMode: previous.settings.display_mode,
        settings: previous.settings,
      });
    });
  };

  const handleSelectCustomSection = (sectionId: string) => {
    setCustomEditorTarget({ kind: "section", sectionId });
  };

  const handleResizeCustomSection = (
    sectionId: string,
    patch: Partial<CustomLayoutSection["style"]>
  ) => {
    setCustomLayoutTemplate((previous) => {
      if (!previous) return previous;

      const targetIndex = previous.sections.findIndex((section) => section.id === sectionId);
      if (targetIndex === -1) return previous;
      const targetSection = previous.sections[targetIndex];
      const fallbackRow = sectionGridRow(targetSection, targetIndex);
      const targetRow = clamp(
        Math.round(patch.gridRow ?? targetSection.style?.gridRow ?? fallbackRow),
        1,
        99
      );

      const nextSections = previous.sections.map((section) => ({
        ...section,
        style: {
          ...section.style,
        },
      }));

      if (previous.settings.layout_mode === "grid" && patch.widthPercent !== undefined) {
        const rowSections = sortSectionsForGrid(
          nextSections.filter((section, index) => sectionGridRow(section, index) === targetRow)
        );

        const currentSectionInRow = rowSections.find((section) => section.id === sectionId);
        if (currentSectionInRow) {
          const currentWidth = sectionWidthPercent(currentSectionInRow, rowSections.length);

          if (rowSections.length <= 1) {
            const onlyIndex = nextSections.findIndex((section) => section.id === sectionId);
            if (onlyIndex >= 0) {
              nextSections[onlyIndex] = {
                ...nextSections[onlyIndex],
                style: {
                  ...nextSections[onlyIndex].style,
                  ...patch,
                  widthPercent: 100,
                  gridRow: targetRow,
                },
              };
            }
          } else {
            const sortedIds = rowSections.map((section) => section.id);
            const focusIndex = sortedIds.indexOf(sectionId);
            const siblingIndex = focusIndex < sortedIds.length - 1 ? focusIndex + 1 : focusIndex - 1;
            const siblingId = sortedIds[siblingIndex];
            const siblingSection = rowSections.find((section) => section.id === siblingId);
            const siblingWidth = siblingSection
              ? sectionWidthPercent(siblingSection, rowSections.length)
              : 100 - currentWidth;

            const requestedWidth = clamp(Math.round(patch.widthPercent), 5, 95);
            const delta = requestedWidth - currentWidth;
            let nextFocusWidth = requestedWidth;
            let nextSiblingWidth = siblingWidth - delta;

            if (nextSiblingWidth < 5) {
              const correction = 5 - nextSiblingWidth;
              nextFocusWidth = clamp(nextFocusWidth - correction, 5, 95);
              nextSiblingWidth = 5;
            }
            if (nextSiblingWidth > 95) {
              const correction = nextSiblingWidth - 95;
              nextFocusWidth = clamp(nextFocusWidth + correction, 5, 95);
              nextSiblingWidth = 95;
            }

            const focusAbsIndex = nextSections.findIndex((section) => section.id === sectionId);
            const siblingAbsIndex = nextSections.findIndex((section) => section.id === siblingId);

            if (focusAbsIndex >= 0) {
              nextSections[focusAbsIndex] = {
                ...nextSections[focusAbsIndex],
                style: {
                  ...nextSections[focusAbsIndex].style,
                  ...patch,
                  widthPercent: nextFocusWidth,
                  gridRow: targetRow,
                },
              };
            }
            if (siblingAbsIndex >= 0) {
              nextSections[siblingAbsIndex] = {
                ...nextSections[siblingAbsIndex],
                style: {
                  ...nextSections[siblingAbsIndex].style,
                  widthPercent: nextSiblingWidth,
                  gridRow: targetRow,
                },
              };
            }
          }
        }
      } else {
        const sectionAbsIndex = nextSections.findIndex((section) => section.id === sectionId);
        if (sectionAbsIndex >= 0) {
          nextSections[sectionAbsIndex] = {
            ...nextSections[sectionAbsIndex],
            style: {
              ...nextSections[sectionAbsIndex].style,
              ...patch,
            },
          };
        }
      }

      const normalizedSections =
        previous.settings.layout_mode === "grid"
          ? normalizeGridWidths(nextSections)
          : nextSections;

      return buildCustomLayoutTemplate({
        sections: normalizedSections,
        selectedColor: previous.settings.selected_color,
        displayMode: previous.settings.display_mode,
        settings: previous.settings,
      });
    });
  };

  const moveCustomSection = (sectionId: string, direction: "left" | "right" | "up" | "down") => {
    setCustomLayoutTemplate((previous) => {
      if (!previous || previous.settings.layout_mode !== "grid") return previous;

      const workingSections = normalizeGridWidths(previous.sections.map((section) => ({ ...section, style: { ...section.style } })));
      const sorted = sortSectionsForGrid(workingSections);
      const current = sorted.find((section) => section.id === sectionId);
      if (!current) return previous;

      const currentRow = current.style?.gridRow ?? 1;
      const currentOrder = current.style?.gridOrder ?? 1;

      if (direction === "up" || direction === "down") {
        if ((direction === "up" && currentRow <= 1) || (direction === "down" && currentRow >= 99)) {
          return previous;
        }

        const targetRow = clamp(currentRow + (direction === "up" ? -1 : 1), 1, 99);
        if (targetRow === currentRow) return previous;

        const targetRowSections = sorted.filter((section) => (section.style?.gridRow ?? 1) === targetRow);
        const nextOrder =
          Math.max(0, ...targetRowSections.map((section) => section.style?.gridOrder ?? 0)) + 1;

        const movedSections = workingSections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                style: {
                  ...section.style,
                  gridRow: targetRow,
                  gridOrder: nextOrder,
                },
              }
            : section
        );

        return buildCustomLayoutTemplate({
          sections: normalizeGridWidths(movedSections),
          selectedColor: previous.settings.selected_color,
          displayMode: previous.settings.display_mode,
          settings: previous.settings,
        });
      }

      const rowSections = sorted.filter((section) => (section.style?.gridRow ?? 1) === currentRow);
      const rowIndex = rowSections.findIndex((section) => section.id === sectionId);
      const swapIndex = direction === "left" ? rowIndex - 1 : rowIndex + 1;
      if (swapIndex < 0 || swapIndex >= rowSections.length) return previous;

      const swapTarget = rowSections[swapIndex];
      const swappedSections = workingSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            style: {
              ...section.style,
              gridOrder: swapTarget.style?.gridOrder ?? currentOrder,
            },
          };
        }
        if (section.id === swapTarget.id) {
          return {
            ...section,
            style: {
              ...section.style,
              gridOrder: currentOrder,
            },
          };
        }
        return section;
      });

      return buildCustomLayoutTemplate({
        sections: normalizeGridWidths(swappedSections),
        selectedColor: previous.settings.selected_color,
        displayMode: previous.settings.display_mode,
        settings: previous.settings,
      });
    });
  };

  const setCustomSectionRow = (sectionId: string, nextRow: number) => {
    setCustomLayoutTemplate((previous) => {
      if (!previous) return previous;

      const targetRow = clamp(Math.round(nextRow), 1, 99);
      const currentIndex = previous.sections.findIndex((section) => section.id === sectionId);
      if (currentIndex === -1) return previous;

      const currentSection = previous.sections[currentIndex];
      const currentRow = sectionGridRow(currentSection, currentIndex);
      if (currentRow === targetRow) return previous;

      const sorted = sortSectionsForGrid(previous.sections);
      const targetRowSections = sorted.filter((section) => (section.style?.gridRow ?? 1) === targetRow);
      const nextOrder =
        Math.max(0, ...targetRowSections.map((section) => section.style?.gridOrder ?? 0)) + 1;

      const movedSections = previous.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              style: {
                ...section.style,
                gridRow: targetRow,
                gridOrder: nextOrder,
              },
            }
          : section
      );

      return buildCustomLayoutTemplate({
        sections: normalizeGridWidths(movedSections),
        selectedColor: previous.settings.selected_color,
        displayMode: previous.settings.display_mode,
        settings: previous.settings,
      });
    });
  };

  const resetCustomLayout = () => {
    const fallbackMode = backgroundColor === DARK_DISPLAY_BG ? "dark" : "light";
    const nextLayout = buildDefaultCustomLayout({
      selectedColor: mainColor,
      displayMode: fallbackMode,
    });
    setCustomLayoutTemplate(nextLayout);
    setCustomLayoutMessage({
      type: "success",
      message: "Layout has been reset to default settings.",
    });
    window.setTimeout(() => setCustomLayoutMessage(null), 2500);
  };

  const handleExportCustomLayout = () => {
    if (!customLayoutTemplate) return;

    const serialized = serializeCustomLayoutTemplate(customLayoutTemplate);
    const blob = new Blob([serialized], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "custom-layout.json";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setCustomLayoutMessage({
      type: "success",
      message: "Custom layout JSON exported.",
    });
    window.setTimeout(() => setCustomLayoutMessage(null), 2500);
  };

  const handleImportCustomLayout = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const rawText = await file.text();
      const parsed = tryParseCustomLayoutTemplate(rawText);
      if (!parsed) {
        setCustomLayoutMessage({
          type: "error",
          message: "Invalid layout JSON. Please upload a valid custom layout file.",
        });
        return;
      }

      setSelectedTemplate("custom");
      setTemplateConfig(null);
      setCustomLayoutTemplate(parsed);
      setCustomEditorTarget({ kind: "global", panel: "theme" });
      setCustomLayoutMessage({
        type: "success",
        message: "Custom layout JSON imported successfully.",
      });
      window.setTimeout(() => setCustomLayoutMessage(null), 2500);
    } catch {
      setCustomLayoutMessage({
        type: "error",
        message: "Could not read the selected JSON file.",
      });
    }
  };

  const handleSwitchToCustomLayout = () => {
    const fallbackMode = backgroundColor === DARK_DISPLAY_BG ? "dark" : "light";
    const nextLayout = buildDefaultCustomLayout({
      selectedColor: mainColor,
      displayMode: fallbackMode,
    });
    setSelectedTemplate("custom");
    setTemplateConfig(null);
    setCustomLayoutTemplate(nextLayout);
    setCustomEditorTarget({ kind: "global", panel: "theme" });
    setCustomLayoutMessage({
      type: "success",
      message: "Custom layout mode enabled. Use the left field list and right settings panel.",
    });
    window.setTimeout(() => setCustomLayoutMessage(null), 2500);
  };



  const handleStartOver = () => {
    localStorage.removeItem("resumeData");
    localStorage.removeItem("selectedTemplate");
    localStorage.removeItem("currentPortfolioId");
    localStorage.removeItem("templateConfig");
    localStorage.removeItem("customLayoutSerialized");
    localStorage.removeItem("customSections");
    router.push("/upload");
  };

  const openResumeModal = async () => {
    setShowResumeModal(true);
    setIsLoadingResumes(true);
    setResumeError(null);

    try {
      const supabaseSession = await session.auth.getSession();
      const token = supabaseSession.data.session?.access_token;

      if (!token) {
        setResumeError("Please sign in to view your resumes.");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/resumes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setResumeError("Failed to load resumes. Please try again.");
        return;
      }

      const data = await response.json();
      setResumeOptions(data || []);
      if (data?.length) {
        setSelectedResumeId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading resumes:", error);
      setResumeError("Failed to load resumes. Please try again.");
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const handleDownloadSelectedResume = async () => {
    if (!selectedResumeId) return;

    const selected = resumeOptions.find((resume) => resume.id === selectedResumeId);
    if (!selected) return;

    try {
      const supabaseSession = await session.auth.getSession();
      const token = supabaseSession.data.session?.access_token;

      if (!token) {
        setResumeError("Please sign in to download resumes.");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/resumes/${selectedResumeId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        setResumeError("Failed to download the resume. Please try again.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const fileNameBase = selected.title || "resume";
      const ext = selected.file_path?.split(".").pop() || "";
      const normalizedBase = fileNameBase.replace(/[^a-z0-9._-]/gi, "_");
      const fileName =
        ext && !normalizedBase.toLowerCase().endsWith(`.${ext}`)
          ? `${normalizedBase}.${ext}`
          : normalizedBase;

      anchor.href = url;
      anchor.download = fileName || "resume";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume:", error);
      setResumeError("Failed to download the resume. Please try again.");
    }
  };

  const handleConfirmResumeSelection = () => {
    if (!selectedResumeId) return;

    const selected = resumeOptions.find((resume) => resume.id === selectedResumeId);
    if (!selected) return;

    setResumeData(selected.data);
    localStorage.setItem("resumeData", JSON.stringify(selected.data));
    setShowResumeModal(false);
  };


  const templateNames: Record<string, string> = {
    '1': 'Modern Minimal',
    '2': 'Classic Professional', 
    '3': 'Creative Bold',
    '4': 'Elegant Sophisticated',
    '5': 'SideRail Pro',
    '6': 'Editorial Story',
    '7': 'IDE Clean',
    '8': 'Timeline Narrative',
    '9': 'Bold Brand',
    '10': 'Minimal Creator Hub',
    'custom': 'Custom Template',
  };

  if (info.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!info.user) {
    router.push('/signin?next=/preview');
    return null;
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen">
        <Header currentPage="preview" />

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Generating Your Website</h2>
            <p className="text-muted-foreground">Creating your {selectedTemplate ? (templateNames[selectedTemplate] || 'portfolio') : 'portfolio'}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resumeData || !selectedTemplate || (selectedTemplate === "custom" && !customLayoutTemplate)) {
    return (
      <div className="min-h-screen">
        <Header currentPage="preview" />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Missing data. Please start over.</p>
            <Button onClick={handleStartOver} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!selectedTemplate || !resumeData) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const supabaseSession = await session.auth.getSession();
      const token = supabaseSession.data.session?.access_token;
      
      if (!token) {
        setSaveMessage({ type: 'error', message: 'Please sign in to save your portfolio' });
        setIsSaving(false);
        return;
      }

      // Find template name
      const templateNames: Record<string, string> = {
        '1': 'Modern Minimal',
        '2': 'Classic Professional',
        '3': 'Creative Bold',
        '4': 'Elegant Sophisticated',
        '5': 'SideRail Pro',
        '6': 'Editorial Story',
        '7': 'IDE Clean',
        '8': 'Timeline Narrative',
        '9': 'Bold Brand',
        '10': 'Minimal Creator Hub',
        'custom': 'Custom Template'
      };
      const templateName = templateNames[selectedTemplate] || 'Portfolio';

      // Check if editing existing portfolio
      const existingPortfolioId = localStorage.getItem('currentPortfolioId');
      const currentTemplateConfig =
        selectedTemplate !== 'custom'
          ? normalizeTemplateConfig({
              templateId: selectedTemplate,
              resumeData,
              config: templateConfig,
              fallbackTheme: {
                primaryColor: mainColor,
                backgroundColor,
                mode: backgroundColor === LIGHT_DISPLAY_BG ? 'light' : 'dark',
              },
            })
          : null;

      // Prepare portfolio data
      const serializedCustomTemplate =
        selectedTemplate === "custom"
          ? customLayoutTemplate ??
            buildDefaultCustomLayout({
              selectedColor: mainColor,
              displayMode: backgroundColor === LIGHT_DISPLAY_BG ? "light" : "dark",
            })
          : null;

      const effectiveColor =
        selectedTemplate === "custom"
          ? serializedCustomTemplate?.settings.selected_color || mainColor
          : mainColor;
      const effectiveDisplayMode =
        selectedTemplate === "custom"
          ? serializedCustomTemplate?.settings.display_mode ||
            (backgroundColor === LIGHT_DISPLAY_BG ? "light" : "dark")
          : backgroundColor === LIGHT_DISPLAY_BG
            ? "light"
            : "dark";

      const dataToSave: PortfolioDataWithCustomTemplate =
        selectedTemplate === 'custom'
          ? {
              ...resumeData,
              __custom_template: serializedCustomTemplate ?? undefined,
            }
          : {
              ...resumeData,
              __template_config: currentTemplateConfig ?? undefined,
            };

      if (serializedCustomTemplate) {
        localStorage.setItem("customLayoutSerialized", serializeCustomLayoutTemplate(serializedCustomTemplate));
      }
      if (currentTemplateConfig) {
        localStorage.setItem('templateConfig', serializeTemplateConfig(currentTemplateConfig));
      }

      const portfolioData = {
        name: `${resumeData.personal_information?.full_name || 'My'} Portfolio - ${templateName}`,
        template_id: selectedTemplate,
        data: dataToSave,
        color: effectiveColor,
        display_mode: effectiveDisplayMode,
        is_published: false
      };

      let response: Response;

      if (existingPortfolioId) {
        // Try to update existing portfolio
        const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/portfolios/${existingPortfolioId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(portfolioData)
        });

        // If portfolio not found (404), create a new one instead
        if (updateResponse.status === 404) {
          localStorage.removeItem('currentPortfolioId');
          response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/portfolios/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(portfolioData)
          });
        } else {
          response = updateResponse;
        }
      } else {
        // Create new portfolio
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/portfolios/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(portfolioData)
        });
      }

      if (response.ok) {
        const savedPortfolio = await response.json();
        localStorage.setItem('currentPortfolioId', savedPortfolio.id);

        if (selectedTemplate !== 'custom' && currentTemplateConfig) {
          await saveTemplateConfig({
            portfolioId: savedPortfolio.id,
            token,
            config: currentTemplateConfig,
          });
        }

        setSaveMessage({ type: 'success', message: 'Portfolio saved successfully!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const error = await response.json();
        setSaveMessage({ type: 'error', message: error.detail || 'Failed to save portfolio' });
      }
    } catch (error) {
      console.error('Error saving portfolio:', error);
      setSaveMessage({ type: 'error', message: 'Error saving portfolio. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const sectionHtml =
      selectedTemplate !== 'custom' && templateConfig
        ? templateConfig.sections
            .filter((section) => section.enabled)
            .map((section) => {
              const title =
                typeof (section.content as { title?: unknown }).title === 'string'
                  ? ((section.content as { title?: string }).title as string)
                  : section.type;
              const summary =
                typeof (section.content as { summary?: unknown }).summary === 'string'
                  ? ((section.content as { summary?: string }).summary as string)
                  : '';

              return `
    <section class=\"section\">
      <h2>${title}</h2>
      ${summary ? `<p>${summary}</p>` : ''}
    </section>`;
            })
            .join('')
        : '';

    // Generate HTML file for download using TemplateConfig sections when available.
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resumeData.personal_information?.full_name || 'Portfolio'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: ${backgroundColor};
      color: ${backgroundColor === LIGHT_DISPLAY_BG ? '#1a202c' : '#fff'};
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: ${mainColor}; margin-bottom: 10px; }
    h2 { color: ${mainColor}; margin: 20px 0 10px; border-bottom: 2px solid ${mainColor}; padding-bottom: 5px; }
    .section { margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${resumeData.personal_information?.full_name || 'Portfolio'}</h1>
    <p>${resumeData.overview?.resume_summary || ''}</p>
    ${sectionHtml}
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${selectedTemplate}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const customGlobalFields: Array<{
    id: "theme" | "typography" | "layout";
    label: string;
    description: string;
  }> = [
    {
      id: "theme",
      label: "Theme & Mode",
      description: "Accent color and light/dark style.",
    },
    {
      id: "typography",
      label: "Typography",
      description: "Global font family and scale.",
    },
    {
      id: "layout",
      label: "Grid & Canvas",
      description: "Stack or grid behavior and spacing.",
    },
  ];

  const activeGlobalPanel =
    customEditorTarget.kind === "global" ? customEditorTarget.panel : null;
  const maxGridRow = customLayoutTemplate
    ? customLayoutTemplate.sections.reduce(
        (max, section, index) => Math.max(max, sectionGridRow(section, index)),
        1
      )
    : 1;

  return (
    <div className="min-h-screen">
      <Header currentPage="preview" />

      {/* Main Content */}
      <main className="py-8">
        <div className="container-base max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/templates')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Templates
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Your Portfolio Website</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{selectedTemplate === 'custom' ? 'Custom Template' : (selectedTemplate ? (templateNames[selectedTemplate] || `Template ${selectedTemplate}`) : 'Portfolio')}</Badge>
                  <span className="text-muted-foreground text-sm">Preview Mode</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="gap-2"
                  variant={saveMessage?.type === 'success' ? 'default' : 'default'}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : saveMessage?.type === 'success' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </Button>
                <Button onClick={handleDownload} variant="outline" className="gap-2 border-emerald-200 hover:bg-emerald-50">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button variant="outline" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Deploy
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/templates')}
                >
                  Change Template
                </Button>
                {selectedTemplate !== "custom" ? (
                  <Button variant="outline" onClick={handleSwitchToCustomLayout}>
                    Switch to Custom Layout
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-4 p-4 rounded-lg ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {saveMessage.message}
            </div>
          )}

          {selectedTemplate === "custom" && customLayoutTemplate ? (
            <div className="mb-6 grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_320px] gap-4">
              <aside className="rounded-lg border bg-background p-4 space-y-4 h-fit xl:sticky xl:top-24">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold">Customizer Fields</h3>
                  <p className="text-xs text-muted-foreground">
                    Select a field, then edit it in the right panel.
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    ref={customLayoutUploadRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={handleImportCustomLayout}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => customLayoutUploadRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Import Layout JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={handleExportCustomLayout}
                  >
                    <Download className="h-4 w-4" />
                    Export Layout JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={resetCustomLayout}
                  >
                    Reset Layout
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Global</p>
                  {customGlobalFields.map((field) => {
                    const active =
                      customEditorTarget.kind === "global" &&
                      customEditorTarget.panel === field.id;
                    return (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => setCustomEditorTarget({ kind: "global", panel: field.id })}
                        className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                          active
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <p className="text-sm font-medium">{field.label}</p>
                        <p className="text-xs text-muted-foreground">{field.description}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Sections</p>
                  {(customLayoutTemplate.settings.layout_mode === "grid"
                    ? sortSectionsForGrid(customLayoutTemplate.sections)
                    : customLayoutTemplate.sections
                  ).map((section, index) => {
                    const active =
                      customEditorTarget.kind === "section" &&
                      customEditorTarget.sectionId === section.id;
                    const gridRow = sectionGridRow(section, index);
                    const gridOrder = sectionGridOrder(section, index);
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => handleSelectCustomSection(section.id)}
                        className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                          active
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{sectionLabelByType[section.type]}</p>
                          <span className="text-xs text-muted-foreground">
                            {section.visible ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {section.id}
                          {customLayoutTemplate.settings.layout_mode === "grid"
                            ? ` • Row ${gridRow}, Pos ${gridOrder}`
                            : ""}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <section className="rounded-lg overflow-hidden shadow-lg bg-background border">
                <div className="border-b px-4 py-3 text-sm text-muted-foreground">
                  Click any section in the preview to edit it. Resize by dragging the ↘ handle at the
                  bottom-right of a section card. Use Move controls in the right panel to reposition
                  sections horizontally and vertically in grid mode.
                </div>
                <FullTemplateRender
                  templateId={selectedTemplate}
                  resumeData={resumeData}
                  mainColor={mainColor}
                  backgroundColor={backgroundColor}
                  templateConfig={templateConfig ?? undefined}
                  customLayoutTemplate={customLayoutTemplate}
                  customEditorEnabled
                  customEditorSelectedSectionId={
                    customEditorTarget.kind === "section"
                      ? customEditorTarget.sectionId
                      : null
                  }
                  onCustomEditorSelectSection={handleSelectCustomSection}
                  onCustomEditorResizeSection={handleResizeCustomSection}
                />
              </section>

              <aside className="rounded-lg border bg-background p-4 space-y-4 h-fit xl:sticky xl:top-24">
                <div>
                  <h3 className="text-base font-semibold">Customization</h3>
                  <p className="text-xs text-muted-foreground">
                    {customEditorTarget.kind === "global"
                      ? "Edit selected global settings."
                      : "Edit the selected section settings."}
                  </p>
                </div>

                {customLayoutMessage ? (
                  <div
                    className={`rounded-md border px-3 py-2 text-sm ${
                      customLayoutMessage.type === "success"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {customLayoutMessage.message}
                  </div>
                ) : null}

                {customEditorTarget.kind === "global" && activeGlobalPanel === "theme" ? (
                  <div className="space-y-3">
                    <label className="space-y-1 text-sm block">
                      <span className="text-muted-foreground">Accent Color</span>
                      <input
                        type="color"
                        value={customLayoutTemplate.settings.selected_color}
                        onChange={(event) =>
                          updateCustomLayoutSettings({
                            selected_color: event.target.value,
                          })
                        }
                        className="h-10 w-full rounded border p-1"
                      />
                    </label>
                    <label className="space-y-1 text-sm block">
                      <span className="text-muted-foreground">Display Mode</span>
                      <select
                        value={customLayoutTemplate.settings.display_mode}
                        onChange={(event) =>
                          updateCustomLayoutSettings({
                            display_mode: event.target.value === "dark" ? "dark" : "light",
                          })
                        }
                        className="h-10 w-full rounded border bg-background px-2"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </label>
                  </div>
                ) : null}

                {customEditorTarget.kind === "global" && activeGlobalPanel === "typography" ? (
                  <div className="space-y-3">
                    <label className="space-y-1 text-sm block">
                      <span className="text-muted-foreground">Font Family</span>
                      <select
                        value={customLayoutTemplate.settings.font_family}
                        onChange={(event) =>
                          updateCustomLayoutSettings({
                            font_family: event.target.value as CustomFontFamily,
                          })
                        }
                        className="h-10 w-full rounded border bg-background px-2"
                      >
                        {CUSTOM_FONT_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm block">
                      <span className="text-muted-foreground">
                        Base Scale ({customLayoutTemplate.settings.section_scale.toFixed(2)}x)
                      </span>
                      <input
                        type="range"
                        min={0.75}
                        max={1.5}
                        step={0.05}
                        value={customLayoutTemplate.settings.section_scale}
                        onChange={(event) =>
                          updateCustomLayoutSettings({
                            section_scale: Number.parseFloat(event.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </label>
                  </div>
                ) : null}

                {customEditorTarget.kind === "global" && activeGlobalPanel === "layout" ? (
                  <div className="space-y-3">
                    <label className="space-y-1 text-sm block">
                      <span className="text-muted-foreground">Layout Mode</span>
                      <select
                        value={customLayoutTemplate.settings.layout_mode}
                        onChange={(event) =>
                          updateCustomLayoutSettings({
                            layout_mode: event.target.value as CustomLayoutMode,
                          })
                        }
                        className="h-10 w-full rounded border bg-background px-2"
                      >
                        <option value="stack">Stack</option>
                        <option value="grid">Grid</option>
                      </select>
                    </label>
                    <label className="space-y-1 text-sm block">
                      <span className="text-muted-foreground">
                        Grid Columns ({customLayoutTemplate.settings.grid_columns})
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={4}
                        step={1}
                        value={customLayoutTemplate.settings.grid_columns}
                        onChange={(event) =>
                          updateCustomLayoutSettings({
                            grid_columns: Number.parseInt(event.target.value, 10),
                          })
                        }
                        className="w-full"
                        disabled={customLayoutTemplate.settings.layout_mode !== "grid"}
                      />
                    </label>
                    <label className="space-y-1 text-sm block">
                      <span className="text-muted-foreground">
                        Gap ({customLayoutTemplate.settings.grid_gap}px)
                      </span>
                      <input
                        type="range"
                        min={8}
                        max={56}
                        step={2}
                        value={customLayoutTemplate.settings.grid_gap}
                        onChange={(event) =>
                          updateCustomLayoutSettings({
                            grid_gap: Number.parseInt(event.target.value, 10),
                          })
                        }
                        className="w-full"
                      />
                    </label>
                  </div>
                ) : null}

                {customEditorTarget.kind === "section" && selectedCustomSection ? (
                  <div className="space-y-3">
                    <div className="rounded-md border bg-muted/30 px-3 py-2">
                      <p className="text-sm font-medium">{sectionLabelByType[selectedCustomSection.type]}</p>
                      <p className="text-xs text-muted-foreground">{selectedCustomSection.id}</p>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={selectedCustomSection.visible}
                        onChange={(event) =>
                          updateCustomSection(selectedCustomSection.id, (current) => ({
                            ...current,
                            visible: event.target.checked,
                          }))
                        }
                      />
                      Visible
                    </label>

                    <label className="space-y-1 text-sm block">
                      <span className="text-muted-foreground">Variant</span>
                      <select
                        value={selectedCustomSection.layout}
                        onChange={(event) =>
                          updateCustomSection(selectedCustomSection.id, (current) => ({
                            ...current,
                            layout: event.target.value as CustomLayoutSection["layout"],
                          }))
                        }
                        className="h-10 w-full rounded border bg-background px-2"
                      >
                        <option value="default">Default</option>
                        <option value="centered">Centered</option>
                        <option value="split">Split</option>
                        <option value="cards">Cards</option>
                      </select>
                    </label>

                    {customLayoutTemplate.settings.layout_mode === "grid" ? (
                      <>
                        <label className="space-y-1 text-sm block">
                          <span className="text-muted-foreground">Grid Row</span>
                          <input
                            type="number"
                            min={1}
                            max={Math.max(maxGridRow + 1, 1)}
                            value={sectionGridRow(selectedCustomSection, 0)}
                            onChange={(event) =>
                              setCustomSectionRow(
                                selectedCustomSection.id,
                                Number.parseInt(event.target.value || "1", 10)
                              )
                            }
                            className="h-10 w-full rounded border bg-background px-2"
                          />
                        </label>

                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Move Section</span>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveCustomSection(selectedCustomSection.id, "left")}
                            >
                              Move Left
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveCustomSection(selectedCustomSection.id, "right")}
                            >
                              Move Right
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveCustomSection(selectedCustomSection.id, "up")}
                            >
                              Move Up
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveCustomSection(selectedCustomSection.id, "down")}
                            >
                              Move Down
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : null}

                    <label className="space-y-1 text-sm block">
                      <span className="text-muted-foreground">Font Size</span>
                      <select
                        value={selectedCustomSection.style?.fontSize ?? "medium"}
                        onChange={(event) =>
                          updateCustomSection(selectedCustomSection.id, (current) => ({
                            ...current,
                            style: {
                              ...current.style,
                              fontSize: event.target.value as "small" | "medium" | "large",
                            },
                          }))
                        }
                        className="h-10 w-full rounded border bg-background px-2"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </label>

                    <label className="space-y-1 text-sm block">
                      <span className="text-muted-foreground">Spacing</span>
                      <select
                        value={selectedCustomSection.style?.spacing ?? "normal"}
                        onChange={(event) =>
                          updateCustomSection(selectedCustomSection.id, (current) => ({
                            ...current,
                            style: {
                              ...current.style,
                              spacing: event.target.value as "compact" | "normal" | "spacious",
                            },
                          }))
                        }
                        className="h-10 w-full rounded border bg-background px-2"
                      >
                        <option value="compact">Compact</option>
                        <option value="normal">Normal</option>
                        <option value="spacious">Spacious</option>
                      </select>
                    </label>

                    <label className="space-y-1 text-sm block">
                      <span className="text-muted-foreground">Weight</span>
                      <select
                        value={selectedCustomSection.style?.fontWeight ?? "normal"}
                        onChange={(event) =>
                          updateCustomSection(selectedCustomSection.id, (current) => ({
                            ...current,
                            style: {
                              ...current.style,
                              fontWeight: event.target.value as "normal" | "medium" | "bold",
                            },
                          }))
                        }
                        className="h-10 w-full rounded border bg-background px-2"
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="bold">Bold</option>
                      </select>
                    </label>

                    <label className="space-y-1 text-sm block">
                      <span className="text-muted-foreground">Section Font</span>
                      <select
                        value={selectedCustomSection.style?.fontFamily ?? ""}
                        onChange={(event) =>
                          updateCustomSection(selectedCustomSection.id, (current) => ({
                            ...current,
                            style: {
                              ...current.style,
                              fontFamily: event.target.value
                                ? (event.target.value as CustomFontFamily)
                                : undefined,
                            },
                          }))
                        }
                        className="h-10 w-full rounded border bg-background px-2"
                      >
                        <option value="">Use global font</option>
                        {CUSTOM_FONT_OPTIONS.map((option) => (
                          <option key={`section-editor-${selectedCustomSection.id}-${option.id}`} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="rounded-md border bg-muted/20 px-3 py-2 text-xs text-muted-foreground space-y-1">
                      <p>
                        Size is controlled by click-and-drag in preview.
                      </p>
                      <p>Min Height: {selectedCustomSection.style?.minHeightPx ?? 160}px</p>
                      {customLayoutTemplate.settings.layout_mode === "grid" ? (
                        <>
                          <p>Row: {sectionGridRow(selectedCustomSection, 0)}</p>
                          <p>Order: {sectionGridOrder(selectedCustomSection, 0)}</p>
                          <p>Width In Row: {(selectedCustomSection.style?.widthPercent ?? 100).toFixed(1)}%</p>
                        </>
                      ) : (
                        <p>Width: {selectedCustomSection.style?.widthPercent ?? 100}%</p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateCustomSection(selectedCustomSection.id, (current) => ({
                          ...current,
                          style: {
                            ...current.style,
                            widthPercent: 100,
                            minHeightPx: 160,
                            scale: 1,
                          },
                        }))
                      }
                    >
                      Reset Section Size
                    </Button>
                  </div>
                ) : null}
              </aside>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden shadow-lg bg-background">
              {resumeData && selectedTemplate ? (
                <FullTemplateRender
                  templateId={selectedTemplate}
                  resumeData={resumeData}
                  mainColor={mainColor}
                  backgroundColor={backgroundColor}
                  templateConfig={templateConfig ?? undefined}
                  customLayoutTemplate={customLayoutTemplate ?? undefined}
                />
              ) : null}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="mt-6 flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={openResumeModal}
            >
              Choose Different Resume
            </Button>
          </div>
        </div>
      </main>
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-lg bg-background shadow-lg">
            <div className="flex items-start justify-between border-b px-4 py-3">
              <div>
                <h3 className="text-lg font-semibold">Choose a Resume</h3>
                <p className="text-sm text-muted-foreground">Switch the resume data used for this layout.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResumeModal(false)}
                className="h-8 w-8 p-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-4 py-3">
              {isLoadingResumes ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading resumes...
                </div>
              ) : resumeError ? (
                <div className="text-sm text-destructive">{resumeError}</div>
              ) : resumeOptions.length === 0 ? (
                <div className="text-sm text-muted-foreground">No resumes found.</div>
              ) : (
                <div className="max-h-64 overflow-y-auto rounded-md border">
                  {resumeOptions.map((resume) => {
                    const isSelected = resume.id === selectedResumeId;
                    const createdAt = resume.created_at
                      ? new Date(resume.created_at).toLocaleDateString()
                      : "";
                    return (
                      <button
                        key={resume.id}
                        onClick={() => setSelectedResumeId(resume.id)}
                        className={`flex w-full flex-col gap-1 border-b px-3 py-2 text-left text-sm transition-colors ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-900"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <span className="font-medium">
                          {resume.title || "Untitled Resume"}
                        </span>
                        {createdAt && (
                          <span className="text-xs text-muted-foreground">
                            Uploaded {createdAt}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t px-4 py-3">
              <Button
                variant="outline"
                onClick={handleDownloadSelectedResume}
                disabled={!selectedResumeId || isLoadingResumes}
              >
                Download Resume
              </Button>
              <Button
                onClick={handleConfirmResumeSelection}
                disabled={!selectedResumeId || isLoadingResumes}
              >
                Select
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
