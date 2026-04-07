export type EditorCanvasSectionLayout = {
  sectionId: string;
  order: number;
  x?: number;
  y?: number;
  height?: number;
};

export type EditorCanvasStateV1 = {
  version: 1;
  selectedSectionId: string | null;
  sectionLayouts: EditorCanvasSectionLayout[];
};

export const DEFAULT_EDITOR_CANVAS: EditorCanvasStateV1 = {
  version: 1,
  selectedSectionId: null,
  sectionLayouts: [],
};

export function deserializeEditorCanvas(value: string | null): EditorCanvasStateV1 | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<EditorCanvasStateV1>;
    if (parsed.version !== 1 || !Array.isArray(parsed.sectionLayouts)) return null;
    return {
      version: 1,
      selectedSectionId:
        typeof parsed.selectedSectionId === "string" ? parsed.selectedSectionId : null,
      sectionLayouts: parsed.sectionLayouts
        .filter((layout) => layout && typeof layout.sectionId === "string")
        .map((layout, index) => ({
          sectionId: layout.sectionId as string,
          order:
            typeof layout.order === "number" && Number.isFinite(layout.order)
              ? layout.order
              : index,
          x:
            typeof layout.x === "number" && Number.isFinite(layout.x)
              ? layout.x
              : undefined,
          y:
            typeof layout.y === "number" && Number.isFinite(layout.y)
              ? layout.y
              : undefined,
          height:
            typeof layout.height === "number" && Number.isFinite(layout.height) && layout.height > 0
              ? layout.height
              : undefined,
        })),
    };
  } catch {
    return null;
  }
}

export function serializeEditorCanvas(value: EditorCanvasStateV1): string {
  return JSON.stringify(value);
}

export function normalizeEditorCanvas(
  input: EditorCanvasStateV1 | null | undefined,
  sectionIds: string[]
): EditorCanvasStateV1 {
  const base = input ?? DEFAULT_EDITOR_CANVAS;
  const existing = new Map(base.sectionLayouts.map((layout) => [layout.sectionId, layout]));
  return {
    version: 1,
    selectedSectionId:
      base.selectedSectionId && sectionIds.includes(base.selectedSectionId)
        ? base.selectedSectionId
        : null,
    sectionLayouts: sectionIds.map((sectionId, index) => {
      const prev = existing.get(sectionId);
      return {
        sectionId,
        order: prev?.order ?? index,
        ...(prev?.height !== undefined ? { height: prev.height } : {}),
        ...(prev?.x !== undefined ? { x: prev.x } : {}),
        ...(prev?.y !== undefined ? { y: prev.y } : {}),
      };
    }),
  };
}

