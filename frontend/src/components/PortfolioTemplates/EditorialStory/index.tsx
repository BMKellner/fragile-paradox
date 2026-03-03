"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowUpRight,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
} from "lucide-react";
import styles from "./EditorialStory.module.css";
import {
  SectionType,
  type AboutSectionContent,
  type ContactSectionContent,
  type ExperienceSectionContent,
  type HeroSectionContent,
  type ProjectsSectionContent,
} from "@/lib/template-config";
import {
  enabledSections,
  firstSectionOfType,
  resolveTemplateConfigFromProps,
} from "@/components/PortfolioTemplates/shared/templateConfigAdapter";
import { getInitials, isLightColor, sanitizeHexColor, type TemplateProps } from "@/components/PortfolioTemplates/shared/portfolioData";

const inter = Inter({
  subsets: ["latin"],
  variable: "--editorial-sans",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--editorial-mono",
  display: "swap",
});

const easeOutQuint: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ensureUrl = (value: string): string => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
};

type NavItem = {
  id: string;
  label: string;
};

type DisplayProject = {
  title: string;
  description: string;
  tags: string[];
};

type ContentSectionType =
  | SectionType.About
  | SectionType.Experience
  | SectionType.Projects
  | SectionType.Contact;

const isContentSectionType = (type: SectionType): type is ContentSectionType => {
  return (
    type === SectionType.About ||
    type === SectionType.Experience ||
    type === SectionType.Projects ||
    type === SectionType.Contact
  );
};

export default function EditorialStoryPortfolio({
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
  const [activeSection, setActiveSection] = useState<string>("about-1");
  const [emailCopied, setEmailCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

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

  const heroContent =
    (firstSectionOfType(resolvedConfig, SectionType.Hero)?.content as HeroSectionContent | undefined) ??
    ({
      title: "Hero",
      eyebrow: "Portfolio",
      fullName: "Alex Morgan",
      careerName: "Operations & Program Specialist",
      summary:
        "I help teams turn complex goals into clear systems, measurable progress, and dependable outcomes.",
      primaryCtaLabel: "View Experience",
      secondaryCtaLabel: "Copy Email",
    } satisfies HeroSectionContent);

  const aboutSection = firstSectionOfType(resolvedConfig, SectionType.About);
  const aboutContent =
    (aboutSection?.content as AboutSectionContent | undefined) ??
    ({
      title: "About",
      subtitle: "How I work",
      summary:
        "I combine structured planning, thoughtful communication, and execution discipline to support people-focused outcomes.",
      educationLabel: "",
      educationDetails: "",
      stats: [],
    } satisfies AboutSectionContent);

  const experienceSection = firstSectionOfType(resolvedConfig, SectionType.Experience);
  const experienceContent =
    (experienceSection?.content as ExperienceSectionContent | undefined) ??
    ({
      title: "Experience",
      subtitle: "Highlights from recent roles and team initiatives.",
      items: [],
    } satisfies ExperienceSectionContent);

  const contactSection = firstSectionOfType(resolvedConfig, SectionType.Contact);
  const contactContent =
    (contactSection?.content as ContactSectionContent | undefined) ??
    ({
      title: "Contact",
      subtitle: "Open to collaborations, consulting, and thoughtful conversations.",
      email: "hello@example.com",
      phone: "",
      address: "Remote",
      linkedin: "",
      ctaLabel: "Send me an email",
    } satisfies ContactSectionContent);

  const projectsSection = firstSectionOfType(resolvedConfig, SectionType.Projects);
  const projectsContent = firstSectionOfType(resolvedConfig, SectionType.Projects)?.content as
    | ProjectsSectionContent
    | undefined;

  const aboutId = aboutSection?.id || "about-1";
  const experienceId = experienceSection?.id || "experience-1";
  const projectsId = projectsSection?.id || "projects-1";
  const contactId = contactSection?.id || "contact-1";

  const projectItems = useMemo<DisplayProject[]>(() => {
    if (projectsContent?.items.length) {
      return projectsContent.items.map((project) => ({
        title: project.title || "Project",
        description: project.description || "Project summary coming soon.",
        tags: (project.tags || []).filter(Boolean).slice(0, 5),
      }));
    }

    if (projects?.length) {
      return projects.map((project) => ({
        title: project.title || "Project",
        description: project.description || "Project summary coming soon.",
        tags: [],
      }));
    }

    return [];
  }, [projectsContent, projects]);

  const hasProjects = projectItems.length > 0;
  const orderedSectionTypes = useMemo<ContentSectionType[]>(() => {
    const seen = new Set<ContentSectionType>();
    const ordered: ContentSectionType[] = [];

    sections.forEach((section) => {
      if (!isContentSectionType(section.type) || seen.has(section.type)) return;
      if (section.type === SectionType.Projects && !hasProjects) return;
      seen.add(section.type);
      ordered.push(section.type);
    });

    return ordered;
  }, [sections, hasProjects]);

  const navItems = useMemo<NavItem[]>(
    () =>
      orderedSectionTypes.map((type) => {
        if (type === SectionType.About) {
          return {
            id: aboutId,
            label: aboutSection?.navLabel?.trim() || aboutContent.title || "About",
          };
        }
        if (type === SectionType.Experience) {
          return {
            id: experienceId,
            label: experienceSection?.navLabel?.trim() || experienceContent.title || "Experience",
          };
        }
        if (type === SectionType.Projects) {
          return {
            id: projectsId,
            label: projectsSection?.navLabel?.trim() || projectsContent?.title || "Projects",
          };
        }
        return {
          id: contactId,
          label: contactSection?.navLabel?.trim() || contactContent.title || "Contact",
        };
      }),
    [
      orderedSectionTypes,
      aboutId,
      aboutSection,
      aboutContent.title,
      experienceId,
      experienceSection,
      experienceContent.title,
      projectsId,
      projectsSection,
      projectsContent?.title,
      contactId,
      contactSection,
      contactContent.title,
    ]
  );

  useEffect(() => {
    if (!navItems.length) return;
    if (!navItems.some((entry) => entry.id === activeSection)) {
      setActiveSection(navItems[0].id);
    }
  }, [navItems, activeSection]);

  useEffect(() => {
    const sectionNodes = navItems
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!sectionNodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const topVisible = visibleEntries[0]?.target.id;
        if (topVisible) {
          setActiveSection(topVisible);
        }
      },
      {
        threshold: [0.15, 0.35, 0.65],
        rootMargin: "-38% 0px -44% 0px",
      }
    );

    sectionNodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [navItems]);

  const goToSection = (id: string) => {
    setMenuOpen(false);
    setActiveSection(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  };

  const copyEmail = async () => {
    if (!contactContent.email) return;

    try {
      await navigator.clipboard.writeText(contactContent.email);
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 1500);
    } catch {
      setEmailCopied(false);
    }
  };

  const trackedProjectsCount = projectItems.length;
  const experienceCount = experienceContent.items.length || experience?.length || 0;

  const statCards = useMemo(() => {
    const fromAboutStats = aboutContent.stats
      .map((stat) => ({
        label: stat.label || "Stat",
        value: stat.value || "Value",
      }))
      .slice(0, 3);

    const fallbackStats = [
      { label: "Projects Tracked", value: String(trackedProjectsCount) },
      { label: "Experience Entries", value: String(experienceCount) },
      { label: "Primary Focus", value: heroContent.careerName || "Generalist" },
    ];

    const merged = [...fromAboutStats];
    fallbackStats.forEach((stat) => {
      if (merged.length >= 3) return;
      if (merged.some((entry) => entry.label === stat.label)) return;
      merged.push(stat);
    });

    return merged.slice(0, 3);
  }, [aboutContent.stats, trackedProjectsCount, experienceCount, heroContent.careerName]);

  const experienceItems = experienceContent.items.length
    ? experienceContent.items
    : [
        {
          company: "Example Organization",
          employedDates: "2023 - Present",
          bullets: [
            "Led cross-functional planning and delivery for high-impact initiatives.",
            "Improved team workflows through clear documentation and process refinement.",
            "Partnered with stakeholders to translate goals into measurable outcomes.",
          ],
          tags: ["Leadership", "Operations", "Communication"],
        },
      ];

  const pageIn = useMemo<Variants>(
    () =>
      prefersReducedMotion
        ? {
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { duration: 0.01 } },
          }
        : {
            hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.68,
                ease: easeOutQuint,
              },
            },
          },
    [prefersReducedMotion]
  );

  const sectionIn = useMemo<Variants>(
    () =>
      prefersReducedMotion
        ? {
            hidden: { opacity: 1 },
            show: { opacity: 1, transition: { duration: 0.01 } },
          }
        : {
            hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.62,
                ease: easeOutQuint,
                when: "beforeChildren",
                staggerChildren: 0.09,
              },
            },
          },
    [prefersReducedMotion]
  );

  const itemIn = useMemo<Variants>(
    () =>
      prefersReducedMotion
        ? {
            hidden: { opacity: 1 },
            show: { opacity: 1, transition: { duration: 0.01 } },
          }
        : {
            hidden: { opacity: 0, y: 14 },
            show: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.55,
                ease: easeOutQuint,
              },
            },
          },
    [prefersReducedMotion]
  );

  const hoverLift = prefersReducedMotion
    ? {}
    : {
        whileHover: {
          y: -4,
          transition: {
            duration: 0.2,
            ease: easeOutQuint,
          },
        },
      };

  const accent = sanitizeHexColor(resolvedConfig.theme.primaryColor, "#6366f1");
  const base = sanitizeHexColor(resolvedConfig.theme.backgroundColor, "#0a1122");
  const accentGradient =
    resolvedConfig.theme.accentGradient?.trim() || `linear-gradient(120deg, ${accent} 0%, #10b981 100%)`;
  const lightMode = resolvedConfig.theme.mode === "light" || isLightColor(base, 170);

  const rootStyle = {
    "--accent": accent,
    "--accent-2": "#10b981",
    "--bg": base,
    "--accent-gradient": accentGradient,
  } as CSSProperties;

  const sectionViewport = { once: true, amount: 0.24 } as const;
  const safeLinkedin = ensureUrl(contactContent.linkedin);
  const summaryCopy = heroContent.summary || aboutContent.summary;
  const locationCopy = contactContent.address || "Remote";
  const safeName = heroContent.fullName || "Your Name";

  return (
    <div
      className={`${styles.root} ${lightMode ? styles.lightMode : styles.darkMode} ${inter.variable} ${jetBrainsMono.variable}`}
      style={rootStyle}
      data-projects-tracked={trackedProjectsCount}
    >
      <motion.div className={styles.pageShell} variants={pageIn} initial="hidden" animate="show">
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <button
              type="button"
              className={styles.brand}
              onClick={() => goToSection(navItems[0]?.id || aboutId)}
            >
              <span className={styles.brandMark} aria-hidden="true">
                {">_"}
              </span>
              <span className={styles.brandName}>{safeName}</span>
            </button>

            <button
              type="button"
              className={styles.mobileToggle}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`} aria-label="Primary navigation">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.navButton} ${activeSection === item.id ? styles.navButtonActive : ""}`}
                  onClick={() => goToSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className={styles.main}>
          {orderedSectionTypes.map((type) => {
            if (type === SectionType.About) {
              return (
                <motion.section
                  key={type}
                  id={aboutId}
                  className={styles.section}
                  variants={sectionIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={sectionViewport}
                >
                  <motion.div className={styles.sectionHeading} variants={itemIn}>
                    <p className={styles.sectionKicker}>{aboutContent.title || "About"}</p>
                  </motion.div>

                  <div className={styles.aboutGrid}>
                    <motion.article className={`${styles.surfaceCard} ${styles.aboutLead}`} variants={itemIn} {...hoverLift}>
                      <h1 className={styles.name}>{safeName}</h1>
                      <p className={styles.summary}>{summaryCopy}</p>

                      <div className={styles.ctaRow}>
                        <button
                          type="button"
                          className={`${styles.secondaryButton} ${!contactContent.email ? styles.primaryButtonDisabled : ""}`}
                          onClick={copyEmail}
                          disabled={!contactContent.email}
                        >
                          {emailCopied ? "Email Copied" : heroContent.secondaryCtaLabel || "Copy Email"}
                        </button>
                      </div>
                    </motion.article>

                    <motion.aside className={`${styles.surfaceCard} ${styles.profileCard}`} variants={itemIn} {...hoverLift}>
                      <div className={styles.profileImage} aria-hidden="true">
                        <span>{getInitials(safeName)}</span>
                      </div>
                      <div className={styles.profileStats}>
                        {statCards.map((stat) => (
                          <article key={stat.label} className={styles.statCard}>
                            <p className={styles.statLabel}>{stat.label}</p>
                            <p className={styles.statValue}>{stat.value}</p>
                          </article>
                        ))}
                      </div>
                    </motion.aside>
                  </div>

                  <motion.article className={`${styles.surfaceCard} ${styles.blurbCard}`} variants={itemIn} {...hoverLift}>
                    <h2>{aboutContent.subtitle || "What I do"}</h2>
                    <p>{aboutContent.summary || summaryCopy}</p>
                  </motion.article>
                </motion.section>
              );
            }

            if (type === SectionType.Experience) {
              return (
                <motion.section
                  key={type}
                  id={experienceId}
                  className={styles.section}
                  variants={sectionIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={sectionViewport}
                >
                  <motion.div className={styles.sectionHeading} variants={itemIn}>
                    <p className={styles.sectionKicker}>{experienceContent.title || "Experience"}</p>
                    <h2>{experienceContent.subtitle || "Selected experience and impact highlights."}</h2>
                  </motion.div>

                  <motion.div className={styles.experienceTimeline} variants={itemIn}>
                    {experienceItems.map((item, index) => (
                      <motion.article
                        key={`${item.company}-${item.employedDates}-${index}`}
                        className={`${styles.surfaceCard} ${styles.timelineCard}`}
                        variants={itemIn}
                        {...hoverLift}
                      >
                        <div className={styles.timelineTop}>
                          <h3>{item.company || "Organization"}</h3>
                          <p className={styles.timelineDates}>{item.employedDates || "Dates available on resume"}</p>
                        </div>

                        <ul className={styles.timelineList}>
                          {(item.bullets.length ? item.bullets : ["Add role highlights."]).map((bullet, bulletIndex) => (
                            <li key={`${item.company}-${bulletIndex}-${bullet}`}>{bullet}</li>
                          ))}
                        </ul>

                        <div className={styles.tagRow}>
                          {item.tags.map((tag) => (
                            <span key={`${item.company}-${tag}`} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.article>
                    ))}
                  </motion.div>
                </motion.section>
              );
            }

            if (type === SectionType.Projects) {
              return (
                <motion.section
                  key={type}
                  id={projectsId}
                  className={styles.section}
                  variants={sectionIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={sectionViewport}
                >
                  <motion.div className={styles.sectionHeading} variants={itemIn}>
                    <p className={styles.sectionKicker}>{projectsContent?.title || "Projects"}</p>
                    <h2>{projectsContent?.subtitle || "Selected projects and work samples."}</h2>
                  </motion.div>

                  <motion.div className={styles.projectList} variants={itemIn}>
                    {projectItems.map((project, index) => (
                      <motion.article
                        key={`${project.title}-${index}`}
                        className={`${styles.surfaceCard} ${styles.projectItem}`}
                        variants={itemIn}
                        {...hoverLift}
                      >
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        {project.tags.length ? (
                          <div className={styles.tagRow}>
                            {project.tags.map((tag) => (
                              <span key={`${project.title}-${tag}`} className={styles.tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </motion.article>
                    ))}
                  </motion.div>
                </motion.section>
              );
            }

            return (
              <motion.section
                key={type}
                id={contactId}
                className={styles.section}
                variants={sectionIn}
                initial="hidden"
                whileInView="show"
                viewport={sectionViewport}
              >
                <motion.div className={styles.sectionHeading} variants={itemIn}>
                  <p className={styles.sectionKicker}>{contactContent.title || "Contact"}</p>
                  <h2>{contactContent.subtitle || "Reach out if you want to collaborate."}</h2>
                </motion.div>

                <div className={styles.contactGrid}>
                  <motion.article className={`${styles.surfaceCard} ${styles.contactCard}`} variants={itemIn} {...hoverLift}>
                    <h3>Reach Out</h3>
                    <p>Choose any channel below and I will get back to you as soon as possible.</p>

                    <div className={styles.contactList}>
                      {contactContent.email ? (
                        <a className={styles.contactItem} href={`mailto:${contactContent.email}`}>
                          <Mail size={15} />
                          {contactContent.email}
                        </a>
                      ) : null}
                      {contactContent.phone ? (
                        <a className={styles.contactItem} href={`tel:${contactContent.phone}`}>
                          <Phone size={15} />
                          {contactContent.phone}
                        </a>
                      ) : null}
                      {locationCopy ? (
                        <div className={styles.contactItem}>
                          <MapPin size={15} />
                          {locationCopy}
                        </div>
                      ) : null}
                      {safeLinkedin ? (
                        <a className={styles.contactItem} href={safeLinkedin} target="_blank" rel="noreferrer">
                          <Linkedin size={15} />
                          LinkedIn
                        </a>
                      ) : null}
                    </div>

                    <div className={styles.contactActions}>
                      <a className={styles.primaryButtonLink} href={`mailto:${contactContent.email || "hello@example.com"}`}>
                        {contactContent.ctaLabel || "Send me an email"}
                        <ArrowUpRight size={15} />
                      </a>
                    </div>
                  </motion.article>
                </div>
              </motion.section>
            );
          })}
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <p className={styles.footerBrand}>
              <span className={styles.brandMark} aria-hidden="true">
                {">_"}
              </span>
              <span>{safeName}</span>
            </p>
            <nav className={styles.footerNav} aria-label="Footer navigation">
              {navItems.map((item) => (
                <button key={item.id} type="button" className={styles.footerLink} onClick={() => goToSection(item.id)}>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
