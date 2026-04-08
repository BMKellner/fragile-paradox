"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type NetworkProfile = {
  id: string;
  name: string;
  headline: string;
  tags: string[];
  websiteUrl: string;
  template: string;
  location?: string;
};

const STORAGE_KEY = "foliage-networking-following-v1";

const EXAMPLE_PROFILES: NetworkProfile[] = [
  {
    id: "b-automations",
    name: "B Automations",
    headline: "Enterprise automation solutions powered by AI.",
    tags: ["Automation", "AI", "Ops", "Dashboards"],
    websiteUrl: "/networking/demo/1",
    template: "Modern Minimal",
    location: "Delaware / Remote",
  },
  {
    id: "mira-chen",
    name: "Mira Chen",
    headline: "Product engineer building beautiful, fast web experiences.",
    tags: ["React", "Next.js", "Design Systems"],
    websiteUrl: "/networking/demo/2",
    template: "Classic Professional",
    location: "NYC",
  },
  {
    id: "santiago-ortiz",
    name: "Santiago Ortiz",
    headline: "Data + ML engineer. Real-world pipelines, measurable outcomes.",
    tags: ["ML", "Data", "Python", "Postgres"],
    websiteUrl: "/networking/demo/9",
    template: "Bold Brand",
    location: "Austin",
  },
  {
    id: "aisha-khan",
    name: "Aisha Khan",
    headline: "Security-focused full stack developer shipping reliable systems.",
    tags: ["Security", "Full Stack", "Cloud"],
    websiteUrl: "/networking/demo/7",
    template: "IDE Clean",
    location: "Seattle",
  },
];

function loadFollowing(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveFollowing(value: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(value)));
  } catch {
    // ignore
  }
}

export default function NetworkingPage() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [following, setFollowing] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setFollowing(loadFollowing());
  }, []);

  useEffect(() => {
    saveFollowing(following);
  }, [following]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    EXAMPLE_PROFILES.forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXAMPLE_PROFILES.filter((p) => {
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.headline} ${p.tags.join(" ")} ${p.template} ${p.location ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, activeTag]);

  const followingList = useMemo(
    () => EXAMPLE_PROFILES.filter((p) => following.has(p.id)),
    [following]
  );

  const toggleFollow = (id: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen">
      <Header currentPage="networking" />

      <main className="container-base py-8 space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl leading-[1.2] font-bold">Networking</h2>
          <p className="text-muted-foreground">
            Frontend-only demo of a “discover + follow + visit” networking experience. (We can wire this to your backend later.)
          </p>
        </div>

        <Tabs defaultValue="discover">
          <TabsList>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="w-full md:max-w-lg">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search people, tags, templates, locations…"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={activeTag === null ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setActiveTag(null)}
                  >
                    All
                  </Badge>
                  {allTags.slice(0, 10).map((tag) => (
                    <Badge
                      key={tag}
                      variant={activeTag === tag ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setActiveTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => {
                  const isFollowing = following.has(p.id);
                  return (
                    <Card key={p.id} className="py-5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{p.name}</CardTitle>
                        <div className="text-sm text-muted-foreground">{p.headline}</div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {p.tags.map((t) => (
                            <Badge key={t} variant="secondary">
                              {t}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                          <span>
                            <span className="font-medium text-foreground/80">Template:</span> {p.template}
                          </span>
                          {p.location ? (
                            <span>
                              <span className="font-medium text-foreground/80">Location:</span> {p.location}
                            </span>
                          ) : null}
                        </div>
                      </CardContent>

                      <CardFooter className="gap-2">
                        <Button
                          variant={isFollowing ? "outline" : "default"}
                          onClick={() => toggleFollow(p.id)}
                        >
                          {isFollowing ? "Following" : "Follow"}
                        </Button>
                        <Button asChild variant="secondary">
                          <a href={p.websiteUrl} target="_blank" rel="noreferrer">
                            Visit Website
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="following">
            {followingList.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {followingList.map((p) => (
                  <Card key={p.id} className="py-5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{p.name}</CardTitle>
                      <div className="text-sm text-muted-foreground">{p.headline}</div>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button variant="outline" onClick={() => toggleFollow(p.id)}>
                        Unfollow
                      </Button>
                      <Button asChild variant="secondary">
                        <a href={p.websiteUrl} target="_blank" rel="noreferrer">
                          Visit Website
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="py-5">
                <CardContent className="text-sm text-muted-foreground">
                  You’re not following anyone yet. Go to <span className="font-medium text-foreground">Discover</span> to
                  follow some example profiles.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="examples">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="py-5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">What ships now (frontend)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <div>- Discover directory with search + tag filters</div>
                  <div>- Follow/unfollow saved to localStorage</div>
                  <div>- Visit website CTA</div>
                </CardContent>
              </Card>

              <Card className="py-5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">What we can wire next (backend)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <div>- Real user directory from Supabase</div>
                  <div>- Public portfolio URLs + templates</div>
                  <div>- Follows, likes, comments, DMs</div>
                  <div>- “Connect” suggestions based on tags/templates</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

