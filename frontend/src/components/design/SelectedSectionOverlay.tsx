'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SectionType } from '@/lib/template-config';
import { findPreviewSectionHighlightElement } from '@/lib/preview-section-target';

type SelectedSectionOverlayProps = {
  enabled: boolean;
  previewRoot: HTMLElement | null;
  selectedSectionId: string | null;
  selectedSectionType: SectionType | null;
  outlineColor: string;
};

type OverlayBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function SelectedSectionOverlay({
  enabled,
  previewRoot,
  selectedSectionId,
  selectedSectionType,
  outlineColor,
}: SelectedSectionOverlayProps) {
  const [box, setBox] = useState<OverlayBox | null>(null);

  useEffect(() => {
    if (!enabled || !previewRoot || (!selectedSectionId && !selectedSectionType)) {
      setBox(null);
      return;
    }

    let observedTarget: HTMLElement | null = null;
    let rafId: number | null = null;

    const scheduleRefresh = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        refresh();
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      scheduleRefresh();
    });

    const observeTarget = (nextTarget: HTMLElement | null) => {
      if (observedTarget === nextTarget) return;

      if (observedTarget) {
        resizeObserver.unobserve(observedTarget);
      }

      observedTarget = nextTarget;

      if (observedTarget) {
        resizeObserver.observe(observedTarget);
      }
    };

    const refresh = () => {
      const nextTarget = findPreviewSectionHighlightElement(previewRoot, {
        sectionId: selectedSectionId,
        sectionType: selectedSectionType,
      });
      observeTarget(nextTarget);
      if (!nextTarget) {
        setBox(null);
        return;
      }

      const rootRect = previewRoot.getBoundingClientRect();
      const targetRect = nextTarget.getBoundingClientRect();
      setBox({
        top: targetRect.top - rootRect.top + previewRoot.scrollTop,
        left: targetRect.left - rootRect.left + previewRoot.scrollLeft,
        width: targetRect.width,
        height: targetRect.height,
      });
    };

    refresh();
    previewRoot.addEventListener('scroll', scheduleRefresh, { passive: true });
    previewRoot.addEventListener('transitionrun', scheduleRefresh, true);
    previewRoot.addEventListener('transitionend', scheduleRefresh, true);
    previewRoot.addEventListener('animationstart', scheduleRefresh, true);
    previewRoot.addEventListener('animationend', scheduleRefresh, true);
    window.addEventListener('resize', scheduleRefresh);
    window.addEventListener('scroll', scheduleRefresh, true);

    resizeObserver.observe(previewRoot);

    const mutationObserver = new MutationObserver(() => {
      scheduleRefresh();
    });
    mutationObserver.observe(previewRoot, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-visible', 'class', 'style'],
    });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }

      previewRoot.removeEventListener('scroll', scheduleRefresh);
      previewRoot.removeEventListener('transitionrun', scheduleRefresh, true);
      previewRoot.removeEventListener('transitionend', scheduleRefresh, true);
      previewRoot.removeEventListener('animationstart', scheduleRefresh, true);
      previewRoot.removeEventListener('animationend', scheduleRefresh, true);
      window.removeEventListener('resize', scheduleRefresh);
      window.removeEventListener('scroll', scheduleRefresh, true);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      observedTarget = null;
    };
  }, [enabled, previewRoot, selectedSectionId, selectedSectionType]);

  const overlay = useMemo(() => {
    if (!enabled || !box) return null;

    return (
      <div
        className="pointer-events-none absolute z-[90] rounded-md border-2 border-dashed selected-section-outline-breathe"
        style={{
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
          borderColor: outlineColor,
          boxSizing: 'border-box',
        }}
      />
    );
  }, [box, enabled, outlineColor]);

  if (!enabled || !overlay || !previewRoot || typeof document === 'undefined') return null;
  return createPortal(overlay, previewRoot);
}
