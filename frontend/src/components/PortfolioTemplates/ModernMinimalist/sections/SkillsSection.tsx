import { Code, Database, Layers, Wrench } from "lucide-react";
import styles from "../ModernMinimalist.module.css";
import type { SkillCategory } from "../types";

type SkillsSectionProps = {
  categories: SkillCategory[];
};

const categoryIcon: Record<string, typeof Code> = {
  Languages: Code,
  "Frameworks & Libraries": Layers,
  Databases: Database,
  "Tools & Platforms": Wrench,
};

export function SkillsSection({ categories }: SkillsSectionProps) {
  return (
    <section id="skills" className={`${styles.section} reveal`}>
      <header className={styles.sectionHeaderCentered}>
        <h2>
          Skills<span className={styles.titleDot}>.</span>
        </h2>
        <p>Core technologies grouped by discipline for quick scanning.</p>
      </header>

      <div className={styles.skillCategoriesGrid}>
        {categories.map((category) => {
          const Icon = categoryIcon[category.title] ?? Code;

          return (
            <article key={category.title} className={styles.skillCategoryCard}>
              <h3>
                <Icon size={16} />
                {category.title}
              </h3>

              {category.skills.length ? (
                <div className={styles.skillGrid}>
                  {category.skills.map((skill) => (
                    <div key={`${category.title}-${skill}`} className={styles.skillTile}>
                      <span className={styles.skillGlyph} aria-hidden="true">
                        {skill.slice(0, 1).toUpperCase()}
                      </span>
                      <p>{skill}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.categoryEmpty}>No skills listed.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
