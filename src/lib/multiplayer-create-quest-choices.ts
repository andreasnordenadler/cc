import type { CustomSideQuest } from "./custom-side-quests";

export type MultiplayerCreateQuestChoice = {
  id: string;
  title: string;
  summary: string;
  source: "official" | "custom" | "community";
  sourceLabel: string;
};

type OfficialQuestChoice = {
  id: string;
  title: string;
  objective: string;
};

type CommunityQuestChoice = CustomSideQuest & {
  creatorName?: string;
};

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
