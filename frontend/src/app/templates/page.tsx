"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MoonStar, Palette, Sparkles, Sun, TreePine } from "lucide-react";
import Header from "@/components/Header";
import { ParsedResume } from "@/constants/ResumeFormat";
import { normalizeTemplateConfig, type TemplateConfig } from "@/lib/template-config";

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

type DisplayMode = "light" | "dark";

type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  bestFor: Array<"Tech" | "Creative" | "Corporate" | "Academic" | "Writer" | "Creator">;
};

const LIGHT_DISPLAY_BG = "#F8FAFC";
const DARK_DISPLAY_BG = "#111111";

const modeBackground = (mode: DisplayMode): string =>
  mode === "light" ? LIGHT_DISPLAY_BG : DARK_DISPLAY_BG;

const presetColorOptions = [
  { id: "evergreen", value: "#16A34A", label: "Evergreen" },
  { id: "ocean", value: "#0EA5E9", label: "Ocean" },
  { id: "ember", value: "#F97316", label: "Ember" },
  { id: "crimson", value: "#DC2626", label: "Crimson" },
  { id: "indigo", value: "#4F46E5", label: "Indigo" },
  { id: "charcoal", value: "#334155", label: "Charcoal" },
];

const galleryTemplates: TemplateMeta[] = [
  {
    id: "1",
    name: "Modern Minimal",
    description: "Sharp modern layout with confident spacing and clean hierarchy.",
    bestFor: ["Tech", "Corporate"],
  },
  {
    id: "2",
    name: "Classic Professional",
    description: "Traditional structure tuned for clarity and executive readability.",
    bestFor: ["Corporate", "Academic"],
  },
  {
    id: "3",
    name: "Creative Bold",
    description: "High-energy structure with strong motion cues and visual rhythm.",
    bestFor: ["Creative", "Creator"],
  },
  {
    id: "4",
    name: "Elegant Sophisticated",
    description: "Refined premium aesthetic with polished typography and spacing.",
    bestFor: ["Corporate", "Writer"],
  },
  {
    id: "5",
    name: "SideRail Pro",
    description: "Identity rail + content flow with scroll-aware navigation anchors.",
    bestFor: ["Tech", "Corporate"],
  },
  {
    id: "6",
    name: "Editorial Story",
    description: "Writing-first case-study format with generous margins and pace.",
    bestFor: ["Writer", "Academic"],
  },
  {
    id: "7",
    name: "IDE Clean",
    description: "Panel-style, tool-native UI language with crisp tags and separators.",
    bestFor: ["Tech", "Creator"],
  },
  {
    id: "8",
    name: "Timeline Narrative",
    description: "Chronological storytelling with timeline controls for key milestones.",
    bestFor: ["Academic", "Corporate"],
  },
  {
    id: "9",
    name: "Bold Brand",
    description: "Oversized hero and high-impact project cards for standout positioning.",
    bestFor: ["Creative", "Creator"],
  },
  {
    id: "10",
    name: "Minimal Creator Hub",
    description: "Dense, tag-forward profile built for creators shipping continuously.",
    bestFor: ["Creator", "Tech"],
  },
];

const normalizeHexColor = (value: string): string | null => {
  const trimmed = value.trim();

  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return null;
};

const getContrastTextColor = (hexColor: string): string => {
  const normalized = normalizeHexColor(hexColor);
  if (!normalized) return "#FFFFFF";

  const hex = normalized.replace("#", "");
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 160 ? "#111827" : "#FFFFFF";
};

const mockResumeForGallery: ParsedResume = {
  resume_pdf: "",
  portfolio_id: "gallery-preview",
  personal_information: {
    full_name: "Alex Rivera",
    contact_info: {
      email: "alex@folio.dev",
      linkedin: "https://www.linkedin.com/in/alexrivera",
      phone: "+1 (555) 013-8891",
      address: "Brooklyn, NY",
    },
    education: {
      school: "Pratt Institute",
      majors: ["Information Experience Design"],
      minors: ["Creative Coding"],
      expected_grad: "2024",
    },
  },
  overview: {
    career_name: "Product Engineer & Visual Storyteller",
    resume_summary:
      "I build resilient software and expressive interfaces that help teams communicate ideas clearly and ship with confidence.",
  },
  projects: [
    {
      title: "Atlas Studio",
      description:
        "Designed a multi-tenant creator dashboard that improved onboarding conversion by 31%. https://atlas.example/demo https://github.com/atlas/studio",
    },
    {
      title: "Pulse Narrative",
      description:
        "Built a data storytelling workflow with reusable modules for analytics, visuals, and publishing automation.",
    },
    {
      title: "Northlight Platform",
      description:
        "Led migration from legacy UI to modular React architecture with measurable performance gains.",
    },
  ],
  experience: [
    {
      company: "Northlight Labs",
      description:
        "Owned frontend platform standards, launched internal design tokens, and improved release confidence across product teams.",
      employed_dates: "2022 - Present",
    },
    {
      company: "Studio Meridian",
      description:
        "Partnered with design and product to ship customer-facing initiatives focused on retention and usability.",
      employed_dates: "2019 - 2022",
    },
  ],
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "Design Systems",
    "Storytelling",
    "Product Strategy",
  ],
};

const templateLoadFallback = () => (
  <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-sm text-muted-foreground">
    Loading template preview...
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

const PREVIEW_SCALE = 0.24;

function TemplateGalleryCard({
  template,
  selectedColor,
  displayMode,
  active,
  onSelect,
}: {
  template: TemplateMeta;
  selectedColor: string;
  displayMode: DisplayMode;
  active: boolean;
  onSelect: (templateId: string) => void;
}) {
  const SelectedTemplate = templateComponentMap[template.id];
  const backgroundColor = modeBackground(displayMode);

  const mockConfig = useMemo(
    () =>
      normalizeTemplateConfig({
        templateId: template.id,
        resumeData: mockResumeForGallery,
        fallbackTheme: {
          primaryColor: selectedColor,
          backgroundColor,
          mode: displayMode,
        },
      }),
    [template.id, selectedColor, backgroundColor, displayMode]
  );

  return (
    <article
      className={`group rounded-2xl border bg-[var(--color-card)]/88 p-4 transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl ${
        active
          ? "border-[var(--color-primary)]/65 shadow-xl"
          : "border-[var(--color-border)]/75 hover:border-[var(--color-primary)]/35"
      }`}
    >
      <div className="mb-4 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/35">
        <div className="relative h-56 overflow-hidden">
          {SelectedTemplate ? (
            <div
              className="absolute inset-0 origin-top-left pointer-events-none"
              style={{
                transform: `scale(${PREVIEW_SCALE})`,
                width: `${100 / PREVIEW_SCALE}%`,
                height: `${100 / PREVIEW_SCALE}%`,
              }}
            >
              <SelectedTemplate
                personalInformation={mockResumeForGallery.personal_information}
                overviewData={mockResumeForGallery.overview}
                projects={mockResumeForGallery.projects}
                experience={mockResumeForGallery.experience}
                skills={mockResumeForGallery.skills}
                mainColor={selectedColor}
                backgroundColor={backgroundColor}
                templateConfig={mockConfig}
              />
            </div>
          ) : (
            <div className="h-full w-full items-center justify-center text-sm text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{template.name}</h3>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            #{template.id}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {template.bestFor.map((label) => (
            <Badge key={`${template.id}-${label}`} className="bg-[var(--color-primary)]/12 text-foreground">
              {label}
            </Badge>
          ))}
        </div>

        <Button
          onClick={() => onSelect(template.id)}
          className="mt-2 w-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90"
        >
          Select And Customize
        </Button>
      </div>
    </article>
  );
}

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#2563EB");
  const [customColor, setCustomColor] = useState<string>("#2563EB");
  const [isCustomColorSelected, setIsCustomColorSelected] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("light");
  const router = useRouter();
  const info = useUser();

  useEffect(() => {
    const storedData = localStorage.getItem("resumeData");
    if (storedData) {
      try {
        setResumeData(JSON.parse(storedData) as ParsedResume);
      } catch (error) {
        console.error("Failed to parse resumeData from localStorage", error);
        router.push("/upload");
      }
    } else {
      router.push("/upload");
    }

    const storedTemplate = localStorage.getItem("selectedTemplate");
    if (storedTemplate) {
      setSelectedTemplate(storedTemplate);
    }

    const storedColor = localStorage.getItem("selectedColor");
    if (storedColor) {
      const normalized = normalizeHexColor(storedColor);
      if (normalized) {
        setSelectedColor(normalized);
        setCustomColor(normalized);
        const isPreset = presetColorOptions.some((option) => option.value.toUpperCase() === normalized);
        setIsCustomColorSelected(!isPreset);
      }
    }

    const storedMode = localStorage.getItem("selectedMode") as DisplayMode | null;
    if (storedMode === "light" || storedMode === "dark") {
      setDisplayMode(storedMode);
    }
  }, [router]);

  const setColorSelection = (value: string, useCustomColor: boolean) => {
    const normalized = normalizeHexColor(value);
    if (!normalized) return;

    setSelectedColor(normalized);
    setCustomColor(normalized);
    setIsCustomColorSelected(useCustomColor);
    localStorage.setItem("selectedColor", normalized);
  };

  const handleSelectTemplate = (templateId: string) => {
    if (!resumeData) return;

    setSelectedTemplate(templateId);
    localStorage.setItem("selectedTemplate", templateId);
    localStorage.setItem("selectedColor", selectedColor);
    localStorage.setItem("selectedMode", displayMode);
    localStorage.removeItem("templateConfig");
    router.push("/customize");
  };

  if (info.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[var(--color-primary)]" />
          <p className="text-muted-foreground">Loading template gallery...</p>
        </div>
      </div>
    );
  }

  if (!info.user) {
    router.push("/signin?next=/templates");
    return null;
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">No resume data found. Upload a resume first.</p>
          <Button onClick={() => router.push("/upload")}>Upload Resume</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-background)] via-[var(--color-background)] to-[var(--color-card)]/35">
      <Header currentPage="templates" />

      <main className="py-8">
        <div className="container-base max-w-7xl space-y-6">
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/65 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
                  <TreePine className="h-8 w-8 text-[var(--color-primary)]" />
                  Premium Template Gallery
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Browse live, scrollable previews. Each card is a real rendered template using normalized mock data.
                </p>
              </div>
              <Badge className="bg-[var(--color-primary)]/12 text-foreground">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                {galleryTemplates.length} Premium Templates
              </Badge>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[var(--color-border)] pt-4">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-[var(--color-primary)]" />
                <span className="text-sm font-medium">Accent</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {presetColorOptions.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    aria-label={`Choose ${color.label}`}
                    title={color.label}
                    onClick={() => setColorSelection(color.value, false)}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      !isCustomColorSelected && selectedColor === color.value.toUpperCase()
                        ? "scale-110 ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-background)]"
                        : "border-[var(--color-border)] hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}

                <label className="sr-only" htmlFor="custom-accent-input">
                  Custom accent color
                </label>
                <input
                  id="custom-accent-input"
                  type="color"
                  value={normalizeHexColor(customColor) ?? "#2563EB"}
                  onChange={(event) => setColorSelection(event.target.value, true)}
                  className="h-8 w-8 cursor-pointer rounded border border-[var(--color-border)] bg-transparent p-0"
                  style={{ color: getContrastTextColor(customColor) }}
                />
              </div>

              <div className="ml-auto flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setDisplayMode("light");
                    localStorage.setItem("selectedMode", "light");
                  }}
                  className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition ${
                    displayMode === "light"
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                      : "text-muted-foreground hover:bg-[var(--color-accent)]"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDisplayMode("dark");
                    localStorage.setItem("selectedMode", "dark");
                  }}
                  className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition ${
                    displayMode === "dark"
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                      : "text-muted-foreground hover:bg-[var(--color-accent)]"
                  }`}
                >
                  <MoonStar className="h-3.5 w-3.5" />
                  Dark
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/65 p-3 shadow-sm backdrop-blur-sm">
            <div className="max-h-[72vh] overflow-y-auto p-2 sm:p-3">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                {galleryTemplates.map((template) => (
                  <TemplateGalleryCard
                    key={template.id}
                    template={template}
                    selectedColor={selectedColor}
                    displayMode={displayMode}
                    active={selectedTemplate === template.id}
                    onSelect={handleSelectTemplate}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
