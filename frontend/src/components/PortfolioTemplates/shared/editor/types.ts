import type { SectionConfig } from "@/lib/template-config";

export type CanvasEditorField = {
  path: string;
  label: string;
  value: string;
  multiline?: boolean;
};

export type CanvasEditorBindings = {
  enabled: boolean;
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  onReorderSections: (draggedSectionId: string, targetSectionId: string) => void;
  onUpdateField: (sectionId: string, fieldPath: string, value: string) => void;
  getEditableFields: (section: SectionConfig) => CanvasEditorField[];
  onResizeSection?: (sectionId: string, height: number) => void;
  getSectionHeight?: (sectionId: string) => number | undefined;
};

