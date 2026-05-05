import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeProgress,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

const DIFFICULTY_ORDER = ["Easy", "Medium", "Hard", "Brutal", "Absurd"] as const;

export default async function ScoreboardPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const completedIds = new Set(progress.completedChallengeIds);
  const totalDeckPoints = CHALLENGES.reduce((sum, challenge) => sum + challenge.reward, 0);
  const nextQuest =
    CHALLENGES.find((challenge) => !completedIds.has(challenge.id) && challenge.id !== activeChallenge?.id) ??
    CHALLENGES.find((challenge) => challenge.id === activeChallenge?.id) ??
    CHALLENGES[0];
  const earnedBadges = CHALLENGES.filter((challenge) => completedIds.has(challenge.id));

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="scoreboard" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Quest scoreboard</span>
          <h1>Your bad-idea score, in public.</h1>
          <p className="hero-copy">
            Track the quest deck, reward points, badge progress, and the next quest worth attempting. It is not a serious leaderboard. That is the point.
          </p>
          <div className="button-row hero-actions">
            <Link href="/today" className="button primary">Open today’s quest</Link>
            <Link href="/random" className="button pink">Spin a new quest</Link>
            <Link href="/proof-log" className="button secondary">Review receipts</Link>
          </div>
        </section>

        <section className="grid" aria-label="Scoreboard summary">
          <Fact label="Current score" value={`${progress.totalRewardPoints} pts`} copy={`${progress.totalCompletedChallenges} of ${CHALLENGES.length} quests verified.`} />
          <Fact label="Deck value" value={`${totalDeckPoints} pts`} copy="Total reward value across the current Side Quest Chess quest deck." />
          <Fact label="Badge vault" value={`${earnedBadges.length}/${CHALLENGES.length}`} copy="Coat-of-arms badges earned by verified side quests." />
        </section>

        <section className="hero-grid">
          <article className="mission-card active-run-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Recommended next quest</span>
                <h2>{nextQuest.title}</h2>
              </div>
              <span className="badge danger">{nextQuest.difficulty}</span>
            </div>
            <div className="challenge-card-title-row">
              <ChallengeBadge challenge={nextQuest} earned={completedIds.has(nextQuest.id)} />
              <div>
                <p>{nextQuest.objective}</p>
                <div className="proof-line">+{nextQuest.reward} pts · {nextQuest.proofCallout}</div>
              </div>
            </div>
            <div className="button-row hero-actions">
              <Link href={`/challenges/${nextQuest.id}`} className="button primary">Open rules</Link>
              <Link href={`/dare/${nextQuest.id}`} className="button secondary">Share as quest</Link>
            </div>
          </article>

          <aside className="mission-card">
            <span className="eyebrow">Difficulty spread</span>
            <h2>The chaos curve.</h2>
            <div className="run-status">
              {DIFFICULTY_ORDER.map((difficulty) => {
                const challenges = CHALLENGES.filter((challenge) => challenge.difficulty === difficulty);
                if (challenges.length === 0) return null;

                const reward = challenges.reduce((sum, challenge) => sum + challenge.reward, 0);
                const completed = challenges.filter((challenge) => completedIds.has(challenge.id)).length;

                return (
                  <div className="profile-strip" key={difficulty}>
                    <div>
                      <strong>{difficulty}</strong>
                      <p>{completed}/{challenges.length} cleared</p>
                    </div>
                    <span className="badge gold">{reward} pts</span>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>

        <section className="big-grid" aria-label="Quest deck scorecards">
          {CHALLENGES.map((challenge) => {
            const earned = completedIds.has(challenge.id);
            const active = activeChallenge?.id === challenge.id;

            return (
              <article className="challenge-card" key={challenge.id}>
                <div className="card-meta">
                  <span>{challenge.category}</span>
                  <span className={`badge ${earned ? "green" : active ? "blue" : "gold"}`}>
                    {earned ? "earned" : active ? "active" : `+${challenge.reward} pts`}
                  </span>
                </div>
                <ChallengeBadge challenge={challenge} earned={earned} />
                <h3>{challenge.title}</h3>
                <p>{challenge.objective}</p>
                <div className="proof-line">{challenge.badgeIdentity.heraldry.motto} · {challenge.proofCallout}</div>
                <div className="card-footer">
                  <strong>{challenge.difficulty}</strong>
                  <span>{challenge.completionRate}</span>
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
