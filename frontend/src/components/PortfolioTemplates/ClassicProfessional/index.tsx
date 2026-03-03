"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Menu, X } from "lucide-react";
import {
  SectionType,
  type AboutSectionContent,
  type ContactSectionContent,
  type ExperienceSectionContent,
  type HeroSectionContent,
  type ProjectsSectionContent,
} from "@/lib/template-config";
import { enabledSections, resolveTemplateConfigFromProps } from "@/components/PortfolioTemplates/shared/templateConfigAdapter";
import { isLightColor, sanitizeHexColor, type TemplateProps } from "@/components/PortfolioTemplates/shared/portfolioData";
import {
  buildAboutFacts,
  mapExperienceItemsToTimeline,
  mapStatsToRadials,
} from "./data";
import styles from "./ClassicProfessional.module.css";
import { AboutSection } from "./sections/AboutSection";
import { ContactSection } from "./sections/ContactSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { HeroSection } from "./sections/HeroSection";
import { ProjectsPlaceholderSection } from "./sections/ProjectsPlaceholderSection";

type NavSectionId = "about" | "experience" | "projects" | "contact";

type ContentSectionType =
  | SectionType.About
  | SectionType.Experience
  | SectionType.Projects
  | SectionType.Contact;

const CONTENT_SECTION_TYPES: ContentSectionType[] = [
  SectionType.About,
  SectionType.Experience,
  SectionType.Projects,
  SectionType.Contact,
];

const NAV_ANCHOR_BY_TYPE: Record<ContentSectionType, NavSectionId> = {
  [SectionType.About]: "about",
  [SectionType.Experience]: "experience",
  [SectionType.Projects]: "projects",
  [SectionType.Contact]: "contact",
};

const NAV_LABEL_BY_TYPE: Record<ContentSectionType, string> = {
  [SectionType.About]: "About",
  [SectionType.Experience]: "Experience",
  [SectionType.Projects]: "Projects",
  [SectionType.Contact]: "Contact",
};

const DEFAULT_GRADIENT_COLORS = ["#3b82f6", "#8b5cf6", "#ef4444"] as const;

const extractGradientStops = (gradient: string | undefined): [string, string, string] => {
  if (!gradient) return [...DEFAULT_GRADIENT_COLORS];

  const matches = gradient.match(
    /#(?:[0-9a-fA-F]{3,8})|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|color\([^)]*\)/g
  );

  if (!matches?.length) return [...DEFAULT_GRADIENT_COLORS];

  const [first, second, third] = [
    matches[0] ?? DEFAULT_GRADIENT_COLORS[0],
    matches[1] ?? matches[0] ?? DEFAULT_GRADIENT_COLORS[1],
    matches[2] ?? matches[1] ?? matches[0] ?? DEFAULT_GRADIENT_COLORS[2],
  ];

  return [first, second, third];
};

const isContentSectionType = (type: SectionType): type is ContentSectionType => {
  return CONTENT_SECTION_TYPES.includes(type as ContentSectionType);
};

const locationLabelFromAddress = (address: string | undefined): string => {
  const candidate = address?.trim();
  if (!candidate) return "Add Location";

  const normalized = candidate.toLowerCase();
  if (["remote", "n/a", "na", "unknown", "not provided"].includes(normalized)) {
    return "Add Location";
  }

  return candidate;
};

export default function ClassicProfessionalPortfolio({
  personalInformation,
  overviewData,
  projects,
  experience,
  skills,
  mainColor,
  backgroundColor,
  templateConfig,
}: TemplateProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<NavSectionId>("about");

  const resolvedConfig = useMemo(
    () =>
      resolveTemplateConfigFromProps({
        templateId: "2",
        templateConfig,
        personalInformation,
        overviewData,
        projects,
        experience,
        skills,
        mainColor,
        backgroundColor,
      }),
    [
      templateConfig,
      personalInformation,
      overviewData,
      projects,
      experience,
      skills,
      mainColor,
      backgroundColor,
    ]
  );

  const sections = useMemo(() => enabledSections(resolvedConfig), [resolvedConfig]);

  const heroSection = sections.find((section) => section.type === SectionType.Hero);
  const heroContent =
    (heroSection?.content as HeroSectionContent | undefined) ??
    ({
      title: "Hero",
      eyebrow: "Portfolio",
      fullName: "Your Name",
      careerName: "Full-Stack Engineer",
      summary: "",
      primaryCtaLabel: "Reach Out",
      secondaryCtaLabel: "Copy Email",
    } satisfies HeroSectionContent);

  const aboutSection = sections.find((section) => section.type === SectionType.About);
  const experienceSection = sections.find((section) => section.type === SectionType.Experience);
  const projectsSection = sections.find((section) => section.type === SectionType.Projects);
  const contactSection = sections.find((section) => section.type === SectionType.Contact);

  const orderedSectionTypes = useMemo<ContentSectionType[]>(() => {
    const seen = new Set<ContentSectionType>();
    const ordered: ContentSectionType[] = [];

    sections.forEach((section) => {
      if (!isContentSectionType(section.type) || seen.has(section.type)) return;
      seen.add(section.type);
      ordered.push(section.type);
    });

    return ordered;
  }, [sections]);

  const githubUrl = useMemo(() => {
    return (
      projects
        ?.find((item) => typeof item !== "string" && /github\.com/i.test(item.description))
        ?.description.match(/https?:\/\/[^\s)]+/i)?.[0] ?? ""
    );
  }, [projects]);

  const themeMode = useMemo<"light" | "dark">(() => {
    const configuredMode = resolvedConfig.theme.mode;
    if (configuredMode === "light" || configuredMode === "dark") return configuredMode;

    const fallbackBackground = sanitizeHexColor(
      resolvedConfig.theme.backgroundColor,
      backgroundColor || "#09090b"
    );
    return isLightColor(fallbackBackground, 170) ? "light" : "dark";
  }, [resolvedConfig.theme.mode, resolvedConfig.theme.backgroundColor, backgroundColor]);

  const themeVars = useMemo(() => {
    const primary = sanitizeHexColor(resolvedConfig.theme.primaryColor, mainColor || "#3b82f6");
    const accentGradient =
      resolvedConfig.theme.accentGradient?.trim() ||
      `linear-gradient(130deg, ${primary} 0%, #8b5cf6 56%, #ef4444 100%)`;
    const [accentA, accentB, accentC] = extractGradientStops(accentGradient);
    const background = sanitizeHexColor(
      resolvedConfig.theme.backgroundColor,
      themeMode === "dark" ? "#09090b" : "#eef2ff"
    );

    const vars = {
      "--terris-primary": primary,
      "--terris-accent-gradient": accentGradient,
      "--terris-accent-a": accentA,
      "--terris-accent-b": accentB,
      "--terris-accent-c": accentC,
      "--terris-background": background,
      "--terris-card": themeMode === "dark" ? "#111827" : "#ffffff",
      "--terris-foreground": themeMode === "dark" ? "#f9fafb" : "#111827",
      "--terris-muted": themeMode === "dark" ? "#94a3b8" : "#475569",
      "--terris-border":
        themeMode === "dark"
          ? "color-mix(in srgb, var(--terris-background) 62%, #cbd5e1 38%)"
          : "color-mix(in srgb, var(--terris-background) 76%, #0f172a 24%)",
      "--terris-cta-bg": themeMode === "dark" ? "#ffffff" : "#020617",
      "--terris-cta-fg": themeMode === "dark" ? "#020617" : "#ffffff",
      "--terris-cta-hover": themeMode === "dark" ? "#e2e8f0" : "#1e293b",
    } satisfies Record<string, string>;

    return vars as CSSProperties;
  }, [
    resolvedConfig.theme.primaryColor,
    resolvedConfig.theme.accentGradient,
    resolvedConfig.theme.backgroundColor,
    mainColor,
    themeMode,
  ]);

  const navTitle = heroContent.fullName?.trim() || "Your Name";

  const navItems = useMemo(
    () =>
      orderedSectionTypes.map((type) => {
        const section =
          type === SectionType.About
            ? aboutSection
            : type === SectionType.Experience
            ? experienceSection
            : type === SectionType.Projects
            ? projectsSection
            : contactSection;

        return {
          id: NAV_ANCHOR_BY_TYPE[type],
          label: section?.navLabel?.trim() || NAV_LABEL_BY_TYPE[type],
        };
      }),
    [orderedSectionTypes, aboutSection, experienceSection, projectsSection, contactSection]
  );

  useEffect(() => {
    if (!navItems.length) return;
    if (!navItems.some((item) => item.id === activeSection)) {
      setActiveSection(navItems[0].id);
    }
  }, [navItems, activeSection]);

  useEffect(() => {
    const ids = navItems.map((item) => item.id);
    const observed = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!observed.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const id = visible[0]?.target.id as NavSectionId | undefined;
        if (id) setActiveSection(id);
      },
      {
        threshold: [0.2, 0.45, 0.7],
        rootMargin: "-40% 0px -45% 0px",
      }
    );

    observed.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [navItems]);

  const scrollToSection = (id: NavSectionId) => {
    setMenuOpen(false);
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={`${styles.root} relative min-h-screen w-full bg-[var(--terris-background)] text-[var(--terris-foreground)] transition-colors duration-300`}
      data-template-mode={themeMode}
      style={themeVars}
    >
      <div className={styles.pageBackdrop} aria-hidden="true" />

      <header className="sticky top-0 z-50 border-b border-[var(--terris-border)]/80 bg-[var(--terris-background)]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="truncate text-sm font-semibold tracking-wide text-[var(--terris-foreground)]">
            {navTitle}
          </span>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Template section navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`${styles.navLink} ${activeSection === item.id ? styles.navActive : ""}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--terris-border)] text-[var(--terris-foreground)] md:hidden"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-[var(--terris-border)] px-4 py-4 md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={`mobile-${item.id}`}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`${styles.navLink} text-left ${activeSection === item.id ? styles.navActive : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <main className="min-h-screen snap-y snap-mandatory bg-[var(--terris-background)]">
        <HeroSection
          fullName={heroContent.fullName || "Your Name"}
          careerName={heroContent.careerName || "Full-Stack Engineer"}
          summary={heroContent.summary}
          scrollTargetId={navItems[0]?.id || "about"}
        />

        {orderedSectionTypes.map((type) => {
          if (type === SectionType.About) {
            const aboutContent =
              (aboutSection?.content as AboutSectionContent | undefined) ??
              ({
                title: "About",
                subtitle: "Focused on clean architecture, thoughtful interfaces, and scalable delivery.",
                summary: heroContent.summary,
                educationLabel: "Education",
                educationDetails: "",
                stats: [],
              } satisfies AboutSectionContent);

            const aboutFacts = buildAboutFacts({
              summary: aboutContent.summary || heroContent.summary,
              subtitle: aboutContent.subtitle,
              educationDetails: aboutContent.educationDetails,
            });

            return (
              <AboutSection
                key={type}
                title={aboutContent.title || "About"}
                subtitle={aboutContent.subtitle}
                facts={aboutFacts}
                stats={mapStatsToRadials(aboutContent.stats)}
              />
            );
          }

          if (type === SectionType.Experience) {
            const experienceContent =
              (experienceSection?.content as ExperienceSectionContent | undefined) ??
              ({
                title: "Experience",
                subtitle: "Career highlights with outcome-focused details.",
                items: [],
              } satisfies ExperienceSectionContent);

            return (
              <ExperienceSection
                key={type}
                title={experienceContent.title || "Work Experience"}
                subtitle={experienceContent.subtitle}
                entries={mapExperienceItemsToTimeline(
                  experienceContent.items,
                  heroContent.careerName || "Senior Engineer"
                )}
              />
            );
          }

          if (type === SectionType.Projects) {
            const projectsContent =
              (projectsSection?.content as ProjectsSectionContent | undefined) ??
              ({
                title: "Projects",
                subtitle: "Selected product and engineering work with measurable outcomes.",
                items: [],
              } satisfies ProjectsSectionContent);

            return (
              <ProjectsPlaceholderSection
                key={type}
                title={projectsContent.title || "Projects"}
                subtitle={projectsContent.subtitle || "Selected product and engineering work."}
                items={projectsContent.items}
              />
            );
          }

          const contactContent =
            (contactSection?.content as ContactSectionContent | undefined) ??
            ({
              title: "Contact",
              subtitle: "Interested in working together? Let's build something meaningful.",
              email: "hello@example.com",
              phone: "",
              address: "",
              linkedin: "",
              ctaLabel: "Say Hello",
            } satisfies ContactSectionContent);

          return (
            <ContactSection
              key={type}
              fullName={heroContent.fullName || "Your Name"}
              title={contactContent.title || "Get In Touch"}
              subtitle={contactContent.subtitle}
              ctaLabel={contactContent.ctaLabel}
              email={contactContent.email || "hello@example.com"}
              linkedin={contactContent.linkedin}
              github={githubUrl}
              location={locationLabelFromAddress(contactContent.address)}
            />
          );
        })}
      </main>
    </div>
  );
}
