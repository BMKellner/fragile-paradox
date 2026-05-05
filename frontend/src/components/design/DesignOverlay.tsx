"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { componentIdFromSource } from "@/lib/component-id";
import { lookupFiberFromDomNode } from "@/lib/react-fiber-map";

type SelectionInfo = {
  nodeId: string;
  rect: DOMRect;
  label: string;
};

type DesignOverlayProps = {
  enabled: boolean;
  previewRoot: HTMLElement | null;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
};

const attrEscape = (value: string): string => value.replace(/"/g, '\\"');

const nodeIdFromElement = (element: HTMLElement): { nodeId: string; label: string } | null => {
  const fiberInfo = lookupFiberFromDomNode(element);
  const section = element.closest<HTMLElement>("[data-customize-section-id]");
  const sectionId = section?.dataset.customizeSectionId?.trim();

  const editPath = element.dataset.editPath?.trim();
  if (sectionId && editPath) {
    return {
      nodeId: `${sectionId}::${editPath}`,
      label: editPath,
    };
  }

  if (sectionId) {
    return {
      nodeId: sectionId,
      label: section?.dataset.customizeSectionType || sectionId,
    };
  }

  const componentId = element.dataset.componentId?.trim();
  if (componentId) {
    return {
      nodeId: componentId,
      label: fiberInfo.componentName || componentId,
    };
  }

  if (fiberInfo.componentName || fiberInfo.source?.fileName) {
    const runtimeComponentId = componentIdFromSource(
      fiberInfo.componentName || "anonymous",
      fiberInfo.source,
      "fiber"
    );
    return {
      nodeId: runtimeComponentId,
      label: fiberInfo.componentName || runtimeComponentId,
    };
  }

  return null;
};

const queryElementForNodeId = (root: HTMLElement, nodeId: string): HTMLElement | null => {
  if (nodeId.includes("::")) {
    const [sectionId, editPath] = nodeId.split("::");
    if (!sectionId || !editPath) return null;

    const section = root.querySelector<HTMLElement>(`[data-customize-section-id="${attrEscape(sectionId)}"]`);
    if (!section) return null;

    return section.querySelector<HTMLElement>(`[data-edit-path="${attrEscape(editPath)}"]`);
  }

  return (
    root.querySelector<HTMLElement>(`[data-customize-section-id="${attrEscape(nodeId)}"]`) ||
    root.querySelector<HTMLElement>(`[data-component-id="${attrEscape(nodeId)}"]`) ||
    null
  );
};

export function DesignOverlay({ enabled, previewRoot, selectedNodeId, onSelectNode }: DesignOverlayProps) {
  const [hovered, setHovered] = useState<SelectionInfo | null>(null);
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!enabled || !previewRoot) {
      setHovered(null);
      return;
    }

    const onMove = (event: MouseEvent) => {
      const rawTarget = event.target;
      if (!(rawTarget instanceof HTMLElement)) {
        setHovered(null);
        return;
      }

      const candidate =
        rawTarget.closest<HTMLElement>("[data-edit-path]") ||
        rawTarget.closest<HTMLElement>("[data-customize-section-id]") ||
        rawTarget.closest<HTMLElement>("[data-component-id]");

      if (!candidate || !previewRoot.contains(candidate)) {
        setHovered(null);
        return;
      }

      const info = nodeIdFromElement(candidate);
      if (!info) {
        setHovered(null);
        return;
      }

      setHovered({
        nodeId: info.nodeId,
        rect: candidate.getBoundingClientRect(),
        label: info.label,
      });
    };

    const onClick = (event: MouseEvent) => {
      const rawTarget = event.target;
      if (!(rawTarget instanceof HTMLElement)) return;

      const candidate =
        rawTarget.closest<HTMLElement>("[data-edit-path]") ||
        rawTarget.closest<HTMLElement>("[data-customize-section-id]") ||
        rawTarget.closest<HTMLElement>("[data-component-id]");
      if (!candidate || !previewRoot.contains(candidate)) return;

      const info = nodeIdFromElement(candidate);
      if (!info) return;

      if (rawTarget.closest("a,button")) {
        event.preventDefault();
      }
      event.stopPropagation();
      onSelectNode(info.nodeId);
    };

    previewRoot.addEventListener("mousemove", onMove);
    previewRoot.addEventListener("click", onClick, true);

    return () => {
      previewRoot.removeEventListener("mousemove", onMove);
      previewRoot.removeEventListener("click", onClick, true);
    };
  }, [enabled, onSelectNode, previewRoot]);

  useEffect(() => {
    if (!enabled || !previewRoot || !selectedNodeId) {
      setSelectedRect(null);
      return;
    }

    const refresh = () => {
      const node = queryElementForNodeId(previewRoot, selectedNodeId);
      setSelectedRect(node ? node.getBoundingClientRect() : null);
    };

    refresh();
    window.addEventListener("scroll", refresh, true);
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("scroll", refresh, true);
      window.removeEventListener("resize", refresh);
    };
  }, [enabled, previewRoot, selectedNodeId]);

  const portalContent = useMemo(() => {
    if (!enabled) return null;

    return (
      <>
        {hovered ? (
          <div
            className="pointer-events-none fixed z-[120] rounded-sm border border-sky-400/90 bg-sky-400/10"
            style={{
              top: hovered.rect.top - 1,
              left: hovered.rect.left - 1,
              width: hovered.rect.width + 2,
              height: hovered.rect.height + 2,
            }}
          >
            <span className="absolute -top-6 left-0 rounded bg-sky-500 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white shadow-sm">
              {hovered.label}
            </span>
          </div>
        ) : null}

        {selectedRect ? (
          <div
            className="pointer-events-none fixed z-[121] rounded-sm border-2 border-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.5)]"
            style={{
              top: selectedRect.top - 2,
              left: selectedRect.left - 2,
              width: selectedRect.width + 4,
              height: selectedRect.height + 4,
            }}
          />
        ) : null}
      </>
    );
  }, [enabled, hovered, selectedRect]);

  if (typeof document === "undefined" || !enabled || !portalContent) return null;
  return createPortal(portalContent, document.body);
}
