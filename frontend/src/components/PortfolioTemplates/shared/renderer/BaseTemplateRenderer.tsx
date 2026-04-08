import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";

import { DotPattern } from "@/components/ui/dot-pattern";
import { ConfettiBackground } from "@/components/ui/confetti";
import { BokehBackground } from "@/components/ui/bokeh";
import { TopographyBackground } from "@/components/ui/topography";
import {
  SectionType,
  getEnabledSections,
  sectionTitle,
  type SectionConfig,
  type TemplateConfig,
} from "@/lib/template-config";
import { cn } from "@/lib/utils";

import { renderSectionContent } from "./SectionRendererRegistry";
import styles from "./BaseTemplateRenderer.module.css";

type BaseTemplateRendererProps = {
  config: TemplateConfig;
  templateVariant?: string;
  className?: string;
  showNav?: boolean;
  navSeparator?: string;
};

const IMMERSIVE_NAV_TYPES: SectionType[] = [
  SectionType.About,
  SectionType.Experience,
  SectionType.Skills,
  SectionType.Projects,
  SectionType.Contact,
];

const navLabelForSection = (section: SectionConfig, templateVariant?: string): string => {
  if (
    (templateVariant === "ide-clean" || templateVariant === "modern-minimal") &&
    section.type === SectionType.Hero
  ) {
    const heroName = (section.content as { fullName?: string }).fullName;
    if (typeof heroName === "string" && heroName.trim()) {
      return heroName.trim();
    }
  }

  if (typeof section.navLabel === "string" && section.navLabel.trim()) {
    return section.navLabel.trim();
  }

  return sectionTitle(section);
};

const firstLastInitials = (label: string): string => {
  const words = label
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "";
  if (words.length === 1) {
    const token = words[0];
    if (token.length <= 2) return token.toUpperCase();
    return `${token[0]}${token[token.length - 1]}`.toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

const parseHexColor = (value?: string): RgbColor | null => {
  if (!value) return null;

  const color = value.trim();
  const normalized = /^#[0-9a-fA-F]{3}$/.test(color)
    ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
    : color;

  if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) return null;

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
};

const mixRgb = (base: RgbColor, target: RgbColor, amount: number): RgbColor => ({
  r: Math.round(base.r + (target.r - base.r) * amount),
  g: Math.round(base.g + (target.g - base.g) * amount),
  b: Math.round(base.b + (target.b - base.b) * amount),
});

const rgba = (color: RgbColor, alpha: number): string =>
  `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;

export function BaseTemplateRenderer({
  config,
  templateVariant,
  className,
  showNav = true,
  navSeparator = " | ",
}: BaseTemplateRendererProps) {
  const sections = useMemo(() => getEnabledSections(config), [config]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isIdeClean = templateVariant === "ide-clean";
  const isBoldBrand = templateVariant === "bold-brand";
  const isSideRailPro = templateVariant === "side-rail-pro";
  const isModernMinimal = templateVariant === "modern-minimal";
  const isImmersiveVariant = isIdeClean || isBoldBrand || isSideRailPro || isModernMinimal;
  const immersiveNavSections = useMemo(
    () => {
      if (isModernMinimal) {
        return sections;
      }

      if (!isIdeClean && !isBoldBrand && !isSideRailPro) {
        return [];
      }

      return IMMERSIVE_NAV_TYPES.map((type) => sections.find((section) => section.type === type)).filter(
        (section): section is SectionConfig => Boolean(section)
      );
    },
    [isBoldBrand, isIdeClean, isModernMinimal, isSideRailPro, sections]
  );
  const [activeSectionId, setActiveSectionId] = useState<string>(
    (isImmersiveVariant ? immersiveNavSections[0]?.id : sections[0]?.id) || ""
  );
  const scrollTrackedSections = isImmersiveVariant
    ? (immersiveNavSections.length ? immersiveNavSections : sections)
    : sections;
  const immersiveVisibleSections = immersiveNavSections.length ? immersiveNavSections : sections;
  const sideRailMonogram = useMemo(() => {
    if (!isSideRailPro) return "";

    const heroSection = sections.find((section) => section.type === SectionType.Hero);
    const heroName = (heroSection?.content as { fullName?: string } | undefined)?.fullName?.trim();
    const fallbackLabel = sections[0] ? navLabelForSection(sections[0], templateVariant) : "Portfolio";

    return firstLastInitials(heroName || fallbackLabel || "Portfolio");
  }, [isSideRailPro, sections, templateVariant]);

  const variantThemeStyles = useMemo<CSSProperties | undefined>(() => {
    if (!isImmersiveVariant) return undefined;

    const mode = config.theme.mode === "light" ? "light" : "dark";
    if (isIdeClean) {
      const primary = config.theme.primaryColor || "#22d3ee";
      const gradient = `linear-gradient(120deg, ${primary} 0%, ${primary} 100%)`;
      const background = config.theme.backgroundColor || (mode === "light" ? "#f8fafc" : "#02030a");

      return {
        "--template-accent": primary,
        "--template-bg": background,
        "--template-gradient": gradient,
        "--template-ink": mode === "light" ? "#111827" : "#e5e7eb",
        "--template-muted": mode === "light" ? "#4b5563" : "#9ca3af",
        "--template-border": mode === "light" ? "rgba(17, 24, 39, 0.16)" : "rgba(229, 231, 235, 0.16)",
      } as CSSProperties;
    }

    if (isBoldBrand) {
      const primary = config.theme.primaryColor || "#ff4d6d";
      const gradient = `linear-gradient(125deg, ${primary} 0%, ${primary} 100%)`;
      const background = mode === "light" ? "#ffffff" : "#000000";

      return {
        "--template-accent": primary,
        "--template-bg": background,
        "--template-gradient": gradient,
        "--template-ink": mode === "light" ? "#271a2f" : "#ffffff",
        "--template-muted": mode === "light" ? "#6e556f" : "#ffffff",
        "--template-border":
          mode === "light" ? "rgba(74, 45, 82, 0.25)" : "rgba(250, 206, 255, 0.18)",
      } as CSSProperties;
    }

    if (isSideRailPro) {
      const primary = config.theme.primaryColor || (mode === "light" ? "#0d9488" : "#2dd4bf");
      const background = config.theme.backgroundColor || (mode === "light" ? "#f4f8fb" : "#050c15");
      const gradient =
        mode === "light"
          ? `linear-gradient(130deg, ${primary} 0%, color-mix(in srgb, ${primary} 32%, #ffffff) 62%, #ffffff 100%)`
          : `linear-gradient(130deg, ${primary} 0%, color-mix(in srgb, ${primary} 45%, #0a1222) 60%, #050c15 100%)`;

      return {
        "--template-accent": primary,
        "--template-bg": background,
        "--template-gradient": gradient,
        "--template-ink": mode === "light" ? "#0b1320" : "#e6edf6",
        "--template-muted": mode === "light" ? "#435973" : "#9fb1c8",
        "--template-border": mode === "light" ? "rgba(11, 19, 32, 0.22)" : "rgba(159, 177, 200, 0.25)",
      } as CSSProperties;
    }

    const primary = config.theme.primaryColor || (mode === "light" ? "#0ea5e9" : "#22d3ee");
    const background = config.theme.backgroundColor || (mode === "light" ? "#f8fafc" : "#020617");
    const gradient =
      mode === "light"
        ? `linear-gradient(130deg, ${primary} 0%, color-mix(in srgb, ${primary} 40%, #ffffff) 65%, #ffffff 100%)`
        : `linear-gradient(130deg, ${primary} 0%, color-mix(in srgb, ${primary} 36%, #0f172a) 68%, #020617 100%)`;

    return {
      "--template-accent": primary,
      "--template-bg": background,
      "--template-gradient": gradient,
      "--template-ink": mode === "light" ? "#0f172a" : "#e2e8f0",
      "--template-muted": mode === "light" ? "#475569" : "#94a3b8",
      "--template-border": mode === "light" ? "rgba(15, 23, 42, 0.16)" : "rgba(148, 163, 184, 0.24)",
    } as CSSProperties;
  }, [
    config.theme.backgroundColor,
    config.theme.mode,
    config.theme.primaryColor,
    isBoldBrand,
    isImmersiveVariant,
    isIdeClean,
    isSideRailPro,
  ]);

  useEffect(() => {
    if (!scrollTrackedSections.length) return;
    setActiveSectionId((current) =>
      scrollTrackedSections.some((section) => section.id === current)
        ? current
        : scrollTrackedSections[0].id
    );
  }, [scrollTrackedSections]);

  useEffect(() => {
    if (!isImmersiveVariant || !scrollTrackedSections.length) return;

    const updateActiveSection = () => {
      const threshold = window.innerHeight * 0.33;
      let nextActive = scrollTrackedSections[0].id;

      scrollTrackedSections.forEach((section) => {
        const node = document.getElementById(section.id);
        if (!node) return;

        const { top } = node.getBoundingClientRect();
        if (top <= threshold) {
          nextActive = section.id;
        }
      });

      setActiveSectionId(nextActive);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [isImmersiveVariant, scrollTrackedSections]);

  useEffect(() => {
    if (!isImmersiveVariant) return;

    const root = rootRef.current;
    if (!root) return;
    const activeVariant = templateVariant || "default";

    const revealTargets = Array.from(
      root.querySelectorAll<HTMLElement>(`[data-template-variant="${activeVariant}"] [data-reveal="true"]`)
    );

    if (!revealTargets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          target.dataset.visible = "true";
          observer.unobserve(target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    revealTargets.forEach((target) => {
      target.dataset.visible = "false";
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, [isImmersiveVariant, sections, templateVariant]);

  const dotPatternBaseColor = config.theme.mode === "light" ? "#475569" : "#94a3b8";
  const dotPatternGlowColor = config.theme.primaryColor || "#22d3ee";
  const brandConfettiColors = config.theme.mode === "light"
    ? [
        "rgba(0, 0, 0, 0.42)",
        "rgba(52, 52, 52, 0.34)",
        "rgba(102, 102, 102, 0.3)",
      ]
    : [
        "rgba(255, 255, 255, 0.48)",
        "rgba(230, 230, 230, 0.42)",
        "rgba(204, 204, 204, 0.35)",
      ];
  const brandConfettiAmbient = config.theme.mode === "light"
    ? "radial-gradient(ellipse at 50% 24%, rgba(255,255,255,0.15) 0%, transparent 66%)"
    : "radial-gradient(ellipse at 50% 24%, rgba(255,255,255,0.07) 0%, transparent 66%)";
  const brandConfettiVignette = config.theme.mode === "light"
    ? "radial-gradient(ellipse at center, transparent 0%, transparent 56%, rgba(0,0,0,0.09) 100%)"
    : "radial-gradient(ellipse at center, transparent 0%, transparent 52%, rgba(0,0,0,0.66) 100%)";
  const topographyLineColor =
    config.theme.mode === "light" ? "rgba(15, 23, 42, 0.16)" : "rgba(148, 163, 184, 0.24)";
  const topographyBackgroundColor =
    config.theme.backgroundColor || (config.theme.mode === "light" ? "#f8fafc" : "#020617");
  const sideRailBokehPalette = useMemo(() => {
    const mode = config.theme.mode === "light" ? "light" : "dark";
    const base =
      parseHexColor(config.theme.primaryColor) || (mode === "light" ? { r: 13, g: 148, b: 136 } : { r: 45, g: 212, b: 191 });
    const bright = mixRgb(base, { r: 255, g: 255, b: 255 }, mode === "light" ? 0.5 : 0.24);
    const soft = mixRgb(base, { r: 99, g: 102, b: 241 }, 0.18);
    const deep = mixRgb(base, { r: 9, g: 15, b: 28 }, mode === "light" ? 0.22 : 0.38);

    return {
      background: config.theme.backgroundColor || (mode === "light" ? "#f4f8fb" : "#050c15"),
      colors: [
        rgba(bright, mode === "light" ? 0.27 : 0.2),
        rgba(base, mode === "light" ? 0.24 : 0.18),
        rgba(soft, mode === "light" ? 0.2 : 0.15),
        rgba(deep, mode === "light" ? 0.19 : 0.14),
      ],
      ambient:
        mode === "light"
          ? `radial-gradient(circle at 20% 16%, ${rgba(bright, 0.32)} 0%, transparent 47%), radial-gradient(circle at 80% 12%, ${rgba(soft, 0.24)} 0%, transparent 43%)`
          : `radial-gradient(circle at 22% 14%, ${rgba(bright, 0.2)} 0%, transparent 44%), radial-gradient(circle at 78% 11%, ${rgba(base, 0.18)} 0%, transparent 42%)`,
      vignette:
        mode === "light"
          ? `radial-gradient(ellipse at center, transparent 0%, transparent 62%, ${rgba(deep, 0.28)} 100%)`
          : "radial-gradient(ellipse at center, transparent 0%, transparent 56%, rgba(2, 6, 15, 0.74) 100%)",
    };
  }, [config.theme.backgroundColor, config.theme.mode, config.theme.primaryColor]);
  const handleImmersiveNavClick = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#${sectionId}`);
  };

  if (templateVariant === "debug-template") {
    return (
      <div
        className={className}
        data-template-variant={templateVariant}
        data-template-id={config.templateId}
      >
        {showNav ? (
          <nav>
            {sections.map((section, index) => (
              <span key={`nav-plain-${section.id}`}>
                <a href={`#${section.id}`}>{navLabelForSection(section, templateVariant)}</a>
                {index < sections.length - 1 ? navSeparator : null}
              </span>
            ))}
          </nav>
        ) : null}

        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            data-customize-section-id={section.id}
            data-customize-section-type={section.type}
            data-section-variant={section.variant || ""}
          >
            {renderSectionContent(section)}
          </section>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn(styles.root, className)}
      data-template-variant={templateVariant || "default"}
      data-template-mode={isImmersiveVariant ? config.theme.mode : undefined}
      data-template-id={config.templateId}
      style={variantThemeStyles}
    >
      {isImmersiveVariant ? (
        <div className={styles.ideBackdrop} aria-hidden="true">
          {isIdeClean ? (
            <DotPattern
              className={styles.ideDotPattern}
              dotSize={2}
              gap={18}
              baseColor={dotPatternBaseColor}
              glowColor={dotPatternGlowColor}
              proximity={210}
              glowIntensity={1.45}
              waveSpeed={0.52}
            />
          ) : isModernMinimal ? (
            <TopographyBackground
              className={styles.modernTopography}
              lineCount={config.theme.mode === "light" ? 20 : 26}
              lineColor={topographyLineColor}
              backgroundColor={topographyBackgroundColor}
              speed={config.theme.mode === "light" ? 0.58 : 0.74}
              strokeWidth={config.theme.mode === "light" ? 0.9 : 1.05}
            />
          ) : isSideRailPro ? (
            <BokehBackground
              className={styles.sideRailBokeh}
              count={config.theme.mode === "light" ? 24 : 28}
              minSize={config.theme.mode === "light" ? 90 : 80}
              maxSize={config.theme.mode === "light" ? 250 : 230}
              speed={config.theme.mode === "light" ? 0.75 : 0.68}
              colors={sideRailBokehPalette.colors}
              backgroundColor={sideRailBokehPalette.background}
              ambientGradient={sideRailBokehPalette.ambient}
              vignette={sideRailBokehPalette.vignette}
            />
          ) : (
            <ConfettiBackground
              className={styles.brandConfetti}
              count={config.theme.mode === "light" ? 28 : 30}
              colors={brandConfettiColors}
              gravity={config.theme.mode === "light" ? 0.018 : 0.022}
              wind={config.theme.mode === "light" ? 0.0026 : 0.0035}
              ambientGradient={brandConfettiAmbient}
              vignette={brandConfettiVignette}
            />
          )}
        </div>
      ) : null}

      {showNav ? (
        isImmersiveVariant ? (
          <nav className={cn(styles.nav, styles.ideNav)} aria-label="Portfolio section navigation">
            {isSideRailPro ? (
              <>
                <span className={styles.sideRailNavMark} aria-hidden="true">
                  {sideRailMonogram}
                </span>
                <div className={cn(styles.ideNavLinks, styles.sideRailNavRoutes)}>
                  {immersiveVisibleSections.map((section) => (
                    <a
                      key={`ide-nav-${section.id}`}
                      href={`#${section.id}`}
                      className={cn(styles.navLink, activeSectionId === section.id && styles.ideNavLinkActive)}
                      onClick={(event) => handleImmersiveNavClick(event, section.id)}
                    >
                      {navLabelForSection(section, templateVariant)}
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.ideNavLinks}>
                {immersiveVisibleSections.map((section) => (
                  <a
                    key={`ide-nav-${section.id}`}
                    href={`#${section.id}`}
                    className={cn(styles.navLink, activeSectionId === section.id && styles.ideNavLinkActive)}
                    onClick={(event) => handleImmersiveNavClick(event, section.id)}
                  >
                    {navLabelForSection(section, templateVariant)}
                  </a>
                ))}
              </div>
            )}
          </nav>
        ) : (
          <nav className={styles.nav}>
            {sections.map((section, index) => (
              <span key={`nav-${section.id}`} className={styles.navItem}>
                <a href={`#${section.id}`} className={styles.navLink}>
                  {navLabelForSection(section, templateVariant)}
                </a>
                {index < sections.length - 1 ? (
                  <span className={styles.navSeparator}>{navSeparator}</span>
                ) : null}
              </span>
            ))}
          </nav>
        )
      ) : null}

      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          data-customize-section-id={section.id}
          data-customize-section-type={section.type}
          data-section-variant={section.variant || ""}
          data-reveal={isImmersiveVariant && section.type !== SectionType.Hero ? "true" : undefined}
          data-visible={isImmersiveVariant && section.type !== SectionType.Hero ? "false" : undefined}
          style={
            isImmersiveVariant && section.type !== SectionType.Hero
              ? ({ "--reveal-index": index } as CSSProperties)
              : undefined
          }
          className={styles.section}
        >
          <div className={styles.sectionContent}>{renderSectionContent(section)}</div>
        </section>
      ))}
    </div>
  );
}
