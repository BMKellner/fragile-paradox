import { SectionType, type SectionConfigFor } from "@/lib/template-config-types";
import { textStyleForPath } from "./styleUtils";

type HeroSectionRendererProps = {
  section: SectionConfigFor<SectionType.Hero>;
};

export function HeroSectionRenderer({ section }: HeroSectionRendererProps) {
  const content = section.content;

  return (
    <>
      {content.eyebrow ? (
        <p
          data-hero-intro
          data-edit-path="content.eyebrow"
          style={textStyleForPath(section, "content.eyebrow")}
        >
          {content.eyebrow}
        </p>
      ) : null}
      {content.fullName ? (
        <h1 data-edit-path="content.fullName" style={textStyleForPath(section, "content.fullName")}>
          {content.fullName}
        </h1>
      ) : null}
      {content.careerName ? (
        <p
          data-hero-role
          data-edit-path="content.careerName"
          style={textStyleForPath(section, "content.careerName")}
        >
          {content.careerName}
        </p>
      ) : null}
      {content.summary ? (
        <p
          data-hero-tagline
          data-edit-path="content.summary"
          style={textStyleForPath(section, "content.summary")}
        >
          {content.summary}
        </p>
      ) : null}
    </>
  );
}
