import { SectionType, type SectionConfigFor } from "@/lib/template-config-types";

type ContactSectionRendererProps = {
  section: SectionConfigFor<SectionType.Contact>;
};

export function ContactSectionRenderer({ section }: ContactSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2>{content.title || "Contact"}</h2>
      {content.email ? (
        <p>
          Email: <a href={`mailto:${content.email}`}>{content.email}</a>
        </p>
      ) : null}
      {content.phone ? <p>Phone: {content.phone}</p> : null}
      {content.address ? <p>Address: {content.address}</p> : null}
      {content.linkedin ? (
        <p>
          LinkedIn: <a href={content.linkedin}>{content.linkedin}</a>
        </p>
      ) : null}
    </>
  );
}
