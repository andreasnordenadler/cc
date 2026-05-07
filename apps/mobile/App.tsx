/* eslint-disable jsx-a11y/alt-text */
import { useEffect, useMemo, useState } from "react";
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
import { fetchMobileBootstrap } from "./src/api/sqc";
import type { MobileBootstrap, MobileChallenge } from "./src/types/sqc";

export default function App() {
  const [bootstrap, setBootstrap] = useState<MobileBootstrap | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedChallenge = useMemo(() => {
    if (!bootstrap) return null;
    return bootstrap.challenges.find((challenge) => challenge.id === selectedChallengeId) ?? bootstrap.challenges[0] ?? null;
  }, [bootstrap, selectedChallengeId]);

  async function loadBootstrap({ refresh = false } = {}) {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const nextBootstrap = await fetchMobileBootstrap();
      setBootstrap(nextBootstrap);
      setSelectedChallengeId((currentId) => currentId ?? nextBootstrap.challenges[0]?.id ?? null);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load Side Quest Chess.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadBootstrap();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl tintColor="#f5c86a" refreshing={refreshing} onRefresh={() => void loadBootstrap({ refresh: true })} />}
      >
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Mobile app foundation</Text>
          <Text style={styles.title}>Side Quest Chess</Text>
          <Text style={styles.heroCopy}>
            One app for iOS and Android, fed by the same quest catalog and product rules as sidequestchess.com.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#f5c86a" />
            <Text style={styles.muted}>Loading the live SQC catalog…</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Could not load quests</Text>
            <Text style={styles.errorCopy}>{error}</Text>
            <Pressable style={styles.primaryButton} onPress={() => void loadBootstrap()}>
              <Text style={styles.primaryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {bootstrap && selectedChallenge ? (
          <>
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
                  onPress={() => setSelectedChallengeId(challenge.id)}
                />
              ))}
            </ScrollView>

            <QuestDetailCard challenge={selectedChallenge} />

            <View style={styles.syncCard}>
              <Text style={styles.eyebrow}>Anti-drift rule</Text>
              <Text style={styles.syncTitle}>The app follows the website.</Text>
              <Text style={styles.syncCopy}>{bootstrap.mobile.recommendedUpdatePolicy}</Text>
              <Text style={styles.microcopy}>API v{bootstrap.apiVersion} · Generated {new Date(bootstrap.generatedAt).toLocaleString()}</Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#060507" },
  screen: { flex: 1, backgroundColor: "#060507" },
  content: { gap: 18, padding: 18, paddingBottom: 34 },
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
  sectionHeader: { gap: 6 },
  sectionTitle: { color: "#fff7e8", fontSize: 22, fontWeight: "900", letterSpacing: -.7 },
  questRail: { gap: 10, paddingRight: 18 },
  questPill: { width: 180, gap: 7, padding: 14, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,.14)", backgroundColor: "rgba(255,255,255,.07)" },
  questPillActive: { borderColor: "rgba(245,200,106,.72)", backgroundColor: "rgba(245,200,106,.14)" },
  questPillBadge: { color: "#f5c86a", fontSize: 28 },
  questPillTitle: { color: "#fff7e8", fontSize: 16, fontWeight: "900" },
  questPillMeta: { color: "#60f0af", fontSize: 12, fontWeight: "800" },
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
  syncCard: { gap: 8, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: "rgba(96,240,175,.24)", backgroundColor: "rgba(96,240,175,.08)" },
  syncTitle: { color: "#fff7e8", fontSize: 20, fontWeight: "900" },
  syncCopy: { color: "#c7bda9", lineHeight: 21 },
  microcopy: { color: "rgba(199,189,169,.76)", fontSize: 11 },
});
