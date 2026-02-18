import { Quote } from "lucide-react";
import styles from "../ModernMinimalist.module.css";
import type { Testimonial } from "../types";

type TestimonialsSectionProps = {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  testimonials: Testimonial[];
};

export function TestimonialsSection({
  sectionId = "testimonials",
  title = "Testimonials",
  subtitle = "Feedback from collaborators across product, engineering, and leadership teams.",
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <section id={sectionId} className={`${styles.section} reveal`}>
      <header className={styles.sectionHeaderCentered}>
        <h2>
          {title || "Testimonials"}
          <span className={styles.titleDot}>.</span>
        </h2>
        <p>{subtitle || "Feedback from collaborators across product, engineering, and leadership teams."}</p>
      </header>

      <div className={styles.testimonialsGrid}>
        {testimonials.map((item) => (
          <article
            key={`${item.author}-${item.company}`}
            className={`${styles.testimonialCard} ${item.wide ? styles.wideTestimonial : ""}`}
          >
            <Quote size={30} className={styles.quoteIcon} />
            <p className={styles.testimonialQuote}>{item.quote}</p>

            <div className={styles.testimonialAuthor}>
              <div className={styles.avatarMini} aria-hidden="true">
                {item.author.slice(0, 1)}
              </div>
              <div>
                <h3>{item.author}</h3>
                <p>
                  {item.role} · <span>{item.company}</span>
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
