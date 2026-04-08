"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Loader2, MoonStar, Sparkles, Sun, TreePine } from "lucide-react";
import Header from "@/components/Header";
import { ParsedResume } from "@/constants/ResumeFormat";
import { deserializeTemplateConfig, normalizeTemplateConfig, type TemplateConfig } from "@/lib/template-config";
import { clearPortfolioLinkageKeepTemplateChoice } from "@/lib/portfolio-workflow-storage";
import {
  galleryTemplates,
  templateComponentMap,
  templateLoaderMap,
  type TemplateMeta,
} from "@/lib/template-map";

type DisplayMode = "light" | "dark";

const LIGHT_DISPLAY_BG = "#F8FAFC";
const DARK_DISPLAY_BG = "#111111";

const modeBackground = (mode: DisplayMode): string =>
  mode === "light" ? LIGHT_DISPLAY_BG : DARK_DISPLAY_BG;

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

const mockResumeForGallery: ParsedResume = {
  resume_pdf: "",
  portfolio_id: "gallery-preview",
  personal_information: {
    full_name: "Your Name",
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

const PREVIEW_SCALE = 0.24;
const LG_BREAKPOINT = 1024;
const XXL_BREAKPOINT = 1536;

const getVisibleCountForWidth = (width: number): number => {
  if (width >= XXL_BREAKPOINT) return 3;
  if (width >= LG_BREAKPOINT) return 2;
  return 1;
};

const toCircularIndex = (index: number, total: number): number => {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
};

const getVisibleTemplateIndexes = (
  startIndex: number,
  visibleCount: number,
  totalTemplates: number
): number[] => {
  const count = Math.min(visibleCount, totalTemplates);
  return Array.from({ length: count }, (_, offset) =>
    toCircularIndex(startIndex + offset, totalTemplates)
  );
};

function TemplateGalleryCard({
  template,
  selectedColor,
  displayMode,
  active,
  animateIn,
  resumeData,
  savedConfig,
  onSelect,
}: {
  template: TemplateMeta;
  selectedColor: string;
  displayMode: DisplayMode;
  active: boolean;
  animateIn: boolean;
  resumeData: ParsedResume | null;
  savedConfig: TemplateConfig | null;
  onSelect: (templateId: string) => void;
}) {
  const SelectedTemplate = templateComponentMap[template.id];
  const backgroundColor = modeBackground(displayMode);
  const previewResume = active && resumeData ? resumeData : mockResumeForGallery;
  const previewConfigSource = active ? savedConfig : null;

  const previewConfig = useMemo(
    () => {
      const configWithDisplayTheme = previewConfigSource
        ? {
            ...previewConfigSource,
            theme: {
              ...previewConfigSource.theme,
              primaryColor: selectedColor,
              backgroundColor,
              mode: displayMode,
            },
          }
        : null;

      return normalizeTemplateConfig({
        templateId: template.id,
        resumeData: previewResume,
        config: configWithDisplayTheme,
        fallbackTheme: {
          primaryColor: selectedColor,
          backgroundColor,
          mode: displayMode,
        },
      });
    },
    [template.id, previewResume, previewConfigSource, selectedColor, backgroundColor, displayMode]
  );

  return (
    <article
      className={`group rounded-2xl border bg-[var(--color-card)]/88 p-4 transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl ${
        active
          ? "border-[var(--color-primary)]/65 shadow-xl"
          : "border-[var(--color-border)]/75 hover:border-[var(--color-primary)]/35"
      } ${animateIn ? "template-card-enter" : ""}`}
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
                personalInformation={previewResume.personal_information}
                overviewData={previewResume.overview}
                projects={previewResume.projects}
                experience={previewResume.experience}
                skills={previewResume.skills}
                mainColor={previewConfig.theme.primaryColor}
                backgroundColor={previewConfig.theme.backgroundColor}
                templateConfig={previewConfig}
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
  const totalTemplates = galleryTemplates.length;
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [savedTemplateConfig, setSavedTemplateConfig] = useState<TemplateConfig | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#2563EB");
  const [customColor, setCustomColor] = useState<string>("#2563EB");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("light");
  const [visibleCount, setVisibleCount] = useState<number>(1);
  const [carouselStartIndex, setCarouselStartIndex] = useState<number>(0);
  const [incomingTemplateIds, setIncomingTemplateIds] = useState<string[]>([]);
  const hasNavigatedCarouselRef = useRef<boolean>(false);
  const previousVisibleTemplateIdsRef = useRef<string[]>([]);
  const router = useRouter();
  const info = useUser();

  useEffect(() => {
    const updateVisibleCount = () => {
      const nextVisibleCount = getVisibleCountForWidth(window.innerWidth);
      setVisibleCount(nextVisibleCount);
      if (nextVisibleCount >= totalTemplates) {
        setCarouselStartIndex(0);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [totalTemplates]);

  useEffect(() => {
    const initialVisibleCount = getVisibleCountForWidth(window.innerWidth);
    setVisibleCount(initialVisibleCount);

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
    const hasActivePortfolioLink = Boolean(localStorage.getItem("currentPortfolioId"));
    const storedTemplateConfig = deserializeTemplateConfig(localStorage.getItem("templateConfig"));
    const templateConfigMatchesSelection =
      storedTemplateConfig &&
      ((storedTemplate && String(storedTemplateConfig.templateId) === storedTemplate) ||
        (!storedTemplate && hasActivePortfolioLink));

    if (storedTemplateConfig && !templateConfigMatchesSelection) {
      clearPortfolioLinkageKeepTemplateChoice();
    }

    if (templateConfigMatchesSelection) {
      setSavedTemplateConfig(storedTemplateConfig);
    }

    let initialSelectedTemplateId: string | null = null;
    if (storedTemplate) {
      setSelectedTemplate(storedTemplate);
      initialSelectedTemplateId = storedTemplate;
    } else if (templateConfigMatchesSelection && storedTemplateConfig?.templateId) {
      initialSelectedTemplateId = String(storedTemplateConfig.templateId);
      setSelectedTemplate(initialSelectedTemplateId);
    }

    if (initialSelectedTemplateId) {
      const selectedIndex = galleryTemplates.findIndex(
        (template) => template.id === initialSelectedTemplateId
      );
      if (selectedIndex >= 0) {
        const startIndex = Math.max(
          0,
          selectedIndex - (Math.min(initialVisibleCount, totalTemplates) - 1)
        );
        setCarouselStartIndex(startIndex);
      }
    }

    const storedColor = localStorage.getItem("selectedColor");
    if (storedColor) {
      const normalized = normalizeHexColor(storedColor);
      if (normalized) {
        setSelectedColor(normalized);
        setCustomColor(normalized);
      }
    }

    const storedMode = localStorage.getItem("selectedMode") as DisplayMode | null;
    if (storedMode === "light" || storedMode === "dark") {
      setDisplayMode(storedMode);
    }
  }, [router, totalTemplates]);

  const setColorSelection = (value: string) => {
    const normalized = normalizeHexColor(value);
    if (!normalized) return;

    setSelectedColor(normalized);
    setCustomColor(normalized);
    localStorage.setItem("selectedColor", normalized);
  };

  const visibleTemplateIndexes = useMemo(
    () => getVisibleTemplateIndexes(carouselStartIndex, visibleCount, totalTemplates),
    [carouselStartIndex, visibleCount, totalTemplates]
  );
  const visibleTemplates = useMemo(
    () => visibleTemplateIndexes.map((templateIndex) => galleryTemplates[templateIndex]),
    [visibleTemplateIndexes]
  );
  const effectiveVisibleCount = Math.min(visibleCount, totalTemplates);
  const canNavigate = totalTemplates > effectiveVisibleCount;

  const handleShowPrevious = () => {
    if (!canNavigate) return;
    hasNavigatedCarouselRef.current = true;
    setCarouselStartIndex((current) => toCircularIndex(current - 1, totalTemplates));
  };

  const handleShowNext = () => {
    if (!canNavigate) return;
    hasNavigatedCarouselRef.current = true;
    setCarouselStartIndex((current) => toCircularIndex(current + 1, totalTemplates));
  };

  const handleSelectTemplate = (templateId: string) => {
    if (!resumeData) return;
    const isSwitchingTemplate = selectedTemplate !== null && selectedTemplate !== templateId;

    setSelectedTemplate(templateId);
    localStorage.setItem("selectedTemplate", templateId);
    localStorage.setItem("selectedColor", selectedColor);
    localStorage.setItem("selectedMode", displayMode);
    if (isSwitchingTemplate) {
      localStorage.removeItem("templateConfig");
    }
    router.push("/customize");
  };

  useEffect(() => {
    if (!canNavigate || totalTemplates === 0) return;

    const previousIndex = toCircularIndex(carouselStartIndex - 1, totalTemplates);
    const nextIndex = toCircularIndex(carouselStartIndex + effectiveVisibleCount, totalTemplates);
    const preloadTemplateIds = new Set<string>([
      galleryTemplates[previousIndex]?.id,
      galleryTemplates[nextIndex]?.id,
    ]);

    preloadTemplateIds.forEach((templateId) => {
      const loader = templateLoaderMap[templateId];
      if (!loader) return;
      void loader().catch(() => undefined);
    });
  }, [canNavigate, carouselStartIndex, effectiveVisibleCount, totalTemplates]);

  useEffect(() => {
    const currentTemplateIds = visibleTemplates.map((template) => template.id);
    const previousTemplateIds = previousVisibleTemplateIdsRef.current;

    if (hasNavigatedCarouselRef.current && previousTemplateIds.length > 0) {
      setIncomingTemplateIds(
        currentTemplateIds.filter((templateId) => !previousTemplateIds.includes(templateId))
      );
    } else {
      setIncomingTemplateIds([]);
    }

    previousVisibleTemplateIdsRef.current = currentTemplateIds;
  }, [visibleTemplates]);

  useEffect(() => {
    if (incomingTemplateIds.length === 0) return;

    const timeoutId = window.setTimeout(() => {
      setIncomingTemplateIds([]);
    }, 280);

    return () => window.clearTimeout(timeoutId);
  }, [incomingTemplateIds]);

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
                  Browse live previews with arrows. Each card is a real rendered template using normalized mock data.
                </p>
              </div>
              <Badge className="bg-[var(--color-primary)]/12 text-foreground">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                {galleryTemplates.length} Premium Templates
              </Badge>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[var(--color-border)] pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Custom</span>
                <label className="sr-only" htmlFor="custom-accent-input">
                  Custom template color
                </label>
                <div className="relative h-8 w-28 overflow-hidden rounded-md border border-[var(--color-border)] shadow-sm">
                  <div className="h-full w-full" style={{ backgroundColor: customColor }} />
                  <input
                    id="custom-accent-input"
                    type="color"
                    value={normalizeHexColor(customColor) ?? "#2563EB"}
                    onChange={(event) => setColorSelection(event.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
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
            <div className="flex items-center gap-2 p-2 sm:gap-3 sm:p-3">
              <button
                type="button"
                aria-label="Show previous templates"
                onClick={handleShowPrevious}
                disabled={!canNavigate}
                className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-foreground transition hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                  {visibleTemplates.map((template) => (
                    <TemplateGalleryCard
                      key={template.id}
                      template={template}
                      selectedColor={selectedColor}
                      displayMode={displayMode}
                      active={selectedTemplate === template.id}
                      animateIn={incomingTemplateIds.includes(template.id)}
                      resumeData={resumeData}
                      savedConfig={
                        selectedTemplate === template.id &&
                        savedTemplateConfig &&
                        String(savedTemplateConfig.templateId) === template.id
                          ? savedTemplateConfig
                          : null
                      }
                      onSelect={handleSelectTemplate}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                aria-label="Show next templates"
                onClick={handleShowNext}
                disabled={!canNavigate}
                className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-foreground transition hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
