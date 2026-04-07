import type { NetworkPerson, NetworkRepository, NetworkSnapshot } from "@/lib/network/network";
import { createSeedNetworkSnapshot } from "@/lib/network/seed";
import { readStoredNetworkSnapshot, writeStoredNetworkSnapshot } from "@/lib/network/storage";

function removePersonById(people: NetworkPerson[], personId: string): NetworkPerson | null {
  const index = people.findIndex((person) => person.id === personId);
  if (index === -1) {
    return null;
  }

  const [found] = people.splice(index, 1);
  return found ?? null;
}

function addIfMissing(people: NetworkPerson[], nextPerson: NetworkPerson) {
  if (!people.some((person) => person.id === nextPerson.id)) {
    people.unshift(nextPerson);
  }
}

function cloneSnapshot(snapshot: NetworkSnapshot): NetworkSnapshot {
  return {
    connections: [...snapshot.connections],
    incoming: [...snapshot.incoming],
    recommended: [...snapshot.recommended],
    outgoing: [...snapshot.outgoing],
  };
}

function ensureSnapshot(userId: string): NetworkSnapshot {
  const existing = readStoredNetworkSnapshot(userId);
  if (existing) {
    return existing;
  }

  const seeded = createSeedNetworkSnapshot();
  writeStoredNetworkSnapshot(userId, seeded);
  return seeded;
}

function commitSnapshot(userId: string, snapshot: NetworkSnapshot): NetworkSnapshot {
  writeStoredNetworkSnapshot(userId, snapshot);
  return snapshot;
}

export class MockNetworkRepository implements NetworkRepository {
  async getSnapshot(userId: string): Promise<NetworkSnapshot> {
    return ensureSnapshot(userId);
  }

  async acceptIncoming(userId: string, personId: string): Promise<NetworkSnapshot> {
    const snapshot = cloneSnapshot(ensureSnapshot(userId));
    const found = removePersonById(snapshot.incoming, personId);

    if (!found) {
      return snapshot;
    }

    addIfMissing(snapshot.connections, found);

    snapshot.outgoing = snapshot.outgoing.filter((person) => person.id !== personId);

    return commitSnapshot(userId, snapshot);
  }

  async ignoreIncoming(userId: string, personId: string): Promise<NetworkSnapshot> {
    const snapshot = cloneSnapshot(ensureSnapshot(userId));
    removePersonById(snapshot.incoming, personId);
    return commitSnapshot(userId, snapshot);
  }

  async connectRecommended(userId: string, personId: string): Promise<NetworkSnapshot> {
    const snapshot = cloneSnapshot(ensureSnapshot(userId));
    const found = removePersonById(snapshot.recommended, personId);

    if (!found) {
      return snapshot;
    }

    addIfMissing(snapshot.outgoing, found);

    return commitSnapshot(userId, snapshot);
  }

  async dismissRecommended(userId: string, personId: string): Promise<NetworkSnapshot> {
    const snapshot = cloneSnapshot(ensureSnapshot(userId));
    removePersonById(snapshot.recommended, personId);
    return commitSnapshot(userId, snapshot);
  }
}

export const networkRepository: NetworkRepository = new MockNetworkRepository();
