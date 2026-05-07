export type MobileChallenge = {
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

export type MobileBootstrap = {
  apiVersion: number;
  generatedAt: string;
  product: {
    name: string;
    canonicalUrl: string;
    supportUrl: string;
    termsUrl: string;
  };
  mobile: {
    minimumSupportedApiVersion: number;
    recommendedUpdatePolicy: string;
  };
  challenges: MobileChallenge[];
};
