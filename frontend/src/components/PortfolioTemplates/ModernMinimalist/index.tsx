"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Menu, X } from "lucide-react";
import styles from "./ModernMinimalist.module.css";
import {
  SectionType,
  sectionTitle,
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
import { resolveTemplateConfigFromProps, enabledSections } from "@/components/PortfolioTemplates/shared/templateConfigAdapter";
import type { ModernMinimalistProps } from "./types";
import { sanitizeHexColor } from "./helpers";
import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { SkillsSection } from "./sections/SkillsSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { BlogSection } from "./sections/BlogSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { ContactSection } from "./sections/ContactSection";

const navLabel = (type: SectionType, fallback: string): string => {
  if (type === SectionType.Hero) return "Home";
  if (type === SectionType.Contact) return "Contact";
  return fallback;
};

export default function ModernMinimalistPortfolio({
  personalInformation,
  overviewData,
  projects,
  experience,
  skills,
  mainColor,
  backgroundColor,
  templateConfig,
}: ModernMinimalistProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("hero-1");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const resolvedConfig = useMemo(
    () =>
      resolveTemplateConfigFromProps({
        templateId: "1",
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
    if (navTabs.length && !navTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(navTabs[0].id);
    }
  }, [navTabs, activeTab]);

  useEffect(() => {
    const scope = rootRef.current;
    if (!scope) return;

    const revealElements = Array.from(scope.querySelectorAll(".reveal"));
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("isVisible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));

    const sectionElements = navTabs
      .map((tab) => scope.querySelector<HTMLElement>(`#${tab.id}`))
      .filter((element): element is HTMLElement => Boolean(element));

    const activeObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveTab(visible[0].target.id);
        }
      },
      { threshold: [0.2, 0.45], rootMargin: "-35% 0px -45% 0px" }
    );

    sectionElements.forEach((section) => activeObserver.observe(section));

    return () => {
      revealObserver.disconnect();
      activeObserver.disconnect();
    };
  }, [navTabs]);

  const handleNavigate = (id: string) => {
    setMenuOpen(false);
    setActiveTab(id);

    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const contactSection = sections.find((section) => section.type === SectionType.Contact);
  const heroSection = sections.find((section) => section.type === SectionType.Hero);
  const heroContent =
    (heroSection?.content as HeroSectionContent | undefined) ??
    ({
      title: "Hero",
      eyebrow: "Portfolio",
      fullName: "Your Name",
      careerName: "Software Engineer",
      summary: "",
      primaryCtaLabel: "Explore Projects",
      secondaryCtaLabel: "Copy Email",
    } satisfies HeroSectionContent);
  const contactContent =
    (contactSection?.content as ContactSectionContent | undefined) ??
    ({
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      title: "Contact",
      subtitle: "",
      ctaLabel: "Send me an email",
    } satisfies ContactSectionContent);

  const copyEmail = async () => {
    const email = contactContent.email;
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 1500);
    } catch {
      setEmailCopied(false);
    }
  };

  const accentColor = sanitizeHexColor(resolvedConfig.theme.primaryColor, "#ef4444");
  const resolvedBackground = sanitizeHexColor(resolvedConfig.theme.backgroundColor, "#0a0a0a");
  const isLightTheme = resolvedConfig.theme.mode === "light";

  const rootStyle = {
    "--mm-accent": accentColor,
    "--mm-bg": resolvedBackground,
  } as CSSProperties;

  const firstProjectsSection = sections.find((section) => section.type === SectionType.Projects)?.id;

  const renderSection = (section: (typeof sections)[number]) => {
    switch (section.type) {
      case SectionType.Hero: {
        const content = section.content as HeroSectionContent;
        return (
          <HeroSection
            key={section.id}
            sectionId={section.id}
            eyebrow={content.eyebrow}
            fullName={content.fullName || "Your Name"}
            careerName={content.careerName || "Software Engineer"}
            summary={
              content.summary ||
              "I focus on elegant systems and frictionless user experiences."
            }
            email={contactContent.email}
            primaryCtaLabel={content.primaryCtaLabel}
            secondaryCtaLabel={content.secondaryCtaLabel || contactContent.email}
            onCopyEmail={copyEmail}
            emailCopied={emailCopied}
            onExploreProjects={() =>
              handleNavigate(firstProjectsSection || sections[1]?.id || section.id)
            }
          />
        );
      }
      case SectionType.About: {
        const content = section.content;

        return (
          <AboutSection
            key={section.id}
            sectionId={section.id}
            title={content.title}
            subtitle={content.subtitle}
            fullName={heroContent.fullName || "Your Name"}
            initials={(heroContent.fullName || "Your Name")
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
            summary={content.summary || "Add your professional summary."}
            stats={{
              yearsExperience: content.stats[0]?.value || "0+ Years",
              projectCount: content.stats[1]?.value || "0+ Projects",
              specialization: content.stats[2]?.value || "Engineer",
              impact: content.stats[3]?.value || "3 Core Skills",
            }}
            education={{
              label: content.educationLabel,
              school: content.educationLabel,
              majors: content.educationDetails
                ? content.educationDetails.split("|").map((part) => part.trim()).filter(Boolean)
                : [],
              expectedGrad: "",
            }}
          />
        );
      }
      case SectionType.Projects: {
        const content = section.content as ProjectsSectionContent;
        return (
          <ProjectsSection
            key={section.id}
            sectionId={section.id}
            title={content.title}
            subtitle={content.subtitle}
            projects={content.items}
          />
        );
      }
      case SectionType.Skills: {
        const content = section.content as SkillsSectionContent;
        return (
          <SkillsSection
            key={section.id}
            sectionId={section.id}
            title={content.title}
            subtitle={content.subtitle}
            categories={content.categories}
          />
        );
      }
      case SectionType.Experience: {
        const content = section.content as ExperienceSectionContent;
        return (
          <ExperienceSection
            key={section.id}
            sectionId={section.id}
            title={content.title}
            subtitle={content.subtitle}
            experience={content.items.map((item) => ({
              ...item,
              description: item.bullets.join('. '),
            }))}
          />
        );
      }
      case SectionType.Education: {
        const content = section.content as EducationSectionContent;
        return (
          <section key={section.id} id={section.id} className={`${styles.section} reveal`}>
            <header className={styles.sectionHeaderCentered}>
              <h2>
                {content.title}
                <span className={styles.titleDot}>.</span>
              </h2>
              <p>{content.subtitle}</p>
            </header>
            {content.entries.length ? (
              <div className={styles.timelineItems}>
                {content.entries.map((entry, index) => (
                  <article key={`${entry.school}-${index}`} className={styles.timelineCard}>
                    <div className={styles.timelineHeader}>
                      <h3>{entry.school || "School"}</h3>
                      {entry.expectedGrad ? <p>{entry.expectedGrad}</p> : null}
                    </div>
                    <ul>
                      {[...entry.majors, ...entry.minors.map((minor) => `Minor: ${minor}`)]
                        .filter(Boolean)
                        .map((detail) => (
                          <li key={`${entry.school}-${detail}`}>{detail}</li>
                        ))}
                    </ul>
                  </article>
                ))}
              </div>
            ) : (
              <article className={styles.emptyCard}>
                <p>Add education details to populate this section.</p>
              </article>
            )}
          </section>
        );
      }
      case SectionType.Certifications: {
        const content = section.content as CertificationsSectionContent;
        return (
          <section key={section.id} id={section.id} className={`${styles.section} reveal`}>
            <header className={styles.sectionHeaderCentered}>
              <h2>
                {content.title}
                <span className={styles.titleDot}>.</span>
              </h2>
              <p>{content.subtitle}</p>
            </header>
            {content.entries.length ? (
              <div className={styles.projectsGrid}>
                {content.entries.map((entry, index) => (
                  <article key={`${entry.name}-${index}`} className={styles.projectCard}>
                    <div className={styles.projectHeader}>
                      <h3>{entry.name || "Certification"}</h3>
                      <p>{entry.issuer || "Issuer"}</p>
                    </div>
                    {entry.year ? <p>{entry.year}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <article className={styles.emptyCard}>
                <p>Add certifications to populate this section.</p>
              </article>
            )}
          </section>
        );
      }
      case SectionType.Blog: {
        const content = section.content as BlogSectionContent;
        return (
          <BlogSection
            key={section.id}
            sectionId={section.id}
            title={content.title}
            subtitle={content.subtitle}
            ctaLabel={content.ctaLabel}
            preview={{
              date: content.date || "",
              readingTime: content.readingTime || "",
              title: content.postTitle || "Featured Article",
              excerpt: content.excerpt || "",
              tags: content.tags || [],
            }}
          />
        );
      }
      case SectionType.Testimonials: {
        const content = section.content as TestimonialsSectionContent;
        return (
          <TestimonialsSection
            key={section.id}
            sectionId={section.id}
            title={content.title}
            subtitle={content.subtitle}
            testimonials={content.items}
          />
        );
      }
      case SectionType.Contact: {
        const content = section.content as ContactSectionContent;
        return (
          <ContactSection
            key={section.id}
            sectionId={section.id}
            title={content.title}
            subtitle={content.subtitle}
            ctaLabel={content.ctaLabel}
            email={content.email || ""}
            phone={content.phone || ""}
            address={content.address || ""}
            linkedin={content.linkedin || ""}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div
      className={`${styles.root} ${isLightTheme ? styles.lightMode : ""}`}
      style={rootStyle}
      ref={rootRef}
    >
      <div className={styles.starryBackdrop} aria-hidden="true">
        <div className={styles.starLayer} />
        <div className={styles.starLayerAlt} />
        <div className={styles.glowOne} />
        <div className={styles.glowTwo} />
      </div>

      <header className={styles.navShell}>
        <div className={styles.navInner}>
          <p className={styles.brand}>
            {heroContent.fullName || "Your Name"}
          </p>

          <nav className={styles.navMenu} aria-label="Portfolio sections">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleNavigate(tab.id)}
                className={`${styles.navLink} ${
                  activeTab === tab.id ? styles.activeNavLink : ""
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
            <button
              key={`mobile-${tab.id}`}
              type="button"
              onClick={() => handleNavigate(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className={styles.mainContent}>
        {sections.map((section) => renderSection(section))}

        <footer className={styles.footer}>
          <p>
            (c) {new Date().getFullYear()} {heroContent.fullName || "Your Name"}. Built with precision and intentional design.
          </p>
        </footer>
      </main>
    </div>
  );
}
