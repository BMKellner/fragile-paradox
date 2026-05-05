import { SectionType, type SectionConfigFor } from "@/lib/template-config";

type SkillsSectionRendererProps = {
  section: SectionConfigFor<SectionType.Skills>;
};

export function SkillsSectionRenderer({ section }: SkillsSectionRendererProps) {
  const content = section.content;

  return (
    <>
      <h2>{content.title || "Skills"}</h2>
      {content.categories.length ? (
        content.categories.map((category) => (
          <div key={category.title}>
            <h3>{category.title}</h3>
            <p>{category.skills.join(", ")}</p>
          </div>
        ))
      ) : (
        <p>No skills listed.</p>
      )}
    </>
  );
}
