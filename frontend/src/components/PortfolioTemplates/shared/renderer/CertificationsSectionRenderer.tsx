import { SectionType, type SectionConfigFor } from "@/lib/template-config-types";
import { textStyleForPath } from "./styleUtils";

type CertificationsSectionRendererProps = {
  section: SectionConfigFor<SectionType.Certifications>;
};

export function CertificationsSectionRenderer({ section }: CertificationsSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2 data-edit-path="content.title" style={textStyleForPath(section, "content.title")}>
        {content.title || "Certifications"}
      </h2>
      {content.entries.length ? (
        content.entries.map((entry, index) => (
          <div key={`${entry.name}-${index}`}>
            <h3
              data-edit-path={`content.entries[${index}].name`}
              style={textStyleForPath(section, `content.entries[${index}].name`)}
            >
              {entry.name || "Certification"}
            </h3>
            {entry.issuer ? (
              <p
                data-edit-path={`content.entries[${index}].issuer`}
                style={textStyleForPath(section, `content.entries[${index}].issuer`)}
              >
                Issuer: {entry.issuer}
              </p>
            ) : null}
            {entry.year ? (
              <p
                data-edit-path={`content.entries[${index}].year`}
                style={textStyleForPath(section, `content.entries[${index}].year`)}
              >
                Year: {entry.year}
              </p>
            ) : null}
          </div>
        ))
      ) : (
        <p>No certifications listed.</p>
      )}
    </>
  );
}
