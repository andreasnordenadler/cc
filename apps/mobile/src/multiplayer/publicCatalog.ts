import type { MobileGroupQuestSummary } from "../types/sqc";

type SignedOutCatalogBootstrap = {
  multiplayerCatalog?: {
    status: "available" | "unavailable";
    officialGroupQuests: MobileGroupQuestSummary[];
    communityGroupQuests: MobileGroupQuestSummary[];
  };
};

export function getSignedOutPublicMultiplayerCatalog(bootstrap: SignedOutCatalogBootstrap) {
  return {
    status: bootstrap.multiplayerCatalog?.status ?? "unavailable",
    official: bootstrap.multiplayerCatalog?.officialGroupQuests ?? [],
    community: bootstrap.multiplayerCatalog?.communityGroupQuests ?? [],
  } as const;
}

export function findSignedOutPublicMultiplayerQuest(quests: MobileGroupQuestSummary[], id: string | null | undefined) {
  if (!id) return null;
  return quests.find((quest) => quest.id === id) ?? null;
}
