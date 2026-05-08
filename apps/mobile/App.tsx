/* eslint-disable jsx-a11y/alt-text */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ClerkProvider, SignedIn, SignedOut, useAuth, useClerk, useSSO, useUser } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getApiBaseUrl, fetchMobileAccountState, fetchMobileBootstrap } from "./src/api/sqc";
import { clerkPublishableKey, clerkTokenCache, isClerkMobileAuthConfigured } from "./src/auth/clerk";
import { OFFLINE_MOBILE_BOOTSTRAP } from "./src/data/offlineBootstrap";
import type { MobileAccountResponse, MobileAccountState, MobileBootstrap, MobileChallenge } from "./src/types/sqc";

type AppTab = "catalog" | "quest" | "account" | "status" | "proof";

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

const MOBILE_BUILD_LABEL = "Android alpha 0.2.3 / polish pass 4";
const MOBILE_ACCOUNT_FALLBACK: MobileAccountResponse = {
  apiVersion: 1,
  authenticated: false,
  signInUrl: "https://sidequestchess.com/sign-in",
  message: "Public quest catalog is available. Mobile account sync starts after auth is ready.",
};

WebBrowser.maybeCompleteAuthSession();

const mobileOAuthRedirectUrl = AuthSession.makeRedirectUri({
  scheme: "sidequestchess",
  path: "sso-callback",
});

const TABS: Array<{ id: AppTab; label: string; icon: string }> = [
  { id: "catalog", label: "Quests", icon: "♞" },
  { id: "quest", label: "Detail", icon: "⚔" },
  { id: "account", label: "Me", icon: "♛" },
  { id: "status", label: "Status", icon: "✓" },
  { id: "proof", label: "Proof", icon: "✦" },
];

export default function App() {
  if (!isClerkMobileAuthConfigured()) {
    return <MobileShell authBridge={signedOutAuthBridge} />;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={clerkTokenCache}>
      <ClerkMobileShell />
    </ClerkProvider>
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
  const [shell, setShell] = useState<MobileShellState>({
    bootstrap: null,
    account: null,
    selectedChallengeId: null,
    activeTab: "catalog",
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

  useEffect(() => {
    const bootstrapTimer = setTimeout(() => void loadBootstrap(), 0);
    return () => clearTimeout(bootstrapTimer);
  }, [loadBootstrap]);

  useEffect(() => {
    const accountTimer = setTimeout(() => void loadAccount(), 0);
    return () => clearTimeout(accountTimer);
  }, [loadAccount]);

  function selectChallenge(challengeId: string, nextTab: AppTab = "quest") {
    setShell((current) => ({ ...current, selectedChallengeId: challengeId, activeTab: nextTab }));
  }

  function selectTab(activeTab: AppTab) {
    setShell((current) => ({ ...current, activeTab }));
  }

  const completedCount = shell.account?.authenticated ? shell.account.progress.totalCompletedChallenges : 0;
  const activeQuestTitle = shell.account?.authenticated && shell.account.activeQuest ? shell.account.activeQuest.title : selectedChallenge?.title ?? "Choose a quest";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl tintColor="#f5c86a" refreshing={shell.refreshing} onRefresh={() => void loadBootstrap({ refresh: true })} />}
      >
        <HeroHeader selectedChallenge={selectedChallenge} completedCount={completedCount} activeQuestTitle={activeQuestTitle} />

        {shell.bootstrap && selectedChallenge ? (
          <>
            <QuickStartCard selectedChallenge={selectedChallenge} account={shell.account} authBridge={authBridge} onSelectTab={selectTab} />
            <TabBar activeTab={shell.activeTab} onSelectTab={selectTab} />
          </>
        ) : null}

        <MobileAuthSessionCard authBridge={authBridge} onAuthActionComplete={() => void loadAccount()} />

        {shell.loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#f5c86a" />
            <Text style={styles.muted}>Loading the live quest board…</Text>
          </View>
        ) : null}

        {shell.catalogMode === "offline" ? <OfflinePreviewCard reason={shell.catalogNotice} onRetry={() => void loadBootstrap()} /> : null}

        {shell.bootstrap && selectedChallenge ? (
          <>
            <ActiveScreen
              activeTab={shell.activeTab}
              bootstrap={shell.bootstrap}
              catalogMode={shell.catalogMode}
              selectedChallenge={selectedChallenge}
              account={shell.account}
              authBridge={authBridge}
              onSelectChallenge={selectChallenge}
              onSelectTab={selectTab}
            />
            <SyncCard bootstrap={shell.bootstrap} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroHeader({ selectedChallenge, completedCount, activeQuestTitle }: { selectedChallenge: MobileChallenge | null; completedCount: number; activeQuestTitle: string }) {
  const badgeUrl = selectedChallenge?.badgeIdentity.imageUrl ? absoluteAssetUrl(selectedChallenge.badgeIdentity.imageUrl) : null;

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroGlowOne} />
      <View style={styles.heroGlowTwo} />
      <View style={styles.navBrandRow}>
        <Image source={{ uri: `${getApiBaseUrl()}/brand/sqc-alt-logo-topbar-20260507-v2.png` }} style={styles.logoMark} resizeMode="contain" />
        <View style={styles.navBrandCopy}>
          <Text style={styles.navKicker}>Side Quest Chess</Text>
          <Text style={styles.navSub}>Mobile quest board</Text>
        </View>
        <Text style={styles.buildPill}>{MOBILE_BUILD_LABEL}</Text>
      </View>

      <View style={styles.heroMainRow}>
        <View style={styles.heroCopyBlock}>
          <Text style={styles.eyebrow}>Chess, but weird on purpose</Text>
          <Text style={styles.title}>Stupidly hard side quests.</Text>
          <Text style={styles.heroCopy}>Pick one ridiculous chess quest, play a real Lichess or Chess.com game, then come back for the receipt.</Text>
        </View>
        <View style={styles.heroBadgeFrame}>
          {badgeUrl ? <Image source={{ uri: badgeUrl }} style={styles.heroBadgeImage} resizeMode="contain" /> : <Text style={styles.heroBadgeGlyph}>♞</Text>}
        </View>
      </View>

      <View style={styles.heroStatsRow}>
        <MiniStat label="Active quest" value={activeQuestTitle} />
        <MiniStat label="Coats earned" value={`${completedCount}`} />
      </View>
    </View>
  );
}

function QuickStartCard({
  selectedChallenge,
  account,
  authBridge,
  onSelectTab,
}: {
  selectedChallenge: MobileChallenge;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectTab: (tab: AppTab) => void;
}) {
  const accountMode = isAuthenticatedAccount(account)
    ? `Signed in · ${account.progress.totalCompletedChallenges} coats earned`
    : authBridge.configured
      ? "Website-owned account sync is ready after Google sign-in"
      : "Public mode · Clerk key not bundled in this APK";

  return (
    <View style={styles.quickStartCard}>
      <View style={styles.quickStartCopy}>
        <Text style={styles.eyebrow}>Start here</Text>
        <Text style={styles.quickStartTitle}>{selectedChallenge.title}</Text>
        <Text style={styles.quickStartBody} numberOfLines={2}>{selectedChallenge.objective}</Text>
      </View>
      <View style={styles.quickActionStack}>
        <Pressable style={styles.primaryButtonWide} onPress={() => onSelectTab("quest")}>
          <Text style={styles.primaryButtonText}>View mission</Text>
        </Pressable>
        <Pressable style={styles.secondaryButtonWide} onPress={() => onSelectTab("proof")}>
          <Text style={styles.secondaryButtonText}>Preview reward</Text>
        </Pressable>
      </View>
      <View style={styles.accountModeStrip}>
        <Text style={styles.accountModeDot}>●</Text>
        <Text style={styles.accountModeCopy}>{accountMode}</Text>
      </View>
    </View>
  );
}

function MobileAuthSessionCard({ authBridge, onAuthActionComplete }: { authBridge: MobileAuthBridge; onAuthActionComplete: () => void }) {
  const [authActionPending, setAuthActionPending] = useState(false);
  const [authActionError, setAuthActionError] = useState<string | null>(null);

  async function runAuthAction(action: () => Promise<void>) {
    setAuthActionPending(true);
    setAuthActionError(null);

    try {
      await action();
      onAuthActionComplete();
    } catch (caught) {
      setAuthActionError(caught instanceof Error ? caught.message : "Mobile sign-in failed.");
    } finally {
      setAuthActionPending(false);
    }
  }

  if (!authBridge.configured) {
    return (
      <View style={styles.authCard}>
        <Text style={styles.eyebrow}>Sign-in pending</Text>
        <Text style={styles.cardTitle}>Public quest mode is active.</Text>
        <Text style={styles.cardBody}>This build can browse quests and proof previews without a mobile session. Account sync unlocks after the Clerk publishable key and Native API are enabled for the APK.</Text>
        <View style={styles.factGrid}>
          <Fact label="Provider" value="Clerk Expo installed" />
          <Fact label="Needed env" value="EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY" />
          <Fact label="Redirect" value={mobileOAuthRedirectUrl} />
        </View>
        <View style={styles.noticeStrip}>
          <Text style={styles.noticeIcon}>🛡</Text>
          <Text style={styles.noticeCopy}>No dead end: start from the quest brief now; account, status, and proof screens explain what is website-owned until auth is live.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.authCard}>
      <Text style={styles.eyebrow}>Mobile account</Text>
      <SignedIn>
        <Text style={styles.cardTitle}>Signed in{authBridge.signedInLabel ? ` as ${authBridge.signedInLabel}` : ""}.</Text>
        <Text style={styles.cardBody}>Account, active quest, and latest proof receipt refresh from the website backend.</Text>
        {authBridge.signOut ? (
          <Pressable style={styles.secondaryButton} disabled={authActionPending} onPress={() => void runAuthAction(authBridge.signOut!)}>
            <Text style={styles.secondaryButtonText}>{authActionPending ? "Working…" : "Sign out"}</Text>
          </Pressable>
        ) : null}
      </SignedIn>
      <SignedOut>
        <Text style={styles.cardTitle}>Sign in to sync your quest log.</Text>
        <Text style={styles.cardBody}>Google sign-in attaches a mobile session token. If the native handoff is moody, the public quests still work and the website remains the source of truth.</Text>
        {authBridge.startGoogleSignIn ? (
          <Pressable style={styles.primaryButton} disabled={authActionPending || !authBridge.isLoaded} onPress={() => void runAuthAction(authBridge.startGoogleSignIn!)}>
            <Text style={styles.primaryButtonText}>{authActionPending ? "Opening Google…" : "Sign in with Google"}</Text>
          </Pressable>
        ) : null}
        <View style={styles.noticeStrip}>
          <Text style={styles.noticeIcon}>⚙</Text>
          <Text style={styles.noticeCopy}>If the native handoff fails, keep browsing: account data stays website-owned and safe.</Text>
        </View>
      </SignedOut>
      {authActionError ? <Text style={styles.errorCopy}>{authActionError}</Text> : null}
    </View>
  );
}

function TabBar({ activeTab, onSelectTab }: { activeTab: AppTab; onSelectTab: (tab: AppTab) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRail}>
      {TABS.map((tab) => (
        <Pressable key={tab.id} style={[styles.tabPill, activeTab === tab.id && styles.tabPillActive]} onPress={() => onSelectTab(tab.id)}>
          <Text style={[styles.tabIcon, activeTab === tab.id && styles.tabTextActive]}>{tab.icon}</Text>
          <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
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
}: {
  activeTab: AppTab;
  bootstrap: MobileBootstrap;
  catalogMode: "live" | "offline";
  selectedChallenge: MobileChallenge;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
  onSelectTab: (tab: AppTab) => void;
}) {
  switch (activeTab) {
    case "catalog":
      return <CatalogScreen bootstrap={bootstrap} catalogMode={catalogMode} selectedChallenge={selectedChallenge} onSelectChallenge={onSelectChallenge} />;
    case "quest":
      return <QuestDetailScreen challenge={selectedChallenge} onSelectTab={onSelectTab} />;
    case "account":
      return <AccountShell bootstrap={bootstrap} account={account} authBridge={authBridge} />;
    case "status":
      return <StatusShell selectedChallenge={selectedChallenge} account={account} />;
    case "proof":
      return <ProofShell selectedChallenge={selectedChallenge} account={account} />;
  }
}

function CatalogScreen({
  bootstrap,
  catalogMode,
  selectedChallenge,
  onSelectChallenge,
}: {
  bootstrap: MobileBootstrap;
  catalogMode: "live" | "offline";
  selectedChallenge: MobileChallenge;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
}) {
  return (
    <View style={styles.screenStack}>
      <View style={styles.sectionHeader}>
        <Text style={styles.eyebrow}>Where to begin</Text>
        <Text style={styles.sectionTitle}>How heroic are you feeling today?</Text>
        <Text style={styles.sectionBody}>
          {catalogMode === "offline"
            ? "Offline preview is showing bundled sample quests. Live catalog sync retries when the network comes back."
            : "Choose a quest based on your tolerance for terrible chess decisions."}
        </Text>
      </View>

      <View style={styles.catalogQuickStats}>
        <MiniStat label={catalogMode === "offline" ? "Preview quests" : "Live quests"} value={`${bootstrap.challenges.length}`} />
        <MiniStat label="Selected" value={selectedChallenge.badgeIdentity.name} />
      </View>

      {bootstrap.challenges.map((challenge, index) => (
        <QuestListCard
          key={challenge.id}
          challenge={challenge}
          index={index}
          active={challenge.id === selectedChallenge.id}
          onPress={() => onSelectChallenge(challenge.id, "quest")}
        />
      ))}
    </View>
  );
}

function QuestDetailScreen({ challenge, onSelectTab }: { challenge: MobileChallenge; onSelectTab: (tab: AppTab) => void }) {
  return <QuestDetailCard challenge={challenge} onSelectTab={onSelectTab} />;
}

function AccountShell({ bootstrap, account, authBridge }: { bootstrap: MobileBootstrap; account: MobileAccountResponse | null; authBridge: MobileAuthBridge }) {
  if (!isAuthenticatedAccount(account)) {
    const signedInButRejected = authBridge.isSignedIn && account?.authenticated === false;

    return (
      <EmptyStateCard
        eyebrow="My Side Quest"
        title={signedInButRejected ? "Token is local; backend verification still needs help." : "Ready for your royal paperwork."}
        body={
          signedInButRejected
            ? "The Expo Google session exists, but /api/mobile/account returned signed-out JSON. This keeps the app graceful until Clerk bearer verification is finalized."
            : "Use the website to sign in, connect chess usernames, and start real quests. This APK keeps catalog and proof previews available until native account sync is enabled."
        }
        facts={[
          ["Source", bootstrap.product.canonicalUrl],
          ["Local session", authBridge.isSignedIn ? "Signed in with Clerk Expo" : "Signed out / no mobile token"],
          ["Catalog", "Still available without auth"],
        ]}
      />
    );
  }

  return (
    <View style={styles.panelCard}>
      <Text style={styles.eyebrow}>My Side Quest</Text>
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
      <QuestProgressStrip completed={account.progress.totalCompletedChallenges} total={bootstrap.challenges.length} />
      <CompletedQuestShelf account={account} />
    </View>
  );
}

function StatusShell({ selectedChallenge, account }: { selectedChallenge: MobileChallenge; account: MobileAccountResponse | null }) {
  if (isAuthenticatedAccount(account) && account.activeQuest) {
    return (
      <View style={styles.panelCard}>
        <Text style={styles.eyebrow}>Quest status</Text>
        <Text style={styles.cardTitle}>{account.activeQuest.completed ? "Quest completed." : account.activeQuest.title}</Text>
        <Text style={styles.cardBody}>{account.activeQuest.banner}</Text>
        <View style={styles.statusRibbon}>
          <Text style={styles.statusRibbonIcon}>{account.activeQuest.completed ? "🏆" : "⚔"}</Text>
          <View style={styles.statusRibbonCopy}>
            <Text style={styles.statusRibbonTitle}>{account.activeQuest.status}</Text>
            <Text style={styles.statusRibbonBody}>{account.latestReceipt?.headline ?? "No latest check yet"}</Text>
          </View>
        </View>
        <View style={styles.factGrid}>
          <Fact label="Started" value={account.activeQuest.startedAt ? new Date(account.activeQuest.startedAt).toLocaleString() : "Not started"} />
          <Fact label="Verified" value={account.activeQuest.verifiedAt ? new Date(account.activeQuest.verifiedAt).toLocaleString() : "Waiting for proof"} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.panelCard}>
      <Text style={styles.eyebrow}>Quest ritual</Text>
      <Text style={styles.cardTitle}>Pick one quest. Play one real game. Return for judgment.</Text>
      <View style={styles.checkerFlow}>
        <FlowStep done title="Choose one quest" body={selectedChallenge.title} />
        <FlowStep title="Play where you already play" body="Use a public Lichess or Chess.com game. No chess-site passwords." />
        <FlowStep title="Get the receipt" body="The checker returns passed, failed, or pending with a shareable proof card." />
      </View>
    </View>
  );
}

function ProofShell({ selectedChallenge, account }: { selectedChallenge: MobileChallenge; account: MobileAccountResponse | null }) {
  if (isAuthenticatedAccount(account) && account.latestReceipt) {
    return (
      <View style={styles.proofScrollCard}>
        <View style={styles.proofSeal}>
          <Text style={styles.proofSealText}>{account.latestReceipt.status === "passed" ? "PASS" : "SQC"}</Text>
        </View>
        <Text style={styles.eyebrow}>Latest proof receipt</Text>
        <Text style={styles.proofTitle}>{account.latestReceipt.headline}</Text>
        <Text style={styles.proofBody}>{account.latestReceipt.detail}</Text>
        <Text style={styles.microcopy}>{account.latestReceipt.meta}</Text>
        <View style={styles.factGrid}>
          <Fact label="Game" value={account.latestReceipt.gameId ?? "No game id"} />
          <Fact label="Provider" value={account.latestReceipt.provider ?? "Unknown"} />
          <Fact label="Updated" value={account.latestReceipt.checkedAt ? new Date(account.latestReceipt.checkedAt).toLocaleString() : "Not checked"} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.proofScrollCard}>
      <View style={styles.proofSeal}>
        <Text style={styles.proofSealText}>SQC</Text>
      </View>
      <Text style={styles.eyebrow}>Proof scroll preview</Text>
      <Text style={styles.proofTitle}>{selectedChallenge.title}</Text>
      <Text style={styles.proofSubtitle}>Unlocks {selectedChallenge.badgeIdentity.name}</Text>
      <Text style={styles.proofBody}>{selectedChallenge.proofCallout}</Text>
      <Text style={styles.microcopy}>Preview only in public mode. Finish a website-backed quest and this becomes a shareable receipt with provider, game id, and verdict.</Text>
      <View style={styles.factGrid}>
        <Fact label="Motto" value={selectedChallenge.badgeIdentity.heraldry.motto} />
        <Fact label="Charge" value={selectedChallenge.badgeIdentity.heraldry.charge} />
      </View>
    </View>
  );
}

function OfflinePreviewCard({ reason, onRetry }: { reason: string | null; onRetry: () => void }) {
  return (
    <View style={styles.offlineCard}>
      <View style={styles.offlineHeaderRow}>
        <Text style={styles.offlineIcon}>☁</Text>
        <View style={styles.offlineHeaderCopy}>
          <Text style={styles.offlineTitle}>Offline preview loaded.</Text>
          <Text style={styles.offlineCopy}>The live quest board could not be reached, so this APK is showing bundled sample quests instead of a hard error.</Text>
        </View>
      </View>
      <Text style={styles.microcopy}>{reason ? `Last sync attempt: ${reason}` : "Live sync will retry when you pull to refresh or tap retry."}</Text>
      <View style={styles.buttonRow}>
        <Pressable style={styles.primaryButton} onPress={onRetry}>
          <Text style={styles.primaryButtonText}>Retry live sync</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => void Linking.openURL(getApiBaseUrl())}>
          <Text style={styles.secondaryButtonText}>Open website</Text>
        </Pressable>
      </View>
    </View>
  );
}

function QuestListCard({ challenge, active, index, onPress }: { challenge: MobileChallenge; active: boolean; index: number; onPress: () => void }) {
  const badgeUrl = challenge.badgeIdentity.imageUrl ? absoluteAssetUrl(challenge.badgeIdentity.imageUrl) : null;

  return (
    <Pressable style={[styles.questListCard, active && styles.questListCardActive]} onPress={onPress}>
      <View style={styles.questNumberPill}>
        <Text style={styles.questNumber}>{String(index + 1).padStart(2, "0")}</Text>
      </View>
      <View style={styles.questListCopy}>
        <Text style={styles.questListMode}>{challenge.difficulty} · +{challenge.reward}</Text>
        <Text style={styles.questListTitle}>{challenge.title}</Text>
        <Text style={styles.questListObjective}>{challenge.objective}</Text>
        <View style={styles.questMetaRow}>
          <Text style={styles.questListReward}>Coat of arms: {challenge.badgeIdentity.name}</Text>
          <Text style={styles.rarityPill}>{challenge.badgeIdentity.rarity}</Text>
        </View>
      </View>
      <View style={styles.questListBadgeFrame}>
        {badgeUrl ? <Image source={{ uri: badgeUrl }} style={styles.questListBadge} resizeMode="contain" /> : <Text style={styles.questListGlyph}>{challenge.badgeIdentity.motif}</Text>}
      </View>
    </Pressable>
  );
}

function QuestDetailCard({ challenge, onSelectTab }: { challenge: MobileChallenge; onSelectTab: (tab: AppTab) => void }) {
  const badgeUrl = challenge.badgeIdentity.imageUrl ? absoluteAssetUrl(challenge.badgeIdentity.imageUrl) : null;

  return (
    <View style={styles.questCard}>
      <View style={styles.questCardHeader}>
        <View style={styles.questCardCopy}>
          <Text style={styles.eyebrow}>{challenge.category}</Text>
          <Text style={styles.questTitle}>{challenge.title}</Text>
          <Text style={styles.questObjective}>{challenge.objective}</Text>
        </View>
        <View style={styles.badgeImageFrame}>
          {badgeUrl ? <Image source={{ uri: badgeUrl }} style={styles.badgeImage} resizeMode="contain" /> : <Text style={styles.badgeFallbackText}>{challenge.badgeIdentity.motif}</Text>}
        </View>
      </View>

      <View style={styles.questFlavorCard}>
        <Text style={styles.questFlavor}>{challenge.flavor}</Text>
      </View>

      <View style={styles.questInstructionCard}>
        <Text style={styles.instructionLabel}>Mobile mission brief</Text>
        <Text style={styles.instructionCopy}>{challenge.instruction}</Text>
        <Text style={styles.openingHint}>{challenge.openingHint}</Text>
      </View>

      <View style={styles.factGrid}>
        <Fact label="Reward" value={`+${challenge.reward} points`} />
        <Fact label="Proof" value={challenge.proofCallout} />
        <Fact label="Coat" value={challenge.badgeIdentity.name} />
        <Fact label="Completion" value={challenge.completionRate} />
      </View>

      <HeraldryCard challenge={challenge} />

      <Text style={styles.rulesTitle}>Rules of engagement</Text>
      {challenge.rules.map((rule) => (
        <Text key={rule} style={styles.rule}>• {rule}</Text>
      ))}

      <View style={styles.buttonRow}>
        <Pressable style={styles.primaryButton} onPress={() => onSelectTab("status")}>
          <Text style={styles.primaryButtonText}>See quest status</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => onSelectTab("proof")}>
          <Text style={styles.secondaryButtonText}>Preview proof</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => void Linking.openURL(`${getApiBaseUrl()}/challenges/${challenge.id}`)}>
          <Text style={styles.secondaryButtonText}>Open on website</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HeraldryCard({ challenge }: { challenge: MobileChallenge }) {
  return (
    <View style={styles.heraldryCard}>
      <View style={styles.heraldryHeader}>
        <Text style={styles.heraldryGlyph}>{challenge.badgeIdentity.motif}</Text>
        <View style={styles.heraldryHeaderCopy}>
          <Text style={styles.eyebrow}>Coat of arms reward</Text>
          <Text style={styles.heraldryTitle}>{challenge.badgeIdentity.name}</Text>
          <Text style={styles.heraldryMotto}>“{challenge.badgeIdentity.heraldry.motto}”</Text>
        </View>
      </View>
      <Text style={styles.cardBody}>{challenge.badgeIdentity.unlockCopy}</Text>
      <View style={styles.factGrid}>
        <Fact label="Shield" value={challenge.badgeIdentity.heraldry.shield} />
        <Fact label="Charge" value={challenge.badgeIdentity.heraldry.charge} />
        <Fact label="Meaning" value={challenge.badgeIdentity.heraldry.meaning} />
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

function SyncCard({ bootstrap }: { bootstrap: MobileBootstrap }) {
  return (
    <View style={styles.syncCard}>
      <Text style={styles.eyebrow}>Anti-drift rule</Text>
      <Text style={styles.syncTitle}>The app follows the website.</Text>
      <Text style={styles.syncCopy}>{bootstrap.mobile.recommendedUpdatePolicy}</Text>
      <Text style={styles.microcopy}>API v{bootstrap.apiVersion} · Generated {new Date(bootstrap.generatedAt).toLocaleString()}</Text>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue} numberOfLines={1}>{value}</Text>
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

function absoluteAssetUrl(url: string) {
  if (url.startsWith("http")) return url;
  return `${getApiBaseUrl()}${url.startsWith("/") ? url : `/${url}`}`;
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
  content: { gap: 14, padding: 14, paddingBottom: 34 },
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
  navBrandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  logoMark: { width: 38, height: 38, borderRadius: 13 },
  navBrandCopy: { flex: 1 },
  navKicker: { color: colors.paper, fontWeight: "900", fontSize: 15, letterSpacing: -0.2 },
  navSub: { color: colors.muted, fontWeight: "800", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 },
  buildPill: { maxWidth: 104, color: "#111", fontSize: 9, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.gold, overflow: "hidden" },
  heroMainRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  heroCopyBlock: { flex: 1, gap: 7 },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
  title: { color: colors.paper, fontSize: 34, fontWeight: "900", letterSpacing: -2.2, lineHeight: 34 },
  heroCopy: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  heroBadgeFrame: { width: 88, height: 104, alignItems: "center", justifyContent: "center", borderRadius: 26, borderWidth: 1, borderColor: "rgba(245,200,106,.24)", backgroundColor: "rgba(0,0,0,.28)" },
  heroBadgeImage: { width: 82, height: 96 },
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
  quickStartCard: { gap: 12, padding: 15, borderRadius: 24, borderWidth: 1, borderColor: "rgba(245,200,106,.34)", backgroundColor: "rgba(255,255,255,.08)" },
  quickStartCopy: { gap: 5 },
  quickStartTitle: { color: colors.paper, fontSize: 23, fontWeight: "900", letterSpacing: -1, lineHeight: 25 },
  quickStartBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  quickActionStack: { gap: 8 },
  accountModeStrip: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 16, backgroundColor: "rgba(0,0,0,.22)", borderWidth: 1, borderColor: "rgba(96,240,175,.18)" },
  accountModeDot: { color: colors.green, fontSize: 10 },
  accountModeCopy: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: "800" },
  tabRail: { gap: 8, paddingRight: 18 },
  tabPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.stroke, backgroundColor: "rgba(255,255,255,.07)" },
  tabPillActive: { borderColor: "rgba(245,200,106,.78)", backgroundColor: "rgba(245,200,106,.16)" },
  tabIcon: { color: colors.muted, fontWeight: "900" },
  tabText: { color: colors.muted, fontWeight: "900" },
  tabTextActive: { color: colors.paper },
  sectionHeader: { gap: 6, paddingHorizontal: 2 },
  sectionTitle: { color: colors.paper, fontSize: 25, fontWeight: "900", letterSpacing: -1.1, lineHeight: 28 },
  sectionBody: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  questListCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 26, borderWidth: 1, borderColor: colors.stroke, backgroundColor: colors.panel },
  questListCardActive: { borderColor: "rgba(245,200,106,.72)", backgroundColor: "rgba(245,200,106,.13)" },
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
  trophyShelf: { gap: 10, padding: 14, borderRadius: 20, backgroundColor: "rgba(245,200,106,.08)", borderWidth: 1, borderColor: "rgba(245,200,106,.18)" },
  trophyRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  trophyBadge: { width: 46, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "rgba(0,0,0,.24)" },
  trophyImage: { width: 42, height: 48 },
  trophyGlyph: { color: colors.gold, fontSize: 22 },
  trophyCopy: { flex: 1, gap: 2 },
  trophyTitle: { color: colors.paper, fontSize: 15, fontWeight: "900" },
  trophyMeta: { color: colors.muted, fontSize: 12, fontWeight: "800" },
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
  proofScrollCard: { gap: 12, padding: 20, paddingTop: 48, borderRadius: 30, borderWidth: 1, borderColor: "rgba(245,200,106,.38)", backgroundColor: "rgba(255,247,232,.1)" },
  proofSeal: { position: "absolute", top: 14, right: 16, width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 27, backgroundColor: "#9e1d24", borderWidth: 2, borderColor: "rgba(255,255,255,.28)" },
  proofSealText: { color: "#ffe3b3", fontWeight: "900", fontSize: 13 },
  proofTitle: { color: colors.paper, fontSize: 31, lineHeight: 33, letterSpacing: -1.4, fontWeight: "900" },
  proofSubtitle: { color: colors.gold, fontSize: 16, fontWeight: "900" },
  proofBody: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  syncCard: { gap: 8, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.08)" },
  syncTitle: { color: colors.paper, fontSize: 20, fontWeight: "900" },
  syncCopy: { color: colors.muted, lineHeight: 21 },
  microcopy: { color: "rgba(199,189,169,.76)", fontSize: 11 },
});
