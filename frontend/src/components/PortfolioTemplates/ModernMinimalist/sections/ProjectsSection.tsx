import Link from "next/link";
import { ArrowUpRight, Code2, Globe } from "lucide-react";
import styles from "../ModernMinimalist.module.css";
import type { NormalizedProject } from "../types";

type ProjectsSectionProps = {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  projects: NormalizedProject[];
};

export function ProjectsSection({
  sectionId = "projects",
  title = "Projects",
  subtitle = "Selected product and engineering work with measurable outcomes.",
  projects,
}: ProjectsSectionProps) {
  return (
    <section id={sectionId} className={`${styles.section} reveal`}>
      <header className={styles.sectionHeaderCentered}>
        <h2>
          {title || "Projects"}
          <span className={styles.titleDot}>.</span>
        </h2>
        <p>{subtitle || "Selected product and engineering work with measurable outcomes."}</p>
      </header>

      {projects.length ? (
        <div className={styles.projectsGrid}>
          {projects.map((project, index) => {
            const featured = index === 0;

            return (
              <article
                key={`${project.title}-${index}`}
                className={`${styles.projectCard} ${featured ? styles.featuredProject : ""}`}
              >
                <div className={styles.projectHeader}>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>

                <div className={styles.projectHighlights}>
                  {project.highlights.map((highlight) => (
                    <div key={highlight} className={styles.highlightItem}>
                      <span className={styles.highlightDot} aria-hidden="true" />
                      <p>{highlight}</p>
                    </div>
                  ))}
                </div>

                <div className={styles.projectFooter}>
                  <div className={styles.tagRow}>
                    {project.tags.map((tag) => (
                      <span key={`${project.title}-${tag}`} className={styles.tagPill}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className={styles.linkRow}>
                    {project.links.demo ? (
                      <Link href={project.links.demo} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                        <Globe size={14} />
                        Demo
                        <ArrowUpRight size={14} />
                      </Link>
                    ) : null}

                    {project.links.code ? (
                      <Link href={project.links.code} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                        <Code2 size={14} />
                        Code
                        <ArrowUpRight size={14} />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <article className={styles.emptyCard}>
          <p>No projects listed yet.</p>
        </article>
      )}
    </section>
  );
}
