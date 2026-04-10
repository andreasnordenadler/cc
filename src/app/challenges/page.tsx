import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import {
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

  return (
    <main style={shellStyle}>
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />
      <section style={sectionStyle}>
        <div style={{ display: "grid", gap: 8 }}>
          <p style={eyebrowStyle}>Challenges</p>
          <h1 style={titleStyle}>Pick a real game challenge</h1>
          <p style={copyStyle}>
            Start with one simple run, then come back with a Lichess game ID.
          </p>
        </div>

        <div style={gridStyle}>
          {CHALLENGES.map((challenge) => {
            const isActive = activeChallenge?.id === challenge.id;
            const isCompleted = progress.completedChallengeIds.includes(challenge.id);

            return (
              <article key={challenge.id} style={cardStyle}>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={pillBlue}>{challenge.requirement.result}</span>
                    <span style={pillSlate}>{challenge.requirement.side}</span>
                    {isActive ? <span style={pillGold}>active</span> : null}
                    {isCompleted ? <span style={pillGreen}>completed</span> : null}
                  </div>

                  <h2 style={cardTitleStyle}>{challenge.title}</h2>
                  <p style={copyStyle}>{challenge.objective}</p>
                  <p style={hintStyle}>{challenge.openingHint}</p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <strong style={rewardStyle}>{challenge.reward} pts</strong>
                  <Link href={`/challenges/${challenge.id}`} style={buttonStyle}>
                    Open challenge
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
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

const gridStyle = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
};

const cardStyle = {
  borderRadius: 24,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "#111827",
  padding: 20,
  display: "grid",
  gap: 18,
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

const rewardStyle = {
  fontSize: "1.2rem",
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
