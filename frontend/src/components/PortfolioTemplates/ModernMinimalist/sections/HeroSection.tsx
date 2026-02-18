import Link from "next/link";
import { Check, Copy, Mail, ArrowDown } from "lucide-react";
import styles from "../ModernMinimalist.module.css";

type HeroSectionProps = {
  sectionId?: string;
  eyebrow?: string;
  fullName: string;
  careerName: string;
  summary: string;
  email: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  onCopyEmail: () => void;
  emailCopied: boolean;
  onExploreProjects: () => void;
};

export function HeroSection({
  sectionId = "home",
  eyebrow = "Hey, I'm",
  fullName,
  careerName,
  summary,
  email,
  primaryCtaLabel = "Explore Projects",
  secondaryCtaLabel = "Copy Email",
  onCopyEmail,
  emailCopied,
  onExploreProjects,
}: HeroSectionProps) {
  return (
    <section id={sectionId} className={`${styles.section} ${styles.heroSection} reveal`}>
      <div className={styles.heroGlow} aria-hidden="true" />

      <div className={styles.heroContent}>
        <p className={styles.eyebrow}>{eyebrow || "Hey, I'm"}</p>

        <h1 className={styles.heroName}>{fullName.toUpperCase()}</h1>

        <div className={styles.roleBadge}>{careerName || "Full Stack Developer"}</div>

        <p className={styles.heroSummary}>
          {summary} <span className={styles.gradientText}>I focus on elegant systems and frictionless user experiences.</span>
        </p>

        <div className={styles.heroActions}>
          <button type="button" className={styles.primaryButton} onClick={onExploreProjects}>
            {primaryCtaLabel || "Explore Projects"}
          </button>

          {email ? (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onCopyEmail}
              aria-label="Copy email address"
            >
              {emailCopied ? <Check size={16} /> : <Copy size={16} />}
              <span>{emailCopied ? "Copied" : secondaryCtaLabel || email}</span>
            </button>
          ) : (
            <Link href="mailto:hello@example.com" className={styles.secondaryButton} aria-label="Send email">
              <Mail size={16} />
              <span>Send an email</span>
            </Link>
          )}
        </div>
      </div>

      <button
        type="button"
        className={styles.scrollIndicator}
        onClick={onExploreProjects}
        aria-label="Scroll to projects section"
      >
        <ArrowDown size={18} />
      </button>
    </section>
  );
}
