import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import {
  challengeBanner,
  formatChallengeId,
  getActiveChallenge,
  getChallengeProgress,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function ChallengesPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata
    ? (user.publicMetadata as UserMetadataRecord)
    : {};
  const activeChallenge = getActiveChallenge(metadata);
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const currentChallenge = activeChallenge?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id) ?? null
    : null;
  const nextChallenge = CHALLENGES.find(
    (challenge) => !completedSet.has(challenge.id) && challenge.id !== currentChallenge?.id,
  ) ?? null;
  const readyChallenges = CHALLENGES.filter(
    (challenge) => !completedSet.has(challenge.id) && challenge.id !== currentChallenge?.id,
  );
  const completedChallenges = CHALLENGES.filter((challenge) => completedSet.has(challenge.id));

  return (
    <main style={shellStyle}>
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />
      <section style={sectionStyle}>
        <div style={{ display: "grid", gap: 8 }}>
          <p style={eyebrowStyle}>Challenges</p>
          <h1 style={titleStyle}>Pick a real game challenge</h1>
          <p style={copyStyle}>
            Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.
          </p>
        </div>

        <section style={summaryGridStyle}>
          <article style={summaryCardStyle}>
            <p style={summaryLabelStyle}>Completed</p>
            <strong style={summaryValueStyle}>{progress.totalCompletedChallenges}</strong>
            <p style={summaryCopyStyle}>
              {progress.totalCompletedChallenges
                ? `${progress.totalRewardPoints} pts earned across finished challenges.`
                : "No completions yet. Your first verified game will appear here."}
            </p>
          </article>

          <article style={summaryCardStyle}>
            <p style={summaryLabelStyle}>Current</p>
            <strong style={summaryValueStyle}>
              {currentChallenge ? formatChallengeId(currentChallenge.id) : "Nothing active"}
            </strong>
            <p style={summaryCopyStyle}>
              {currentChallenge
                ? challengeBanner(activeChallenge)
                : "Start one challenge so your active run is tracked clearly."}
            </p>
          </article>

          <article style={summaryCardStyle}>
            <p style={summaryLabelStyle}>Next</p>
            <strong style={summaryValueStyle}>
              {nextChallenge ? formatChallengeId(nextChallenge.id) : "All listed challenges complete"}
            </strong>
            <p style={summaryCopyStyle}>
              {nextChallenge
                ? nextChallenge.objective
                : "You have cleared the current challenge set."}
            </p>
          </article>
        </section>

        {currentChallenge ? (
          <section style={laneStyle}>
            <div style={laneHeaderStyle}>
              <div>
                <p style={laneEyebrowStyle}>Continue now</p>
                <h2 style={laneTitleStyle}>Current challenge</h2>
              </div>
              <span style={pillGold}>active</span>
            </div>
            <article style={featuredCardStyle}>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={pillBlue}>{currentChallenge.requirement.result}</span>
                  <span style={pillSlate}>{currentChallenge.requirement.side}</span>
                </div>
                <h3 style={cardTitleStyle}>{currentChallenge.title}</h3>
                <p style={copyStyle}>{currentChallenge.objective}</p>
                <p style={hintStyle}>{challengeBanner(activeChallenge)}</p>
              </div>
              <div style={cardFooterStyle}>
                <strong style={rewardStyle}>{currentChallenge.reward} pts</strong>
                <Link href={`/challenges/${currentChallenge.id}`} style={buttonStyle}>
                  Continue challenge
                </Link>
              </div>
            </article>
          </section>
        ) : null}

        <section style={laneStyle}>
          <div style={laneHeaderStyle}>
            <div>
              <p style={laneEyebrowStyle}>Ready to start</p>
              <h2 style={laneTitleStyle}>Available challenges</h2>
            </div>
          </div>

          {readyChallenges.length ? (
            <div style={gridStyle}>
              {readyChallenges.map((challenge) => (
                <article key={challenge.id} style={cardStyle}>
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={pillBlue}>{challenge.requirement.result}</span>
                      <span style={pillSlate}>{challenge.requirement.side}</span>
                    </div>

                    <h3 style={cardTitleStyle}>{challenge.title}</h3>
                    <p style={copyStyle}>{challenge.objective}</p>
                    <p style={hintStyle}>{challenge.openingHint}</p>
                  </div>

                  <div style={cardFooterStyle}>
                    <strong style={rewardStyle}>{challenge.reward} pts</strong>
                    <Link href={`/challenges/${challenge.id}`} style={buttonStyle}>
                      Open challenge
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p style={emptyStateStyle}>No remaining available challenges in this set.</p>
          )}
        </section>

        <section style={laneStyle}>
          <div style={laneHeaderStyle}>
            <div>
              <p style={laneEyebrowStyle}>Already done</p>
              <h2 style={laneTitleStyle}>Completed challenges</h2>
            </div>
          </div>

          {completedChallenges.length ? (
            <div style={gridStyle}>
              {completedChallenges.map((challenge) => (
                <article key={challenge.id} style={completedCardStyle}>
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={pillBlue}>{challenge.requirement.result}</span>
                      <span style={pillSlate}>{challenge.requirement.side}</span>
                      <span style={pillGreen}>completed</span>
                    </div>

                    <h3 style={cardTitleStyle}>{challenge.title}</h3>
                    <p style={copyStyle}>{challenge.objective}</p>
                    <p style={hintStyle}>Finished and counted toward your progress total.</p>
                  </div>

                  <div style={cardFooterStyle}>
                    <strong style={rewardStyle}>{challenge.reward} pts</strong>
                    <Link href={`/challenges/${challenge.id}`} style={secondaryButtonStyle}>
                      View details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p style={emptyStateStyle}>Completed challenges will collect here after successful verification.</p>
          )}
        </section>
      </section>
    </main>
  );
}

const shellStyle = {
  minHeight: "100vh",
  padding: "clamp(20px, 3vw, 36px)",
  background: "#0a0f1f",
  color: "#f8fafc",
};

const sectionStyle = {
  width: "100%",
  maxWidth: 980,
  margin: "0 auto",
  display: "grid",
  gap: 20,
  alignContent: "start",
};

const summaryGridStyle = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const summaryCardStyle = {
  borderRadius: 22,
  border: "1px solid rgba(148,163,184,0.2)",
  background: "#111827",
  padding: 18,
  display: "grid",
  gap: 8,
};

const gridStyle = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
};

const laneStyle = {
  display: "grid",
  gap: 14,
};

const laneHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 12,
  flexWrap: "wrap" as const,
};

const laneEyebrowStyle = {
  margin: 0,
  color: "#93c5fd",
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  fontSize: 12,
};

const laneTitleStyle = {
  margin: "4px 0 0",
  fontSize: "1.2rem",
};

const featuredCardStyle = {
  borderRadius: 24,
  border: "1px solid rgba(245,158,11,0.28)",
  background: "#111827",
  padding: 20,
  display: "grid",
  gap: 18,
};

const cardStyle = {
  borderRadius: 24,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "#111827",
  padding: 20,
  display: "grid",
  gap: 18,
};

const completedCardStyle = {
  ...cardStyle,
  border: "1px solid rgba(34,197,94,0.24)",
  background: "#0f172a",
};

const titleStyle = {
  margin: 0,
  fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
  letterSpacing: "-0.02em",
};

const eyebrowStyle = {
  margin: 0,
  color: "#93c5fd",
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  fontSize: 12,
};

const copyStyle = {
  margin: 0,
  color: "#cbd5e1",
  lineHeight: 1.5,
};

const hintStyle = {
  ...copyStyle,
  fontSize: 14,
  color: "#9ca3af",
};

const cardTitleStyle = {
  margin: 0,
  fontSize: "1.25rem",
};

const summaryLabelStyle = {
  margin: 0,
  color: "#93c5fd",
  fontSize: 13,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
};

const summaryValueStyle = {
  fontSize: "1.15rem",
};

const summaryCopyStyle = {
  margin: 0,
  color: "#cbd5e1",
  lineHeight: 1.5,
  fontSize: 14,
};

const rewardStyle = {
  fontSize: "1.2rem",
};

const cardFooterStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap" as const,
};

const emptyStateStyle = {
  margin: 0,
  color: "#94a3b8",
  lineHeight: 1.5,
};

const buttonStyle = {
  borderRadius: 999,
  border: "1px solid rgba(59,130,246,0.32)",
  background: "#1e3a8a",
  color: "#dbeafe",
  padding: "10px 14px",
  fontWeight: 600,
  textDecoration: "none",
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: "#1e293b",
  borderColor: "rgba(148,163,184,0.3)",
  color: "#f8fafc",
};

const pillBlue = {
  borderRadius: 999,
  padding: "4px 10px",
  background: "rgba(59,130,246,0.16)",
  color: "#bfdbfe",
  fontSize: 12,
  textTransform: "uppercase" as const,
};

const pillSlate = {
  ...pillBlue,
  background: "rgba(148,163,184,0.16)",
  color: "#e2e8f0",
};

const pillGold = {
  ...pillBlue,
  background: "rgba(245,158,11,0.18)",
  color: "#fde68a",
};

const pillGreen = {
  ...pillBlue,
  background: "rgba(34,197,94,0.18)",
  color: "#bbf7d0",
};
