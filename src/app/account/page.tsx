import Image from "next/image";
import Link from "next/link";
import ChallengeBadge from "@/components/challenge-badge";
import ProofTime from "@/components/proof-time";
import { currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { redirect } from "next/navigation";
import { CHALLENGES } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLichessUsername,
  getRunnerBio,
  getRunnerDisplayName,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function MyQuestLogPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const metadata = user.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const runnerDisplayName = getRunnerDisplayName(metadata) || user.username || user.firstName || "SQC player";
  const runnerBio = getRunnerBio(metadata);
  const attempts = getChallengeAttempts(metadata).slice().reverse();
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const completedChallenges = CHALLENGES.filter((challenge) => completedSet.has(challenge.id));
  const activeChallengeRecord = activeChallenge?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id) ?? null
    : null;
  const hasChessIdentity = [lichessUsername, chessComUsername].some(Boolean);
  const activeQuestCompleted = activeChallengeRecord ? completedSet.has(activeChallengeRecord.id) : false;
  const nextStep = getNextStep({ hasChessIdentity, activeChallengeRecord, activeQuestCompleted });
  const multiplayerVictories = [
    {
      placement: "Gold",
      title: "No Castle Night",
      completedAt: "May 12, 13:38 CEST",
      href: "/groupquests/80303?accepted=1#leaderboard-rank-1",
      seal: "/stamps/side_quest_chess_seal_gold_transparent.png",
      copy: "First player to complete the full Multiplayer Side Quest stack.",
      defeated: "3 players bested",
    },
  ];

  const activeGroupQuests = [
    {
      title: "No Castle Night",
      status: "Live",
      copy: "Fresh No Castle proof needed · 4 players",
      href: "/groupquests/gq_demo_no_castle_01",
      action: "Open multiplayer quest",
    },
    {
      title: "Beginner Chaos Ladder",
      status: "Starting soon",
      copy: "Confirm Blitz 5+3 rules before this Multiplayer Quest opens",
      href: "/groupquests/gq_demo_no_castle_01",
      action: "Review rules",
    },
  ];

  return (
    <main className="site-shell">
      <SiteNav isSignedIn active="account" />

      <div className="content-wrap my-quest-log focused-quest-log">
        <section className="mission-card quest-log-next-step-card" aria-label="Next step">
          <span className="eyebrow">Next step</span>
          <h2>{nextStep.title}</h2>
          <p>{nextStep.copy}</p>
          <Link href={nextStep.href} className="button primary">{nextStep.cta}</Link>
        </section>

        <div className="quest-log-top-grid">
          <section className="hero-card quest-log-hero focused-quest-hero">
          <div>
            <h1>{runnerDisplayName}</h1>
            <p className="hero-copy">
              {runnerBio || "Your connected accounts, current quest, points, proof, and earned coat of arms."}
            </p>
          </div>
          <div className="stats-row">
            <span>{progress.totalRewardPoints} points</span>
            <span>{completedChallenges.length} coat{completedChallenges.length === 1 ? "" : "s"} of arms</span>
            <span>{attempts.length} proof receipt{attempts.length === 1 ? "" : "s"}</span>
          </div>
          </section>


          <section className="mission-card quest-log-current-card compact-current-quest-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Current Quest</span>
              {!activeChallengeRecord ? <h2>No active quest.</h2> : null}
            </div>
          </div>

          {activeChallengeRecord ? (
            <>
              <Link href={`/challenges/${activeChallengeRecord.id}`} className="current-quest-coat-link" aria-label={`Open ${activeChallengeRecord.title} quest page`}>
                <ChallengeBadge challenge={activeChallengeRecord} presentation="art" size="hero" earned={completedSet.has(activeChallengeRecord.id)} />
                <small className="current-quest-coat-caption">{activeChallengeRecord.title}</small>
              </Link>
            </>
          ) : (
            <Link href="/challenges" className="current-quest-empty-link">
              <div className="quest-log-empty-badge" aria-hidden="true">?</div>
              <span>Choose a quest</span>
            </Link>
          )}
          </section>


        </div>

        <section className="mission-card my-group-quests-card" aria-label="Active Multiplayer Side Quests">
          <div className="section-head">
            <div>
              <span className="eyebrow">Active Multiplayer Quests</span>
              <h2>Multiplayer Quests that need you.</h2>
              <p>Multiplayer Quests live here with your solo quest, so My Side Quests is the command center.</p>
            </div>
            <Link href="/groupquests" className="button secondary">All Multiplayer Quests</Link>
          </div>
          <div className="my-group-quest-list">
            {activeGroupQuests.map((quest) => (
              <Link href={quest.href} className="my-group-quest-row" key={quest.title}>
                <span>{quest.status}</span>
                <div>
                  <strong>{quest.title}</strong>
                  <p>{quest.copy}</p>
                </div>
                <em>{quest.action}</em>
              </Link>
            ))}
          </div>
        </section>

        <section className="mission-card quest-log-accounts-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Connected accounts</span>
              {!hasChessIdentity ? <h2>Connect chess account.</h2> : null}
            </div>
          </div>
          <div className="account-connection-grid">
            <article className={lichessUsername ? "connection-card connected" : "connection-card"}>
              <span>Lichess</span>
              <strong>{lichessUsername || "Not connected"}</strong>
              <p>{lichessUsername ? "Used for public latest-game proof checks." : "Add your public username. No password needed."}</p>
            </article>
            <article className={chessComUsername ? "connection-card connected" : "connection-card"}>
              <span>Chess.com</span>
              <strong>{chessComUsername || "Not connected"}</strong>
              <p>{chessComUsername ? "Used for public latest-game proof checks." : "Add your public username. No password needed."}</p>
            </article>
          </div>
          <div className="button-row">
            {!hasChessIdentity ? <Link href="/connect" className="button primary">Connect chess account</Link> : null}
            <Link href="/profile" className="button secondary">Edit profile</Link>
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
      title: "Share the proof, then pick another.",
      copy: `${activeChallengeRecord.title} is complete. Your coat of arms is ready; the next bad idea is waiting.`,
      href: `/challenges/${activeChallengeRecord.id}`,
      cta: "Open victory proof",
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
