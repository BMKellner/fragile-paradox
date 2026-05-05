import { SectionType, type SectionConfigFor } from "@/lib/template-config-types";
import { textStyleForPath } from "./styleUtils";

type ProjectsSectionRendererProps = {
  section: SectionConfigFor<SectionType.Projects>;
};

export function ProjectsSectionRenderer({ section }: ProjectsSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2 data-edit-path="content.title" style={textStyleForPath(section, "content.title")}>
        {content.title || "Projects"}
      </h2>
      {content.items.length ? (
        content.items.map((item, index) => (
          <div key={`${item.title}-${index}`}>
            <h3
              data-edit-path={`content.items[${index}].title`}
              style={textStyleForPath(section, `content.items[${index}].title`)}
            >
              {item.title || "Project"}
            </h3>
            {item.description ? (
              <p
                data-edit-path={`content.items[${index}].description`}
                style={textStyleForPath(section, `content.items[${index}].description`)}
              >
                {item.description}
              </p>
            ) : null}
            {item.highlights.length ? (
              <ul>
                {item.highlights.map((highlight, highlightIndex) => (
                  <li
                    key={`${item.title}-${highlightIndex}`}
                    data-edit-path={`content.items[${index}].highlights[${highlightIndex}]`}
                    style={textStyleForPath(section, `content.items[${index}].highlights[${highlightIndex}]`)}
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            ) : null}
            {item.tags.length ? (
              <p
                data-edit-path={`content.items[${index}].tags[0]`}
                style={textStyleForPath(section, `content.items[${index}].tags[0]`)}
              >
                {item.tags.join(", ")}
              </p>
            ) : null}
            {item.links.demo ? (
              <p>
                Demo: <a href={item.links.demo}>{item.links.demo}</a>
              </p>
            ) : null}
            {item.links.code ? (
              <p>
                Code: <a href={item.links.code}>{item.links.code}</a>
              </p>
            ) : null}
          </div>
        ))
      ) : (
        <p>No projects listed.</p>
      )}
    </>
  );
}
