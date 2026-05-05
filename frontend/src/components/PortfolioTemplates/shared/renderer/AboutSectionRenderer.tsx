import { SectionType, type SectionConfigFor } from "@/lib/template-config-types";
import { textStyleForPath } from "./styleUtils";

type AboutSectionRendererProps = {
  section: SectionConfigFor<SectionType.About>;
};

export function AboutSectionRenderer({ section }: AboutSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2 data-edit-path="content.title" style={textStyleForPath(section, "content.title")}>
        {content.title || "About"}
      </h2>
      {content.summary ? (
        <p data-edit-path="content.summary" style={textStyleForPath(section, "content.summary")}>
          {content.summary}
        </p>
      ) : (
        <p>No summary provided.</p>
      )}
      {content.educationLabel || content.educationDetails ? (
        <p
          data-edit-path="content.educationDetails"
          style={textStyleForPath(section, "content.educationDetails")}
        >
          {content.educationLabel}
          {content.educationLabel && content.educationDetails ? ": " : ""}
          {content.educationDetails}
        </p>
      ) : null}
    </>
  );
}
