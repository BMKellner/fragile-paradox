import { SectionType, type SectionConfigFor } from "@/lib/template-config";

type AboutSectionRendererProps = {
  section: SectionConfigFor<SectionType.About>;
};

export function AboutSectionRenderer({ section }: AboutSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2>{content.title || "About"}</h2>
      {content.summary ? <p>{content.summary}</p> : <p>No summary provided.</p>}
      {content.educationLabel || content.educationDetails ? (
        <p>
          {content.educationLabel}
          {content.educationLabel && content.educationDetails ? ": " : ""}
          {content.educationDetails}
        </p>
      ) : null}
    </>
  );
}
