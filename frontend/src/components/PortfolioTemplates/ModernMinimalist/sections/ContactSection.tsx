import Link from "next/link";
import { Mail, MapPin, Phone, Linkedin } from "lucide-react";
import styles from "../ModernMinimalist.module.css";

type ContactSectionProps = {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
};

export function ContactSection({
  sectionId = "contact",
  title = "Contact",
  subtitle = "Interested in working together? Let's build something meaningful.",
  ctaLabel = "Send me an email",
  email,
  phone,
  address,
  linkedin,
}: ContactSectionProps) {
  return (
    <section id={sectionId} className={`${styles.section} ${styles.contactSection} reveal`}>
      <header className={styles.sectionHeaderCentered}>
        <h2>
          {title || "Contact"}
          <span className={styles.titleDot}>.</span>
        </h2>
        <p>{subtitle || "Interested in working together? Let's build something meaningful."}</p>
      </header>

      <div className={styles.contactList}>
        {email ? (
          <a href={`mailto:${email}`} className={styles.contactItem}>
            <Mail size={16} />
            <span>{email}</span>
          </a>
        ) : null}

        {phone ? (
          <a href={`tel:${phone}`} className={styles.contactItem}>
            <Phone size={16} />
            <span>{phone}</span>
          </a>
        ) : null}

        {address ? (
          <div className={styles.contactItem}>
            <MapPin size={16} />
            <span>{address}</span>
          </div>
        ) : null}
      </div>

      <div className={styles.socialRow}>
        {linkedin ? (
          <Link href={linkedin} target="_blank" rel="noreferrer" className={styles.socialButton} aria-label="LinkedIn">
            <Linkedin size={16} />
            LinkedIn
          </Link>
        ) : null}
      </div>

      <a
        href={`mailto:${email || "hello@example.com"}`}
        className={styles.primaryButton}
        aria-label="Send me an email"
      >
        {ctaLabel || "Send me an email"}
      </a>
    </section>
  );
}
