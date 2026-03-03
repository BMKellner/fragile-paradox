"use client";

import { motion } from "framer-motion";
import styles from "../ClassicProfessional.module.css";

type ContactSectionProps = {
  fullName: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  email: string;
  linkedin: string;
  github: string;
  location: string;
};

type SocialLink = {
  href: string;
  label: string;
  icon: "github" | "linkedin" | "mail";
};

function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
  if (icon === "github") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.71.5.1.66-.22.66-.5v-1.76c-2.78.62-3.37-1.36-3.37-1.36-.45-1.19-1.12-1.5-1.12-1.5-.92-.64.06-.62.06-.62 1 .08 1.54 1.06 1.54 1.06.9 1.58 2.35 1.12 2.92.86.1-.67.35-1.12.64-1.37-2.23-.26-4.57-1.15-4.57-5.13 0-1.13.38-2.05 1.03-2.78-.1-.26-.44-1.32.1-2.75 0 0 .84-.28 2.75 1.06A9.26 9.26 0 0 1 12 7.8c.85 0 1.7.12 2.5.35 1.9-1.34 2.74-1.06 2.74-1.06.54 1.43.2 2.49.1 2.75.65.73 1.03 1.65 1.03 2.78 0 3.99-2.35 4.86-4.58 5.12.36.33.68.95.68 1.91v2.83c0 .28.17.61.68.5A10.23 10.23 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" />
      </svg>
    );
  }

  if (icon === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
        <path d="M6.94 8.5a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm1.54 1.2H5.4V20h3.08V9.7Zm4.9 0H10.3V20h3.08v-5.42c0-1.43.28-2.81 2.02-2.81 1.71 0 1.73 1.6 1.73 2.9V20h3.08v-5.95c0-2.93-.63-5.18-4.05-5.18-1.64 0-2.74.92-3.18 1.8h-.04V9.7Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s6-4.7 6-10a6 6 0 1 0-12 0c0 5.3 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2.4" />
    </svg>
  );
}

export function ContactSection({
  fullName,
  title,
  subtitle,
  ctaLabel,
  email,
  linkedin,
  github,
  location,
}: ContactSectionProps) {
  const socialLinks: SocialLink[] = [
    { href: github, label: "GitHub", icon: "github" as const },
    { href: linkedin, label: "LinkedIn", icon: "linkedin" as const },
    { href: `mailto:${email}`, label: "Email", icon: "mail" as const },
  ].filter((link): link is SocialLink => Boolean(link.href));

  return (
    <section id="contact" className="snap-start scroll-mt-24 px-4 pb-14 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className={`${styles.surface} grid overflow-hidden rounded-[2rem] md:grid-cols-2`}>
          <div className="p-8 sm:p-10 lg:p-12">
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-black tracking-tight text-[var(--terris-foreground)] sm:text-5xl"
            >
              {title || "Get In Touch"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--terris-muted)] sm:text-base"
            >
              {subtitle ||
                "I am currently open to new opportunities. Whether you have a question, want to discuss a project, or just want to say hi, feel free to reach out."}
            </motion.p>

            <motion.a
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: 0.16, duration: 0.5 }}
              href={`mailto:${email}`}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--terris-cta-bg)] px-6 py-3 text-sm font-semibold text-[var(--terris-cta-fg)] transition-colors hover:bg-[var(--terris-cta-hover)]"
            >
              {ctaLabel || "Say Hello"}
            </motion.a>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: 0.22, duration: 0.48 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--terris-border)] text-[var(--terris-muted)] transition-colors hover:border-[var(--terris-primary)] hover:text-[var(--terris-primary)]"
                  aria-label={link.label}
                >
                  <SocialIcon icon={link.icon} />
                </a>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: 0.28, duration: 0.48 }}
              className="mt-9 inline-flex items-center gap-2 text-sm text-[var(--terris-muted)]"
            >
              <PinIcon />
              {location}
            </motion.p>
          </div>

          <div className={`${styles.contactAmbient} relative min-h-[320px] overflow-hidden`}>
            <motion.div
              animate={{ y: [0, 18, 0], x: [0, -8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className={`${styles.contactOrbA} absolute -top-20 right-4 h-56 w-56 rounded-full blur-3xl`}
            />
            <motion.div
              animate={{ y: [0, -14, 0], x: [0, 10, 0] }}
              transition={{ duration: 9.5, repeat: Infinity, ease: "easeInOut" }}
              className={`${styles.contactOrbB} absolute bottom-4 left-6 h-64 w-64 rounded-full blur-3xl`}
            />
            <div className={`${styles.contactOverlay} absolute inset-0`} />
          </div>
        </div>

        <footer className="py-8 text-center text-sm text-[var(--terris-muted)]">
          © 2026 {fullName}. All rights reserved.
        </footer>
      </div>
    </section>
  );
}
