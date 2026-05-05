import type { CSSProperties } from "react";

import type { EditableStyle, SectionConfig } from "@/lib/template-config-types";

export const textStyleForPath = (section: SectionConfig, path: string): CSSProperties | undefined => {
  const props = section.props;
  if (!props || typeof props !== "object") return undefined;

  const textStyles = (props as Record<string, unknown>).__textStyles;
  if (!textStyles || typeof textStyles !== "object") return undefined;

  const style = (textStyles as Record<string, EditableStyle | undefined>)[path];
  if (!style || typeof style !== "object") return undefined;

  return style as CSSProperties;
};
