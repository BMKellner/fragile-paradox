"use client";

import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from "react";

import type { TemplateProps } from "@/components/PortfolioTemplates/shared/portfolioData";
import { resolveTemplateConfigFromProps } from "@/components/PortfolioTemplates/shared/templateConfigAdapter";
import { Particles } from "@/components/ui/particles";
import {
  SectionType,
  type ContactSectionContent,
  type SectionConfig,
  type SectionConfigFor,
} from "@/lib/template-config";

import styles from "./MinimalCreatorHub.module.css";

type NavItem = {
  id: string;
  label: string;
};

type ContactLink = {
  value: string;
  href: string;
  external?: boolean;
};

const normalizeExternalHref = (value: string): string => {
  if (!value) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
};

const textParts = (value: string): string[] =>
  value
    .split(/\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

const navLabel = (section: SectionConfig): string => {
  if (section.navLabel?.trim()) return section.navLabel.trim();

  const titled = section.content as { title?: string };
  if (typeof titled.title === "string" && titled.title.trim()) {
    return titled.title.trim();
  }

  return section.type;
};

const uniqueValues = (values: string[]): string[] => Array.from(new Set(values.filter(Boolean)));

const parseHexColor = (value: string): [number, number, number] | null => {
  const hex = value.trim();
  if (!/^#([\da-f]{3}|[\da-f]{6})$/i.test(hex)) return null;

  const expanded =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;

  return [
    Number.parseInt(expanded.slice(1, 3), 16),
    Number.parseInt(expanded.slice(3, 5), 16),
    Number.parseInt(expanded.slice(5, 7), 16),
  ];
};

const mixHex = (baseColor: string, mixColor: string, ratio: number): string => {
  const base = parseHexColor(baseColor);
  const mix = parseHexColor(mixColor);
  if (!base || !mix) return baseColor;

  const clampedRatio = Math.min(1, Math.max(0, ratio));
  const mixed = base.map((channel, index) =>
    Math.round(channel + (mix[index] - channel) * clampedRatio)
  );

  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
};

const contactLinksFromContent = (content: ContactSectionContent): ContactLink[] =>
  [
    content.email
      ? {
          value: content.email,
          href: `mailto:${content.email}`,
        }
      : null,
    content.linkedin
      ? {
          value: content.linkedin.replace(/^https?:\/\//, ""),
          href: normalizeExternalHref(content.linkedin),
          external: true,
        }
      : null,
    content.phone
      ? {
          value: content.phone,
          href: `tel:${content.phone.replace(/[^\d+]/g, "")}`,
        }
      : null,
  ].filter((entry): entry is ContactLink => Boolean(entry));

const skillValues = (section: SectionConfigFor<SectionType.Skills>, fallbackSkills: string[]): string[] => {
  const groupedSkills = section.content.categories.flatMap((group) =>
    group.skills.map((skill) => skill.trim()).filter(Boolean)
  );
  return uniqueValues(groupedSkills.length ? groupedSkills : fallbackSkills);
};

const isRenderableSection = (section: SectionConfig, fallbackSkills: string[]): boolean => {
  switch (section.type) {
    case SectionType.Hero:
      return Boolean(
        (section.content.fullName || "").trim() ||
          (section.content.careerName || "").trim() ||
          (section.content.summary || "").trim() ||
          (section.content.eyebrow || "").trim()
      );
    case SectionType.About:
      return Boolean((section.content.summary || "").trim());
    case SectionType.Experience:
      return section.content.items.length > 0;
    case SectionType.Education:
      return section.content.entries.length > 0;
    case SectionType.Certifications:
      return section.content.entries.length > 0;
    case SectionType.Projects:
      return section.content.items.length > 0;
    case SectionType.Skills:
      return skillValues(section as SectionConfigFor<SectionType.Skills>, fallbackSkills).length > 0;
    case SectionType.Contact:
      return Boolean(
        contactLinksFromContent(section.content).length || (section.content.address || "").trim()
      );
    default:
      return false;
  }
};

const shouldReduceMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function MinimalCreatorHubTemplate({
  personalInformation,
  overviewData,
  projects,
  experience,
  skills,
  mainColor,
  backgroundColor,
  templateConfig,
}: TemplateProps) {
  const [activeSectionId, setActiveSectionId] = useState("");

  const resolvedConfig = useMemo(
    () =>
      resolveTemplateConfigFromProps({
        templateId: "10",
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
      backgroundColor,
      experience,
      mainColor,
      overviewData,
      personalInformation,
      projects,
      skills,
      templateConfig,
    ]
  );

  const mode = resolvedConfig.theme.mode === "dark" ? "dark" : "light";
  const fallbackSkills = useMemo(() => skills ?? [], [skills]);

  const sections = useMemo(
    () =>
      resolvedConfig.sections.filter(
        (section) => section.enabled && isRenderableSection(section, fallbackSkills)
      ),
    [fallbackSkills, resolvedConfig.sections]
  );

  const navItems = useMemo<NavItem[]>(
    () => sections.map((section) => ({ id: section.id, label: navLabel(section) })),
    [sections]
  );

  const heroSection = useMemo(
    () =>
      sections.find(
        (section): section is SectionConfigFor<SectionType.Hero> => section.type === SectionType.Hero
      ),
    [sections]
  );

  const contactSection = useMemo(
    () =>
      sections.find(
        (section): section is SectionConfigFor<SectionType.Contact> => section.type === SectionType.Contact
      ),
    [sections]
  );

  const heroName =
    (heroSection?.content.fullName || "").trim() || personalInformation?.full_name?.trim() || "";
  const heroRole =
    (heroSection?.content.careerName || "").trim() || overviewData?.career_name?.trim() || "";
  const heroSummary =
    (heroSection?.content.summary || "").trim() || overviewData?.hero_summary?.trim() || "";
  const siteIdentifier = heroName || heroRole;

  const contactLinks = useMemo(
    () => (contactSection ? contactLinksFromContent(contactSection.content) : []),
    [contactSection]
  );

  const themeStyle = useMemo<CSSProperties>(
    () =>
      ({
        "--mc-bg": resolvedConfig.theme.backgroundColor,
        "--mc-primary": resolvedConfig.theme.primaryColor,
      }) as CSSProperties,
    [resolvedConfig.theme.backgroundColor, resolvedConfig.theme.primaryColor]
  );

  const particleColor = useMemo(() => {
    const rawPrimary = resolvedConfig.theme.primaryColor || "#111111";
    const primary = parseHexColor(rawPrimary) ? rawPrimary : "#111111";

    return mode === "dark"
      ? mixHex(primary, "#f8fafc", 0.38)
      : mixHex(primary, "#111111", 0.2);
  }, [mode, resolvedConfig.theme.primaryColor]);

  useEffect(() => {
    setActiveSectionId((current) =>
      navItems.some((item) => item.id === current) ? current : navItems[0]?.id || ""
    );
  }, [navItems]);

  useEffect(() => {
    if (!navItems.length) return;

    const updateActiveSection = () => {
      const threshold = window.innerHeight * 0.3;
      let nextActive = navItems[0].id;

      navItems.forEach((item) => {
        const target = document.getElementById(item.id);
        if (!target) return;

        if (target.getBoundingClientRect().top <= threshold) {
          nextActive = item.id;
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
  }, [navItems]);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: shouldReduceMotion() ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#${sectionId}`);
    setActiveSectionId(sectionId);
  };

  return (
    <div
      className={`${styles.root} ${mode === "dark" ? styles.darkMode : ""}`}
      style={themeStyle}
      data-template-variant="minimal-creator-hub"
      data-template-id={resolvedConfig.templateId}
      data-template-mode={mode}
    >
      <Particles
        className={styles.particlesBackground}
        color={particleColor}
        quantity={mode === "dark" ? 140 : 120}
        size={1.2}
        staticity={56}
        ease={72}
        vx={0.015}
        vy={-0.01}
      />

      <div className={styles.pageLayer}>
        <header className={styles.navBar}>
          <div className={styles.navInner}>
            {siteIdentifier && navItems[0]?.id ? (
              <a
                href={`#${navItems[0].id}`}
                className={styles.siteIdentifier}
                onClick={(event) => handleNavClick(event, navItems[0].id)}
              >
                {siteIdentifier}
              </a>
            ) : (
              <span aria-hidden="true" />
            )}

            {navItems.length ? (
              <nav className={styles.navLinks} aria-label="Sections">
                {navItems.map((item) => (
                  <a
                    key={`minimal-nav-${item.id}`}
                    href={`#${item.id}`}
                    className={`${styles.navLink} ${activeSectionId === item.id ? styles.navLinkActive : ""}`}
                    onClick={(event) => handleNavClick(event, item.id)}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            ) : null}
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.contentColumn}>
            {sections.map((section, index) => {
              const sectionProps = {
                id: section.id,
                "data-customize-section-id": section.id,
                "data-customize-section-type": section.type,
                "data-section-variant": section.variant || "",
                style: { "--section-index": index } as CSSProperties,
              };

              if (section.type === SectionType.Hero) {
                return (
                  <section key={section.id} {...sectionProps} className={`${styles.section} ${styles.hero}`}>
                    {section.content.eyebrow ? <p className={styles.kicker}>{section.content.eyebrow}</p> : null}
                    {heroName ? <h1 className={styles.heroTitle}>{heroName}</h1> : null}
                    {heroRole ? <p className={styles.heroRole}>{heroRole}</p> : null}
                    {heroSummary ? <p className={styles.heroSummary}>{heroSummary}</p> : null}

                    {contactLinks.length ? (
                      <div className={styles.inlineLinks}>
                        {contactLinks.map((link) => (
                          <a
                            key={`${section.id}-${link.href}`}
                            href={link.href}
                            className={styles.textLink}
                            target={link.external ? "_blank" : undefined}
                            rel={link.external ? "noreferrer noopener" : undefined}
                          >
                            {link.value}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </section>
                );
              }

              if (section.type === SectionType.About) {
                const summaryParagraphs = textParts(section.content.summary || "");

                return (
                  <section key={section.id} {...sectionProps} className={styles.section}>
                    <header className={styles.sectionHeader}>
                      {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                    </header>

                    {summaryParagraphs.map((paragraph, index) => (
                      <p key={`${section.id}-about-paragraph-${index}`} className={styles.paragraph}>
                        {paragraph}
                      </p>
                    ))}
                  </section>
                );
              }

              if (section.type === SectionType.Experience) {
                return (
                  <section key={section.id} {...sectionProps} className={styles.section}>
                    <header className={styles.sectionHeader}>
                      {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                    </header>

                    <div className={styles.entryList}>
                      {section.content.items.map((item, index) => (
                        <article key={`${section.id}-experience-${index}`} className={styles.entry}>
                          <div className={styles.entryTitleRow}>
                            {item.company ? <h3 className={styles.entryTitle}>{item.company}</h3> : null}
                            {item.employedDates ? <p className={styles.meta}>{item.employedDates}</p> : null}
                          </div>

                          {item.tags.length ? <p className={styles.meta}>{item.tags.join(" • ")}</p> : null}

                          {item.bullets.length ? (
                            <ul className={styles.bulletList}>
                              {item.bullets.map((bullet, bulletIndex) => (
                                <li key={`${section.id}-experience-bullet-${index}-${bulletIndex}`}>{bullet}</li>
                              ))}
                            </ul>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  </section>
                );
              }

              if (section.type === SectionType.Skills) {
                const groups = section.content.categories.filter((group) =>
                  group.skills.some((skill) => skill.trim())
                );

                const fallbackGroup = skillValues(section, fallbackSkills);
                const itemsToRender = groups.length
                  ? groups
                  : fallbackGroup.length
                    ? [{ title: "", skills: fallbackGroup }]
                    : [];

                return (
                  <section key={section.id} {...sectionProps} className={styles.section}>
                    <header className={styles.sectionHeader}>
                      {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                    </header>

                    <div className={styles.skillGroups}>
                      {itemsToRender.map((group, index) => (
                        <article key={`${section.id}-skills-${index}`} className={styles.entry}>
                          {group.title ? <h3 className={styles.skillGroupTitle}>{group.title}</h3> : null}
                          <p className={styles.commaList}>
                            {group.skills.map((skill) => skill.trim()).filter(Boolean).join(", ")}
                          </p>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              }

              if (section.type === SectionType.Projects) {
                return (
                  <section key={section.id} {...sectionProps} className={styles.section}>
                    <header className={styles.sectionHeader}>
                      {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                    </header>

                    <div className={styles.entryList}>
                      {section.content.items.map((item, index) => (
                        <article key={`${section.id}-project-${index}`} className={styles.entry}>
                          {item.title ? <h3 className={styles.entryTitle}>{item.title}</h3> : null}
                          {item.description ? <p className={styles.paragraph}>{item.description}</p> : null}

                          {item.highlights.length ? (
                            <ul className={styles.bulletList}>
                              {item.highlights.map((highlight, highlightIndex) => (
                                <li key={`${section.id}-project-highlight-${index}-${highlightIndex}`}>
                                  {highlight}
                                </li>
                              ))}
                            </ul>
                          ) : null}

                          {item.tags.length ? <p className={styles.meta}>{item.tags.join(" • ")}</p> : null}

                          {item.links.demo || item.links.code ? (
                            <div className={styles.inlineLinks}>
                              {item.links.demo ? (
                                <a
                                  href={normalizeExternalHref(item.links.demo)}
                                  className={styles.textLink}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                >
                                  {item.links.demo.replace(/^https?:\/\//, "")}
                                </a>
                              ) : null}
                              {item.links.code ? (
                                <a
                                  href={normalizeExternalHref(item.links.code)}
                                  className={styles.textLink}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                >
                                  {item.links.code.replace(/^https?:\/\//, "")}
                                </a>
                              ) : null}
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  </section>
                );
              }

              if (section.type === SectionType.Education) {
                return (
                  <section key={section.id} {...sectionProps} className={styles.section}>
                    <header className={styles.sectionHeader}>
                      {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                    </header>

                    <div className={styles.entryList}>
                      {section.content.entries.map((entry, index) => (
                        <article key={`${section.id}-education-${index}`} className={styles.entry}>
                          {entry.school ? <h3 className={styles.entryTitle}>{entry.school}</h3> : null}
                          {entry.majors.length ? <p className={styles.meta}>{entry.majors.join(", ")}</p> : null}
                          {entry.minors.length ? <p className={styles.meta}>{entry.minors.join(", ")}</p> : null}
                          {entry.expectedGrad ? <p className={styles.meta}>{entry.expectedGrad}</p> : null}
                        </article>
                      ))}
                    </div>
                  </section>
                );
              }

              if (section.type === SectionType.Certifications) {
                return (
                  <section key={section.id} {...sectionProps} className={styles.section}>
                    <header className={styles.sectionHeader}>
                      {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                    </header>

                    <div className={styles.entryList}>
                      {section.content.entries.map((entry, index) => (
                        <article key={`${section.id}-certification-${index}`} className={styles.entry}>
                          {entry.name ? <h3 className={styles.entryTitle}>{entry.name}</h3> : null}
                          {entry.issuer || entry.year ? (
                            <p className={styles.meta}>{[entry.issuer, entry.year].filter(Boolean).join(" • ")}</p>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  </section>
                );
              }

              if (section.type === SectionType.Contact) {
                const links = contactLinksFromContent(section.content);

                return (
                  <section key={section.id} {...sectionProps} className={styles.section}>
                    <header className={styles.sectionHeader}>
                      {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                    </header>

                    {section.content.address ? <p className={styles.paragraph}>{section.content.address}</p> : null}

                    {links.length ? (
                      <div className={styles.inlineLinks}>
                        {links.map((link) => (
                          <a
                            key={`${section.id}-${link.href}`}
                            href={link.href}
                            className={styles.textLink}
                            target={link.external ? "_blank" : undefined}
                            rel={link.external ? "noreferrer noopener" : undefined}
                          >
                            {link.value}
                          </a>
                        ))}
                      </div>
                    ) : null}

                    {section.content.ctaLabel && section.content.email ? (
                      <a href={`mailto:${section.content.email}`} className={styles.textLink}>
                        {section.content.ctaLabel}
                      </a>
                    ) : null}
                  </section>
                );
              }

              const titled = section.content as { title?: string };
              return (
                <section key={section.id} {...sectionProps} className={styles.section}>
                  <header className={styles.sectionHeader}>
                    {titled.title ? <h2 className={styles.sectionTitle}>{titled.title}</h2> : null}
                  </header>
                </section>
              );
            })}
          </div>
        </main>

        <footer className={styles.footer}>
          <div className={styles.contentColumn}>
            <div className={styles.footerInner}>
              {navItems.length ? (
                <div className={styles.footerLinks}>
                  {navItems.map((item) => (
                    <a
                      key={`footer-nav-${item.id}`}
                      href={`#${item.id}`}
                      className={styles.footerLink}
                      onClick={(event) => handleNavClick(event, item.id)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
