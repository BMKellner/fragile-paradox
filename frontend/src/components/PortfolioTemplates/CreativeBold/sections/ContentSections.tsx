import Link from "next/link";
import { ArrowUpRight, Quote } from "lucide-react";
import styles from "../CreativeBold.module.css";
import type {
  BlogPreview,
  NormalizedExperience,
  NormalizedProject,
  PortfolioStat,
  SkillCategory,
  Testimonial,
} from "@/components/PortfolioTemplates/shared/portfolioData";

type ContentSectionsProps = {
  overviewSummary: string;
  stats: PortfolioStat[];
  projects: NormalizedProject[];
  skills: SkillCategory[];
  experience: NormalizedExperience[];
  blog: BlogPreview;
  testimonials: Testimonial[];
};

export function ContentSections({
  overviewSummary,
  stats,
  projects,
  skills,
  experience,
  blog,
  testimonials,
}: ContentSectionsProps) {
  return (
    <>
      <section id="about" className={styles.section} data-reveal>
        <div className={styles.headingRow}>
          <h2>About</h2>
          <span className={styles.dot} aria-hidden="true" />
        </div>

        <div className={styles.aboutGrid}>
          <article className={styles.glassCard}>
            <p>{overviewSummary}</p>
          </article>

          <div className={styles.statStrip}>
            {stats.map((stat) => (
              <article key={stat.label} className={styles.statCard}>
                <p>{stat.label}</p>
                <h3>{stat.value}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className={styles.section} data-reveal>
        <div className={styles.headingRow}>
          <h2>Projects</h2>
          <span className={styles.dot} aria-hidden="true" />
        </div>

        <div className={styles.projectGrid}>
          {projects.length ? (
            projects.map((project, index) => (
              <article key={`${project.title}-${index}`} className={`${styles.projectCard} ${index === 0 ? styles.featured : ""}`}>
                <h3>{project.title}</h3>
                <p>{project.description}</p>

                <div className={styles.featureGrid}>
                  {project.highlights.map((item) => (
                    <div key={`${project.title}-${item}`} className={styles.featureItem}>
                      {item}
                    </div>
                  ))}
                </div>

                <div className={styles.footerRow}>
                  <div className={styles.tags}>
                    {project.tags.map((tag) => (
                      <span key={`${project.title}-${tag}`} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className={styles.links}>
                    {project.links.demo ? (
                      <Link href={project.links.demo} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                        Demo <ArrowUpRight size={14} />
                      </Link>
                    ) : null}
                    {project.links.code ? (
                      <Link href={project.links.code} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                        Code <ArrowUpRight size={14} />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <article className={styles.glassCard}>
              <p>No projects listed yet.</p>
            </article>
          )}
        </div>
      </section>

      <section id="skills" className={styles.section} data-reveal>
        <div className={styles.headingRow}>
          <h2>Skills</h2>
          <span className={styles.dot} aria-hidden="true" />
        </div>

        <div className={styles.skillBoard}>
          {skills.map((group) => (
            <article key={group.title} className={styles.skillColumn}>
              <h3>{group.title}</h3>
              <div className={styles.skillTiles}>
                {group.skills.map((skill) => (
                  <span key={`${group.title}-${skill}`} className={styles.skillTile}>
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className={styles.section} data-reveal>
        <div className={styles.headingRow}>
          <h2>Experience</h2>
          <span className={styles.dot} aria-hidden="true" />
        </div>

        <div className={styles.timeline}>
          {experience.length ? (
            experience.map((item, index) => (
              <article key={`${item.company}-${index}`} className={styles.expCard}>
                <div className={styles.expHead}>
                  <h3>{item.company}</h3>
                  <p>{item.employedDates || "Current"}</p>
                </div>

                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={`${item.company}-${bullet}`}>{bullet}</li>
                  ))}
                </ul>

                <div className={styles.tags}>
                  {item.tags.map((tag) => (
                    <span key={`${item.company}-${tag}`} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <article className={styles.glassCard}>
              <p>No experience listed yet.</p>
            </article>
          )}
        </div>
      </section>

      <section id="blog" className={styles.section} data-reveal>
        <div className={styles.headingRow}>
          <h2>Blog</h2>
          <span className={styles.dot} aria-hidden="true" />
        </div>

        <article className={styles.blogCard}>
          <div className={styles.blogMeta}>
            <span>{blog.date}</span>
            <span>{blog.readingTime}</span>
          </div>
          <h3>{blog.title}</h3>
          <p>{blog.excerpt}</p>
          <div className={styles.tags}>
            {blog.tags.map((tag) => (
              <span key={`blog-${tag}`} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section id="testimonials" className={styles.section} data-reveal>
        <div className={styles.headingRow}>
          <h2>Testimonials</h2>
          <span className={styles.dot} aria-hidden="true" />
        </div>

        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial, index) => (
            <article
              key={`${testimonial.author}-${testimonial.company}`}
              className={`${styles.testimonialCard} ${index === 0 ? styles.testimonialWide : ""}`}
            >
              <Quote size={24} className={styles.quoteIcon} />
              <p>{testimonial.quote}</p>
              <h3>{testimonial.author}</h3>
              <p className={styles.metaLine}>
                {testimonial.role} • <span>{testimonial.company}</span>
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
