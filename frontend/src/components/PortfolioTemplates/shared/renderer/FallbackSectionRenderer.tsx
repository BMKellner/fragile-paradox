import type { SectionConfig } from "@/lib/template-config-types";
import { textStyleForPath } from "./styleUtils";

type FallbackSectionRendererProps = {
  section: SectionConfig;
};

export function FallbackSectionRenderer({ section }: FallbackSectionRendererProps) {
  const content = section.content as { title?: unknown; subtitle?: unknown };
  const title = typeof content.title === "string" ? content.title : section.type;
  const subtitle = typeof content.subtitle === "string" ? content.subtitle : "";

  return (
    <>
      <h2 data-edit-path="content.title" style={textStyleForPath(section, "content.title")}>
        {title}
      </h2>
      {subtitle ? (
        <p data-edit-path="content.subtitle" style={textStyleForPath(section, "content.subtitle")}>
          {subtitle}
        </p>
      ) : null}
    </>
  );
}
