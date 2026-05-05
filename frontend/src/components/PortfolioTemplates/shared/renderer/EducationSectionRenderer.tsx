import { SectionType, type SectionConfigFor } from "@/lib/template-config-types";
import { textStyleForPath } from "./styleUtils";

type EducationSectionRendererProps = {
  section: SectionConfigFor<SectionType.Education>;
};

export function EducationSectionRenderer({ section }: EducationSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2 data-edit-path="content.title" style={textStyleForPath(section, "content.title")}>
        {content.title || "Education"}
      </h2>
      {content.entries.length ? (
        content.entries.map((entry, index) => (
          <div key={`${entry.school}-${index}`}>
            <h3
              data-edit-path={`content.entries[${index}].school`}
              style={textStyleForPath(section, `content.entries[${index}].school`)}
            >
              {entry.school || "School"}
            </h3>
            {entry.majors.length ? (
              <p
                data-edit-path={`content.entries[${index}].majors[0]`}
                style={textStyleForPath(section, `content.entries[${index}].majors[0]`)}
              >
                Major: {entry.majors.join(", ")}
              </p>
            ) : null}
            {entry.minors.length ? (
              <p
                data-edit-path={`content.entries[${index}].minors[0]`}
                style={textStyleForPath(section, `content.entries[${index}].minors[0]`)}
              >
                Minor: {entry.minors.join(", ")}
              </p>
            ) : null}
            {entry.expectedGrad ? (
              <p
                data-edit-path={`content.entries[${index}].expectedGrad`}
                style={textStyleForPath(section, `content.entries[${index}].expectedGrad`)}
              >
                Expected Graduation: {entry.expectedGrad}
              </p>
            ) : null}
          </div>
        ))
      ) : (
        <p>No education listed.</p>
      )}
    </>
  );
}
