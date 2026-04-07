import type { NetworkSnapshot } from "@/lib/network/network";

const STORAGE_PREFIX = "foliage-network";

function buildStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function readStoredNetworkSnapshot(userId: string): NetworkSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(buildStorageKey(userId));
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as NetworkSnapshot;
  } catch {
    return null;
  }
}

export function writeStoredNetworkSnapshot(userId: string, snapshot: NetworkSnapshot): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(buildStorageKey(userId), JSON.stringify(snapshot));
}
