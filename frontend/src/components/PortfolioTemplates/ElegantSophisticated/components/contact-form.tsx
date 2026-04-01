"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import styles from "../ElegantSophisticated.module.css";
import { revealItemVariants } from "./motion";

type ContactFormProps = {
  recipientEmail: string;
  ctaLabel?: string;
  className?: string;
};

export function ContactForm({ recipientEmail, ctaLabel = "Send me an email", className }: ContactFormProps) {
  return (
    <motion.div variants={revealItemVariants} className={cn(styles.formCard, className)}>
      <div className={styles.form}>
        <p className={styles.formHint}>
          Reach out directly at{" "}
          <a href={`mailto:${recipientEmail}`}>{recipientEmail}</a>.
        </p>

        <a href={`mailto:${recipientEmail}`} className={styles.buttonSubmit}>
          {ctaLabel}
        </a>
      </div>
    </motion.div>
  );
}
