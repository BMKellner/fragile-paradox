"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { ParsedResume } from "@/constants/ResumeFormat";
import type { TemplateConfig } from "@/lib/template-config";
import type { CanvasEditorBindings } from "@/components/PortfolioTemplates/shared/editor/types";

export type TemplateComponentProps = {
  personalInformation?: ParsedResume["personal_information"];
  overviewData?: ParsedResume["overview"];
  projects?: ParsedResume["projects"];
  experience?: ParsedResume["experience"];
  skills?: ParsedResume["skills"];
  mainColor: string;
  backgroundColor: string;
  templateConfig?: TemplateConfig;
  canvasEditor?: CanvasEditorBindings;
};

export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  bestFor: Array<"Tech" | "Creative" | "Corporate" | "Academic" | "Writer" | "Creator">;
};

const templateLoadFallback = () => (
  <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-sm text-muted-foreground">
    Loading template preview...
  </div>
);

export const loadModernMinimalistTemplate = () => import("@/components/PortfolioTemplates/ModernMinimalist");
export const loadClassicProfessionalTemplate = () => import("@/components/PortfolioTemplates/ClassicProfessional");
export const loadCreativeBoldTemplate = () => import("@/components/PortfolioTemplates/CreativeBold");
export const loadElegantSophisticatedTemplate = () => import("@/components/PortfolioTemplates/ElegantSophisticated");
export const loadSideRailProTemplate = () => import("@/components/PortfolioTemplates/SideRailPro");
export const loadEditorialStoryTemplate = () => import("@/components/PortfolioTemplates/EditorialStory");
export const loadIDECleanTemplate = () => import("@/components/PortfolioTemplates/IDEClean");
export const loadDebugTemplate = () => import("@/components/PortfolioTemplates/DebugTemplate");
export const loadBoldBrandTemplate = () => import("@/components/PortfolioTemplates/BoldBrand");
export const loadMinimalCreatorHubTemplate = () => import("@/components/PortfolioTemplates/MinimalCreatorHub");

export const templateLoaderMap: Record<string, () => Promise<unknown>> = {
  "1": loadModernMinimalistTemplate,
  "2": loadClassicProfessionalTemplate,
  "3": loadCreativeBoldTemplate,
  "4": loadElegantSophisticatedTemplate,
  "5": loadSideRailProTemplate,
  "6": loadEditorialStoryTemplate,
  "7": loadIDECleanTemplate,
  "8": loadDebugTemplate,
  "9": loadBoldBrandTemplate,
  "10": loadMinimalCreatorHubTemplate,
};

export const templateComponentMap: Record<string, ComponentType<TemplateComponentProps>> = {
  "1": dynamic<TemplateComponentProps>(loadModernMinimalistTemplate, {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "2": dynamic<TemplateComponentProps>(loadClassicProfessionalTemplate, {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "3": dynamic<TemplateComponentProps>(loadCreativeBoldTemplate, {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "4": dynamic<TemplateComponentProps>(loadElegantSophisticatedTemplate, {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "5": dynamic<TemplateComponentProps>(loadSideRailProTemplate, {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "6": dynamic<TemplateComponentProps>(loadEditorialStoryTemplate, {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "7": dynamic<TemplateComponentProps>(loadIDECleanTemplate, {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "8": dynamic<TemplateComponentProps>(loadDebugTemplate, {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "9": dynamic<TemplateComponentProps>(loadBoldBrandTemplate, {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "10": dynamic<TemplateComponentProps>(loadMinimalCreatorHubTemplate, {
    ssr: false,
    loading: templateLoadFallback,
  }),
};

export const templateNames: Record<string, string> = {
  "1": "Modern Minimal",
  "2": "Classic Professional",
  "3": "Creative Bold",
  "4": "Elegant Sophisticated",
  "5": "SideRail Pro",
  "6": "Editorial Story",
  "7": "IDE Clean",
  "8": "debug-template",
  "9": "Bold Brand",
  "10": "Minimal Creator Hub",
  custom: "Custom Template",
};

export const galleryTemplates: TemplateMeta[] = [
  {
    id: "1",
    name: "Modern Minimal",
    description: "Sharp modern layout with confident spacing and clean hierarchy.",
    bestFor: ["Tech", "Corporate"],
  },
  {
    id: "5",
    name: "SideRail Pro",
    description: "Alternating chapter runway with geometric cards and blueprint-style depth.",
    bestFor: ["Tech", "Corporate"],
  },
  {
    id: "6",
    name: "Editorial Story",
    description: "Writing-first case-study format with generous margins and pace.",
    bestFor: ["Writer", "Academic"],
  },
  {
    id: "7",
    name: "IDE Clean",
    description: "Panel-style, tool-native UI language with crisp tags and separators.",
    bestFor: ["Tech", "Creator"],
  },
  {
    id: "8",
    name: "debug-template",
    description: "Debug-focused layout for formatting and structure validation.",
    bestFor: ["Academic", "Corporate"],
  },
  {
    id: "9",
    name: "Bold Brand",
    description: "Oversized hero and high-impact project cards for standout positioning.",
    bestFor: ["Creative", "Creator"],
  },
  {
    id: "10",
    name: "Minimal Creator Hub",
    description: "Dense, tag-forward profile built for creators shipping continuously.",
    bestFor: ["Creator", "Tech"],
  },
];
