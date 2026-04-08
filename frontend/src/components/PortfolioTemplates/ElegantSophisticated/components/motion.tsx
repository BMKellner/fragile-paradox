import type { Transition, Variants } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export const motionTokens = {
  duration: {
    fast: 0.24,
    medium: 0.42,
    slow: 0.62,
  },
  ease,
  stagger: 0.09,
  delayChildren: 0.08,
} as const;

const baseTransition: Transition = {
  duration: motionTokens.duration.medium,
  ease: motionTokens.ease,
};

export const pageLoadVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...baseTransition,
      duration: motionTokens.duration.slow,
      when: "beforeChildren",
      staggerChildren: motionTokens.stagger,
      delayChildren: motionTokens.delayChildren,
    },
  },
};

export const sectionRevealVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...baseTransition,
      duration: motionTokens.duration.slow,
      when: "beforeChildren",
      staggerChildren: motionTokens.stagger,
      delayChildren: 0.02,
    },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionTokens.stagger,
      delayChildren: motionTokens.delayChildren,
    },
  },
};

export const revealItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...baseTransition,
      duration: motionTokens.duration.medium,
    },
  },
};

export const cardHover = {
  y: -6,
};

export const cardHoverTransition: Transition = {
  duration: motionTokens.duration.fast,
  ease: motionTokens.ease,
};
