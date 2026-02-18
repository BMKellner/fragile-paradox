import styles from "../ModernMinimalist.module.css";
import type { PortfolioStats } from "../types";

type AboutSectionProps = {
  fullName: string;
  initials: string;
  summary: string;
  stats: PortfolioStats;
  education: {
    school: string;
    majors: string[];
    expectedGrad: string;
  };
};

export function AboutSection({
  fullName,
  initials,
  summary,
  stats,
  education,
}: AboutSectionProps) {
  const statCards = [
    { label: "Experience", value: stats.yearsExperience },
    { label: "Projects", value: stats.projectCount },
    { label: "Specialization", value: stats.specialization },
    { label: "Core Strength", value: stats.impact },
  ];

  return (
    <section id="about" className={`${styles.section} reveal`}>
      <header className={styles.sectionHeader}>
        <h2>
          About<span className={styles.titleDot}>.</span>
        </h2>
        <p>Focused on clean architecture, thoughtful interfaces, and scalable delivery.</p>
      </header>

      <div className={styles.aboutGrid}>
        <div className={styles.imagePanel}>
          <div className={styles.imageGlow} aria-hidden="true" />
          <div className={styles.avatarShell}>
            <span>{initials}</span>
          </div>
          <p className={styles.avatarLabel}>{fullName}</p>

          <div className={styles.imageDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className={styles.aboutContent}>
          <p>{summary}</p>

          {(education.school || education.majors.length > 0 || education.expectedGrad) && (
            <div className={styles.educationLine}>
              <strong>{education.school || "Education"}</strong>
              <span>
                {[...education.majors, education.expectedGrad ? `Expected ${education.expectedGrad}` : ""]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
          )}

          <div className={styles.statsGrid}>
            {statCards.map((item) => (
              <article key={item.label} className={styles.statCard}>
                <p>{item.label}</p>
                <h3>{item.value}</h3>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
