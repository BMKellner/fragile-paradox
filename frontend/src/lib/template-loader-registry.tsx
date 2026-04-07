"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { ParsedResume } from "@/constants/ResumeFormat";
import type { TemplateConfig } from "@/lib/template-config-types";

export type TemplateComponentProps = {
  personalInformation?: ParsedResume["personal_information"];
  overviewData?: ParsedResume["overview"];
  projects?: ParsedResume["projects"];
  experience?: ParsedResume["experience"];
  skills?: ParsedResume["skills"];
  mainColor: string;
  backgroundColor: string;
  templateConfig?: TemplateConfig;
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
