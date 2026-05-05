"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  TemplateConfig,
  UserTemplateDocument,
  UserTemplateNode,
} from "@/lib/template-config-types";
import {
  applyUserTemplateDocumentToTemplateConfig,
  createUserTemplateDocumentFromTemplateConfig,
  updateUserTemplateNode,
} from "@/lib/user-template-schema";

type DesignEditorStateParams = {
  enabled: boolean;
  config: TemplateConfig;
  storageKey: string;
};

type EditorHistory = {
  past: UserTemplateDocument[];
  present: UserTemplateDocument;
  future: UserTemplateDocument[];
};

const HISTORY_LIMIT = 80;

const readStoredDocument = (key: string): UserTemplateDocument | null => {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(key);
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<UserTemplateDocument>;
    if (
      parsed &&
      parsed.schema_version === 1 &&
      typeof parsed.template_id === "string" &&
      parsed.root &&
      typeof parsed.root.id === "string"
    ) {
      return parsed as UserTemplateDocument;
    }
  } catch {
    return null;
  }

  return null;
};

export function useDesignEditorState({ enabled, config, storageKey }: DesignEditorStateParams) {
  const baseDocument = useMemo(() => createUserTemplateDocumentFromTemplateConfig(config), [config]);
  const [history, setHistory] = useState<EditorHistory>(() => ({
    past: [],
    present: baseDocument,
    future: [],
  }));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    setHistory((current) => {
      if (!enabled) {
        return {
          past: [],
          present: baseDocument,
          future: [],
        };
      }

      if (!hydratedRef.current) {
        const stored = readStoredDocument(storageKey);
        hydratedRef.current = true;
        if (stored && stored.template_id === config.templateId) {
          return {
            past: [],
            present: stored,
            future: [],
          };
        }
      }

      if (current.present.template_id !== config.templateId) {
        return {
          past: [],
          present: baseDocument,
          future: [],
        };
      }

      return current;
    });
  }, [baseDocument, config.templateId, enabled, storageKey]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const interval = window.setInterval(() => {
      localStorage.setItem(storageKey, JSON.stringify(history.present));
    }, 1500);

    return () => {
      window.clearInterval(interval);
    };
  }, [enabled, history.present, storageKey]);

  const resolvedConfig = useMemo(
    () => applyUserTemplateDocumentToTemplateConfig(config, history.present),
    [config, history.present]
  );

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const applyDocument = useCallback((nextDocument: UserTemplateDocument) => {
    setHistory((current) => {
      if (JSON.stringify(current.present) === JSON.stringify(nextDocument)) {
        return current;
      }

      const nextPast = [...current.past, current.present];
      if (nextPast.length > HISTORY_LIMIT) {
        nextPast.splice(0, nextPast.length - HISTORY_LIMIT);
      }

      return {
        past: nextPast,
        present: nextDocument,
        future: [],
      };
    });
  }, []);

  const updateNode = useCallback(
    (nodeId: string, updater: (node: UserTemplateNode) => UserTemplateNode) => {
      const next = updateUserTemplateNode(history.present, nodeId, updater);
      applyDocument(next);
    },
    [applyDocument, history.present]
  );

  const undo = useCallback(() => {
    setHistory((current) => {
      const previous = current.past[current.past.length - 1];
      if (!previous) return current;

      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      const [next, ...rest] = current.future;
      if (!next) return current;

      return {
        past: [...current.past, current.present],
        present: next,
        future: rest,
      };
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey;
      if (!isMeta) return;

      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      if ((key === "y" && !event.shiftKey) || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, redo, undo]);

  return {
    document: history.present,
    setDocument: applyDocument,
    updateNode,
    resolvedConfig,
    selectedNodeId,
    setSelectedNodeId,
    undo,
    redo,
    canUndo,
    canRedo,
    isDirty: history.past.length > 0,
  };
}
