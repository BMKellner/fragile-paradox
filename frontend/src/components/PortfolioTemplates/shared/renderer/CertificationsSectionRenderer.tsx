import { SectionType, type SectionConfigFor } from "@/lib/template-config-types";

type CertificationsSectionRendererProps = {
  section: SectionConfigFor<SectionType.Certifications>;
};

export function CertificationsSectionRenderer({ section }: CertificationsSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2>{content.title || "Certifications"}</h2>
      {content.entries.length ? (
        content.entries.map((entry, index) => (
          <div key={`${entry.name}-${index}`}>
            <h3>{entry.name || "Certification"}</h3>
            {entry.issuer ? <p>Issuer: {entry.issuer}</p> : null}
            {entry.year ? <p>Year: {entry.year}</p> : null}
          </div>
        ))
      ) : (
        <p>No certifications listed.</p>
      )}
    </>
  );
}
