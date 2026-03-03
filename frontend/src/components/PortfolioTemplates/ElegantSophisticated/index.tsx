"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Inter, Sora } from "next/font/google";
import { Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./ElegantSophisticated.module.css";
import {
  SectionType,
  type AboutSectionContent,
  type ContactSectionContent,
  type ExperienceSectionContent,
  type HeroSectionContent,
} from "@/lib/template-config";
import {
  enabledSections,
  firstSectionOfType,
  resolveTemplateConfigFromProps,
} from "@/components/PortfolioTemplates/shared/templateConfigAdapter";
import {
  getInitials,
  isLightColor,
  sanitizeHexColor,
  type TemplateProps,
} from "@/components/PortfolioTemplates/shared/portfolioData";
import { Navbar, type NavItem } from "./components/navbar";
import { Section } from "./components/section";
import { Card, Pill } from "./components/cards";
import { ExperienceTimeline } from "./components/experience-timeline";
import { ContactForm } from "./components/contact-form";
import { Footer } from "./components/footer";
import {
  pageLoadVariants,
  revealItemVariants,
  staggerContainerVariants,
} from "./components/motion";
import { ProjectsSection } from "./sections/projects-section";

const displayFont = Sora({
  variable: "--es-font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Inter({
  variable: "--es-font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const DEFAULT_HERO: HeroSectionContent = {
  title: "Portfolio",
  eyebrow: "Portfolio",
  fullName: "Your Name",
  careerName: "Professional Specialist",
  summary:
    "I help teams turn complex goals into clear outcomes through strategy, execution, and thoughtful collaboration.",
  primaryCtaLabel: "Email",
  secondaryCtaLabel: "Location",
};

const DEFAULT_ABOUT: AboutSectionContent = {
  title: "About",
  subtitle: "A brief profile that works across design, marketing, healthcare, operations, and business roles.",
  summary:
    "I focus on practical systems that improve service quality, communication, and measurable outcomes. My work balances strategic thinking with reliable day-to-day delivery.",
  educationLabel: "Professional Background",
  educationDetails: "Add degrees, certifications, or domain training details here.",
  stats: [
    { label: "Years in Practice", value: "8+" },
    { label: "Initiatives Delivered", value: "35+" },
    { label: "Cross-Functional Teams", value: "14" },
  ],
};

const DEFAULT_EXPERIENCE: ExperienceSectionContent = {
  title: "Experience",
  subtitle: "Recent roles and highlights presented in a concise timeline.",
  items: [
    {
      company: "Organization Name",
      employedDates: "2022 - Present",
      bullets: [
        "Led high-impact programs spanning operations, client experience, and internal process improvement.",
      ],
      tags: ["Leadership", "Delivery"],
    },
  ],
};

const DEFAULT_CONTACT: ContactSectionContent = {
  title: "Contact",
  subtitle: "Reach out for consulting, full-time opportunities, or strategic collaborations.",
  email: "hello@example.com",
  phone: "",
  address: "Remote",
  linkedin: "",
  ctaLabel: "Send me an email",
};

const hexToRgbTriplet = (hexColor: string): string => {
  const normalized = sanitizeHexColor(hexColor, "#0a0d16").replace("#", "");
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `${red} ${green} ${blue}`;
};

const normalizeExternalUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
};

const navLabelForType = (type: SectionType): string => {
  switch (type) {
    case SectionType.About:
      return "About";
    case SectionType.Projects:
      return "Projects";
    case SectionType.Experience:
      return "Experience";
    case SectionType.Contact:
      return "Contact";
    default:
      return "Section";
  }
};

export default function ElegantSophisticatedPortfolio({
  personalInformation,
  overviewData,
  projects,
  experience,
  skills,
  mainColor,
  backgroundColor,
  templateConfig,
}: TemplateProps) {
  const [activeSection, setActiveSection] = useState("hero-1");

  const resolvedConfig = useMemo(
    () =>
      resolveTemplateConfigFromProps({
        templateId: "4",
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

  const allEnabledSections = useMemo(() => enabledSections(resolvedConfig), [resolvedConfig]);
  const heroSection = firstSectionOfType(resolvedConfig, SectionType.Hero);
  const primaryContactSection = firstSectionOfType(resolvedConfig, SectionType.Contact);
  const heroContent = heroSection?.content ?? DEFAULT_HERO;
  const primaryContactContent = primaryContactSection?.content ?? DEFAULT_CONTACT;
  const heroId = heroSection?.id ?? "hero-1";

  const orderedContentSections = useMemo(
    () =>
      allEnabledSections.filter(
        (section) =>
          section.type === SectionType.About ||
          section.type === SectionType.Projects ||
          section.type === SectionType.Experience ||
          section.type === SectionType.Contact
      ),
    [allEnabledSections]
  );

  const navItems = useMemo<NavItem[]>(
    () => [
      { id: heroId, label: heroSection?.navLabel?.trim() || "Home" },
      ...orderedContentSections.map((section) => ({
        id: section.id,
        label: section.navLabel?.trim() || navLabelForType(section.type),
      })),
    ],
    [heroId, heroSection?.navLabel, orderedContentSections]
  );

  useEffect(() => {
    setActiveSection(heroId);
  }, [heroId]);

  useEffect(() => {
    const sectionElements = navItems
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!sectionElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio);

        const newActiveId = visibleSections[0]?.target.id;
        if (newActiveId) setActiveSection(newActiveId);
      },
      {
        threshold: [0.22, 0.45, 0.7],
        rootMargin: "-34% 0px -48% 0px",
      }
    );

    sectionElements.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [navItems]);

  const navigateTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const accent = sanitizeHexColor(resolvedConfig.theme.primaryColor, "#d3b36b");
  const baseBackground = sanitizeHexColor(resolvedConfig.theme.backgroundColor, "#0a0d16");
  const lightMode = isLightColor(baseBackground, 168);

  const rootStyle = {
    "--es-accent": accent,
    "--es-bg": baseBackground,
    "--es-bg-rgb": hexToRgbTriplet(baseBackground),
  } as CSSProperties;

  const profileName = heroContent.fullName || "Your Name";
  const profileTitle = heroContent.careerName || "Professional Specialist";
  const locationValue = primaryContactContent.address?.trim() || "Remote / Open to opportunities";
  const contactEmail = primaryContactContent.email?.trim() || "hello@example.com";
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationValue)}`;

  return (
    <div
      className={`${styles.root} ${lightMode ? styles.lightMode : ""} ${displayFont.variable} ${bodyFont.variable}`}
      style={rootStyle}
    >
      <a href="#es-main-content" className={styles.skipLink}>
        Skip to content
      </a>

      <div className={styles.mainShell}>
        <Navbar
          brand={`${getInitials(profileName) || "YN"} Portfolio`}
          items={navItems}
          activeId={activeSection}
          onNavigate={navigateTo}
        />

        <motion.main id="es-main-content" variants={pageLoadVariants} initial="hidden" animate="visible">
          <section id={heroId} className={styles.hero} aria-labelledby={`${heroId}-title`}>
            <motion.div className={styles.heroInner} variants={staggerContainerVariants} initial="hidden" animate="visible">
              <motion.p className={styles.heroEyebrow} variants={revealItemVariants}>
                {heroContent.eyebrow || "Portfolio"}
              </motion.p>

              <motion.h1 id={`${heroId}-title`} className={styles.heroName} variants={revealItemVariants}>
                {profileName}
              </motion.h1>

              <motion.p className={styles.heroHeadline} variants={revealItemVariants}>
                {profileTitle}
              </motion.p>

              <motion.p className={styles.heroSummary} variants={revealItemVariants}>
                {heroContent.summary || DEFAULT_HERO.summary}
              </motion.p>

              <motion.div className={styles.heroActions} variants={revealItemVariants}>
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.buttonGhost}
                  aria-label={`Open map for ${locationValue}`}
                >
                  <MapPin size={16} />
                  {locationValue}
                </a>
              </motion.div>
            </motion.div>
          </section>

          {orderedContentSections.map((section) => {
            switch (section.type) {
              case SectionType.About: {
                const aboutContent = section.content;
                const aboutStats = aboutContent.stats.length ? aboutContent.stats : DEFAULT_ABOUT.stats;

                return (
                  <Section
                    key={section.id}
                    id={section.id}
                    title={aboutContent.title || "About"}
                    subtitle={aboutContent.subtitle || DEFAULT_ABOUT.subtitle}
                    bodyClassName={styles.aboutGrid}
                  >
                    <Card className={styles.aboutLead}>
                      <p className={styles.bodyText}>{aboutContent.summary || DEFAULT_ABOUT.summary}</p>
                    </Card>

                    <Card className={styles.aboutSupport}>
                      <h3 className={styles.subheading}>{aboutContent.educationLabel || "Background"}</h3>
                      <p className={styles.mutedText}>
                        {aboutContent.educationDetails ||
                          "Add domain background, credentials, or relevant training details here."}
                      </p>

                      <div className={styles.pillRow}>
                        {aboutStats.map((stat) => (
                          <Pill key={stat.label}>{`${stat.label}: ${stat.value}`}</Pill>
                        ))}
                      </div>
                    </Card>
                  </Section>
                );
              }
              case SectionType.Projects: {
                const projectsContent = section.content;

                return (
                  <Section
                    key={section.id}
                    id={section.id}
                    title={projectsContent.title || "Projects"}
                    subtitle={projectsContent.subtitle || "Selected work and outcomes from recent projects."}
                  >
                    <ProjectsSection projects={projectsContent.items} />
                  </Section>
                );
              }
              case SectionType.Experience: {
                const experienceContent = section.content;

                return (
                  <Section
                    key={section.id}
                    id={section.id}
                    title={experienceContent.title || "Experience"}
                    subtitle={experienceContent.subtitle || DEFAULT_EXPERIENCE.subtitle}
                  >
                    <ExperienceTimeline items={experienceContent.items} />
                  </Section>
                );
              }
              case SectionType.Contact: {
                const contactContent = section.content;
                const sectionLocation = contactContent.address?.trim() || locationValue;
                const sectionEmail = contactContent.email?.trim() || contactEmail;
                const sectionPhone = contactContent.phone?.trim();
                const sectionLinkedin = normalizeExternalUrl(contactContent.linkedin ?? "");
                const sectionMapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sectionLocation)}`;

                return (
                  <Section
                    key={section.id}
                    id={section.id}
                    title={contactContent.title || "Contact"}
                    subtitle={contactContent.subtitle || DEFAULT_CONTACT.subtitle}
                    bodyClassName={styles.contactGrid}
                  >
                    <Card>
                      <h3 className={styles.subheading}>Direct contact</h3>

                      <ul className={styles.infoList}>
                        <li className={styles.infoItem}>
                          <Mail size={16} />
                          <div>
                            <span className={styles.infoLabel}>Email</span>
                            <a href={`mailto:${sectionEmail}`} className={styles.infoValue}>
                              {sectionEmail}
                            </a>
                          </div>
                        </li>

                        <li className={styles.infoItem}>
                          <MapPin size={16} />
                          <div>
                            <span className={styles.infoLabel}>Location</span>
                            <a href={sectionMapLink} target="_blank" rel="noreferrer" className={styles.infoValue}>
                              {sectionLocation}
                            </a>
                          </div>
                        </li>

                        {sectionPhone ? (
                          <li className={styles.infoItem}>
                            <Phone size={16} />
                            <div>
                              <span className={styles.infoLabel}>Phone</span>
                              <a href={`tel:${sectionPhone}`} className={styles.infoValue}>
                                {sectionPhone}
                              </a>
                            </div>
                          </li>
                        ) : null}

                        {sectionLinkedin ? (
                          <li className={styles.infoItem}>
                            <Linkedin size={16} />
                            <div>
                              <span className={styles.infoLabel}>LinkedIn</span>
                              <a href={sectionLinkedin} target="_blank" rel="noreferrer" className={styles.infoValue}>
                                Visit profile
                              </a>
                            </div>
                          </li>
                        ) : null}
                      </ul>
                    </Card>

                    <ContactForm
                      recipientEmail={sectionEmail}
                      ctaLabel={contactContent.ctaLabel || "Send me an email"}
                    />
                  </Section>
                );
              }
              default:
                return null;
            }
          })}

          <Footer fullName={profileName} />
        </motion.main>
      </div>
    </div>
  );
}
