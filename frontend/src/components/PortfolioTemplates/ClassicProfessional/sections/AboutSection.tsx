"use client";

import { motion } from "framer-motion";
import styles from "../ClassicProfessional.module.css";
import type { AboutFact, RadialStat } from "../data";

type AboutSectionProps = {
  title: string;
  subtitle: string;
  facts: AboutFact[];
  stats: RadialStat[];
};

function RadialStatCard({ stat }: { stat: RadialStat }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, stat.progress));
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <article
      className={`${styles.surface} ${styles.accentShadow} rounded-2xl p-4 text-center`}
    >
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--terris-border)"
            strokeWidth="8"
            opacity="0.55"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--terris-primary)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="pointer-events-none absolute text-center">
          <p className="text-lg font-bold text-[var(--terris-foreground)]">{stat.value}</p>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-[var(--terris-muted)]">{stat.label}</p>
    </article>
  );
}

export function AboutSection({ title, subtitle, facts, stats }: AboutSectionProps) {
  return (
    <section
      id="about"
      data-customize-section-type="about"
      className="snap-start scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className={`${styles.surface} mx-auto max-w-6xl rounded-[2rem] p-6 sm:p-10 lg:p-12`}>
        <header className="mb-8 text-center">
          <h2 className="text-4xl font-black tracking-tight text-[var(--terris-foreground)] sm:text-5xl">
            {title || "About"}
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-[var(--terris-muted)] sm:text-base">
            {subtitle || "Focused on clean architecture, thoughtful interfaces, and scalable delivery."}
          </p>
        </header>

        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.95fr]">
          <div className="space-y-6">
            {facts.map((fact, index) => (
              <motion.article
                key={fact.id}
                initial={{ opacity: 0, x: 26 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="rounded-2xl border border-[var(--terris-border)]/90 bg-[var(--terris-card)]/55 p-5"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--terris-muted)]">
                  {fact.label}
                </p>
                <div className="flex items-start gap-4">
                  <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[var(--terris-primary)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--terris-primary)]" />
                  </span>
                  <div>
                    <h3 className="text-2xl font-semibold text-[var(--terris-foreground)]">{fact.heading}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--terris-muted)] sm:text-base">{fact.body}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-2">
            {stats.map((stat) => (
              <RadialStatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
