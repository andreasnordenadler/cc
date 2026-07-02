import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { CHALLENGES } from "@/lib/challenges";
import { getCommunityLikeSummaries } from "@/lib/community-likes";
import { listPublicCommunitySideQuests } from "@/lib/community-side-quests";
import { listPublicGroupQuests } from "@/lib/groupquests";

type MobileDiscoveryChoice = {
  id: string;
  label: string;
  copy: string;
  cta: string;
  challengeId: string;
};

type MobileDiscoveryGroup = {
  id: string;
  title: string;
  copy: string;
  challengeIds: string[];
};

type MobileChallengeCard = {
  id: string;
  title: string;
  objective: string;
  instruction: string;
  openingHint: string;
  reward: number;
  category: string;
  difficulty: string;
  completionRate: string;
  flavor: string;
  badge: string;
  proofCallout: string;
  rules: string[];
  conditions: string[];
  requirement: {
    side: string;
    result: string;
  };
  badgeIdentity: {
    name: string;
    motif: string;
    rarity: string;
    unlockCopy: string;
    imageUrl: string | null;
    colors: {
      primary: string;
      secondary: string;
      glow: string;
    };
    heraldry: {
      shield: string;
      charge: string;
      crest: string;
      motto: string;
      meaning: string;
      weirdness: string;
    };
  };
};

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  const challengeIds = new Set(CHALLENGES.map((challenge) => challenge.id));
  const suggestedPath = buildSuggestedPath(challengeIds);
  const randomPoolIds = CHALLENGES
    .filter((challenge) => !challenge.id.includes("coming-soon"))
    .map((challenge) => challenge.id);
  const questHubGroups = buildQuestHubGroups(challengeIds);
  const publicCommunitySideQuests = await getPublicCommunitySideQuestsForMobile(baseUrl);

  return NextResponse.json({
    apiVersion: 1,
    generatedAt: new Date().toISOString(),
    product: {
      name: "Side Quest Chess",
      canonicalUrl: "https://sidequestchess.com",
      supportUrl: "https://sidequestchess.com/support",
      termsUrl: "https://sidequestchess.com/terms",
    },
    mobile: {
      minimumSupportedApiVersion: 1,
      recommendedUpdatePolicy: "app follows backend quest/catalog/proof state; app update only required for native shell or contract changes",
    },
    discovery: {
      suggestedPath,
      randomPoolIds,
      questHubGroups,
    },
    challenges: CHALLENGES.map((challenge): MobileChallengeCard => ({
      id: challenge.id,
      title: challenge.title,
      objective: challenge.objective,
      instruction: challenge.instruction,
      openingHint: challenge.openingHint,
      reward: challenge.reward,
      category: challenge.category,
      difficulty: challenge.difficulty,
      completionRate: challenge.completionRate,
      flavor: challenge.flavor,
      badge: challenge.badge,
      proofCallout: challenge.proofCallout,
      rules: challenge.rules,
      conditions: challenge.conditions,
      requirement: challenge.requirement,
      badgeIdentity: {
        name: challenge.badgeIdentity.name,
        motif: challenge.badgeIdentity.motif,
        rarity: challenge.badgeIdentity.rarity,
        unlockCopy: challenge.badgeIdentity.unlockCopy,
        imageUrl: challenge.badgeIdentity.image ? new URL(challenge.badgeIdentity.image, baseUrl).toString() : null,
        colors: challenge.badgeIdentity.colors,
        heraldry: challenge.badgeIdentity.heraldry,
      },
    })),
    communitySideQuests: publicCommunitySideQuests,
  });
}

async function getPublicCommunitySideQuestsForMobile(baseUrl: string) {
  try {
    const client = await clerkClient();
    const [publicGroupQuests, likeSummaries] = await Promise.all([
      listPublicGroupQuests(client),
      getCommunityLikeSummaries(client, null),
    ]);
    const quests = await listPublicCommunitySideQuests(client, { limit: 80, groupQuests: publicGroupQuests });

    return quests.map((quest) => ({
      id: quest.id,
      title: quest.title,
      summary: quest.summary,
      config: quest.config,
      visibility: quest.visibility,
      lifecycle: quest.lifecycle,
      createdAt: quest.createdAt,
      updatedAt: quest.updatedAt,
      badgeImageUrl: quest.badgeImageUrl ? new URL(quest.badgeImageUrl, baseUrl).toString() : null,
      creatorName: quest.creatorName,
      ownedByYou: false,
      stats: quest.stats,
      likeSummary: likeSummaries.get("solo", quest.id),
    }));
  } catch (error) {
    console.warn("mobile bootstrap community catalog unavailable", { error });
    return [];
  }
}


function buildSuggestedPath(challengeIds: Set<string>): MobileDiscoveryChoice[] {
  return [
    {
      id: "cautiously-heroic",
      label: "Cautiously heroic",
      copy: "I want chaos, but survivable.",
      cta: "Start with Knights Before Coffee",
      challengeId: "knights-before-coffee",
    },
    {
      id: "recklessly-meaningful",
      label: "Recklessly meaningful",
      copy: "I can handle one objectively bad idea.",
      cta: "Try No Castle Club",
      challengeId: "no-castle-club",
    },
    {
      id: "historically-unwise",
      label: "Historically unwise",
      copy: "I am here to become a cautionary tale.",
      cta: "Lose the queen, win anyway",
      challengeId: "queen-never-heard-of-her",
    },
  ].filter((choice) => challengeIds.has(choice.challengeId));
}

function buildQuestHubGroups(challengeIds: Set<string>): MobileDiscoveryGroup[] {
  return [
    {
      id: "recommended-start",
      title: "Recommended starting path",
      copy: "Start here when you want SQC to pick a sensible first bad idea.",
      challengeIds: ["knights-before-coffee", "no-castle-club", "finish-any-game"],
    },
    {
      id: "streamer-hard",
      title: "Streamer-hard lane",
      copy: "Harder quests built for clip-worthy attempts, not quiet dignity.",
      challengeIds: ["queen-never-heard-of-her", "knightmare-mode", "rookless-rampage"],
    },
    {
      id: "quick-proof",
      title: "Quick proof loop",
      copy: "Good candidates when you want to test pick, play, prove, collect quickly.",
      challengeIds: ["finish-any-game", "knights-before-coffee"],
    },
  ]
    .map((group) => ({ ...group, challengeIds: group.challengeIds.filter((id) => challengeIds.has(id)) }))
    .filter((group) => group.challengeIds.length > 0);
}
