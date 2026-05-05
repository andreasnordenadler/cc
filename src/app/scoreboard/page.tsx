import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

const DIFFICULTY_ORDER = ["Easy", "Medium", "Hard", "Brutal", "Absurd"] as const;

const LOOP_BLUEPRINTS = [
  {
    label: "Top players",
    value: "Season score",
    copy: "Rank runners by verified points first, then hard-quest clears, then newest receipt. No manual claims, no PGN theatre.",
  },
  {
    label: "Quest popularity",
    value: "Starts → clears",
    copy: "Track which quests get activated, replayed, failed, and shared so viral quests surface without pretending difficulty is equal.",
  },
  {
    label: "Stats loop",
    value: "Receipts only",
    copy: "Use saved latest-game receipts as the source of truth for clears, fail reasons, providers, time controls, and proof links.",
  },
];

export default async function ScoreboardPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const attempts = getChallengeAttempts(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const completedIds = new Set(progress.completedChallengeIds);
  const totalDeckPoints = CHALLENGES.reduce((sum, challenge) => sum + challenge.reward, 0);
  const mostValuableOpenQuest = CHALLENGES
    .filter((challenge) => !completedIds.has(challenge.id))
    .sort((a, b) => b.reward - a.reward)[0] ?? CHALLENGES[0];
  const providerCounts = attempts.reduce(
    (counts, attempt) => {
      if (attempt.provider === "lichess") counts.lichess += 1;
      if (attempt.provider === "chess.com") counts.chessCom += 1;
      return counts;
    },
    { lichess: 0, chessCom: 0 },
  );
  const completionPercent = totalDeckPoints > 0 ? Math.round((progress.totalRewardPoints / totalDeckPoints) * 100) : 0;

  const leaderboardPreview = [
    {
      rank: "#1",
      name: "You, if you keep making terrible decisions",
      score: `${progress.totalRewardPoints} pts`,
      detail: `${progress.totalCompletedChallenges} verified clears · ${attempts.length} saved latest-game checks`,
      current: true,
    },
    {
      rank: "Tie-break 1",
      name: "Hardest verified quest",
      score: mostValuableOpenQuest ? `Next target: ${mostValuableOpenQuest.title}` : "Deck cleared",
      detail: "Absurd and Brutal clears should beat farming easy points when season rank is tied.",
      current: false,
    },
    {
      rank: "Tie-break 2",
      name: "Receipt recency",
      score: "Newest proof wins ties",
      detail: "Keeps seasons lively without rewarding spammy manual submissions.",
      current: false,
    },
  ];

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="scoreboard" />

      <div className="content-wrap">
        <section className="hero-card rankings-hero">
          <span className="eyebrow">Rankings design</span>
          <h1>Leaderboard fuel, without fake numbers.</h1>
          <p className="hero-copy">
            This is the rankings and statistics loop for Side Quest Chess: top players, quest popularity, and proof stats built around verified receipts instead of invented launch data.
          </p>
          <div className="button-row hero-actions">
            <Link href="/challenges" className="button primary">Pick a ranked quest</Link>
            <Link href="/proof-log" className="button secondary">Review receipts</Link>
            <Link href="/share-kit" className="button pink">Share proof loop</Link>
          </div>
        </section>

        <section className="grid" aria-label="Rankings loop summary">
          <Fact label="Your current score" value={`${progress.totalRewardPoints} pts`} copy={`${progress.totalCompletedChallenges} of ${CHALLENGES.length} live quests verified.`} />
          <Fact label="Deck value" value={`${totalDeckPoints} pts`} copy={`${completionPercent}% of the current reward pool banked by this account.`} />
          <Fact label="Receipt sample" value={`${attempts.length} checks`} copy={`Lichess ${providerCounts.lichess} · Chess.com ${providerCounts.chessCom}. Global stats should use the same receipt events.`} />
        </section>

        <section className="hero-grid">
          <article className="mission-card active-run-card ranking-loop-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Top players loop</span>
                <h2>Season rank should feel earned, not farmed.</h2>
              </div>
              <span className="badge green">Design locked</span>
            </div>
            <div className="run-status">
              {leaderboardPreview.map((entry) => (
                <div className={entry.current ? "profile-strip leaderboard-strip current-runner" : "profile-strip leaderboard-strip"} key={entry.rank}>
                  <div className="leaderboard-rank">{entry.rank}</div>
                  <div>
                    <strong>{entry.name}</strong>
                    <p>{entry.detail}</p>
                  </div>
                  <span className={entry.current ? "badge green" : "badge gold"}>{entry.score}</span>
                </div>
              ))}
            </div>
          </article>

          <aside className="mission-card ranking-loop-card">
            <span className="eyebrow">Popularity loop</span>
            <h2>Quests should compete for attention.</h2>
            <div className="run-status">
              {LOOP_BLUEPRINTS.map((loop) => (
                <div className="profile-strip stat-loop-strip" key={loop.label}>
                  <div>
                    <strong>{loop.label}</strong>
                    <p>{loop.copy}</p>
                  </div>
                  <span className="badge gold">{loop.value}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mission-card ranking-loop-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Quest statistics model</span>
              <h2>The first stats worth showing.</h2>
            </div>
            <Link href="/verifiers" className="button secondary">Verifier status</Link>
          </div>
          <div className="ranking-stats-grid" aria-label="Quest statistics model">
            {DIFFICULTY_ORDER.map((difficulty) => {
              const challenges = CHALLENGES.filter((challenge) => challenge.difficulty === difficulty);
              if (challenges.length === 0) return null;

              const reward = challenges.reduce((sum, challenge) => sum + challenge.reward, 0);
              const completed = challenges.filter((challenge) => completedIds.has(challenge.id)).length;
              const hardest = challenges.toSorted((a, b) => b.reward - a.reward)[0];

              return (
                <article className="stat-card ranking-stat-card" key={difficulty}>
                  <div className="spread">
                    <span className="eyebrow">{difficulty}</span>
                    <span className="badge gold">{reward} pts</span>
                  </div>
                  <h3>{completed}/{challenges.length} cleared here</h3>
                  <p>{hardest.title} anchors this band. Global stats should show starts, passes, fail reasons, shares, and provider split.</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="big-grid" aria-label="Quest popularity launch cards">
          {CHALLENGES.map((challenge) => {
            const earned = completedIds.has(challenge.id);
            const active = activeChallenge?.id === challenge.id;
            const attemptsForQuest = attempts.filter((attempt) => {
              const attemptChallengeId = attempt.challengeId ?? attempt.id?.split(":")[0];
              return attemptChallengeId === challenge.id;
            });

            return (
              <article className={earned ? "challenge-card completed-quest-card" : active ? "challenge-card active-quest-card" : "challenge-card"} key={challenge.id}>
                <div className="card-meta">
                  <span>{challenge.difficulty}</span>
                  <span className={`badge ${earned ? "green" : active ? "blue" : "gold"}`}>
                    {earned ? "earned" : active ? "active" : `+${challenge.reward} pts`}
                  </span>
                </div>
                <ChallengeBadge challenge={challenge} earned={earned} />
                <h3>{challenge.title}</h3>
                <p>{challenge.objective}</p>
                <div className="proof-line">Popularity inputs: starts · clears · fails · shares · {attemptsForQuest.length} local receipts</div>
                <div className="card-footer">
                  <strong>{challenge.completionRate}</strong>
                  <Link href={`/challenges/${challenge.id}`}>Quest</Link>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function Fact({ label, value, copy }: { label: string; value: string; copy: string }) {
  return (
    <article className="stat-card mission-card">
      <span className="eyebrow">{label}</span>
      <h3>{value}</h3>
      <p>{copy}</p>
    </article>
  );
}
