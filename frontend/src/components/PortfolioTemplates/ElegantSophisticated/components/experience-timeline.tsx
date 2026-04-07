"use client";

import { motion } from "framer-motion";
import type { ExperienceItem } from "@/lib/template-config-types";
import styles from "../ElegantSophisticated.module.css";
import { Card } from "./cards";
import { revealItemVariants } from "./motion";

type ExperienceTimelineProps = {
  items: ExperienceItem[];
};

export function ExperienceTimeline({ items }: ExperienceTimelineProps) {
  if (!items.length) {
    return (
      <motion.div variants={revealItemVariants}>
        <Card>
          <p className={styles.mutedText}>Add experience entries to populate this timeline.</p>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className={styles.timeline}>
      {items.map((item, index) => {
        const fallbackBullets = ["Capture role scope, outcomes, and key responsibilities."];

        return (
          <motion.div key={`${item.company}-${index}`} className={styles.timelineItem} variants={revealItemVariants}>
            <span className={styles.timelineDot} aria-hidden="true" />

            <Card className={styles.timelineCard}>
              <div className={styles.itemHeader}>
                <h3>{item.company || "Organization"}</h3>
                <p className={styles.itemMeta}>{item.employedDates || "Dates available on request"}</p>
              </div>

              <ul className={styles.bulletList}>
                {(item.bullets.length ? item.bullets : fallbackBullets).map((bullet) => (
                  <li key={`${item.company}-${bullet}`}>{bullet}</li>
                ))}
              </ul>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
