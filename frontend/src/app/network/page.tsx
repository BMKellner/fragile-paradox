'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  collectSkillFilters,
  filterPeople,
  networkRepository,
  paginatePeople,
  type MutualFilterOption,
  type NetworkPerson,
  type NetworkSnapshot,
} from "@/lib/network";
import {
  Compass,
  Inbox,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

const PAGE_SIZE = 6;

type NetworkTabKey = "connections" | "incoming" | "recommended";
type VisibleCounts = Record<NetworkTabKey, number>;

const EMPTY_SNAPSHOT: NetworkSnapshot = {
  connections: [],
  incoming: [],
  recommended: [],
  outgoing: [],
};

const mutualOptions: Array<{ label: string; value: MutualFilterOption }> = [
  { label: "Any mutuals", value: "all" },
  { label: "3+ mutuals", value: "3" },
  { label: "5+ mutuals", value: "5" },
  { label: "10+ mutuals", value: "10" },
];

function makeDefaultVisibleCounts(): VisibleCounts {
  return {
    connections: PAGE_SIZE,
    incoming: PAGE_SIZE,
    recommended: PAGE_SIZE,
  };
}

function parseTab(value: string | null): NetworkTabKey {
  if (value === "incoming" || value === "recommended" || value === "connections") {
    return value;
  }
  return "connections";
}

function parseMutualFilter(value: string | null): MutualFilterOption {
  if (value === "3" || value === "5" || value === "10") {
    return value;
  }
  return "all";
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function PersonCardMeta({ person }: { person: NetworkPerson }) {
  return (
    <>
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-full bg-[var(--color-primary)]/17 border border-[var(--color-primary)]/25 text-[var(--color-primary)] font-semibold flex items-center justify-center shrink-0">
          {getInitials(person.fullName)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-base leading-tight">{person.fullName}</p>
          <p className="text-sm text-muted-foreground mt-1 truncate">{person.headline}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {person.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {person.location}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Users className="w-3 h-3" />
          {person.mutualCount} mutual connection{person.mutualCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {person.sharedSkills.slice(0, 4).map((skill) => (
          <Badge key={`${person.id}-${skill}`} variant="secondary" className="bg-[var(--color-secondary)]/75">
            {skill}
          </Badge>
        ))}
      </div>
    </>
  );
}

function TabEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12">
      <Icon className="w-8 h-8 mx-auto mb-3 text-[var(--color-primary)]" />
      <h3 className="text-2xl mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function NetworkPage() {
  const router = useRouter();
  const pathname = usePathname();
  const info = useUser();

  const [snapshot, setSnapshot] = useState<NetworkSnapshot | null>(null);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NetworkTabKey>("connections");
  const [query, setQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [mutualFilter, setMutualFilter] = useState<MutualFilterOption>("all");
  const [visibleCounts, setVisibleCounts] = useState<VisibleCounts>(makeDefaultVisibleCounts);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const hasHydratedUrlState = useRef(false);

  useEffect(() => {
    if (hasHydratedUrlState.current) {
      return;
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setActiveTab(parseTab(params.get("tab")));
      setQuery(params.get("q") ?? "");
      setSkillFilter(params.get("skill") ?? "all");
      setMutualFilter(parseMutualFilter(params.get("mutual")));
    }

    hasHydratedUrlState.current = true;
  }, []);

  useEffect(() => {
    if (!hasHydratedUrlState.current) {
      return;
    }

    const nextParams = new URLSearchParams();
    const normalizedQuery = query.trim();

    if (activeTab !== "connections") {
      nextParams.set("tab", activeTab);
    }
    if (normalizedQuery) {
      nextParams.set("q", normalizedQuery);
    }
    if (skillFilter !== "all") {
      nextParams.set("skill", skillFilter);
    }
    if (mutualFilter !== "all") {
      nextParams.set("mutual", mutualFilter);
    }

    const nextPath = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
    router.replace(nextPath, { scroll: false });
  }, [activeTab, mutualFilter, pathname, query, router, skillFilter]);

  useEffect(() => {
    setVisibleCounts(makeDefaultVisibleCounts());
  }, [query, skillFilter, mutualFilter]);

  useEffect(() => {
    const userId = info.user?.id;

    if (!userId) {
      if (!info.loading) {
        setSnapshot(null);
        setIsSnapshotLoading(false);
      }
      return;
    }

    let isCancelled = false;
    setIsSnapshotLoading(true);

    void networkRepository.getSnapshot(userId)
      .then((nextSnapshot) => {
        if (!isCancelled) {
          setSnapshot(nextSnapshot);
        }
      })
      .catch((error) => {
        console.error("Failed to load network snapshot:", error);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsSnapshotLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [info.loading, info.user?.id]);

  const source = snapshot ?? EMPTY_SNAPSHOT;

  const filters = useMemo(
    () => ({
      query,
      skill: skillFilter,
      mutual: mutualFilter,
    }),
    [mutualFilter, query, skillFilter]
  );

  const filteredConnections = useMemo(
    () => filterPeople(source.connections, filters),
    [filters, source.connections]
  );
  const filteredIncoming = useMemo(
    () => filterPeople(source.incoming, filters),
    [filters, source.incoming]
  );
  const filteredRecommended = useMemo(
    () => filterPeople(source.recommended, filters),
    [filters, source.recommended]
  );

  const visibleConnections = useMemo(
    () => paginatePeople(filteredConnections, visibleCounts.connections),
    [filteredConnections, visibleCounts.connections]
  );
  const visibleIncoming = useMemo(
    () => paginatePeople(filteredIncoming, visibleCounts.incoming),
    [filteredIncoming, visibleCounts.incoming]
  );
  const visibleRecommended = useMemo(
    () => paginatePeople(filteredRecommended, visibleCounts.recommended),
    [filteredRecommended, visibleCounts.recommended]
  );

  const skillOptions = useMemo(() => collectSkillFilters(source), [source]);

  const listByTab: Record<NetworkTabKey, NetworkPerson[]> = {
    connections: filteredConnections,
    incoming: filteredIncoming,
    recommended: filteredRecommended,
  };

  const visibleByTab: Record<NetworkTabKey, NetworkPerson[]> = {
    connections: visibleConnections,
    incoming: visibleIncoming,
    recommended: visibleRecommended,
  };

  const canLoadMore = visibleByTab[activeTab].length < listByTab[activeTab].length;

  const handleLoadMore = (tab: NetworkTabKey) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [tab]: prev[tab] + PAGE_SIZE,
    }));
  };

  const runNetworkAction = async (
    actionKey: string,
    perform: () => Promise<NetworkSnapshot>
  ) => {
    setPendingAction(actionKey);

    try {
      const next = await perform();
      setSnapshot(next);
    } catch (error) {
      console.error("Network action failed:", error);
    } finally {
      setPendingAction(null);
    }
  };

  const handleAcceptIncoming = (personId: string) => {
    const userId = info.user?.id;
    if (!userId) {
      return;
    }

    void runNetworkAction(`accept-${personId}`, () =>
      networkRepository.acceptIncoming(userId, personId)
    );
  };

  const handleIgnoreIncoming = (personId: string) => {
    const userId = info.user?.id;
    if (!userId) {
      return;
    }

    void runNetworkAction(`ignore-${personId}`, () =>
      networkRepository.ignoreIncoming(userId, personId)
    );
  };

  const handleConnectRecommended = (personId: string) => {
    const userId = info.user?.id;
    if (!userId) {
      return;
    }

    void runNetworkAction(`connect-${personId}`, () =>
      networkRepository.connectRecommended(userId, personId)
    );
  };

  const handleDismissRecommended = (personId: string) => {
    const userId = info.user?.id;
    if (!userId) {
      return;
    }

    void runNetworkAction(`dismiss-${personId}`, () =>
      networkRepository.dismissRecommended(userId, personId)
    );
  };

  const clearFilters = () => {
    setQuery("");
    setSkillFilter("all");
    setMutualFilter("all");
  };

  if (info.loading || isSnapshotLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your network...</p>
        </div>
      </div>
    );
  }

  if (!info.user) {
    router.push('/signin?next=/network');
    return null;
  }

  return (
    <div className="min-h-screen soft-surface relative overflow-x-clip">
      <div className="floating-orb floating-orb-1" aria-hidden />
      <div className="floating-orb floating-orb-2" aria-hidden />
      <Header currentPage="network" />

      <main className="py-10">
        <div className="container-base max-w-7xl">
          <section className="mb-8 reveal-soft">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-1">Professional Network</p>
            <h2 className="text-5xl leading-[0.9]">Build Career Relationships</h2>
            <p className="text-muted-foreground mt-2">Grow your circle with meaningful connections, incoming invites, and tailored recommendations.</p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 reveal-soft reveal-soft-delay-1">
            <Card className="panel-soft subtle-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Connections</p>
                  <UserCheck className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <p className="text-4xl leading-none mt-2">{source.connections.length}</p>
              </CardContent>
            </Card>
            <Card className="panel-soft subtle-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Incoming Requests</p>
                  <Inbox className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <p className="text-4xl leading-none mt-2">{source.incoming.length}</p>
              </CardContent>
            </Card>
            <Card className="panel-soft subtle-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Recommended</p>
                  <Compass className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <p className="text-4xl leading-none mt-2">{source.recommended.length}</p>
              </CardContent>
            </Card>
            <Card className="panel-soft subtle-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Pending Outgoing</p>
                  <UserPlus className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <p className="text-4xl leading-none mt-2">{source.outgoing.length}</p>
              </CardContent>
            </Card>
          </section>

          <section className="mb-6 reveal-soft reveal-soft-delay-2">
            <Card className="panel-soft">
              <CardHeader>
                <CardTitle className="text-3xl">Find the Right People</CardTitle>
                <CardDescription>Client-side filters now; same query model can map directly to backend search params later.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto] gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="pl-9"
                    placeholder="Search by name, role, location, or skill"
                    aria-label="Search people"
                  />
                </div>

                <label className="sr-only" htmlFor="network-skill-filter">Skill filter</label>
                <select
                  id="network-skill-filter"
                  value={skillFilter}
                  onChange={(event) => setSkillFilter(event.target.value)}
                  className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm"
                >
                  <option value="all">All skills</option>
                  {skillOptions.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>

                <label className="sr-only" htmlFor="network-mutual-filter">Mutual filter</label>
                <select
                  id="network-mutual-filter"
                  value={mutualFilter}
                  onChange={(event) => setMutualFilter(parseMutualFilter(event.target.value))}
                  className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm"
                >
                  {mutualOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-[var(--color-primary)]/35 hover:bg-[var(--color-primary)]/10"
                >
                  <X className="w-4 h-4" />
                  Reset
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="reveal-soft reveal-soft-delay-3">
            <Card className="panel-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-3xl">Your Network Workspace</CardTitle>
                <CardDescription>Review accepted connections, triage incoming requests, and discover people worth meeting.</CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(parseTab(value))}>
                  <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex mb-5">
                    <TabsTrigger value="connections">Connections ({filteredConnections.length})</TabsTrigger>
                    <TabsTrigger value="incoming">Incoming ({filteredIncoming.length})</TabsTrigger>
                    <TabsTrigger value="recommended">Recommended ({filteredRecommended.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="connections" className="space-y-3">
                    {visibleConnections.length > 0 ? (
                      visibleConnections.map((person) => (
                        <article key={person.id} className="panel-soft subtle-lift p-4 bg-[var(--color-background)]/72">
                          <PersonCardMeta person={person} />
                          <div className="mt-4 pt-4 border-t border-[var(--color-border)]/70 flex items-center justify-between gap-2">
                            <Badge variant="secondary" className="bg-[var(--color-primary)]/12 text-[var(--color-foreground)]">Connected</Badge>
                            <span className="text-xs text-muted-foreground">Relationship healthy</span>
                          </div>
                        </article>
                      ))
                    ) : (
                      <TabEmptyState
                        icon={UserCheck}
                        title="No connections match your filters"
                        description="Adjust filters to find existing connections or accept incoming requests to grow your network."
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="incoming" className="space-y-3">
                    {visibleIncoming.length > 0 ? (
                      visibleIncoming.map((person) => {
                        const isBusy = pendingAction === `accept-${person.id}` || pendingAction === `ignore-${person.id}`;

                        return (
                          <article key={person.id} className="panel-soft subtle-lift p-4 bg-[var(--color-background)]/72">
                            <PersonCardMeta person={person} />
                            <div className="mt-4 pt-4 border-t border-[var(--color-border)]/70 flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)]"
                                onClick={() => handleAcceptIncoming(person.id)}
                                disabled={isBusy}
                              >
                                {pendingAction === `accept-${person.id}` ? "Accepting..." : "Accept"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-[var(--color-primary)]/35 hover:bg-[var(--color-primary)]/10"
                                onClick={() => handleIgnoreIncoming(person.id)}
                                disabled={isBusy}
                              >
                                {pendingAction === `ignore-${person.id}` ? "Ignoring..." : "Ignore"}
                              </Button>
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <TabEmptyState
                        icon={Inbox}
                        title="No incoming requests right now"
                        description="You’re all caught up. New requests will show here when people want to connect."
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="recommended" className="space-y-3">
                    {visibleRecommended.length > 0 ? (
                      visibleRecommended.map((person) => {
                        const isBusy = pendingAction === `connect-${person.id}` || pendingAction === `dismiss-${person.id}`;

                        return (
                          <article key={person.id} className="panel-soft subtle-lift p-4 bg-[var(--color-background)]/72">
                            <PersonCardMeta person={person} />
                            <div className="mt-4 pt-4 border-t border-[var(--color-border)]/70 flex flex-wrap items-center gap-2">
                              <Button
                                size="sm"
                                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)]"
                                onClick={() => handleConnectRecommended(person.id)}
                                disabled={isBusy}
                              >
                                {pendingAction === `connect-${person.id}` ? "Sending..." : "Connect"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-[var(--color-primary)]/35 hover:bg-[var(--color-primary)]/10"
                                onClick={() => handleDismissRecommended(person.id)}
                                disabled={isBusy}
                              >
                                {pendingAction === `dismiss-${person.id}` ? "Dismissing..." : "Dismiss"}
                              </Button>
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <TabEmptyState
                        icon={Sparkles}
                        title="No recommendations left"
                        description="You’ve reviewed your current recommendations. More suggestions will appear as your network evolves."
                      />
                    )}
                  </TabsContent>
                </Tabs>

                {canLoadMore && (
                  <div className="pt-5 flex justify-center">
                    <Button
                      variant="outline"
                      className="border-[var(--color-primary)]/35 hover:bg-[var(--color-primary)]/10"
                      onClick={() => handleLoadMore(activeTab)}
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
