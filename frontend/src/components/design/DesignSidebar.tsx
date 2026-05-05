"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type EditableStyle,
  type UserTemplateBlockNode,
  type UserTemplateDocument,
  type UserTemplateNode,
} from "@/lib/template-config-types";
import { findUserTemplateNode } from "@/lib/user-template-schema";

type DesignSidebarProps = {
  document: UserTemplateDocument;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, updater: (node: UserTemplateNode) => UserTemplateNode) => void;
  onReorderSections: (draggedSectionId: string, targetSectionId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const stylePatch = (
  node: UserTemplateNode,
  patch: Partial<EditableStyle>
): UserTemplateNode => {
  if (node.type === "text") {
    return {
      ...node,
      style: {
        ...(node.style || {}),
        ...patch,
      },
    };
  }

  return {
    ...node,
    style: {
      ...(node.style || {}),
      ...patch,
    },
  };
};

export function DesignSidebar({
  document,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  onReorderSections,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: DesignSidebarProps) {
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  const sectionNodes = useMemo(
    () =>
      (document.root.children || []).filter(
        (node): node is UserTemplateBlockNode => node.type === "section" && typeof node.id === "string"
      ),
    [document.root.children]
  );

  const selectedNode = useMemo(
    () => (selectedNodeId ? findUserTemplateNode(document, selectedNodeId) : null),
    [document, selectedNodeId]
  );

  return (
    <aside className="w-full border-l bg-background lg:w-96">
      <div className="border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Design Mode</p>
            <h3 className="text-lg font-semibold">Visual Editor</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="sm" onClick={onUndo} disabled={!canUndo}>
              Undo
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onRedo} disabled={!canRedo}>
              Redo
            </Button>
          </div>
        </div>
      </div>

      <div className="max-h-[38vh] overflow-y-auto border-b p-4">
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Sections</p>
        <div className="space-y-2">
          {sectionNodes.map((section) => (
            <button
              key={section.id}
              type="button"
              draggable
              onDragStart={() => setDraggedSectionId(section.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedSectionId) {
                  onReorderSections(draggedSectionId, section.id);
                }
                setDraggedSectionId(null);
              }}
              onDragEnd={() => setDraggedSectionId(null)}
              onClick={() => onSelectNode(section.id)}
              className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                selectedNodeId === section.id
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "hover:bg-muted/50"
              } ${draggedSectionId === section.id ? "opacity-60" : ""}`}
            >
              <p className="text-sm font-medium">{section.title || section.sectionType || section.id}</p>
              <p className="text-xs text-muted-foreground">{section.sectionType || "section"}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[50vh] overflow-y-auto p-4">
        {!selectedNode ? (
          <p className="text-sm text-muted-foreground">Click an element in the preview to edit it.</p>
        ) : selectedNode.type === "text" ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Selected Text</p>
              <p className="text-sm font-medium break-all">{selectedNode.id}</p>
            </div>

            <div>
              <Label>Text</Label>
              <Textarea
                rows={4}
                value={selectedNode.text}
                onChange={(event) =>
                  onUpdateNode(selectedNode.id, (node) =>
                    node.type === "text" ? { ...node, text: event.target.value } : node
                  )
                }
              />
            </div>

            <div>
              <Label>Color</Label>
              <Input
                type="color"
                value={selectedNode.style?.color || "#111827"}
                onChange={(event) =>
                  onUpdateNode(selectedNode.id, (node) => stylePatch(node, { color: event.target.value }))
                }
              />
            </div>

            <div>
              <Label>Font Size</Label>
              <Input
                value={selectedNode.style?.fontSize || "16px"}
                onChange={(event) =>
                  onUpdateNode(selectedNode.id, (node) => stylePatch(node, { fontSize: event.target.value }))
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Selected Block</p>
              <p className="text-sm font-medium">{selectedNode.title || selectedNode.sectionType || selectedNode.id}</p>
              <p className="text-xs text-muted-foreground">{selectedNode.type}</p>
            </div>

            {selectedNode.type === "section" ? (
              <>
                <div className="flex items-center justify-between rounded-md border p-2">
                  <Label htmlFor="enabled-toggle">Enabled</Label>
                  <input
                    id="enabled-toggle"
                    type="checkbox"
                    checked={selectedNode.enabled !== false}
                    onChange={(event) =>
                      onUpdateNode(selectedNode.id, (node) =>
                        node.type === "text" ? node : { ...node, enabled: event.target.checked }
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Nav Label</Label>
                  <Input
                    value={typeof selectedNode.props?.navLabel === 'string' ? selectedNode.props.navLabel : ''}
                    onChange={(event) =>
                      onUpdateNode(selectedNode.id, (node) =>
                        node.type === 'text'
                          ? node
                          : {
                              ...node,
                              props: {
                                ...(node.props || {}),
                                navLabel: event.target.value,
                              },
                            }
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Variant</Label>
                  <Input
                    value={typeof selectedNode.props?.variant === 'string' ? selectedNode.props.variant : ''}
                    onChange={(event) =>
                      onUpdateNode(selectedNode.id, (node) =>
                        node.type === 'text'
                          ? node
                          : {
                              ...node,
                              props: {
                                ...(node.props || {}),
                                variant: event.target.value,
                              },
                            }
                      )
                    }
                  />
                </div>
              </>
            ) : null}

            <div>
              <Label>Padding</Label>
              <Input
                value={selectedNode.style?.padding || ""}
                placeholder="e.g. 16px"
                onChange={(event) =>
                  onUpdateNode(selectedNode.id, (node) => stylePatch(node, { padding: event.target.value }))
                }
              />
            </div>

            <div>
              <Label>Margin</Label>
              <Input
                value={selectedNode.style?.margin || ""}
                placeholder="e.g. 0 0 24px 0"
                onChange={(event) =>
                  onUpdateNode(selectedNode.id, (node) => stylePatch(node, { margin: event.target.value }))
                }
              />
            </div>

            <div>
              <Label>Border Radius</Label>
              <Input
                value={selectedNode.style?.borderRadius || ""}
                placeholder="e.g. 12px"
                onChange={(event) =>
                  onUpdateNode(selectedNode.id, (node) => stylePatch(node, { borderRadius: event.target.value }))
                }
              />
            </div>

            <div>
              <Label>Background</Label>
              <Input
                type="color"
                value={selectedNode.style?.backgroundColor || "#ffffff"}
                onChange={(event) =>
                  onUpdateNode(selectedNode.id, (node) => stylePatch(node, { backgroundColor: event.target.value }))
                }
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
