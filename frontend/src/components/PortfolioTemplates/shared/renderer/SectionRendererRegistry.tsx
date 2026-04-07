import { SectionType, type SectionConfig, type SectionConfigFor } from "@/lib/template-config-types";
import type { ReactNode } from "react";

import { AboutSectionRenderer } from "./AboutSectionRenderer";
import { CertificationsSectionRenderer } from "./CertificationsSectionRenderer";
import { ContactSectionRenderer } from "./ContactSectionRenderer";
import { EducationSectionRenderer } from "./EducationSectionRenderer";
import { ExperienceSectionRenderer } from "./ExperienceSectionRenderer";
import { FallbackSectionRenderer } from "./FallbackSectionRenderer";
import { HeroSectionRenderer } from "./HeroSectionRenderer";
import { ProjectsSectionRenderer } from "./ProjectsSectionRenderer";
import { SkillsSectionRenderer } from "./SkillsSectionRenderer";

type RegistryRenderer = (section: SectionConfig) => ReactNode;

const registry: Partial<Record<SectionType, RegistryRenderer>> = {
  [SectionType.Hero]: (section) => (
    <HeroSectionRenderer section={section as SectionConfigFor<SectionType.Hero>} />
  ),
  [SectionType.About]: (section) => (
    <AboutSectionRenderer section={section as SectionConfigFor<SectionType.About>} />
  ),
  [SectionType.Experience]: (section) => (
    <ExperienceSectionRenderer section={section as SectionConfigFor<SectionType.Experience>} />
  ),
  [SectionType.Skills]: (section) => (
    <SkillsSectionRenderer section={section as SectionConfigFor<SectionType.Skills>} />
  ),
  [SectionType.Projects]: (section) => (
    <ProjectsSectionRenderer section={section as SectionConfigFor<SectionType.Projects>} />
  ),
  [SectionType.Contact]: (section) => (
    <ContactSectionRenderer section={section as SectionConfigFor<SectionType.Contact>} />
  ),
  [SectionType.Education]: (section) => (
    <EducationSectionRenderer section={section as SectionConfigFor<SectionType.Education>} />
  ),
  [SectionType.Certifications]: (section) => (
    <CertificationsSectionRenderer section={section as SectionConfigFor<SectionType.Certifications>} />
  ),
};

export function renderSectionContent(section: SectionConfig): ReactNode {
  const renderer = registry[section.type];
  if (!renderer) {
    return <FallbackSectionRenderer section={section} />;
  }

  return renderer(section);
}
