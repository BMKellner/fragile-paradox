"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Menu, X } from "lucide-react";
import styles from "./CreativeBold.module.css";
import {
  buildBlogPreview,
  buildStats,
  buildTestimonials,
  categorizeSkills,
  defaultTabs,
  getInitials,
  isLightColor,
  normalizeExperience,
  normalizeOverview,
  normalizePersonalInfo,
  normalizeProjects,
  sanitizeHexColor,
  setupSectionObservers,
  type SectionId,
  type TemplateProps,
} from "@/components/PortfolioTemplates/shared/portfolioData";
import { HeroSection } from "./sections/HeroSection";
import { ContentSections } from "./sections/ContentSections";
import { ContactFooter } from "./sections/ContactFooter";

export default function CreativeBoldPortfolio({
  personalInformation,
  overviewData,
  projects,
  experience,
  skills,
  mainColor,
  backgroundColor,
}: TemplateProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const personal = useMemo(() => normalizePersonalInfo(personalInformation), [personalInformation]);
  const overview = useMemo(() => normalizeOverview(overviewData), [overviewData]);
  const skillList = useMemo(() => skills?.filter(Boolean) ?? [], [skills]);

  const projectsList = useMemo(() => normalizeProjects(projects, skillList), [projects, skillList]);
  const experienceList = useMemo(() => normalizeExperience(experience, skillList), [experience, skillList]);
  const skillGroups = useMemo(() => categorizeSkills(skillList), [skillList]);
  const stats = useMemo(() => buildStats(projectsList, experienceList, skillList, overview), [projectsList, experienceList, skillList, overview]);
  const blog = useMemo(() => buildBlogPreview(projectsList, overview), [projectsList, overview]);
  const testimonials = useMemo(() => buildTestimonials(personal.full_name, overview.career_name), [personal.full_name, overview.career_name]);

  const accent = sanitizeHexColor(mainColor, "#ef4444");
  const bg = sanitizeHexColor(backgroundColor, "#0b1220");
  const darkMode = !isLightColor(bg, 175);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return setupSectionObservers(root, defaultTabs, setActiveSection);
  }, []);

  const hasRenderableData =
    Boolean(personalInformation) ||
    Boolean(overviewData) ||
    Boolean(projects?.length) ||
    Boolean(experience?.length) ||
    Boolean(skills?.length);

  const rootStyle = {
    "--cb-accent": accent,
    "--cb-bg": bg,
  } as CSSProperties;

  const navigateTo = (id: SectionId) => {
    setActiveSection(id);
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyEmail = async () => {
    if (!personal.contact_info.email) return;

    try {
      await navigator.clipboard.writeText(personal.contact_info.email);
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 1500);
    } catch {
      setEmailCopied(false);
    }
  };

  if (!hasRenderableData) {
    return (
      <div className={styles.root} style={rootStyle}>
        <div className={styles.shell}>
          <section className={styles.hero}>
            <p className={styles.summary}>No resume data found. Upload your resume to generate a template preview.</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.root} ${darkMode ? styles.darkMode : ""}`} style={rootStyle} ref={rootRef}>
      <div className={styles.orbs} aria-hidden="true">
        <div className={styles.orbA} />
        <div className={styles.orbB} />
      </div>

      <div className={styles.shell}>
        <header className={styles.navShell}>
          <div className={styles.navInner}>
            <p className={styles.brand}>{getInitials(personal.full_name)} Portfolio</p>

            <nav className={styles.navMenu} aria-label="Sections">
              {defaultTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigateTo(tab.id)}
                  className={`${styles.navLink} ${tab.id === "contact" ? styles.navAccent : ""} ${
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
            {defaultTabs.map((tab) => (
              <button key={`mobile-${tab.id}`} type="button" onClick={() => navigateTo(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <HeroSection
          fullName={personal.full_name}
          careerName={overview.career_name}
          summary={overview.resume_summary}
          email={personal.contact_info.email}
          onCopyEmail={copyEmail}
          emailCopied={emailCopied}
        />

        <ContentSections
          overviewSummary={overview.resume_summary}
          stats={stats}
          projects={projectsList}
          skills={skillGroups}
          experience={experienceList}
          blog={blog}
          testimonials={testimonials}
        />

        <ContactFooter
          fullName={personal.full_name}
          email={personal.contact_info.email}
          phone={personal.contact_info.phone}
          address={personal.contact_info.address}
          linkedin={personal.contact_info.linkedin}
        />
      </div>
    </div>
  );
}
