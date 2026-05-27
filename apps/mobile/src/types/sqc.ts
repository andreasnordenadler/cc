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

export type MobileAccountState = {
  apiVersion: number;
  authenticated: true;
  generatedAt: string;
  profile: {
    displayName: string;
    bio: string;
    imageUrl: string | null;
    email: string | null;
    lastSignInAt: string | null;
  };
  chessAccounts: {
    lichessUsername: string | null;
    chessComUsername: string | null;
    hasAny: boolean;
  };
  progress: {
    completedChallengeIds: string[];
    totalCompletedChallenges: number;
    totalRewardPoints: number;
    proofReceiptCount: number;
  };
  activeQuest: {
    id: string;
    title: string;
    status: string;
    startedAt: string | null;
    verifiedAt: string | null;
    completed: boolean;
    banner: string;
    href: string;
    proofHref: string | null;
    badgeImageUrl: string | null;
  } | null;
  activeGroupQuests: Array<{
    id: string;
    title: string;
    status: string;
    copy: string;
    href: string;
    playersLabel?: string;
    timeLeftLabel?: string;
    positionLabel?: string;
    pointsLabel?: string;
    verifiedLabel?: string;
    official?: boolean;
    questIds?: string[];
    questTitles?: string[];
    completedQuestTitles?: string[];
    ruleRows?: Array<{ label: string; value: string }>;
    leaderboardRows?: Array<{
      rank: string;
      name: string;
      provider: string;
      points: string;
      verified: string;
      note: string;
    }>;
  }>;
  publicUserGroupQuests?: Array<{
    id: string;
    title: string;
    status: string;
    copy: string;
    href: string;
    playersLabel?: string;
    timeLeftLabel?: string;
    positionLabel?: string;
    joinState?: "Join" | "Joined";
    pointsLabel?: string;
    verifiedLabel?: string;
    official?: boolean;
    private?: boolean;
    questIds?: string[];
    questTitles?: string[];
    completedQuestTitles?: string[];
    ruleRows?: Array<{ label: string; value: string }>;
    leaderboardRows?: Array<{
      rank: string;
      name: string;
      provider: string;
      points: string;
      verified: string;
      note: string;
    }>;
  }>;
  officialPublicGroupQuests?: Array<{
    id: string;
    title: string;
    status: string;
    copy: string;
    href: string;
    playersLabel?: string;
    timeLeftLabel?: string;
    positionLabel?: string;
    joinState?: "Join" | "Joined";
    pointsLabel?: string;
    verifiedLabel?: string;
    official?: boolean;
    questIds?: string[];
    questTitles?: string[];
    completedQuestTitles?: string[];
    ruleRows?: Array<{ label: string; value: string }>;
    leaderboardRows?: Array<{
      rank: string;
      name: string;
      provider: string;
      points: string;
      verified: string;
      note: string;
    }>;
  }>;
  completedQuests: Array<{
    id: string;
    title: string;
    reward: number;
    badgeName: string;
    completedAt: string | null;
    href: string;
    proofHref: string | null;
    badgeImageUrl: string | null;
  }>;
  multiplayerTrophies?: Array<{
    id: string;
    title: string;
    placement: "Gold" | "Silver" | "Bronze";
    rankLabel: string;
    completedAt: string | null;
    href: string;
  }>;
  latestReceipt: {
    id: string | null;
    challengeId: string | null;
    provider: string | null;
    status: string | null;
    gameId: string | null;
    checkedAt: string | null;
    completedGameAt: string | null;
    headline: string;
    detail: string;
    meta: string;
    proofHref: string | null;
    proofImageUrl: string | null;
  } | null;
};

export type MobileAccountSignedOut = {
  apiVersion: number;
  authenticated: false;
  signInUrl: string;
  message: string;
};

export type MobileAccountResponse = MobileAccountState | MobileAccountSignedOut;

export type MobileProfileUpdateResponse = {
  apiVersion: number;
  authenticated: boolean;
  ok?: boolean;
  message: string;
  chessAccounts?: {
    lichessUsername: string | null;
    chessComUsername: string | null;
    previousLichessUsername?: string | null;
    previousChessComUsername?: string | null;
    hasAny: boolean;
  };
};

export type MobileQuestActionResponse = {
  apiVersion: number;
  authenticated: boolean;
  ok?: boolean;
  action?: string;
  challengeId?: string;
  message: string;
};

export type MobileGroupQuestActionResponse = {
  apiVersion: number;
  authenticated: boolean;
  ok?: boolean;
  action?: "join" | "leave" | "refresh" | "create";
  groupQuestId?: string;
  message: string;
  href?: string;
  inviteKey?: string | null;
  completedQuestIds?: string[];
  score?: number;
  checks?: Array<{
    questId: string;
    status: string;
    summary: string;
    gameId: string | null;
  }>;
};
