import Link from "next/link";
import { ArrowUpRight, Quote } from "lucide-react";
import styles from "../ElegantSophisticated.module.css";
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
  education: {
    school: string;
    majors: string[];
    expectedGrad: string;
  };
  projects: NormalizedProject[];
  skills: SkillCategory[];
  experience: NormalizedExperience[];
  blog: BlogPreview;
  testimonials: Testimonial[];
};

export function ContentSections({
  overviewSummary,
  stats,
  education,
  projects,
  skills,
  experience,
  blog,
  testimonials,
}: ContentSectionsProps) {
  return (
    <>
      <section id="about" className={styles.section} data-reveal>
        <header className={styles.sectionHeader}>
          <h2>About</h2>
          <p>A measured approach to product engineering with precision and long-term maintainability.</p>
        </header>

        <div className={styles.aboutGrid}>
          <article className={styles.panel}>
            <p>{overviewSummary}</p>
            {(education.school || education.majors.length || education.expectedGrad) && (
              <div className={styles.educationBox}>
                <h3>{education.school || "Education"}</h3>
                <p>
                  {[...education.majors, education.expectedGrad ? `Expected ${education.expectedGrad}` : ""]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            )}
          </article>

          <div className={styles.statsColumn}>
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
        <header className={styles.sectionHeader}>
          <h2>Projects</h2>
          <p>A curated selection of work where technical quality and business impact aligned.</p>
        </header>

        <div className={styles.projectGrid}>
          {projects.length ? (
            projects.map((project, index) => (
              <article key={`${project.title}-${index}`} className={`${styles.projectCard} ${index === 0 ? styles.projectFeatured : ""}`}>
                <div className={styles.projectHeader}>
                  <h3>{project.title}</h3>
                  <div className={styles.projectLinks}>
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

                <p>{project.description}</p>

                <ul>
                  {project.highlights.map((highlight) => (
                    <li key={`${project.title}-${highlight}`}>{highlight}</li>
                  ))}
                </ul>

                <div className={styles.tagRow}>
                  {project.tags.map((tag) => (
                    <span key={`${project.title}-${tag}`} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <article className={styles.panel}>
              <p>No projects listed yet.</p>
            </article>
          )}
        </div>
      </section>

      <section id="skills" className={styles.section} data-reveal>
        <header className={styles.sectionHeader}>
          <h2>Skills</h2>
          <p>Capabilities arranged by domain to highlight breadth and depth.</p>
        </header>

        <div className={styles.skillsGrid}>
          {skills.map((group) => (
            <article key={group.title} className={styles.skillCard}>
              <h3>{group.title}</h3>
              <div className={styles.tagRow}>
                {group.skills.map((skill) => (
                  <span key={`${group.title}-${skill}`} className={styles.tag}>
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className={styles.section} data-reveal>
        <header className={styles.sectionHeader}>
          <h2>Experience</h2>
          <p>Professional progression with practical outcomes and technical ownership.</p>
        </header>

        <div className={styles.timeline}>
          {experience.length ? (
            experience.map((item, index) => (
              <article key={`${item.company}-${index}`} className={styles.expCard}>
                <div className={styles.expHeader}>
                  <h3>{item.company}</h3>
                  <p>{item.employedDates || "Current"}</p>
                </div>

                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={`${item.company}-${bullet}`}>{bullet}</li>
                  ))}
                </ul>

                <div className={styles.tagRow}>
                  {item.tags.map((tag) => (
                    <span key={`${item.company}-${tag}`} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <article className={styles.panel}>
              <p>No experience listed yet.</p>
            </article>
          )}
        </div>
      </section>

      <section id="blog" className={styles.section} data-reveal>
        <header className={styles.sectionHeader}>
          <h2>Blog</h2>
          <p>Writing about engineering systems, product tradeoffs, and delivery craft.</p>
        </header>

        <article className={styles.blogCard}>
          <div className={styles.metaLine}>
            <span>{blog.date}</span>
            <span>{blog.readingTime}</span>
          </div>
          <h3>{blog.title}</h3>
          <p>{blog.excerpt}</p>
          <div className={styles.tagRow}>
            {blog.tags.map((tag) => (
              <span key={`blog-${tag}`} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section id="testimonials" className={styles.section} data-reveal>
        <header className={styles.sectionHeader}>
          <h2>Testimonials</h2>
          <p>Endorsements from collaborators across engineering and product functions.</p>
        </header>

        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial) => (
            <article key={`${testimonial.author}-${testimonial.company}`} className={styles.testimonialCard}>
              <Quote size={22} className={styles.quoteIcon} />
              <p>{testimonial.quote}</p>
              <h3>{testimonial.author}</h3>
              <p className={styles.metaLine}>
                {testimonial.role} · <span>{testimonial.company}</span>
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
