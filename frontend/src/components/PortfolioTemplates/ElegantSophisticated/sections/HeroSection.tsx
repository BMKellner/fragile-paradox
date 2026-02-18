import { Check, Copy, Mail } from "lucide-react";
import styles from "../ElegantSophisticated.module.css";

type HeroSectionProps = {
  initials: string;
  fullName: string;
  careerName: string;
  summary: string;
  email: string;
  onCopyEmail: () => void;
  emailCopied: boolean;
};

export function HeroSection({
  initials,
  fullName,
  careerName,
  summary,
  email,
  onCopyEmail,
  emailCopied,
}: HeroSectionProps) {
  return (
    <section id="home" className={styles.hero} data-reveal>
      <div className={styles.mono}>{initials}</div>

      <p className={styles.kicker}>Portfolio</p>
      <h1>{fullName}</h1>
      <p className={styles.role}>{careerName || "Engineering Professional"}</p>
      <p className={styles.summary}>{summary}</p>

      <div className={styles.heroActions}>
        <a href={`mailto:${email || "hello@example.com"}`} className={styles.primaryButton}>
          <Mail size={15} />
          Send Message
        </a>
        {email ? (
          <button type="button" className={styles.secondaryButton} onClick={onCopyEmail} aria-label="Copy email address">
            {emailCopied ? <Check size={15} /> : <Copy size={15} />}
            <span>{emailCopied ? "Copied" : email}</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
