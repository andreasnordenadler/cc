import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import ProofTime from "@/components/proof-time";
import { ProofPositionMiniBoard } from "@/components/proof-position-board";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import { getCustomSideQuests } from "@/lib/custom-side-quests";
import {
  listUserRelatedGroupQuests,
  rankGroupQuestParticipants,
  type ServerGroupQuest,
} from "@/lib/groupquests";
import { getChallengeAttempts, getChallengeProgress, type UserMetadataRecord } from "@/lib/user-metadata";

export default async function CoatOfArmsPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const privateMetadata = user?.privateMetadata ? (user.privateMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const liveBadgeChallenges = CHALLENGES.filter((challenge) => challenge.badgeIdentity.image);
  const earnedLiveBadgeCount = liveBadgeChallenges.filter((challenge) => completedSet.has(challenge.id)).length;
  const proofReceiptCount = getChallengeAttempts(metadata).filter((attempt) => attempt.status === "passed").length;
  const customSideQuests = user
    ? getCustomSideQuests(privateMetadata).length
      ? getCustomSideQuests(privateMetadata)
      : getCustomSideQuests(metadata)
    : [];
  const completedCustomSideQuests = customSideQuests.filter((quest) => completedSet.has(quest.id));
  const relatedGroupQuests = userId
    ? await listUserRelatedGroupQuests(await clerkClient(), userId)
    : [];
  const multiplayerTrophies = userId
    ? buildMultiplayerTrophies(relatedGroupQuests, userId)
    : [];
  const officialMultiplayerTrophies = multiplayerTrophies.filter((trophy) => trophy.source === "official");
  const communityMultiplayerTrophies = multiplayerTrophies.filter((trophy) => trophy.source === "community");
  const unlockedCount = earnedLiveBadgeCount + completedCustomSideQuests.length + multiplayerTrophies.length;
  const customAndCommunityCount = completedCustomSideQuests.length + communityMultiplayerTrophies.length;
  const unlockedSummary = userId
    ? `${unlockedCount} unlocked: ${earnedLiveBadgeCount} Official Solo Side Quest${earnedLiveBadgeCount === 1 ? "" : "s"} · ${officialMultiplayerTrophies.length} Official Multiplayer Side Quest${officialMultiplayerTrophies.length === 1 ? "" : "s"} · ${customAndCommunityCount} community/custom reward${customAndCommunityCount === 1 ? "" : "s"}`
    : "Sign in to sync your cabinet.";
  const completedProofBoards = CHALLENGES.map((challenge) => {
    const latestProof = getLatestPassedAttempt(metadata, challenge.id);
    if (!latestProof?.finalPositionFen) return null;
    return { challenge, latestProof };
  }).filter(Boolean);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="trophy" />

      <div className="content-wrap app-parity-account app-parity-trophy">
        <section className="mission-card trophy-app-hero" aria-label="Trophy Cabinet">
          <div className="trophy-app-hero-art" aria-hidden="true">
            <Image src="/sqc-logo-v11.png" alt="" width={172} height={172} />
          </div>
          <div className="section-head">
            <div>
              <span className="eyebrow">Trophy Cabinet</span>
              <h1>{userId ? "Your unified reward shelf" : "No Coat of Arms yet"}</h1>
              <p>
                {userId
                  ? "Official Solo coats and Official Multiplayer podiums are highlighted first; community and custom rewards still belong here."
                  : "Complete a Side Quest to unlock your first trophy."}
              </p>
            </div>
            <Link href={userId ? "/account" : "/sign-in"} className="button primary">
              {userId ? "Open Trophy Cabinet" : "Sign in to save coats"}
            </Link>
          </div>
          <div className="grid lean-status-grid" aria-label="Coat of Arms progress summary">
            <Fact label="Unlocked trophies" value={userId ? `${unlockedCount}` : "Saved after sign-in"} />
            <Fact label="Official Solo coats" value={`${earnedLiveBadgeCount}/${liveBadgeChallenges.length}`} />
            <Fact label="Official Multiplayer" value={userId ? `${officialMultiplayerTrophies.length}` : "Join to earn"} />
            <Fact label="Proof receipts" value={userId ? `${proofReceiptCount}` : "Saved after sign-in"} />
          </div>
          <p className="microcopy trophy-cabinet-summary-copy">{unlockedSummary}</p>
        </section>

        {userId && unlockedCount === 0 ? (
          <section className="mission-card app-trophy-row-panel" aria-label="Empty Trophy Cabinet">
            <div className="empty-collection-state trophy-empty-state">
              <p>No unlocked trophies yet. Complete any Official Solo Side Quest, Custom Solo Side Quest, or Multiplayer Side Quest and it will appear on this shelf.</p>
              <div className="button-row">
                <Link href="/solo" className="button primary">Explore Solo Side Quests</Link>
                <Link href="/multiplayer" className="button secondary">Open Multiplayer Side Quests</Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mission-card app-trophy-row-panel" aria-label="Official Multiplayer Side Quest trophies">
          <div className="section-head">
            <div>
              <span className="eyebrow">Official Multiplayer trophies</span>
              <h2>{officialMultiplayerTrophies.length} Official Multiplayer Side Quest podium{officialMultiplayerTrophies.length === 1 ? "" : "s"}.</h2>
              <p>Place on the podium in an official Multiplayer Side Quest to earn one here.</p>
            </div>
            <Link href="/leaderboards" className="button secondary">
              Official Leaderboards
            </Link>
          </div>
          {officialMultiplayerTrophies.length ? (
            <div className="app-row-list" aria-label="Official Multiplayer podium rewards">
              {officialMultiplayerTrophies.map((trophy) => (
                <Link href={trophy.href} className="app-proof-row trophy-podium-row" key={trophy.id}>
                  <Image src={trophy.seal} alt="" width={74} height={74} />
                  <span>
                    <small>Official Multiplayer Side Quest · {trophy.rankLabel}</small>
                    <strong>{trophy.title}</strong>
                    <em>{trophy.completedAt ? <>Completed <ProofTime value={trophy.completedAt} /></> : "Open full leaderboard and receipt context."}</em>
                  </span>
                  <b>{trophy.placement}</b>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-collection-state trophy-empty-state">
              <p>No Official Multiplayer podiums yet. Join an official event, verify the quest stack, and finish top-three.</p>
              <Link href="/multiplayer" className="button primary">Open Multiplayer Side Quests</Link>
            </div>
          )}
        </section>

        <section className="mission-card app-trophy-row-panel" aria-label="Unlocked Solo Side Quest rewards">
          <div className="section-head">
            <div>
              <span className="eyebrow">Unlocked Solo Side Quest rewards</span>
              <h2>Official and Custom Solo Side Quest Coats of Arms</h2>
              <p>Completed Solo Side Quests stay grouped together, whether they came from the official deck or your custom rules.</p>
            </div>
            <Link href="/solo" className="button secondary">
              Browse Solo Side Quests
            </Link>
          </div>
          {earnedLiveBadgeCount || completedCustomSideQuests.length ? (
            <div className="app-row-list" aria-label="Unlocked Solo Side Quest coats">
              {liveBadgeChallenges.filter((challenge) => completedSet.has(challenge.id)).map((challenge) => (
                <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="app-proof-row" aria-label={`Open ${challenge.title} quest`}>
                  <ChallengeBadge challenge={challenge} presentation="art" earned />
                  <span>
                    <small>Official Solo Side Quest · {challenge.badgeIdentity.name}</small>
                    <strong>{challenge.title}</strong>
                    <em>{challenge.objective}</em>
                  </span>
                  <b>Unlocked</b>
                </Link>
              ))}
              {completedCustomSideQuests.map((quest) => (
                <Link key={quest.id} href="/custom" className="app-proof-row" aria-label={`Open ${quest.title} custom Side Quest`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={quest.badgeImageUrl || "/badges/custom/clean/custom-coat-knight-gold.png"} alt="" />
                  <span>
                    <small>Custom Solo Side Quest · {quest.lifecycle ?? "published"}</small>
                    <strong>{quest.title}</strong>
                    <em>{quest.summary}</em>
                  </span>
                  <b>Unlocked</b>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-collection-state trophy-empty-state">
              <p>No unlocked Solo coats yet. Locked official previews are still visible below.</p>
              <Link href="/solo" className="button primary">Choose a Side Quest</Link>
            </div>
          )}
        </section>

        {communityMultiplayerTrophies.length ? (
          <section className="mission-card app-trophy-row-panel" aria-label="Community Multiplayer Side Quest trophies">
            <div className="section-head">
              <div>
                <span className="eyebrow">Community Multiplayer trophies</span>
                <h2>Community Multiplayer podiums.</h2>
                <p>Community Multiplayer wins are visible here, but official podiums stay more prominent.</p>
              </div>
              <Link href="/multiplayer" className="button secondary">Open Multiplayer Side Quests</Link>
            </div>
            <div className="app-row-list" aria-label="Community Multiplayer podium rewards">
              {communityMultiplayerTrophies.map((trophy) => (
                <Link href={trophy.href} className="app-proof-row trophy-podium-row" key={trophy.id}>
                  <Image src={trophy.seal} alt="" width={74} height={74} />
                  <span>
                    <small>Community Multiplayer Side Quest · {trophy.rankLabel}</small>
                    <strong>{trophy.title}</strong>
                    <em>{trophy.completedAt ? <>Completed <ProofTime value={trophy.completedAt} /></> : "Open full leaderboard and receipt context."}</em>
                  </span>
                  <b>{trophy.placement}</b>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mission-card app-trophy-row-panel" aria-label="Official Solo Side Quest collection">
          <div className="section-head">
            <div>
              <span className="eyebrow">Official Solo Side Quest collection</span>
              <h2>{earnedLiveBadgeCount} of {liveBadgeChallenges.length} official Side Quest coats unlocked.</h2>
              <p>Locked official coats are previews. Custom Solo Side Quest and community Multiplayer rewards appear above when earned.</p>
            </div>
            <Link href="/solo" className="button secondary">
              Browse Solo Side Quests
            </Link>
          </div>
          <div className="app-row-list" aria-label="Current live Side Quest Chess coats of arms">
            {liveBadgeChallenges.map((challenge) => (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="app-proof-row" aria-label={`Open ${challenge.title} quest`}>
                <ChallengeBadge challenge={challenge} presentation="art" earned={completedSet.has(challenge.id)} />
                <span>
                  <small>{completedSet.has(challenge.id) ? "Unlocked" : "Locked preview"}</small>
                  <strong>{challenge.title}</strong>
                  <em>{challenge.objective}</em>
                </span>
                <b>{challenge.difficulty}</b>
              </Link>
            ))}
          </div>
        </section>

        {userId && completedProofBoards.length ? (
          <section className="mission-card trophy-proof-board-section app-trophy-row-panel" aria-label="Verified Trophy Cabinet chess boards">
            <div className="section-head">
              <div>
                <span className="eyebrow">SQC proof boards</span>
                <h2>Verified boards</h2>
              </div>
              <Link href="/account" className="button secondary">Open Account Trophy Cabinet</Link>
            </div>
            <div className="app-row-list trophy-proof-board-grid">
              {completedProofBoards.map((item) => {
                if (!item) return null;
                const { challenge, latestProof } = item;
                return (
                  <Link href={`/challenges/${challenge.id}`} className="trophy-proof-board-card app-proof-row proof-board-row" key={challenge.id}>
                    <ChallengeBadge challenge={challenge} presentation="art" earned />
                    <span>
                      <small>Completed proof</small>
                      <strong>{challenge.title}</strong>
                      <em>
                        {latestProof.lastMoveSan || latestProof.lastMoveUci ? `Final move ${latestProof.lastMoveSan ?? latestProof.lastMoveUci} · ` : null}
                        <ProofTime value={latestProof.completedGameAt ?? latestProof.checkedAt} />
                      </em>
                      <ProofPositionMiniBoard
                        fen={latestProof.finalPositionFen}
                        lastMoveUci={latestProof.lastMoveUci}
                        label={`${challenge.title} Trophy Cabinet proof chess board`}
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function buildMultiplayerTrophies(groupQuests: ServerGroupQuest[], userId: string) {
  return groupQuests
    .filter((quest) => deriveQuestState(quest.startAt, quest.endAt) === "Finished")
    .map((quest) => {
      const ranked = rankGroupQuestParticipants(quest);
      const index = ranked.findIndex((participant) => participant.userId === userId);
      const participant = index >= 0 ? ranked[index] : null;
      if (!participant || index > 2 || (participant.score ?? 0) <= 0) return null;

      const placement = index === 0 ? "Gold" : index === 1 ? "Silver" : "Bronze";
      const finishedAtValues = Object.values(participant.questFinishedAt ?? {}).filter(Boolean);

      return {
        id: `${quest.id}-${placement.toLowerCase()}`,
        title: quest.name,
        placement,
        rankLabel: `${index + 1}${index === 0 ? "st" : index === 1 ? "nd" : "rd"} place`,
        source: quest.official ? "official" as const : "community" as const,
        completedAt: participant.lastProofAt ?? finishedAtValues.at(-1) ?? quest.endAt,
        href: `/groupquests/${quest.id}?accepted=1`,
        seal:
          placement === "Gold"
            ? "/stamps/side_quest_chess_seal_gold_transparent.png"
            : placement === "Silver"
              ? "/stamps/side_quest_chess_seal_silver_transparent.png"
              : "/stamps/side_quest_chess_seal_bronze_transparent.png",
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .slice(0, 12);
}

function deriveQuestState(startAt: string, endAt: string) {
  const now = Date.now();
  const start = Date.parse(startAt);
  const end = Date.parse(endAt);
  if (Number.isFinite(start) && now < start) return "Soon";
  if (Number.isFinite(end) && now > end) return "Finished";
  return "Live";
}

function getLatestPassedAttempt(metadata: UserMetadataRecord, challengeId: string) {
  return getChallengeAttempts(metadata, challengeId)
    .filter((attempt) => attempt.status === "passed")
    .at(-1) ?? null;
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
