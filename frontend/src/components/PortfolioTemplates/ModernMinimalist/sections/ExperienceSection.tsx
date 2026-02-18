import styles from "../ModernMinimalist.module.css";
import type { NormalizedExperience } from "../types";

type ExperienceSectionProps = {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  experience: NormalizedExperience[];
};

export function ExperienceSection({
  sectionId = "experience",
  title = "Experience",
  subtitle = "Career highlights shown as a clean timeline with outcome-focused details.",
  experience,
}: ExperienceSectionProps) {
  return (
    <section id={sectionId} className={`${styles.section} reveal`}>
      <header className={styles.sectionHeader}>
        <h2>
          {title || "Experience"}
          <span className={styles.titleDot}>.</span>
        </h2>
        <p>{subtitle || "Career highlights shown as a clean timeline with outcome-focused details."}</p>
      </header>

      {experience.length ? (
        <div className={styles.timelineWrap}>
          <span className={styles.timelineLine} aria-hidden="true" />

          <div className={styles.timelineItems}>
            {experience.map((item, index) => (
              <article key={`${item.company}-${index}`} className={styles.timelineCard}>
                <span className={styles.timelineMarker} aria-hidden="true" />

                <div className={styles.timelineHeader}>
                  <h3>{item.company}</h3>
                  {item.employedDates ? <p>{item.employedDates}</p> : null}
                </div>

                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={`${item.company}-${bullet}`}>{bullet}</li>
                  ))}
                </ul>

                <div className={styles.tagRow}>
                  {item.tags.map((tag) => (
                    <span key={`${item.company}-${tag}`} className={styles.tagPill}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <article className={styles.emptyCard}>
          <p>No experience listed yet.</p>
        </article>
      )}
    </section>
  );
}
