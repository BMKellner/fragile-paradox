"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "../ElegantSophisticated.module.css";
import { cardHover, cardHoverTransition, revealItemVariants } from "./motion";

type CardProps = HTMLMotionProps<"article"> & {
  children: ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <motion.article
      className={cn(styles.card, className)}
      variants={revealItemVariants}
      whileHover={cardHover}
      transition={cardHoverTransition}
      {...props}
    >
      {children}
    </motion.article>
  );
}

type PillProps = {
  children: ReactNode;
  className?: string;
};

export function Pill({ children, className }: PillProps) {
  return <span className={cn(styles.pill, className)}>{children}</span>;
}
