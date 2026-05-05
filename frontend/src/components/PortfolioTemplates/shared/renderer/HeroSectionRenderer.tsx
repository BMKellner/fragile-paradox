import { SectionType, type SectionConfigFor } from "@/lib/template-config";

type HeroSectionRendererProps = {
  section: SectionConfigFor<SectionType.Hero>;
};

export function HeroSectionRenderer({ section }: HeroSectionRendererProps) {
  const content = section.content;

  return (
    <>
      {content.eyebrow ? <p data-hero-intro>{content.eyebrow}</p> : null}
      {content.fullName ? <h1>{content.fullName}</h1> : null}
      {content.careerName ? <p data-hero-role>{content.careerName}</p> : null}
      {content.summary ? <p data-hero-tagline>{content.summary}</p> : null}
    </>
  );
}
