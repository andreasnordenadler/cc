/* eslint-disable jsx-a11y/alt-text */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ClerkProvider, SignedIn, SignedOut, useAuth, useClerk, useSSO, useUser } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchMobileAccountState, fetchMobileBootstrap } from "./src/api/sqc";
import { clerkPublishableKey, clerkTokenCache, isClerkMobileAuthConfigured } from "./src/auth/clerk";
import type { MobileAccountResponse, MobileBootstrap, MobileChallenge } from "./src/types/sqc";

type AppTab = "catalog" | "quest" | "account" | "status" | "proof";

type MobileShellState = {
  bootstrap: MobileBootstrap | null;
  account: MobileAccountResponse | null;
  selectedChallengeId: string | null;
  activeTab: AppTab;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
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

WebBrowser.maybeCompleteAuthSession();

const TABS: Array<{ id: AppTab; label: string }> = [
  { id: "catalog", label: "Quests" },
  { id: "quest", label: "Detail" },
  { id: "account", label: "Account" },
  { id: "status", label: "Status" },
  { id: "proof", label: "Proof" },
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
    const { createdSessionId, setActive } = await startSSOFlow({ strategy: "oauth_google" });

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
    error: null,
  });

  const selectedChallenge = useMemo(() => {
    if (!shell.bootstrap) return null;
    return shell.bootstrap.challenges.find((challenge) => challenge.id === shell.selectedChallengeId) ?? shell.bootstrap.challenges[0] ?? null;
  }, [shell.bootstrap, shell.selectedChallengeId]);

  const loadBootstrap = useCallback(async ({ refresh = false } = {}) => {
    if (!authBridge.isLoaded) return;

    setShell((current) => ({ ...current, loading: !refresh, refreshing: refresh }));

    try {
      const sessionToken = authBridge.isSignedIn ? await authBridge.getSessionToken() : null;
      const [nextBootstrap, nextAccount] = await Promise.all([
        fetchMobileBootstrap(),
        fetchMobileAccountState(sessionToken),
      ]);
      setShell((current) => ({
        ...current,
        bootstrap: nextBootstrap,
        account: nextAccount,
        selectedChallengeId: current.selectedChallengeId ?? nextBootstrap.challenges[0]?.id ?? null,
        loading: false,
        refreshing: false,
        error: null,
      }));
    } catch (caught) {
      setShell((current) => ({
        ...current,
        loading: false,
        refreshing: false,
        error: caught instanceof Error ? caught.message : "Could not load Side Quest Chess.",
      }));
    }
  }, [authBridge]);

  useEffect(() => {
    void loadBootstrap();
  }, [loadBootstrap]);

  function selectChallenge(challengeId: string, nextTab: AppTab = "quest") {
    setShell((current) => ({ ...current, selectedChallengeId: challengeId, activeTab: nextTab }));
  }

  function selectTab(activeTab: AppTab) {
    setShell((current) => ({ ...current, activeTab }));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl tintColor="#f5c86a" refreshing={shell.refreshing} onRefresh={() => void loadBootstrap({ refresh: true })} />}
      >
        <HeaderCard />
        <MobileAuthSessionCard authBridge={authBridge} />

        {shell.loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#f5c86a" />
            <Text style={styles.muted}>Loading the live SQC catalog…</Text>
          </View>
        ) : null}

        {shell.error ? <ErrorCard error={shell.error} onRetry={() => void loadBootstrap()} /> : null}

        {shell.bootstrap && selectedChallenge ? (
          <>
            <TabBar activeTab={shell.activeTab} onSelectTab={selectTab} />
            <ActiveScreen
              activeTab={shell.activeTab}
              bootstrap={shell.bootstrap}
              selectedChallenge={selectedChallenge}
              account={shell.account}
              authBridge={authBridge}
              onSelectChallenge={selectChallenge}
            />
            <SyncCard bootstrap={shell.bootstrap} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function HeaderCard() {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.eyebrow}>Android alpha shell</Text>
      <Text style={styles.title}>Side Quest Chess</Text>
      <Text style={styles.heroCopy}>
        Expo app structure for catalog, quest detail, account, status, and proof flows — all fed by sidequestchess.com where the backend contract already exists.
      </Text>
    </View>
  );
}

function MobileAuthSessionCard({ authBridge }: { authBridge: MobileAuthBridge }) {
  const [authActionPending, setAuthActionPending] = useState(false);
  const [authActionError, setAuthActionError] = useState<string | null>(null);

  async function runAuthAction(action: () => Promise<void>) {
    setAuthActionPending(true);
    setAuthActionError(null);

    try {
      await action();
    } catch (caught) {
      setAuthActionError(caught instanceof Error ? caught.message : "Mobile sign-in failed.");
    } finally {
      setAuthActionPending(false);
    }
  }

  if (!authBridge.configured) {
    return (
      <PlaceholderCard
        eyebrow="Mobile auth bridge"
        title="Clerk Expo provider is installed."
        body="Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in local/EAS env to enable the mobile session provider. No Clerk secrets are stored in the app repo."
        facts={[
          ["Provider", "@clerk/clerk-expo"],
          ["Token cache", "Expo SecureStore"],
          ["Account fetch", "Adds Authorization: Bearer <session> when signed in"],
        ]}
      />
    );
  }

  return (
    <View style={styles.authCard}>
      <Text style={styles.eyebrow}>Mobile auth bridge</Text>
      <SignedIn>
        <Text style={styles.placeholderTitle}>Signed in{authBridge.signedInLabel ? ` as ${authBridge.signedInLabel}` : ""}.</Text>
        <Text style={styles.placeholderBody}>Account refreshes now include the active Clerk session token when available.</Text>
        {authBridge.signOut ? (
          <Pressable style={styles.secondaryButton} disabled={authActionPending} onPress={() => void runAuthAction(authBridge.signOut!)}>
            <Text style={styles.secondaryButtonText}>{authActionPending ? "Working…" : "Sign out"}</Text>
          </Pressable>
        ) : null}
      </SignedIn>
      <SignedOut>
        <Text style={styles.placeholderTitle}>Signed-out mobile shell.</Text>
        <Text style={styles.placeholderBody}>Use Google sign-in to attach a Clerk session token, then reload account state from the backend.</Text>
        {authBridge.startGoogleSignIn ? (
          <Pressable style={styles.primaryButton} disabled={authActionPending || !authBridge.isLoaded} onPress={() => void runAuthAction(authBridge.startGoogleSignIn!)}>
            <Text style={styles.primaryButtonText}>{authActionPending ? "Opening Google…" : "Sign in with Google"}</Text>
          </Pressable>
        ) : null}
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
          <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function ActiveScreen({
  activeTab,
  bootstrap,
  selectedChallenge,
  account,
  authBridge,
  onSelectChallenge,
}: {
  activeTab: AppTab;
  bootstrap: MobileBootstrap;
  selectedChallenge: MobileChallenge;
  account: MobileAccountResponse | null;
  authBridge: MobileAuthBridge;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
}) {
  switch (activeTab) {
    case "catalog":
      return <CatalogScreen bootstrap={bootstrap} selectedChallenge={selectedChallenge} onSelectChallenge={onSelectChallenge} />;
    case "quest":
      return <QuestDetailScreen challenge={selectedChallenge} />;
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
  selectedChallenge,
  onSelectChallenge,
}: {
  bootstrap: MobileBootstrap;
  selectedChallenge: MobileChallenge;
  onSelectChallenge: (challengeId: string, nextTab?: AppTab) => void;
}) {
  return (
    <View style={styles.screenStack}>
      <View style={styles.sectionHeader}>
        <Text style={styles.eyebrow}>Live catalog</Text>
        <Text style={styles.sectionTitle}>{bootstrap.challenges.length} side quests from the web backend</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.questRail}>
        {bootstrap.challenges.map((challenge) => (
          <QuestPill
            key={challenge.id}
            challenge={challenge}
            active={challenge.id === selectedChallenge.id}
            onPress={() => onSelectChallenge(challenge.id, "quest")}
          />
        ))}
      </ScrollView>

      <View style={styles.queueCard}>
        <Text style={styles.queueTitle}>Android alpha flow map</Text>
        <FlowStep done label="Fetch /api/mobile/bootstrap" />
        <FlowStep done label="Browse backend-owned quest catalog" />
        <FlowStep done label="Authenticated read-only account contract" />
        <FlowStep label="Start/check/reset quest actions" />
        <FlowStep label="Proof viewer + native share sheet" />
      </View>
    </View>
  );
}

function QuestDetailScreen({ challenge }: { challenge: MobileChallenge }) {
  return <QuestDetailCard challenge={challenge} />;
}

function AccountShell({ bootstrap, account, authBridge }: { bootstrap: MobileBootstrap; account: MobileAccountResponse | null; authBridge: MobileAuthBridge }) {
  if (!account || !account.authenticated) {
    return (
      <PlaceholderCard
        eyebrow="Account contract"
        title={authBridge.configured ? "Mobile session bridge is ready." : "Ready for mobile sign-in."}
        body="The read-only account endpoint now exists. Account refreshes include a Clerk bearer token when the Expo session is signed in."
        facts={[
          ["Endpoint", "/api/mobile/account"],
          ["Source", bootstrap.product.canonicalUrl],
          ["Session", authBridge.isSignedIn ? "Clerk token attached" : "Signed out / no mobile token yet"],
        ]}
      />
    );
  }

  return (
    <View style={styles.placeholderCard}>
      <Text style={styles.eyebrow}>My Side Quest</Text>
      <Text style={styles.placeholderTitle}>{account.profile.displayName}</Text>
      <Text style={styles.placeholderBody}>{account.profile.bio || "Your live backend-owned account state is now readable by mobile."}</Text>
      <View style={styles.factGrid}>
        <Fact label="Points" value={`${account.progress.totalRewardPoints}`} />
        <Fact label="Coats of arms" value={`${account.progress.totalCompletedChallenges}`} />
        <Fact label="Proof receipts" value={`${account.progress.proofReceiptCount}`} />
        <Fact label="Lichess" value={account.chessAccounts.lichessUsername ?? "Not connected"} />
        <Fact label="Chess.com" value={account.chessAccounts.chessComUsername ?? "Not connected"} />
      </View>
    </View>
  );
}

function StatusShell({ selectedChallenge, account }: { selectedChallenge: MobileChallenge; account: MobileAccountResponse | null }) {
  if (account?.authenticated && account.activeQuest) {
    return (
      <PlaceholderCard
        eyebrow="Quest status"
        title={account.activeQuest.completed ? "Quest completed." : account.activeQuest.title}
        body={account.activeQuest.banner}
        facts={[
          ["Status", account.activeQuest.status],
          ["Started", account.activeQuest.startedAt ? new Date(account.activeQuest.startedAt).toLocaleString() : "Not started"],
          ["Latest receipt", account.latestReceipt?.headline ?? "No latest check yet"],
        ]}
      />
    );
  }

  return (
    <PlaceholderCard
      eyebrow="Quest status contract"
      title="Active quest state will stay backend-owned."
      body={`The mobile app is ready to show start, pending, passed, failed, reset, and repeat states for “${selectedChallenge.title}” as soon as mobile auth is attached.`}
      facts={[
        ["Selected quest", selectedChallenge.title],
        ["Endpoint", "/api/mobile/account"],
        ["Verifier rule", "Do not duplicate verification logic in React Native."],
      ]}
    />
  );
}

function ProofShell({ selectedChallenge, account }: { selectedChallenge: MobileChallenge; account: MobileAccountResponse | null }) {
  if (account?.authenticated && account.latestReceipt) {
    return (
      <PlaceholderCard
        eyebrow="Latest proof receipt"
        title={account.latestReceipt.headline}
        body={account.latestReceipt.detail}
        facts={[
          ["Game", account.latestReceipt.gameId ?? "No game id"],
          ["Provider", account.latestReceipt.provider ?? "Unknown"],
          ["Updated", account.latestReceipt.checkedAt ? new Date(account.latestReceipt.checkedAt).toLocaleString() : "Not checked"],
        ]}
      />
    );
  }

  return (
    <PlaceholderCard
      eyebrow="Proof contract"
      title="Receipts and native sharing are API-ready next."
      body="Proof images stay generated by the web backend. The app now has the account/proof-status shape needed before adding Android native sharing."
      facts={[
        ["Proof copy", selectedChallenge.proofCallout],
        ["Coat of arms", selectedChallenge.badgeIdentity.name],
        ["Native target", "Android share sheet first, iOS after distribution setup."],
      ]}
    />
  );
}

function ErrorCard({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>Could not load quests</Text>
      <Text style={styles.errorCopy}>{error}</Text>
      <Pressable style={styles.primaryButton} onPress={onRetry}>
        <Text style={styles.primaryButtonText}>Try again</Text>
      </Pressable>
    </View>
  );
}

function QuestPill({ challenge, active, onPress }: { challenge: MobileChallenge; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.questPill, active && styles.questPillActive]} onPress={onPress}>
      <Text style={styles.questPillBadge}>{challenge.badgeIdentity.motif}</Text>
      <Text style={styles.questPillTitle}>{challenge.title}</Text>
      <Text style={styles.questPillMeta}>+{challenge.reward} · {challenge.difficulty}</Text>
    </Pressable>
  );
}

function QuestDetailCard({ challenge }: { challenge: MobileChallenge }) {
  return (
    <View style={styles.questCard}>
      <View style={styles.questCardHeader}>
        <View style={styles.questCardCopy}>
          <Text style={styles.eyebrow}>{challenge.category}</Text>
          <Text style={styles.questTitle}>{challenge.title}</Text>
          <Text style={styles.questObjective}>{challenge.objective}</Text>
        </View>
        {challenge.badgeIdentity.imageUrl ? (
          <Image source={{ uri: challenge.badgeIdentity.imageUrl }} style={styles.badgeImage} resizeMode="contain" />
        ) : (
          <View style={[styles.badgeFallback, { borderColor: challenge.badgeIdentity.colors.secondary }]}>
            <Text style={styles.badgeFallbackText}>{challenge.badgeIdentity.motif}</Text>
          </View>
        )}
      </View>

      <Text style={styles.questFlavor}>{challenge.flavor}</Text>

      <View style={styles.factGrid}>
        <Fact label="Reward" value={`+${challenge.reward} points`} />
        <Fact label="Proof" value={challenge.proofCallout} />
        <Fact label="Coat" value={challenge.badgeIdentity.name} />
      </View>

      <Text style={styles.rulesTitle}>Rules</Text>
      {challenge.rules.map((rule) => (
        <Text key={rule} style={styles.rule}>• {rule}</Text>
      ))}
    </View>
  );
}

function PlaceholderCard({ eyebrow, title, body, facts }: { eyebrow: string; title: string; body: string; facts: Array<[string, string]> }) {
  return (
    <View style={styles.placeholderCard}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderBody}>{body}</Text>
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function FlowStep({ label, done = false }: { label: string; done?: boolean }) {
  return <Text style={styles.flowStep}>{done ? "✓" : "○"} {label}</Text>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#060507" },
  screen: { flex: 1, backgroundColor: "#060507" },
  content: { gap: 18, padding: 18, paddingBottom: 34 },
  screenStack: { gap: 16 },
  heroCard: {
    gap: 10,
    padding: 22,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.14)",
    backgroundColor: "rgba(255,255,255,.08)",
  },
  eyebrow: { color: "#f5c86a", fontSize: 11, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
  title: { color: "#fff7e8", fontSize: 46, fontWeight: "900", letterSpacing: -3, lineHeight: 44 },
  heroCopy: { color: "#c7bda9", fontSize: 16, lineHeight: 23 },
  loadingCard: { alignItems: "center", gap: 12, padding: 24 },
  muted: { color: "#c7bda9" },
  errorCard: { gap: 10, padding: 18, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,122,102,.44)", backgroundColor: "rgba(255,122,102,.1)" },
  errorTitle: { color: "#ffd6cf", fontSize: 18, fontWeight: "900" },
  errorCopy: { color: "#ffd6cf", lineHeight: 20 },
  primaryButton: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 999, backgroundColor: "#f5c86a" },
  primaryButtonText: { color: "#111", fontWeight: "900" },
  secondaryButton: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,.22)", backgroundColor: "rgba(255,255,255,.08)" },
  secondaryButtonText: { color: "#fff7e8", fontWeight: "900" },
  tabRail: { gap: 8, paddingRight: 18 },
  tabPill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,.14)", backgroundColor: "rgba(255,255,255,.07)" },
  tabPillActive: { borderColor: "rgba(245,200,106,.78)", backgroundColor: "rgba(245,200,106,.16)" },
  tabText: { color: "#c7bda9", fontWeight: "900" },
  tabTextActive: { color: "#fff7e8" },
  sectionHeader: { gap: 6 },
  sectionTitle: { color: "#fff7e8", fontSize: 22, fontWeight: "900", letterSpacing: -0.7 },
  questRail: { gap: 10, paddingRight: 18 },
  questPill: { width: 180, gap: 7, padding: 14, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,.14)", backgroundColor: "rgba(255,255,255,.07)" },
  questPillActive: { borderColor: "rgba(245,200,106,.72)", backgroundColor: "rgba(245,200,106,.14)" },
  questPillBadge: { color: "#f5c86a", fontSize: 28 },
  questPillTitle: { color: "#fff7e8", fontSize: 16, fontWeight: "900" },
  questPillMeta: { color: "#60f0af", fontSize: 12, fontWeight: "800" },
  queueCard: { gap: 9, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: "rgba(96,240,175,.2)", backgroundColor: "rgba(96,240,175,.07)" },
  queueTitle: { color: "#fff7e8", fontSize: 18, fontWeight: "900" },
  flowStep: { color: "#c7bda9", fontSize: 14, lineHeight: 21, fontWeight: "700" },
  questCard: { gap: 16, padding: 18, borderRadius: 28, borderWidth: 1, borderColor: "rgba(255,255,255,.14)", backgroundColor: "rgba(255,255,255,.075)" },
  questCardHeader: { flexDirection: "row", gap: 14, alignItems: "center" },
  questCardCopy: { flex: 1, gap: 8 },
  questTitle: { color: "#fff7e8", fontSize: 32, fontWeight: "900", letterSpacing: -1.6, lineHeight: 32 },
  questObjective: { color: "#c7bda9", fontSize: 16, lineHeight: 22 },
  badgeImage: { width: 108, height: 108 },
  badgeFallback: { width: 92, height: 104, alignItems: "center", justifyContent: "center", borderRadius: 28, borderWidth: 4, backgroundColor: "rgba(0,0,0,.22)" },
  badgeFallbackText: { color: "#f5c86a", fontSize: 34, fontWeight: "900" },
  questFlavor: { color: "#fff7e8", fontSize: 15, fontWeight: "700", lineHeight: 22 },
  factGrid: { gap: 8 },
  fact: { gap: 4, padding: 12, borderRadius: 18, backgroundColor: "rgba(0,0,0,.2)" },
  factLabel: { color: "#f5c86a", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  factValue: { color: "#fff7e8", fontSize: 14, fontWeight: "800" },
  rulesTitle: { color: "#fff7e8", fontSize: 18, fontWeight: "900" },
  rule: { color: "#c7bda9", fontSize: 14, lineHeight: 21 },
  placeholderCard: { gap: 14, padding: 18, borderRadius: 28, borderWidth: 1, borderColor: "rgba(255,255,255,.14)", backgroundColor: "rgba(255,255,255,.075)" },
  authCard: { gap: 10, padding: 18, borderRadius: 28, borderWidth: 1, borderColor: "rgba(245,200,106,.28)", backgroundColor: "rgba(245,200,106,.09)" },
  placeholderTitle: { color: "#fff7e8", fontSize: 26, fontWeight: "900", letterSpacing: -1.1, lineHeight: 29 },
  placeholderBody: { color: "#c7bda9", fontSize: 15, lineHeight: 22 },
  syncCard: { gap: 8, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.08)" },
  syncTitle: { color: "#fff7e8", fontSize: 20, fontWeight: "900" },
  syncCopy: { color: "#c7bda9", lineHeight: 21 },
  microcopy: { color: "rgba(199,189,169,.76)", fontSize: 11 },
});
