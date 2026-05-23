/* eslint-disable jsx-a11y/alt-text, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ClerkProvider, useAuth, useClerk, useSSO, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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
  type ImageSourcePropType,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getApiBaseUrl, fetchMobileAccountState, fetchMobileBootstrap, runMobileQuestAction, updateMobileChessUsernames } from "./src/api/sqc";
import { clerkPublishableKey, clerkTokenCache, isClerkMobileAuthConfigured } from "./src/auth/clerk";
import { OFFLINE_MOBILE_BOOTSTRAP } from "./src/data/offlineBootstrap";
import type { MobileAccountResponse, MobileAccountState, MobileBootstrap, MobileChallenge } from "./src/types/sqc";

type AppTab = "home" | "sideQuests" | "multiplayerSideQuests" | "coatOfArms" | "account";

type BrowseQuest = MobileChallenge & {
  browseKind: "live" | "coming-soon";
  releaseDate?: string;
};

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


const CHALLENGE_COAT_IMAGE_ASSETS: Record<string, ImageSourcePropType> = {
  "finish-any-game": require("./assets/badges/v6/proof-loop-test-badge.png"),
  "knights-before-coffee": require("./assets/badges/v6/knights-before-coffee-badge.png"),
  "bishop-field-trip": require("./assets/badges/v6/bishop-field-trip-badge.png"),
  "early-king-walk": require("./assets/badges/v6/early-king-walk-badge.png"),
  "pawn-only-picnic": require("./assets/badges/v7/coming-soon-clean/pawn-only-picnic-badge.png"),
  "back-rank-goblin": require("./assets/badges/v7/coming-soon-clean/back-rank-goblin-badge.png"),
  "late-castle-lifestyle": require("./assets/badges/v7/coming-soon-clean/late-castle-lifestyle-badge.png"),
  "rook-lift-internship": require("./assets/badges/v7/coming-soon-clean/rook-lift-internship-badge.png"),
  "queen-side-quest": require("./assets/badges/v7/coming-soon-clean/queen-side-quest-badge.png"),
  "queen-never-heard-of-her": require("./assets/badges/v4/queen-never-heard-of-her.png"),
  "no-castle-club": require("./assets/badges/v4/no-castle-club-badge.png"),
  "the-blunder-gambit": require("./assets/badges/v4/the-blunder-gambit-badge.png"),
  "knightmare-mode": require("./assets/badges/v4/knightmare-mode-badge.png"),
};

const CHALLENGE_COAT_GLOW_ASSETS: Record<string, ImageSourcePropType> = {
  "finish-any-game": require("./assets/badges/glow/finish-any-game-glow.png"),
  "knights-before-coffee": require("./assets/badges/glow/knights-before-coffee-glow.png"),
  "bishop-field-trip": require("./assets/badges/glow/bishop-field-trip-glow.png"),
  "early-king-walk": require("./assets/badges/glow/early-king-walk-glow.png"),
  "pawn-only-picnic": require("./assets/badges/glow/pawn-only-picnic-glow.png"),
  "queen-never-heard-of-her": require("./assets/badges/glow/queen-never-heard-of-her-glow.png"),
  "no-castle-club": require("./assets/badges/glow/no-castle-club-glow.png"),
  "the-blunder-gambit": require("./assets/badges/glow/the-blunder-gambit-glow.png"),
  "knightmare-mode": require("./assets/badges/glow/knightmare-mode-glow.png"),
};

const DIFFICULTY_RANK: Record<string, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
  Brutal: 4,
  Absurd: 5,
};

const MOBILE_COMING_SOON_QUESTS: BrowseQuest[] = [
  {
    id: "back-rank-goblin",
    title: "Back Rank Goblin",
    objective: "Deliver a back-rank mate with maximum goblin energy.",
    instruction: "Coming soon: trap the king behind its own furniture and finish the game with a back-rank mate.",
    openingHint: "The escape square was a myth.",
    reward: 120,
    category: "Style Kill",
    difficulty: "Easy",
    completionRate: "Coming soon",
    flavor: "Classic chess punishment, but wearing a tiny goblin hat.",
    badge: "No Exit Permit",
    proofCallout: "Back-rank mate · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
    badgeIdentity: {
      name: "Rank Goblin",
      motif: "♜",
      rarity: "Coming soon token",
      unlockCopy: "Win by making the back rank feel like a locked broom closet.",
      imageUrl: absoluteAssetUrl("/badges/v7/coming-soon-clean/back-rank-goblin-badge.png"),
      colors: { primary: "#76a9ff", secondary: "#60f0af", glow: "rgba(118,169,255,.38)" },
      heraldry: {
        shield: "Midnight blue field with a rook sealing three tiny escape doors.",
        charge: "Locked back rank",
        crest: "Goblin key",
        motto: "No Door, No Mercy",
        meaning: "The locked rank records a king trapped by its own pieces; the key belongs to the attacker.",
        weirdness: "A home-security badge for deeply unsafe kings.",
      },
    },
    browseKind: "coming-soon",
    releaseDate: "2026-05-28",
  },
  {
    id: "late-castle-lifestyle",
    title: "Late Castle Lifestyle",
    objective: "Castle after move 15, then win like the delay was strategic.",
    instruction: "Coming soon: wait far too long to castle, finally do it, then claim the king was fashionably late.",
    openingHint: "Safety arrived after the afterparty started.",
    reward: 180,
    category: "Restriction",
    difficulty: "Medium",
    completionRate: "Coming soon",
    flavor: "Not refusing safety. Just ghosting it for fifteen moves.",
    badge: "Fashionably Fortified",
    proofCallout: "Castled after move 15 · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
    badgeIdentity: {
      name: "Late Castle",
      motif: "♔",
      rarity: "Coming soon badge",
      unlockCopy: "Delay castling until it feels socially awkward, then win.",
      imageUrl: absoluteAssetUrl("/badges/v7/coming-soon-clean/late-castle-lifestyle-badge.png"),
      colors: { primary: "#a78bfa", secondary: "#f5c86a", glow: "rgba(167,139,250,.4)" },
      heraldry: {
        shield: "Purple dusk field with a crown arriving at a tower under a tiny moon.",
        charge: "Delayed castle gate",
        crest: "Pocket clock",
        motto: "Eventually Secure",
        meaning: "The clock marks the delayed castle; the tower proves the king finally accepted help.",
        weirdness: "Royal time management with tactical consequences.",
      },
    },
    browseKind: "coming-soon",
    releaseDate: "2026-06-04",
  },
  {
    id: "rook-lift-internship",
    title: "Rook Lift Internship",
    objective: "Lift a rook before move 18 and make the internship pay off.",
    instruction: "Coming soon: send a rook up the board early, pretend it has a badge, and win.",
    openingHint: "The rook asked for field experience.",
    reward: 220,
    category: "Style Quest",
    difficulty: "Medium",
    completionRate: "Coming soon",
    flavor: "A career-development program for castles with ambition.",
    badge: "Junior Tower Energy",
    proofCallout: "Early rook lift · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
    badgeIdentity: {
      name: "Rook Intern",
      motif: "♜",
      rarity: "Coming soon badge",
      unlockCopy: "Lift a rook early and convert the suspicious career move into a win.",
      imageUrl: absoluteAssetUrl("/badges/v7/coming-soon-clean/rook-lift-internship-badge.png"),
      colors: { primary: "#e87922", secondary: "#f5c86a", glow: "rgba(232,121,34,.38)" },
      heraldry: {
        shield: "Orange-gold field with a rook climbing a ladder over three files.",
        charge: "Rook on ladder",
        crest: "Intern badge",
        motto: "Promoted Too Soon",
        meaning: "The climbing rook marks the early lift; the badge means it was definitely not qualified.",
        weirdness: "Corporate mobility for a medieval tower.",
      },
    },
    browseKind: "coming-soon",
    releaseDate: "2026-06-11",
  },
  {
    id: "queen-side-quest",
    title: "Queen Side Quest",
    objective: "Win while your queen never leaves the first rank.",
    instruction: "Coming soon: a streamer-hard restriction quest where the queen stays in headquarters for the whole public-game win.",
    openingHint: "The queen is managing from headquarters and refusing media questions.",
    reward: 900,
    category: "Streamer Hard",
    difficulty: "Brutal",
    completionRate: "Coming soon · streamer-hard",
    flavor: "Maximum power, minimum commute, maximum chat disbelief.",
    badge: "Remote Royalty",
    proofCallout: "Queen stayed on first rank · won the game",
    rules: [],
    requirement: { side: "either", result: "win" },
    badgeIdentity: {
      name: "Desk Queen",
      motif: "♛",
      rarity: "Coming soon brutal relic",
      unlockCopy: "Win while the queen refuses to leave the executive floor.",
      imageUrl: absoluteAssetUrl("/badges/v7/coming-soon-clean/queen-side-quest-badge.png"),
      colors: { primary: "#ff5f9f", secondary: "#a78bfa", glow: "rgba(255,95,159,.44)" },
      heraldry: {
        shield: "Deep pink field with a queen behind a gold desk and unopened battle map.",
        charge: "Stationary queen",
        crest: "Office crown",
        motto: "Lead From Home",
        meaning: "The desk queen marks royal restraint; the unopened map shows all ambition stayed local.",
        weirdness: "Remote work policy for the most powerful piece.",
      },
    },
    browseKind: "coming-soon",
    releaseDate: "2026-06-18",
  },
];

const SQC_COAT_OF_ARMS_ASSET = require("./assets/sqc-coat-of-arms.png") as ImageSourcePropType;
const SQC_BLACK_SEAL_ASSET = require("./assets/stamps/sqc-black-seal.png") as ImageSourcePropType;
const SQC_GOLD_SEAL_ASSET = require("./assets/stamps/sqc-gold-seal.png") as ImageSourcePropType;
const SQC_SILVER_SEAL_ASSET = require("./assets/stamps/sqc-silver-seal.png") as ImageSourcePropType;
const SQC_BRONZE_SEAL_ASSET = require("./assets/stamps/sqc-bronze-seal.png") as ImageSourcePropType;
const SQC_COMPLETED_RED_SEAL_ASSET = require("./assets/stamps/quest-complete-red-wax-sqc-v15.png") as ImageSourcePropType;

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
  { id: "home", label: "Today", iconKind: "image", imagePath: "/brand/sqc-alt-logo-topbar-20260507-v2.png" },
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

  const refreshCurrentScreen = useCallback(async () => {
    const accountForRefresh = shell.bootstrap ? getDevTrackerPreviewAccount(shell.account, shell.bootstrap) : shell.account;
    const activeQuestId = isAuthenticatedAccount(accountForRefresh) && accountForRefresh.activeQuest && !accountForRefresh.activeQuest.completed
      ? accountForRefresh.activeQuest.id
      : null;

    setShell((current) => ({ ...current, refreshing: true }));
    try {
      if (shell.activeTab === "home" && activeQuestId && authBridge.isSignedIn) {
        const sessionToken = await authBridge.getSessionToken();
        await runMobileQuestAction({ sessionToken, action: "check", challengeId: activeQuestId });
        await loadAccount();
        return;
      }

      await refreshBoardAndAccount();
    } finally {
      setShell((current) => ({ ...current, refreshing: false }));
    }
  }, [authBridge, loadAccount, refreshBoardAndAccount, shell.account, shell.activeTab, shell.bootstrap]);

  useEffect(() => {
    const bootstrapTimer = setTimeout(() => void loadBootstrap(), 0);
    return () => clearTimeout(bootstrapTimer);
  }, [loadBootstrap]);

  useEffect(() => {
    const accountTimer = setTimeout(() => void loadAccount(), 0);
    return () => clearTimeout(accountTimer);
  }, [loadAccount]);

  useEffect(() => {
    if (!authBridge.isLoaded || !authBridge.isSignedIn || isAuthenticatedAccount(shell.account)) {
      return;
    }

    const retryTimers = [400, 1100, 2500, 4500].map((delay) => setTimeout(() => void loadAccount(), delay));
    return () => retryTimers.forEach(clearTimeout);
  }, [authBridge.isLoaded, authBridge.isSignedIn, loadAccount, shell.account]);

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

  const displayAccount = useMemo(() => (shell.bootstrap ? getDevTrackerPreviewAccount(shell.account, shell.bootstrap) : shell.account), [shell.account, shell.bootstrap]);
  const canScrollUp = scrollState.y > 18;
  const canScrollDown = scrollState.contentHeight > 0 && scrollState.viewportHeight > 0 && scrollState.y + scrollState.viewportHeight < scrollState.contentHeight - 18;
  const activeBackdropChallenge = useMemo(() => {
    if (!shell.bootstrap || !isAuthenticatedAccount(displayAccount) || !displayAccount.activeQuest?.id) return null;
    return shell.bootstrap.challenges.find((challenge) => challenge.id === displayAccount.activeQuest?.id) ?? null;
  }, [displayAccount, shell.bootstrap]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} translucent={false} />
      <GradientBackdrop challenge={activeBackdropChallenge} />
      <View pointerEvents="none" style={styles.appWatermarkFrame}>
        <Image source={{ uri: absoluteAssetUrl("/sqc-logo-v11.png") }} style={styles.appWatermarkImage} resizeMode="contain" />
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 34, 54) }]}
        refreshControl={<RefreshControl tintColor="#f5c86a" refreshing={shell.refreshing} onRefresh={() => void refreshCurrentScreen()} />}
        scrollEventThrottle={32}
        onScroll={handleScroll}
        onLayout={handleViewportLayout}
        onContentSizeChange={handleContentSizeChange}
      >
        {shell.loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#f5c86a" />
            <Text style={styles.muted}>Loading the live quest board...</Text>
          </View>
        ) : null}

        {shell.catalogMode === "offline" && !shell.bootstrap && !__DEV__ ? (
          <View style={styles.catalogStateBanner} accessibilityLabel="Offline catalog notice">
            <Text style={styles.catalogStateTitle}>Side Quest board unavailable</Text>
            <Text style={styles.catalogStateCopy}>SQC could not refresh the Side Quest board. Pull to try again.</Text>
          </View>
        ) : null}

        {shell.bootstrap && selectedChallenge ? (
          <>
            <ActiveScreen
              activeTab={shell.activeTab}
              bootstrap={shell.bootstrap}
              catalogMode={shell.catalogMode}
              selectedChallenge={selectedChallenge}
              account={displayAccount}
              authBridge={authBridge}
              onSelectChallenge={selectChallenge}
              onSelectTab={selectTab}
              onAccountUpdated={() => void loadAccount()}
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );

}


function TopTrackerNav({ activeTab, account: _account, onSelectTab }: { activeTab: AppTab; account: MobileAccountResponse | null; onSelectTab: (tab: AppTab) => void }) {
  return (
    <View style={compactStyles.topNavPanel} accessibilityLabel="SQC tracker sections">
      <View style={compactStyles.topNavRail}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.id }}
            accessibilityLabel={`Open ${tab.label}`}
            testID={`mobile-top-nav-${tab.id}`}
            style={[compactStyles.topNavChip, activeTab === tab.id && compactStyles.topNavChipActive]}
            onPress={() => onSelectTab(tab.id)}
          >
            <Text style={[compactStyles.topNavChipText, activeTab === tab.id && compactStyles.topNavChipTextActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ScrollHintOverlay({ canScrollUp, canScrollDown, bottomInset }: { canScrollUp: boolean; canScrollDown: boolean; bottomInset: number }) {
  if (!canScrollUp && !canScrollDown) return null;

  const bottomHintOffset = Math.max(126, bottomInset + 118);

  return (
    <View pointerEvents="none" style={styles.scrollHintLayer}>
      <View style={[styles.scrollHintPill, { bottom: bottomHintOffset }]}>
        {canScrollUp ? <MaterialCommunityIcons name="chevron-up" size={18} color="rgba(255,247,232,.72)" /> : null}
        {canScrollDown ? <MaterialCommunityIcons name="chevron-down" size={18} color="rgba(255,247,232,.72)" /> : null}
      </View>
    </View>
  );
}


function TodayDashboard({
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
  const signedIn = isAuthenticatedAccount(account) ? account : null;
  const latestReceipt = signedIn?.latestReceipt;
  const activeChallenge = signedIn?.activeQuest?.id ? bootstrap.challenges.find((challenge) => challenge.id === signedIn.activeQuest?.id) ?? null : null;
  const activeCoatSource = activeChallenge
    ? getChallengeCoatImageSource(activeChallenge)
    : { uri: absoluteAssetUrl("/badges/v6/proof-loop-test-badge.png") };
  const activeQuestReceipt = latestReceipt?.challengeId === signedIn?.activeQuest?.id ? latestReceipt : null;
  const latestCheckText = activeQuestReceipt?.headline ? normalizeCheckHeadline(activeQuestReceipt.headline) : null;
  const latestCheckPassed = Boolean(latestCheckText?.toLowerCase().includes("passed"));
  const latestProofHref = signedIn?.activeQuest?.proofHref ?? activeQuestReceipt?.proofHref ?? null;
  const canViewCurrentProof = Boolean(signedIn?.activeQuest?.completed || (latestCheckPassed && latestProofHref));
  const activeStatus = signedIn?.activeQuest?.completed || latestCheckPassed ? "Completed" : signedIn?.activeQuest ? "In progress" : "No active Side Quest";
  const activeQuestGoal = activeChallenge?.objective ?? activeChallenge?.proofCallout ?? "Choose one Side Quest to attempt in your next real chess game.";
  const activeQuestNote = signedIn?.activeQuest?.completed
    ? `Unlocked: ${activeChallenge?.badgeIdentity.name ?? "Coat of Arms"}`
    : signedIn?.activeQuest
      ? `Latest check: ${formatLatestCheckTime(activeQuestReceipt?.checkedAt ?? signedIn.activeQuest.verifiedAt)}`
      : "Pick a Side Quest before your next game.";
  const activeMultiplayer = signedIn?.activeGroupQuests ?? [];
  const officialPublic = signedIn?.officialPublicGroupQuests ?? [];
  const hasChessAccount = Boolean(signedIn?.chessAccounts.hasAny);
  const [actionState, setActionState] = useState<{ busy: boolean; message: string | null; error: string | null }>({ busy: false, message: null, error: null });
  const [currentDetailOpen, setCurrentDetailOpen] = useState(false);

  function handleSignIn() {
    if (authBridge.startGoogleSignIn) return void authBridge.startGoogleSignIn();
    showNativeOnlyNotice("Native Google sign-in is not configured in this build.");
  }

  async function runActiveCheck() {
    if (!signedIn?.activeQuest?.id || signedIn.activeQuest.completed) return;
    if (!authBridge.isSignedIn) {
      onAccountUpdated();
      setActionState({ busy: false, message: "Updated account state.", error: null });
      return;
    }

    setActionState({ busy: true, message: null, error: null });
    try {
      const sessionToken = await authBridge.getSessionToken();
      const result = await runMobileQuestAction({ sessionToken, action: "check", challengeId: signedIn.activeQuest.id });
      setActionState({ busy: false, message: result.message, error: null });
      onAccountUpdated();
    } catch (caught) {
      setActionState({ busy: false, message: null, error: caught instanceof Error ? caught.message : "Could not check this Side Quest." });
    }
  }

  if (!signedIn) {
    return (
      <View style={compactStyles.freshShell}>
        <View style={compactStyles.freshHeader}>
          <Text style={compactStyles.freshTitle}>Side Quest Chess</Text>
          <Text style={compactStyles.freshSubtle}>Logged-in app preview</Text>
        </View>
        <View style={compactStyles.freshPanel}>
          <Text style={compactStyles.freshSectionTitle}>Sign in first.</Text>
          <Text style={compactStyles.freshBody}>The native app is built around your active Side Quest, checks, proof, and Multiplayer Side Quests.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Sign in with Google" style={compactStyles.primaryAction} onPress={handleSignIn}>
            <Text style={compactStyles.primaryActionText}>Sign in with Google</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={compactStyles.freshShell}>
      <View style={compactStyles.freshHeader}>
        <View style={compactStyles.identityBlock}>
          <AccountIdentityLine
            name={signedIn.profile.displayName}
            lichessUsername={signedIn.chessAccounts.lichessUsername}
            chessComUsername={signedIn.chessAccounts.chessComUsername}
          />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open account settings" style={compactStyles.accountDot} onPress={() => onSelectTab("account")}>
          <Text style={compactStyles.accountDotText}>{signedIn.profile.displayName.slice(0, 1).toUpperCase()}</Text>
        </Pressable>
      </View>

      {!hasChessAccount ? (
        <Pressable accessibilityRole="button" style={compactStyles.blockerPanel} onPress={() => onSelectTab("account")}>
          <Text style={compactStyles.blockerTitle}>Connect a chess username</Text>
          <Text style={compactStyles.blockerCopy}>SQC needs Lichess or Chess.com before it can check real games.</Text>
        </Pressable>
      ) : null}

      <View style={compactStyles.appSection}>
        <View style={compactStyles.panelHeaderRow}>
          <Text style={compactStyles.freshSectionTitle}>My Solo Side Quest</Text>
        </View>
        {signedIn.activeQuest ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Open Current Active Side Quest details" style={compactStyles.freshPanel} onPress={() => setCurrentDetailOpen(true)}>
            {activeStatus === "Completed" ? (
              <View style={compactStyles.currentStatusRow}>
                <Text style={[compactStyles.statusPill, compactStyles.statusPillGood]}>{activeStatus}</Text>
              </View>
            ) : null}
            <View style={compactStyles.currentQuestRow}>
              <View style={compactStyles.coatMarker}>
                {activeChallenge ? <Image source={getChallengeCoatGlowSource(activeChallenge.id)} style={[compactStyles.coatMarkerGlowImage, { tintColor: activeChallenge.badgeIdentity.colors.glow }]} resizeMode="contain" /> : null}
                <Image source={activeCoatSource} style={compactStyles.coatMarkerImage} resizeMode="contain" />
              </View>
              <View style={compactStyles.currentQuestText}>
                <Text style={compactStyles.currentQuestTitle} numberOfLines={2}>{signedIn.activeQuest.title}</Text>
                <Text style={compactStyles.currentQuestMeta} numberOfLines={2}><Text style={compactStyles.currentQuestMetaStrong}>Goal: </Text>{activeQuestGoal}</Text>
                <Text style={compactStyles.currentQuestSupport} numberOfLines={1}>{latestCheckPassed ? "Verified in your latest game." : activeQuestNote}</Text>
              </View>
            </View>
            {canViewCurrentProof ? (
              <View style={compactStyles.actionRowTight}>
                <Pressable accessibilityRole="button" style={compactStyles.primaryAction} onPress={() => void openExternalAppUrl(latestProofHref ?? "/account")}>
                  <Text style={compactStyles.primaryActionText}>View result</Text>
                </Pressable>
              </View>
            ) : null}
            {actionState.message ? <Text style={compactStyles.inlineSuccess}>{actionState.message}</Text> : null}
            {actionState.error ? <Text style={compactStyles.inlineError}>{actionState.error}</Text> : null}
          </Pressable>
        ) : (
          <View style={compactStyles.emptyQuestPanel}>
            <View style={compactStyles.emptyQuestHeroRow}>
              <Image source={SQC_COAT_OF_ARMS_ASSET} style={compactStyles.emptyQuestCoat} resizeMode="contain" />
              <View style={compactStyles.currentQuestText}>
                <Text style={compactStyles.currentQuestTitle}>Choose a Solo Side Quest</Text>
                <Text style={compactStyles.currentQuestMeta}>Choose a Side Quest, play on Lichess or Chess.com, then come back for automatic proof.</Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Browse Solo Quests" style={compactStyles.primaryAction} onPress={() => onSelectTab("sideQuests")}>
              <Text style={compactStyles.primaryActionText}>Browse Solo Quests</Text>
            </Pressable>
          </View>
        )}
      </View>

      <CurrentSideQuestDetailModal
        visible={currentDetailOpen}
        signedIn={signedIn}
        challenge={activeChallenge}
        activeCoatSource={activeCoatSource}
        activeQuestGoal={activeQuestGoal}
        activeQuestNote={activeQuestNote}
        latestCheckPassed={latestCheckPassed}
        canViewCurrentProof={canViewCurrentProof}
        latestProofHref={latestProofHref}
        actionState={actionState}
        onClose={() => setCurrentDetailOpen(false)}
        onRunCheck={runActiveCheck}
        onViewProof={() => void openExternalAppUrl(latestProofHref ?? "/account")}
        onSwitchQuest={() => {
          setCurrentDetailOpen(false);
          onSelectTab("sideQuests");
        }}
      />

      <AppSection title="My Multiplayer Side Quests">
        {activeMultiplayer.length ? activeMultiplayer.map((quest) => (
          <AppRow key={quest.id} title={quest.title} meta={quest.copy} status={quest.status} imageSource={SQC_BLACK_SEAL_ASSET} variant="seal" onPress={() => void openExternalAppUrl(quest.href)} />
        )) : (
          <View style={compactStyles.emptyMultiplayerPanel}>
            <View style={compactStyles.emptyQuestHeroRow}>
              <Image source={SQC_BLACK_SEAL_ASSET} style={compactStyles.emptyMultiplayerSeal} resizeMode="contain" />
              <View style={compactStyles.currentQuestText}>
                <Text style={compactStyles.currentQuestTitle}>Join a Multiplayer Side Quest</Text>
                <Text style={compactStyles.currentQuestMeta}>Join a shared challenge when you want the same strange chess Side Quests scored against other players.</Text>
              </View>
            </View>
            <View style={compactStyles.emptyMultiplayerActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Open Multiplayer Side Quests" style={compactStyles.primaryAction} onPress={() => onSelectTab("multiplayerSideQuests")}>
                <Text style={compactStyles.primaryActionText}>Open Multiplayer Side Quests</Text>
              </Pressable>
            </View>
          </View>
        )}
      </AppSection>

      <AppSection title="Official Multiplayer Side Quests">
        {officialPublic.length ? officialPublic.map((quest) => (
          <AppRow key={quest.id} title={quest.title} meta={quest.copy} status={quest.status} imageSource={SQC_BLACK_SEAL_ASSET} variant="seal" onPress={() => void openExternalAppUrl(quest.href)} />
        )) : <AppRow title="No official rows right now" meta="Check back for the next public Multiplayer Side Quest." imageSource={SQC_BLACK_SEAL_ASSET} variant="seal" onPress={() => onSelectTab("multiplayerSideQuests")} />}
      </AppSection>

      <AppSection title="Trophy Cabinet">
        {signedIn.multiplayerTrophies?.map((trophy) => (
          <AppRow
            key={trophy.id}
            title={trophy.title}
            meta={`Multiplayer win · ${trophy.rankLabel}`}
            status={trophy.placement}
            imageSource={getMultiplayerTrophySealSource(trophy.placement)}
            variant="seal"
            onPress={() => void openExternalAppUrl(trophy.href)}
          />
        ))}
        {signedIn.completedQuests.length ? signedIn.completedQuests.slice(0, 3).map((quest) => {
          const completedChallenge = bootstrap.challenges.find((challenge) => challenge.id === quest.id) ?? null;
          return (
            <AppRow
              key={quest.id}
              title={quest.title}
              meta={`Coat of Arms: ${quest.badgeName}`}
              status={quest.proofHref ? "✓" : undefined}
              imageSource={completedChallenge ? getChallengeCoatImageSource(completedChallenge) : getRowImageSource(quest.badgeImageUrl)}
              glowSource={completedChallenge ? getChallengeCoatGlowSource(completedChallenge.id) : null}
              glowColor={completedChallenge?.badgeIdentity.colors.glow}
              onPress={() => quest.proofHref ? void openExternalAppUrl(quest.proofHref) : onSelectChallenge(quest.id, "coatOfArms")}
            />
          );
        }) : !signedIn.multiplayerTrophies?.length ? (
          <AppRow title="No completed Side Quests yet" meta="Complete a Side Quest to unlock your first Coat of Arms." onPress={() => onSelectTab("sideQuests")} />
        ) : null}
      </AppSection>

      <View style={compactStyles.pullRefreshHint}>
        <MaterialCommunityIcons name="arrow-down" size={13} color="rgba(199,189,169,.72)" />
        <Text style={compactStyles.pullRefreshHintText}>Pull down to refresh</Text>
      </View>
    </View>
  );
}

function CurrentSideQuestDetailModal({
  visible,
  signedIn,
  challenge,
  activeCoatSource,
  activeQuestGoal,
  activeQuestNote,
  latestCheckPassed,
  canViewCurrentProof,
  latestProofHref,
  actionState,
  onClose,
  onRunCheck,
  onViewProof,
  onSwitchQuest,
}: {
  visible: boolean;
  signedIn: MobileAccountState;
  challenge: MobileChallenge | null;
  activeCoatSource: ImageSourcePropType;
  activeQuestGoal: string;
  activeQuestNote: string;
  latestCheckPassed: boolean;
  canViewCurrentProof: boolean;
  latestProofHref: string | null;
  actionState: { busy: boolean; message: string | null; error: string | null };
  onClose: () => void;
  onRunCheck: () => Promise<void>;
  onViewProof: () => void;
  onSwitchQuest: () => void;
}) {
  const [coatExpanded, setCoatExpanded] = useState(false);
  const activeQuest = signedIn.activeQuest;
  if (!activeQuest) return null;

  const completed = activeQuest.completed || latestCheckPassed;
  const accountLabel = signedIn.chessAccounts.lichessUsername
    ? `lichess · ${signedIn.chessAccounts.lichessUsername}`
    : signedIn.chessAccounts.chessComUsername
      ? `chess.com · ${signedIn.chessAccounts.chessComUsername}`
      : "No chess account connected";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={compactStyles.detailScreen}>
        <GradientBackdrop challenge={challenge} />
        <View style={compactStyles.detailTopBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close Current Active Side Quest" style={compactStyles.detailCloseButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={compactStyles.detailContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={actionState.busy} tintColor={colors.gold} onRefresh={() => void onRunCheck()} />}
        >
          <View style={compactStyles.detailHero}>
            <Pressable accessibilityRole="imagebutton" accessibilityLabel="Enlarge Coat of Arms" style={compactStyles.detailCoatFrame} onPress={() => setCoatExpanded(true)}>
              {challenge ? <Image source={getChallengeCoatGlowSource(challenge.id)} style={[compactStyles.detailCoatGlowImage, { tintColor: challenge.badgeIdentity.colors.glow }]} resizeMode="contain" /> : null}
              <Image source={activeCoatSource} style={compactStyles.detailCoatImage} resizeMode="contain" />
            </Pressable>
            <Text style={compactStyles.detailEyebrow}>Current Active Side Quest</Text>
            <Text style={compactStyles.detailTitle}>{activeQuest.title}</Text>
            <Text style={compactStyles.detailGoal}>{activeQuestGoal}</Text>
            <Text style={compactStyles.detailHint}>Tap Coat of Arms</Text>
          </View>

          <View style={compactStyles.detailPanel}>
            <DetailRow label="Started" value={formatLatestCheckTime(activeQuest.startedAt)} />
            <DetailRow label="Last checked" value={activeQuest.verifiedAt ? formatLatestCheckTime(activeQuest.verifiedAt) : "Never"} />
            <DetailRow label="Difficulty" value={challenge?.difficulty ?? "Standard"} />
            <DetailRow label="Reward" value={challenge?.badgeIdentity.name ? challenge.badgeIdentity.name : "Coat of Arms"} />
          </View>

          {canViewCurrentProof ? (
            <View style={compactStyles.detailPanelStrong}>
              <Text style={compactStyles.detailPanelTitle}>Proof ready</Text>
              <Text style={compactStyles.detailPanelCopy}>Your latest eligible game completed this Side Quest.</Text>
              <Pressable accessibilityRole="button" style={compactStyles.detailPrimaryButton} onPress={onViewProof}>
                <Text style={compactStyles.detailPrimaryButtonText}>View victory proof</Text>
              </Pressable>
            </View>
          ) : (
            <View style={compactStyles.detailInlineRefresh}>
              <MaterialCommunityIcons name="arrow-down" size={13} color="rgba(245,200,106,.8)" />
              <Text style={compactStyles.detailInlineRefreshText}>{actionState.busy ? "Checking latest game…" : "Pull down to check latest game"}</Text>
            </View>
          )}
          {actionState.message ? <Text style={compactStyles.inlineSuccess}>{actionState.message}</Text> : null}
          {actionState.error ? <Text style={compactStyles.inlineError}>{actionState.error}</Text> : null}

          <Pressable accessibilityRole="button" style={compactStyles.detailSecondaryButton} onPress={onSwitchQuest}>
            <Text style={compactStyles.detailSecondaryButtonText}>Switch Side Quest</Text>
          </Pressable>
          {latestProofHref ? (
            <Pressable accessibilityRole="button" style={compactStyles.detailQuietButton} onPress={() => void openExternalAppUrl(latestProofHref)}>
              <Text style={compactStyles.detailQuietButtonText}>Open on web</Text>
            </Pressable>
          ) : null}
        </ScrollView>
        <Modal visible={coatExpanded} transparent animationType="fade" onRequestClose={() => setCoatExpanded(false)}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close enlarged Coat of Arms" style={compactStyles.coatLightbox} onPress={() => setCoatExpanded(false)}>
            <View style={compactStyles.coatLightboxCard}>
              {challenge ? <Image source={getChallengeCoatGlowSource(challenge.id)} style={[compactStyles.coatLightboxGlow, { tintColor: challenge.badgeIdentity.colors.glow }]} resizeMode="contain" /> : null}
              <Image source={activeCoatSource} style={compactStyles.coatLightboxImage} resizeMode="contain" />
              <Text style={compactStyles.coatLightboxTitle}>{challenge?.badgeIdentity.name ?? "Coat of Arms"}</Text>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

function DetailRow({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" }) {
  return (
    <View style={compactStyles.detailRow}>
      <Text style={compactStyles.detailRowLabel}>{label}</Text>
      <Text style={[compactStyles.detailRowValue, tone === "good" && compactStyles.detailRowValueGood]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function formatLatestCheckTime(value: string | null | undefined): string {
  if (!value) return "not yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "not yet";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function normalizeCheckHeadline(headline: string): string {
  return headline
    .replace(/^latest\s+/i, "")
    .replace(/^proof\s+/i, "")
    .trim()
    .toLowerCase();
}

function AccountIdentityLine({ name, lichessUsername, chessComUsername }: { name: string; lichessUsername: string | null; chessComUsername: string | null }) {
  return (
    <View style={compactStyles.identityLine} accessibilityLabel={`Signed in as ${name}`}>
      <Text style={compactStyles.identityName} numberOfLines={1}>{name}</Text>
      <View style={compactStyles.identityAccountsLine}>
        {lichessUsername ? (
          <View style={compactStyles.identityAccount}>
            <Text style={[compactStyles.identityPlatform, compactStyles.identityPlatformLichess]}>lichess</Text>
            <Text style={compactStyles.identityUsername} numberOfLines={1}>{lichessUsername}</Text>
          </View>
        ) : null}
        {chessComUsername ? (
          <View style={compactStyles.identityAccount}>
            <Text style={[compactStyles.identityPlatform, compactStyles.identityPlatformChessCom]}>chess.com</Text>
            <Text style={compactStyles.identityUsername} numberOfLines={1}>{chessComUsername}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ReadinessChip({ label, value, onPress }: { label: string; value: string | null; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={[compactStyles.readinessChip, !value && compactStyles.readinessChipMissing]} onPress={onPress}>
      <Text style={compactStyles.readinessLabel}>{label}</Text>
      <Text style={compactStyles.readinessValue} numberOfLines={1}>{value ?? "Add"}</Text>
    </Pressable>
  );
}

function AppSection({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: ReactNode }) {
  return (
    <View style={compactStyles.appSection}>
      <View style={compactStyles.panelHeaderRow}>
        <Text style={compactStyles.freshSectionTitle}>{title}</Text>
        {action && onAction ? (
          <Pressable accessibilityRole="button" onPress={onAction}>
            <Text style={compactStyles.sectionAction}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={compactStyles.appRows}>{children}</View>
    </View>
  );
}

function AppRow({
  title,
  meta,
  status,
  imageSource,
  glowSource,
  glowColor,
  variant = "coat",
  blurImage = false,
  dimImage = false,
  overlaySeal = false,
  onPress,
}: {
  title: string;
  meta: string;
  status?: string;
  imageSource?: ImageSourcePropType | null;
  glowSource?: ImageSourcePropType | null;
  glowColor?: string;
  variant?: "coat" | "seal";
  blurImage?: boolean;
  dimImage?: boolean;
  overlaySeal?: boolean;
  onPress: () => void;
}) {
  const visibleStatus = status && !["Open", "Proof", "-"].includes(status) ? status : null;
  return (
    <Pressable accessibilityRole="button" style={compactStyles.appRow} onPress={onPress}>
      {imageSource ? (
        <View style={compactStyles.rowCoatFrame}>
          {glowSource ? <Image source={glowSource} style={[compactStyles.rowCoatGlowImage, { tintColor: glowColor ?? colors.gold }]} resizeMode="contain" /> : null}
          <Image
            source={imageSource}
            style={[
              variant === "seal" ? compactStyles.rowSealImage : compactStyles.rowCoatImage,
              dimImage && compactStyles.rowCoatImageDim,
            ]}
            resizeMode="contain"
            blurRadius={blurImage ? 5 : 0}
          />
          {overlaySeal ? <Image source={SQC_COMPLETED_RED_SEAL_ASSET} style={compactStyles.rowCompletedSeal} resizeMode="contain" /> : null}
        </View>
      ) : null}
      <View style={compactStyles.appRowText}>
        <Text style={compactStyles.appRowTitle} numberOfLines={1}>{title}</Text>
        <Text style={compactStyles.appRowMeta} numberOfLines={1}>{meta}</Text>
      </View>
      {visibleStatus ? <Text style={[compactStyles.appRowStatus, visibleStatus.toLowerCase() === "joined" && compactStyles.appRowStatusJoined]} numberOfLines={1}>{visibleStatus}</Text> : null}
    </Pressable>
  );
}

function getMultiplayerTrophySealSource(placement: "Gold" | "Silver" | "Bronze"): ImageSourcePropType {
  if (placement === "Gold") return SQC_GOLD_SEAL_ASSET;
  if (placement === "Silver") return SQC_SILVER_SEAL_ASSET;
  return SQC_BRONZE_SEAL_ASSET;
}

function getChallengeCoatGlowSource(challengeId: string): ImageSourcePropType {
  return CHALLENGE_COAT_GLOW_ASSETS[challengeId] ?? CHALLENGE_COAT_GLOW_ASSETS["finish-any-game"];
}

function getRowImageSource(url: string | null): ImageSourcePropType | null {
  if (!url) return null;
  return { uri: absoluteAssetUrl(url) };
}

function FeedSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={compactStyles.feedSection}>
      <Text style={compactStyles.feedSectionTitle}>{title}</Text>
      <View style={compactStyles.feedRows}>{children}</View>
    </View>
  );
}

function FeedRow({ title, status, meta, onPress }: { title: string; status: string; meta: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={compactStyles.feedRow} onPress={onPress}>
      <View style={compactStyles.feedRowCopy}>
        <Text style={compactStyles.feedRowTitle} numberOfLines={1}>{title}</Text>
        <Text style={compactStyles.feedRowMeta} numberOfLines={1}>{meta}</Text>
      </View>
      <Text style={compactStyles.feedRowStatus} numberOfLines={1}>{status}</Text>
    </Pressable>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={compactStyles.miniStat}>
      <Text style={compactStyles.miniStatValue}>{value}</Text>
      <Text style={compactStyles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function TableRow({ label, title, state, proof, onPress }: { label: string; title: string; state: string; proof: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={compactStyles.tableRow} onPress={onPress}>
      <View style={compactStyles.tableNameCell}>
        <Text style={compactStyles.tableRowLabel}>{label}</Text>
        <Text style={compactStyles.tableRowTitle} numberOfLines={1}>{title}</Text>
      </View>
      <Text style={compactStyles.tableCell} numberOfLines={1}>{state}</Text>
      <Text style={compactStyles.tableCell} numberOfLines={1}>{proof}</Text>
    </Pressable>
  );
}

function QuestBoardDashboard({
  bootstrap,
  selectedChallenge,
  account,
  authBridge,
  onSelectChallenge,
  onSelectTab,
  onAccountUpdated,
}: {
  bootstrap: MobileBootstrap;
  selectedChallenge: MobileChallenge;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
  onSelectTab: (tab: AppTab) => void;
  onAccountUpdated: () => void;
}) {
  const [detailChallengeId, setDetailChallengeId] = useState<string | null>(null);
  const [completedDetailId, setCompletedDetailId] = useState<string | null>(null);
  const signedIn = isAuthenticatedAccount(account) ? account : null;
  const completedIds = new Set(signedIn?.progress.completedChallengeIds ?? []);
  const activeId = signedIn?.activeQuest && !signedIn.activeQuest.completed ? signedIn.activeQuest.id : null;
  const browseQuests: BrowseQuest[] = [
    ...bootstrap.challenges.map((challenge) => ({ ...challenge, browseKind: "live" as const })),
    ...MOBILE_COMING_SOON_QUESTS,
  ];
  const sortedQuests = [...browseQuests].sort((a, b) => {
    if (a.browseKind !== b.browseKind) return a.browseKind === "live" ? -1 : 1;

    const difficultyDelta = (DIFFICULTY_RANK[a.difficulty] ?? 99) - (DIFFICULTY_RANK[b.difficulty] ?? 99);
    if (difficultyDelta !== 0) return difficultyDelta;

    const rank = (challenge: BrowseQuest) => {
      if (challenge.browseKind === "coming-soon") return 3;
      if (challenge.id === activeId) return 0;
      if (completedIds.has(challenge.id)) return 2;
      return 1;
    };
    const rankDelta = rank(a) - rank(b);
    if (rankDelta !== 0) return rankDelta;

    if (a.browseKind === "coming-soon" && b.browseKind === "coming-soon") {
      const dateDelta = (a.releaseDate ?? "9999-99-99").localeCompare(b.releaseDate ?? "9999-99-99");
      if (dateDelta !== 0) return dateDelta;
    }
    if (a.reward !== b.reward) return a.reward - b.reward;
    return a.title.localeCompare(b.title);
  });
  const detailChallenge = detailChallengeId ? bootstrap.challenges.find((challenge) => challenge.id === detailChallengeId) ?? null : null;
  const completedQuestRecord = completedDetailId && signedIn ? signedIn.completedQuests.find((quest) => quest.id === completedDetailId) ?? null : null;
  const completedDetailChallenge = completedDetailId ? bootstrap.challenges.find((challenge) => challenge.id === completedDetailId) ?? null : null;

  return (
    <View style={compactStyles.stack}>
      <View style={compactStyles.browseTopBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close Browse Solo Side Quests" style={compactStyles.detailCloseButton} onPress={() => onSelectTab("home")}>
          <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
        </Pressable>
        <Text style={compactStyles.browseTopBarLabel}>Browse Solo Side Quests</Text>
      </View>

      <View style={compactStyles.appSection}>
        <View style={compactStyles.appRows}>
          {sortedQuests.map((challenge) => {
          const comingSoon = challenge.browseKind === "coming-soon";
          const active = challenge.id === activeId;
          const completed = !comingSoon && completedIds.has(challenge.id);
          const comingSoonDate = challenge.releaseDate ? formatComingSoonDate(challenge.releaseDate) : null;
          return (
            <AppRow
              key={challenge.id}
              title={challenge.title}
              meta={comingSoon ? `Coming ${comingSoonDate ?? "soon"} · ${challenge.objective}` : challenge.objective}
              status={comingSoon ? `Coming ${comingSoonDate ?? "soon"}` : completed ? "Completed" : challenge.difficulty}
              imageSource={getChallengeCoatImageSource(challenge)}
              glowSource={getChallengeCoatGlowSource(challenge.id)}
              glowColor={challenge.badgeIdentity.colors.glow}
              blurImage={comingSoon}
              dimImage={comingSoon}
              overlaySeal={completed}
              onPress={() => {
                if (comingSoon) {
                  Alert.alert(challenge.title, `Coming ${comingSoonDate ?? "soon"}.`);
                  return;
                }
                if (completed) {
                  setCompletedDetailId(challenge.id);
                  return;
                }
                onSelectChallenge(challenge.id, "sideQuests");
                setDetailChallengeId(challenge.id);
              }}
            />
          );
          })}
        </View>
      </View>

      <Modal visible={Boolean(detailChallenge)} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setDetailChallengeId(null)}>
        <SafeAreaView style={compactStyles.detailScreen}>
          <GradientBackdrop challenge={detailChallenge} />
          <View style={compactStyles.detailTopBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close Side Quest details" style={compactStyles.detailCloseButton} onPress={() => setDetailChallengeId(null)}>
              <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={compactStyles.detailContent} showsVerticalScrollIndicator={false}>
            {detailChallenge ? <SelectedQuestDetailCard challenge={detailChallenge} account={account} authBridge={authBridge} onSelectTab={onSelectTab} onAccountUpdated={onAccountUpdated} /> : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={Boolean(completedQuestRecord && completedDetailChallenge)} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setCompletedDetailId(null)}>
        <SafeAreaView style={compactStyles.detailScreen}>
          <GradientBackdrop challenge={completedDetailChallenge} />
          <View style={compactStyles.detailTopBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close completed Side Quest proof" style={compactStyles.detailCloseButton} onPress={() => setCompletedDetailId(null)}>
              <MaterialCommunityIcons name="close" size={23} color={colors.paper} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={compactStyles.detailContent} showsVerticalScrollIndicator={false}>
            {completedQuestRecord && completedDetailChallenge ? (
              <CompletedQuestProofCard
                challenge={completedDetailChallenge}
                completedQuest={completedQuestRecord}
                onOpenProof={() => void openExternalAppUrl(completedQuestRecord.proofHref ?? completedQuestRecord.href)}
                onOpenAccount={() => onSelectTab("account")}
              />
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function CoatBoardDashboard({ bootstrap, account, onSelectChallenge }: { bootstrap: MobileBootstrap; account: MobileAccountResponse | null; onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void }) {
  const signedIn = isAuthenticatedAccount(account) ? account : null;
  const earnedIds = new Set(signedIn?.progress.completedChallengeIds ?? []);
  const nextLocked = bootstrap.challenges.find((challenge) => !earnedIds.has(challenge.id));

  return (
    <View style={compactStyles.stack}>
      <View style={compactStyles.heroPanel}>
        <Text style={compactStyles.kicker}>Coat of Arms</Text>
        <Text style={compactStyles.heroTitle}>Coat of Arms: {earnedIds.size}/{bootstrap.challenges.length}</Text>
        <Text style={compactStyles.heroCopy}>{nextLocked ? `Next target: ${nextLocked.title}` : "Everything unlocked. Suspiciously heroic."}</Text>
      </View>
      <View style={compactStyles.coatGrid}>
        {bootstrap.challenges.map((challenge) => (
          <Pressable key={challenge.id} accessibilityRole="button" style={compactStyles.coatTile} onPress={() => onSelectChallenge(challenge.id, "sideQuests")}>
            <Image source={{ uri: getChallengeCoatImageUrl(challenge) ?? absoluteAssetUrl("/badges/v6/proof-loop-test-badge.png") }} style={[compactStyles.coatTileImage, !earnedIds.has(challenge.id) && compactStyles.coatTileLocked]} resizeMode="contain" />
            <Text style={compactStyles.coatTileTitle} numberOfLines={2}>{challenge.title}</Text>
            <Text style={earnedIds.has(challenge.id) ? compactStyles.earnedText : compactStyles.lockedText}>{earnedIds.has(challenge.id) ? "Unlocked" : `+${challenge.reward}`}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function AccountTrackerDashboard({ account, authBridge, onSelectTab, onAccountUpdated }: { account: MobileAccountResponse | null; authBridge: MobileAuthBridge; onSelectTab: (tab: AppTab) => void; onAccountUpdated: () => void }) {
  const signedIn = isAuthenticatedAccount(account) ? account : null;
  if (!signedIn) {
    return (
      <View style={compactStyles.stack}>
        <View style={compactStyles.heroPanel}>
          <Text style={compactStyles.kicker}>Account</Text>
          <Text style={compactStyles.heroTitle}>Sign in to sync your board.</Text>
          <Text style={compactStyles.heroCopy}>The mobile app is intentionally useful after sign-in: Side Quest state, latest proof, Coat of Arms, and connected usernames.</Text>
          <Pressable accessibilityRole="button" style={compactStyles.goldButton} onPress={() => authBridge.startGoogleSignIn ? void authBridge.startGoogleSignIn() : showNativeOnlyNotice("Native Google sign-in is not configured in this build.")}>
            <Text style={compactStyles.goldButtonText}>Sign in with Google</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={compactStyles.stack}>
      <View style={compactStyles.heroPanel}>
        <View style={compactStyles.topLine}>
          <Text style={compactStyles.kicker}>Account</Text>
          <Text style={compactStyles.livePill}>Synced</Text>
        </View>
        <Text style={compactStyles.heroTitle}>{signedIn.profile.displayName}</Text>
        <Text style={compactStyles.heroCopy}>{signedIn.chessAccounts.hasAny ? "Ready for latest-game checks." : "Add a public chess username before serious proof runs."}</Text>
        <View style={compactStyles.metricGrid}>
          <CompactMetric label="Lichess" value={signedIn.chessAccounts.lichessUsername ? "✓" : "-"} />
          <CompactMetric label="Chess.com" value={signedIn.chessAccounts.chessComUsername ? "✓" : "-"} />
          <CompactMetric label="Proofs" value={`${signedIn.progress.proofReceiptCount}`} />
        </View>
      </View>
      <View style={compactStyles.scorePanel}>
        <CompactStatusRow label="Active" title={signedIn.activeQuest?.title ?? "No active Side Quest"} meta={signedIn.activeQuest ? (signedIn.activeQuest.completed ? "Complete" : "In progress") : "Pick one from Side Quests"} onPress={() => onSelectTab("sideQuests")} />
        <CompactStatusRow label="Latest" title={signedIn.latestReceipt?.headline ?? "No receipt yet"} meta={signedIn.latestReceipt?.detail ?? "Check proof after a public game"} onPress={() => onSelectTab("sideQuests")} />
        <CompactStatusRow label="Sync" title="Refresh account" meta="Pull latest SQC state" onPress={onAccountUpdated} />
      </View>
      <ChessUsernameEditor account={signedIn} authBridge={authBridge} onSaved={onAccountUpdated} />
    </View>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={compactStyles.metricBox}>
      <Text style={compactStyles.metricValue}>{value}</Text>
      <Text style={compactStyles.metricLabel}>{label}</Text>
    </View>
  );
}

function CompactStatusRow({ label, title, meta, onPress }: { label: string; title: string; meta: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={compactStyles.statusRow} onPress={onPress}>
      <Text style={compactStyles.rowLabel}>{label}</Text>
      <View style={compactStyles.rowCopy}>
        <Text style={compactStyles.rowTitle} numberOfLines={1}>{title}</Text>
        <Text style={compactStyles.rowMeta} numberOfLines={1}>{meta}</Text>
      </View>
      <Text style={compactStyles.chevron}>›</Text>
    </Pressable>
  );
}

function CompactQuestRow({ challenge, active, completed, onPress }: { challenge: MobileChallenge; active: boolean; completed: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={compactStyles.questRow} onPress={onPress}>
      <Image source={{ uri: getChallengeCoatImageUrl(challenge) ?? absoluteAssetUrl("/badges/v6/proof-loop-test-badge.png") }} style={compactStyles.questIcon} resizeMode="contain" />
      <View style={compactStyles.rowCopy}>
        <Text style={compactStyles.rowTitle} numberOfLines={1}>{challenge.title}</Text>
        <Text style={compactStyles.rowMeta} numberOfLines={1}>{challenge.objective}</Text>
      </View>
      <View style={compactStyles.questPill}>
        <Text style={compactStyles.questPillText}>{completed ? "Done" : active ? "Now" : `+${challenge.reward}`}</Text>
      </View>
    </Pressable>
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
        <Text style={styles.homeHeroTitle}>Chess, but with stupidly hard side quests.</Text>
        <Text style={styles.homeHeroBody}>
          {isSignedIn
            ? "Pick a Solo Side Quest or join a Multiplayer Side Quest, play a real Lichess or Chess.com game, then come back for automatic proof."
            : "Sign in, connect your public chess usernames, choose one ridiculous Solo Side Quest or Multiplayer Side Quest, play on Lichess or Chess.com and let SQC check your latest public games."}
        </Text>
        <View style={styles.homeHeroActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go on a Solo Side Quest" testID="home-go-solo-side-quest" style={styles.primaryButtonWide} onPress={() => onSelectTab("sideQuests")}>
            <Text style={styles.primaryButtonText}>Go on a <Text style={styles.buttonEmphasis}>Solo</Text> Side Quest</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Join a Multiplayer Side Quest" testID="home-join-multiplayer-side-quest" style={styles.secondaryButtonWide} onPress={() => onSelectTab("multiplayerSideQuests")}>
            <Text style={styles.secondaryButtonText}>Join a <Text style={styles.buttonEmphasis}>Multiplayer</Text> Side Quest</Text>
          </Pressable>
        </View>
        <View style={styles.homeRitualStrip} accessibilityLabel="Side Quest Chess workflow">
          <Text style={styles.homeRitualStep}>Pick</Text>
          <Text style={styles.homeRitualArrow}>→</Text>
          <Text style={styles.homeRitualStep}>Play</Text>
          <Text style={styles.homeRitualArrow}>→</Text>
          <Text style={styles.homeRitualStep}>Prove</Text>
          <Text style={styles.homeRitualArrow}>→</Text>
          <Text style={styles.homeRitualStep}>Collect coat</Text>
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
          <Text style={styles.sectionTitle}>{signedInAccount?.activeQuest ? signedInAccount.activeQuest.title : "No active Solo Side Quest yet."}</Text>
          <Text style={styles.sectionBody}>{signedInAccount?.activeQuest ? "Open the active Side Quest page for rules, badge details, and the next weird chess Side Quest." : "Choose one Solo Side Quest first so My Side Quests knows which weird rule to judge after your next public game."}</Text>
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

function GradientBackdrop({ challenge }: { challenge?: MobileChallenge | null }) {
  const primary = challenge?.badgeIdentity.colors.primary ?? colors.gold;
  const secondary = challenge?.badgeIdentity.colors.secondary ?? "#ff5f9f";
  const glow = challenge?.badgeIdentity.colors.glow ?? primary;

  return (
    <View pointerEvents="none" style={styles.appGradientFrame}>
      <LinearGradient
        colors={[colorWithAlpha(glow, 0.52), colorWithAlpha(primary, 0.22), "rgba(6,5,7,.98)", "#020204"]}
        locations={[0, 0.28, 0.68, 1]}
        start={{ x: 0.34, y: 0 }}
        end={{ x: 0.78, y: 1 }}
        style={styles.appGradientLayer}
      />
      <LinearGradient
        colors={[colorWithAlpha(secondary, 0.30), colorWithAlpha(secondary, 0.09), "rgba(0,0,0,0)"]}
        locations={[0, 0.44, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.12, y: 0.74 }}
        style={styles.appGradientLayer}
      />
      <LinearGradient
        colors={["rgba(255,247,232,.08)", "rgba(245,200,106,.06)", "rgba(0,0,0,0)"]}
        locations={[0, 0.36, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.72, y: 0.5 }}
        style={styles.appGradientLayer}
      />
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
  const badgeSource = getChallengeCoatImageSource(challenge);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={cta} testID={`home-heroism-${challenge.id}`} style={styles.heroismChoiceCard} onPress={onPress}>
      <View style={styles.heroismBadgeFrame}>
        <Image source={badgeSource} style={styles.heroismBadgeImage} resizeMode="contain" />
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
        <FlowStep done title="Choose solo or multiplayer" body="Start one Side Quest for yourself, or join a Multiplayer Side Quest when the bad idea deserves witnesses." />
        <FlowStep title="Play where you already play" body="Use a normal public Lichess or Chess.com game. Side Quest Chess never asks for chess-site passwords." />
        <FlowStep title="Get the receipt" body="The latest-game checker returns passed, failed, or pending with a shareable proof card, solo progress, and multiplayer leaderboard proof when relevant." />
      </View>
    </View>
  );
}
function BottomNav({ activeTab, account, bottomInset, onSelectTab }: { activeTab: AppTab; account: MobileAccountResponse | null; bottomInset: number; onSelectTab: (tab: AppTab) => void }) {
  const authenticated = isAuthenticatedAccount(account);

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
            ) : tab.id === "account" && authenticated ? (
              <View style={[styles.bottomNavLoggedInBadge, activeTab === tab.id && styles.bottomNavLoggedInBadgeActive]}>
                <MaterialCommunityIcons name="shield-check" size={21} color={activeTab === tab.id ? "#17120c" : colors.green} />
              </View>
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
      return <TodayDashboard bootstrap={bootstrap} account={account} authBridge={authBridge} onSelectTab={onSelectTab} onSelectChallenge={onSelectChallenge} onAccountUpdated={onAccountUpdated} />;
    case "sideQuests":
    case "multiplayerSideQuests":
      return <QuestBoardDashboard bootstrap={bootstrap} selectedChallenge={selectedChallenge} account={account} authBridge={authBridge} onSelectChallenge={onSelectChallenge} onSelectTab={onSelectTab} onAccountUpdated={onAccountUpdated} />;
    case "coatOfArms":
      return <CoatBoardDashboard bootstrap={bootstrap} account={account} onSelectChallenge={onSelectChallenge} />;
    case "account":
      return <AccountTrackerDashboard account={account} authBridge={authBridge} onSelectTab={onSelectTab} onAccountUpdated={onAccountUpdated} />;
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
  const availableCount = bootstrap.challenges.length;
  const completedCount = completedIds.size;

  return (
    <View style={styles.screenStack}>
      <View style={styles.soloBrowseHero}>
        <WebsiteGradientGlows />
        <View style={styles.soloBrowseHeroRow}>
          <View style={styles.soloBrowseHeroCopy}>
            <Text style={styles.eyebrow}>Solo Side Quests</Text>
            <Text style={styles.soloBrowseHeroTitle}>Choose your next Side Quest</Text>
            <Text style={styles.soloBrowseHeroText}>Pick one Side Quest, play on Lichess or Chess.com, then come back for automatic proof.</Text>
          </View>
          <Image source={SQC_COAT_OF_ARMS_ASSET} style={styles.soloBrowseHeroCoat} resizeMode="contain" />
        </View>
        <View style={styles.soloBrowseStatsRow}>
          <Text style={styles.soloBrowseStat}>{availableCount} available</Text>
          <Text style={styles.soloBrowseStat}>{completedCount} completed</Text>
          <Text style={styles.soloBrowseStat}>{activeQuestId ? "1 active" : "none active"}</Text>
        </View>
      </View>

      <SelectedQuestDetailCard challenge={selectedChallenge} account={account} authBridge={authBridge} onSelectTab={onSelectTab} onAccountUpdated={onAccountUpdated} />

      <View style={styles.soloDeckHeader}>
        <Text style={styles.sectionTitle}>Solo Side Quest deck</Text>
        <Text style={styles.sectionBody}>Tap a Coat of Arms to review the rule, then start the Side Quest you want SQC to judge next.</Text>
      </View>
      <AvailableQuestGrid challenges={bootstrap.challenges} completedIds={completedIds} activeQuestId={activeQuestId} onSelectChallenge={onSelectChallenge} />
    </View>
  );
}

function MultiplayerSideQuestsScreen({ account, onSelectTab }: { account: MobileAccountResponse | null; onSelectTab: (tab: AppTab) => void }) {
  const signedInAccount = isAuthenticatedAccount(account) ? account : null;
  const activeGroupQuests = signedInAccount?.activeGroupQuests ?? [];
  const overviewSteps = [
    {
      title: "Create",
      copy: "Pick one or more Side Quests, set the proof window, choose invite rules, and lock the Multiplayer Side Quest constraints.",
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
  const multiplayerActions = [
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
        <Text style={styles.groupquestsHeroCopy}>Create, join, or continue a shared chess dare. The proof ledger stays separate from solo progress.</Text>
      </View>

      {activeGroupQuests.length ? (
        <View style={styles.groupquestsActiveCard} accessibilityLabel="Active Multiplayer Side Quests">
          <Text style={styles.eyebrow}>Active now</Text>
          <Text style={styles.sectionTitle}>Continue your Multiplayer Side Quest.</Text>
          {activeGroupQuests.map((quest) => (
            <View key={quest.id} style={styles.groupquestsActiveRow}>
              <Image source={{ uri: absoluteAssetUrl("/stamps/SQCBLACK%20SEAL.png") }} style={styles.activeMultiplayerSeal} resizeMode="contain" />
              <View style={styles.activeMultiplayerCopy}>
                <Text style={styles.activeMultiplayerTitle}>{quest.title}</Text>
                <Text style={styles.activeMultiplayerMeta}>{quest.status} · {quest.copy}</Text>
              </View>
            </View>
          ))}
          <View style={styles.buttonRow}>
            <View style={styles.disabledActionButton} accessibilityLabel="Native Multiplayer Side Quest detail coming soon">
              <Text style={styles.disabledActionButtonText}>Side Quest detail coming soon</Text>
            </View>
            <View style={styles.disabledSecondaryButton} accessibilityLabel="Native multiplayer proof coming soon">
              <Text style={styles.disabledSecondaryButtonText}>Proof coming soon</Text>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.groupquestsLoggedOutActions} accessibilityLabel="Start or join Multiplayer Side Quests">
        {multiplayerActions.map((item) => (
          <View style={styles.groupquestsActionCard} key={item.title}>
            <Text style={styles.sideQuestModeTitle}>{item.title}.</Text>
            <Text style={styles.sideQuestModeCopy}>{item.copy}</Text>
            <View style={styles.disabledActionButton} accessibilityLabel={`${item.action} coming soon`}>
              <Text style={styles.disabledActionButtonText}>{item.action} - coming soon</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.groupquestsStoryCard} accessibilityLabel="What Multiplayer Side Quests are">
        <View style={styles.groupquestsStoryCopy}>
          <Text style={styles.sectionTitle}>A tiny chess tournament for bad ideas.</Text>
          <Text style={styles.sectionBody}>One player creates the dare, everyone agrees on rules, then SQC checks fresh multiplayer-valid proof from normal public games.</Text>
        </View>
        <View style={styles.groupquestsProcessGraphic}>
          <Image source={{ uri: absoluteAssetUrl("/illustrations/multiplayer-side-quests-noble-chaos-coat-style.png") }} style={styles.groupquestsKnightArt} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.groupquestsHowCard} accessibilityLabel="How Multiplayer Side Quests work">
        <View style={styles.sectionHeadMobile}>
          <Text style={styles.sectionTitle}>Create. Invite. Play. Prove.</Text>
        </View>
        <View style={styles.groupquestsHowGrid}>
          {overviewSteps.map((step, index) => (
            <View key={step.title} style={styles.groupquestsHowStep}>
              <Text style={styles.groupquestsHowNumber}>{index + 1}</Text>
              <Text style={styles.groupquestsHowTitle}>{step.title}</Text>
              <Text style={styles.groupquestsHowCopy}>{step.copy}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.groupquestsRulesCard} accessibilityLabel="Multiplayer Side Quest completion rules">
        <Text style={styles.eyebrow}>Proof rule</Text>
        <Text style={styles.sectionTitle}>Personal proof and multiplayer proof are different ledgers.</Text>
        <Text style={styles.sectionBody}>Finishing a Side Quest alone still counts for your account. Finishing it inside a Multiplayer Side Quest requires fresh Multiplayer Side Quest-valid proof: joined participant, eligible window, matching game rules, Multiplayer Side Quest score, and multiplayer celebration.</Text>
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
    <View style={styles.questFilterPanel} accessibilityLabel="Side Quest filters and sorting">
      <Text style={styles.questFilterTitle}>Find your next Side Quest.</Text>
      <Text style={styles.questFilterHint}>Filters are coming soon. For now, the full live Side Quest deck is shown below.</Text>
      <View style={styles.questFilterGrid}>
        <FilterField label="Difficulty" value="All" />
        <FilterField label="Status" value="All" />
        <FilterField label="Sort" value="Recommended" />
      </View>
    </View>
  );
}

function FilterField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.filterField}>
      <Text style={styles.filterLabel}>{label}</Text>
      <Text style={styles.filterValue}>{value}</Text>
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
  const badgeSource = getChallengeCoatImageSource(challenge);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${challenge.title} Side Quest`} accessibilityState={{ selected: active }} style={[styles.challengeCardMobile, featured && styles.challengeCardMobileFeatured, active && styles.challengeCardMobileActive, completed && styles.challengeCardMobileCompleted]} onPress={onPress}>
      {active && !completed ? <Text style={styles.activeQuestStampText}>Active Side Quest</Text> : null}
      {completed ? <Text style={styles.completedQuestStampText}>Side Quest completed</Text> : null}
      <View style={styles.questCardMetaMobile}>
        <Text style={styles.questPointsMobile}>+{challenge.reward} pts</Text>
        <Text style={[styles.difficultyBadgeMobile, styles[`difficulty${challenge.difficulty}` as keyof typeof styles]]}>{challenge.difficulty}</Text>
      </View>
      <View style={styles.challengeCardTitleRowMobile}>
        <View style={styles.challengeCardBadgeMobile}>
          <Image source={badgeSource} style={styles.challengeCardBadgeImageMobile} resizeMode="contain" />
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
  const badgeSource = getChallengeCoatImageSource(challenge);
  const latestReceipt = authenticated && account.latestReceipt?.challengeId === challenge.id ? account.latestReceipt : null;
  const actionTitle = activeQuest ? `${challenge.title} is on the royal docket.` : "Pick this Side Quest.";
  const actionBody = activeQuest
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
        <View style={styles.badgeImageFrame}><Image source={badgeSource} style={styles.badgeImage} resizeMode="contain" /></View>
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

      {completed ? null : (
        <View style={styles.proofActionCard}>
          <Text style={styles.proofActionTitle}>{actionTitle}</Text>
          <Text style={styles.proofActionBody}>{actionBody}</Text>
          <View style={styles.buttonRow}>
            {activeQuest ? (
              <>
                <Pressable accessibilityRole="button" accessibilityLabel="Check latest game" style={styles.primaryButton} disabled={actionState.busy} onPress={() => void runAction("check")}>
                  <Text style={styles.primaryButtonText}>{actionState.busy ? "Checking..." : "Check latest game"}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Reset quest" style={styles.secondaryButton} disabled={actionState.busy} onPress={() => void runAction("reset")}>
                  <Text style={styles.secondaryButtonText}>Reset quest</Text>
                </Pressable>
              </>
            ) : (
              <Pressable accessibilityRole="button" accessibilityLabel="Start this Side Quest" style={styles.primaryButton} disabled={actionState.busy} onPress={() => void runAction("start")}>
                <Text style={styles.primaryButtonText}>{actionState.busy ? "Starting..." : "Start this Side Quest"}</Text>
              </Pressable>
            )}

          </View>
          {latestReceipt ? <Text style={styles.successCopy}>{latestReceipt.headline} · {latestReceipt.detail}</Text> : null}
          {actionState.message ? <Text style={styles.successCopy}>{actionState.message}</Text> : null}
          {actionState.error ? <Text style={styles.errorCopy}>{actionState.error}</Text> : null}
        </View>
      )}
    </View>
  );
}

function CompletedQuestProofCard({
  challenge,
  completedQuest,
  onOpenProof,
  onOpenAccount,
}: {
  challenge: MobileChallenge;
  completedQuest: MobileAccountState["completedQuests"][number];
  onOpenProof: () => void;
  onOpenAccount: () => void;
}) {
  const badgeSource = getChallengeCoatImageSource(challenge);

  return (
    <View style={styles.questCard} accessibilityLabel={`${challenge.title} completed proof`}>
      <View style={styles.questCardHeader}>
        <View style={styles.questCardCopy}>
          <Text style={styles.eyebrow}>Completed Side Quest</Text>
          <Text style={styles.questTitle}>{challenge.title}</Text>
          <Text style={styles.questObjective}>{challenge.objective}</Text>
        </View>
        <View style={styles.badgeImageFrame}>
          <Image source={badgeSource} style={styles.badgeImage} resizeMode="contain" />
          <Image source={SQC_COMPLETED_RED_SEAL_ASSET} style={styles.completedSealLarge} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.questFlavorCard}>
        <Text style={styles.questFlavor}>Proof complete. Coat of arms unlocked.</Text>
      </View>

      <View style={styles.requirementPairRow}>
        <View style={styles.requirementPill}>
          <Text style={styles.requirementLabel}>Difficulty</Text>
          <Text style={styles.requirementValue}>{challenge.difficulty}</Text>
        </View>
        <View style={styles.requirementPill}>
          <Text style={styles.requirementLabel}>Completed</Text>
          <Text style={styles.requirementValue}>{formatLatestCheckTime(completedQuest.completedAt)}</Text>
        </View>
      </View>

      <View style={styles.proofActionCard}>
        <Text style={styles.proofActionTitle}>Victory proof ready</Text>
        <Text style={styles.proofActionBody}>Open the proof for this Side Quest, or reset it and run the whole strange idea again.</Text>
        <View style={styles.buttonRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="View victory proof" style={styles.primaryButton} onPress={onOpenProof}>
            <Text style={styles.primaryButtonText}>View victory proof</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Open account proof log" style={styles.secondaryButton} onPress={onOpenAccount}>
            <Text style={styles.secondaryButtonText}>Account proof log</Text>
          </Pressable>
        </View>
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
      cta: account.activeQuest.proofHref ? "View proof receipt" : "Open quest details",
    };
  }

  return {
    title: `${account.activeQuest.title} is on the royal docket - play one new eligible game, then check the proof.`,
    copy: "SQC will inspect your latest public game after this quest started and decide whether the bad idea counts.",
    href: account.activeQuest.href.replace(getApiBaseUrl(), "") || `/challenges/${account.activeQuest.id}`,
    cta: "Open active Side Quest",
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
    const primaryLabel = signedInButRejected ? "Sync account" : authBridge.configured ? "Sign in with Google" : "Open sign in";
    const handlePrimaryPress = () => {
      if (signedInButRejected) {
        return onAccountUpdated();
      }

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
          <Text style={styles.accountAuthHeroCopy}>Logging in lets Side Quest Chess remember your profile, public chess usernames, active Side Quest, badges, and proof cards.</Text>
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
      showNativeOnlyNotice("Use the chess username fields on this account page - the app will not open the website connect page.");
      return;
    }

    if (!signedInAccount.activeQuest) {
      onSelectTab("sideQuests");
      return;
    }

    if (signedInAccount.activeQuest.id) {
      if (signedInAccount.activeQuest.completed && signedInAccount.activeQuest.proofHref) {
        void openExternalAppUrl(signedInAccount.activeQuest.proofHref);
        return;
      }

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
              <Pressable accessibilityRole="button" accessibilityLabel="Open quest details" style={styles.secondaryButton} onPress={() => onSelectChallenge(signedInAccount.activeQuest?.id ?? "", "sideQuests")}>
                <Text style={styles.secondaryButtonText}>Open quest details</Text>
              </Pressable>
            ) : null}
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
            <Pressable accessibilityRole="button" accessibilityLabel={signedInAccount.activeGroupQuests.length ? "Open active multiplayer quest" : "Open Multiplayer Side Quests"} style={styles.primaryButton} onPress={() => onSelectTab("multiplayerSideQuests")}>
              <Text style={styles.primaryButtonText}>{signedInAccount.activeGroupQuests.length ? "Open active multiplayer quest" : "Open Multiplayer Side Quests"}</Text>
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
      <View style={styles.disabledWideButton} accessibilityLabel="Profile editing coming soon">
        <Text style={styles.disabledSecondaryButtonText}>Profile editing coming soon</Text>
      </View>
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
  const badgeSource = getChallengeCoatImageSource(challenge);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${challenge.title} quest`} style={styles.liveCoatRosterItem} onPress={onPress}>
      <View style={[styles.liveCoatBadgeFrame, !earned && styles.liveCoatBadgeFrameLocked]}>
        <Image source={badgeSource} style={[styles.liveCoatBadgeImage, !earned && styles.liveCoatBadgeImageLocked]} resizeMode="contain" />
        {!earned ? <Text style={styles.liveCoatLockedLabel}>Locked</Text> : null}
      </View>
      <Text style={styles.liveCoatRosterTitle} numberOfLines={2}>{challenge.title}</Text>
    </Pressable>
  );
}

function BadgeMeaningCard({ challenge, earned, onPress }: { challenge: MobileChallenge; earned: boolean; onPress: () => void }) {
  const badgeSource = getChallengeCoatImageSource(challenge);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${challenge.title} quest`} style={styles.badgeMeaningCard} onPress={onPress}>
      <View style={[styles.badgeMeaningArtLink, !earned && styles.badgeMeaningArtLocked]}>
        <Image source={badgeSource} style={[styles.badgeMeaningImage, !earned && styles.badgeMeaningImageLocked]} resizeMode="contain" />
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
            <Text style={styles.badgeMeaningTerm}>Side Quest</Text>
            <Text style={styles.badgeMeaningDefinition}>{challenge.title}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function AccountNextActionsCard({ account }: { account: MobileAccountState }) {
  const hasChessAccount = account.chessAccounts.hasAny;
  const activeLabel = account.activeQuest ? account.activeQuest.title : "No active Side Quest";

  return (
    <View style={styles.accountChecklistCard}>
      <Text style={styles.eyebrow}>Next best action</Text>
      <Text style={styles.accountChecklistTitle}>{account.activeQuest ? "Keep the active Side Quest moving." : "Pick a fresh Side Quest on the board."}</Text>
      <View style={styles.checkerFlow}>
        <FlowStep done={hasChessAccount} title="Chess username" body={hasChessAccount ? "At least one chess username is connected to your SQC account." : "Add Lichess or Chess.com here before serious proof runs."} />
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
        <Text style={styles.progressTitle}>Side Quest log progress</Text>
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
      <Text style={styles.usernameEditorBody}>Save public Lichess / Chess.com usernames to your SQC account. No chess-site passwords - SQC only checks public games.</Text>
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
        <Text style={styles.primaryButtonText}>{saving ? "Saving..." : "Save usernames"}</Text>
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
      <Text style={styles.stateBoardBody}>This build names exactly which layer is active, so Android testers can tell public browsing, local Clerk, and SQC account sync apart.</Text>
      <View style={styles.stateTimeline}>
        <FlowStep done title="Public catalog" body="Side Quest board, rules, rewards, and coat previews load without native auth." />
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


function getDevTrackerPreviewAccount(account: MobileAccountResponse | null, bootstrap: MobileBootstrap): MobileAccountResponse | null {
  if (!__DEV__ || isAuthenticatedAccount(account)) return account;

  const active = bootstrap.challenges.find((challenge) => challenge.id === "queen-never-heard-of-her") ?? bootstrap.challenges[0] ?? null;
  const completed = bootstrap.challenges.filter((challenge) => challenge.id !== active?.id).slice(0, 2);

  return {
    apiVersion: 1,
    authenticated: true,
    generatedAt: new Date().toISOString(),
    profile: {
      displayName: "Andreas",
      bio: "SQC app review account",
      imageUrl: null,
    },
    chessAccounts: {
      lichessUsername: "and72nor",
      chessComUsername: "and72nor",
      hasAny: true,
    },
    progress: {
      completedChallengeIds: completed.map((challenge) => challenge.id),
      totalCompletedChallenges: completed.length,
      totalRewardPoints: completed.reduce((sum, challenge) => sum + challenge.reward, 0),
      proofReceiptCount: completed.length,
    },
    activeQuest: active
      ? {
          id: active.id,
          title: active.title,
          status: "active",
          startedAt: new Date().toISOString(),
          verifiedAt: null,
          completed: false,
          banner: "Waiting for latest-game proof",
          href: `/challenges/${active.id}`,
          proofHref: null,
          badgeImageUrl: active.badgeIdentity.imageUrl,
        }
      : null,
    activeGroupQuests: [
      {
        id: "review-room",
        title: "Friday Night Bad Ideas",
        status: "Live",
        copy: "3 players · 2d left · #2",
        href: "/groupquests/review-room",
        playersLabel: "3 players",
        timeLeftLabel: "2d left",
        positionLabel: "#2",
      },
    ],
    officialPublicGroupQuests: [
      {
        id: "official-preview-knights",
        title: "First Blood: Knights Before Coffee",
        status: "Join",
        copy: "8 players · 18h left",
        href: "/groupquests/official-preview-knights",
        playersLabel: "8 players",
        timeLeftLabel: "18h left",
        joinState: "Join",
      },
      {
        id: "official-preview-no-castle",
        title: "No Castle Club Night",
        status: "Joined",
        copy: "14 players · 2d left · #4",
        href: "/groupquests/official-preview-no-castle?accepted=1",
        playersLabel: "14 players",
        timeLeftLabel: "2d left",
        positionLabel: "#4",
        joinState: "Joined",
      },
      {
        id: "official-preview-queenless",
        title: "Queenless Gremlin Cup",
        status: "Join",
        copy: "5 players · 4d left",
        href: "/groupquests/official-preview-queenless",
        playersLabel: "5 players",
        timeLeftLabel: "4d left",
        joinState: "Join",
      },
    ],
    completedQuests: completed.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      reward: challenge.reward,
      badgeName: challenge.badgeIdentity.name,
      completedAt: new Date().toISOString(),
      href: `/challenges/${challenge.id}`,
      proofHref: `/result/${challenge.id}`,
      badgeImageUrl: challenge.badgeIdentity.imageUrl,
    })),
    multiplayerTrophies: [
      {
        id: "review-room-gold",
        title: "Friday Night Bad Ideas",
        placement: "Gold",
        rankLabel: "1st place",
        completedAt: new Date().toISOString(),
        href: "/groupquests/review-room?accepted=1",
      },
    ],
    latestReceipt: null,
  };
}

function isAuthenticatedAccount(account: MobileAccountResponse | null): account is MobileAccountState {
  return Boolean(account?.authenticated);
}

function getChallengeCoatImageSource(challenge: MobileChallenge): ImageSourcePropType {
  return CHALLENGE_COAT_IMAGE_ASSETS[challenge.id] ?? { uri: getChallengeCoatImageUrl(challenge) ?? absoluteAssetUrl("/badges/v6/proof-loop-test-badge.png") };
}

function getChallengeCoatImageUrl(challenge: MobileChallenge) {
  const imageUrl = challenge.badgeIdentity.imageUrl ?? CHALLENGE_COAT_IMAGE_PATHS[challenge.id];
  return imageUrl ? absoluteAssetUrl(imageUrl) : null;
}

function absoluteAssetUrl(url: string) {
  if (url.startsWith("http")) return url;
  return `${getApiBaseUrl()}${url.startsWith("/") ? url : `/${url}`}`;
}

function formatComingSoonDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
}

function showNativeOnlyNotice(message: string) {
  Alert.alert("Staying in the app", message);
}

async function openExternalAppUrl(url: string) {
  const absoluteUrl = url.startsWith("http") ? url : `${getApiBaseUrl()}${url.startsWith("/") ? url : `/${url}`}`;
  await WebBrowser.openBrowserAsync(absoluteUrl);
}

const colors = {
  bg: "#060507",
  paper: "#fff7e8",
  muted: "#c7bda9",
  gold: "#f5c86a",
  green: "#60f0af",
  red: "#ff7a66",
  panel: "rgba(255,247,232,.08)",
  panelStrong: "rgba(255,247,232,.12)",
  stroke: "rgba(255,247,232,.14)",
};

function colorWithAlpha(value: string | undefined, alpha: number): string {
  if (!value) return `rgba(245,200,106,${alpha})`;

  const hex = value.trim().match(/^#?([0-9a-f]{6})$/i);
  if (hex) {
    const numeric = Number.parseInt(hex[1], 16);
    const red = (numeric >> 16) & 255;
    const green = (numeric >> 8) & 255;
    const blue = numeric & 255;
    return `rgba(${red},${green},${blue},${alpha})`;
  }

  const rgba = value.trim().match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgba) return `rgba(${rgba[1]},${rgba[2]},${rgba[3]},${alpha})`;

  return value;
}

const compactStyles = StyleSheet.create({
  stack: { gap: 8 },
  freshShell: { gap: 12 },
  freshHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingHorizontal: 2, paddingTop: 0 },
  identityBlock: { flex: 1, minWidth: 0, gap: 4 },
  freshTitle: { color: colors.paper, fontSize: 24, lineHeight: 28, fontWeight: "900", letterSpacing: -.65 },
  freshSubtle: { color: colors.muted, fontSize: 12, fontWeight: "800", marginTop: 2 },
  identityLine: { gap: 4, minWidth: 0 },
  identityName: { color: colors.paper, fontSize: 17, lineHeight: 21, fontWeight: "900", letterSpacing: -.25 },
  identityAccountsLine: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", columnGap: 7, rowGap: 3 },
  identityAccount: { flexDirection: "row", alignItems: "center", gap: 4, maxWidth: "48%" },
  identityPlatform: { overflow: "hidden", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, fontSize: 8, lineHeight: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: .25 },
  identityPlatformLichess: { color: colors.green, backgroundColor: "rgba(96,240,175,.1)", borderWidth: 1, borderColor: "rgba(96,240,175,.18)" },
  identityPlatformChessCom: { color: "#76a9ff", backgroundColor: "rgba(118,169,255,.1)", borderWidth: 1, borderColor: "rgba(118,169,255,.18)" },
  identityUsername: { color: colors.paper, fontSize: 12, lineHeight: 15, fontWeight: "900" },
  accountDot: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(245,200,106,.16)", borderWidth: 1, borderColor: "rgba(245,200,106,.24)" },
  accountDotText: { color: colors.gold, fontSize: 16, fontWeight: "900" },
  readinessRow: { flexDirection: "row", gap: 8 },
  readinessChip: { flex: 1, gap: 1, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, backgroundColor: "rgba(96,240,175,.1)", borderWidth: 1, borderColor: "rgba(96,240,175,.22)" },
  readinessChipMissing: { backgroundColor: "rgba(245,200,106,.12)", borderColor: "rgba(245,200,106,.22)" },
  readinessLabel: { color: colors.muted, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: .7 },
  readinessValue: { color: colors.paper, fontSize: 13, fontWeight: "900" },
  blockerPanel: { gap: 4, padding: 12, borderRadius: 18, backgroundColor: "rgba(255,122,102,.12)", borderWidth: 1, borderColor: "rgba(255,122,102,.28)" },
  blockerTitle: { color: colors.paper, fontSize: 15, fontWeight: "900" },
  blockerCopy: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  freshPanel: { gap: 10, padding: 12, borderRadius: 20, backgroundColor: "rgba(255,255,255,.075)", borderWidth: 1, borderColor: "rgba(255,255,255,.12)" },
  emptyQuestPanel: { gap: 12, padding: 13, borderRadius: 24, backgroundColor: "rgba(255,247,232,.078)", borderWidth: 1, borderColor: "rgba(245,200,106,.22)" },
  emptyQuestHeroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  emptyQuestCoat: { width: 82, height: 82 },
  emptyMultiplayerPanel: { gap: 12, padding: 13, borderRadius: 24, backgroundColor: "rgba(255,247,232,.072)", borderWidth: 1, borderColor: "rgba(255,247,232,.14)" },
  emptyMultiplayerSeal: { width: 52, height: 52, borderRadius: 26 },
  emptyMultiplayerActions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  panelHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  currentStatusRow: { flexDirection: "row", justifyContent: "flex-end" },
  freshSectionTitle: { color: colors.paper, fontSize: 15, fontWeight: "900", letterSpacing: -.15 },
  freshBody: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  currentQuestRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  coatMarker: { width: 54, height: 60, alignItems: "center", justifyContent: "center", overflow: "visible" },
  coatMarkerGlowImage: { position: "absolute", width: 68, height: 76, opacity: .72, transform: [{ translateY: 4 }] },
  coatMarkerImage: { width: 48, height: 56 },
  currentQuestText: { flex: 1, minWidth: 0, gap: 3 },
  currentQuestTitle: { color: colors.paper, fontSize: 19, lineHeight: 22, fontWeight: "900", letterSpacing: -.35 },
  currentQuestMeta: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  currentQuestMetaStrong: { color: colors.gold, fontWeight: "900" },
  currentQuestSupport: { color: colors.paper, opacity: .82, fontSize: 12, lineHeight: 15, fontWeight: "800" },
  actionRowTight: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  primaryAction: { alignSelf: "flex-start", alignItems: "center", justifyContent: "center", paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.gold },
  primaryActionText: { color: "#111", fontSize: 13, fontWeight: "900" },
  refreshAction: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.gold },
  secondaryAction: { alignSelf: "flex-start", alignItems: "center", justifyContent: "center", paddingVertical: 9, paddingHorizontal: 13, borderRadius: 999, backgroundColor: "rgba(255,255,255,.08)", borderWidth: 1, borderColor: "rgba(255,255,255,.13)" },
  secondaryActionText: { color: colors.paper, fontSize: 13, fontWeight: "900" },
  appSection: { gap: 6 },
  sectionAction: { color: colors.gold, fontSize: 12, fontWeight: "900" },
  appRows: { overflow: "hidden", borderRadius: 18, backgroundColor: "rgba(255,255,255,.075)", borderWidth: 1, borderColor: "rgba(255,255,255,.1)" },
  appRow: { minHeight: 50, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,.07)" },
  rowCoatFrame: { width: 32, height: 36, alignItems: "center", justifyContent: "center", overflow: "visible" },
  rowCoatGlowImage: { position: "absolute", width: 44, height: 48, opacity: .62, transform: [{ translateY: 3 }] },
  rowCoatImage: { width: 30, height: 34 },
  rowCoatImageDim: { opacity: .52 },
  rowSealImage: { width: 31, height: 31, borderRadius: 15.5 },
  rowCompletedSeal: { position: "absolute", width: 18, height: 18, right: -4, bottom: -3 },
  appRowText: { flex: 1, minWidth: 0, gap: 2 },
  appRowTitle: { color: colors.paper, fontSize: 14, fontWeight: "800" },
  appRowMeta: { color: colors.muted, fontSize: 12 },
  appRowStatus: { maxWidth: 96, color: colors.gold, fontSize: 11, fontWeight: "900", textAlign: "right", textTransform: "uppercase" },
  appRowStatusJoined: { color: colors.green },
  detailScreen: { flex: 1, backgroundColor: colors.bg },
  detailTopBar: { height: 48, paddingHorizontal: 12, paddingTop: 6, justifyContent: "center" },
  detailCloseButton: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,247,232,.12)", borderWidth: 1, borderColor: "rgba(255,247,232,.13)" },
  detailContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  detailHero: { alignItems: "center", gap: 5, paddingTop: 0, paddingBottom: 2 },
  detailCoatFrame: { width: 104, height: 112, alignItems: "center", justifyContent: "center", overflow: "visible" },
  detailCoatGlowImage: { position: "absolute", width: 136, height: 148, opacity: .7, transform: [{ translateY: 7 }] },
  detailCoatImage: { width: 94, height: 104 },
  detailEyebrow: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: .85 },
  detailTitle: { color: colors.paper, fontSize: 25, lineHeight: 28, fontWeight: "900", textAlign: "center", letterSpacing: -1.05 },
  detailGoal: { maxWidth: 318, color: colors.muted, fontSize: 13, lineHeight: 17, fontWeight: "700", textAlign: "center" },
  detailHint: { color: "rgba(199,189,169,.72)", fontSize: 10, lineHeight: 13, fontWeight: "800", textAlign: "center" },
  detailPanel: { overflow: "hidden", borderRadius: 16, backgroundColor: "rgba(255,247,232,.075)", borderWidth: 1, borderColor: "rgba(255,247,232,.11)" },
  detailPanelStrong: { gap: 6, padding: 10, borderRadius: 17, backgroundColor: "rgba(245,200,106,.1)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  detailPanelTitle: { color: colors.paper, fontSize: 15, fontWeight: "900", letterSpacing: -.2 },
  detailPanelCopy: { color: colors.muted, fontSize: 12, lineHeight: 16, fontWeight: "700" },
  detailRow: { minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,247,232,.07)" },
  detailRowLabel: { color: colors.muted, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: .55 },
  detailRowValue: { flex: 1, color: colors.paper, fontSize: 13, lineHeight: 16, fontWeight: "900", textAlign: "right" },
  detailRowValueGood: { color: colors.green },
  detailPrimaryButton: { alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.gold },
  detailPrimaryButtonDisabled: { opacity: .62 },
  detailPrimaryButtonText: { color: "#111", fontSize: 14, fontWeight: "900" },
  detailInlineRefresh: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 1, opacity: .78 },
  detailInlineRefreshText: { color: colors.muted, fontSize: 11, lineHeight: 14, fontWeight: "800" },
  detailSecondaryButton: { alignItems: "center", justifyContent: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "rgba(255,247,232,.09)", borderWidth: 1, borderColor: "rgba(255,247,232,.13)" },
  detailSecondaryButtonText: { color: colors.paper, fontSize: 13, fontWeight: "900" },
  detailQuietButton: { alignItems: "center", paddingVertical: 4 },
  detailQuietButtonText: { color: colors.muted, fontSize: 12, fontWeight: "900" },
  coatLightbox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "rgba(6,5,7,.82)" },
  coatLightboxCard: { alignItems: "center", justifyContent: "center", gap: 12, width: "100%", minHeight: 420, borderRadius: 32, backgroundColor: "rgba(255,247,232,.06)", borderWidth: 1, borderColor: "rgba(255,247,232,.12)", overflow: "visible" },
  coatLightboxGlow: { position: "absolute", width: 330, height: 360, opacity: .78 },
  coatLightboxImage: { width: 238, height: 268 },
  coatLightboxTitle: { color: colors.paper, fontSize: 18, lineHeight: 23, fontWeight: "900", textAlign: "center" },
  pullRefreshHint: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 5, paddingTop: 2, paddingBottom: 4, opacity: .72 },
  pullRefreshHintText: { color: colors.muted, fontSize: 11, lineHeight: 14, fontWeight: "800" },
  browseTopBar: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 2 },
  browseTopBarLabel: { color: colors.paper, fontSize: 14, fontWeight: "900", letterSpacing: -.2 },
  topNavPanel: { padding: 6, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.09)", backgroundColor: "rgba(0,0,0,.18)" },
  topNavHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topNavMeta: { color: "rgba(255,247,232,.58)", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: .7 },
  topNavRail: { flexDirection: "row", gap: 5 },
  topNavChip: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,247,232,.07)", backgroundColor: "rgba(255,247,232,.045)" },
  topNavChipActive: { backgroundColor: colors.paper, borderColor: colors.paper },
  topNavChipText: { color: colors.muted, fontSize: 9, fontWeight: "900", textAlign: "center" },
  topNavChipTextActive: { color: "#171119" },
  heroPanel: { gap: 10, padding: 13, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(255,247,232,.075)" },
  headerPanel: { gap: 5, padding: 12, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,247,232,.12)", backgroundColor: "rgba(0,0,0,.2)" },
  topLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  kicker: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.1 },
  heroTitle: { color: colors.paper, fontSize: 27, lineHeight: 29, fontWeight: "900", letterSpacing: -1 },
  heroCopy: { color: colors.muted, fontSize: 14, lineHeight: 19 },
  micro: { color: "rgba(255,247,232,.64)", fontSize: 12, lineHeight: 16 },
  livePill: { overflow: "hidden", color: colors.green, fontSize: 11, fontWeight: "900", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(96,240,175,.12)", borderWidth: 1, borderColor: "rgba(96,240,175,.28)" },
  metricGrid: { flexDirection: "row", gap: 7 },
  metricBox: { flex: 1, padding: 9, borderRadius: 16, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(255,247,232,.1)" },
  metricValue: { color: colors.paper, fontSize: 20, fontWeight: "900" },
  metricLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: .7 },
  actionRow: { flexDirection: "row", gap: 8 },
  goldButton: { alignItems: "center", justifyContent: "center", paddingVertical: 13, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.gold },
  goldButtonSmall: { alignSelf: "flex-start", alignItems: "center", justifyContent: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "rgba(255,255,255,.14)" },
  goldButtonText: { color: colors.paper, fontWeight: "800", fontSize: 12 },
  darkButtonSmall: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 11, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.14)", backgroundColor: "rgba(0,0,0,.22)" },
  darkButtonText: { color: colors.paper, fontWeight: "900", fontSize: 13 },
  scorePanel: { gap: 4, padding: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,247,232,.11)", backgroundColor: "rgba(0,0,0,.2)" },
  panelTitle: { color: colors.paper, fontSize: 18, fontWeight: "900", letterSpacing: -.4 },
  statusRow: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 15, backgroundColor: "rgba(255,247,232,.055)" },
  questRow: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 15, backgroundColor: "rgba(255,247,232,.055)" },
  rowLabel: { width: 72, color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.paper, fontSize: 14, fontWeight: "900" },
  rowMeta: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  chevron: { color: "rgba(255,247,232,.46)", fontSize: 28, fontWeight: "300" },
  segmentBar: { flexDirection: "row", gap: 6, padding: 4, borderRadius: 18, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(255,247,232,.1)" },
  segmentButton: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 14 },
  segmentButtonActive: { backgroundColor: colors.paper },
  segmentText: { color: colors.muted, fontSize: 12, fontWeight: "900", textTransform: "capitalize" },
  segmentTextActive: { color: "#171119" },
  emptyText: { color: colors.muted, fontSize: 13, padding: 12 },
  questIcon: { width: 42, height: 48 },
  questIconDim: { opacity: .52 },
  questPill: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(245,200,106,.14)", borderWidth: 1, borderColor: "rgba(245,200,106,.28)" },
  questPillText: { color: colors.gold, fontSize: 11, fontWeight: "900" },
  coatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  coatTile: { width: "31.8%", gap: 5, alignItems: "center", padding: 8, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(255,247,232,.055)" },
  coatTileImage: { width: 62, height: 72 },
  coatTileLocked: { opacity: .35 },
  coatTileTitle: { minHeight: 30, color: colors.paper, fontSize: 11, lineHeight: 14, textAlign: "center", fontWeight: "800" },
  earnedText: { color: colors.green, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  lockedText: { color: colors.gold, fontSize: 10, fontWeight: "900" },
  todayFeed: { gap: 10 },
  sportsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4, paddingTop: 2, paddingBottom: 2 },
  sportsBrand: { color: colors.paper, fontSize: 22, lineHeight: 26, fontWeight: "900", letterSpacing: -.6 },
  sportsContextPill: { overflow: "hidden", color: colors.gold, fontSize: 11, fontWeight: "900", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(245,200,106,.14)" },
  sportsTabs: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, backgroundColor: "rgba(255,255,255,.075)" },
  sportsTab: { color: "rgba(255,247,232,.48)", fontSize: 12, fontWeight: "900" },
  sportsTabActive: { color: colors.paper },
  feedSection: { gap: 4 },
  feedSectionTitle: { color: colors.paper, fontSize: 13, fontWeight: "800", paddingHorizontal: 3 },
  feedRows: { gap: 1, overflow: "hidden", borderRadius: 14, backgroundColor: "rgba(255,255,255,.075)" },
  feedRow: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 10, paddingRight: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "rgba(255,247,232,.06)" },
  feedRowCopy: { flex: 1, minWidth: 0 },
  feedRowTitle: { color: colors.paper, fontSize: 14, fontWeight: "900" },
  feedRowMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  feedRowStatus: { maxWidth: 90, color: colors.paper, fontSize: 11, fontWeight: "800", textAlign: "right", textTransform: "uppercase", opacity: .86 },
  liveBoardPanel: { gap: 8, padding: 9, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,247,232,.11)", backgroundColor: "rgba(0,0,0,.2)" },
  liveBoardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  boardTitle: { color: colors.paper, fontSize: 22, fontWeight: "900", letterSpacing: -.7 },
  refreshPill: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.14)", backgroundColor: "rgba(255,247,232,.06)" },
  refreshPillText: { color: colors.paper, fontSize: 11, fontWeight: "900" },
  matchCard: { position: "relative", overflow: "hidden", gap: 7, padding: 9, borderRadius: 14, backgroundColor: "rgba(255,255,255,.075)" },
  currentSideQuestPressable: { flexDirection: "row", alignItems: "center", gap: 9 },
  currentCoatFrame: { width: 46, height: 52, alignItems: "center", justifyContent: "center", overflow: "visible" },
  currentCoatHaloLarge: { position: "absolute", width: 46, height: 34, borderRadius: 23, backgroundColor: "rgba(255,255,255,.28)", transform: [{ scaleX: 1.08 }], shadowColor: "#fff7e8", shadowOpacity: .36, shadowRadius: 10, elevation: 3 },
  currentCoatHaloSmall: { position: "absolute", width: 34, height: 26, borderRadius: 17, backgroundColor: "rgba(245,200,106,.12)", shadowColor: colors.gold, shadowOpacity: .22, shadowRadius: 8, elevation: 4 },
  currentCoatImage: { width: 42, height: 48 },
  currentCoatFallback: { color: colors.gold, fontSize: 13, fontWeight: "900" },
  currentSideQuestCopy: { flex: 1, minWidth: 0, gap: 5 },
  matchCardTopline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  matchLeague: { color: colors.muted, fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: .55 },
  statusPill: { overflow: "hidden", color: colors.gold, fontSize: 10, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: "rgba(245,200,106,.14)" },
  statusPillGood: { color: colors.paper, backgroundColor: "rgba(96,240,175,.18)" },
  matchMainRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  matchSideBlock: { flex: 1, minWidth: 0, gap: 2 },
  matchSideLabel: { color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  matchSideTitle: { color: colors.paper, fontSize: 14, lineHeight: 18, fontWeight: "800", letterSpacing: -.15 },
  matchSideMeta: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  matchDivider: { color: "rgba(255,247,232,.48)", fontSize: 30, fontWeight: "300" },
  matchFooterRow: { flexDirection: "row", gap: 6 },
  currentQuestActionRow: { flexDirection: "row", gap: 8 },
  completedSealImage: { position: "absolute", right: 10, bottom: 8, width: 74, height: 74, opacity: .92, transform: [{ rotate: "-8deg" }] },
  inlineSuccess: { color: colors.green, fontSize: 12, lineHeight: 16, fontWeight: "800" },
  inlineError: { color: "#ffb4b4", fontSize: 12, lineHeight: 16, fontWeight: "800" },
  miniStat: { flex: 1, padding: 8, borderRadius: 13, backgroundColor: "rgba(0,0,0,.2)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
  miniStatValue: { color: colors.paper, fontSize: 13, fontWeight: "900" },
  miniStatLabel: { color: colors.muted, fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: .5 },
  tablePanel: { gap: 1, overflow: "hidden", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.22)" },
  tableHeaderRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, paddingTop: 9, paddingBottom: 6, backgroundColor: "rgba(255,247,232,.04)" },
  tableHeaderCell: { width: 54, color: "rgba(255,247,232,.48)", fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: .3, textAlign: "right" },
  tableRow: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "rgba(255,247,232,.07)" },
  tableNameCell: { flex: 1.5, minWidth: 0 },
  tableRowLabel: { color: colors.gold, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  tableRowTitle: { color: colors.paper, fontSize: 13, fontWeight: "900" },
  tableCell: { width: 54, color: colors.muted, fontSize: 11, fontWeight: "800", textAlign: "right" },
  pathPanel: { gap: 4, padding: 7, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.09)", backgroundColor: "rgba(0,0,0,.18)" },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: "transparent" },
  appGradientFrame: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  appGradientLayer: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  appWatermarkFrame: { position: "absolute", left: -118, top: 104, width: 620, height: 620, opacity: 0.025 },
  appWatermarkImage: { width: "100%", height: "100%" },
  content: { gap: 7, padding: 10, paddingTop: 10, paddingBottom: 86 },
  scrollHintLayer: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  scrollHintPill: { position: "absolute", right: 8, minWidth: 28, minHeight: 28, alignItems: "center", justifyContent: "center", paddingHorizontal: 5, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.12)", backgroundColor: "rgba(255,247,232,.055)", opacity: 0.52 },
  screenStack: { gap: 7 },
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
  homeHeroTitle: { color: colors.paper, fontSize: 30, fontWeight: "900", letterSpacing: -1.1, lineHeight: 32 },
  homeHeroBody: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  homeHeroActions: { gap: 9 },
  homeRitualStrip: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 18, borderWidth: 1, borderColor: "rgba(245,200,106,.2)", backgroundColor: "rgba(0,0,0,.18)" },
  homeRitualStep: { color: colors.paper, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
  homeRitualArrow: { color: colors.gold, fontSize: 12, fontWeight: "900" },
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
  sideQuestHubTitle: { color: colors.paper, fontSize: 29, fontWeight: "900", letterSpacing: -0.4, lineHeight: 31 },
  sideQuestHubCopy: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  soloBrowseHero: { overflow: "hidden", gap: 12, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 15, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.065)" },
  soloBrowseHeroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  soloBrowseHeroCopy: { flex: 1, gap: 7 },
  soloBrowseHeroTitle: { color: colors.paper, fontSize: 30, fontWeight: "900", letterSpacing: -1.0, lineHeight: 32 },
  soloBrowseHeroText: { color: colors.muted, fontSize: 15, lineHeight: 22, fontWeight: "700" },
  soloBrowseHeroCoat: { width: 86, height: 86 },
  soloBrowseStatsRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  soloBrowseStat: { overflow: "hidden", color: colors.gold, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.65, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(245,200,106,.22)", backgroundColor: "rgba(245,200,106,.08)" },
  soloDeckHeader: { gap: 6, paddingHorizontal: 2 },
  sideQuestModeGrid: { gap: 8 },
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
  groupquestsActiveCard: { gap: 8, padding: 11, borderRadius: 22, borderWidth: 1, borderColor: "rgba(96,240,175,.28)", backgroundColor: "rgba(96,240,175,.085)" },
  groupquestsActiveRow: { flexDirection: "row", gap: 9, alignItems: "center", padding: 9, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.18)" },
  groupquestsActionCard: { gap: 11, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  groupquestsHowCard: { gap: 14, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  groupquestsHowGrid: { gap: 10 },
  groupquestsHowStep: { gap: 5, padding: 13, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.18)" },
  groupquestsHowNumber: { color: colors.gold, fontSize: 22, fontWeight: "900" },
  groupquestsHowTitle: { color: colors.paper, fontSize: 18, fontWeight: "900" },
  groupquestsHowCopy: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  groupquestsRulesCard: { gap: 11, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(245,200,106,.08)" },
  sideQuestModeTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.6, lineHeight: 22 },
  sideQuestModeCopy: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  modeInlineCue: { alignSelf: "flex-start", overflow: "hidden", color: colors.gold, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.65, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(245,200,106,.22)", backgroundColor: "rgba(245,200,106,.08)" },
  questFilterPanel: { gap: 9, padding: 11, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  questFilterTitle: { color: colors.paper, fontSize: 24, fontWeight: "900", letterSpacing: -0.9 },
  questFilterHint: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  questFilterGrid: { gap: 10 },
  filterField: { gap: 5 },
  filterLabel: { color: colors.muted, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  filterValue: { color: "rgba(255,247,232,.62)", fontSize: 15, fontWeight: "900", paddingHorizontal: 12, paddingVertical: 11, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.14)" },
  filterResetButton: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.18)", opacity: 0.62 },
  filterResetText: { color: colors.muted, fontWeight: "900" },
  availableQuestGrid: { gap: 8 },
  sideQuestSection: { gap: 8, padding: 11, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
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
  challengeCardTitleRowMobile: { flexDirection: "row", gap: 8, alignItems: "center" },
  challengeCardBadgeMobile: { width: 66, alignItems: "center", justifyContent: "center" },
  challengeCardBadgeImageMobile: { width: 62, height: 70 },
  challengeCardCopyMobile: { flex: 1, gap: 5 },
  challengeCardTitleMobile: { color: colors.paper, fontSize: 20, lineHeight: 22, fontWeight: "900", letterSpacing: -0.8 },
  challengeCardObjectiveMobile: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  challengeCardHintMobile: { color: colors.gold, fontSize: 13, lineHeight: 18, fontStyle: "italic", fontWeight: "800" },
  badgesHeroCard: { overflow: "hidden", gap: 11, marginHorizontal: -12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  badgesHeroTitle: { color: colors.paper, fontSize: 29, fontWeight: "900", letterSpacing: -0.4, lineHeight: 31, textAlign: "center" },
  liveCoatRoster: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 4 },
  liveCoatRosterItem: { width: "30%", minWidth: 84, alignItems: "center", gap: 2, paddingVertical: 2 },
  liveCoatBadgeFrame: { width: 60, height: 64, alignItems: "center", justifyContent: "center" },
  liveCoatBadgeFrameLocked: { opacity: 0.5 },
  liveCoatBadgeImage: { width: 58, height: 58 },
  liveCoatBadgeImageLocked: { opacity: 0.34 },
  liveCoatLockedLabel: { position: "absolute", bottom: 2, overflow: "hidden", color: colors.paper, fontSize: 8, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.6, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 999, backgroundColor: "rgba(0,0,0,.58)", borderWidth: 1, borderColor: "rgba(255,247,232,.16)" },
  liveCoatRosterTitle: { color: colors.paper, fontSize: 10, fontWeight: "900", lineHeight: 11, textAlign: "center" },
  badgeMeaningList: { gap: 7 },
  badgeMeaningCard: { flexDirection: "row", gap: 8, padding: 9, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(255,247,232,.055)" },
  badgeMeaningArtLink: { width: 64, alignItems: "center", justifyContent: "center" },
  badgeMeaningArtLocked: {},
  badgeMeaningImage: { width: 58, height: 66 },
  badgeMeaningImageLocked: { opacity: 0.74 },
  badgeMeaningCopy: { flex: 1, gap: 6 },
  badgeMeaningTitle: { color: colors.paper, fontSize: 18, lineHeight: 20, fontWeight: "900", letterSpacing: -0.7 },
  badgeMeaningRows: { gap: 4 },
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
  catalogStateBanner: { gap: 5, padding: 12, borderRadius: 20, borderWidth: 1, borderColor: "rgba(245,200,106,.28)", backgroundColor: "rgba(245,200,106,.09)" },
  catalogStateTitle: { color: colors.gold, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  catalogStateCopy: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  muted: { color: colors.muted },
  offlineCard: { gap: 12, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: "rgba(96,240,175,.34)", backgroundColor: "rgba(96,240,175,.09)" },
  offlineHeaderRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  offlineIcon: { width: 36, height: 36, textAlign: "center", textAlignVertical: "center", borderRadius: 18, overflow: "hidden", color: colors.green, fontSize: 22, backgroundColor: "rgba(0,0,0,.22)" },
  offlineHeaderCopy: { flex: 1, gap: 4 },
  offlineTitle: { color: colors.paper, fontSize: 18, fontWeight: "900" },
  offlineCopy: { color: colors.muted, lineHeight: 20 },
  errorCopy: { color: "#ffd6cf", lineHeight: 20 },
  primaryButton: { alignSelf: "flex-start", minHeight: 42, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.gold },
  primaryButtonWide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 999, backgroundColor: colors.gold },
  primaryButtonText: { color: "#17120c", fontWeight: "900" },
  secondaryButton: { alignSelf: "flex-start", minHeight: 42, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.18)", backgroundColor: "rgba(255,247,232,.08)" },
  secondaryButtonWide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.18)", backgroundColor: "rgba(255,247,232,.08)" },
  disabledActionButton: { alignSelf: "flex-start", minHeight: 42, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: "rgba(245,200,106,.16)", backgroundColor: "rgba(245,200,106,.07)", opacity: 0.74 },
  disabledActionButtonText: { color: "rgba(245,200,106,.72)", fontWeight: "900" },
  disabledSecondaryButton: { alignSelf: "flex-start", minHeight: 42, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.12)", backgroundColor: "rgba(255,247,232,.045)", opacity: 0.68 },
  disabledWideButton: { alignItems: "center", justifyContent: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,247,232,.12)", backgroundColor: "rgba(255,247,232,.045)", opacity: 0.68 },
  disabledSecondaryButtonText: { color: "rgba(255,247,232,.62)", fontWeight: "900" },
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
  bottomNavBar: { flexDirection: "row", gap: 5, paddingHorizontal: 8, paddingTop: 6, paddingBottom: 6, borderTopWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(16,13,11,.94)" },
  bottomNavItem: { position: "relative", overflow: "hidden", flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", gap: 2, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.045)", backgroundColor: "rgba(255,247,232,.035)" },
  bottomNavItemActive: { borderColor: "rgba(245,200,106,.58)", backgroundColor: "rgba(245,200,106,.14)" },
  bottomNavActiveDot: { width: 14, height: 2, borderRadius: 999, backgroundColor: colors.gold, marginTop: 1 },
  bottomNavIconFrame: { width: 24, height: 22, alignItems: "center", justifyContent: "center", transform: [{ translateY: 0 }] },
  bottomNavIconFrameActive: { transform: [{ translateY: 0 }] },
  bottomNavLogoImage: { width: 34, height: 34, borderRadius: 9 },
  bottomNavSideQuestImage: { width: 31, height: 31 },
  bottomNavCoatImage: { width: 28, height: 28 },
  bottomNavLoggedInBadge: { width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: "rgba(96,240,175,.45)", backgroundColor: "rgba(96,240,175,.1)" },
  bottomNavLoggedInBadgeActive: { borderColor: "rgba(245,200,106,.86)", backgroundColor: colors.gold },
  bottomNavText: { color: "#e8dcc3", fontSize: 9, lineHeight: 11, fontWeight: "900", textAlign: "center" },
  bottomNavTextActive: { color: colors.paper },
  tabRail: { gap: 8, paddingRight: 18 },
  tabPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.stroke, backgroundColor: "rgba(255,247,232,.055)" },
  tabPillActive: { borderColor: "rgba(245,200,106,.78)", backgroundColor: "rgba(245,200,106,.16)" },
  tabIcon: { color: colors.muted, fontWeight: "900" },
  tabText: { color: colors.muted, fontWeight: "900" },
  tabTextActive: { color: colors.paper },
  sectionHeader: { gap: 6, paddingHorizontal: 2 },
  sectionTitle: { color: colors.paper, fontSize: 22, fontWeight: "900", letterSpacing: -0.8, lineHeight: 24 },
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
  badgeImageFrame: { width: 112, height: 128, alignItems: "center", justifyContent: "center" },
  badgeImage: { width: 112, height: 128 },
  completedSealLarge: { position: "absolute", width: 44, height: 44, right: 0, bottom: 2 },
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
  currentMissionCard: { gap: 7, marginHorizontal: -10, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(245,200,106,.32)", backgroundColor: "rgba(255,247,232,.055)" },
  currentMissionCopy: { gap: 6 },
  currentMissionName: { color: colors.paper, fontSize: 27, fontWeight: "900", letterSpacing: -1.5, lineHeight: 29 },
  accountStatusStrip: { gap: 4, padding: 9, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.18)" },
  accountStatusConnected: { color: colors.green, fontSize: 12, fontWeight: "800" },
  accountStatusMissing: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  accountStatusStrong: { color: colors.paper, fontWeight: "900" },
  currentMissionTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -1, lineHeight: 22 },
  currentMissionBody: { color: colors.muted, fontSize: 14, lineHeight: 19 },
  currentMissionMultiplayer: { gap: 5, padding: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(96,240,175,.2)", backgroundColor: "rgba(96,240,175,.07)" },
  activeMultiplayerRow: { flexDirection: "row", gap: 10, alignItems: "center", padding: 10, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,247,232,.1)", backgroundColor: "rgba(0,0,0,.18)" },
  activeMultiplayerSeal: { width: 36, height: 36 },
  activeMultiplayerCopy: { flex: 1, gap: 2 },
  activeMultiplayerTitle: { color: colors.paper, fontSize: 14, fontWeight: "900" },
  activeMultiplayerMeta: { color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  currentMissionVisual: { alignItems: "center" },
  currentMissionCoat: { width: "100%", gap: 5, alignItems: "center", padding: 8, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(0,0,0,.2)" },
  currentMissionCoatImage: { width: 96, height: 108 },
  currentMissionCoatLabel: { color: colors.paper, fontSize: 15, fontWeight: "900", textAlign: "center" },
  currentMissionEmpty: { width: "100%", gap: 10, alignItems: "center", padding: 18, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(0,0,0,.18)" },
  currentMissionEmptyBadge: { width: 72, height: 72, textAlign: "center", textAlignVertical: "center", borderRadius: 36, overflow: "hidden", color: colors.gold, fontSize: 38, fontWeight: "900", backgroundColor: "rgba(255,247,232,.08)" },
  questLogCollectionCard: { gap: 6, marginHorizontal: -10, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,247,232,.13)", backgroundColor: "rgba(245,200,106,.12)" },
  readinessCard: { gap: 10, padding: 14, borderRadius: 24, borderWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.075)" },
  readinessTitle: { color: colors.paper, fontSize: 20, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  readinessBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  panelCard: { gap: 9, padding: 12, borderRadius: 30, borderWidth: 1, borderColor: colors.stroke, backgroundColor: colors.panel },
  cardTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.7, lineHeight: 23 },
  cardBody: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  scoreboardRow: { flexDirection: "row", gap: 5 },
  bigScore: { flex: 1, alignItems: "center", gap: 1, padding: 6, borderRadius: 18, backgroundColor: "rgba(0,0,0,.22)" },
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
  accountChecklistCard: { gap: 6, padding: 9, borderRadius: 24, backgroundColor: "rgba(255,247,232,.08)", borderWidth: 1, borderColor: "rgba(255,247,232,.13)" },
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
  usernameEditorCard: { gap: 6, padding: 9, borderRadius: 24, backgroundColor: "rgba(96,240,175,.075)", borderWidth: 1, borderColor: "rgba(96,240,175,.24)" },
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
  trophyShelf: { gap: 6, padding: 9, borderRadius: 20, backgroundColor: "rgba(245,200,106,.08)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  trophyRow: { flexDirection: "row", gap: 7, alignItems: "center" },
  trophyBadge: { width: 38, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "rgba(0,0,0,.22)" },
  trophyImage: { width: 34, height: 40 },
  trophyGlyph: { color: colors.gold, fontSize: 22 },
  trophyCopy: { flex: 1, gap: 2 },
  trophyTitle: { color: colors.paper, fontSize: 15, fontWeight: "900" },
  trophyMeta: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  stateBoardCard: { gap: 6, padding: 9, borderRadius: 24, backgroundColor: "rgba(96,240,175,.075)", borderWidth: 1, borderColor: "rgba(96,240,175,.22)" },
  stateBoardTitle: { color: colors.paper, fontSize: 21, fontWeight: "900", letterSpacing: -0.8 },
  stateBoardBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  stateTimeline: { gap: 9 },
  statusRibbon: { flexDirection: "row", gap: 12, alignItems: "center", padding: 14, borderRadius: 20, backgroundColor: "rgba(245,200,106,.1)", borderWidth: 1, borderColor: "rgba(245,200,106,.2)" },
  statusRibbonIcon: { fontSize: 27 },
  statusRibbonCopy: { flex: 1, gap: 3 },
  statusRibbonTitle: { color: colors.paper, fontSize: 17, fontWeight: "900", textTransform: "uppercase" },
  statusRibbonBody: { color: colors.muted, lineHeight: 19 },
  checkerFlow: { gap: 10 },
  flowStep: { flexDirection: "row", gap: 7, padding: 7, borderRadius: 18, backgroundColor: "rgba(0,0,0,.18)", borderWidth: 1, borderColor: "rgba(255,247,232,.08)" },
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
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
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
