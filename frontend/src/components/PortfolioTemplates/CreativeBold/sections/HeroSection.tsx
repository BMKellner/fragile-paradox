import { Check, Copy, Sparkles } from "lucide-react";
import styles from "../CreativeBold.module.css";

type HeroSectionProps = {
  fullName: string;
  careerName: string;
  summary: string;
  email: string;
  onCopyEmail: () => void;
  emailCopied: boolean;
};

export function HeroSection({
  fullName,
  careerName,
  summary,
  email,
  onCopyEmail,
  emailCopied,
}: HeroSectionProps) {
  return (
    <section id="home" className={styles.hero} data-reveal>
      <div className={styles.heroNoise} aria-hidden="true" />

      <div className={styles.heroText}>
        <p className={styles.eyebrow}>Professional Portfolio</p>
        <h1>{fullName}</h1>
        <p className={styles.role}>{careerName || "Product Engineer"}</p>
        <p className={styles.summary}>{summary}</p>

        <div className={styles.heroActions}>
          <a href={`mailto:${email || "hello@example.com"}`} className={styles.primaryButton}>
            <Sparkles size={15} />
            Let&apos;s Build
          </a>

          {email ? (
            <button type="button" className={styles.secondaryButton} onClick={onCopyEmail} aria-label="Copy email address">
              {emailCopied ? <Check size={15} /> : <Copy size={15} />}
              <span>{emailCopied ? "Copied" : email}</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className={styles.heroBadge}>
        <p>Fast Execution</p>
        <p>Thoughtful Design</p>
        <p>Reliable Engineering</p>
      </div>
    </section>
  );
}
