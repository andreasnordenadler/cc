/* eslint-disable jsx-a11y/alt-text */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClerkProvider, useAuth, useClerk, useSSO, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getApiBaseUrl, fetchMobileAccountState, fetchMobileBootstrap, runMobileQuestAction, updateMobileChessUsernames } from "./src/api/sqc";
import { clerkPublishableKey, clerkTokenCache, isClerkMobileAuthConfigured } from "./src/auth/clerk";
import { OFFLINE_MOBILE_BOOTSTRAP } from "./src/data/offlineBootstrap";
import type { MobileAccountResponse, MobileAccountState, MobileBootstrap, MobileChallenge } from "./src/types/sqc";

type AppTab = "home" | "sideQuests" | "multiplayerSideQuests" | "coatOfArms" | "account";

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
  { id: "sideQuests", label: "Side Quests", iconKind: "image", imagePath: "/sqc-logo-v11.png" },
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
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollState, setScrollState] = useState({ y: 0, viewportHeight: 0, contentHeight: 0 });
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
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    setShell((current) => ({ ...current, activeTab }));
    setScrollState((current) => ({ ...current, y: 0 }));
    requestAnimationFrame(() => scrollViewRef.current?.scrollTo({ y: 0, animated: false }));
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    setScrollState({ y: contentOffset.y, viewportHeight: layoutMeasurement.height, contentHeight: contentSize.height });
  }

  function handleViewportLayout(event: LayoutChangeEvent) {
    const viewportHeight = event.nativeEvent.layout.height;
    setScrollState((current) => ({ ...current, viewportHeight }));
  }

  function handleContentSizeChange(_width: number, contentHeight: number) {
    setScrollState((current) => ({ ...current, contentHeight }));
  }

  const canScrollUp = scrollState.y > 18;
  const canScrollDown = scrollState.contentHeight > 0 && scrollState.viewportHeight > 0 && scrollState.y + scrollState.viewportHeight < scrollState.contentHeight - 18;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} translucent={false} />
      <GradientBackdrop />
      <View pointerEvents="none" style={styles.appWatermarkFrame}>
        <Image source={{ uri: absoluteAssetUrl("/sqc-logo-v11.png") }} style={styles.appWatermarkImage} resizeMode="contain" />
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 178, 196) }]}
        refreshControl={<RefreshControl tintColor="#f5c86a" refreshing={shell.refreshing} onRefresh={() => void refreshBoardAndAccount()} />}
        scrollEventThrottle={32}
        onScroll={handleScroll}
        onLayout={handleViewportLayout}
        onContentSizeChange={handleContentSizeChange}
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
      <ScrollHintOverlay canScrollUp={canScrollUp} canScrollDown={canScrollDown} bottomInset={insets.bottom} />
      <BottomNav activeTab={shell.activeTab === "multiplayerSideQuests" ? "sideQuests" : shell.activeTab} bottomInset={insets.bottom} onSelectTab={selectTab} />
    </SafeAreaView>
  );

}

function ScrollHintOverlay({ canScrollUp, canScrollDown, bottomInset }: { canScrollUp: boolean; canScrollDown: boolean; bottomInset: number }) {
  if (!canScrollUp && !canScrollDown) return null;

  const bottomHintOffset = Math.max(148, bottomInset + 140);

  return (
    <View pointerEvents="none" style={styles.scrollHintLayer}>
      <View style={[styles.scrollHintPill, { bottom: bottomHintOffset }]}>
        {canScrollUp ? <MaterialCommunityIcons name="chevron-up" size={18} color="rgba(255,247,232,.72)" /> : null}
        {canScrollDown ? <MaterialCommunityIcons name="chevron-down" size={18} color="rgba(255,247,232,.72)" /> : null}
      </View>
    </View>
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
  const signedInAccount = isAuthenticatedAccount(account) ? account : null;
  const isSignedIn = Boolean(signedInAccount);
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
        <WebsiteGradientGlows />
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
          <Pressable accessibilityRole="button" accessibilityLabel="Join a Multiplayer Side Quest" testID="home-join-multiplayer-side-quest" style={styles.primaryButtonWide} onPress={() => onSelectTab("multiplayerSideQuests")}>
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
          <Pressable accessibilityRole="button" accessibilityLabel="Join Multiplayer Side Quests" testID="home-join-multiplayer-callout" style={styles.secondaryButtonWide} onPress={() => onSelectTab("multiplayerSideQuests")}>
            <Text style={styles.secondaryButtonText}>Join Multiplayer Side Quests</Text>
          </Pressable>
        </View>
      ) : null}

      {isSignedIn ? (
        <View style={styles.homeStatusCard}>
          <Text style={styles.eyebrow}>Active Solo Side Quest</Text>
          <Text style={styles.sectionTitle}>{signedInAccount?.activeQuest ? signedInAccount.activeQuest.title : "No active solo quest yet."}</Text>
          <Text style={styles.sectionBody}>{signedInAccount?.activeQuest ? "Open the active quest page for rules, badge details, and the next weird chess side quest." : "Choose one solo quest first so My Side Quests knows which weird rule to judge after your next public game."}</Text>
          <View style={styles.scoreboardRow}>
            <BigScore label="Points" value={`${signedInAccount?.progress.totalRewardPoints ?? 0}`} />
            <BigScore label="Coats" value={`${signedInAccount?.progress.totalCompletedChallenges ?? 0}`} />
            <BigScore label="Proofs" value={`${signedInAccount?.progress.proofReceiptCount ?? 0}`} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function GradientBackdrop() {
  return (
    <View pointerEvents="none" style={styles.appGradientFrame}>
      <LinearGradient colors={["rgba(245,200,106,.38)", "rgba(245,200,106,.12)", "rgba(245,200,106,0)"]} locations={[0, 0.42, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.72 }} style={styles.appGradientLayer} />
      <LinearGradient colors={["rgba(255,95,159,.32)", "rgba(255,95,159,.12)", "rgba(255,95,159,0)"]} locations={[0, 0.48, 1]} start={{ x: 1, y: 0.05 }} end={{ x: 0.08, y: 0.65 }} style={styles.appGradientLayer} />
      <LinearGradient colors={["rgba(118,169,255,0)", "rgba(118,169,255,.16)", "rgba(118,169,255,.06)"]} locations={[0, 0.58, 1]} start={{ x: 0.1, y: 0.12 }} end={{ x: 0.8, y: 1 }} style={styles.appGradientLayer} />
    </View>
  );
}

function WebsiteGradientGlows() {
  return (
    <View pointerEvents="none" style={styles.cardGradientFrame}>
      <LinearGradient colors={["rgba(245,200,106,.34)", "rgba(255,247,232,.10)", "rgba(23,17,25,.10)"]} locations={[0, 0.48, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGradientLayer} />
      <LinearGradient colors={["rgba(255,95,159,.38)", "rgba(255,95,159,.12)", "rgba(255,95,159,0)"]} locations={[0, 0.45, 1]} start={{ x: 1, y: 0 }} end={{ x: 0.18, y: 0.72 }} style={styles.cardGradientLayer} />
      <LinearGradient colors={["rgba(118,169,255,0)", "rgba(118,169,255,.18)"]} locations={[0.2, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.85, y: 1 }} style={styles.cardGradientLayer} />
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
    <View style={[styles.bottomNavBar, { paddingBottom: Math.max(bottomInset, 0) }]}>
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
          <View style={[styles.bottomNavIconFrame, activeTab === tab.id && styles.bottomNavIconFrameActive]}>
            {tab.iconKind === "image" ? (
              <Image source={{ uri: absoluteAssetUrl(tab.imagePath) }} style={tab.id === "coatOfArms" ? styles.bottomNavCoatImage : tab.id === "sideQuests" ? styles.bottomNavSideQuestImage : styles.bottomNavLogoImage} resizeMode="contain" />
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
    case "multiplayerSideQuests":
      return <MultiplayerSideQuestsScreen onSelectTab={onSelectTab} />;
    case "coatOfArms":
      return <CoatOfArmsScreen bootstrap={bootstrap} account={account} onSelectChallenge={onSelectChallenge} />;
    case "account":
      return <AccountShell bootstrap={bootstrap} account={account} authBridge={authBridge} onSelectTab={onSelectTab} onSelectChallenge={onSelectChallenge} onAccountUpdated={onAccountUpdated} />;
  }
}

function SideQuestsScreen({
  bootstrap,
  selectedChallenge,
  account,
  authBridge,
  onSelectChallenge,
  onSelectTab,
  onAccountUpdated,
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
  const signedInAccount = isAuthenticatedAccount(account) ? account : null;
  const completedIds = new Set(signedInAccount ? signedInAccount.completedQuests.map((quest) => quest.id) : []);
  const activeQuestId = signedInAccount?.activeQuest && !signedInAccount.activeQuest.completed ? signedInAccount.activeQuest.id : null;
  const recommendedStartChallenges = getChallengesByIds(bootstrap, RECOMMENDED_START_CHALLENGE_IDS);
  const liveStreamerHardQuests = getChallengesByIds(bootstrap, LIVE_STREAMER_HARD_QUEST_IDS);

  return (
    <View style={styles.screenStack}>
      <View style={styles.sideQuestHubHero}>
        <WebsiteGradientGlows />
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
          <Pressable accessibilityRole="button" accessibilityLabel="Open Multiplayer Side Quests" testID="sidequests-open-multiplayer" style={styles.primaryButton} onPress={() => onSelectTab("multiplayerSideQuests")}>
            <Text style={styles.primaryButtonText}>Open Multiplayer Side Quests</Text>
          </Pressable>
        </View>
      </View>

      <SelectedQuestDetailCard challenge={selectedChallenge} account={account} authBridge={authBridge} onSelectTab={onSelectTab} onAccountUpdated={onAccountUpdated} />

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

function MultiplayerSideQuestsScreen({ onSelectTab }: { onSelectTab: (tab: AppTab) => void }) {
  const overviewSteps = [
    {
      title: "Create",
      copy: "Pick one or more side quests, set the proof window, choose invite rules, and lock the Multiplayer Side Quest constraints.",
      href: "/groupquests/create",
    },
    {
      title: "Invite",
      copy: "Share the invite link so players can inspect the side quests, proof window, and join conditions before committing.",
    },
    {
      title: "Play",
      copy: "Everyone plays real games elsewhere. SQC only counts proof that matches the Multiplayer Side Quest rules.",
    },
    {
      title: "Prove",
      copy: "Each Multiplayer Side Quest gets its own leaderboard, event feed, and multiplayer-valid proof separate from solo progress.",
    },
  ];
  const loggedOutActions = [
    {
      title: "Create a New Multiplayer Side Quest",
      copy: "Start the ridiculous dare, choose the side quests, and invite the people who deserve trouble.",
      action: "Create Multiplayer Side Quest",
      href: "/groupquests/create",
    },
    {
      title: "Join a Public Multiplayer Side Quest",
      copy: "Find public Multiplayer Side Quests that hosts have opened for anyone to enter, then inspect the rules before joining.",
      action: "Join Public Side Quest",
      href: "/groupquests/public",
    },
  ];

  return (
    <View style={styles.screenStack}>
      <View style={styles.groupquestsHero}>
        <Text style={styles.groupquestsHeroTitle}>Multiplayer Side Quests.</Text>
        <Text style={styles.groupquestsHeroCopy}>Sign In/Up and start a ridiculous chess dare with friends. Pick the nonsense, set the rules, then see who can actually prove it over the board.</Text>
      </View>

      <View style={styles.groupquestsStoryCard} accessibilityLabel="What Multiplayer Side Quests are">
        <View style={styles.groupquestsStoryCopy}>
          <Text style={styles.sectionTitle}>A tiny chess tournament for bad ideas.</Text>
          <Text style={styles.sectionBody}>Multiplayer Side Quests turn normal chess nights into a shared challenge: one player creates a Multiplayer Side Quest, everyone agrees on the side quests and game rules, then players prove their results with real games from Lichess or Chess.com.</Text>
          <Text style={styles.sectionBody}>Each Multiplayer Side Quest has its own deadline, leaderboard, proof feed, and winner moment. Your personal coat of arms still matters — but the Multiplayer Quest only counts proof earned inside that Multiplayer Side Quest.</Text>
        </View>
        <View style={styles.groupquestsProcessGraphic}>
          <Image source={{ uri: absoluteAssetUrl("/illustrations/multiplayer-side-quests-noble-chaos-coat-style.png") }} style={styles.groupquestsKnightArt} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.groupquestsLoggedOutActions} accessibilityLabel="Start or join Multiplayer Side Quests">
        {loggedOutActions.map((item) => (
          <View style={styles.groupquestsActionCard} key={item.title}>
            <Text style={styles.sideQuestModeTitle}>{item.title}.</Text>
            <Text style={styles.sideQuestModeCopy}>{item.copy}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={item.action} style={styles.primaryButton} onPress={() => showNativeOnlyNotice("Multiplayer Side Quest creation and public joining are being kept inside the app next — no website jump.")}>
              <Text style={styles.primaryButtonText}>{item.action}</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.groupquestsHowCard} accessibilityLabel="How Multiplayer Side Quests work">
        <View style={styles.sectionHeadMobile}>
          <Text style={styles.sectionTitle}>Create. Invite. Play. Prove.</Text>
        </View>
        <View style={styles.groupquestsHowGrid}>
          {overviewSteps.map((step, index) => (
            <Pressable key={step.title} accessibilityRole={step.href ? "button" : undefined} style={styles.groupquestsHowStep} onPress={step.href ? () => showNativeOnlyNotice("Multiplayer Side Quest setup will stay in the app instead of opening the website.") : undefined}>
              <Text style={styles.groupquestsHowNumber}>{index + 1}</Text>
              <Text style={styles.groupquestsHowTitle}>{step.title}</Text>
              <Text style={styles.groupquestsHowCopy}>{step.copy}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.groupquestsRulesCard} accessibilityLabel="Multiplayer Side Quest completion rules">
        <Text style={styles.eyebrow}>Proof rule</Text>
        <Text style={styles.sectionTitle}>Personal proof and multiplayer proof are different ledgers.</Text>
        <Text style={styles.sectionBody}>Finishing a side quest alone still counts for your account. Finishing it inside a Multiplayer Side Quest requires fresh Multiplayer Side Quest-valid proof: joined participant, eligible window, matching game rules, Multiplayer Side Quest score, and multiplayer celebration.</Text>
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Back to Side Quests" style={styles.secondaryButtonWide} onPress={() => onSelectTab("sideQuests")}>
        <Text style={styles.secondaryButtonText}>Back to Side Quests</Text>
      </Pressable>
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

function SelectedQuestDetailCard({
  challenge,
  account,
  authBridge,
  onSelectTab,
  onAccountUpdated,
}: {
  challenge: MobileChallenge;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectTab: (tab: AppTab) => void;
  onAccountUpdated: () => void;
}) {
  const [actionState, setActionState] = useState<{ busy: boolean; message: string | null; error: string | null }>({ busy: false, message: null, error: null });
  const authenticated = isAuthenticatedAccount(account);
  const completed = authenticated ? account.progress.completedChallengeIds.includes(challenge.id) : false;
  const activeQuest = authenticated && account.activeQuest?.id === challenge.id ? account.activeQuest : null;
  const badgeUrl = getChallengeCoatImageUrl(challenge);
  const latestReceipt = authenticated && account.latestReceipt?.challengeId === challenge.id ? account.latestReceipt : null;
  const actionTitle = completed ? "Quest completed. Coat of arms unlocked." : activeQuest ? `${challenge.title} is on the royal docket.` : "Pick this Side Quest.";
  const actionBody = completed
    ? "Your proof is ready. Open the victory proof, proof log, or pick the next bad idea."
    : activeQuest
      ? "Play one new eligible public game after starting this quest, then check your latest game for proof."
      : "Choose this ridiculous rule so SQC knows what to judge after your next public game.";

  async function runAction(action: "start" | "check" | "deactivate" | "reset") {
    if (!authenticated || !authBridge.isSignedIn) {
      setActionState({ busy: false, message: null, error: "Sign in with Google first to save quest progress." });
      return;
    }

    setActionState({ busy: true, message: null, error: null });
    try {
      const sessionToken = await authBridge.getSessionToken();
      const result = await runMobileQuestAction({ sessionToken, action, challengeId: challenge.id });
      setActionState({ busy: false, message: result.message, error: null });
      onAccountUpdated();
    } catch (caught) {
      setActionState({ busy: false, message: null, error: caught instanceof Error ? caught.message : "Could not update this Side Quest." });
    }
  }

  return (
    <View style={styles.questCard} accessibilityLabel={`${challenge.title} details`}>
      <View style={styles.questCardHeader}>
        <View style={styles.questCardCopy}>
          <Text style={styles.eyebrow}>Selected Side Quest</Text>
          <Text style={styles.questTitle}>{challenge.title}</Text>
          <Text style={styles.questObjective}>{challenge.objective}</Text>
        </View>
        <View style={styles.badgeImageFrame}>{badgeUrl ? <Image source={{ uri: badgeUrl }} style={styles.badgeImage} resizeMode="contain" /> : <Text style={styles.badgeFallbackText}>{challenge.badgeIdentity.motif}</Text>}</View>
      </View>

      <View style={styles.questFlavorCard}>
        <Text style={styles.questFlavor}>{challenge.flavor}</Text>
      </View>

      <View style={styles.questInstructionCard}>
        <Text style={styles.instructionLabel}>What SQC checks</Text>
        <Text style={styles.instructionCopy}>{challenge.instruction}</Text>
        <Text style={styles.openingHint}>{challenge.openingHint}</Text>
      </View>

      <View style={styles.requirementPairRow}>
        <View style={styles.requirementPill}>
          <Text style={styles.requirementLabel}>Side</Text>
          <Text style={styles.requirementValue}>{challenge.requirement.side}</Text>
        </View>
        <View style={styles.requirementPill}>
          <Text style={styles.requirementLabel}>Result</Text>
          <Text style={styles.requirementValue}>{challenge.requirement.result}</Text>
        </View>
      </View>

      <View style={styles.proofActionCard}>
        <Text style={styles.proofActionTitle}>{actionTitle}</Text>
        <Text style={styles.proofActionBody}>{actionBody}</Text>
        <View style={styles.buttonRow}>
          {completed && (activeQuest?.proofHref || latestReceipt?.proofHref) ? (
            <Pressable accessibilityRole="button" accessibilityLabel="View victory proof" style={styles.primaryButton} onPress={() => onSelectTab("account")}>
              <Text style={styles.primaryButtonText}>View victory proof</Text>
            </Pressable>
          ) : null}
          {completed ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Open proof log" style={styles.secondaryButton} onPress={() => onSelectTab("account")}>
              <Text style={styles.secondaryButtonText}>Open proof log</Text>
            </Pressable>
          ) : activeQuest ? (
            <>
              <Pressable accessibilityRole="button" accessibilityLabel="Check latest game" style={styles.primaryButton} disabled={actionState.busy} onPress={() => void runAction("check")}>
                <Text style={styles.primaryButtonText}>{actionState.busy ? "Checking…" : "Check latest game"}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Reset quest" style={styles.secondaryButton} disabled={actionState.busy} onPress={() => void runAction("reset")}>
                <Text style={styles.secondaryButtonText}>Reset quest</Text>
              </Pressable>
            </>
          ) : (
            <Pressable accessibilityRole="button" accessibilityLabel="Start this Side Quest" style={styles.primaryButton} disabled={actionState.busy} onPress={() => void runAction("start")}>
              <Text style={styles.primaryButtonText}>{actionState.busy ? "Starting…" : "Start this Side Quest"}</Text>
            </Pressable>
          )}
          <Pressable accessibilityRole="button" accessibilityLabel="Stay in app" style={styles.secondaryButton} onPress={() => showNativeOnlyNotice("This quest detail is already open in the app — no website jump needed.")}>
            <Text style={styles.secondaryButtonText}>Stay in app</Text>
          </Pressable>
        </View>
        {latestReceipt ? <Text style={styles.successCopy}>{latestReceipt.headline} · {latestReceipt.detail}</Text> : null}
        {actionState.message ? <Text style={styles.successCopy}>{actionState.message}</Text> : null}
        {actionState.error ? <Text style={styles.errorCopy}>{actionState.error}</Text> : null}
      </View>
    </View>
  );
}

function getMobileAccountNextStep(account: MobileAccountState) {
  if (!account.chessAccounts.hasAny) {
    return {
      title: "Connect your chess username.",
      copy: "Add a public Lichess or Chess.com username first. SQC never needs your chess-site password.",
      href: "/connect",
      cta: "Connect chess account",
    };
  }

  if (!account.activeQuest) {
    return {
      title: "Pick one side quest.",
      copy: "Choose the ridiculous rule SQC should judge after your next public game.",
      href: "/challenges",
      cta: "Choose a Side Quest",
    };
  }

  if (account.activeQuest.completed) {
    return {
      title: "Your latest side quest is complete.",
      copy: "The coat of arms is unlocked. Open the proof, admire the paperwork, then pick the next bad idea.",
      href: account.activeQuest.proofHref || account.activeQuest.href.replace(getApiBaseUrl(), "") || "/account",
      cta: account.activeQuest.proofHref ? "View victory proof" : "Open completed quest",
    };
  }

  return {
    title: `${account.activeQuest.title} is on the royal docket — play one new eligible game, then check the proof.`,
    copy: "SQC will inspect your latest public game after this quest started and decide whether the bad idea counts.",
    href: account.activeQuest.href.replace(getApiBaseUrl(), "") || `/challenges/${account.activeQuest.id}`,
    cta: "Open active quest",
  };
}


function AccountShell({
  bootstrap,
  account,
  authBridge,
  onSelectTab,
  onSelectChallenge,
  onAccountUpdated,
}: {
  bootstrap: MobileBootstrap;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectTab: (tab: AppTab) => void;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
  onAccountUpdated: () => void;
}) {
  if (!isAuthenticatedAccount(account)) {
    const signedInButRejected = authBridge.isSignedIn && account?.authenticated === false;
    const primaryLabel = authBridge.configured ? "Sign in with Google" : "Open sign in";
    const handlePrimaryPress = () => {
      if (authBridge.startGoogleSignIn) {
        return void authBridge.startGoogleSignIn();
      }
      return showNativeOnlyNotice("Native Google sign-in is unavailable in this build, so the app will not open the website fallback.");
    };

    return (
      <View style={styles.screenStack}>
        <View style={styles.accountAuthCopyCard}>
          <WebsiteGradientGlows />
          <Text style={styles.accountAuthTitle}>Sign in, then go make terrible chess decisions.</Text>
          <Text style={styles.accountAuthHeroCopy}>Logging in lets Side Quest Chess remember your profile, public chess usernames, active side quest, badges, and proof cards.</Text>
          <View style={styles.authLightweightCopy} accessibilityLabel="Lightweight sign-in notes">
            <Text style={styles.authNote}><Text style={styles.authNoteStrong}>Lightweight by design.</Text> We do not need or ask for any Lichess or Chess.com passwords.</Text>
            <Text style={styles.authNote}>Use a public chess username only. SQC checks public games and stores the minimum needed to remember your quests, proof, and Coat of Arms progress.</Text>
            <Text style={styles.authNote}>You can browse Side Quests before signing in. Sign in when you want SQC to save progress, verify proof, or manage Multiplayer Quests.</Text>
          </View>
        </View>

        <View style={styles.accountAuthFormCard} accessibilityLabel="Sign in form">
          <Text style={styles.eyebrow}>Account</Text>
          <Text style={styles.cardTitle}>{signedInButRejected ? "Token is local; backend verification still needs help." : "Continue to your account."}</Text>
          <Text style={styles.cardBody}>{signedInButRejected ? "Google sign-in is local, but the website API did not accept the mobile token yet. The app stays usable while backend verification is finished." : "Use Google to save progress, verify proof, manage Multiplayer Quests, and keep your Coat of Arms progress synced."}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={primaryLabel} testID="account-primary-sign-in" style={styles.primaryButtonWide} onPress={handlePrimaryPress}>
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Browse Side Quests" style={styles.secondaryButtonWide} onPress={() => onSelectTab("sideQuests")}>
            <Text style={styles.secondaryButtonText}>Browse Side Quests</Text>
          </Pressable>
        </View>

        <MobileAccountStatesCard authBridge={authBridge} account={account} />
      </View>
    );
  }

  const signedInAccount = account;
  const nextStep = getMobileAccountNextStep(signedInAccount);
  const activeChallenge = signedInAccount.activeQuest?.id ? bootstrap.challenges.find((challenge) => challenge.id === signedInAccount.activeQuest?.id) ?? null : null;

  function handleNextStepPress() {
    if (!signedInAccount.chessAccounts.hasAny) {
      showNativeOnlyNotice("Use the chess username fields on this account page — the app will not open the website connect page.");
      return;
    }

    if (!signedInAccount.activeQuest) {
      onSelectTab("sideQuests");
      return;
    }

    if (signedInAccount.activeQuest.id) {
      onSelectChallenge(signedInAccount.activeQuest.id, "sideQuests");
      return;
    }

    showNativeOnlyNotice("This account action will stay inside the app instead of opening the website.");
  }
  const activeBadgeUrl = account.activeQuest?.badgeImageUrl ?? (activeChallenge ? getChallengeCoatImageUrl(activeChallenge) : null);

  return (
    <View style={styles.screenStack}>
      <View style={styles.currentMissionCard} accessibilityLabel="Current mission">
        <View style={styles.currentMissionCopy}>
          <Text style={styles.eyebrow}>Current mission</Text>
          <Text style={styles.currentMissionName}>{signedInAccount.profile.displayName}</Text>
          <View style={styles.accountStatusStrip} accessibilityLabel="Connected chess accounts">
            <Text style={signedInAccount.chessAccounts.lichessUsername ? styles.accountStatusConnected : styles.accountStatusMissing}>Lichess: <Text style={styles.accountStatusStrong}>{signedInAccount.chessAccounts.lichessUsername || "not connected"}</Text></Text>
            <Text style={signedInAccount.chessAccounts.chessComUsername ? styles.accountStatusConnected : styles.accountStatusMissing}>Chess.com: <Text style={styles.accountStatusStrong}>{signedInAccount.chessAccounts.chessComUsername || "not connected"}</Text></Text>
          </View>
          <Text style={styles.currentMissionTitle}>{nextStep.title}</Text>
          <Text style={styles.currentMissionBody}>{nextStep.copy}</Text>
          <View style={styles.buttonRow}>
            <Pressable accessibilityRole="button" accessibilityLabel={nextStep.cta} style={styles.primaryButton} onPress={handleNextStepPress}>
              <Text style={styles.primaryButtonText}>{nextStep.cta}</Text>
            </Pressable>
            {signedInAccount.activeQuest?.completed && signedInAccount.activeQuest.id ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Open completed quest" style={styles.secondaryButton} onPress={() => onSelectChallenge(signedInAccount.activeQuest?.id ?? "", "sideQuests")}>
                <Text style={styles.secondaryButtonText}>Open completed quest</Text>
              </Pressable>
            ) : null}
            <Pressable accessibilityRole="button" accessibilityLabel="Edit profile" style={styles.secondaryButton} onPress={() => showNativeOnlyNotice("Profile editing will stay native; chess usernames can already be edited below.")}>
              <Text style={styles.secondaryButtonText}>Edit profile</Text>
            </Pressable>
          </View>
          <View style={styles.currentMissionMultiplayer} accessibilityLabel="Active Multiplayer Side Quests">
            <Text style={styles.eyebrow}>Active Multiplayer Side Quests</Text>
            {signedInAccount.activeGroupQuests.length ? signedInAccount.activeGroupQuests.map((quest) => (
              <Pressable key={quest.id} accessibilityRole="button" accessibilityLabel={`Open ${quest.title}`} style={styles.activeMultiplayerRow} onPress={() => onSelectTab("multiplayerSideQuests")}>
                <Image source={{ uri: absoluteAssetUrl("/stamps/SQCBLACK%20SEAL.png") }} style={styles.activeMultiplayerSeal} resizeMode="contain" />
                <View style={styles.activeMultiplayerCopy}>
                  <Text style={styles.activeMultiplayerTitle}>{quest.title}</Text>
                  <Text style={styles.activeMultiplayerMeta}>{quest.status} · {quest.copy}</Text>
                </View>
              </Pressable>
            )) : <Text style={styles.sectionBody}>No active Multiplayer Side Quests yet.</Text>}
            <Pressable accessibilityRole="button" accessibilityLabel="Open Multiplayer Side Quests" style={styles.primaryButton} onPress={() => onSelectTab("multiplayerSideQuests")}>
              <Text style={styles.primaryButtonText}>Open Multiplayer Side Quests</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.currentMissionVisual}>
          {signedInAccount.activeQuest ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Open ${signedInAccount.activeQuest.title} quest page`} style={styles.currentMissionCoat} onPress={() => onSelectChallenge(signedInAccount.activeQuest?.id ?? "", "sideQuests")}>
              {signedInAccount.activeQuest.completed ? <Text style={styles.completedQuestStampText}>Completed quest</Text> : <Text style={styles.activeQuestStampText}>Active quest</Text>}
              {activeBadgeUrl ? <Image source={{ uri: activeBadgeUrl }} style={styles.currentMissionCoatImage} resizeMode="contain" /> : <Text style={styles.badgeFallbackText}>?</Text>}
              <Text style={styles.currentMissionCoatLabel}>{signedInAccount.activeQuest.title}</Text>
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" accessibilityLabel="Choose a quest" style={styles.currentMissionEmpty} onPress={() => onSelectTab("sideQuests")}>
              <Text style={styles.currentMissionEmptyBadge}>?</Text>
              <Text style={styles.currentMissionCoatLabel}>Choose a quest</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.questLogCollectionCard}>
        <Text style={styles.sectionTitle}>{signedInAccount.completedQuests.length ? "A deeply unnecessary trophy cabinet." : "No completed side quests yet."}</Text>
        <Text style={styles.sectionBody}>{signedInAccount.completedQuests.length ? "Officially impressive. Socially complicated. Please admire responsibly." : "No tiny heraldic paperwork yet. The shame is currently very organized."}</Text>
        <View style={styles.scoreboardRow}>
          <BigScore label="Points" value={`${signedInAccount.progress.totalRewardPoints}`} />
          <BigScore label="Coats" value={`${signedInAccount.progress.totalCompletedChallenges}`} />
          <BigScore label="Proofs" value={`${signedInAccount.progress.proofReceiptCount}`} />
        </View>
        <CompletedQuestShelf account={signedInAccount} />
      </View>

      <ChessUsernameEditor account={signedInAccount} authBridge={authBridge} onSaved={onAccountUpdated} />
      <QuestProgressStrip completed={signedInAccount.progress.totalCompletedChallenges} total={bootstrap.challenges.length} />
      <AccountNextActionsCard account={signedInAccount} />
      <MobileAccountStatesCard authBridge={authBridge} account={account} />
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
  const signedInAccount = isAuthenticatedAccount(account) ? account : null;
  const earnedIds = new Set(signedInAccount ? signedInAccount.completedQuests.map((quest) => quest.id) : []);
  const liveBadgeChallenges = bootstrap.challenges.filter((challenge) => getChallengeCoatImageUrl(challenge));
  const earnedCount = earnedIds.size;

  return (
    <View style={styles.screenStack}>
      <View style={styles.badgesHeroCard}>
        <WebsiteGradientGlows />
        <Text style={styles.badgesHeroTitle}>Every bad idea deserves a coat of arms.</Text>
        {isAuthenticatedAccount(account) ? (
          <View style={styles.coatShelfCard}>
            <View style={styles.coatShelfHeader}>
              <View style={styles.coatShelfCopy}>
                <Text style={styles.eyebrow}>Your Coat of Arms</Text>
                <Text style={styles.coatShelfTitle}>{earnedCount ? `${earnedCount} unlocked so far.` : "No completed side quests yet."}</Text>
                <Text style={styles.coatShelfBody}>{earnedCount ? "Earned coats stay bright. Locked coats remain visible so the next bad idea is easy to spot." : "Finish one quest and the coat of arms lands here with too much ceremony and not enough dignity."}</Text>
              </View>
              <Text style={earnedCount ? styles.syncedPill : styles.lockedPill}>{earnedCount}/{liveBadgeChallenges.length}</Text>
            </View>
          </View>
        ) : null}
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
        {!earned ? <Text style={styles.liveCoatLockedLabel}>Locked</Text> : null}
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

function BigScore({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.bigScore}>
      <Text style={styles.bigScoreValue}>{value}</Text>
      <Text style={styles.bigScoreLabel}>{label}</Text>
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

function showNativeOnlyNotice(message: string) {
  Alert.alert("Staying in the app", message);
}

const colors = {
  bg: "#100d0b",
  paper: "#fff7e8",
  muted: "#d5c8ad",
  gold: "#f5c86a",
  green: "#60f0af",
  red: "#ff7a66",
  panel: "rgba(255,247,232,.08)",
  panelStrong: "rgba(255,247,232,.12)",
  stroke: "rgba(255,247,232,.14)",
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#171119" },
  screen: { flex: 1, backgroundColor: "transparent" },
  appGradientFrame: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  appGradientLayer: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  appWatermarkFrame: { position: "absolute", left: -118, top: 104, width: 620, height: 620, opacity: 0.055 },
  appWatermarkImage: { width: "100%", height: "100%" },
  content: { gap: 9, padding: 12, paddingTop: 12, paddingBottom: 96 },
  scrollHintLayer: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  scrollHintPill: { position: "absolute", right: 14, minWidth: 32, minHeight: 32, alignItems: "center", justifyContent: "center", paddingHorizontal: 7, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.16)", backgroundColor: "rgba(255,247,232,.075)", opacity: 0.72 },
  screenStack: { gap: 9 },
  heroCard: {
    overflow: "hidden",
    gap: 14,
    padding: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(245,200,106,.3)",
    backgroundColor: "#171119",
  },
  heroGlowOne: { position: "absolute", right: -80, top: -70, width: 190, height: 190, borderRadius: 95, backgroundColor: "rgba(245,200,106,.18)" },
  heroGlowTwo: { position: "absolute", left: -70, bottom: -90, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(151,70,255,.18)" },
  cardGradientFrame: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, opacity: 1 },
  cardGradientLayer: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  homeHeroCard: { overflow: "hidden", gap: 11, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  homeHeroTitle: { color: colors.paper, fontSize: 34, fontWeight: "900", letterSpacing: -1.8, lineHeight: 37 },
  homeHeroBody: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  homeHeroActions: { gap: 10 },
  buttonEmphasis: { fontWeight: "900" },
  whereBeginCard: { gap: 9, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(245,200,106,.12)" },
  heroismChoiceList: { gap: 10 },
  heroismChoiceCard: { flexDirection: "row", alignItems: "center", gap: 9, padding: 10, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(0,0,0,.18)" },
  heroismBadgeFrame: { width: 58, height: 66, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(245,200,106,.2)" },
  heroismBadgeImage: { width: 52, height: 60 },
  heroismChoiceCopy: { flex: 1, gap: 3 },
  heroismChoiceLabel: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  heroismChoiceSmall: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  heroismChoiceCta: { color: colors.gold, fontSize: 13, fontWeight: "900" },
  heroismCustomPath: { color: colors.gold, fontSize: 14, fontWeight: "900", textDecorationLine: "underline" },
  multiplayerCalloutCard: { gap: 8, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(245,200,106,.08)" },
  homeStatusCard: { gap: 9, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.08)" },
  sideQuestHubHero: { overflow: "hidden", gap: 8, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  sideQuestHubTitle: { color: colors.paper, fontSize: 34, fontWeight: "900", letterSpacing: -0.5, lineHeight: 37 },
  sideQuestHubCopy: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  sideQuestModeGrid: { gap: 12 },
  sideQuestModeCard: { gap: 8, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  groupModeCard: { borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(245,200,106,.08)" },
  groupquestsHero: { gap: 8, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  groupquestsHeroTitle: { color: colors.paper, fontSize: 34, fontWeight: "900", letterSpacing: -1.7, lineHeight: 37 },
  groupquestsHeroCopy: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  groupquestsStoryCard: { gap: 16, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  groupquestsStoryCopy: { gap: 10 },
  groupquestsProcessGraphic: { alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: "rgba(0,0,0,.16)", overflow: "hidden" },
  groupquestsKnightArt: { width: "100%", height: 230 },
  groupquestsLoggedOutActions: { gap: 12 },
  groupquestsActionCard: { gap: 11, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  groupquestsHowCard: { gap: 14, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  groupquestsHowGrid: { gap: 10 },
  groupquestsHowStep: { gap: 5, padding: 13, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.18)" },
  groupquestsHowNumber: { color: colors.gold, fontSize: 22, fontWeight: "900" },
  groupquestsHowTitle: { color: colors.paper, fontSize: 18, fontWeight: "900" },
  groupquestsHowCopy: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  groupquestsRulesCard: { gap: 11, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(245,200,106,.08)" },
  sideQuestModeTitle: { color: colors.paper, fontSize: 23, fontWeight: "900", letterSpacing: -0.9, lineHeight: 26 },
  sideQuestModeCopy: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  questFilterPanel: { gap: 14, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  questFilterTitle: { color: colors.paper, fontSize: 24, fontWeight: "900", letterSpacing: -0.9 },
  questFilterGrid: { gap: 10 },
  filterField: { gap: 5 },
  filterLabel: { color: colors.muted, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  filterValue: { color: colors.paper, fontSize: 15, fontWeight: "900", paddingHorizontal: 12, paddingVertical: 11, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,247,232,.15)", backgroundColor: "rgba(0,0,0,.2)" },
  filterResetButton: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.18)", opacity: 0.62 },
  filterResetText: { color: colors.muted, fontWeight: "900" },
  availableQuestGrid: { gap: 12 },
  sideQuestSection: { gap: 13, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  sectionHeadMobile: { gap: 6 },
  challengeCardMobile: { gap: 9, padding: 12, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  challengeCardMobileFeatured: { borderColor: "rgba(245,200,106,.42)", backgroundColor: "rgba(245,200,106,.1)" },
  challengeCardMobileActive: { borderColor: "rgba(96,240,175,.5)", backgroundColor: "rgba(96,240,175,.1)" },
  challengeCardMobileCompleted: { borderColor: "rgba(245,200,106,.35)" },
  activeQuestStampText: { alignSelf: "flex-start", overflow: "hidden", color: "#17120c", backgroundColor: colors.green, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  completedQuestStampText: { alignSelf: "flex-start", overflow: "hidden", color: "#17120c", backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  questCardMetaMobile: { flexDirection: "row", alignItems: "center", gap: 8 },
  questPointsMobile: { color: colors.gold, fontSize: 13, fontWeight: "900" },
  difficultyBadgeMobile: { overflow: "hidden", color: colors.paper, fontSize: 11, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(255,247,232,.1)" },
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
  badgesHeroCard: { overflow: "hidden", gap: 11, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  badgesHeroTitle: { color: colors.paper, fontSize: 34, fontWeight: "900", letterSpacing: -0.5, lineHeight: 37, textAlign: "center" },
  liveCoatRoster: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  liveCoatRosterItem: { width: "30%", minWidth: 88, alignItems: "center", gap: 3, paddingVertical: 3 },
  liveCoatBadgeFrame: { width: 68, height: 72, alignItems: "center", justifyContent: "center" },
  liveCoatBadgeFrameLocked: { opacity: 0.5 },
  liveCoatBadgeImage: { width: 66, height: 66 },
  liveCoatBadgeImageLocked: { opacity: 0.34 },
  liveCoatLockedLabel: { position: "absolute", bottom: 2, overflow: "hidden", color: colors.paper, fontSize: 8, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.6, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 999, backgroundColor: "rgba(0,0,0,.58)", borderWidth: 1, borderColor: "rgba(255,247,232,.16)" },
  liveCoatRosterTitle: { color: colors.paper, fontSize: 11, fontWeight: "900", lineHeight: 13, textAlign: "center" },
  badgeMeaningList: { gap: 12 },
  badgeMeaningCard: { flexDirection: "row", gap: 10, padding: 11, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  badgeMeaningArtLink: { width: 76, alignItems: "center", justifyContent: "center" },
  badgeMeaningArtLocked: {},
  badgeMeaningImage: { width: 72, height: 82 },
  badgeMeaningImageLocked: { opacity: 0.74 },
  badgeMeaningCopy: { flex: 1, gap: 10 },
  badgeMeaningTitle: { color: colors.paper, fontSize: 21, lineHeight: 23, fontWeight: "900", letterSpacing: -0.7 },
  badgeMeaningRows: { gap: 7 },
  badgeMeaningRow: { gap: 2 },
  badgeMeaningTerm: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  badgeMeaningDefinition: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  websiteRitualCard: { gap: 8, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(245,200,106,.12)" },
  websiteRitualSteps: { gap: 9 },
  navBrandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  logoMark: { width: 38, height: 38, borderRadius: 13 },
  navBrandCopy: { flex: 1 },
  navKicker: { color: colors.paper, fontWeight: "900", fontSize: 15, letterSpacing: -0.2 },
  navSub: { color: colors.muted, fontWeight: "800", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 },
  navSubPill: { overflow: "hidden", color: "#17120c", fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.gold },
  buildPill: { maxWidth: 128, color: "#17120c", fontSize: 9, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.gold, overflow: "hidden" },
  heroMainRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  heroCopyBlock: { flex: 1, gap: 7 },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
  title: { color: colors.paper, fontSize: 28, fontWeight: "900", letterSpacing: -1.7, lineHeight: 29 },
  heroCopy: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  heroBadgeFrame: { width: 88, height: 104, alignItems: "center", justifyContent: "center", borderRadius: 26, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(0,0,0,.26)" },
  heroBadgeFrameCompact: { width: 68, height: 78, alignItems: "center", justifyContent: "center", borderRadius: 22, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(0,0,0,.26)" },
  heroBadgeImage: { width: 82, height: 96 },
  heroBadgeImageCompact: { width: 62, height: 72 },
  heroBadgeGlyph: { color: colors.gold, fontSize: 54, fontWeight: "900" },
  heroStatsRow: { flexDirection: "row", gap: 8 },
  miniStat: { flex: 1, gap: 3, padding: 10, borderRadius: 16, backgroundColor: "rgba(0,0,0,.26)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  miniStatLabel: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  miniStatValue: { color: colors.paper, fontSize: 14, fontWeight: "900" },
  loadingCard: { alignItems: "center", gap: 12, padding: 24 },
  muted: { color: colors.muted },
  offlineCard: { gap: 12, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: "rgba(96,240,175,.34)", backgroundColor: "rgba(96,240,175,.09)" },
  offlineHeaderRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  offlineIcon: { width: 36, height: 36, textAlign: "center", textAlignVertical: "center", borderRadius: 18, overflow: "hidden", color: colors.green, fontSize: 22, backgroundColor: "rgba(0,0,0,.22)" },
  offlineHeaderCopy: { flex: 1, gap: 4 },
  offlineTitle: { color: colors.paper, fontSize: 18, fontWeight: "900" },
  offlineCopy: { color: colors.muted, lineHeight: 20 },
  errorCopy: { color: "#ffd6cf", lineHeight: 20 },
  primaryButton: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 999, backgroundColor: colors.gold },
  primaryButtonWide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 999, backgroundColor: colors.gold },
  primaryButtonText: { color: "#17120c", fontWeight: "900" },
  secondaryButton: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.18)", backgroundColor: "rgba(255,247,232,.08)" },
  secondaryButtonWide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.18)", backgroundColor: "rgba(255,247,232,.08)" },
  secondaryButtonText: { color: colors.paper, fontWeight: "900" },
  quickStartCard: { gap: 13, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.34)", backgroundColor: "rgba(255,247,232,.08)" },
  quickStartTopRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  quickStartCopy: { flex: 1, gap: 5 },
  quickStartTitle: { color: colors.paper, fontSize: 23, fontWeight: "900", letterSpacing: -1, lineHeight: 25 },
  quickStartBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  quickScoreRail: { width: 76, gap: 2, alignItems: "center", justifyContent: "center", padding: 10, borderRadius: 20, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  quickScoreValue: { color: colors.gold, fontSize: 26, fontWeight: "900", lineHeight: 28 },
  quickScoreValueSmall: { color: colors.green, fontSize: 18, fontWeight: "900", marginTop: 5, lineHeight: 20 },
  quickScoreLabel: { color: colors.muted, fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.6 },
  quickActionStack: { gap: 9 },
  questFlowStrip: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, padding: 10, borderRadius: 16, backgroundColor: "rgba(0,0,0,.18)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  questFlowStep: { flex: 1, color: colors.paper, fontSize: 12, fontWeight: "900", textAlign: "center" },
  questFlowArrow: { color: colors.gold, fontSize: 13, fontWeight: "900" },
  accountModeStrip: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 16, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(96,240,175,.18)" },
  accountModeDot: { color: colors.green, fontSize: 10 },
  accountModeCopy: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: "800" },
  parityDockCard: { gap: 13, padding: 16, borderRadius: 26, borderWidth: 1, borderColor: "rgba(151,70,255,.34)", backgroundColor: "rgba(151,70,255,.1)" },
  parityDockHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  parityDockHeaderCopy: { flex: 1, gap: 5 },
  parityDockTitle: { color: colors.paper, fontSize: 22, fontWeight: "900", letterSpacing: -0.9, lineHeight: 24 },
  parityDockBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  parityModePill: { overflow: "hidden", color: "#120a20", fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.gold },
  parityRouteGrid: { gap: 9 },
  parityRouteButton: { flexDirection: "row", alignItems: "center", gap: 11, padding: 12, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.2)" },
  parityRouteIcon: { width: 34, height: 34, textAlign: "center", textAlignVertical: "center", borderRadius: 17, overflow: "hidden", color: colors.gold, fontSize: 20, backgroundColor: "rgba(255,247,232,.08)" },
  parityRouteCopy: { flex: 1, gap: 2 },
  parityRouteTitle: { color: colors.paper, fontSize: 15, fontWeight: "900" },
  parityRouteBody: { color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  paritySafetyStrip: { flexDirection: "row", gap: 10, alignItems: "center", padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.18)", borderWidth: 1, borderColor: "rgba(96,240,175,.18)" },
  firstRunCard: { gap: 12, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(245,200,106,.14)" },
  firstRunTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.8 },
  firstRunSteps: { gap: 9 },
  bottomNavBar: { flexDirection: "row", gap: 6, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 8, borderTopWidth: 1, borderColor: "rgba(245,200,106,.34)", backgroundColor: "rgba(255,247,232,.12)" },
  bottomNavItem: { position: "relative", overflow: "hidden", flex: 1, minHeight: 58, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,247,232,.06)", backgroundColor: "rgba(255,247,232,.045)" },
  bottomNavItemActive: { borderColor: "rgba(245,200,106,.86)", backgroundColor: "rgba(245,200,106,.26)", shadowColor: colors.gold, shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  bottomNavActiveDot: { width: 18, height: 3, borderRadius: 999, backgroundColor: colors.gold, marginTop: 2 },
  bottomNavIconFrame: { width: 28, height: 26, alignItems: "center", justifyContent: "center", transform: [{ translateY: 0 }] },
  bottomNavIconFrameActive: { transform: [{ translateY: -1 }] },
  bottomNavLogoImage: { width: 34, height: 34, borderRadius: 9 },
  bottomNavSideQuestImage: { width: 31, height: 31 },
  bottomNavCoatImage: { width: 28, height: 28 },
  bottomNavText: { color: "#e8dcc3", fontSize: 10, fontWeight: "900" },
  bottomNavTextActive: { color: colors.paper },
  tabRail: { gap: 8, paddingRight: 18 },
  tabPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.stroke, backgroundColor: "rgba(255,247,232,.055)" },
  tabPillActive: { borderColor: "rgba(245,200,106,.78)", backgroundColor: "rgba(245,200,106,.16)" },
  tabIcon: { color: colors.muted, fontWeight: "900" },
  tabText: { color: colors.muted, fontWeight: "900" },
  tabTextActive: { color: colors.paper },
  sectionHeader: { gap: 6, paddingHorizontal: 2 },
  sectionTitle: { color: colors.paper, fontSize: 25, fontWeight: "900", letterSpacing: -1.1, lineHeight: 28 },
  sectionBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  questListCard: { overflow: "hidden", flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 26, borderWidth: 1, borderColor: colors.stroke, backgroundColor: colors.panel },
  questListCardActive: { borderColor: "rgba(245,200,106,.72)", backgroundColor: "rgba(245,200,106,.13)", shadowColor: colors.gold, shadowOpacity: 0.28, shadowRadius: 18, elevation: 3 },
  selectedCornerPill: { position: "absolute", top: 0, right: 0, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 5, borderBottomLeftRadius: 14, color: "#17120c", backgroundColor: colors.gold, fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.7 },
  questNumberPill: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "rgba(0,0,0,.3)" },
  questNumber: { color: colors.gold, fontWeight: "900", fontSize: 12 },
  questListCopy: { flex: 1, gap: 4 },
  questListMode: { color: colors.green, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  questListTitle: { color: colors.paper, fontSize: 19, lineHeight: 21, fontWeight: "900", letterSpacing: -0.7 },
  questListObjective: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  questListReward: { color: colors.gold, fontSize: 12, fontWeight: "800" },
  questMetaRow: { gap: 6, alignItems: "flex-start" },
  rarityPill: { overflow: "hidden", alignSelf: "flex-start", color: colors.paper, fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(255,247,232,.1)" },
  questListBadgeFrame: { width: 68, height: 78, alignItems: "center", justifyContent: "center" },
  questListBadge: { width: 68, height: 78 },
  questListGlyph: { color: colors.gold, fontSize: 32 },
  questCard: { gap: 16, padding: 18, borderRadius: 30, borderWidth: 1, borderColor: colors.stroke, backgroundColor: colors.panel },
  questCardHeader: { flexDirection: "row", gap: 14, alignItems: "center" },
  questCardCopy: { flex: 1, gap: 8 },
  questTitle: { color: colors.paper, fontSize: 32, fontWeight: "900", letterSpacing: -1.6, lineHeight: 32 },
  questObjective: { color: colors.muted, fontSize: 16, lineHeight: 22 },
  badgeImageFrame: { width: 112, height: 128, alignItems: "center", justifyContent: "center", borderRadius: 30, backgroundColor: "rgba(0,0,0,.18)", borderWidth: 1, borderColor: "rgba(245,200,106,.22)" },
  badgeImage: { width: 104, height: 120 },
  badgeFallbackText: { color: colors.gold, fontSize: 34, fontWeight: "900" },
  questFlavorCard: { padding: 14, borderRadius: 20, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  questFlavor: { color: colors.paper, fontSize: 15, fontWeight: "700", lineHeight: 22 },
  questInstructionCard: { gap: 6, padding: 14, borderRadius: 20, backgroundColor: "rgba(245,200,106,.1)", borderWidth: 1, borderColor: "rgba(245,200,106,.22)" },
  instructionLabel: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  instructionCopy: { color: colors.paper, fontSize: 15, fontWeight: "800", lineHeight: 22 },
  openingHint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  catalogQuickStats: { flexDirection: "row", gap: 10 },
  factGrid: { gap: 8 },
  fact: { gap: 4, padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(255,247,232,.075)" },
  factLabel: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  factValue: { color: colors.paper, fontSize: 14, fontWeight: "800" },
  rulesTitle: { color: colors.paper, fontSize: 18, fontWeight: "900" },
  rule: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  authCard: { gap: 9, padding: 14, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.28)", backgroundColor: "rgba(245,200,106,.09)" },
  accountAuthCopyCard: { overflow: "hidden", gap: 10, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  accountAuthTitle: { color: colors.paper, fontSize: 31, fontWeight: "900", letterSpacing: -1.35, lineHeight: 35 },
  accountAuthHeroCopy: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  authLightweightCopy: { gap: 10, padding: 14, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,247,232,.11)", backgroundColor: "rgba(255,247,232,.055)" },
  authNote: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  authNoteStrong: { color: colors.paper, fontWeight: "900" },
  accountAuthFormCard: { gap: 8, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  currentMissionCard: { gap: 10, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  currentMissionCopy: { gap: 8 },
  currentMissionName: { color: colors.paper, fontSize: 30, fontWeight: "900", letterSpacing: -1.5, lineHeight: 33 },
  accountStatusStrip: { gap: 4, padding: 9, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.18)" },
  accountStatusConnected: { color: colors.green, fontSize: 12, fontWeight: "800" },
  accountStatusMissing: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  accountStatusStrong: { color: colors.paper, fontWeight: "900" },
  currentMissionTitle: { color: colors.paper, fontSize: 22, fontWeight: "900", letterSpacing: -1, lineHeight: 25 },
  currentMissionBody: { color: colors.muted, fontSize: 14, lineHeight: 19 },
  currentMissionMultiplayer: { gap: 7, padding: 10, borderRadius: 20, borderWidth: 1, borderColor: "rgba(96,240,175,.2)", backgroundColor: "rgba(96,240,175,.07)" },
  activeMultiplayerRow: { flexDirection: "row", gap: 10, alignItems: "center", padding: 10, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.18)" },
  activeMultiplayerSeal: { width: 36, height: 36 },
  activeMultiplayerCopy: { flex: 1, gap: 2 },
  activeMultiplayerTitle: { color: colors.paper, fontSize: 14, fontWeight: "900" },
  activeMultiplayerMeta: { color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  currentMissionVisual: { alignItems: "center" },
  currentMissionCoat: { width: "100%", gap: 7, alignItems: "center", padding: 10, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(0,0,0,.2)" },
  currentMissionCoatImage: { width: 112, height: 126 },
  currentMissionCoatLabel: { color: colors.paper, fontSize: 15, fontWeight: "900", textAlign: "center" },
  currentMissionEmpty: { width: "100%", gap: 10, alignItems: "center", padding: 18, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(0,0,0,.18)" },
  currentMissionEmptyBadge: { width: 72, height: 72, textAlign: "center", textAlignVertical: "center", borderRadius: 36, overflow: "hidden", color: colors.gold, fontSize: 38, fontWeight: "900", backgroundColor: "rgba(255,247,232,.08)" },
  questLogCollectionCard: { gap: 9, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(245,200,106,.12)" },
  readinessCard: { gap: 10, padding: 14, borderRadius: 24, borderWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.075)" },
  readinessTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  readinessBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  panelCard: { gap: 9, padding: 12, borderRadius: 30, borderWidth: 1, borderColor: colors.stroke, backgroundColor: colors.panel },
  cardTitle: { color: colors.paper, fontSize: 23, fontWeight: "900", letterSpacing: -1.0, lineHeight: 26 },
  cardBody: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  scoreboardRow: { flexDirection: "row", gap: 6 },
  bigScore: { flex: 1, alignItems: "center", gap: 1, padding: 8, borderRadius: 18, backgroundColor: "rgba(0,0,0,.22)" },
  bigScoreValue: { color: colors.gold, fontSize: 21, fontWeight: "900" },
  bigScoreLabel: { color: colors.paper, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  noticeStrip: { flexDirection: "row", gap: 10, alignItems: "center", padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.18)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  noticeIcon: { fontSize: 18 },
  noticeCopy: { flex: 1, color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },

  actionPlanCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(96,240,175,.075)", borderWidth: 1, borderColor: "rgba(96,240,175,.22)" },
  actionPlanTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.8, lineHeight: 24 },
  actionPlanSteps: { gap: 9 },
  requirementPairRow: { flexDirection: "row", gap: 9 },
  requirementPill: { flex: 1, gap: 4, padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(245,200,106,.16)" },
  requirementLabel: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  requirementValue: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  mobileQuestActionCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(245,200,106,.09)", borderWidth: 1, borderColor: "rgba(245,200,106,.26)" },
  mobileQuestActionTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.8, lineHeight: 24 },
  mobileQuestActionBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  proofPrepCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(151,70,255,.11)", borderWidth: 1, borderColor: "rgba(151,70,255,.28)" },
  proofPrepTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  accountChecklistCard: { gap: 8, padding: 11, borderRadius: 24, backgroundColor: "rgba(255,247,232,.08)", borderWidth: 1, borderColor: "rgba(255,247,232,.13)" },
  accountChecklistTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  heraldryCard: { gap: 12, padding: 16, borderRadius: 24, backgroundColor: "rgba(151,70,255,.11)", borderWidth: 1, borderColor: "rgba(151,70,255,.28)" },
  heraldryHeader: { flexDirection: "row", gap: 12, alignItems: "center" },
  heraldryGlyph: { width: 46, height: 46, textAlign: "center", textAlignVertical: "center", color: colors.gold, fontSize: 26, fontWeight: "900", borderRadius: 23, backgroundColor: "rgba(0,0,0,.24)", overflow: "hidden" },
  heraldryHeaderCopy: { flex: 1, gap: 3 },
  heraldryTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.6 },
  heraldryMotto: { color: colors.gold, fontSize: 13, fontWeight: "800" },
  progressCard: { gap: 9, padding: 14, borderRadius: 20, backgroundColor: "rgba(0,0,0,.18)", borderWidth: 1, borderColor: "rgba(96,240,175,.2)" },
  progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressTitle: { color: colors.paper, fontSize: 15, fontWeight: "900" },
  progressPercent: { color: colors.green, fontSize: 15, fontWeight: "900" },
  progressTrack: { overflow: "hidden", height: 10, borderRadius: 999, backgroundColor: "rgba(255,247,232,.085)" },
  progressFill: { height: 10, borderRadius: 999, backgroundColor: colors.green },
  usernameEditorCard: { gap: 8, padding: 11, borderRadius: 24, backgroundColor: "rgba(96,240,175,.075)", borderWidth: 1, borderColor: "rgba(96,240,175,.24)" },
  usernameEditorTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  usernameEditorBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  inputStack: { gap: 7 },
  inputLabel: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  textInput: { color: colors.paper, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.15)", backgroundColor: "rgba(0,0,0,.22)", fontSize: 15, fontWeight: "800" },
  successCopy: { color: colors.green, fontSize: 13, lineHeight: 18, fontWeight: "800" },
  momentumCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 20, backgroundColor: "rgba(245,200,106,.08)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  momentumIcon: { width: 38, height: 38, textAlign: "center", textAlignVertical: "center", borderRadius: 19, overflow: "hidden", fontSize: 22, backgroundColor: "rgba(0,0,0,.2)" },
  momentumCopy: { flex: 1, gap: 3 },
  momentumTitle: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  momentumBody: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  trophyShelf: { gap: 10, padding: 14, borderRadius: 20, backgroundColor: "rgba(245,200,106,.08)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  trophyRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  trophyBadge: { width: 46, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "rgba(0,0,0,.22)" },
  trophyImage: { width: 42, height: 48 },
  trophyGlyph: { color: colors.gold, fontSize: 22 },
  trophyCopy: { flex: 1, gap: 2 },
  trophyTitle: { color: colors.paper, fontSize: 15, fontWeight: "900" },
  trophyMeta: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  stateBoardCard: { gap: 8, padding: 11, borderRadius: 24, backgroundColor: "rgba(96,240,175,.075)", borderWidth: 1, borderColor: "rgba(96,240,175,.22)" },
  stateBoardTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.8 },
  stateBoardBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  stateTimeline: { gap: 9 },
  statusRibbon: { flexDirection: "row", gap: 12, alignItems: "center", padding: 14, borderRadius: 20, backgroundColor: "rgba(245,200,106,.1)", borderWidth: 1, borderColor: "rgba(245,200,106,.2)" },
  statusRibbonIcon: { fontSize: 27 },
  statusRibbonCopy: { flex: 1, gap: 3 },
  statusRibbonTitle: { color: colors.paper, fontSize: 17, fontWeight: "900", textTransform: "uppercase" },
  statusRibbonBody: { color: colors.muted, lineHeight: 19 },
  checkerFlow: { gap: 10 },
  flowStep: { flexDirection: "row", gap: 8, padding: 9, borderRadius: 18, backgroundColor: "rgba(0,0,0,.18)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  flowStepDone: { borderColor: "rgba(96,240,175,.34)", backgroundColor: "rgba(96,240,175,.08)" },
  flowCheck: { color: colors.green, fontSize: 17, fontWeight: "900" },
  flowCopy: { flex: 1, gap: 3 },
  flowTitle: { color: colors.paper, fontWeight: "900", fontSize: 15 },
  flowBody: { color: colors.muted, lineHeight: 19 },
  confidenceCard: { flexDirection: "row", gap: 12, alignItems: "center", padding: 14, borderRadius: 20, backgroundColor: "rgba(255,247,232,.055)", borderWidth: 1, borderColor: "rgba(255,247,232,.13)" },
  confidenceIcon: { width: 40, height: 40, textAlign: "center", textAlignVertical: "center", borderRadius: 20, overflow: "hidden", fontSize: 22, backgroundColor: "rgba(0,0,0,.22)" },
  confidenceCopy: { flex: 1, gap: 3 },
  confidenceTitle: { color: colors.paper, fontSize: 16, fontWeight: "900" },
  confidenceBody: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  proofScrollCard: { gap: 13, padding: 20, paddingTop: 50, borderRadius: 30, borderWidth: 1, borderColor: "rgba(245,200,106,.38)", backgroundColor: "rgba(255,247,232,.1)" },
  proofSeal: { position: "absolute", top: 14, right: 16, width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 27, backgroundColor: "#9e1d24", borderWidth: 2, borderColor: "rgba(255,255,255,.28)" },
  proofSealText: { color: "#ffe3b3", fontWeight: "900", fontSize: 13 },
  coatHeroFrame: { alignSelf: "center", width: 188, height: 212, alignItems: "center", justifyContent: "center", borderRadius: 42, borderWidth: 1, borderColor: "rgba(245,200,106,.34)", backgroundColor: "rgba(0,0,0,.24)", shadowColor: colors.gold, shadowOpacity: 0.24, shadowRadius: 18, elevation: 4 },
  coatHeroImage: { width: 170, height: 194 },
  proofPreviewBadgeFrame: { alignSelf: "center", width: 138, height: 154, alignItems: "center", justifyContent: "center", borderRadius: 34, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(0,0,0,.2)" },
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
  lockedPill: { overflow: "hidden", color: colors.paper, fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,247,232,.13)" },
  syncedPill: { overflow: "hidden", color: "#07110d", fontSize: 10, fontWeight: "900", textTransform: "uppercase", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.green },
  coatShelfPreviewRow: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  coatShelfTile: { width: "48%", minWidth: 132, flexGrow: 1, gap: 7, padding: 10, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.2)" },
  coatShelfTileLocked: { opacity: 0.78, borderColor: "rgba(245,200,106,.18)" },
  coatShelfBadgeFrame: { alignSelf: "center", width: 78, height: 88, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: "rgba(0,0,0,.24)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
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
