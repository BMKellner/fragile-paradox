export type FiberDebugSource = {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
};

export type FiberLookupResult = {
  fiber: unknown | null;
  componentName?: string;
  source?: FiberDebugSource;
};

const fiberKeyForNode = (node: HTMLElement): string | null => {
  const key = Object.keys(node).find((entry) => entry.startsWith('__reactFiber$') || entry.startsWith('__reactInternalInstance$'));
  return key || null;
};

export function lookupFiberFromDomNode(node: HTMLElement): FiberLookupResult {
  const key = fiberKeyForNode(node);
  if (!key) {
    return { fiber: null };
  }

  const fiber = (node as unknown as Record<string, unknown>)[key] as Record<string, unknown> | undefined;
  if (!fiber || typeof fiber !== 'object') {
    return { fiber: null };
  }

  const fiberType = fiber.type as { displayName?: string; name?: string } | undefined;
  const debugSource =
    (fiber._debugSource as FiberDebugSource | undefined) ||
    ((fiber._debugOwner as Record<string, unknown> | undefined)?._debugSource as FiberDebugSource | undefined);

  return {
    fiber,
    componentName: fiberType?.displayName || fiberType?.name,
    source: debugSource,
  };
}

export function hasReactDevtoolsHook(): boolean {
  const hook = (globalThis as unknown as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown }).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  return Boolean(hook);
}
