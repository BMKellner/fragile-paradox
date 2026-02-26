import styles from "../ModernMinimalist.module.css";
import type { BlogPreview } from "../types";

type BlogSectionProps = {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  preview: BlogPreview;
};

export function BlogSection({
  sectionId = "blog",
  title = "Blog",
  subtitle = "Writing focused on engineering process, product tradeoffs, and delivery lessons.",
  ctaLabel = "View all posts",
  preview,
}: BlogSectionProps) {
  return (
    <section id={sectionId} className={`${styles.section} reveal`}>
      <header className={styles.sectionHeaderCentered}>
        <h2>
          {title || "Blog"}
          <span className={styles.titleDot}>.</span>
        </h2>
        <p>{subtitle || "Writing focused on engineering process, product tradeoffs, and delivery lessons."}</p>
      </header>

      <article className={styles.blogCard}>
        <div className={styles.blogMeta}>
          <span>{preview.date}</span>
          <span>{preview.readingTime}</span>
        </div>

        <h3>{preview.title}</h3>
        <p>{preview.excerpt}</p>

        <div className={styles.tagRow}>
          {preview.tags.map((tag) => (
            <span key={tag} className={styles.tagPill}>
              {tag}
            </span>
          ))}
        </div>
      </article>

      <a href="#" className={styles.viewAllLink}>
        {ctaLabel || "View all posts"}
      </a>
    </section>
  );
}
