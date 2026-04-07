"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, type ComponentType } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { type ParsedResume } from "@/constants/ResumeFormat";
import { normalizeTemplateConfig, type TemplateConfig } from "@/lib/template-config";

type TemplateComponentProps = {
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
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading template…
    </div>
  </div>
);

const templateComponentMap: Record<string, ComponentType<TemplateComponentProps>> = {
  "1": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/ModernMinimalist"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "2": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/ClassicProfessional"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "3": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/CreativeBold"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "4": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/ElegantSophisticated"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "5": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/SideRailPro"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "6": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/EditorialStory"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "7": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/IDEClean"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "9": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/BoldBrand"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
  "10": dynamic<TemplateComponentProps>(() => import("@/components/PortfolioTemplates/MinimalCreatorHub"), {
    ssr: false,
    loading: templateLoadFallback,
  }),
};

const LIGHT_DISPLAY_BG = "#F8FAFC";

const mockResumeForDemo: ParsedResume = {
  resume_pdf: "",
  portfolio_id: "networking-demo",
  personal_information: {
    full_name: "B Automations",
    contact_info: {
      email: "hello@bautomations.dev",
      linkedin: "https://www.linkedin.com",
      phone: "+1 (555) 010-2025",
      address: "Delaware / Remote",
    },
    education: {
      school: "University of Delaware",
      majors: ["Computer Science"],
      minors: ["Business"],
      expected_grad: "2026",
    },
  },
  overview: {
    career_name: "Enterprise Automation & AI",
    resume_summary:
      "We build automation systems that eliminate manual work, surface real-time intelligence, and ship measurable ROI—across finance, engineering, marketing, and tech transfer.",
  },
  projects: [
    {
      title: "Investment Data Aggregation",
      description:
        "Automated Companies House monitoring for 50,000+ UK companies with searchable dashboard + real-time alerts.",
    },
    {
      title: "AI Marketing Campaign Automation",
      description:
        "Generated multi-channel campaigns and personalized outreach using CRM integrations and engagement analytics.",
    },
    {
      title: "Precision Engineering Analysis",
      description:
        "AI-assisted multi-physics analysis for an EUV reticle handling mechanism with sub‑5μm displacement targets.",
    },
  ],
  experience: [
    {
      company: "B Automations",
      description:
        "Delivered real-world automation solutions across multiple industries with measurable outcomes and reliability-first engineering.",
      employed_dates: "2024 - Present",
    },
  ],
  skills: ["Automation", "AI", "Python", "TypeScript", "PostgreSQL", "APIs", "Dashboards"],
};

export default function NetworkingDemoTemplatePage() {
  const params = useParams<{ templateId?: string }>();
  const templateId = typeof params?.templateId === "string" ? params.templateId : "1";
  const SelectedTemplate = templateComponentMap[templateId] ?? templateComponentMap["1"];

  const config = useMemo(
    () =>
      normalizeTemplateConfig({
        templateId: templateId in templateComponentMap ? templateId : "1",
        resumeData: mockResumeForDemo,
        fallbackTheme: {
          primaryColor: "#16A34A",
          mode: "dark",
          backgroundColor: "#111111",
        },
      }),
    [templateId]
  );

  return (
    <div className="min-h-screen">
      <Header currentPage="networking" />

      <main className="container-base py-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/networking">
                <ArrowLeft className="h-4 w-4" />
                Back to Networking
              </Link>
            </Button>
            <Badge variant="secondary">Template #{templateId}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Demo-only rendering with mock data (frontend)
          </div>
        </div>

        <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
          <SelectedTemplate
            personalInformation={mockResumeForDemo.personal_information}
            overviewData={mockResumeForDemo.overview}
            projects={mockResumeForDemo.projects}
            experience={mockResumeForDemo.experience}
            skills={mockResumeForDemo.skills}
            mainColor={config.theme.primaryColor}
            backgroundColor={config.theme.backgroundColor ?? LIGHT_DISPLAY_BG}
            templateConfig={config}
          />
        </div>
      </main>
    </div>
  );
}

