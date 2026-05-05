import { SectionType, type SectionConfigFor } from "@/lib/template-config-types";
import { textStyleForPath } from "./styleUtils";

type ContactSectionRendererProps = {
  section: SectionConfigFor<SectionType.Contact>;
};

export function ContactSectionRenderer({ section }: ContactSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2 data-edit-path="content.title" style={textStyleForPath(section, "content.title")}>
        {content.title || "Contact"}
      </h2>
      {content.email ? (
        <p data-edit-path="content.email" style={textStyleForPath(section, "content.email")}>
          Email: <a href={`mailto:${content.email}`}>{content.email}</a>
        </p>
      ) : null}
      {content.phone ? (
        <p data-edit-path="content.phone" style={textStyleForPath(section, "content.phone")}>
          Phone: {content.phone}
        </p>
      ) : null}
      {content.address ? (
        <p data-edit-path="content.address" style={textStyleForPath(section, "content.address")}>
          Address: {content.address}
        </p>
      ) : null}
      {content.linkedin ? (
        <p data-edit-path="content.linkedin" style={textStyleForPath(section, "content.linkedin")}>
          LinkedIn: <a href={content.linkedin}>{content.linkedin}</a>
        </p>
      ) : null}
    </>
  );
}
