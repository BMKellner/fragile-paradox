"use client";

import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ExternalLink, Linkedin, Mail, Phone } from "lucide-react";

import type { TemplateProps } from "@/components/PortfolioTemplates/shared/portfolioData";
import { resolveTemplateConfigFromProps } from "@/components/PortfolioTemplates/shared/templateConfigAdapter";
import BackgroundGradient from "@/components/ui/gradient";
import {
  SectionType,
  type ContactSectionContent,
  type SectionConfig,
  type SectionConfigFor,
} from "@/lib/template-config";

import styles from "./EditorialStory.module.css";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type NavItem = {
  id: string;
  label: string;
};

type ContactLink = {
  label: string;
  value: string;
  href: string;
  icon: typeof Mail;
  external?: boolean;
};

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part.trim()[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const normalizeExternalHref = (value: string): string => {
  if (!value) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: EASE_OUT,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASE_OUT,
    },
  },
};

const navLabel = (section: SectionConfig): string => {
  if (section.navLabel?.trim()) return section.navLabel.trim();

  if (typeof (section.content as { title?: string }).title === "string") {
    const title = ((section.content as { title?: string }).title || "").trim();
    if (title) return title;
  }

  return section.type;
};

const joinParts = (parts: string[]): string => parts.map((part) => part.trim()).filter(Boolean).join(" ");

const uniqueValues = (values: string[]): string[] => Array.from(new Set(values.filter(Boolean)));

const contactLinksFromContent = (content: ContactSectionContent): ContactLink[] =>
  [
    content.email
      ? {
          label: "Email",
          value: content.email,
          href: `mailto:${content.email}`,
          icon: Mail,
        }
      : null,
    content.linkedin
      ? {
          label: "LinkedIn",
          value: content.linkedin.replace(/^https?:\/\//, ""),
          href: normalizeExternalHref(content.linkedin),
          icon: Linkedin,
          external: true,
        }
      : null,
    content.phone
      ? {
          label: "Phone",
          value: content.phone,
          href: `tel:${content.phone.replace(/[^\d+]/g, "")}`,
          icon: Phone,
        }
      : null,
  ].filter((link): link is ContactLink => Boolean(link));

const skillsForSection = (
  section: SectionConfigFor<SectionType.Skills>,
  fallbackSkills: string[]
): string[] => {
  const fromCategories = section.content.categories.flatMap((category) => category.skills);
  return uniqueValues(fromCategories.length ? fromCategories : fallbackSkills);
};

const isRenderableSection = (section: SectionConfig, fallbackSkills: string[]): boolean => {
  switch (section.type) {
    case SectionType.Hero:
      return true;
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
      return skillsForSection(section as SectionConfigFor<SectionType.Skills>, fallbackSkills).length > 0;
    case SectionType.Contact:
      return contactLinksFromContent(section.content).length > 0;
    default:
      return false;
  }
};

export default function EditorialStoryTemplate({
  personalInformation,
  overviewData,
  projects,
  experience,
  skills,
  mainColor,
  backgroundColor,
  templateConfig,
  canvasEditor,
}: TemplateProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeSectionId, setActiveSectionId] = useState("");

  const resolvedConfig = useMemo(
    () =>
      resolveTemplateConfigFromProps({
        templateId: "6",
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
  const neutralTone = mode === "dark" ? "#000000" : "#ffffff";
  const inkTone = mode === "dark" ? "#ffffff" : "#000000";
  const accentTwo = resolvedConfig.theme.primaryColor;

  const fallbackSkills = useMemo(() => skills ?? [], [skills]);

  const renderableSections = useMemo(
    () =>
      resolvedConfig.sections.filter(
        (section) => section.enabled && isRenderableSection(section, fallbackSkills)
      ),
    [fallbackSkills, resolvedConfig.sections]
  );

  const heroSection = useMemo(
    () => renderableSections.find((section) => section.type === SectionType.Hero),
    [renderableSections]
  );

  const hiddenProjectsModel = useMemo(
    () =>
      renderableSections
        .filter((section) => section.type === SectionType.Projects)
        .flatMap((section) => section.content.items),
    [renderableSections]
  );

  const fullName =
    (heroSection?.type === SectionType.Hero ? heroSection.content.fullName : "")?.trim() ||
    personalInformation?.full_name?.trim() ||
    "";
  const careerName =
    (heroSection?.type === SectionType.Hero ? heroSection.content.careerName : "")?.trim() ||
    overviewData?.career_name?.trim() ||
    "";

  const navItems = useMemo<NavItem[]>(
    () => renderableSections.map((section) => ({ id: section.id, label: navLabel(section) })),
    [renderableSections]
  );

  const themeStyle = useMemo<CSSProperties>(
    () =>
      ({
        "--editorial-bg": resolvedConfig.theme.backgroundColor,
        "--editorial-accent": resolvedConfig.theme.primaryColor,
        "--editorial-accent-2": accentTwo,
        "--editorial-neutral": neutralTone,
        "--editorial-ink": inkTone,
      }) as CSSProperties,
    [accentTwo, inkTone, neutralTone, resolvedConfig.theme.backgroundColor, resolvedConfig.theme.primaryColor]
  );

  useEffect(() => {
    setActiveSectionId((currentId) =>
      navItems.some((item) => item.id === currentId) ? currentId : navItems[0]?.id || ""
    );
  }, [navItems]);

  useEffect(() => {
    if (!navItems.length) return;

    const updateActiveSection = () => {
      const threshold = window.innerHeight * 0.33;
      let nextActive = navItems[0].id;

      navItems.forEach((item) => {
        const node = document.getElementById(item.id);
        if (!node) return;

        if (node.getBoundingClientRect().top <= threshold) {
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
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#${sectionId}`);
  };

  const revealSectionProps = prefersReducedMotion
    ? {}
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, amount: 0.2 },
        variants: sectionVariants,
      };

  return (
    <div
      className={styles.root}
      style={themeStyle}
      data-template-variant="editorial-story"
      data-template-id={resolvedConfig.templateId}
      data-template-mode={mode}
      data-project-model-count={hiddenProjectsModel.length}
    >
      <BackgroundGradient
        className={styles.backgroundLayer}
        baseColor={resolvedConfig.theme.backgroundColor}
        primaryColor={resolvedConfig.theme.primaryColor}
        secondaryColor={neutralTone}
      />

      <motion.header
        className={styles.navWrap}
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: EASE_OUT }}
      >
        <div className={styles.nav}>
          <a
            href={heroSection ? `#${heroSection.id}` : "#"}
            className={styles.brand}
            onClick={(event) => {
              if (!heroSection) return;
              handleNavClick(event, heroSection.id);
            }}
          >
            {fullName ? <span className={styles.brandBadge}>{getInitials(fullName)}</span> : null}
            <span className={styles.brandText}>
              {fullName ? <strong>{fullName}</strong> : null}
              {careerName ? <span>{careerName}</span> : null}
            </span>
          </a>

          <nav className={styles.navLinks} aria-label="Portfolio section navigation">
            {navItems.map((item) => (
              <a
                key={`editorial-nav-${item.id}`}
                href={`#${item.id}`}
                className={`${styles.navLink} ${activeSectionId === item.id ? styles.navLinkActive : ""}`}
                onClick={(event) => handleNavClick(event, item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </motion.header>

      <motion.main
        className={styles.main}
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.56, ease: EASE_OUT }}
      >
        {renderableSections.map((section) => {
          if (section.type === SectionType.Hero) {
            const content = section.content;
            const heroSummary = content.summary?.trim() || overviewData?.hero_summary?.trim() || "";

            return (
              <motion.section
                key={section.id}
                id={section.id}
                data-customize-section-id={section.id}
                data-customize-section-type={section.type}
                data-section-variant={section.variant || ""}
                className={styles.hero}
                initial={prefersReducedMotion ? undefined : "hidden"}
                animate={prefersReducedMotion ? undefined : "visible"}
                variants={prefersReducedMotion ? undefined : sectionVariants}
              >
                {content.eyebrow ? (
                  <motion.p className={styles.sectionLabel} variants={prefersReducedMotion ? undefined : itemVariants}>
                    {content.eyebrow}
                  </motion.p>
                ) : null}
                {fullName ? (
                  <motion.h1 className={styles.heroTitle} variants={prefersReducedMotion ? undefined : itemVariants}>
                    {fullName}
                  </motion.h1>
                ) : null}
                {careerName ? (
                  <motion.p className={styles.heroRole} variants={prefersReducedMotion ? undefined : itemVariants}>
                    {careerName}
                  </motion.p>
                ) : null}
                {heroSummary ? (
                  <motion.p className={styles.heroSummary} variants={prefersReducedMotion ? undefined : itemVariants}>
                    {heroSummary}
                  </motion.p>
                ) : null}
              </motion.section>
            );
          }

          if (section.type === SectionType.About) {
            const paragraphs = (section.content.summary || "")
              .split(/\n+/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean);

            if (!paragraphs.length) return null;

            return (
              <motion.section
                key={section.id}
                id={section.id}
                data-customize-section-id={section.id}
                data-customize-section-type={section.type}
                data-section-variant={section.variant || ""}
                className={styles.section}
                {...revealSectionProps}
              >
                <motion.header className={styles.sectionHeader} variants={prefersReducedMotion ? undefined : itemVariants}>
                  <p className={styles.sectionLabel}>{section.type}</p>
                  {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                </motion.header>

                <motion.article
                  className={`${styles.card} ${styles.interactiveCard}`}
                  variants={prefersReducedMotion ? undefined : itemVariants}
                >
                  {paragraphs.map((paragraph, index) => (
                    <p key={`${section.id}-paragraph-${index}`}>{paragraph}</p>
                  ))}
                </motion.article>
              </motion.section>
            );
          }

          if (section.type === SectionType.Experience) {
            return (
              <motion.section
                key={section.id}
                id={section.id}
                data-customize-section-id={section.id}
                data-customize-section-type={section.type}
                data-section-variant={section.variant || ""}
                className={styles.section}
                {...revealSectionProps}
              >
                <motion.header className={styles.sectionHeader} variants={prefersReducedMotion ? undefined : itemVariants}>
                  <p className={styles.sectionLabel}>{section.type}</p>
                  {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                </motion.header>

                <div className={styles.sectionStack}>
                  {section.content.items.map((item, index) => (
                    <motion.article
                      key={`${section.id}-experience-${item.company}-${index}`}
                      className={`${styles.card} ${styles.experienceCard} ${styles.interactiveCard}`}
                      variants={prefersReducedMotion ? undefined : itemVariants}
                    >
                      <div className={styles.experienceTop}>
                        {item.company ? <h3>{item.company}</h3> : null}
                        {item.employedDates ? <p className={styles.experienceDate}>{item.employedDates}</p> : null}
                      </div>
                      {item.bullets.length ? (
                        <ul className={styles.experienceBullets}>
                          {item.bullets.map((bullet, bulletIndex) => (
                            <li key={`${section.id}-experience-bullet-${index}-${bulletIndex}`}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                    </motion.article>
                  ))}
                </div>
              </motion.section>
            );
          }

          if (section.type === SectionType.Education) {
            return (
              <motion.section
                key={section.id}
                id={section.id}
                data-customize-section-id={section.id}
                data-customize-section-type={section.type}
                data-section-variant={section.variant || ""}
                className={styles.section}
                {...revealSectionProps}
              >
                <motion.header className={styles.sectionHeader} variants={prefersReducedMotion ? undefined : itemVariants}>
                  <p className={styles.sectionLabel}>{section.type}</p>
                  {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                </motion.header>

                <div className={styles.sectionStack}>
                  {section.content.entries.map((entry, index) => {
                    const details = [entry.majors.join(", "), entry.minors.join(", "), entry.expectedGrad].filter(
                      (value) => value.trim()
                    );

                    return (
                      <motion.article
                        key={`${section.id}-education-${entry.school}-${index}`}
                        className={`${styles.card} ${styles.interactiveCard}`}
                        variants={prefersReducedMotion ? undefined : itemVariants}
                      >
                        {entry.school ? <h3 className={styles.cardHeading}>{entry.school}</h3> : null}
                        {details.length
                          ? details.map((line, lineIndex) => (
                              <p key={`${section.id}-education-line-${index}-${lineIndex}`} className={styles.metaText}>
                                {line}
                              </p>
                            ))
                          : null}
                      </motion.article>
                    );
                  })}
                </div>
              </motion.section>
            );
          }

          if (section.type === SectionType.Certifications) {
            return (
              <motion.section
                key={section.id}
                id={section.id}
                data-customize-section-id={section.id}
                data-customize-section-type={section.type}
                data-section-variant={section.variant || ""}
                className={styles.section}
                {...revealSectionProps}
              >
                <motion.header className={styles.sectionHeader} variants={prefersReducedMotion ? undefined : itemVariants}>
                  <p className={styles.sectionLabel}>{section.type}</p>
                  {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                </motion.header>

                <div className={styles.sectionStack}>
                  {section.content.entries.map((entry, index) => (
                    <motion.article
                      key={`${section.id}-cert-${entry.name}-${index}`}
                      className={`${styles.card} ${styles.interactiveCard}`}
                      variants={prefersReducedMotion ? undefined : itemVariants}
                    >
                      {entry.name ? <h3 className={styles.cardHeading}>{entry.name}</h3> : null}
                      {joinParts([entry.issuer, entry.year]) ? (
                        <p className={styles.metaText}>{joinParts([entry.issuer, entry.year])}</p>
                      ) : null}
                    </motion.article>
                  ))}
                </div>
              </motion.section>
            );
          }

          if (section.type === SectionType.Projects) {
            return (
              <motion.section
                key={section.id}
                id={section.id}
                data-customize-section-id={section.id}
                data-customize-section-type={section.type}
                data-section-variant={section.variant || ""}
                className={styles.section}
                {...revealSectionProps}
              >
                <motion.header className={styles.sectionHeader} variants={prefersReducedMotion ? undefined : itemVariants}>
                  <p className={styles.sectionLabel}>{section.type}</p>
                  {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                </motion.header>

                <div className={styles.sectionStack}>
                  {section.content.items.map((project, index) => (
                    <motion.article
                      key={`${section.id}-project-${project.title}-${index}`}
                      className={`${styles.card} ${styles.interactiveCard}`}
                      variants={prefersReducedMotion ? undefined : itemVariants}
                    >
                      {project.title ? <h3 className={styles.cardHeading}>{project.title}</h3> : null}
                      {project.description ? <p>{project.description}</p> : null}
                      {project.highlights.length ? (
                        <ul className={styles.projectHighlights}>
                          {project.highlights.map((highlight, highlightIndex) => (
                            <li key={`${section.id}-project-highlight-${index}-${highlightIndex}`}>{highlight}</li>
                          ))}
                        </ul>
                      ) : null}
                      {project.tags.length ? (
                        <div className={styles.skillTrack}>
                          {project.tags.map((tag, tagIndex) => (
                            <span key={`${section.id}-project-tag-${index}-${tagIndex}`} className={styles.skillPill}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {project.links.demo || project.links.code ? (
                        <div className={styles.linkRow}>
                          {project.links.demo ? (
                            <a href={project.links.demo} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                              <span>{project.links.demo}</span>
                              <ExternalLink aria-hidden="true" size={16} />
                            </a>
                          ) : null}
                          {project.links.code ? (
                            <a href={project.links.code} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                              <span>{project.links.code}</span>
                              <ExternalLink aria-hidden="true" size={16} />
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </motion.article>
                  ))}
                </div>
              </motion.section>
            );
          }

          if (section.type === SectionType.Skills) {
            const skillValues = skillsForSection(section, fallbackSkills);
            return (
              <motion.section
                key={section.id}
                id={section.id}
                data-customize-section-id={section.id}
                data-customize-section-type={section.type}
                data-section-variant={section.variant || ""}
                className={styles.section}
                {...revealSectionProps}
              >
                <motion.header className={styles.sectionHeader} variants={prefersReducedMotion ? undefined : itemVariants}>
                  <p className={styles.sectionLabel}>{section.type}</p>
                  {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                </motion.header>

                <motion.article
                  className={`${styles.card} ${styles.interactiveCard}`}
                  variants={prefersReducedMotion ? undefined : itemVariants}
                >
                  <div className={styles.skillTrack}>
                    {skillValues.map((skill, skillIndex) => (
                      <span key={`${section.id}-skill-${skillIndex}`} className={styles.skillPill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.article>
              </motion.section>
            );
          }

          if (section.type === SectionType.Contact) {
            const contactLinks = contactLinksFromContent(section.content);
            return (
              <motion.section
                key={section.id}
                id={section.id}
                data-customize-section-id={section.id}
                data-customize-section-type={section.type}
                data-section-variant={section.variant || ""}
                className={styles.section}
                {...revealSectionProps}
              >
                <motion.header className={styles.sectionHeader} variants={prefersReducedMotion ? undefined : itemVariants}>
                  <p className={styles.sectionLabel}>{section.type}</p>
                  {section.content.title ? <h2 className={styles.sectionTitle}>{section.content.title}</h2> : null}
                </motion.header>

                <motion.article
                  className={`${styles.card} ${styles.contactCard} ${styles.interactiveCard}`}
                  variants={prefersReducedMotion ? undefined : itemVariants}
                >
                  <div className={styles.contactLinks}>
                    {contactLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <a
                          key={`${section.id}-${link.label}`}
                          href={link.href}
                          className={styles.contactLink}
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noreferrer" : undefined}
                        >
                          <span className={styles.contactLinkLeft}>
                            <Icon aria-hidden="true" size={18} />
                            <span>{link.label}</span>
                          </span>
                          <span className={styles.contactLinkRight}>
                            <span>{link.value}</span>
                            {link.external ? <ExternalLink aria-hidden="true" size={16} /> : null}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </motion.article>
              </motion.section>
            );
          }

          return null;
        })}
      </motion.main>
    </div>
  );
}
