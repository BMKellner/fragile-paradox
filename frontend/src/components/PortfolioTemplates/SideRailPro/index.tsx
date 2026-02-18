"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight, Mail, Phone, MapPin, Linkedin, Quote } from "lucide-react";
import styles from "./SideRailPro.module.css";
import {
  SectionType,
  sectionTitle,
  type AboutSectionContent,
  type BlogSectionContent,
  type CertificationsSectionContent,
  type ContactSectionContent,
  type EducationSectionContent,
  type ExperienceSectionContent,
  type HeroSectionContent,
  type ProjectsSectionContent,
  type SkillsSectionContent,
  type TestimonialsSectionContent,
} from "@/lib/template-config";
import { enabledSections, resolveTemplateConfigFromProps } from "@/components/PortfolioTemplates/shared/templateConfigAdapter";
import { getInitials, isLightColor, sanitizeHexColor, type TemplateProps } from "@/components/PortfolioTemplates/shared/portfolioData";

const navLabel = (type: SectionType, fallback: string): string => {
  if (type === SectionType.Hero) return "Home";
  return fallback;
};

export default function SideRailProPortfolio({
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
  const [emailCopied, setEmailCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero-1");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const resolvedConfig = useMemo(
    () =>
      resolveTemplateConfigFromProps({
        templateId: "5",
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

  const navTabs = useMemo(
    () =>
      sections.map((section) => ({
        id: section.id,
        label: section.navLabel || navLabel(section.type, sectionTitle(section)),
      })),
    [sections]
  );

  useEffect(() => {
    if (navTabs.length && !navTabs.some((tab) => tab.id === activeSection)) {
      setActiveSection(navTabs[0].id);
    }
  }, [navTabs, activeSection]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const revealElements = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.dataset.visible = "true";
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -12% 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));

    const sectionElements = navTabs
      .map((tab) => root.querySelector<HTMLElement>(`#${tab.id}`))
      .filter((element): element is HTMLElement => Boolean(element));

    const activeObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const id = visible[0]?.target.id;
        if (id) setActiveSection(id);
      },
      { threshold: [0.2, 0.45], rootMargin: "-35% 0px -45% 0px" }
    );

    sectionElements.forEach((section) => activeObserver.observe(section));

    return () => {
      revealObserver.disconnect();
      activeObserver.disconnect();
    };
  }, [navTabs]);

  const accent = sanitizeHexColor(resolvedConfig.theme.primaryColor, "#0f766e");
  const bg = sanitizeHexColor(resolvedConfig.theme.backgroundColor, "#f8fafc");
  const darkMode = !isLightColor(bg, 170);

  const rootStyle = {
    "--sr-accent": accent,
    "--sr-bg": bg,
  } as CSSProperties;

  const navigateTo = (id: string) => {
    setActiveSection(id);
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const heroSection = sections.find((section) => section.type === SectionType.Hero);
  const heroContent =
    (heroSection?.content as HeroSectionContent | undefined) ??
    ({
      title: "Hero",
      eyebrow: "Portfolio",
      fullName: "Your Name",
      careerName: "Senior Engineer",
      summary: "",
      primaryCtaLabel: "Start a Conversation",
      secondaryCtaLabel: "Copy Email",
    } satisfies HeroSectionContent);

  const contactSection = sections.find((section) => section.type === SectionType.Contact);
  const contactContent =
    (contactSection?.content as ContactSectionContent | undefined) ??
    ({
      title: "Contact",
      subtitle: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      ctaLabel: "Send me an email",
    } satisfies ContactSectionContent);

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

  const renderSection = (section: (typeof sections)[number]) => {
    switch (section.type) {
      case SectionType.Hero: {
        const content = section.content as HeroSectionContent;

        return (
          <section key={section.id} id={section.id} className={styles.hero} data-reveal>
            <p className={styles.kicker}>{content.eyebrow || "Portfolio"}</p>
            <h1>{content.fullName || "Your Name"}</h1>
            <h2>{content.careerName || "Senior Engineer"}</h2>
            <p className={styles.heroSummary}>{content.summary || "Designing reliable digital products with disciplined engineering and thoughtful user experience."}</p>

            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => {
                  const firstProjects = sections.find((item) => item.type === SectionType.Projects)?.id;
                  navigateTo(firstProjects || sections[1]?.id || section.id);
                }}
              >
                {content.primaryCtaLabel || "Start a Conversation"}
              </button>
              <button type="button" className={styles.ghostButton} onClick={copyEmail}>
                {emailCopied ? "Email copied" : content.secondaryCtaLabel || "Copy Email"}
              </button>
            </div>
          </section>
        );
      }
      case SectionType.About: {
        const content = section.content as AboutSectionContent;

        return (
          <section key={section.id} id={section.id} className={styles.section} data-reveal>
            <header className={styles.sectionHeader}>
              <h2>{content.title}</h2>
              <p>{content.subtitle}</p>
            </header>

            <div className={styles.twoColumn}>
              <article className={styles.card}>
                <p>{content.summary}</p>
                {(content.educationLabel || content.educationDetails) && (
                  <div className={styles.educationLine}>
                    <h3>{content.educationLabel || "Education"}</h3>
                    <p>{content.educationDetails}</p>
                  </div>
                )}
              </article>

              <div className={styles.statsGrid}>
                {content.stats.length ? (
                  content.stats.map((stat) => (
                    <article key={stat.label} className={styles.statCard}>
                      <p>{stat.label}</p>
                      <h3>{stat.value}</h3>
                    </article>
                  ))
                ) : (
                  <article className={styles.card}>
                    <p>Add stats to populate this section.</p>
                  </article>
                )}
              </div>
            </div>
          </section>
        );
      }
      case SectionType.Projects: {
        const content = section.content as ProjectsSectionContent;

        return (
          <section key={section.id} id={section.id} className={styles.section} data-reveal>
            <header className={styles.sectionHeader}>
              <h2>{content.title}</h2>
              <p>{content.subtitle}</p>
            </header>

            <div className={styles.stackList}>
              {content.items.length ? (
                content.items.map((project, index) => (
                  <article key={`${project.title}-${index}`} className={styles.itemRow}>
                    <div>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                      <ul>
                        {(project.highlights.length ? project.highlights : ["Add a project highlight"]).map((highlight) => (
                          <li key={`${project.title}-${highlight}`}>{highlight}</li>
                        ))}
                      </ul>
                    </div>

                    <div className={styles.itemMeta}>
                      <div className={styles.tagRow}>
                        {project.tags.map((tag) => (
                          <span key={`${project.title}-${tag}`} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className={styles.linkRow}>
                        {project.links.demo ? (
                          <Link href={project.links.demo} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                            Demo <ArrowUpRight size={14} />
                          </Link>
                        ) : null}
                        {project.links.code ? (
                          <Link href={project.links.code} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                            Code <ArrowUpRight size={14} />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <article className={styles.card}>
                  <p>No projects listed yet.</p>
                </article>
              )}
            </div>
          </section>
        );
      }
      case SectionType.Skills: {
        const content = section.content as SkillsSectionContent;

        return (
          <section key={section.id} id={section.id} className={styles.section} data-reveal>
            <header className={styles.sectionHeader}>
              <h2>{content.title}</h2>
              <p>{content.subtitle}</p>
            </header>

            <div className={styles.skillGrid}>
              {content.categories.length ? (
                content.categories.map((group) => (
                  <article key={group.title} className={styles.card}>
                    <h3>{group.title}</h3>
                    <div className={styles.tagRow}>
                      {group.skills.map((skill) => (
                        <span key={`${group.title}-${skill}`} className={styles.tag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <article className={styles.card}>
                  <p>No skills listed yet.</p>
                </article>
              )}
            </div>
          </section>
        );
      }
      case SectionType.Experience: {
        const content = section.content as ExperienceSectionContent;

        return (
          <section key={section.id} id={section.id} className={styles.section} data-reveal>
            <header className={styles.sectionHeader}>
              <h2>{content.title}</h2>
              <p>{content.subtitle}</p>
            </header>

            <div className={styles.timeline}>
              {content.items.length ? (
                content.items.map((item, index) => (
                  <article key={`${item.company}-${index}`} className={styles.timelineCard}>
                    <div className={styles.timelineHeading}>
                      <h3>{item.company}</h3>
                      <p>{item.employedDates || "Current"}</p>
                    </div>

                    <ul>
                      {item.bullets.map((bullet) => (
                        <li key={`${item.company}-${bullet}`}>{bullet}</li>
                      ))}
                    </ul>

                    <div className={styles.tagRow}>
                      {item.tags.map((tag) => (
                        <span key={`${item.company}-${tag}`} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <article className={styles.card}>
                  <p>No experience listed yet.</p>
                </article>
              )}
            </div>
          </section>
        );
      }
      case SectionType.Education: {
        const content = section.content as EducationSectionContent;

        return (
          <section key={section.id} id={section.id} className={styles.section} data-reveal>
            <header className={styles.sectionHeader}>
              <h2>{content.title}</h2>
              <p>{content.subtitle}</p>
            </header>

            <div className={styles.stackList}>
              {content.entries.length ? (
                content.entries.map((entry, index) => (
                  <article key={`${entry.school}-${index}`} className={styles.itemRow}>
                    <div>
                      <h3>{entry.school || "School"}</h3>
                      <p>
                        {[...entry.majors, ...entry.minors.map((minor) => `Minor: ${minor}`)]
                          .filter(Boolean)
                          .join(" | ")}
                      </p>
                    </div>
                    {entry.expectedGrad ? <p className={styles.note}>{entry.expectedGrad}</p> : null}
                  </article>
                ))
              ) : (
                <article className={styles.card}>
                  <p>No education listed yet.</p>
                </article>
              )}
            </div>
          </section>
        );
      }
      case SectionType.Certifications: {
        const content = section.content as CertificationsSectionContent;

        return (
          <section key={section.id} id={section.id} className={styles.section} data-reveal>
            <header className={styles.sectionHeader}>
              <h2>{content.title}</h2>
              <p>{content.subtitle}</p>
            </header>

            <div className={styles.stackList}>
              {content.entries.length ? (
                content.entries.map((entry, index) => (
                  <article key={`${entry.name}-${index}`} className={styles.itemRow}>
                    <div>
                      <h3>{entry.name || "Certification"}</h3>
                      <p>{entry.issuer || "Issuer"}</p>
                    </div>
                    {entry.year ? <p className={styles.note}>{entry.year}</p> : null}
                  </article>
                ))
              ) : (
                <article className={styles.card}>
                  <p>No certifications listed yet.</p>
                </article>
              )}
            </div>
          </section>
        );
      }
      case SectionType.Blog: {
        const content = section.content as BlogSectionContent;

        return (
          <section key={section.id} id={section.id} className={styles.section} data-reveal>
            <header className={styles.sectionHeader}>
              <h2>{content.title}</h2>
              <p>{content.subtitle}</p>
            </header>

            <article className={styles.card}>
              <div className={styles.metaRow}>
                <span>{content.date}</span>
                <span>{content.readingTime}</span>
              </div>
              <h3>{content.postTitle}</h3>
              <p>{content.excerpt}</p>
              <div className={styles.tagRow}>
                {content.tags.map((tag) => (
                  <span key={`blog-${tag}`} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          </section>
        );
      }
      case SectionType.Testimonials: {
        const content = section.content as TestimonialsSectionContent;

        return (
          <section key={section.id} id={section.id} className={styles.section} data-reveal>
            <header className={styles.sectionHeader}>
              <h2>{content.title}</h2>
              <p>{content.subtitle}</p>
            </header>

            <div className={styles.testimonialGrid}>
              {content.items.length ? (
                content.items.map((item) => (
                  <article key={`${item.author}-${item.company}`} className={styles.card}>
                    <Quote size={20} className={styles.quoteIcon} />
                    <p>{item.quote}</p>
                    <h3>{item.author}</h3>
                    <p className={styles.note}>
                      {item.role} - {item.company}
                    </p>
                  </article>
                ))
              ) : (
                <article className={styles.card}>
                  <p>No testimonials listed yet.</p>
                </article>
              )}
            </div>
          </section>
        );
      }
      case SectionType.Contact: {
        const content = section.content as ContactSectionContent;

        return (
          <section key={section.id} id={section.id} className={styles.section} data-reveal>
            <header className={styles.sectionHeader}>
              <h2>{content.title}</h2>
              <p>{content.subtitle}</p>
            </header>

            <article className={styles.contactCard}>
              <div className={styles.contactRow}>
                {content.email ? (
                  <a href={`mailto:${content.email}`} className={styles.contactItem}>
                    <Mail size={15} />
                    {content.email}
                  </a>
                ) : null}
                {content.phone ? (
                  <a href={`tel:${content.phone}`} className={styles.contactItem}>
                    <Phone size={15} />
                    {content.phone}
                  </a>
                ) : null}
                {content.address ? (
                  <div className={styles.contactItem}>
                    <MapPin size={15} />
                    {content.address}
                  </div>
                ) : null}
                {content.linkedin ? (
                  <Link href={content.linkedin} target="_blank" rel="noreferrer" className={styles.contactItem}>
                    <Linkedin size={15} />
                    LinkedIn
                  </Link>
                ) : null}
              </div>

              <a href={`mailto:${content.email || "hello@example.com"}`} className={styles.primaryButton}>
                {content.ctaLabel || "Send me an email"}
              </a>
            </article>
          </section>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.root} ${darkMode ? styles.darkMode : ""}`} style={rootStyle} ref={rootRef}>
      <div className={styles.layout}>
        <aside className={styles.rail}>
          <div className={styles.railTop}>
            <p className={styles.monogram}>{getInitials(heroContent.fullName)}</p>
            <h2>{heroContent.fullName || "Your Name"}</h2>
            <p>{heroContent.careerName || "Senior Engineer"}</p>
          </div>

          <button
            type="button"
            className={styles.mobileToggle}
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <nav className={`${styles.railNav} ${menuOpen ? styles.railNavOpen : ""}`} aria-label="Sections">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigateTo(tab.id)}
                className={`${styles.navLink} ${activeSection === tab.id ? styles.navLinkActive : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className={styles.railFooter}>
            {contactContent.email ? <p>{contactContent.email}</p> : null}
            {contactContent.phone ? <p>{contactContent.phone}</p> : null}
            {contactContent.address ? <p>{contactContent.address}</p> : null}
          </div>
        </aside>

        <main className={styles.mainContent}>{sections.map((section) => renderSection(section))}</main>
      </div>
    </div>
  );
}
