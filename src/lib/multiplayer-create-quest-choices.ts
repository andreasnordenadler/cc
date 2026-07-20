import type { CustomSideQuest } from "./custom-side-quests";

export type MultiplayerCreateQuestChoice = {
  id: string;
  title: string;
  summary: string;
  source: "official" | "custom" | "community";
  sourceLabel: string;
};

export type MultiplayerCreateQuestSource = "official" | "community";

export function toggleMultiplayerCreateQuest(selectedIds: string[], questId: string) {
  if (selectedIds.includes(questId)) {
    return { selectedIds: selectedIds.filter((id) => id !== questId), error: null };
  }
  if (selectedIds.length >= 4) {
    return { selectedIds, error: "Choose up to 4 Side Quests. Remove one before adding another." };
  }
  return { selectedIds: [...selectedIds, questId], error: null };
}

export function getMultiplayerCreateQuestPicker({
  choices,
  source,
  selectedIds,
  selectedOnly,
  search,
  limit,
}: {
  choices: MultiplayerCreateQuestChoice[];
  source: MultiplayerCreateQuestSource;
  selectedIds: string[];
  selectedOnly: boolean;
  search: string;
  limit: number;
}) {
  const selected = new Set(selectedIds);
  const normalizedSearch = search.trim().toLowerCase();
  const matching = choices
    .filter((quest) => source === "official" ? quest.source === "official" : quest.source !== "official")
    .filter((quest) => !selectedOnly || selected.has(quest.id))
    .filter((quest) => !normalizedSearch || `${quest.title} ${quest.summary} ${quest.sourceLabel}`.toLowerCase().includes(normalizedSearch));
  const pageLimit = Math.max(0, limit);

  return {
    visible: matching.slice(0, pageLimit),
    hiddenCount: Math.max(0, matching.length - pageLimit),
    officialCount: choices.filter((quest) => quest.source === "official").length,
    communityCount: choices.filter((quest) => quest.source !== "official").length,
  };
}

type OfficialQuestChoice = {
  id: string;
  title: string;
  objective: string;
};

type CommunityQuestChoice = CustomSideQuest & {
  creatorName?: string;
};

export function selectCommunityCreateChoices(quests: CommunityQuestChoice[], requestedId: string | undefined, limit = 80) {
  const browse = quests.slice(0, Math.max(0, limit));
  if (!requestedId || browse.some((quest) => quest.id === requestedId)) return browse;
  const requested = quests.find((quest) => quest.id === requestedId);
  return requested ? [...browse, requested] : browse;
}

export async function loadMultiplayerCreateQuestChoices({
  official,
  owned,
  loadCommunity,
}: {
  official: OfficialQuestChoice[];
  owned: CustomSideQuest[];
  loadCommunity: () => Promise<CommunityQuestChoice[]>;
}) {
  try {
    const community = await loadCommunity();
    return {
      choices: buildMultiplayerCreateQuestChoices({ official, owned, community }),
      communityUnavailable: false,
    };
  } catch {
    return {
      choices: buildMultiplayerCreateQuestChoices({ official, owned, community: [] }),
      communityUnavailable: true,
    };
  }
}

export function buildMultiplayerCreateQuestChoices({
  official,
  owned,
  community,
}: {
  official: OfficialQuestChoice[];
  owned: CustomSideQuest[];
  community: CommunityQuestChoice[];
}): MultiplayerCreateQuestChoice[] {
  const choices = new Map<string, MultiplayerCreateQuestChoice>();

  for (const quest of official) {
    choices.set(quest.id, {
      id: quest.id,
      title: quest.title,
      summary: quest.objective,
      source: "official",
      sourceLabel: "SQC Official",
    });
  }

  for (const quest of owned) {
    if ((quest.lifecycle ?? "published") !== "published") continue;
    choices.set(quest.id, {
      id: quest.id,
      title: quest.title,
      summary: quest.summary,
      source: "custom",
      sourceLabel: quest.visibility === "public" ? "Your public" : "Your private",
    });
  }

  for (const quest of community) {
    if ((quest.lifecycle ?? "published") !== "published" || quest.visibility !== "public" || choices.has(quest.id)) continue;
    choices.set(quest.id, {
      id: quest.id,
      title: quest.title,
      summary: quest.summary,
      source: "community",
      sourceLabel: quest.creatorName ? `Community · ${quest.creatorName}` : "Community",
    });
  }

  return Array.from(choices.values());
}
