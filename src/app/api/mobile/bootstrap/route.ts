import { NextResponse } from "next/server";
import { CHALLENGES } from "@/lib/challenges";

export const runtime = "edge";

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
  });
}
