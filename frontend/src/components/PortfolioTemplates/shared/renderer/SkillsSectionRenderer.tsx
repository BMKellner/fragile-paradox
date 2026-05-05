import { SectionType, type SectionConfigFor } from "@/lib/template-config-types";
import { textStyleForPath } from "./styleUtils";

type SkillsSectionRendererProps = {
  section: SectionConfigFor<SectionType.Skills>;
};

export function SkillsSectionRenderer({ section }: SkillsSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2 data-edit-path="content.title" style={textStyleForPath(section, "content.title")}>
        {content.title || "Skills"}
      </h2>
      {content.categories.length ? (
        content.categories.map((category, index) => (
          <div key={category.title}>
            <h3
              data-edit-path={`content.categories[${index}].title`}
              style={textStyleForPath(section, `content.categories[${index}].title`)}
            >
              {category.title}
            </h3>
            <p
              data-edit-path={`content.categories[${index}].skills[0]`}
              style={textStyleForPath(section, `content.categories[${index}].skills[0]`)}
            >
              {category.skills.join(", ")}
            </p>
          </div>
        ))
      ) : (
        <p>No skills listed.</p>
      )}
    </>
  );
}
