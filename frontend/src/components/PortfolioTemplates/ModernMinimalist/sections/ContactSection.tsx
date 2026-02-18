import Link from "next/link";
import { Mail, MapPin, Phone, Linkedin } from "lucide-react";
import styles from "../ModernMinimalist.module.css";

type ContactSectionProps = {
  email: string;
  phone: string;
  address: string;
  linkedin: string;
};

export function ContactSection({ email, phone, address, linkedin }: ContactSectionProps) {
  return (
    <section id="contact" className={`${styles.section} ${styles.contactSection} reveal`}>
      <header className={styles.sectionHeaderCentered}>
        <h2>
          Contact<span className={styles.titleDot}>.</span>
        </h2>
        <p>Interested in working together? Let&apos;s build something meaningful.</p>
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
        Send me an email
      </a>
    </section>
  );
}
