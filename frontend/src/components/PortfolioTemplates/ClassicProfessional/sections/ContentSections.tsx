import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Code2, Database, Layers, Wrench } from "lucide-react";
import styles from "../ClassicProfessional.module.css";
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

const iconMap: Record<string, typeof Code2> = {
  Languages: Code2,
  "Frameworks & Libraries": Layers,
  Databases: Database,
  "Tools & Platforms": Wrench,
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
        <div className={styles.sectionHeader}>
          <h2>About</h2>
          <p>Reliable engineering with clear communication and delivery discipline.</p>
        </div>

        <div className={styles.aboutGrid}>
          <article className={styles.paperCard}>
            <p className={styles.bodyText}>{overviewSummary}</p>
            {(education.school || education.majors.length || education.expectedGrad) && (
              <div className={styles.educationBox}>
                <h3>{education.school || "Education"}</h3>
                <p>
                  {[...education.majors, education.expectedGrad ? `Expected ${education.expectedGrad}` : ""]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
            )}
          </article>

          <div className={styles.statsGrid}>
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
        <div className={styles.sectionHeader}>
          <h2>Projects</h2>
          <p>Selected implementations with measurable outcomes and technical depth.</p>
        </div>

        <div className={styles.projectList}>
          {projects.length ? (
            projects.map((project, index) => (
              <article key={`${project.title}-${index}`} className={styles.projectCard}>
                <div className={styles.projectTopRow}>
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

                <ul className={styles.highlights}>
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
            <article className={styles.paperCard}>
              <p className={styles.bodyText}>No projects listed yet.</p>
            </article>
          )}
        </div>
      </section>

      <section id="skills" className={styles.section} data-reveal>
        <div className={styles.sectionHeader}>
          <h2>Skills</h2>
          <p>Organized by area of specialization for quick assessment.</p>
        </div>

        <div className={styles.skillsGrid}>
          {skills.map((group) => {
            const Icon = iconMap[group.title] ?? Code2;

            return (
              <article key={group.title} className={styles.skillCard}>
                <h3>
                  <Icon size={15} />
                  {group.title}
                </h3>
                <div className={styles.skillTags}>
                  {group.skills.map((skill) => (
                    <span key={`${group.title}-${skill}`} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="experience" className={styles.section} data-reveal>
        <div className={styles.sectionHeader}>
          <h2>Experience</h2>
          <p>Professional timeline with role impact and stack highlights.</p>
        </div>

        <div className={styles.timeline}>
          {experience.length ? (
            experience.map((item, index) => (
              <article key={`${item.company}-${index}`} className={styles.timelineCard}>
                <div className={styles.timelineHeading}>
                  <h3>
                    <BriefcaseBusiness size={15} />
                    {item.company}
                  </h3>
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
            <article className={styles.paperCard}>
              <p className={styles.bodyText}>No experience listed yet.</p>
            </article>
          )}
        </div>
      </section>

      <section id="blog" className={styles.section} data-reveal>
        <div className={styles.sectionHeader}>
          <h2>Blog</h2>
          <p>Latest writing on architecture, process, and shipping quality software.</p>
        </div>

        <article className={styles.blogCard}>
          <div className={styles.blogMeta}>
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
        <div className={styles.sectionHeader}>
          <h2>Testimonials</h2>
          <p>Professional references from product and engineering partners.</p>
        </div>

        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial) => (
            <article key={`${testimonial.author}-${testimonial.company}`} className={styles.testimonialCard}>
              <p className={styles.quoteMark}>“</p>
              <p className={styles.bodyText}>{testimonial.quote}</p>
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
