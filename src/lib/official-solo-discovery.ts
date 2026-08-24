import type { Challenge } from "./challenges";

export function filterOfficialSideQuests(challenges: readonly Challenge[], query: string | null | undefined): Challenge[] {
  const terms = query?.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean) ?? [];
  if (!terms.length) return [...challenges];

  return challenges.filter((challenge) => {
    const searchableText = [
      challenge.title,
      challenge.objective,
      challenge.instruction,
      challenge.category,
      challenge.difficulty,
      challenge.openingHint,
      challenge.flavor,
      ...challenge.rules,
      ...challenge.conditions,
    ].join(" ").toLocaleLowerCase();
    return terms.every((term) => searchableText.includes(term));
  });
}
