import { SectionType, type SectionConfigFor } from "@/lib/template-config";

type ProjectsSectionRendererProps = {
  section: SectionConfigFor<SectionType.Projects>;
};

export function ProjectsSectionRenderer({ section }: ProjectsSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2>{content.title || "Projects"}</h2>
      {content.items.length ? (
        content.items.map((item, index) => (
          <div key={`${item.title}-${index}`}>
            <h3>{item.title || "Project"}</h3>
            {item.description ? <p>{item.description}</p> : null}
            {item.highlights.length ? (
              <ul>
                {item.highlights.map((highlight, highlightIndex) => (
                  <li key={`${item.title}-${highlightIndex}`}>{highlight}</li>
                ))}
              </ul>
            ) : null}
            {item.tags.length ? <p>{item.tags.join(", ")}</p> : null}
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
