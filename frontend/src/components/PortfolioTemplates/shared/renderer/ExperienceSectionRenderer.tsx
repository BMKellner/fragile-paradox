import { SectionType, type SectionConfigFor } from "@/lib/template-config-types";

type ExperienceSectionRendererProps = {
  section: SectionConfigFor<SectionType.Experience>;
};

export function ExperienceSectionRenderer({ section }: ExperienceSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2>{content.title || "Experience"}</h2>
      {content.items.length ? (
        content.items.map((item, index) => (
          <div key={`${item.company}-${index}`}>
            <h3>{item.company || "Role"}</h3>
            {item.employedDates ? <p>{item.employedDates}</p> : null}
            {item.bullets.length ? (
              <ul>
                {item.bullets.map((bullet, bulletIndex) => (
                  <li key={`${item.company}-${bulletIndex}`}>{bullet}</li>
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
