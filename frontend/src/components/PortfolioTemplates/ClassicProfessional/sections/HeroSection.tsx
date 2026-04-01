"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import styles from "../ClassicProfessional.module.css";
import { ParticleBackground } from "./ParticleBackground";

type HeroSectionProps = {
  fullName: string;
  careerName: string;
  summary: string;
  scrollTargetId: string;
};

function CatGlyph() {
  const gradientId = useId().replace(/:/g, "");

  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="6" y1="6" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ef4444" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path
        d="M14 16L20 8L28 15L36 8L42 16V33C42 41.8366 35.2843 49 27 49C18.7157 49 12 41.8366 12 33V16H14Z"
        fill={`url(#${gradientId})`}
        fillOpacity="0.2"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
      />
      <circle cx="22" cy="29" r="2" fill={`url(#${gradientId})`} />
      <circle cx="33" cy="29" r="2" fill={`url(#${gradientId})`} />
      <path d="M23 36C25 38 30 38 32 36" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function HeroSection({ fullName, careerName, summary, scrollTargetId }: HeroSectionProps) {
  return (
    <section
      id="hero"
      data-customize-section-type="hero"
      className="relative flex min-h-screen snap-start items-center justify-center overflow-hidden px-6 pb-20 pt-28"
    >
      <ParticleBackground id="classic-professional-hero-particles" className="pointer-events-none absolute inset-0" />

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55 }}
          className="mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--terris-border)] px-4 py-2 text-sm font-medium text-[var(--terris-muted)]"
        >
          <CatGlyph />
          <span>{"「Hi」, my name is"}</span>
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.6 }}
          className="text-balance text-6xl font-black tracking-tight text-[var(--terris-foreground)] sm:text-7xl lg:text-8xl"
        >
          {fullName}
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.55 }}
          className="mt-4 text-balance text-xl font-semibold text-[var(--terris-muted)] sm:text-2xl"
        >
          {careerName}
        </motion.h2>

        {summary ? (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.5 }}
            className="mt-5 max-w-2xl text-balance text-base leading-relaxed text-[var(--terris-muted)] sm:text-lg"
          >
            {summary}
          </motion.p>
        ) : null}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          className="mt-6 inline-flex items-center gap-3 rounded-full border border-[var(--terris-border)]/90 px-3 py-1"
        >
          <span className="text-xs uppercase tracking-[0.24em] text-[var(--terris-muted)]">Typing</span>
          <span
            className={`${styles.cursorBar} inline-block h-6 w-1 rounded-full bg-[var(--terris-primary)]`}
            aria-hidden="true"
          />
        </motion.div>
      </motion.div>

      <a
        href={`#${scrollTargetId}`}
        className="absolute bottom-8 z-10 inline-flex flex-col items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--terris-muted)] transition-colors hover:text-[var(--terris-foreground)]"
      >
        <span>Scroll</span>
        <span className={`${styles.scrollCue} text-[var(--terris-primary)]`} aria-hidden="true">
          ↓
        </span>
      </a>
    </section>
  );
}
