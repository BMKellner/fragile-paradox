import type { SectionConfig } from "@/lib/template-config";

type FallbackSectionRendererProps = {
  section: SectionConfig;
};

export function FallbackSectionRenderer({ section }: FallbackSectionRendererProps) {
  const content = section.content as { title?: unknown; subtitle?: unknown };
  const title = typeof content.title === "string" ? content.title : section.type;
  const subtitle = typeof content.subtitle === "string" ? content.subtitle : "";

  return (
    <>
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </>
  );
}
