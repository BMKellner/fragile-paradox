"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { GripVertical } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const RESIZE_CURSOR: Record<ResizeDir, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
};

function resizeDelta(dir: ResizeDir, dy: number, startH: number): number {
  const north = dir === "n" || dir === "nw" || dir === "ne";
  return Math.max(80, startH + (north ? -dy : dy));
}

type SectionFrameProps = {
  sectionId: string;
  sectionLabel: string;
  selected: boolean;
  enabled: boolean;
  editableFields?: unknown[];
  height?: number;
  onSelect: (id: string) => void;
  onReorder: (dragged: string, target: string) => void;
  onUpdateField?: (id: string, path: string, value: string) => void;
  onResize?: (id: string, height: number) => void;
  children: ReactNode;
};

// ── Module-level drag + drop-indicator state ──────────────────────────────────
// Using pub-sub so the dragging section can update drop indicators in peer
// sections without needing React context or prop drilling.

const DRAG_THRESHOLD = 6; // px of movement before a grip press becomes a drag

type DropOverState = { targetId: string | null; pos: "top" | "bottom" | null };

let _activeDragId: string | null = null;
const _dropOverListeners = new Set<(s: DropOverState) => void>();

function broadcastDropOver(state: DropOverState) {
  _dropOverListeners.forEach((fn) => fn(state));
}

// ── Component ────────────────────────────────────────────────────────────────

export function SectionFrame({
  sectionId,
  sectionLabel,
  selected,
  enabled,
  height,
  onSelect,
  onReorder,
  onResize,
  children,
}: SectionFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  // Resize state
  const resizeRef = useRef<{ dir: ResizeDir; startY: number; startH: number } | null>(null);
  const committedHeightRef = useRef<number | null>(null);
  const [localHeight, setLocalHeight] = useState<number | null>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false); // mirror for use in callbacks without stale closure
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [dropPos, setDropPos] = useState<"top" | "bottom" | null>(null);

  // ── Subscribe to drop-over broadcasts ─────────────────────────────────────

  useEffect(() => {
    const handler = (state: DropOverState) => {
      setDropPos(state.targetId === sectionId ? state.pos : null);
    };
    _dropOverListeners.add(handler);
    return () => {
      _dropOverListeners.delete(handler);
    };
  }, [sectionId]);

  // ── Resize: global pointer listeners ──────────────────────────────────────

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!resizeRef.current) return;
      const { dir, startY, startH } = resizeRef.current;
      const h = resizeDelta(dir, e.clientY - startY, startH);
      committedHeightRef.current = h;
      setLocalHeight(h);
    };

    const onUp = () => {
      if (!resizeRef.current) return;
      resizeRef.current = null;
      const h = committedHeightRef.current;
      if (h !== null) onResize?.(sectionId, h);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  }, [sectionId, onResize]);

  const startResize = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, dir: ResizeDir) => {
      e.stopPropagation();
      e.preventDefault();
      if (!containerRef.current) return;
      const h = containerRef.current.getBoundingClientRect().height;
      committedHeightRef.current = h;
      resizeRef.current = { dir, startY: e.clientY, startH: h };
      setLocalHeight(h);
    },
    []
  );

  // ── DnD: pointer-capture on grip (with drag threshold) ───────────────────
  // A short press+release on the grip is treated as a click → selects the section.
  // Only after moving DRAG_THRESHOLD pixels does it become a real drag.

  const startGhost = useCallback(
    (x: number, y: number) => {
      const ghost = document.createElement("div");
      ghost.style.cssText = [
        "position:fixed",
        `top:${y - 14}px`,
        `left:${x - 56}px`,
        "background:var(--background,#1a1a1a)",
        "border:1.5px solid var(--color-primary,#22c55e)",
        "border-radius:6px",
        "padding:4px 10px",
        "font-size:11px",
        "font-weight:600",
        "color:var(--foreground,#fff)",
        "pointer-events:none",
        "z-index:9999",
        "box-shadow:0 8px 28px rgba(0,0,0,0.28)",
        "display:flex",
        "align-items:center",
        "gap:5px",
        "white-space:nowrap",
        "transform:rotate(1.5deg) scale(1.04)",
        "opacity:0.94",
      ].join(";");
      ghost.textContent = sectionLabel;
      document.body.appendChild(ghost);
      ghostRef.current = ghost;
    },
    [sectionLabel]
  );

  const onGripDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
      _activeDragId = sectionId;
      isDraggingRef.current = false; // not yet dragging – waiting for threshold
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [sectionId]
  );

  const onGripMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (_activeDragId !== sectionId) return;

      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Cross threshold → become a real drag
      if (!isDraggingRef.current && dist > DRAG_THRESHOLD) {
        isDraggingRef.current = true;
        setIsDragging(true);
        startGhost(e.clientX, e.clientY);
      }

      if (!isDraggingRef.current || !ghostRef.current) return;

      ghostRef.current.style.left = `${e.clientX - 56}px`;
      ghostRef.current.style.top = `${e.clientY - 14}px`;

      // Broadcast drop target to all peer SectionFrames
      const allSections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-canvas-section-id]")
      );
      let found = false;
      for (const el of allSections) {
        const targetId = el.getAttribute("data-canvas-section-id");
        if (!targetId || targetId === sectionId) continue;
        const r = el.getBoundingClientRect();
        if (
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom
        ) {
          const pos: "top" | "bottom" = e.clientY < r.top + r.height / 2 ? "top" : "bottom";
          broadcastDropOver({ targetId, pos });
          found = true;
          break;
        }
      }
      if (!found) broadcastDropOver({ targetId: null, pos: null });
    },
    [sectionId, startGhost]
  );

  const onGripUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (_activeDragId !== sectionId) return;

      if (!isDraggingRef.current) {
        // Threshold never reached → treat as a plain click → select the section
        onSelect(sectionId);
      } else {
        // Real drag ended → find drop target and reorder
        if (ghostRef.current) {
          document.body.removeChild(ghostRef.current);
          ghostRef.current = null;
        }
        broadcastDropOver({ targetId: null, pos: null });

        const allSections = Array.from(
          document.querySelectorAll<HTMLElement>("[data-canvas-section-id]")
        );
        for (const el of allSections) {
          const targetId = el.getAttribute("data-canvas-section-id");
          if (!targetId || targetId === sectionId) continue;
          const r = el.getBoundingClientRect();
          if (
            e.clientX >= r.left &&
            e.clientX <= r.right &&
            e.clientY >= r.top &&
            e.clientY <= r.bottom
          ) {
            onReorder(sectionId, targetId);
            break;
          }
        }
      }

      _activeDragId = null;
      isDraggingRef.current = false;
      setIsDragging(false);
    },
    [sectionId, onSelect, onReorder]
  );

  // Clean up ghost on unmount
  useEffect(() => {
    return () => {
      if (ghostRef.current) {
        try {
          document.body.removeChild(ghostRef.current);
        } catch {
          // already removed
        }
        ghostRef.current = null;
      }
    };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  if (!enabled) return <>{children}</>;

  const appliedMinHeight = localHeight ?? height;

  return (
    <div
      ref={containerRef}
      className={[
        "group relative",
        selected
          ? "ring-2 ring-[var(--color-primary)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
          : "ring-1 ring-transparent hover:ring-1 hover:ring-[var(--color-primary)]/25",
        isDragging ? "opacity-30" : "",
        dropPos ? "ring-2 ring-[var(--color-primary)]/50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={appliedMinHeight ? { minHeight: appliedMinHeight } : undefined}
      onClick={() => {
        // Only select if we're not finishing a resize
        if (resizeRef.current) return;
        onSelect(sectionId);
      }}
      data-canvas-section-id={sectionId}
    >
      {/* ── Drop indicator top ──────────────────────────────────────────── */}
      {dropPos === "top" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-0.5 rounded-full bg-[var(--color-primary)]" />
      )}

      {/* ── Drag handle / label badge ────────────────────────────────────── */}
      <div
        className={[
          "absolute left-2 top-2 z-20 inline-flex select-none touch-none items-center gap-1.5",
          "rounded border bg-background/90 px-2 py-1 text-[11px] font-medium",
          "text-foreground/60 shadow-sm transition-opacity cursor-grab active:cursor-grabbing",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        ].join(" ")}
        onPointerDown={onGripDown}
        onPointerMove={onGripMove}
        onPointerUp={onGripUp}
      >
        <GripVertical className="h-3 w-3 shrink-0" />
        {sectionLabel}
      </div>

      {/* ── Section content ──────────────────────────────────────────────── */}
      {children}

      {/* ── Drop indicator bottom ────────────────────────────────────────── */}
      {dropPos === "bottom" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-0.5 rounded-full bg-[var(--color-primary)]" />
      )}

      {/* ── Resize handles (only when selected) ─────────────────────────── */}
      {selected && onResize && (
        <div className="pointer-events-none absolute inset-0 z-30">
          {/* Corners */}
          {(["nw", "ne", "se", "sw"] as ResizeDir[]).map((dir) => (
            <div
              key={dir}
              className="pointer-events-auto absolute h-[10px] w-[10px] rounded-[2px] border-2 border-[var(--color-primary)] bg-white shadow-md"
              style={{
                cursor: RESIZE_CURSOR[dir],
                ...(dir.startsWith("n") ? { top: -5 } : { bottom: -5 }),
                ...(dir.endsWith("w") ? { left: -5 } : { right: -5 }),
              }}
              onPointerDown={(e) => startResize(e, dir)}
            />
          ))}

          {/* N / S edge midpoints */}
          {(["n", "s"] as ResizeDir[]).map((dir) => (
            <div
              key={dir}
              className="pointer-events-auto absolute h-[5px] w-5 rounded-full border border-[var(--color-primary)] bg-white shadow-sm"
              style={{
                cursor: RESIZE_CURSOR[dir],
                left: "50%",
                transform: "translateX(-50%)",
                ...(dir === "n" ? { top: -2.5 } : { bottom: -2.5 }),
              }}
              onPointerDown={(e) => startResize(e, dir)}
            />
          ))}

          {/* E / W edge midpoints */}
          {(["e", "w"] as ResizeDir[]).map((dir) => (
            <div
              key={dir}
              className="pointer-events-auto absolute h-5 w-[5px] rounded-full border border-[var(--color-primary)] bg-white shadow-sm"
              style={{
                cursor: RESIZE_CURSOR[dir],
                top: "50%",
                transform: "translateY(-50%)",
                ...(dir === "e" ? { right: -2.5 } : { left: -2.5 }),
              }}
              onPointerDown={(e) => startResize(e, dir)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
