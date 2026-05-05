"use client";

import { motion } from "framer-motion";
import type { ProjectItem } from "@/lib/template-config";
import { cn } from "@/lib/utils";
import styles from "../ElegantSophisticated.module.css";
import { Card, Pill } from "../components/cards";
import { revealItemVariants } from "../components/motion";

type ProjectsSectionProps = {
  projects: ProjectItem[];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (!projects.length) {
    return (
      <motion.div variants={revealItemVariants}>
        <Card>
          <p className={styles.mutedText}>No projects yet. Add projects from your data source or in Customize.</p>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className={styles.projectsGrid}>
      {projects.map((project, index) => (
        <motion.div
          key={`${project.title}-${index}`}
          variants={revealItemVariants}
          className={cn(
            projects.length > 1 && projects.length % 2 === 1 && index === projects.length - 1 && styles.projectCardOdd
          )}
        >
          <Card>
            <div className={styles.projectHeader}>
              <h3>{project.title}</h3>
            </div>
            <p className={styles.mutedText}>{project.description}</p>
            {project.highlights.length ? (
              <ul className={styles.bulletList}>
                {project.highlights.map((highlight) => (
                  <li key={`${project.title}-${highlight}`}>{highlight}</li>
                ))}
              </ul>
            ) : null}
            {project.tags.length ? (
              <div className={styles.tagRow}>
                {project.tags.map((tag) => (
                  <Pill key={`${project.title}-${tag}`}>{tag}</Pill>
                ))}
              </div>
            ) : null}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
