"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import styles from "../ClassicProfessional.module.css";
import type { ProjectItem } from "@/lib/template-config-types";

type ProjectsPlaceholderSectionProps = {
  title: string;
  subtitle: string;
  items: ProjectItem[];
};

export function ProjectsPlaceholderSection({ title, subtitle, items }: ProjectsPlaceholderSectionProps) {
  return (
    <section
      id="projects"
      data-customize-section-type="projects"
      className="snap-start scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <h2 className="text-4xl font-black tracking-tight text-[var(--terris-foreground)] sm:text-5xl">{title}</h2>
          <p className="mt-3 text-sm text-[var(--terris-muted)] sm:text-base">{subtitle}</p>
        </header>

        {items.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((project, index) => (
              <motion.article
                key={`${project.title}-${index}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className={`${styles.surface} rounded-2xl p-5`}
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold text-[var(--terris-foreground)]">{project.title}</h3>
                  <div className="flex items-center gap-2 text-xs">
                    {project.links.demo ? (
                      <Link
                        href={project.links.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[var(--terris-border)] px-2 py-1 text-[var(--terris-muted)] hover:border-[var(--terris-primary)] hover:text-[var(--terris-primary)]"
                      >
                        Demo
                      </Link>
                    ) : null}
                    {project.links.code ? (
                      <Link
                        href={project.links.code}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[var(--terris-border)] px-2 py-1 text-[var(--terris-muted)] hover:border-[var(--terris-primary)] hover:text-[var(--terris-primary)]"
                      >
                        Code
                      </Link>
                    ) : null}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-[var(--terris-muted)]">{project.description}</p>

                {project.highlights.length ? (
                  <ul className="mt-4 space-y-2">
                    {project.highlights.map((highlight) => (
                      <li key={`${project.title}-${highlight}`} className="flex items-start gap-2 text-sm text-[var(--terris-muted)]">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--terris-primary)]" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {project.tags.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={`${project.title}-${tag}`}
                        className="rounded-full border border-[var(--terris-border)] px-2.5 py-1 text-xs text-[var(--terris-muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </motion.article>
            ))}
          </div>
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            className={`${styles.surface} mx-auto max-w-3xl rounded-3xl p-8 text-center sm:p-10`}
          >
            <p className="text-base leading-relaxed text-[var(--terris-muted)] sm:text-lg">
              No projects found yet. Add projects in Customize or include them in your resume data.
            </p>
          </motion.article>
        )}
      </div>
    </section>
  );
}
