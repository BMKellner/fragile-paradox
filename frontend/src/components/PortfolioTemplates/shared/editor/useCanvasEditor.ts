import { useMemo, useState } from "react";

type UseCanvasEditorOptions = {
  initialSelectedSectionId?: string | null;
};

export function useCanvasEditor(options?: UseCanvasEditorOptions) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    options?.initialSelectedSectionId ?? null
  );
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  const api = useMemo(
    () => ({
      selectedSectionId,
      draggedSectionId,
      setSelectedSectionId,
      setDraggedSectionId,
      clearDrag: () => setDraggedSectionId(null),
    }),
    [draggedSectionId, selectedSectionId]
  );

  return api;
}

