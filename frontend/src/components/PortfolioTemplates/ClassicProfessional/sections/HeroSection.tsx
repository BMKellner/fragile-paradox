import { Check, Copy, Mail, MapPin } from "lucide-react";
import styles from "../ClassicProfessional.module.css";

type HeroSectionProps = {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  fullName: string;
  careerName: string;
  summary: string;
  email: string;
  location: string;
  onCopyEmail: () => void;
  emailCopied: boolean;
};

export function HeroSection({
  sectionId = "home",
  title = "Professional Portfolio",
  subtitle,
  primaryCtaLabel = "Reach Out",
  fullName,
  careerName,
  summary,
  email,
  location,
  onCopyEmail,
  emailCopied,
}: HeroSectionProps) {
  return (
    <section id={sectionId} className={styles.hero} data-reveal>
      <div className={styles.heroHeader}>
        <p className={styles.eyebrow}>{title || "Professional Portfolio"}</p>
        <h1>{fullName}</h1>
        <p className={styles.role}>{careerName || "Software Engineer"}</p>
        <p className={styles.summary}>{subtitle || summary}</p>
      </div>

      <div className={styles.heroMeta}>
        {location ? (
          <div className={styles.metaPill}>
            <MapPin size={14} />
            <span>{location}</span>
          </div>
        ) : null}

        {email ? (
          <button type="button" className={styles.metaPillButton} onClick={onCopyEmail} aria-label="Copy email address">
            {emailCopied ? <Check size={14} /> : <Copy size={14} />}
            <span>{emailCopied ? "Copied" : email}</span>
          </button>
        ) : null}

        <a href={`mailto:${email || "hello@example.com"}`} className={styles.ctaButton}>
          <Mail size={14} />
          {primaryCtaLabel || "Reach Out"}
        </a>
      </div>
    </section>
  );
}
