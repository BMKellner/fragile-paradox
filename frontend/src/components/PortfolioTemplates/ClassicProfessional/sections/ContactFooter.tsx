import Link from "next/link";
import { Linkedin, Mail, MapPin, Phone } from "lucide-react";
import styles from "../ClassicProfessional.module.css";

type ContactFooterProps = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
};

export function ContactFooter({ fullName, email, phone, address, linkedin }: ContactFooterProps) {
  return (
    <>
      <section id="contact" className={styles.section} data-reveal>
        <div className={styles.sectionHeader}>
          <h2>Contact</h2>
          <p>Available for engineering collaborations, consulting, and leadership engagements.</p>
        </div>

        <article className={styles.contactCard}>
          <div className={styles.contactRow}>
            {email ? (
              <a href={`mailto:${email}`} className={styles.contactItem}>
                <Mail size={15} />
                {email}
              </a>
            ) : null}

            {phone ? (
              <a href={`tel:${phone}`} className={styles.contactItem}>
                <Phone size={15} />
                {phone}
              </a>
            ) : null}

            {address ? (
              <div className={styles.contactItem}>
                <MapPin size={15} />
                {address}
              </div>
            ) : null}

            {linkedin ? (
              <Link href={linkedin} target="_blank" rel="noreferrer" className={styles.contactItem}>
                <Linkedin size={15} />
                LinkedIn
              </Link>
            ) : null}
          </div>

          <a href={`mailto:${email || "hello@example.com"}`} className={styles.ctaButtonLarge} aria-label="Send me an email">
            Send me an email
          </a>
        </article>
      </section>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} {fullName}. All rights reserved.</p>
      </footer>
    </>
  );
}
