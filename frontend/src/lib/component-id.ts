export type JsxSourceMetadata = {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
};

const normalizeToken = (value: string): string =>
  value
    .trim()
    .replace(/\\/g, "/")
    .replace(/[^a-zA-Z0-9/_-]+/g, "-")
    .replace(/\/+/, "/")
    .replace(/^-+|-+$/g, "");

export const buildComponentId = (...parts: Array<string | undefined | null>): string => {
  const tokens = parts
    .map((part) => (typeof part === "string" ? normalizeToken(part) : ""))
    .filter(Boolean);

  return tokens.join("::");
};

export const componentIdFromSource = (
  componentName: string,
  source?: JsxSourceMetadata,
  fallbackScope = "runtime"
): string => {
  if (!source?.fileName) {
    return buildComponentId(fallbackScope, componentName);
  }

  const filePath = source.fileName.split("/src/").pop() || source.fileName;
  return buildComponentId(filePath, componentName, `${source.lineNumber || 0}:${source.columnNumber || 0}`);
};

export const sectionComponentId = (templateId: string, sectionId: string, sectionType: string): string =>
  buildComponentId("template", templateId, "section", sectionId, sectionType);
