import { SectionType, type SectionConfigFor } from "@/lib/template-config-types";

type EducationSectionRendererProps = {
  section: SectionConfigFor<SectionType.Education>;
};

export function EducationSectionRenderer({ section }: EducationSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2>{content.title || "Education"}</h2>
      {content.entries.length ? (
        content.entries.map((entry, index) => (
          <div key={`${entry.school}-${index}`}>
            <h3>{entry.school || "School"}</h3>
            {entry.majors.length ? <p>Major: {entry.majors.join(", ")}</p> : null}
            {entry.minors.length ? <p>Minor: {entry.minors.join(", ")}</p> : null}
            {entry.expectedGrad ? <p>Expected Graduation: {entry.expectedGrad}</p> : null}
          </div>
        ))
      ) : (
        <p>No education listed.</p>
      )}
    </>
  );
}
