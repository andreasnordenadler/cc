import Image from "next/image";
import Link from "next/link";
import ChallengeBadge from "@/components/challenge-badge";
import ProofTime from "@/components/proof-time";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import SiteNav from "@/components/site-nav";
import { redirect } from "next/navigation";
import { CHALLENGES } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  getPreferredRunnerName,
  type UserMetadataRecord,
} from "@/lib/user-metadata";
import { listUserRelatedGroupQuests } from "@/lib/groupquests";

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

  const metadata = user.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const runnerDisplayName = getPreferredRunnerName(metadata, {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    emailAddress: user.primaryEmailAddress?.emailAddress,
  }) || "SQC player";
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const completedChallenges = CHALLENGES.filter((challenge) => completedSet.has(challenge.id));
  const activeChallengeRecord = activeChallenge?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id) ?? null
    : null;
  const hasChessIdentity = [lichessUsername, chessComUsername].some(Boolean);
  const activeQuestCompleted = activeChallengeRecord ? completedSet.has(activeChallengeRecord.id) : false;
  const nextStep = getNextStep({ hasChessIdentity, activeChallengeRecord, activeQuestCompleted });
  const multiplayerVictories: Array<{
    placement: string;
    title: string;
    completedAt: string;
    href: string;
    seal: string;
    copy: string;
    defeated: string;
  }> = [];

  const client = await clerkClient();
  const relatedGroupQuests = await listUserRelatedGroupQuests(client, user.id);
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
            </div>
            <div className="current-mission-multiplayer" aria-label="Active multiplayer side quests">
              <span className="eyebrow">Active Multiplayer Side Quests</span>
              <div className="active-multiplayer-list">
                {activeGroupQuests.length ? activeGroupQuests.map((quest) => (
                  <Link href={quest.href} className="active-multiplayer-row" key={quest.title}>
                    <Image src="/stamps/SQCBLACK%20SEAL.png" alt="" width={36} height={36} />
                    <strong>{quest.title}</strong>
                    <span>{quest.status} · {quest.copy}</span>
                  </Link>
                )) : <p>No active Multiplayer Side Quests yet.</p>}
              </div>
              <div className="button-row current-mission-multiplayer-actions">
                <Link href="/groupquests" className="button secondary">Open Multiplayer Side Quests</Link>
              </div>
            </div>
          </div>
          <div className="current-mission-visual">
            {activeChallengeRecord ? (
              <Link href={`/challenges/${activeChallengeRecord.id}`} className="current-mission-coat" aria-label={`Open ${activeChallengeRecord.title} quest page`}>
                {activeQuestCompleted ? (
                  <span className="current-mission-complete-seal" aria-hidden="true">
                    <Image src="/stamps/quest-complete-real-red-wax-sqc-v8.png" alt="" width={72} height={72} />
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
              <h2>{completedChallenges.length ? "A deeply unnecessary trophy cabinet." : "No completed side quests yet."}</h2>
              <p>
                {completedChallenges.length
                  ? "Officially impressive. Socially complicated. Please admire responsibly."
                  : "No tiny heraldic paperwork yet. The shame is currently very organized."}
              </p>
            </div>
          </div>

          {completedChallenges.length || multiplayerVictories.length ? (
            <>
              <div className="quest-achievement-sections">
                <section className="quest-achievement-lane" aria-label="Completed solo Side Quests">
                  <div className="quest-achievement-lane-head">
                    <div>
                      <span className="eyebrow">Completed Side Quest Coat of Arms</span>
                      <h3>Completed Side Quests</h3>
                    </div>
                  </div>
                  {completedChallenges.length ? (
                    <div className="completed-quest-list trophy-grid" aria-label="Completed side quests">
                      {completedChallenges.map((challenge, index) => {
                        const latestProof = getLatestPassedAttempt(metadata, challenge.id);
                        const finishedAt = latestProof?.completedGameAt ?? latestProof?.checkedAt;
                        const trophyCopy = getAwkwardTrophyCopy(index);

                        return (
                          <Link href={`/challenges/${challenge.id}`} className="completed-quest-list-item trophy-card" key={challenge.id}>
                            <span className="trophy-card-shine" aria-hidden="true" />
                            <span className="trophy-card-badge">
                              <ChallengeBadge challenge={challenge} presentation="art" earned />
                            </span>
                            <span className="trophy-card-copy">
                              <strong>{challenge.title}</strong>
                              <em>{trophyCopy.line}</em>
                              <span>{finishedAt ? <>Ceremonially logged <ProofTime value={finishedAt} /></> : "Completed, allegedly."}</span>
                            </span>
                            <span className="won-card-seal solo" aria-hidden="true">
                              <Image src="/stamps/sqc-wax-seal-canonical.png" alt="" width={58} height={58} />
                            </span>
                          </Link>
                        );
                      })}
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
                    {multiplayerVictories.map((victory) => (
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
                    ))}
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
