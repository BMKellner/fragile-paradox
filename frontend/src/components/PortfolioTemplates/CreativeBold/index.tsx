"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight, Quote, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import styles from "./CreativeBold.module.css";
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
import { HeroSection } from "./sections/HeroSection";
import { SectionFrame } from "@/components/PortfolioTemplates/shared/editor/SectionFrame";

const navLabel = (type: SectionType, fallback: string): string => {
  if (type === SectionType.Hero) return "Home";
  return fallback;
};

export default function CreativeBoldPortfolio({
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero-1");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const resolvedConfig = useMemo(
    () =>
      resolveTemplateConfigFromProps({
        templateId: "3",
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
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
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

  const accent = sanitizeHexColor(resolvedConfig.theme.primaryColor, "#ef4444");
  const bg = sanitizeHexColor(resolvedConfig.theme.backgroundColor, "#111111");
  const darkMode = !isLightColor(bg, 175);

  const rootStyle = {
    "--cb-accent": accent,
    "--cb-bg": bg,
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
      careerName: "Product Engineer",
      summary: "",
      primaryCtaLabel: "Let's Build",
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
          <HeroSection
            key={section.id}
            sectionId={section.id}
            title={content.eyebrow || "Professional Portfolio"}
            primaryCtaLabel={content.primaryCtaLabel || "Let's Build"}
            fullName={content.fullName || "Your Name"}
            careerName={content.careerName || "Product Engineer"}
            summary={content.summary || ""}
            email={contactContent.email}
            onCopyEmail={copyEmail}
            emailCopied={emailCopied}
          />
        );
      }
      case SectionType.About: {
        const content = section.content as AboutSectionContent;

        return (
          <section key={section.id} id={section.id} className={styles.section} data-reveal>
            <div className={styles.headingRow}>
              <h2>{content.title}</h2>
              <span className={styles.dot} aria-hidden="true" />
            </div>

            <div className={styles.aboutGrid}>
              <article className={styles.glassCard}>
                <p>{content.summary}</p>
              </article>

              <div className={styles.statStrip}>
                {content.stats.length ? (
                  content.stats.map((stat) => (
                    <article key={stat.label} className={styles.statCard}>
                      <p>{stat.label}</p>
                      <h3>{stat.value}</h3>
                    </article>
                  ))
                ) : (
                  <article className={styles.glassCard}>
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
            <div className={styles.headingRow}>
              <h2>{content.title}</h2>
              <span className={styles.dot} aria-hidden="true" />
            </div>

            <div className={styles.projectGrid}>
              {content.items.length ? (
                content.items.map((project, index) => (
                  <article key={`${project.title}-${index}`} className={`${styles.projectCard} ${index === 0 ? styles.featured : ""}`}>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>

                    <div className={styles.featureGrid}>
                      {(project.highlights.length ? project.highlights : ["Add a project highlight"]).map((item) => (
                        <div key={`${project.title}-${item}`} className={styles.featureItem}>
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className={styles.footerRow}>
                      <div className={styles.tags}>
                        {project.tags.map((tag) => (
                          <span key={`${project.title}-${tag}`} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className={styles.links}>
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
                <article className={styles.glassCard}>
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
            <div className={styles.headingRow}>
              <h2>{content.title}</h2>
              <span className={styles.dot} aria-hidden="true" />
            </div>

            <div className={styles.skillBoard}>
              {content.categories.length ? (
                content.categories.map((group) => (
                  <article key={group.title} className={styles.skillColumn}>
                    <h3>{group.title}</h3>
                    <div className={styles.skillTiles}>
                      {group.skills.map((skill) => (
                        <span key={`${group.title}-${skill}`} className={styles.skillTile}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <article className={styles.glassCard}>
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
            <div className={styles.headingRow}>
              <h2>{content.title}</h2>
              <span className={styles.dot} aria-hidden="true" />
            </div>

            <div className={styles.timeline}>
              {content.items.length ? (
                content.items.map((item, index) => (
                  <article key={`${item.company}-${index}`} className={styles.expCard}>
                    <div className={styles.expHead}>
                      <h3>{item.company}</h3>
                      <p>{item.employedDates || "Current"}</p>
                    </div>

                    <ul>
                      {item.bullets.map((bullet) => (
                        <li key={`${item.company}-${bullet}`}>{bullet}</li>
                      ))}
                    </ul>

                    <div className={styles.tags}>
                      {item.tags.map((tag) => (
                        <span key={`${item.company}-${tag}`} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <article className={styles.glassCard}>
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
            <div className={styles.headingRow}>
              <h2>{content.title}</h2>
              <span className={styles.dot} aria-hidden="true" />
            </div>

            <div className={styles.projectGrid}>
              {content.entries.length ? (
                content.entries.map((entry, index) => (
                  <article key={`${entry.school}-${index}`} className={styles.projectCard}>
                    <h3>{entry.school || "School"}</h3>
                    {entry.expectedGrad ? <p>{entry.expectedGrad}</p> : null}
                    <div className={styles.featureGrid}>
                      {[...entry.majors, ...entry.minors.map((minor) => `Minor: ${minor}`)]
                        .filter(Boolean)
                        .map((item) => (
                          <div key={`${entry.school}-${item}`} className={styles.featureItem}>
                            {item}
                          </div>
                        ))}
                    </div>
                  </article>
                ))
              ) : (
                <article className={styles.glassCard}>
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
            <div className={styles.headingRow}>
              <h2>{content.title}</h2>
              <span className={styles.dot} aria-hidden="true" />
            </div>

            <div className={styles.projectGrid}>
              {content.entries.length ? (
                content.entries.map((entry, index) => (
                  <article key={`${entry.name}-${index}`} className={styles.projectCard}>
                    <h3>{entry.name || "Certification"}</h3>
                    <p>{entry.issuer || "Issuer"}</p>
                    {entry.year ? <p>{entry.year}</p> : null}
                  </article>
                ))
              ) : (
                <article className={styles.glassCard}>
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
            <div className={styles.headingRow}>
              <h2>{content.title}</h2>
              <span className={styles.dot} aria-hidden="true" />
            </div>

            <article className={styles.blogCard}>
              <div className={styles.blogMeta}>
                <span>{content.date}</span>
                <span>{content.readingTime}</span>
              </div>
              <h3>{content.postTitle}</h3>
              <p>{content.excerpt}</p>
              <div className={styles.tags}>
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
            <div className={styles.headingRow}>
              <h2>{content.title}</h2>
              <span className={styles.dot} aria-hidden="true" />
            </div>

            <div className={styles.testimonialGrid}>
              {content.items.length ? (
                content.items.map((testimonial, index) => (
                  <article key={`${testimonial.author}-${testimonial.company}`} className={`${styles.testimonialCard} ${index === 0 ? styles.testimonialWide : ""}`}>
                    <Quote size={24} className={styles.quoteIcon} />
                    <p>{testimonial.quote}</p>
                    <h3>{testimonial.author}</h3>
                    <p className={styles.metaLine}>
                      {testimonial.role} - <span>{testimonial.company}</span>
                    </p>
                  </article>
                ))
              ) : (
                <article className={styles.glassCard}>
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
            <div className={styles.headingRow}>
              <h2>{content.title}</h2>
              <span className={styles.dot} aria-hidden="true" />
            </div>

            <article className={styles.contactCard}>
              <p>{content.subtitle}</p>

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

              <a href={`mailto:${content.email || "hello@example.com"}`} className={styles.primaryButton} aria-label="Send me an email">
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
      <div className={styles.orbs} aria-hidden="true">
        <div className={styles.orbA} />
        <div className={styles.orbB} />
      </div>

      <div className={styles.shell}>
        <header className={styles.navShell}>
          <div className={styles.navInner}>
            <p className={styles.brand}>{getInitials(heroContent.fullName)} Portfolio</p>

            <nav className={styles.navMenu} aria-label="Sections">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigateTo(tab.id)}
                  className={`${styles.navLink} ${
                    activeSection === tab.id ? styles.navLinkActive : ""
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <button
              type="button"
              className={styles.mobileToggle}
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}>
            {navTabs.map((tab) => (
              <button key={`mobile-${tab.id}`} type="button" onClick={() => navigateTo(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {sections.map((section) => {
          const rendered = renderSection(section);
          if (!rendered) return null;
          return (
            <SectionFrame
              key={section.id}
              sectionId={section.id}
              sectionLabel={sectionTitle(section)}
              selected={canvasEditor?.selectedSectionId === section.id}
              enabled={Boolean(canvasEditor?.enabled)}
              height={canvasEditor?.getSectionHeight?.(section.id)}
              onSelect={(sectionId) => canvasEditor?.onSelectSection(sectionId)}
              onReorder={(draggedSectionId, targetSectionId) =>
                canvasEditor?.onReorderSections(draggedSectionId, targetSectionId)
              }
              onResize={(sid, h) => canvasEditor?.onResizeSection?.(sid, h)}
            >
              {rendered}
            </SectionFrame>
          );
        })}

        <footer className={styles.footer}>
          (c) {new Date().getFullYear()} {heroContent.fullName}. Built to stand out with substance.
        </footer>
      </div>
    </div>
  );
}
