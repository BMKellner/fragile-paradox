"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { FadeIn, Reveal } from "@/components/home/Reveal";

type HeroSectionProps = {
  primaryHref: string;
  secondaryHref: string;
};

export default function HeroSection({ primaryHref, secondaryHref }: HeroSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="container-base pt-16 pb-14 sm:pt-20 sm:pb-16 relative">
      <div className="home-contour" aria-hidden />

      <FadeIn className="relative z-10 text-center max-w-4xl mx-auto">
        <p className="inline-flex items-center gap-2 rounded-full border border-[var(--home-border)] bg-[var(--home-surface)] px-4 py-1.5 text-sm text-[var(--home-text-soft)]">
          <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
          AI-powered resume to portfolio workflow
        </p>

        <h2 className="text-[2.4rem] sm:text-[3.6rem] lg:text-[4.5rem] leading-[0.95] font-semibold mt-6 text-[var(--home-text)]">
          Turn your resume into
          <span className="gradient-text block">a premium portfolio experience.</span>
        </h2>

        <p className="text-lg sm:text-xl text-[var(--home-text-soft)] mt-6 leading-relaxed max-w-3xl mx-auto">
          Foliage extracts your experience with AI, then lets you shape a polished, shareable website with templates, customization, and live preview in one place.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Button asChild size="lg" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)]">
            <Link href={primaryHref}>
              Start Building
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="border-[var(--home-border)] text-[var(--home-text)] hover:bg-[var(--home-surface-soft)]">
            <Link href={secondaryHref}>Explore Templates</Link>
          </Button>
        </div>
      </FadeIn>

      <Reveal className="relative z-10 mt-12 max-w-5xl mx-auto" delay={0.1}>
        <motion.div
          className="home-mock-wrap"
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -8, 0],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <div className="home-mock-topbar">
            <span className="home-mock-dot" />
            <span className="home-mock-dot" />
            <span className="home-mock-dot" />
            <p className="ml-3 text-xs text-[var(--home-text-soft)]">Portfolio Editor</p>
          </div>

          <div className="home-mock-body">
            <div className="home-mock-side">
              <div className="home-mock-pill" />
              <div className="home-mock-pill" />
              <div className="home-mock-pill" />
            </div>

            <div className="home-mock-main">
              <div className="home-mock-title" />
              <div className="home-mock-line" />
              <div className="home-mock-line short" />

              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <div className="home-mock-card">
                  <div className="home-mock-subtitle" />
                  <div className="home-mock-line" />
                </div>
                <div className="home-mock-card">
                  <div className="home-mock-subtitle" />
                  <div className="home-mock-line" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Reveal>
    </section>
  );
}
