"use client";

import { useMemo } from "react";

import type { TemplateProps } from "@/components/PortfolioTemplates/shared/portfolioData";
import { resolveTemplateConfigFromProps } from "@/components/PortfolioTemplates/shared/templateConfigAdapter";

import { BaseTemplateRenderer } from "./BaseTemplateRenderer";

type TemplateShellOptions = {
  templateId: string;
  templateVariant: string;
  navSeparator?: string;
  showNav?: boolean;
};

export function createTemplateShell(options: TemplateShellOptions) {
  const TemplateShell = ({
    personalInformation,
    overviewData,
    projects,
    experience,
    skills,
    mainColor,
    backgroundColor,
    templateConfig,
  }: TemplateProps) => {
    const resolvedConfig = useMemo(
      () =>
        resolveTemplateConfigFromProps({
          templateId: options.templateId,
          templateConfig,
          personalInformation,
          overviewData,
          projects,
          experience,
          skills,
          mainColor,
          backgroundColor,
        }),
      [
        templateConfig,
        personalInformation,
        overviewData,
        projects,
        experience,
        skills,
        mainColor,
        backgroundColor,
      ]
    );

    return (
      <BaseTemplateRenderer
        config={resolvedConfig}
        templateVariant={options.templateVariant}
        navSeparator={options.navSeparator}
        showNav={options.showNav}
      />
    );
  };

  TemplateShell.displayName = `TemplateShell${options.templateId}`;

  return TemplateShell;
}
