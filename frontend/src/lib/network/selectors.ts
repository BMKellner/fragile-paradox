import type { NetworkPerson, NetworkSnapshot } from "@/lib/network/network";

export type MutualFilterOption = "all" | "3" | "5" | "10";

export type NetworkFilters = {
  query: string;
  skill: string;
  mutual: MutualFilterOption;
};

function toNeedle(value: string): string {
  return value.trim().toLowerCase();
}

function parseMutualMinimum(mutual: MutualFilterOption): number {
  if (mutual === "all") {
    return 0;
  }

  const parsed = Number(mutual);
  return Number.isFinite(parsed) ? parsed : 0;
}

function matchesSearch(person: NetworkPerson, query: string): boolean {
  const needle = toNeedle(query);
  if (!needle) {
    return true;
  }

  const haystack = [
    person.fullName,
    person.headline,
    person.location ?? "",
    person.sharedSkills.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

function matchesSkill(person: NetworkPerson, skillFilter: string): boolean {
  if (!skillFilter || skillFilter === "all") {
    return true;
  }

  const normalized = skillFilter.toLowerCase();
  return person.sharedSkills.some((skill) => skill.toLowerCase() === normalized);
}

function matchesMutual(person: NetworkPerson, mutualFilter: MutualFilterOption): boolean {
  const minimum = parseMutualMinimum(mutualFilter);
  return person.mutualCount >= minimum;
}

export function filterPeople(people: NetworkPerson[], filters: NetworkFilters): NetworkPerson[] {
  return people.filter(
    (person) =>
      matchesSearch(person, filters.query) &&
      matchesSkill(person, filters.skill) &&
      matchesMutual(person, filters.mutual)
  );
}

export function paginatePeople(people: NetworkPerson[], pageSize: number): NetworkPerson[] {
  return people.slice(0, pageSize);
}

export function collectSkillFilters(snapshot: NetworkSnapshot): string[] {
  const values = new Set<string>();

  const all = [
    ...snapshot.connections,
    ...snapshot.incoming,
    ...snapshot.recommended,
    ...snapshot.outgoing,
  ];

  all.forEach((person) => {
    person.sharedSkills.forEach((skill) => values.add(skill));
  });

  return [...values].sort((a, b) => a.localeCompare(b));
}
