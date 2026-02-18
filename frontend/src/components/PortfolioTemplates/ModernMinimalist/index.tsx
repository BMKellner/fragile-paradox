"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Menu, X } from "lucide-react";
import type { Experience, Project } from "@/constants/ResumeFormat";
import styles from "./ModernMinimalist.module.css";
import {
  buildBlogPreview,
  buildStats,
  buildTestimonials,
  categorizeSkills,
  getInitials,
  normalizeExperience,
  normalizeOverview,
  normalizePersonalInfo,
  normalizeProjects,
  sanitizeHexColor,
} from "./helpers";
import type { ModernMinimalistProps, SectionTab, TabKey } from "./types";
import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { SkillsSection } from "./sections/SkillsSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { BlogSection } from "./sections/BlogSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { ContactSection } from "./sections/ContactSection";

const sectionTabs: SectionTab[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "blog", label: "Blog" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Resume" },
];

export default function ModernMinimalistPortfolio({
  personalInformation,
  overviewData,
  projects,
  experience,
  skills,
  mainColor,
  backgroundColor,
}: ModernMinimalistProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const personal = useMemo(() => normalizePersonalInfo(personalInformation), [personalInformation]);
  const overview = useMemo(() => normalizeOverview(overviewData), [overviewData]);
  const skillList = useMemo(() => skills?.filter(Boolean) ?? [], [skills]);

  const projectsList = useMemo(
    () => normalizeProjects(projects as Array<Project | string> | undefined, skillList),
    [projects, skillList]
  );

  const experienceList = useMemo(
    () => normalizeExperience(experience as Array<Experience | string> | undefined, skillList),
    [experience, skillList]
  );

  const stats = useMemo(
    () => buildStats(projectsList, experienceList, skillList, overview),
    [projectsList, experienceList, skillList, overview]
  );

  const skillCategories = useMemo(() => categorizeSkills(skillList), [skillList]);
  const blogPreview = useMemo(() => buildBlogPreview(projectsList, overview), [projectsList, overview]);
  const testimonials = useMemo(
    () => buildTestimonials(personal.full_name, overview.career_name),
    [personal.full_name, overview.career_name]
  );

  const initials = useMemo(() => getInitials(personal.full_name), [personal.full_name]);

  const accentColor = sanitizeHexColor(mainColor, "#ef4444");
  const resolvedBackground = sanitizeHexColor(backgroundColor, "#0a0a0a");
  const isLightTheme = (() => {
    const hex = resolvedBackground.replace("#", "");
    const normalized = hex.length === 3 ? hex.split("").map((part) => part + part).join("") : hex;
    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 180;
  })();

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

    const sectionElements = sectionTabs
      .map((tab) => scope.querySelector<HTMLElement>(`#${tab.id}`))
      .filter((element): element is HTMLElement => Boolean(element));

    const activeObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveTab(visible[0].target.id as TabKey);
        }
      },
      { threshold: [0.2, 0.45], rootMargin: "-35% 0px -45% 0px" }
    );

    sectionElements.forEach((section) => activeObserver.observe(section));

    return () => {
      revealObserver.disconnect();
      activeObserver.disconnect();
    };
  }, []);

  const handleNavigate = (id: TabKey) => {
    setMenuOpen(false);
    setActiveTab(id);

    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyEmail = async () => {
    const email = personal.contact_info.email;
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 1500);
    } catch {
      setEmailCopied(false);
    }
  };

  const hasRenderableData =
    Boolean(personalInformation) ||
    Boolean(overviewData) ||
    Boolean(projects?.length) ||
    Boolean(experience?.length) ||
    Boolean(skills?.length);

  if (!hasRenderableData) {
    return (
      <div className={styles.root}>
        <div className={styles.mainContent}>
          <article className={styles.emptyCard} style={{ marginTop: "6rem" }}>
            <p>No resume data found. Please upload your resume to generate a portfolio preview.</p>
          </article>
        </div>
      </div>
    );
  }

  const rootStyle = {
    "--mm-accent": accentColor,
    "--mm-bg": resolvedBackground,
  } as CSSProperties;

  return (
    <div className={`${styles.root} ${isLightTheme ? styles.lightMode : ""}`} style={rootStyle} ref={rootRef}>
      <div className={styles.starryBackdrop} aria-hidden="true">
        <div className={styles.starLayer} />
        <div className={styles.starLayerAlt} />
        <div className={styles.glowOne} />
        <div className={styles.glowTwo} />
      </div>

      <header className={styles.navShell}>
        <div className={styles.navInner}>
          <p className={styles.brand}>{personal.full_name}</p>

          <nav className={styles.navMenu} aria-label="Portfolio sections">
            {sectionTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleNavigate(tab.id)}
                className={`${styles.navLink} ${tab.id === "contact" ? styles.navLinkResume : ""} ${activeTab === tab.id ? styles.activeNavLink : ""}`}
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
          {sectionTabs.map((tab) => (
            <button
              key={`mobile-${tab.id}`}
              type="button"
              onClick={() => handleNavigate(tab.id)}
              style={tab.id === "contact" ? { color: accentColor } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className={styles.mainContent}>
        <HeroSection
          fullName={personal.full_name}
          careerName={overview.career_name}
          summary={overview.resume_summary}
          email={personal.contact_info.email}
          onCopyEmail={copyEmail}
          emailCopied={emailCopied}
          onExploreProjects={() => handleNavigate("projects")}
        />

        <AboutSection
          fullName={personal.full_name}
          initials={initials}
          summary={overview.resume_summary}
          stats={stats}
          education={{
            school: personal.education.school,
            majors: personal.education.majors,
            expectedGrad: personal.education.expected_grad,
          }}
        />

        <ProjectsSection projects={projectsList} />
        <SkillsSection categories={skillCategories} />
        <ExperienceSection experience={experienceList} />
        <BlogSection preview={blogPreview} />
        <TestimonialsSection testimonials={testimonials} />

        <ContactSection
          email={personal.contact_info.email}
          phone={personal.contact_info.phone}
          address={personal.contact_info.address}
          linkedin={personal.contact_info.linkedin}
        />

        <footer className={styles.footer}>
          <p>
            © {new Date().getFullYear()} {personal.full_name}. Built with precision and intentional design.
          </p>
        </footer>
      </main>
    </div>
  );
}
