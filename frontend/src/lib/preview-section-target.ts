import type { SectionType } from '@/lib/template-config';

type PreviewSectionTarget = {
  sectionId?: string | null;
  sectionType?: SectionType | null;
};

const attrEscape = (value: string): string => value.replace(/"/g, '\\"');

export const findPreviewSectionElement = (
  root: HTMLElement,
  target: PreviewSectionTarget
): HTMLElement | null => {
  const sectionId = target.sectionId?.trim() || null;
  const sectionType = target.sectionType?.trim() || null;

  if (sectionId) {
    const byDataId = root.querySelector<HTMLElement>(`[data-customize-section-id="${attrEscape(sectionId)}"]`);
    if (byDataId) return byDataId;

    const byDocumentId = typeof document !== 'undefined' ? document.getElementById(sectionId) : null;
    if (byDocumentId instanceof HTMLElement && root.contains(byDocumentId)) {
      return byDocumentId;
    }
  }

  if (sectionType) {
    const byType = root.querySelector<HTMLElement>(`[data-customize-section-type="${attrEscape(sectionType)}"]`);
    if (byType) return byType;
  }

  return null;
};

export const findPreviewSectionHighlightElement = (
  root: HTMLElement,
  target: PreviewSectionTarget
): HTMLElement | null => {
  return findPreviewSectionElement(root, target);
};
