"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Quote, WandSparkles, Palette, Globe, Upload, LayoutTemplate, Rocket } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";

const valueProps = [
  {
    icon: WandSparkles,
    title: "AI Resume Parsing",
    description: "Convert raw resume content into structured sections you can immediately edit.",
  },
  {
    icon: Palette,
    title: "Design-Led Templates",
    description: "Use curated layouts and style controls to keep your brand coherent.",
  },
  {
    icon: Globe,
    title: "Shareable Output",
    description: "Save and publish portfolio versions ready for recruiters and clients.",
  },
];

const testimonials = [
  {
    quote: "Foliage let me move from resume text to a portfolio I was proud to send in one evening.",
    name: "Product Designer",
  },
  {
    quote: "The structure is what sold me. Editing and preview feel connected instead of chaotic.",
    name: "Frontend Engineer",
  },
  {
    quote: "It gave me a design system, not just a generated page. That made the output feel intentional.",
    name: "Growth Marketer",
  },
];

const workflowSteps = [
  {
    icon: Upload,
    title: "Upload",
    description: "Import your resume and parse it into clean, editable sections.",
  },
  {
    icon: LayoutTemplate,
    title: "Shape",
    description: "Apply a template and tune structure, copy, and style controls.",
  },
  {
    icon: Rocket,
    title: "Publish",
    description: "Preview and ship a polished portfolio link ready to share.",
  },
];

type HomeSectionsProps = {
  ctaHref: string;
};

export default function HomeSections({ ctaHref }: HomeSectionsProps) {
  const reduceMotion = useReducedMotion();

  const listContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.12,
      },
    },
  };

  const listItem = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.52 } },
  };

  return (
    <>
      <section className="container-base pb-12">
        <Reveal>
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--home-text-soft)]">Value Props</p>
            <h3 className="text-4xl sm:text-5xl mt-2 text-[var(--home-text)]">Everything you need to ship faster.</h3>
          </div>
        </Reveal>

        <motion.div
          variants={listContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {valueProps.map((item) => (
            <motion.article key={item.title} variants={listItem} className="home-surface-card home-hover-card">
              <div className="h-10 w-10 rounded-md bg-[var(--color-primary)]/18 text-[var(--color-primary)] flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h4 className="text-2xl text-[var(--home-text)]">{item.title}</h4>
              <p className="text-sm text-[var(--home-text-soft)] mt-2 leading-relaxed">{item.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className="container-base py-10">
        <Reveal>
          <div className="home-surface-panel">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--home-text-soft)]">How it works</p>
            <h3 className="text-4xl mt-2 text-[var(--home-text)]">From upload to launch in three steps.</h3>

            <div className="grid md:grid-cols-3 gap-4 mt-7">
              {workflowSteps.map((step, index) => (
                <div className="home-step-card" key={step.title}>
                  <p className="home-step-index">0{index + 1}</p>
                  <step.icon className="w-5 h-5 text-[var(--color-primary)] mb-3" />
                  <p className="text-2xl text-[var(--home-text)]">{step.title}</p>
                  <p className="text-sm text-[var(--home-text-soft)] mt-2 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-base py-10">
        <Reveal>
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-4 items-stretch">
            <div className="home-surface-panel">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--home-text-soft)]">Feature spotlight</p>
              <h3 className="text-4xl mt-2 text-[var(--home-text)]">A connected editor and preview loop.</h3>
              <p className="text-[var(--home-text-soft)] mt-4 leading-relaxed">
                Foliage keeps your data model and visual output synchronized, so edits stay consistent across profile, templates, and exported pages.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-[var(--home-text-soft)]">
                <li>Single source of truth for content blocks</li>
                <li>Template switching without losing structure</li>
                <li>Editable profile + visual preview in one flow</li>
              </ul>
            </div>

            <div className="home-spotlight-mock">
              <div className="home-spotlight-row" />
              <div className="home-spotlight-row" />
              <div className="home-spotlight-row short" />
              <div className="home-spotlight-grid">
                <div className="home-spotlight-box" />
                <div className="home-spotlight-box" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-base py-12">
        <Reveal>
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--home-text-soft)]">Testimonials</p>
            <h3 className="text-4xl sm:text-5xl mt-2 text-[var(--home-text)]">Teams use Foliage to present better.</h3>
          </div>
        </Reveal>

        <motion.div
          variants={listContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {testimonials.map((item) => (
            <motion.article key={item.quote} variants={listItem} className="home-surface-card home-hover-card">
              <Quote className="w-4 h-4 text-[var(--color-primary)] mb-3" />
              <p className="text-sm text-[var(--home-text)] leading-relaxed">{item.quote}</p>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--home-text-soft)] mt-4">{item.name}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className="container-base py-12 pb-20">
        <Reveal>
          <div className="home-cta-band">
            <h3 className="text-4xl sm:text-5xl text-[var(--home-text)] text-center max-w-2xl">Ready to turn your resume into a standout portfolio?</h3>
            <p className="text-[var(--home-text-soft)] text-center mt-3 max-w-xl">
              Start with one upload, refine the story, and publish a page that looks intentionally designed.
            </p>
            <Button asChild size="lg" className="mt-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)]">
              <Link href={ctaHref}>Start Now</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
