import { SectionType, type SectionConfigFor } from "@/lib/template-config-types";
import { textStyleForPath } from "./styleUtils";

type ExperienceSectionRendererProps = {
  section: SectionConfigFor<SectionType.Experience>;
};

export function ExperienceSectionRenderer({ section }: ExperienceSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2 data-edit-path="content.title" style={textStyleForPath(section, "content.title")}>
        {content.title || "Experience"}
      </h2>
      {content.items.length ? (
        content.items.map((item, index) => (
          <div key={`${item.company}-${index}`}>
            <h3
              data-edit-path={`content.items[${index}].company`}
              style={textStyleForPath(section, `content.items[${index}].company`)}
            >
              {item.company || "Role"}
            </h3>
            {item.employedDates ? (
              <p
                data-edit-path={`content.items[${index}].employedDates`}
                style={textStyleForPath(section, `content.items[${index}].employedDates`)}
              >
                {item.employedDates}
              </p>
            ) : null}
            {item.bullets.length ? (
              <ul>
                {item.bullets.map((bullet, bulletIndex) => (
                  <li
                    key={`${item.company}-${bulletIndex}`}
                    data-edit-path={`content.items[${index}].bullets[${bulletIndex}]`}
                    style={textStyleForPath(section, `content.items[${index}].bullets[${bulletIndex}]`)}
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No details provided.</p>
            )}
          </div>
        ))
      ) : (
        <p>No experience listed.</p>
      )}
    </>
  );
}
