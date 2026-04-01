"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "../ElegantSophisticated.module.css";
import { sectionRevealVariants, staggerContainerVariants } from "./motion";

type SectionProps = {
  id: string;
  sectionType?: string;
  title: string;
  subtitle?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

export function Section({
  id,
  sectionType,
  title,
  subtitle,
  className,
  bodyClassName,
  children,
}: SectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.25,
    margin: "0px 0px -14% 0px",
  });

  const headingId = `${id}-heading`;

  return (
    <motion.section
      id={id}
      data-customize-section-type={sectionType}
      ref={ref}
      className={cn(styles.section, className)}
      aria-labelledby={headingId}
      variants={sectionRevealVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <header className={styles.sectionHeader}>
        <h2 id={headingId} className={styles.sectionHeading}>
          {title}
        </h2>
        {subtitle ? <p className={styles.sectionSubtitle}>{subtitle}</p> : null}
      </header>

      <motion.div className={cn(styles.sectionBody, bodyClassName)} variants={staggerContainerVariants}>
        {children}
      </motion.div>
    </motion.section>
  );
}
