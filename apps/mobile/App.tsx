/* eslint-disable jsx-a11y/alt-text */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ClerkProvider, useAuth, useClerk, useSSO, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getApiBaseUrl, fetchMobileAccountState, fetchMobileBootstrap, updateMobileChessUsernames } from "./src/api/sqc";
import { clerkPublishableKey, clerkTokenCache, isClerkMobileAuthConfigured } from "./src/auth/clerk";
import { OFFLINE_MOBILE_BOOTSTRAP } from "./src/data/offlineBootstrap";
import type { MobileAccountResponse, MobileAccountState, MobileBootstrap, MobileChallenge } from "./src/types/sqc";

type AppTab = "home" | "sideQuests" | "coatOfArms" | "account";

type MobileShellState = {
  bootstrap: MobileBootstrap | null;
  account: MobileAccountResponse | null;
  selectedChallengeId: string | null;
  activeTab: AppTab;
  loading: boolean;
  refreshing: boolean;
  catalogMode: "live" | "offline";
  catalogNotice: string | null;
};

type MobileAuthBridge = {
  configured: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  getSessionToken: () => Promise<string | null>;
  startGoogleSignIn?: () => Promise<void>;
  signOut?: () => Promise<void>;
  signedInLabel: string | null;
};

const MOBILE_ACCOUNT_FALLBACK: MobileAccountResponse = {
  apiVersion: 1,
  authenticated: false,
  signInUrl: "https://sidequestchess.com/sign-in",
  message: "Public quest catalog is available. Website account sync turns on when mobile sign-in is configured.",
};

WebBrowser.maybeCompleteAuthSession();


const CHALLENGE_COAT_IMAGE_PATHS: Record<string, string> = {
  "finish-any-game": "/badges/v6/proof-loop-test-badge.png",
  "knights-before-coffee": "/badges/v6/knights-before-coffee-badge.png",
  "bishop-field-trip": "/badges/v6/bishop-field-trip-badge.png",
  "early-king-walk": "/badges/v6/early-king-walk-badge.png",
  "pawn-only-picnic": "/badges/v7/coming-soon-clean/pawn-only-picnic-badge.png",
  "queen-never-heard-of-her": "/badges/v4/queen-never-heard-of-her.png",
  "no-castle-club": "/badges/v4/no-castle-club-badge.png",
  "the-blunder-gambit": "/badges/v4/the-blunder-gambit-badge.png",
  "knightmare-mode": "/badges/v4/knightmare-mode-badge.png",
};

const RECOMMENDED_START_CHALLENGE_IDS = ["knights-before-coffee", "no-castle-club", "queen-never-heard-of-her"];
const LIVE_STREAMER_HARD_QUEST_IDS = ["queen-never-heard-of-her", "knightmare-mode", "rookless-rampage"];

const mobileOAuthRedirectUrl = AuthSession.makeRedirectUri({
  scheme: "sidequestchess",
  path: "sso-callback",
});

const TABS: Array<
  | { id: AppTab; label: string; iconKind: "image"; imagePath: string }
  | { id: AppTab; label: string; iconKind: "vector"; iconName: keyof typeof MaterialCommunityIcons.glyphMap }
> = [
  { id: "home", label: "Home", iconKind: "image", imagePath: "/brand/sqc-alt-logo-topbar-20260507-v2.png" },
  { id: "sideQuests", label: "Side Quests", iconKind: "vector", iconName: "chess-knight" },
  { id: "coatOfArms", label: "Coat of Arms", iconKind: "image", imagePath: "/badges/v6/proof-loop-test-badge.png" },
  { id: "account", label: "Account", iconKind: "vector", iconName: "account-circle" },
];

export default function App() {
  return (
    <SafeAreaProvider>
      {isClerkMobileAuthConfigured() ? (
        <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={clerkTokenCache}>
          <ClerkMobileShell />
        </ClerkProvider>
      ) : (
        <MobileShell authBridge={signedOutAuthBridge} />
      )}
    </SafeAreaProvider>
  );
}

function ClerkMobileShell() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const signedInLabel = user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || null;

  const startGoogleSignIn = useCallback(async () => {
    const { createdSessionId, setActive } = await startSSOFlow({
      strategy: "oauth_google",
      redirectUrl: mobileOAuthRedirectUrl,
    });

    if (createdSessionId && setActive) {
      await setActive({ session: createdSessionId });
    }
  }, [startSSOFlow]);

  const authBridge = useMemo<MobileAuthBridge>(
    () => ({
      configured: true,
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      getSessionToken: async () => getToken(),
      startGoogleSignIn,
      signOut,
      signedInLabel,
    }),
    [getToken, isLoaded, isSignedIn, signOut, signedInLabel, startGoogleSignIn],
  );

  return <MobileShell authBridge={authBridge} />;
}

const signedOutAuthBridge: MobileAuthBridge = {
  configured: false,
  isLoaded: true,
  isSignedIn: false,
  getSessionToken: async () => null,
  signedInLabel: null,
};

function MobileShell({ authBridge }: { authBridge: MobileAuthBridge }) {
  const insets = useSafeAreaInsets();
  const [shell, setShell] = useState<MobileShellState>({
    bootstrap: null,
    account: null,
    selectedChallengeId: null,
    activeTab: "home",
    loading: true,
    refreshing: false,
    catalogMode: "live",
    catalogNotice: null,
  });

  const selectedChallenge = useMemo(() => {
    if (!shell.bootstrap) return null;
    return shell.bootstrap.challenges.find((challenge) => challenge.id === shell.selectedChallengeId) ?? shell.bootstrap.challenges[0] ?? null;
  }, [shell.bootstrap, shell.selectedChallengeId]);

  const loadBootstrap = useCallback(async ({ refresh = false } = {}) => {
    setShell((current) => ({ ...current, loading: !refresh, refreshing: refresh }));

    try {
      const nextBootstrap = await fetchMobileBootstrap();
      setShell((current) => ({
        ...current,
        bootstrap: nextBootstrap,
        account: current.account ?? MOBILE_ACCOUNT_FALLBACK,
        selectedChallengeId: current.selectedChallengeId ?? nextBootstrap.challenges[0]?.id ?? null,
        loading: false,
        refreshing: false,
        catalogMode: "live",
        catalogNotice: null,
      }));
    } catch (caught) {
      const offlineReason = caught instanceof Error ? caught.message : "Network request failed.";
      setShell((current) => ({
        ...current,
        bootstrap: current.bootstrap ?? OFFLINE_MOBILE_BOOTSTRAP,
        account: current.account ?? MOBILE_ACCOUNT_FALLBACK,
        selectedChallengeId: current.selectedChallengeId ?? OFFLINE_MOBILE_BOOTSTRAP.challenges[0]?.id ?? null,
        loading: false,
        refreshing: false,
        catalogMode: "offline",
        catalogNotice: offlineReason,
      }));
    }
  }, []);

  const loadAccount = useCallback(async () => {
    if (!authBridge.isLoaded) {
      setShell((current) => ({ ...current, account: current.account ?? MOBILE_ACCOUNT_FALLBACK }));
      return;
    }

    try {
      const sessionToken = authBridge.isSignedIn ? await authBridge.getSessionToken() : null;
      const nextAccount = await fetchMobileAccountState(sessionToken);
      setShell((current) => ({ ...current, account: nextAccount }));
    } catch {
      setShell((current) => ({ ...current, account: current.account ?? MOBILE_ACCOUNT_FALLBACK }));
    }
  }, [authBridge]);

  const refreshBoardAndAccount = useCallback(async () => {
    await Promise.all([loadBootstrap({ refresh: true }), loadAccount()]);
  }, [loadAccount, loadBootstrap]);

  useEffect(() => {
    const bootstrapTimer = setTimeout(() => void loadBootstrap(), 0);
    return () => clearTimeout(bootstrapTimer);
  }, [loadBootstrap]);

  useEffect(() => {
    const accountTimer = setTimeout(() => void loadAccount(), 0);
    return () => clearTimeout(accountTimer);
  }, [loadAccount]);

  function selectChallenge(challengeId: string, nextTab: AppTab = "sideQuests") {
    setShell((current) => ({ ...current, selectedChallengeId: challengeId, activeTab: nextTab }));
  }

  function selectTab(activeTab: AppTab) {
    setShell((current) => ({ ...current, activeTab }));
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} translucent={false} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: 118 + Math.max(insets.bottom, 16) }]}
        refreshControl={<RefreshControl tintColor="#f5c86a" refreshing={shell.refreshing} onRefresh={() => void refreshBoardAndAccount()} />}
      >
        {shell.loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#f5c86a" />
            <Text style={styles.muted}>Loading the live quest board…</Text>
          </View>
        ) : null}

        {shell.bootstrap && selectedChallenge ? (
          <ActiveScreen
            activeTab={shell.activeTab}
            bootstrap={shell.bootstrap}
            catalogMode={shell.catalogMode}
            selectedChallenge={selectedChallenge}
            account={shell.account}
            authBridge={authBridge}
            onSelectChallenge={selectChallenge}
            onSelectTab={selectTab}
            onAccountUpdated={() => void loadAccount()}
          />
        ) : null}
      </ScrollView>
      <BottomNav activeTab={shell.activeTab} bottomInset={insets.bottom} onSelectTab={selectTab} />
    </SafeAreaView>
  );

}

function HomeScreen({
  bootstrap,
  account,
  onSelectTab,
  onSelectChallenge,
}: {
  bootstrap: MobileBootstrap;
  account: MobileAccountResponse | null;
  onSelectTab: (tab: AppTab) => void;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
}) {
  const isSignedIn = isAuthenticatedAccount(account);
  const heroismChoices = [
    {
      label: "Cautiously heroic",
      copy: "I want chaos, but survivable.",
      cta: "Start with Knights Before Coffee",
      challengeId: "knights-before-coffee",
    },
    {
      label: "Recklessly meaningful",
      copy: "I can handle one objectively bad idea.",
      cta: "Try No Castle Club",
      challengeId: "no-castle-club",
    },
    {
      label: "Historically unwise",
      copy: "I am here to become a cautionary tale.",
      cta: "Lose the queen, win anyway",
      challengeId: "queen-never-heard-of-her",
    },
  ]
    .map((option) => {
      const challenge = bootstrap.challenges.find((candidate) => candidate.id === option.challengeId);
      return challenge ? { ...option, challenge } : null;
    })
    .filter((entry): entry is { label: string; copy: string; cta: string; challengeId: string; challenge: MobileChallenge } => Boolean(entry));

  return (
    <View style={styles.screenStack}>
      <View style={styles.homeHeroCard}>
        <Text style={styles.homeHeroTitle}>Chess, but with stupidly hard side quests — solo or multiplayer.</Text>
        <Text style={styles.homeHeroBody}>
          {isSignedIn
            ? "Pick a solo quest or join a Multiplayer Side Quest, play a real Lichess or Chess.com game, then come back for automatic proof."
            : "Sign in, connect your public chess usernames, choose one ridiculous solo quest or Multiplayer Side Quest, play on Lichess or Chess.com and let SQC check your latest public games."}
        </Text>
        <View style={styles.homeHeroActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go on a Solo Side Quest" testID="home-go-solo-side-quest" style={styles.primaryButtonWide} onPress={() => onSelectTab("sideQuests")}>
            <Text style={styles.primaryButtonText}>Go on a <Text style={styles.buttonEmphasis}>Solo</Text> Side Quest</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Join a Multiplayer Side Quest" testID="home-join-multiplayer-side-quest" style={styles.primaryButtonWide} onPress={() => void openExternalUrl(`${getApiBaseUrl()}/groupquests`)}>
            <Text style={styles.primaryButtonText}>Join a <Text style={styles.buttonEmphasis}>Multiplayer</Text> Side Quest</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.whereBeginCard}>
        <Text style={styles.eyebrow}>Where to begin</Text>
        <Text style={styles.sectionTitle}>How heroic are you feeling today?</Text>
        <Text style={styles.sectionBody}>Pick a starting quest based on your current tolerance for terrible chess decisions.</Text>
        <View style={styles.heroismChoiceList}>
          {heroismChoices.map(({ label, copy, cta, challenge }) => (
            <HeroismChoiceCard key={challenge.id} label={label} copy={copy} cta={cta} challenge={challenge} onPress={() => onSelectChallenge(challenge.id, "sideQuests")} />
          ))}
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Find your own path" testID="home-find-own-path" onPress={() => onSelectTab("sideQuests")}>
          <Text style={styles.heroismCustomPath}>Or go find your own path.</Text>
        </Pressable>
      </View>

      {!isSignedIn ? <WebsiteRitualCard /> : null}

      {!isSignedIn ? (
        <View style={styles.multiplayerCalloutCard}>
          <Text style={styles.eyebrow}>Multiplayer Side Quests</Text>
          <Text style={styles.sectionTitle}>Same nonsense, now with witnesses.</Text>
          <Text style={styles.sectionBody}>Join public Multiplayer Side Quests, inspect the rules before committing, or sign in when you want to create one and invite friends.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Join Multiplayer Side Quests" testID="home-join-multiplayer-callout" style={styles.secondaryButtonWide} onPress={() => void openExternalUrl(`${getApiBaseUrl()}/groupquests`)}>
            <Text style={styles.secondaryButtonText}>Join Multiplayer Side Quests</Text>
          </Pressable>
        </View>
      ) : null}

      {isSignedIn ? (
        <View style={styles.homeStatusCard}>
          <Text style={styles.eyebrow}>Active Solo Side Quest</Text>
          <Text style={styles.sectionTitle}>{account.activeQuest ? account.activeQuest.title : "No active solo quest yet."}</Text>
          <Text style={styles.sectionBody}>{account.activeQuest ? "Open the active quest page for rules, badge details, and the next weird chess side quest." : "Choose one solo quest first so My Side Quests knows which weird rule to judge after your next public game."}</Text>
          <View style={styles.scoreboardRow}>
            <BigScore label="Points" value={`${account.progress.totalRewardPoints}`} />
            <BigScore label="Coats" value={`${account.progress.totalCompletedChallenges}`} />
            <BigScore label="Proofs" value={`${account.progress.proofReceiptCount}`} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function HeroismChoiceCard({ label, copy, cta, challenge, onPress }: { label: string; copy: string; cta: string; challenge: MobileChallenge; onPress: () => void }) {
  const badgeUrl = getChallengeCoatImageUrl(challenge);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={cta} testID={`home-heroism-${challenge.id}`} style={styles.heroismChoiceCard} onPress={onPress}>
      <View style={styles.heroismBadgeFrame}>
        {badgeUrl ? <Image source={{ uri: badgeUrl }} style={styles.heroismBadgeImage} resizeMode="contain" /> : <Text style={styles.questListGlyph}>{challenge.badgeIdentity.motif}</Text>}
      </View>
      <View style={styles.heroismChoiceCopy}>
        <Text style={styles.heroismChoiceLabel}>{label}</Text>
        <Text style={styles.heroismChoiceSmall}>{copy}</Text>
        <Text style={styles.heroismChoiceCta}>{cta}</Text>
      </View>
    </Pressable>
  );
}

function WebsiteRitualCard({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.websiteRitualCard}>
      <Text style={styles.eyebrow}>WHAT HAPPENS AFTER SIGN-IN</Text>
      <Text style={styles.sectionTitle}>A tiny ritual, not another chess dashboard.</Text>
      {!compact ? <Text style={styles.sectionBody}>The app follows the same Side Quest Chess workflow as the website.</Text> : null}
      <View style={styles.websiteRitualSteps}>
        <FlowStep done title="Choose solo or multiplayer" body="Start one quest for yourself, or join a Multiplayer Side Quest when the bad idea deserves witnesses." />
        <FlowStep title="Play where you already play" body="Use a normal public Lichess or Chess.com game. Side Quest Chess never asks for chess-site passwords." />
        <FlowStep title="Get the receipt" body="The latest-game checker returns passed, failed, or pending with a shareable proof card, solo progress, and multiplayer leaderboard proof when relevant." />
      </View>
    </View>
  );
}
function BottomNav({ activeTab, bottomInset, onSelectTab }: { activeTab: AppTab; bottomInset: number; onSelectTab: (tab: AppTab) => void }) {
  return (
    <View style={[styles.bottomNavBar, { bottom: Math.max(bottomInset + 10, 14) }]}>
      {TABS.map((tab) => (
        <Pressable
          key={tab.id}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab.id }}
          accessibilityLabel={`Open ${tab.label}`}
          testID={`mobile-bottom-nav-${tab.id}`}
          style={[styles.bottomNavItem, activeTab === tab.id && styles.bottomNavItemActive]}
          onPress={() => onSelectTab(tab.id)}
        >
          {activeTab === tab.id ? <View style={styles.bottomNavActiveGlow} /> : null}
          <View style={[styles.bottomNavIconFrame, activeTab === tab.id && styles.bottomNavIconFrameActive]}>
            {tab.iconKind === "image" ? (
              <Image source={{ uri: absoluteAssetUrl(tab.imagePath) }} style={tab.id === "coatOfArms" ? styles.bottomNavCoatImage : styles.bottomNavLogoImage} resizeMode="contain" />
            ) : (
              <MaterialCommunityIcons name={tab.iconName} size={24} color={activeTab === tab.id ? colors.gold : colors.muted} />
            )}
          </View>
          <Text style={[styles.bottomNavText, activeTab === tab.id && styles.bottomNavTextActive]} numberOfLines={1}>{tab.label}</Text>
          {activeTab === tab.id ? <View style={styles.bottomNavActiveDot} /> : null}
        </Pressable>
      ))}
    </View>
  );
}
function ActiveScreen({
  activeTab,
  bootstrap,
  catalogMode,
  selectedChallenge,
  account,
  authBridge,
  onSelectChallenge,
  onSelectTab,
  onAccountUpdated,
}: {
  activeTab: AppTab;
  bootstrap: MobileBootstrap;
  catalogMode: "live" | "offline";
  selectedChallenge: MobileChallenge;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
  onSelectTab: (tab: AppTab) => void;
  onAccountUpdated: () => void;
}) {
  switch (activeTab) {
    case "home":
      return <HomeScreen bootstrap={bootstrap} account={account} onSelectTab={onSelectTab} onSelectChallenge={onSelectChallenge} />;
    case "sideQuests":
      return <SideQuestsScreen bootstrap={bootstrap} catalogMode={catalogMode} selectedChallenge={selectedChallenge} account={account} authBridge={authBridge} onSelectChallenge={onSelectChallenge} onSelectTab={onSelectTab} onAccountUpdated={onAccountUpdated} />;
    case "coatOfArms":
      return <CoatOfArmsScreen bootstrap={bootstrap} account={account} onSelectChallenge={onSelectChallenge} />;
    case "account":
      return <AccountShell bootstrap={bootstrap} account={account} authBridge={authBridge} onAccountUpdated={onAccountUpdated} />;
  }
}

function SideQuestsScreen({
  bootstrap,
  account,
  onSelectChallenge,
}: {
  bootstrap: MobileBootstrap;
  catalogMode: "live" | "offline";
  selectedChallenge: MobileChallenge;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
  onSelectTab: (tab: AppTab) => void;
  onAccountUpdated: () => void;
}) {
  const completedIds = new Set(isAuthenticatedAccount(account) ? account.completedQuests.map((quest) => quest.id) : []);
  const activeQuestId = isAuthenticatedAccount(account) && account.activeQuest && !account.activeQuest.completed ? account.activeQuest.id : null;
  const recommendedStartChallenges = getChallengesByIds(bootstrap, RECOMMENDED_START_CHALLENGE_IDS);
  const liveStreamerHardQuests = getChallengesByIds(bootstrap, LIVE_STREAMER_HARD_QUEST_IDS);

  return (
    <View style={styles.screenStack}>
      <View style={styles.sideQuestHubHero}>
        <Text style={styles.sideQuestHubTitle}>Pick your next bad idea.</Text>
        <Text style={styles.sideQuestHubCopy}>Side Quests is the hub: pick a Solo Side Quest for yourself, or start a Multiplayer Side Quest when the bad idea deserves witnesses.</Text>
      </View>

      <View style={styles.sideQuestModeGrid} accessibilityLabel="Side Quest modes">
        <View style={styles.sideQuestModeCard}>
          <Text style={styles.eyebrow}>Solo Side Quests</Text>
          <Text style={styles.sideQuestModeTitle}>One player. One ridiculous rule. One proof receipt.</Text>
          <Text style={styles.sideQuestModeCopy}>Choose from the live-backed deck, play on Lichess or Chess.com, then come back when the bad idea has evidence.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Browse Solo Side Quests" testID="sidequests-browse-solo" style={styles.primaryButton} onPress={() => undefined}>
            <Text style={styles.primaryButtonText}>Browse Solo Side Quests</Text>
          </Pressable>
        </View>

        <View style={[styles.sideQuestModeCard, styles.groupModeCard]}>
          <Text style={styles.eyebrow}>Multiplayer Side Quests</Text>
          <Text style={styles.sideQuestModeTitle}>Multiplayer. Same nonsense, now with witnesses.</Text>
          <Text style={styles.sideQuestModeCopy}>Create or join a Multiplayer Side Quest with shared rules, a proof window, a leaderboard, and multiplayer-valid proof separate from solo progress.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Open Multiplayer Side Quests" testID="sidequests-open-multiplayer" style={styles.primaryButton} onPress={() => void openExternalUrl(`${getApiBaseUrl()}/groupquests`)}>
            <Text style={styles.primaryButtonText}>Open Multiplayer Side Quests</Text>
          </Pressable>
        </View>
      </View>

      <QuestFilterPanel />
      <AvailableQuestGrid challenges={bootstrap.challenges} completedIds={completedIds} activeQuestId={activeQuestId} onSelectChallenge={onSelectChallenge} />

      <QuestSection
        eyebrow="Where to begin"
        title="Pick by how hard you want to go."
        body="Not sure where to start? Use one of these: easy, trouble, or full chaos. No separate path, no homework ladder — just choose the level of bad idea you want right now."
        challenges={recommendedStartChallenges}
        completedIds={completedIds}
        activeQuestId={activeQuestId}
        onSelectChallenge={onSelectChallenge}
      />

      <QuestSection
        eyebrow="Streamer-hard lane"
        title="Brutal is clip-worthy. Absurd is rated-only."
        body="Brutal quests are deliberately viral but still runnable in casual or rated public games. Absurd quests are the no-excuses ceiling: rated public games only, higher points, and proof that should feel ridiculous enough to screenshot."
        challenges={liveStreamerHardQuests}
        completedIds={completedIds}
        activeQuestId={activeQuestId}
        onSelectChallenge={onSelectChallenge}
      />
    </View>
  );
}

function getChallengesByIds(bootstrap: MobileBootstrap, ids: string[]) {
  return ids
    .map((challengeId) => bootstrap.challenges.find((challenge) => challenge.id === challengeId))
    .filter((challenge): challenge is MobileChallenge => Boolean(challenge));
}

function QuestFilterPanel() {
  return (
    <View style={styles.questFilterPanel} accessibilityLabel="Quest filters and sorting">
      <Text style={styles.questFilterTitle}>Find your next Side Quest.</Text>
      <View style={styles.questFilterGrid}>
        <FilterField label="Difficulty" value="All" />
        <FilterField label="Status" value="All" />
        <FilterField label="Sort" value="Recommended" />
        <Pressable accessibilityRole="button" accessibilityLabel="Reset filters" testID="quest-filter-reset" style={styles.filterResetButton} disabled>
          <Text style={styles.filterResetText}>Reset filters</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FilterField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.filterField}>
      <Text style={styles.filterLabel}>{label}</Text>
      <Text style={styles.filterValue}>{value} ▾</Text>
    </View>
  );
}

function AvailableQuestGrid({ challenges, completedIds, activeQuestId, onSelectChallenge }: { challenges: MobileChallenge[]; completedIds: Set<string>; activeQuestId: string | null; onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void }) {
  return (
    <View style={styles.availableQuestGrid} accessibilityLabel="Available quests">
      {challenges.map((challenge, index) => (
        <ChallengeCardMobile
          key={challenge.id}
          challenge={challenge}
          featured={index === 0}
          completed={completedIds.has(challenge.id)}
          active={activeQuestId === challenge.id}
          onPress={() => onSelectChallenge(challenge.id, "sideQuests")}
        />
      ))}
    </View>
  );
}

function QuestSection({ eyebrow, title, body, challenges, completedIds, activeQuestId, onSelectChallenge }: { eyebrow: string; title: string; body: string; challenges: MobileChallenge[]; completedIds: Set<string>; activeQuestId: string | null; onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void }) {
  return (
    <View style={styles.sideQuestSection}>
      <View style={styles.sectionHeadMobile}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionBody}>{body}</Text>
      <View style={styles.availableQuestGrid}>
        {challenges.map((challenge) => (
          <ChallengeCardMobile
            key={challenge.id}
            challenge={challenge}
            completed={completedIds.has(challenge.id)}
            active={activeQuestId === challenge.id}
            onPress={() => onSelectChallenge(challenge.id, "sideQuests")}
          />
        ))}
      </View>
    </View>
  );
}

function ChallengeCardMobile({ challenge, featured = false, completed = false, active = false, onPress }: { challenge: MobileChallenge; featured?: boolean; completed?: boolean; active?: boolean; onPress: () => void }) {
  const badgeUrl = getChallengeCoatImageUrl(challenge);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${challenge.title} quest`} accessibilityState={{ selected: active }} style={[styles.challengeCardMobile, featured && styles.challengeCardMobileFeatured, active && styles.challengeCardMobileActive, completed && styles.challengeCardMobileCompleted]} onPress={onPress}>
      {active && !completed ? <Text style={styles.activeQuestStampText}>Active quest</Text> : null}
      {completed ? <Text style={styles.completedQuestStampText}>Quest completed</Text> : null}
      <View style={styles.questCardMetaMobile}>
        <Text style={styles.questPointsMobile}>+{challenge.reward} pts</Text>
        <Text style={[styles.difficultyBadgeMobile, styles[`difficulty${challenge.difficulty}` as keyof typeof styles]]}>{challenge.difficulty}</Text>
      </View>
      <View style={styles.challengeCardTitleRowMobile}>
        <View style={styles.challengeCardBadgeMobile}>
          {badgeUrl ? <Image source={{ uri: badgeUrl }} style={styles.challengeCardBadgeImageMobile} resizeMode="contain" /> : <Text style={styles.questListGlyph}>{challenge.badgeIdentity.motif}</Text>}
        </View>
        <View style={styles.challengeCardCopyMobile}>
          <Text style={styles.challengeCardTitleMobile}>{challenge.title}</Text>
          <Text style={styles.challengeCardObjectiveMobile}>{challenge.objective}</Text>
          <Text style={styles.challengeCardHintMobile}>{challenge.openingHint}</Text>
        </View>
      </View>
    </Pressable>
  );
}


function AccountShell({
  bootstrap,
  account,
  authBridge,
  onAccountUpdated,
}: {
  bootstrap: MobileBootstrap;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onAccountUpdated: () => void;
}) {
  if (!isAuthenticatedAccount(account)) {
    const signedInButRejected = authBridge.isSignedIn && account?.authenticated === false;

    return (
      <View style={styles.screenStack}>
        <EmptyStateCard
          eyebrow="Account"
          title={signedInButRejected ? "Token is local; backend verification still needs help." : "Ready for your royal paperwork."}
          body={
            signedInButRejected
              ? "Google sign-in is local, but the website API did not accept the mobile token yet. The app stays usable while backend verification is finished."
              : "Use the website to sign in, connect chess usernames, and start real quests. This Android preview keeps catalog and reward views available until account sync is enabled."
          }
          facts={[
            ["Source", bootstrap.product.canonicalUrl],
            ["Local session", authBridge.isSignedIn ? "Signed in with Clerk Expo" : "Signed out / no mobile token"],
            ["Catalog", "Still available without auth"],
          ]}
        />
        <WebsiteHandoffCard
          title="Finish account setup on the website."
          body="Connect chess usernames, start a real quest, and let mobile mirror the verified website state."
          buttonLabel="Open account portal"
          url={`${getApiBaseUrl()}/account`}
        />
        <AccountSetupChecklistCard authBridge={authBridge} />
        <MobileAccountStatesCard authBridge={authBridge} account={account} />
      </View>
    );
  }

  return (
    <View style={styles.panelCard}>
      <Text style={styles.eyebrow}>Account</Text>
      <Text style={styles.cardTitle}>{account.profile.displayName}</Text>
      <Text style={styles.cardBody}>{account.profile.bio || "Your live backend-owned account state is now readable by mobile."}</Text>
      <View style={styles.scoreboardRow}>
        <BigScore label="Points" value={`${account.progress.totalRewardPoints}`} />
        <BigScore label="Coats" value={`${account.progress.totalCompletedChallenges}`} />
        <BigScore label="Proofs" value={`${account.progress.proofReceiptCount}`} />
      </View>
      <View style={styles.factGrid}>
        <Fact label="Lichess" value={account.chessAccounts.lichessUsername ?? "Not connected"} />
        <Fact label="Chess.com" value={account.chessAccounts.chessComUsername ?? "Not connected"} />
      </View>
      <ChessUsernameEditor account={account} authBridge={authBridge} onSaved={onAccountUpdated} />
      <QuestProgressStrip completed={account.progress.totalCompletedChallenges} total={bootstrap.challenges.length} />
      <AccountMomentumCard completed={account.progress.totalCompletedChallenges} total={bootstrap.challenges.length} />
      <MobileAccountStatesCard authBridge={authBridge} account={account} />
      <AccountNextActionsCard account={account} />
      <CompletedQuestShelf account={account} />
      <WebsiteHandoffCard
        title="Manage quests on the full board."
        body="The website remains the authority for account edits, proof submission, and share cards."
        buttonLabel="Open my account"
        url={`${getApiBaseUrl()}/account`}
      />
    </View>
  );
}
function CoatOfArmsScreen({
  bootstrap,
  account,
  onSelectChallenge,
}: {
  bootstrap: MobileBootstrap;
  account: MobileAccountResponse | null;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
}) {
  const earnedIds = new Set(isAuthenticatedAccount(account) ? account.completedQuests.map((quest) => quest.id) : []);
  const liveBadgeChallenges = bootstrap.challenges.filter((challenge) => getChallengeCoatImageUrl(challenge));

  return (
    <View style={styles.screenStack}>
      <View style={styles.badgesHeroCard}>
        <Text style={styles.badgesHeroTitle}>Every bad idea deserves a coat of arms.</Text>
        <View style={styles.liveCoatRoster} accessibilityLabel="Current live Side Quest Chess coats of arms">
          {liveBadgeChallenges.map((challenge) => (
            <LiveCoatRosterItem key={challenge.id} challenge={challenge} earned={earnedIds.has(challenge.id)} onPress={() => onSelectChallenge(challenge.id, "sideQuests")} />
          ))}
        </View>
      </View>

      <View style={styles.badgeMeaningList} accessibilityLabel="Live quest coat of arms meanings">
        {bootstrap.challenges.map((challenge) => (
          <BadgeMeaningCard key={challenge.id} challenge={challenge} earned={earnedIds.has(challenge.id)} onPress={() => onSelectChallenge(challenge.id, "sideQuests")} />
        ))}
      </View>
    </View>
  );
}

function LiveCoatRosterItem({ challenge, earned, onPress }: { challenge: MobileChallenge; earned: boolean; onPress: () => void }) {
  const badgeUrl = getChallengeCoatImageUrl(challenge);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${challenge.title} quest`} style={styles.liveCoatRosterItem} onPress={onPress}>
      <View style={[styles.liveCoatBadgeFrame, !earned && styles.liveCoatBadgeFrameLocked]}>
        {badgeUrl ? <Image source={{ uri: badgeUrl }} style={[styles.liveCoatBadgeImage, !earned && styles.liveCoatBadgeImageLocked]} resizeMode="contain" /> : <Text style={styles.questListGlyph}>{challenge.badgeIdentity.motif}</Text>}
      </View>
      <Text style={styles.liveCoatRosterTitle} numberOfLines={2}>{challenge.title}</Text>
    </Pressable>
  );
}

function BadgeMeaningCard({ challenge, earned, onPress }: { challenge: MobileChallenge; earned: boolean; onPress: () => void }) {
  const badgeUrl = getChallengeCoatImageUrl(challenge);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${challenge.title} quest`} style={styles.badgeMeaningCard} onPress={onPress}>
      <View style={[styles.badgeMeaningArtLink, !earned && styles.badgeMeaningArtLocked]}>
        {badgeUrl ? <Image source={{ uri: badgeUrl }} style={[styles.badgeMeaningImage, !earned && styles.badgeMeaningImageLocked]} resizeMode="contain" /> : <Text style={styles.questListGlyph}>{challenge.badgeIdentity.motif}</Text>}
      </View>
      <View style={styles.badgeMeaningCopy}>
        <Text style={styles.badgeMeaningTitle}>{challenge.badgeIdentity.name}</Text>
        <View style={styles.badgeMeaningRows}>
          <View style={styles.badgeMeaningRow}>
            <Text style={styles.badgeMeaningTerm}>Shield</Text>
            <Text style={styles.badgeMeaningDefinition}>{challenge.badgeIdentity.heraldry.shield}</Text>
          </View>
          <View style={styles.badgeMeaningRow}>
            <Text style={styles.badgeMeaningTerm}>Meaning</Text>
            <Text style={styles.badgeMeaningDefinition}>{challenge.badgeIdentity.heraldry.meaning}</Text>
          </View>
          <View style={styles.badgeMeaningRow}>
            <Text style={styles.badgeMeaningTerm}>Quest</Text>
            <Text style={styles.badgeMeaningDefinition}>{challenge.title}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function AccountSetupChecklistCard({ authBridge }: { authBridge: MobileAuthBridge }) {
  return (
    <View style={styles.accountChecklistCard}>
      <Text style={styles.eyebrow}>Account checklist</Text>
      <Text style={styles.accountChecklistTitle}>Nothing important is hidden behind native auth.</Text>
      <View style={styles.checkerFlow}>
        <FlowStep done title="Browse quests" body="The APK loads the public quest board in live or offline-preview mode." />
        <FlowStep done={authBridge.configured} title="Optional Google smoke" body={authBridge.configured ? "Native Google SSO can be tested from the mobile account card." : "Waiting for the Clerk mobile publishable key before native sign-in appears."} />
        <FlowStep title="Finish setup on web" body="Connect chess usernames, start quests, and submit proof through the canonical website." />
      </View>
    </View>
  );
}

function AccountNextActionsCard({ account }: { account: MobileAccountState }) {
  const hasChessAccount = account.chessAccounts.hasAny;
  const activeLabel = account.activeQuest ? account.activeQuest.title : "No active quest";

  return (
    <View style={styles.accountChecklistCard}>
      <Text style={styles.eyebrow}>Next best action</Text>
      <Text style={styles.accountChecklistTitle}>{account.activeQuest ? "Keep the active quest moving." : "Pick a fresh quest on the board."}</Text>
      <View style={styles.checkerFlow}>
        <FlowStep done={hasChessAccount} title="Chess username" body={hasChessAccount ? "At least one chess account is connected on the website." : "Connect Lichess or Chess.com on the website before serious proof runs."} />
        <FlowStep done={Boolean(account.activeQuest)} title="Active quest" body={activeLabel} />
        <FlowStep done={Boolean(account.latestReceipt)} title="Latest receipt" body={account.latestReceipt?.headline ?? "Submit a public game to create the first receipt."} />
      </View>
    </View>
  );
}

function QuestProgressStrip({ completed, total }: { completed: number; total: number }) {
  const safeTotal = Math.max(total, 1);
  const percent = Math.min(100, Math.round((completed / safeTotal) * 100));

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Quest log progress</Text>
        <Text style={styles.progressPercent}>{percent}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.microcopy}>{completed} of {total} coats earned on this account.</Text>
    </View>
  );
}

function AccountMomentumCard({ completed, total }: { completed: number; total: number }) {
  const remaining = Math.max(total - completed, 0);
  const title = completed > 0 ? "Trophy shelf is alive." : "First coat is still waiting.";
  const body = completed > 0
    ? `${completed} completed, ${remaining} still taunting you from the board.`
    : "Complete any starter quest and this screen turns from setup paperwork into actual loot.";

  return (
    <View style={styles.momentumCard}>
      <Text style={styles.momentumIcon}>{completed > 0 ? "🏆" : "♟"}</Text>
      <View style={styles.momentumCopy}>
        <Text style={styles.momentumTitle}>{title}</Text>
        <Text style={styles.momentumBody}>{body}</Text>
      </View>
    </View>
  );
}

function CompletedQuestShelf({ account }: { account: MobileAccountState }) {
  if (account.completedQuests.length === 0) {
    return (
      <View style={styles.noticeStrip}>
        <Text style={styles.noticeIcon}>♜</Text>
        <Text style={styles.noticeCopy}>No completed coats yet. Finish one quest and this turns into a mobile trophy shelf.</Text>
      </View>
    );
  }

  return (
    <View style={styles.trophyShelf}>
      <Text style={styles.eyebrow}>Recent coats</Text>
      {account.completedQuests.slice(0, 3).map((quest) => (
        <View key={quest.id} style={styles.trophyRow}>
          <View style={styles.trophyBadge}>{quest.badgeImageUrl ? <Image source={{ uri: absoluteAssetUrl(quest.badgeImageUrl) }} style={styles.trophyImage} resizeMode="contain" /> : <Text style={styles.trophyGlyph}>♛</Text>}</View>
          <View style={styles.trophyCopy}>
            <Text style={styles.trophyTitle}>{quest.title}</Text>
            <Text style={styles.trophyMeta}>{quest.badgeName} · +{quest.reward}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function ChessUsernameEditor({
  account,
  authBridge,
  onSaved,
}: {
  account: MobileAccountState;
  authBridge: MobileAuthBridge;
  onSaved: () => void;
}) {
  const [lichessUsername, setLichessUsername] = useState(account.chessAccounts.lichessUsername ?? "");
  const [chessComUsername, setChessComUsername] = useState(account.chessAccounts.chessComUsername ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLichessUsername(account.chessAccounts.lichessUsername ?? "");
    setChessComUsername(account.chessAccounts.chessComUsername ?? "");
  }, [account.chessAccounts.chessComUsername, account.chessAccounts.lichessUsername]);

  async function saveUsernames() {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const sessionToken = authBridge.isSignedIn ? await authBridge.getSessionToken() : null;
      const result = await updateMobileChessUsernames({ sessionToken, lichessUsername, chessComUsername });
      setMessage(result.message || "Chess usernames saved.");
      onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save chess usernames.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.usernameEditorCard}>
      <Text style={styles.eyebrow}>Native account action</Text>
      <Text style={styles.usernameEditorTitle}>Connect chess usernames</Text>
      <Text style={styles.usernameEditorBody}>First safe mobile mutation: save public Lichess / Chess.com usernames through the website backend. No chess-site passwords, and the web account stays the source of truth.</Text>
      <View style={styles.inputStack}>
        <Text style={styles.inputLabel}>Lichess username</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          value={lichessUsername}
          placeholder="e.g. and72nor"
          placeholderTextColor="rgba(255,247,232,.42)"
          style={styles.textInput}
          onChangeText={setLichessUsername}
        />
        <Text style={styles.inputLabel}>Chess.com username</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          value={chessComUsername}
          placeholder="optional"
          placeholderTextColor="rgba(255,247,232,.42)"
          style={styles.textInput}
          onChangeText={setChessComUsername}
        />
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Save chess usernames" testID="mobile-save-chess-usernames" style={styles.primaryButton} disabled={saving || !authBridge.isSignedIn} onPress={() => void saveUsernames()}>
        <Text style={styles.primaryButtonText}>{saving ? "Saving…" : "Save usernames"}</Text>
      </Pressable>
      {!authBridge.isSignedIn ? <Text style={styles.microcopy}>Sign in with Google first to enable native account edits.</Text> : null}
      {message ? <Text style={styles.successCopy}>{message}</Text> : null}
      {error ? <Text style={styles.errorCopy}>{error}</Text> : null}
    </View>
  );
}

function MobileAccountStatesCard({ authBridge, account }: { authBridge: MobileAuthBridge; account: MobileAccountResponse | null }) {
  const authenticated = isAuthenticatedAccount(account);
  const backendAccepted = authenticated ? "Live account sync accepted" : authBridge.isSignedIn ? "Local sign-in present; backend still pending" : "Website handoff mode";

  return (
    <View style={styles.stateBoardCard}>
      <Text style={styles.eyebrow}>Account state clarity</Text>
      <Text style={styles.stateBoardTitle}>No mystery loading rooms.</Text>
      <Text style={styles.stateBoardBody}>This build names exactly which layer is active, so Android testers can tell public browsing, local Clerk, and backend account sync apart.</Text>
      <View style={styles.stateTimeline}>
        <FlowStep done title="Public catalog" body="Quest board, rules, rewards, and website handoffs load without native auth." />
        <FlowStep done={authBridge.configured} title="Native Clerk bridge" body={authBridge.configured ? "Google SSO button is available for smoke testing." : "Waiting for the mobile publishable key from Clerk."} />
        <FlowStep done={authenticated} title="Backend account mirror" body={backendAccepted} />
      </View>
    </View>
  );
}

function EmptyStateCard({ eyebrow, title, body, facts }: { eyebrow: string; title: string; body: string; facts: Array<[string, string]> }) {
  return (
    <View style={styles.panelCard}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
      <View style={styles.factGrid}>
        {facts.map(([label, value]) => (
          <Fact key={label} label={label} value={value} />
        ))}
      </View>
    </View>
  );
}

function WebsiteHandoffCard({ title, body, buttonLabel, url }: { title: string; body: string; buttonLabel: string; url: string }) {
  return (
    <View style={styles.handoffCard}>
      <View style={styles.handoffCopy}>
        <Text style={styles.handoffTitle}>{title}</Text>
        <Text style={styles.handoffBody}>{body}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={buttonLabel} testID={`website-handoff-${buttonLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} style={styles.handoffButton} onPress={() => void openExternalUrl(url)}>
        <Text style={styles.handoffButtonText}>{buttonLabel} ↗</Text>
      </Pressable>
    </View>
  );
}
function BigScore({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.bigScore}>
      <Text style={styles.bigScoreValue}>{value}</Text>
      <Text style={styles.bigScoreLabel}>{label}</Text>
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function FlowStep({ title, body, done = false }: { title: string; body: string; done?: boolean }) {
  return (
    <View style={[styles.flowStep, done && styles.flowStepDone]}>
      <Text style={styles.flowCheck}>{done ? "✓" : "○"}</Text>
      <View style={styles.flowCopy}>
        <Text style={styles.flowTitle}>{title}</Text>
        <Text style={styles.flowBody}>{body}</Text>
      </View>
    </View>
  );
}

function isAuthenticatedAccount(account: MobileAccountResponse | null): account is MobileAccountState {
  return Boolean(account?.authenticated);
}

function getChallengeCoatImageUrl(challenge: MobileChallenge) {
  const imageUrl = challenge.badgeIdentity.imageUrl ?? CHALLENGE_COAT_IMAGE_PATHS[challenge.id];
  return imageUrl ? absoluteAssetUrl(imageUrl) : null;
}

function absoluteAssetUrl(url: string) {
  if (url.startsWith("http")) return url;
  return `${getApiBaseUrl()}${url.startsWith("/") ? url : `/${url}`}`;
}

async function openExternalUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Could not open link", "The app stayed stable, but Android did not accept that website handoff.");
  }
}

const colors = {
  bg: "#060507",
  paper: "#fff7e8",
  muted: "#c7bda9",
  gold: "#f5c86a",
  green: "#60f0af",
  red: "#ff7a66",
  panel: "rgba(255,255,255,.075)",
  panelStrong: "rgba(255,255,255,.11)",
  stroke: "rgba(255,255,255,.14)",
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { gap: 14, padding: 14, paddingTop: 18, paddingBottom: 118 },
  screenStack: { gap: 14 },
  heroCard: {
    overflow: "hidden",
    gap: 14,
    padding: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(245,200,106,.3)",
    backgroundColor: "#111016",
  },
  heroGlowOne: { position: "absolute", right: -80, top: -70, width: 190, height: 190, borderRadius: 95, backgroundColor: "rgba(245,200,106,.18)" },
  heroGlowTwo: { position: "absolute", left: -70, bottom: -90, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(151,70,255,.18)" },
  homeHeroCard: { overflow: "hidden", gap: 16, padding: 20, borderRadius: 30, borderWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "#171119" },
  homeHeroTitle: { color: colors.paper, fontSize: 34, fontWeight: "900", letterSpacing: -1.8, lineHeight: 37 },
  homeHeroBody: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  homeHeroActions: { gap: 10 },
  buttonEmphasis: { fontWeight: "900" },
  whereBeginCard: { gap: 13, padding: 16, borderRadius: 26, borderWidth: 1, borderColor: "rgba(255,255,255,.12)", backgroundColor: "rgba(255,247,232,.07)" },
  heroismChoiceList: { gap: 10 },
  heroismChoiceCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,.12)", backgroundColor: "rgba(0,0,0,.2)" },
  heroismBadgeFrame: { width: 58, height: 66, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "rgba(0,0,0,.24)", borderWidth: 1, borderColor: "rgba(245,200,106,.2)" },
  heroismBadgeImage: { width: 52, height: 60 },
  heroismChoiceCopy: { flex: 1, gap: 3 },
  heroismChoiceLabel: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  heroismChoiceSmall: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  heroismChoiceCta: { color: colors.gold, fontSize: 13, fontWeight: "900" },
  heroismCustomPath: { color: colors.gold, fontSize: 14, fontWeight: "900", textDecorationLine: "underline" },
  multiplayerCalloutCard: { gap: 12, padding: 16, borderRadius: 26, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(245,200,106,.08)" },
  homeStatusCard: { gap: 13, padding: 16, borderRadius: 26, borderWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.08)" },
  sideQuestHubHero: { gap: 12, padding: 20, borderRadius: 30, borderWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "#171119" },
  sideQuestHubTitle: { color: colors.paper, fontSize: 34, fontWeight: "900", letterSpacing: -1.7, lineHeight: 37 },
  sideQuestHubCopy: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  sideQuestModeGrid: { gap: 12 },
  sideQuestModeCard: { gap: 11, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,.12)", backgroundColor: "rgba(255,255,255,.075)" },
  groupModeCard: { borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(245,200,106,.08)" },
  sideQuestModeTitle: { color: colors.paper, fontSize: 23, fontWeight: "900", letterSpacing: -0.9, lineHeight: 26 },
  sideQuestModeCopy: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  questFilterPanel: { gap: 14, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,.12)", backgroundColor: "rgba(255,255,255,.075)" },
  questFilterTitle: { color: colors.paper, fontSize: 24, fontWeight: "900", letterSpacing: -0.9 },
  questFilterGrid: { gap: 10 },
  filterField: { gap: 5 },
  filterLabel: { color: colors.muted, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  filterValue: { color: colors.paper, fontSize: 15, fontWeight: "900", paddingHorizontal: 12, paddingVertical: 11, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,.14)", backgroundColor: "rgba(0,0,0,.22)" },
  filterResetButton: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,.18)", opacity: 0.62 },
  filterResetText: { color: colors.muted, fontWeight: "900" },
  availableQuestGrid: { gap: 12 },
  sideQuestSection: { gap: 13, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,.12)", backgroundColor: "rgba(255,255,255,.075)" },
  sectionHeadMobile: { gap: 6 },
  challengeCardMobile: { gap: 13, padding: 15, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,.12)", backgroundColor: "rgba(255,255,255,.075)" },
  challengeCardMobileFeatured: { borderColor: "rgba(245,200,106,.42)", backgroundColor: "rgba(245,200,106,.1)" },
  challengeCardMobileActive: { borderColor: "rgba(96,240,175,.5)", backgroundColor: "rgba(96,240,175,.1)" },
  challengeCardMobileCompleted: { borderColor: "rgba(245,200,106,.35)" },
  activeQuestStampText: { alignSelf: "flex-start", overflow: "hidden", color: "#06140d", backgroundColor: colors.green, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  completedQuestStampText: { alignSelf: "flex-start", overflow: "hidden", color: "#111", backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  questCardMetaMobile: { flexDirection: "row", alignItems: "center", gap: 8 },
  questPointsMobile: { color: colors.gold, fontSize: 13, fontWeight: "900" },
  difficultyBadgeMobile: { overflow: "hidden", color: colors.paper, fontSize: 11, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,.1)" },
  difficultyEasy: { backgroundColor: "rgba(96,240,175,.18)", color: colors.green },
  difficultyMedium: { backgroundColor: "rgba(245,200,106,.16)", color: colors.gold },
  difficultyHard: { backgroundColor: "rgba(255,160,92,.18)", color: "#ffa05c" },
  difficultyBrutal: { backgroundColor: "rgba(255,122,102,.18)", color: colors.red },
  difficultyAbsurd: { backgroundColor: "rgba(255,95,159,.2)", color: "#ff8cc0" },
  challengeCardTitleRowMobile: { flexDirection: "row", gap: 12, alignItems: "center" },
  challengeCardBadgeMobile: { width: 82, alignItems: "center", justifyContent: "center" },
  challengeCardBadgeImageMobile: { width: 78, height: 88 },
  challengeCardCopyMobile: { flex: 1, gap: 5 },
  challengeCardTitleMobile: { color: colors.paper, fontSize: 22, lineHeight: 24, fontWeight: "900", letterSpacing: -0.8 },
  challengeCardObjectiveMobile: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  challengeCardHintMobile: { color: colors.gold, fontSize: 13, lineHeight: 18, fontStyle: "italic", fontWeight: "800" },
  badgesHeroCard: { gap: 18, padding: 20, borderRadius: 30, borderWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "#171119" },
  badgesHeroTitle: { color: colors.paper, fontSize: 34, fontWeight: "900", letterSpacing: -1.7, lineHeight: 37, textAlign: "center" },
  liveCoatRoster: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10 },
  liveCoatRosterItem: { width: "30%", minWidth: 92, alignItems: "center", gap: 6, paddingVertical: 6 },
  liveCoatBadgeFrame: { width: 78, height: 82, alignItems: "center", justifyContent: "center" },
  liveCoatBadgeFrameLocked: {},
  liveCoatBadgeImage: { width: 76, height: 76 },
  liveCoatBadgeImageLocked: { opacity: 0.78 },
  liveCoatRosterTitle: { color: colors.paper, fontSize: 11, fontWeight: "900", lineHeight: 13, textAlign: "center" },
  badgeMeaningList: { gap: 12 },
  badgeMeaningCard: { flexDirection: "row", gap: 14, padding: 15, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,.12)", backgroundColor: "rgba(255,255,255,.075)" },
  badgeMeaningArtLink: { width: 92, alignItems: "center", justifyContent: "center" },
  badgeMeaningArtLocked: {},
  badgeMeaningImage: { width: 88, height: 98 },
  badgeMeaningImageLocked: { opacity: 0.74 },
  badgeMeaningCopy: { flex: 1, gap: 10 },
  badgeMeaningTitle: { color: colors.paper, fontSize: 21, lineHeight: 23, fontWeight: "900", letterSpacing: -0.7 },
  badgeMeaningRows: { gap: 7 },
  badgeMeaningRow: { gap: 2 },
  badgeMeaningTerm: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  badgeMeaningDefinition: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  websiteRitualCard: { gap: 12, padding: 16, borderRadius: 26, borderWidth: 1, borderColor: "rgba(255,255,255,.12)", backgroundColor: "rgba(255,247,232,.07)" },
  websiteRitualSteps: { gap: 9 },
  navBrandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  logoMark: { width: 38, height: 38, borderRadius: 13 },
  navBrandCopy: { flex: 1 },
  navKicker: { color: colors.paper, fontWeight: "900", fontSize: 15, letterSpacing: -0.2 },
  navSub: { color: colors.muted, fontWeight: "800", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 },
  navSubPill: { overflow: "hidden", color: "#111", fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.gold },
  buildPill: { maxWidth: 128, color: "#111", fontSize: 9, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.gold, overflow: "hidden" },
  heroMainRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  heroCopyBlock: { flex: 1, gap: 7 },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
  title: { color: colors.paper, fontSize: 28, fontWeight: "900", letterSpacing: -1.7, lineHeight: 29 },
  heroCopy: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  heroBadgeFrame: { width: 88, height: 104, alignItems: "center", justifyContent: "center", borderRadius: 26, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(0,0,0,.28)" },
  heroBadgeFrameCompact: { width: 68, height: 78, alignItems: "center", justifyContent: "center", borderRadius: 22, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(0,0,0,.28)" },
  heroBadgeImage: { width: 82, height: 96 },
  heroBadgeImageCompact: { width: 62, height: 72 },
  heroBadgeGlyph: { color: colors.gold, fontSize: 54, fontWeight: "900" },
  heroStatsRow: { flexDirection: "row", gap: 8 },
  miniStat: { flex: 1, gap: 3, padding: 10, borderRadius: 16, backgroundColor: "rgba(0,0,0,.28)", borderWidth: 1, borderColor: "rgba(255,255,255,.08)" },
  miniStatLabel: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  miniStatValue: { color: colors.paper, fontSize: 14, fontWeight: "900" },
  loadingCard: { alignItems: "center", gap: 12, padding: 24 },
  muted: { color: colors.muted },
  offlineCard: { gap: 12, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: "rgba(96,240,175,.34)", backgroundColor: "rgba(96,240,175,.09)" },
  offlineHeaderRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  offlineIcon: { width: 36, height: 36, textAlign: "center", textAlignVertical: "center", borderRadius: 18, overflow: "hidden", color: colors.green, fontSize: 22, backgroundColor: "rgba(0,0,0,.24)" },
  offlineHeaderCopy: { flex: 1, gap: 4 },
  offlineTitle: { color: colors.paper, fontSize: 18, fontWeight: "900" },
  offlineCopy: { color: colors.muted, lineHeight: 20 },
  errorCopy: { color: "#ffd6cf", lineHeight: 20 },
  primaryButton: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 999, backgroundColor: colors.gold },
  primaryButtonWide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 999, backgroundColor: colors.gold },
  primaryButtonText: { color: "#111", fontWeight: "900" },
  secondaryButton: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,.22)", backgroundColor: "rgba(255,255,255,.08)" },
  secondaryButtonWide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,.22)", backgroundColor: "rgba(255,255,255,.08)" },
  secondaryButtonText: { color: colors.paper, fontWeight: "900" },
  quickStartCard: { gap: 13, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.34)", backgroundColor: "rgba(255,255,255,.08)" },
  quickStartTopRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  quickStartCopy: { flex: 1, gap: 5 },
  quickStartTitle: { color: colors.paper, fontSize: 23, fontWeight: "900", letterSpacing: -1, lineHeight: 25 },
  quickStartBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  quickScoreRail: { width: 76, gap: 2, alignItems: "center", justifyContent: "center", padding: 10, borderRadius: 20, backgroundColor: "rgba(0,0,0,.24)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  quickScoreValue: { color: colors.gold, fontSize: 26, fontWeight: "900", lineHeight: 28 },
  quickScoreValueSmall: { color: colors.green, fontSize: 18, fontWeight: "900", marginTop: 5, lineHeight: 20 },
  quickScoreLabel: { color: colors.muted, fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.6 },
  quickActionStack: { gap: 9 },
  questFlowStrip: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, padding: 10, borderRadius: 16, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(255,255,255,.08)" },
  questFlowStep: { flex: 1, color: colors.paper, fontSize: 12, fontWeight: "900", textAlign: "center" },
  questFlowArrow: { color: colors.gold, fontSize: 13, fontWeight: "900" },
  accountModeStrip: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 16, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(96,240,175,.18)" },
  accountModeDot: { color: colors.green, fontSize: 10 },
  accountModeCopy: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: "800" },
  parityDockCard: { gap: 13, padding: 16, borderRadius: 26, borderWidth: 1, borderColor: "rgba(151,70,255,.34)", backgroundColor: "rgba(151,70,255,.1)" },
  parityDockHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  parityDockHeaderCopy: { flex: 1, gap: 5 },
  parityDockTitle: { color: colors.paper, fontSize: 22, fontWeight: "900", letterSpacing: -0.9, lineHeight: 24 },
  parityDockBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  parityModePill: { overflow: "hidden", color: "#120a20", fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.gold },
  parityRouteGrid: { gap: 9 },
  parityRouteButton: { flexDirection: "row", alignItems: "center", gap: 11, padding: 12, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,.1)", backgroundColor: "rgba(0,0,0,.22)" },
  parityRouteIcon: { width: 34, height: 34, textAlign: "center", textAlignVertical: "center", borderRadius: 17, overflow: "hidden", color: colors.gold, fontSize: 20, backgroundColor: "rgba(255,255,255,.08)" },
  parityRouteCopy: { flex: 1, gap: 2 },
  parityRouteTitle: { color: colors.paper, fontSize: 15, fontWeight: "900" },
  parityRouteBody: { color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  paritySafetyStrip: { flexDirection: "row", gap: 10, alignItems: "center", padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(96,240,175,.18)" },
  firstRunCard: { gap: 12, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,.12)", backgroundColor: "rgba(255,247,232,.07)" },
  firstRunTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.8 },
  firstRunSteps: { gap: 9 },
  bottomNavBar: { position: "absolute", left: 10, right: 10, bottom: 8, flexDirection: "row", gap: 6, padding: 8, borderRadius: 28, borderWidth: 1, borderColor: "rgba(245,200,106,.26)", backgroundColor: "rgba(12,11,15,.97)", shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 14 },
  bottomNavItem: { position: "relative", overflow: "hidden", flex: 1, minHeight: 58, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "transparent" },
  bottomNavItemActive: { borderColor: "rgba(245,200,106,.82)", backgroundColor: "rgba(245,200,106,.2)", shadowColor: colors.gold, shadowOpacity: 0.34, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  bottomNavActiveGlow: { position: "absolute", top: -16, width: 54, height: 28, borderRadius: 28, backgroundColor: "rgba(245,200,106,.38)" },
  bottomNavActiveDot: { width: 18, height: 3, borderRadius: 999, backgroundColor: colors.gold, marginTop: 2 },
  bottomNavIconFrame: { width: 28, height: 26, alignItems: "center", justifyContent: "center", transform: [{ translateY: 0 }] },
  bottomNavIconFrameActive: { transform: [{ translateY: -1 }] },
  bottomNavLogoImage: { width: 25, height: 25, borderRadius: 7 },
  bottomNavCoatImage: { width: 28, height: 28 },
  bottomNavText: { color: colors.muted, fontSize: 10, fontWeight: "900" },
  bottomNavTextActive: { color: colors.paper },
  tabRail: { gap: 8, paddingRight: 18 },
  tabPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.stroke, backgroundColor: "rgba(255,255,255,.07)" },
  tabPillActive: { borderColor: "rgba(245,200,106,.78)", backgroundColor: "rgba(245,200,106,.16)" },
  tabIcon: { color: colors.muted, fontWeight: "900" },
  tabText: { color: colors.muted, fontWeight: "900" },
  tabTextActive: { color: colors.paper },
  sectionHeader: { gap: 6, paddingHorizontal: 2 },
  sectionTitle: { color: colors.paper, fontSize: 25, fontWeight: "900", letterSpacing: -1.1, lineHeight: 28 },
  sectionBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  questListCard: { overflow: "hidden", flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 26, borderWidth: 1, borderColor: colors.stroke, backgroundColor: colors.panel },
  questListCardActive: { borderColor: "rgba(245,200,106,.72)", backgroundColor: "rgba(245,200,106,.13)", shadowColor: colors.gold, shadowOpacity: 0.28, shadowRadius: 18, elevation: 3 },
  selectedCornerPill: { position: "absolute", top: 0, right: 0, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 5, borderBottomLeftRadius: 14, color: "#111", backgroundColor: colors.gold, fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.7 },
  questNumberPill: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "rgba(0,0,0,.32)" },
  questNumber: { color: colors.gold, fontWeight: "900", fontSize: 12 },
  questListCopy: { flex: 1, gap: 4 },
  questListMode: { color: colors.green, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  questListTitle: { color: colors.paper, fontSize: 19, lineHeight: 21, fontWeight: "900", letterSpacing: -0.7 },
  questListObjective: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  questListReward: { color: colors.gold, fontSize: 12, fontWeight: "800" },
  questMetaRow: { gap: 6, alignItems: "flex-start" },
  rarityPill: { overflow: "hidden", alignSelf: "flex-start", color: colors.paper, fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(255,255,255,.1)" },
  questListBadgeFrame: { width: 68, height: 78, alignItems: "center", justifyContent: "center" },
  questListBadge: { width: 68, height: 78 },
  questListGlyph: { color: colors.gold, fontSize: 32 },
  questCard: { gap: 16, padding: 18, borderRadius: 30, borderWidth: 1, borderColor: colors.stroke, backgroundColor: colors.panel },
  questCardHeader: { flexDirection: "row", gap: 14, alignItems: "center" },
  questCardCopy: { flex: 1, gap: 8 },
  questTitle: { color: colors.paper, fontSize: 32, fontWeight: "900", letterSpacing: -1.6, lineHeight: 32 },
  questObjective: { color: colors.muted, fontSize: 16, lineHeight: 22 },
  badgeImageFrame: { width: 112, height: 128, alignItems: "center", justifyContent: "center", borderRadius: 30, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(245,200,106,.22)" },
  badgeImage: { width: 104, height: 120 },
  badgeFallbackText: { color: colors.gold, fontSize: 34, fontWeight: "900" },
  questFlavorCard: { padding: 14, borderRadius: 20, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(255,255,255,.08)" },
  questFlavor: { color: colors.paper, fontSize: 15, fontWeight: "700", lineHeight: 22 },
  questInstructionCard: { gap: 6, padding: 14, borderRadius: 20, backgroundColor: "rgba(245,200,106,.1)", borderWidth: 1, borderColor: "rgba(245,200,106,.22)" },
  instructionLabel: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  instructionCopy: { color: colors.paper, fontSize: 15, fontWeight: "800", lineHeight: 22 },
  openingHint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  catalogQuickStats: { flexDirection: "row", gap: 10 },
  factGrid: { gap: 8 },
  fact: { gap: 4, padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(255,255,255,.06)" },
  factLabel: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  factValue: { color: colors.paper, fontSize: 14, fontWeight: "800" },
  rulesTitle: { color: colors.paper, fontSize: 18, fontWeight: "900" },
  rule: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  authCard: { gap: 9, padding: 14, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.28)", backgroundColor: "rgba(245,200,106,.09)" },
  readinessCard: { gap: 10, padding: 14, borderRadius: 24, borderWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.075)" },
  readinessTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  readinessBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  panelCard: { gap: 14, padding: 18, borderRadius: 30, borderWidth: 1, borderColor: colors.stroke, backgroundColor: colors.panel },
  cardTitle: { color: colors.paper, fontSize: 23, fontWeight: "900", letterSpacing: -1.0, lineHeight: 26 },
  cardBody: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  scoreboardRow: { flexDirection: "row", gap: 8 },
  bigScore: { flex: 1, alignItems: "center", gap: 2, padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.24)" },
  bigScoreValue: { color: colors.gold, fontSize: 25, fontWeight: "900" },
  bigScoreLabel: { color: colors.paper, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  noticeStrip: { flexDirection: "row", gap: 10, alignItems: "center", padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(255,255,255,.08)" },
  noticeIcon: { fontSize: 18 },
  noticeCopy: { flex: 1, color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },

  actionPlanCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(96,240,175,.075)", borderWidth: 1, borderColor: "rgba(96,240,175,.22)" },
  actionPlanTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.8, lineHeight: 24 },
  actionPlanSteps: { gap: 9 },
  requirementPairRow: { flexDirection: "row", gap: 9 },
  requirementPill: { flex: 1, gap: 4, padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(245,200,106,.16)" },
  requirementLabel: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  requirementValue: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  mobileQuestActionCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(245,200,106,.09)", borderWidth: 1, borderColor: "rgba(245,200,106,.26)" },
  mobileQuestActionTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.8, lineHeight: 24 },
  mobileQuestActionBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  proofPrepCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(151,70,255,.11)", borderWidth: 1, borderColor: "rgba(151,70,255,.28)" },
  proofPrepTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  accountChecklistCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(255,255,255,.065)", borderWidth: 1, borderColor: "rgba(255,255,255,.12)" },
  accountChecklistTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  heraldryCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(151,70,255,.11)", borderWidth: 1, borderColor: "rgba(151,70,255,.28)" },
  heraldryHeader: { flexDirection: "row", gap: 12, alignItems: "center" },
  heraldryGlyph: { width: 46, height: 46, textAlign: "center", textAlignVertical: "center", color: colors.gold, fontSize: 26, fontWeight: "900", borderRadius: 23, backgroundColor: "rgba(0,0,0,.26)", overflow: "hidden" },
  heraldryHeaderCopy: { flex: 1, gap: 3 },
  heraldryTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.6 },
  heraldryMotto: { color: colors.gold, fontSize: 13, fontWeight: "800" },
  progressCard: { gap: 9, padding: 14, borderRadius: 20, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(96,240,175,.2)" },
  progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressTitle: { color: colors.paper, fontSize: 15, fontWeight: "900" },
  progressPercent: { color: colors.green, fontSize: 15, fontWeight: "900" },
  progressTrack: { overflow: "hidden", height: 10, borderRadius: 999, backgroundColor: "rgba(255,255,255,.09)" },
  progressFill: { height: 10, borderRadius: 999, backgroundColor: colors.green },
  usernameEditorCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(96,240,175,.075)", borderWidth: 1, borderColor: "rgba(96,240,175,.24)" },
  usernameEditorTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  usernameEditorBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  inputStack: { gap: 7 },
  inputLabel: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  textInput: { color: colors.paper, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,.14)", backgroundColor: "rgba(0,0,0,.24)", fontSize: 15, fontWeight: "800" },
  successCopy: { color: colors.green, fontSize: 13, lineHeight: 18, fontWeight: "800" },
  momentumCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 20, backgroundColor: "rgba(245,200,106,.08)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  momentumIcon: { width: 38, height: 38, textAlign: "center", textAlignVertical: "center", borderRadius: 19, overflow: "hidden", fontSize: 22, backgroundColor: "rgba(0,0,0,.22)" },
  momentumCopy: { flex: 1, gap: 3 },
  momentumTitle: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  momentumBody: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  trophyShelf: { gap: 10, padding: 14, borderRadius: 20, backgroundColor: "rgba(245,200,106,.08)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  trophyRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  trophyBadge: { width: 46, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "rgba(0,0,0,.24)" },
  trophyImage: { width: 42, height: 48 },
  trophyGlyph: { color: colors.gold, fontSize: 22 },
  trophyCopy: { flex: 1, gap: 2 },
  trophyTitle: { color: colors.paper, fontSize: 15, fontWeight: "900" },
  trophyMeta: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  stateBoardCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(96,240,175,.075)", borderWidth: 1, borderColor: "rgba(96,240,175,.22)" },
  stateBoardTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.8 },
  stateBoardBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  stateTimeline: { gap: 9 },
  statusRibbon: { flexDirection: "row", gap: 12, alignItems: "center", padding: 14, borderRadius: 20, backgroundColor: "rgba(245,200,106,.1)", borderWidth: 1, borderColor: "rgba(245,200,106,.2)" },
  statusRibbonIcon: { fontSize: 27 },
  statusRibbonCopy: { flex: 1, gap: 3 },
  statusRibbonTitle: { color: colors.paper, fontSize: 17, fontWeight: "900", textTransform: "uppercase" },
  statusRibbonBody: { color: colors.muted, lineHeight: 19 },
  checkerFlow: { gap: 10 },
  flowStep: { flexDirection: "row", gap: 10, padding: 13, borderRadius: 18, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(255,255,255,.08)" },
  flowStepDone: { borderColor: "rgba(96,240,175,.34)", backgroundColor: "rgba(96,240,175,.08)" },
  flowCheck: { color: colors.green, fontSize: 17, fontWeight: "900" },
  flowCopy: { flex: 1, gap: 3 },
  flowTitle: { color: colors.paper, fontWeight: "900", fontSize: 15 },
  flowBody: { color: colors.muted, lineHeight: 19 },
  confidenceCard: { flexDirection: "row", gap: 12, alignItems: "center", padding: 14, borderRadius: 20, backgroundColor: "rgba(255,255,255,.075)", borderWidth: 1, borderColor: "rgba(255,255,255,.12)" },
  confidenceIcon: { width: 40, height: 40, textAlign: "center", textAlignVertical: "center", borderRadius: 20, overflow: "hidden", fontSize: 22, backgroundColor: "rgba(0,0,0,.24)" },
  confidenceCopy: { flex: 1, gap: 3 },
  confidenceTitle: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  confidenceBody: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  proofScrollCard: { gap: 13, padding: 20, paddingTop: 50, borderRadius: 30, borderWidth: 1, borderColor: "rgba(245,200,106,.38)", backgroundColor: "rgba(255,247,232,.1)" },
  proofSeal: { position: "absolute", top: 14, right: 16, width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 27, backgroundColor: "#9e1d24", borderWidth: 2, borderColor: "rgba(255,255,255,.28)" },
  proofSealText: { color: "#ffe3b3", fontWeight: "900", fontSize: 13 },
  coatHeroFrame: { alignSelf: "center", width: 188, height: 212, alignItems: "center", justifyContent: "center", borderRadius: 42, borderWidth: 1, borderColor: "rgba(245,200,106,.34)", backgroundColor: "rgba(0,0,0,.26)", shadowColor: colors.gold, shadowOpacity: 0.24, shadowRadius: 18, elevation: 4 },
  coatHeroImage: { width: 170, height: 194 },
  proofPreviewBadgeFrame: { alignSelf: "center", width: 138, height: 154, alignItems: "center", justifyContent: "center", borderRadius: 34, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(0,0,0,.22)" },
  proofPreviewBadge: { width: 124, height: 142 },
  proofPreviewGlyph: { color: colors.gold, fontSize: 52, fontWeight: "900" },
  proofTitle: { color: colors.paper, fontSize: 31, lineHeight: 33, letterSpacing: -1.4, fontWeight: "900" },
  proofSubtitle: { color: colors.gold, fontSize: 16, fontWeight: "900" },
  proofBody: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  coatLoreCard: { gap: 11, padding: 15, borderRadius: 22, borderWidth: 1, borderColor: "rgba(151,70,255,.28)", backgroundColor: "rgba(151,70,255,.1)" },
  coatLoreTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7 },
  coatLoreRows: { gap: 8 },
  coatShelfCard: { gap: 12, padding: 15, borderRadius: 22, borderWidth: 1, borderColor: "rgba(245,200,106,.28)", backgroundColor: "rgba(245,200,106,.085)" },
  coatShelfHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  coatShelfCopy: { flex: 1, gap: 4 },
  coatShelfTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7 },
  coatShelfBody: { color: colors.muted, fontSize: 13, lineHeight: 19, fontWeight: "700" },
  lockedPill: { overflow: "hidden", color: colors.paper, fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,.12)" },
  syncedPill: { overflow: "hidden", color: "#07110d", fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.green },
  coatShelfPreviewRow: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  coatShelfTile: { width: "48%", minWidth: 132, flexGrow: 1, gap: 7, padding: 10, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,.1)", backgroundColor: "rgba(0,0,0,.22)" },
  coatShelfTileLocked: { opacity: 0.78, borderColor: "rgba(245,200,106,.18)" },
  coatShelfBadgeFrame: { alignSelf: "center", width: 78, height: 88, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: "rgba(0,0,0,.25)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  coatShelfBadgeImage: { width: 72, height: 82 },
  coatShelfTileTitle: { color: colors.paper, fontSize: 14, lineHeight: 17, fontWeight: "900", textAlign: "center" },
  coatShelfTileSubtitle: { color: colors.muted, fontSize: 11, lineHeight: 15, fontWeight: "800", textAlign: "center" },
  proofActionCard: { gap: 10, padding: 15, borderRadius: 22, borderWidth: 1, borderColor: "rgba(245,200,106,.26)", backgroundColor: "rgba(245,200,106,.085)" },
  proofActionTitle: { color: colors.paper, fontSize: 19, fontWeight: "900", letterSpacing: -0.6 },
  proofActionBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  handoffCard: { gap: 11, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.075)" },
  handoffCopy: { gap: 4 },
  handoffTitle: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  handoffBody: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  handoffButton: { alignSelf: "flex-start", paddingHorizontal: 13, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.green },
  handoffButtonText: { color: "#07110d", fontWeight: "900" },
  syncCard: { gap: 8, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.08)" },
  syncTitle: { color: colors.paper, fontSize: 20, fontWeight: "900" },
  syncCopy: { color: colors.muted, lineHeight: 21 },
  microcopy: { color: "rgba(199,189,169,.76)", fontSize: 11 },
});
