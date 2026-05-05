import {
  type EditableStyle,
  type SectionConfig,
  type TemplateConfig,
  type UserTemplateBlockNode,
  type UserTemplateDocument,
  type UserTemplateNode,
  USER_TEMPLATE_SCHEMA_VERSION,
} from "@/lib/template-config-types";

const ROOT_NODE_ID = "root";
const MAX_TEXT_NODES_PER_SECTION = 140;

type StringLeaf = {
  path: string;
  text: string;
};

const structuredCloneSafe = <T>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const collectStringLeaves = (
  value: unknown,
  path: string,
  leaves: StringLeaf[],
  depth = 0
): void => {
  if (leaves.length >= MAX_TEXT_NODES_PER_SECTION || depth > 10) return;

  if (typeof value === "string") {
    leaves.push({ path, text: value });
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      collectStringLeaves(entry, `${path}[${index}]`, leaves, depth + 1);
    });
    return;
  }

  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, nested]) => {
      const nextPath = path ? `${path}.${key}` : key;
      collectStringLeaves(nested, nextPath, leaves, depth + 1);
    });
  }
};

const tokenizePath = (path: string): Array<string | number> => {
  const tokens: Array<string | number> = [];
  const matcher = /([^.[\]]+)|\[(\d+)\]/g;

  let match: RegExpExecArray | null = null;
  while ((match = matcher.exec(path)) !== null) {
    if (match[1]) {
      tokens.push(match[1]);
    } else if (match[2]) {
      tokens.push(Number.parseInt(match[2], 10));
    }
  }

  return tokens;
};

const setNestedValue = (target: Record<string, unknown>, path: string, nextValue: unknown): void => {
  const tokens = tokenizePath(path);
  if (!tokens.length) return;

  let current: unknown = target;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const isLast = index === tokens.length - 1;

    if (typeof token === "number") {
      if (!Array.isArray(current) || token < 0 || token >= current.length) return;

      if (isLast) {
        current[token] = nextValue;
        return;
      }

      current = current[token];
      continue;
    }

    if (!current || typeof current !== "object") return;
    const currentRecord = current as Record<string, unknown>;

    if (isLast) {
      currentRecord[token] = nextValue;
      return;
    }

    if (!(token in currentRecord)) return;
    current = currentRecord[token];
  }
};

const asEditableStyle = (value: unknown): EditableStyle | undefined => {
  if (!value || typeof value !== "object") return undefined;
  return value as EditableStyle;
};

const sectionToBlockNode = (section: SectionConfig): UserTemplateBlockNode => {
  const leaves: StringLeaf[] = [];
  collectStringLeaves(section.content, "content", leaves);
  const textStyles =
    section.props && typeof section.props === "object"
      ? ((section.props as Record<string, unknown>).__textStyles as Record<string, EditableStyle> | undefined)
      : undefined;

  return {
    id: section.id,
    type: "section",
    sectionType: section.type,
    title:
      typeof (section.content as { title?: unknown }).title === "string"
        ? ((section.content as { title?: string }).title as string)
        : section.type,
    enabled: section.enabled,
    style: section.style,
    props: {
      navLabel: section.navLabel,
      variant: section.variant,
      ...(section.props || {}),
    },
    children: leaves.map((leaf) => ({
      id: `${section.id}::${leaf.path}`,
      type: "text",
      text: leaf.text,
      style: textStyles?.[leaf.path],
      props: {
        path: leaf.path,
      },
    })),
  };
};

const sectionNodes = (document: UserTemplateDocument): UserTemplateBlockNode[] => {
  const rootChildren = Array.isArray(document.root.children) ? document.root.children : [];

  return rootChildren.filter(
    (node): node is UserTemplateBlockNode =>
      node.type === "section" && typeof node.id === "string" && node.id.length > 0
  );
};

export function createUserTemplateDocumentFromTemplateConfig(config: TemplateConfig): UserTemplateDocument {
  return {
    schema_version: USER_TEMPLATE_SCHEMA_VERSION,
    template_id: config.templateId,
    root: {
      id: ROOT_NODE_ID,
      type: "root",
      props: {
        theme: config.theme,
      },
      children: config.sections.map(sectionToBlockNode),
    },
    metadata: {
      source: "template-config",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}

export function applyUserTemplateDocumentToTemplateConfig(
  config: TemplateConfig,
  document: UserTemplateDocument
): TemplateConfig {
  const next = structuredCloneSafe(config);

  if (document.root.props && typeof document.root.props === "object") {
    const theme = (document.root.props as Record<string, unknown>).theme;
    if (theme && typeof theme === "object") {
      next.theme = {
        ...next.theme,
        ...(theme as TemplateConfig["theme"]),
      };
    }
  }

  const sectionMap = new Map(next.sections.map((section) => [section.id, section]));
  const orderedSections: SectionConfig[] = [];

  sectionNodes(document).forEach((blockNode) => {
    const existing = sectionMap.get(blockNode.id);
    if (!existing) return;

    const updatedSection = structuredCloneSafe(existing);

    if (typeof blockNode.enabled === "boolean") {
      updatedSection.enabled = blockNode.enabled;
    }

    updatedSection.style = asEditableStyle(blockNode.style) ?? updatedSection.style;

    if (blockNode.props && typeof blockNode.props === "object") {
      const props = blockNode.props as Record<string, unknown>;
      if (typeof props.navLabel === "string") {
        updatedSection.navLabel = props.navLabel;
      }
      if (typeof props.variant === "string") {
        updatedSection.variant = props.variant;
      }

      const rest = { ...props };
      delete rest.navLabel;
      delete rest.variant;
      updatedSection.props = {
        ...(updatedSection.props || {}),
        ...rest,
      };
    }

    const textNodes = Array.isArray(blockNode.children)
      ? blockNode.children.filter((node): node is Extract<UserTemplateNode, { type: "text" }> => node.type === "text")
      : [];
    const textStyles: Record<string, EditableStyle> =
      updatedSection.props && typeof updatedSection.props === "object"
        ? ((updatedSection.props as Record<string, unknown>).__textStyles as Record<string, EditableStyle> | undefined) || {}
        : {};

    textNodes.forEach((textNode) => {
      const path =
        typeof textNode.props?.path === "string" && textNode.props.path.startsWith("content")
          ? textNode.props.path
          : textNode.id.split("::")[1] || "";

      if (!path.startsWith("content")) return;
      const contentPath = path.replace(/^content\.?/, "");
      if (!contentPath) return;

      const contentRecord = updatedSection.content as unknown as Record<string, unknown>;
      setNestedValue(contentRecord, contentPath, textNode.text);
      if (textNode.style && typeof textNode.style === "object") {
        textStyles[path] = textNode.style;
      }
    });

    updatedSection.props = {
      ...(updatedSection.props || {}),
      __textStyles: textStyles,
    };

    sectionMap.delete(updatedSection.id);
    orderedSections.push(updatedSection);
  });

  sectionMap.forEach((section) => {
    orderedSections.push(section);
  });

  return {
    ...next,
    templateId: document.template_id || next.templateId,
    sections: orderedSections,
  };
}

export function flattenUserTemplateNodes(document: UserTemplateDocument): UserTemplateNode[] {
  const nodes: UserTemplateNode[] = [];

  const walk = (node: UserTemplateNode) => {
    nodes.push(node);
    if (node.type !== "text" && Array.isArray(node.children)) {
      node.children.forEach((child) => walk(child));
    }
  };

  walk(document.root);
  return nodes;
}

export function findUserTemplateNode(
  document: UserTemplateDocument,
  nodeId: string
): UserTemplateNode | null {
  return flattenUserTemplateNodes(document).find((node) => node.id === nodeId) || null;
}

export function updateUserTemplateNode(
  document: UserTemplateDocument,
  nodeId: string,
  updater: (node: UserTemplateNode) => UserTemplateNode
): UserTemplateDocument {
  const clone = structuredCloneSafe(document);

  const walk = (node: UserTemplateNode): UserTemplateNode => {
    if (node.id === nodeId) {
      return updater(node);
    }

    if (node.type !== "text" && Array.isArray(node.children)) {
      return {
        ...node,
        children: node.children.map((child) => walk(child)),
      };
    }

    return node;
  };

  return {
    ...clone,
    root: walk(clone.root) as UserTemplateBlockNode,
    metadata: {
      ...clone.metadata,
      source: "editor",
      updated_at: new Date().toISOString(),
    },
  };
}
