export type ConnectionStatus = "connected" | "incoming_pending" | "outgoing_pending" | "ignored";

export type NetworkPerson = {
  id: string;
  fullName: string;
  headline: string;
  location?: string;
  mutualCount: number;
  sharedSkills: string[];
  avatarUrl?: string;
};

export type NetworkSnapshot = {
  connections: NetworkPerson[];
  incoming: NetworkPerson[];
  recommended: NetworkPerson[];
  outgoing: NetworkPerson[];
};

export interface NetworkRepository {
  getSnapshot(userId: string): Promise<NetworkSnapshot>;
  acceptIncoming(userId: string, personId: string): Promise<NetworkSnapshot>;
  ignoreIncoming(userId: string, personId: string): Promise<NetworkSnapshot>;
  connectRecommended(userId: string, personId: string): Promise<NetworkSnapshot>;
  dismissRecommended(userId: string, personId: string): Promise<NetworkSnapshot>;
}
