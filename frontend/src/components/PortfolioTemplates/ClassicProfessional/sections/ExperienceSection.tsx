"use client";

import { motion } from "framer-motion";
import styles from "../ClassicProfessional.module.css";
import type { TimelineExperienceEntry } from "../data";

type ExperienceSectionProps = {
  title: string;
  subtitle: string;
  entries: TimelineExperienceEntry[];
};

export function ExperienceSection({ title, subtitle, entries }: ExperienceSectionProps) {
  return (
    <section
      id="experience"
      data-customize-section-type="experience"
      className="snap-start scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-14 text-center">
          <p className="text-sm italic text-[var(--terris-muted)]">
            {subtitle || `main - ${entries.length} branches merged`}
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-[var(--terris-foreground)] sm:text-5xl">
            {title || "Work Experience"}
          </h2>
        </header>

        <div className="relative">
          <div
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[var(--terris-border)] md:block"
            aria-hidden="true"
          />

          <div className="space-y-10">
            {entries.map((entry, index) => {
              const left = index % 2 === 0;

              return (
                <motion.article
                  key={entry.id}
                  initial={{ opacity: 0, x: left ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="relative grid gap-5 md:grid-cols-2 md:gap-0"
                >
                  <div className={left ? "md:pr-12" : "md:order-2 md:pl-12"}>
                    <p className="mb-2 font-mono text-xs text-[var(--terris-muted)]">commit {entry.commit}</p>

                    <article className={`${styles.surface} rounded-2xl p-5 sm:p-6`}>
                      <h3 className="text-2xl font-semibold text-[var(--terris-foreground)]">{entry.role}</h3>
                      <p className="mt-1 text-sm text-[var(--terris-muted)]">{entry.company}</p>

                      <ul className="mt-4 space-y-2">
                        {entry.bullets.map((bullet) => (
                          <li key={`${entry.id}-${bullet}`} className="flex items-start gap-3 text-sm text-[var(--terris-muted)]">
                            <span
                              className="mt-2 inline-block h-2 w-2 rounded-full bg-[var(--terris-primary)]"
                              aria-hidden="true"
                            />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={`${entry.id}-${tag}`}
                            className="rounded-full border border-[var(--terris-border)] px-3 py-1 text-xs font-medium text-[var(--terris-muted)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </article>
                  </div>

                  <div
                    className={`md:flex md:items-start ${
                      left ? "md:pl-12 md:justify-start" : "md:order-1 md:justify-end md:pr-12"
                    }`}
                  >
                    <p className="text-sm italic text-[var(--terris-muted)]">{entry.range}</p>
                  </div>

                  <span
                    className="absolute left-1/2 top-7 hidden h-3 w-3 -translate-x-1/2 rounded-full border border-[var(--terris-border)] bg-[var(--terris-primary)] md:block"
                    aria-hidden="true"
                  />
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
