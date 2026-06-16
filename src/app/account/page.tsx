import Image from "next/image";
import Link from "next/link";
import ChallengeBadge from "@/components/challenge-badge";
import ProofTime from "@/components/proof-time";
import RatingPill from "@/components/rating-pill";
import ShareProofActions from "@/components/share-proof-actions";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import SiteNav from "@/components/site-nav";
import { redirect } from "next/navigation";
import { CHALLENGES } from "@/lib/challenges";
import { buildPublicProofPath, publicProofImagePath } from "@/lib/proof-share";
import {
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  getPreferredRunnerName,
  getRunnerBio,
  getRunnerDisplayName,
  shouldPreselectDefaultStarterQuest,
  type UserMetadataRecord,
  withDefaultStarterQuest,
} from "@/lib/user-metadata";
import { listUserRelatedGroupQuests, type ServerGroupQuest } from "@/lib/groupquests";
import { getCustomSideQuests } from "@/lib/custom-side-quests";

function deriveGroupQuestStatus(startAt: string, endAt: string) {
  const now = Date.now();
  const start = Date.parse(startAt);
  const end = Date.parse(endAt);
  if (Number.isFinite(start) && start > now) return "Soon";
  if (Number.isFinite(end) && end < now) return "Finished";
  return "Live";
}

export default async function MyQuestLogPage() {
  noStore();
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const client = await clerkClient();
  let metadata = user.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  if (shouldPreselectDefaultStarterQuest(metadata)) {
    metadata = withDefaultStarterQuest(metadata);
    await client.users.updateUserMetadata(user.id, { publicMetadata: metadata });
  }
  const privateMetadata = user.privateMetadata ? (user.privateMetadata as UserMetadataRecord) : {};
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const savedRunnerDisplayName = getRunnerDisplayName(metadata);
  const runnerBio = getRunnerBio(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const runnerDisplayName = getPreferredRunnerName(metadata, {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    emailAddress: user.primaryEmailAddress?.emailAddress,
  }) || "SQC player";
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const proofReceiptCount = getChallengeAttempts(metadata).filter((attempt) => attempt.status === "passed").length;
  const customSideQuests = getCustomSideQuests(privateMetadata).length ? getCustomSideQuests(privateMetadata) : getCustomSideQuests(metadata);
  const completedChallenges = CHALLENGES.filter((challenge) => completedSet.has(challenge.id));
  const completedCustomSideQuests = customSideQuests.filter((quest) => completedSet.has(quest.id));
  const activeChallengeRecord = activeChallenge?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id) ?? null
    : null;
  const hasChessIdentity = [lichessUsername, chessComUsername].some(Boolean);
  const activeQuestCompleted = activeChallengeRecord ? completedSet.has(activeChallengeRecord.id) : false;
  const nextStep = getNextStep({ hasChessIdentity, activeChallengeRecord, activeQuestCompleted });
  const relatedGroupQuests = await listUserRelatedGroupQuests(client, user.id);
  const multiplayerVictories = buildMultiplayerVictories(relatedGroupQuests, user.id);
  const activeGroupQuests = relatedGroupQuests
    .filter((quest) => quest.hostUserId === user.id || quest.participants.some((participant) => participant.userId === user.id))
    .map((quest) => {
      const isHost = quest.hostUserId === user.id;
      const status = deriveGroupQuestStatus(quest.startAt, quest.endAt);
      return {
        title: quest.name,
        status,
        copy: `${isHost ? "Hosting" : "Playing"} · ${quest.participants.length} player${quest.participants.length === 1 ? "" : "s"} · ${quest.providerLabel}`,
        href: `/groupquests/${quest.id}${isHost ? "" : "?accepted=1"}`,
      };
    })
    .filter((quest) => quest.status !== "Finished");
  const hostedActiveGroupQuestCount = activeGroupQuests.filter((quest) => quest.copy.startsWith("Hosting")).length;
  const joinedActiveGroupQuestCount = activeGroupQuests.length - hostedActiveGroupQuestCount;
  const publishedCustomSideQuestCount = customSideQuests.filter((quest) => quest.lifecycle !== "archived" && quest.lifecycle !== "draft").length;
  const draftCustomSideQuestCount = customSideQuests.filter((quest) => quest.lifecycle === "draft").length;
  const readinessItems = [
    { label: "Profile", value: savedRunnerDisplayName ? savedRunnerDisplayName : "Add display name", ready: Boolean(savedRunnerDisplayName), href: "/profile" },
    { label: "Brag line", value: runnerBio ? "Saved" : "Add short bio", ready: Boolean(runnerBio), href: "/profile" },
    { label: "Lichess", value: lichessUsername || "Add username", ready: Boolean(lichessUsername), href: "/connect" },
    { label: "Chess.com", value: chessComUsername || "Add username", ready: Boolean(chessComUsername), href: "/connect" },
  ];
  const progressItems = [
    { label: "Completed", value: completedChallenges.length.toString(), href: "/account" },
    { label: "Proofs", value: proofReceiptCount.toString(), href: "/account" },
    { label: "Custom", value: customSideQuests.length ? `${publishedCustomSideQuestCount} playable · ${draftCustomSideQuestCount} draft${draftCustomSideQuestCount === 1 ? "" : "s"}` : "Create", href: "/account/custom-side-quests" },
    { label: "Multiplayer", value: activeGroupQuests.length ? `${hostedActiveGroupQuestCount} hosted · ${joinedActiveGroupQuestCount} joined` : "Open", href: "/groupquests" },
  ];
  const runChecklistItems = [
    {
      label: "1. Identity",
      value: savedRunnerDisplayName ? `${runnerDisplayName} is ready` : "Choose the name SQC should show on receipts.",
      href: "/profile",
      ready: Boolean(savedRunnerDisplayName),
    },
    {
      label: "2. Chess account",
      value: hasChessIdentity ? connectedChessLabel(lichessUsername, chessComUsername) : "Add Lichess or Chess.com so proof checks can run.",
      href: "/connect",
      ready: hasChessIdentity,
    },
    {
      label: "3. Next quest",
      value: activeChallengeRecord ? `${activeChallengeRecord.title}${activeQuestCompleted ? " is complete" : " is active"}` : "Pick a Solo Side Quest to judge next.",
      href: activeChallengeRecord ? `/challenges/${activeChallengeRecord.id}` : "/challenges",
      ready: Boolean(activeChallengeRecord),
    },
  ];
  const completedQuestReceipts = await Promise.all(completedChallenges.map(async (challenge, index) => {
    const latestProof = getLatestPassedAttempt(metadata, challenge.id);
    const finishedAt = latestProof?.completedGameAt ?? latestProof?.checkedAt;
    const trophyCopy = getAwkwardTrophyCopy(index);
    const proofPath = await buildPublicProofPath({ attempt: latestProof, challenge, runnerName: runnerDisplayName });

    return {
      challenge,
      finishedAt,
      proofPath,
      proofImagePath: publicProofImagePath(proofPath.split("/proof/")[1] ?? ""),
      shareCopy: `${runnerDisplayName} completed “${challenge.title}” on Side Quest Chess. ${challenge.badgeIdentity.name} unlocked. +${challenge.reward} points.`,
      trophyCopy,
    };
  }));
  const completedCustomQuestReceipts = completedCustomSideQuests.map((quest, index) => {
    const latestProof = getLatestPassedAttempt(metadata, quest.id);
    const finishedAt = latestProof?.completedGameAt ?? latestProof?.checkedAt;
    const providerLabel = latestProof?.provider === "chess.com" ? "Chess.com" : latestProof?.provider === "lichess" ? "Lichess" : "Public chess";

    return {
      quest,
      finishedAt,
      providerLabel,
      proofSummary: latestProof?.summary,
      gameId: latestProof?.gameId,
      trophyCopy: getAwkwardTrophyCopy(completedChallenges.length + index),
    };
  });

  return (
    <main className="site-shell">
      <SiteNav isSignedIn active="account" />

      <div className="content-wrap my-quest-log focused-quest-log">
        <section className="mission-card current-mission-card" aria-label="Current mission">
          <div className="current-mission-copy">
            <span className="eyebrow">Current mission</span>
            <div className="current-mission-identity-row">
              <h1>{runnerDisplayName}</h1>
              <div className="account-status-strip" aria-label="Connected chess accounts">
                <span className={lichessUsername ? "connected" : "missing"}>Lichess: <strong>{lichessUsername || "not connected"}</strong></span>
                <span className={chessComUsername ? "connected" : "missing"}>Chess.com: <strong>{chessComUsername || "not connected"}</strong></span>
                {!hasChessIdentity ? <Link href="/connect">Connect account</Link> : null}
              </div>
            </div>
            <h2>{nextStep.title}</h2>
            <p>{nextStep.copy}</p>
            <div className="button-row">
              <Link href={nextStep.href} className="button primary">{nextStep.cta}</Link>
              {activeQuestCompleted && activeChallengeRecord ? <Link href={`/challenges/${activeChallengeRecord.id}`} className="button secondary">Open completed quest</Link> : null}
              <Link href="/profile" className="button secondary">Edit profile</Link>
              <Link href="/account/custom-side-quests" className="button secondary">My Custom Side Quests</Link>
            </div>
            <div className="account-readiness-panel" aria-label="Account readiness and progress">
              <div className="account-readiness-head">
                <span className="eyebrow">Account readiness</span>
                <p>Your run setup at a glance: public SQC identity, chess username for proof checks, active Solo Side Quest, saved proof receipts, Custom Solo Side Quests, and Multiplayer activity.</p>
              </div>
              <div className="account-run-checklist" aria-label="Ready to run checklist">
                {runChecklistItems.map((item) => (
                  <Link className={`account-run-checklist-row ${item.ready ? "ready" : "missing"}`} href={item.href} key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </Link>
                ))}
              </div>
              <div className="account-readiness-grid" aria-label="Profile readiness">
                {readinessItems.map((item) => (
                  <Link className={`account-readiness-chip ${item.ready ? "ready" : "missing"}`} href={item.href} key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </Link>
                ))}
              </div>
              <div className="account-progress-grid" aria-label="Account progress summary">
                {progressItems.map((item) => (
                  <Link className="account-progress-chip" href={item.href} key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </Link>
                ))}
              </div>
            </div>
            <div className="current-mission-multiplayer" aria-label="Active multiplayer side quests">
              <span className="eyebrow">Active Multiplayer Side Quests</span>
              <div className="active-multiplayer-list">
                {activeGroupQuests.length ? activeGroupQuests.map((quest) => (
                  <Link href={quest.href} className="active-multiplayer-row" key={quest.title}>
                    <Image src="/stamps/sqc-multiplayer-seal.png" alt="" width={36} height={36} />
                    <strong>{quest.title}</strong>
                    <span>{quest.status} · {quest.copy}</span>
                  </Link>
                )) : <p>No active Multiplayer Side Quests yet.</p>}
              </div>
              <div className="button-row current-mission-multiplayer-actions">
                <Link href="/groupquests" className="button primary">Open Multiplayer Side Quests</Link>
              </div>
            </div>
          </div>
          <div className="current-mission-visual">
            {activeChallengeRecord ? (
              <Link href={`/challenges/${activeChallengeRecord.id}`} className="current-mission-coat" aria-label={`Open ${activeChallengeRecord.title} quest page`}>
                {activeQuestCompleted ? (
                  <span className="current-mission-complete-seal" aria-hidden="true">
                    <Image src="/stamps/quest-complete-premium-red-wax-sqc-v15.png" alt="" width={72} height={72} />
                  </span>
                ) : null}
                <ChallengeBadge challenge={activeChallengeRecord} presentation="art" size="hero" earned={completedSet.has(activeChallengeRecord.id)} />
                <span>{activeQuestCompleted ? "Completed quest" : "Active quest"}</span>
                <strong>{activeChallengeRecord.title}</strong>
              </Link>
            ) : (
              <Link href="/challenges" className="current-mission-empty">
                <div className="quest-log-empty-badge" aria-hidden="true">?</div>
                <span>Choose a quest</span>
              </Link>
            )}
          </div>
        </section>

        <section className="mission-card quest-log-collection-card awkward-trophy-case">
          <div className="section-head trophy-case-head">
            <div>
              <h2>{completedChallenges.length || completedCustomQuestReceipts.length || multiplayerVictories.length ? "A deeply unnecessary trophy cabinet." : "No completed side quests yet."}</h2>
              <p>
                {completedChallenges.length || completedCustomQuestReceipts.length || multiplayerVictories.length
                  ? "Officially impressive. Socially complicated. Please admire responsibly."
                  : "No tiny heraldic paperwork yet. The shame is currently very organized."}
              </p>
            </div>
          </div>

          {completedChallenges.length || completedCustomQuestReceipts.length || multiplayerVictories.length ? (
            <>
              <div className="trophy-case-summary" aria-label="Trophy Cabinet summary">
                <span><strong>{completedChallenges.length + completedCustomQuestReceipts.length}</strong> Solo coat{completedChallenges.length + completedCustomQuestReceipts.length === 1 ? "" : "s"} sealed</span>
                <span><strong>{proofReceiptCount}</strong> Proof receipt{proofReceiptCount === 1 ? "" : "s"} saved</span>
                <span><strong>{multiplayerVictories.length}</strong> Podium scroll{multiplayerVictories.length === 1 ? "" : "s"}</span>
              </div>
              <div className="quest-achievement-sections">
                <section className="quest-achievement-lane" aria-label="Completed solo Side Quests">
                  <div className="quest-achievement-lane-head">
                    <div>
                      <span className="eyebrow">Completed Side Quest Coat of Arms</span>
                      <h3>Completed Side Quests</h3>
                    </div>
                  </div>
                  {completedChallenges.length || completedCustomQuestReceipts.length ? (
                    <div className="completed-quest-list trophy-grid" aria-label="Completed side quests">
                      {completedQuestReceipts.map(({ challenge, finishedAt, proofImagePath, proofPath, shareCopy, trophyCopy }) => {
                        const latestProof = getLatestPassedAttempt(metadata, challenge.id);
                        return (
                          <article className="completed-quest-list-item trophy-card" key={challenge.id}>
                            <span className="trophy-card-shine" aria-hidden="true" />
                            <Link href={`/challenges/${challenge.id}`} className="trophy-card-badge" aria-label={`Open ${challenge.title}`}>
                              <ChallengeBadge challenge={challenge} presentation="art" earned />
                            </Link>
                            <div className="trophy-card-copy">
                              <Link href={`/challenges/${challenge.id}`}><strong>{challenge.title}</strong></Link>
                              <em>{trophyCopy.line}</em>
                              <span>{finishedAt ? <>Ceremonially logged <ProofTime value={finishedAt} /></> : "Completed, allegedly."}</span>
                              <div className="trophy-proof-panel" aria-label={`${challenge.title} proof receipt`}>
                                <span>Receipt</span>
                                <strong>{formatProofProvider(latestProof?.provider)}{latestProof?.gameId ? ` · ${latestProof.gameId}` : ""}</strong>
                                <small>{latestProof?.summary || `${challenge.badgeIdentity.name} unlocked.`} <RatingPill value={challenge.reward} /></small>
                              </div>
                              <div className="trophy-card-actions">
                                <Link href={proofPath} className="button secondary">Open proof receipt</Link>
                                <ShareProofActions
                                  challengeTitle={challenge.title}
                                  copy={shareCopy}
                                  imagePath={proofImagePath}
                                  sharePath={proofPath}
                                />
                              </div>
                            </div>
                            <span className="won-card-seal solo" aria-hidden="true">
                              <Image src="/stamps/sqc-wax-seal-canonical.png" alt="" width={58} height={58} />
                            </span>
                          </article>
                        );
                      })}
                      {completedCustomQuestReceipts.map(({ quest, finishedAt, providerLabel, proofSummary, gameId, trophyCopy }) => (
                        <article className="completed-quest-list-item trophy-card" key={quest.id}>
                          <span className="trophy-card-shine" aria-hidden="true" />
                          <Link href="/account/custom-side-quests" className="trophy-card-badge" aria-label={`Open ${quest.title} custom Side Quest`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={quest.badgeImageUrl || "/badges/custom/clean/custom-coat-knight-gold.png"} alt="" />
                          </Link>
                          <div className="trophy-card-copy">
                            <Link href="/account/custom-side-quests"><strong>{quest.title}</strong></Link>
                            <em>{trophyCopy.line}</em>
                            <span>{finishedAt ? <>Custom Solo Side Quest proof logged <ProofTime value={finishedAt} /></> : "Custom Solo Side Quest completed, allegedly."}</span>
                            <div className="trophy-proof-panel" aria-label={`${quest.title} proof receipt`}>
                              <span>Receipt</span>
                              <strong>{providerLabel}{gameId ? ` · ${gameId}` : ""}</strong>
                              <small>{proofSummary || "Custom Solo Side Quest proof is saved to your account ledger. Open My Custom Side Quests for board evidence and controls."}</small>
                            </div>
                            <div className="trophy-card-actions">
                              <Link href="/account/custom-side-quests" className="button secondary">Open Custom Solo Side Quest receipt</Link>
                            </div>
                          </div>
                          <span className="won-card-seal solo" aria-hidden="true">
                            <Image src="/stamps/sqc-wax-seal-canonical.png" alt="" width={58} height={58} />
                          </span>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-collection-state trophy-empty-state">
                      <p>No completed solo Side Quests yet. Finish one and the coat of arms lands here.</p>
                      <Link href="/challenges" className="button primary">Choose a Side Quest</Link>
                    </div>
                  )}
                </section>

                <section className="quest-achievement-lane multiplayer-victory-lane" aria-label="Multiplayer Side Quest victories">
                  <div className="quest-achievement-lane-head">
                    <div>
                      <span className="eyebrow">Multiplayer podium scrolls</span>
                      <h3>Completed Multiplayer Side Quests</h3>
                    </div>
                  </div>
                  <div className="multiplayer-victory-grid">
                    {multiplayerVictories.length ? multiplayerVictories.map((victory) => (
                      <Link href={victory.href} className="multiplayer-victory-card" key={`${victory.title}-${victory.placement}`}>
                        <span className="multiplayer-victory-scroll-thumb" aria-hidden="true">
                          <Image src="/scrolls/sqc-victory-scroll-template.png" alt="" width={78} height={116} />
                          <Image src={victory.seal} alt="" width={30} height={30} />
                        </span>
                        <span className="multiplayer-victory-copy">
                          <strong>{victory.placement} scroll · {victory.title}</strong>
                          <em>{victory.copy}</em>
                          <span>{victory.completedAt} · {victory.defeated}</span>
                        </span>
                        <span className="won-card-seal multiplayer" aria-hidden="true">
                          <Image src={victory.seal} alt="" width={58} height={58} />
                        </span>
                      </Link>
                    )) : (
                      <div className="empty-collection-state trophy-empty-state">
                        <p>No Multiplayer podium scrolls yet. Finish top-three in a completed table and the scroll lands here.</p>
                        <Link href="/groupquests" className="button primary">Open Multiplayer Side Quests</Link>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="empty-collection-state trophy-empty-state">
              <p>No completed side quests yet. Finish one and it will appear here with too much ceremony and not enough dignity.</p>
              <Link href="/challenges" className="button primary">Choose a Side Quest</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function getNextStep({
  hasChessIdentity,
  activeChallengeRecord,
  activeQuestCompleted,
}: {
  hasChessIdentity: boolean;
  activeChallengeRecord: (typeof CHALLENGES)[number] | null;
  activeQuestCompleted: boolean;
}) {
  if (!hasChessIdentity) {
    return {
      title: "Connect your chess username.",
      copy: "Add a public Lichess or Chess.com username first. SQC never needs your chess-site password.",
      href: "/connect",
      cta: "Connect chess account",
    };
  }

  if (!activeChallengeRecord) {
    return {
      title: "Pick one side quest.",
      copy: "Choose the ridiculous rule SQC should judge after your next public game.",
      href: "/challenges",
      cta: "Pick a Side Quest",
    };
  }

  if (activeQuestCompleted) {
    return {
      title: "Quest finished. Pick your next one.",
      copy: `${activeChallengeRecord.title} is complete. Your coat of arms is sealed; choose the next bad idea whenever you are ready.`,
      href: "/challenges",
      cta: "Pick your next quest",
    };
  }

  return {
    title: "Play, then verify.",
    copy: `${activeChallengeRecord.title} is on the royal docket — play one public game, then summon the checker.`,
    href: `/challenges/${activeChallengeRecord.id}`,
    cta: "Open active side quest",
  };
}

function getLatestPassedAttempt(metadata: UserMetadataRecord, challengeId: string) {
  return getChallengeAttempts(metadata, challengeId)
    .filter((attempt) => attempt.status === "passed")
    .at(-1) ?? null;
}

function connectedChessLabel(lichessUsername: string, chessComUsername: string) {
  return [lichessUsername ? `Lichess ${lichessUsername}` : null, chessComUsername ? `Chess.com ${chessComUsername}` : null]
    .filter(Boolean)
    .join(" · ");
}

function buildMultiplayerVictories(groupQuests: ServerGroupQuest[], userId: string) {
  return groupQuests
    .filter((quest) => deriveGroupQuestStatus(quest.startAt, quest.endAt) === "Finished")
    .map((quest) => {
      const ranked = [...quest.participants].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      const index = ranked.findIndex((participant) => participant.userId === userId);
      const participant = index >= 0 ? ranked[index] : null;

      if (!participant || index > 2 || (participant.score ?? 0) <= 0) return null;

      const placement = index === 0 ? "Gold" : index === 1 ? "Silver" : "Bronze";
      const finishedAtValues = Object.values(participant.questFinishedAt ?? {}).filter(Boolean);
      const completedAt = participant.lastProofAt ?? finishedAtValues.at(-1) ?? quest.endAt;
      const completedCount = participant.completedQuestIds?.length ?? 0;
      const otherPlayers = Math.max(quest.participants.length - 1, 0);

      return {
        placement,
        title: quest.name,
        completedAt: formatTrophyDate(completedAt),
        href: `/groupquests/${quest.id}?accepted=1`,
        seal: sealForPlacement(placement),
        copy: `${ordinal(index + 1)} place · ${completedCount}/${quest.questIds.length} quests verified`,
        defeated: otherPlayers ? `${otherPlayers} rival${otherPlayers === 1 ? "" : "s"} witnessed this` : "Solo podium paperwork, somehow",
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .slice(0, 12);
}

function sealForPlacement(placement: "Gold" | "Silver" | "Bronze") {
  if (placement === "Gold") return "/stamps/side_quest_chess_seal_gold_transparent.png";
  if (placement === "Silver") return "/stamps/side_quest_chess_seal_silver_transparent.png";
  return "/stamps/side_quest_chess_seal_bronze_transparent.png";
}

function ordinal(value: number) {
  if (value === 1) return "1st";
  if (value === 2) return "2nd";
  if (value === 3) return "3rd";
  return `${value}th`;
}

function formatTrophyDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Finished";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatProofProvider(provider?: string) {
  if (provider === "chess.com") return "Chess.com";
  if (provider === "lichess") return "Lichess";
  return "Public chess";
}

function getAwkwardTrophyCopy(index: number) {
  const lines = [
    {
      ribbon: "Regrettably earned",
      line: "The committee applauds, then immediately checks if anyone saw.",
    },
    {
      ribbon: "Tiny glory",
      line: "A brave monument to decisions that sounded worse out loud.",
    },
    {
      ribbon: "Officially weird",
      line: "Filed under accomplishments that require too much context.",
    },
    {
      ribbon: "Proud-ish",
      line: "Display prominently. Explain defensively. Repeat as needed.",
    },
    {
      ribbon: "Dubious honors",
      line: "The badge is real. The life choices remain under review.",
    },
  ];

  return lines[index % lines.length];
}
