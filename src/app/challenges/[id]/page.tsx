import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { startChallenge, submitChallengeAttempt } from "@/app/actions";
import { getChallengeById } from "@/lib/challenges";
import {
  buildAttemptSummary,
  formatAttemptStatus,
  formatTime,
  getActiveChallenge,
  getChallengeAttempts,
  getLatestChallengeAttempt,
  getLichessUsername,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = getChallengeById(id);

  if (!challenge) {
    notFound();
  }

  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata
    ? (user.publicMetadata as UserMetadataRecord)
    : {};
  const lichessUsername = getLichessUsername(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const attempts = getChallengeAttempts(metadata, challenge.id).slice().reverse();
  const latestAttempt = attempts[0] ?? getLatestChallengeAttempt(metadata, challenge.id);
  const isSignedIn = Boolean(userId);
  const isActive = activeChallenge?.id === challenge.id;
  const latestAttemptSummary = buildAttemptSummary(latestAttempt);

  return (
    <main style={shellStyle}>
      <section style={sectionStyle}>
        <div style={cardStyle}>
          <p style={eyebrowStyle}>Challenge detail</p>
          <h1 style={{ margin: 0 }}>{challenge.title}</h1>
          <p style={copyStyle}>{challenge.objective}</p>
          <ul style={listStyle}>
            <li>{challenge.instruction}</li>
            <li>Reward: {challenge.reward} points</li>
            <li>Opening hint: {challenge.openingHint}</li>
          </ul>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: 0 }}>Your run</h2>

          {isSignedIn ? (
            <>
              <p style={copyStyle}>
                Saved username: {lichessUsername || "not set yet"}
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <form action={startChallenge}>
                  <input type="hidden" name="challengeId" value={challenge.id} />
                  <button type="submit" style={buttonStyle}>
                    {isActive ? "Restart this challenge" : "Start this challenge"}
                  </button>
                </form>
                <Link href="/account" style={secondaryButtonStyle}>
                  {lichessUsername ? "Update username" : "Add username"}
                </Link>
              </div>

              <form action={submitChallengeAttempt} style={{ display: "grid", gap: 12, maxWidth: 480, marginTop: 20 }}>
                <input type="hidden" name="challengeId" value={challenge.id} />
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>Finished Lichess game ID or URL</span>
                  <input
                    type="text"
                    name="gameId"
                    placeholder="e.g. abCDef12 or https://lichess.org/abCDef12"
                    style={inputStyle}
                  />
                </label>
                <button type="submit" style={buttonStyle}>
                  Submit for review
                </button>
              </form>

              <div style={latestSummaryStyle}>
                <div style={summaryHeaderStyle}>
                  <span style={summaryEyebrowStyle}>Latest attempt</span>
                  <span style={statusPillStyle}>{formatAttemptStatus(latestAttempt?.status)}</span>
                </div>
                <strong style={{ fontSize: 24 }}>{latestAttemptSummary.headline}</strong>
                <p style={copyStyle}>{latestAttemptSummary.detail}</p>
                <p style={metaStyle}>{latestAttemptSummary.meta}</p>
                <p style={copyStyle}>
                  {isActive
                    ? `Challenge state: ${formatAttemptStatus(activeChallenge?.status ?? "accepted")}`
                    : "This challenge is not active yet."}
                </p>
              </div>

              <div style={statusBoxStyle}>
                <strong>Attempt history</strong>
                {attempts.length ? (
                  <ul style={attemptListStyle}>
                    {attempts.map((attempt) => (
                      <li key={attempt.id ?? `${attempt.gameId}-${attempt.checkedAt ?? "unknown"}`} style={attemptItemStyle}>
                        <span style={copyStyle}>{attempt.summary}</span>
                        <span style={metaStyle}>
                          {attempt.gameId ? `Game ${attempt.gameId}, ` : ""}
                          {attempt.status ?? "pending"} • {formatTime(attempt.checkedAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={copyStyle}>No attempt history yet for this challenge.</p>
                )}
              </div>
            </>
          ) : (
            <p style={copyStyle}>
              Sign in from the homepage to start this challenge.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

const shellStyle = {
  minHeight: "100vh",
  padding: "clamp(20px, 3vw, 36px)",
  background: "linear-gradient(180deg, #0b1020 0%, #111827 100%)",
  color: "#f8fafc",
};

const sectionStyle = {
  width: "100%",
  maxWidth: 900,
  margin: "0 auto",
  display: "grid",
  gap: 20,
};

const cardStyle = {
  borderRadius: 24,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "rgba(15,23,42,0.78)",
  padding: 24,
  display: "grid",
  gap: 14,
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

const listStyle = {
  margin: 0,
  paddingLeft: 18,
  color: "#cbd5e1",
  display: "grid",
  gap: 8,
};

const inputStyle = {
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "rgba(15,23,42,0.7)",
  color: "#f8fafc",
  padding: "12px 14px",
};

const buttonStyle = {
  borderRadius: 999,
  border: "1px solid rgba(59,130,246,0.32)",
  background: "rgba(59,130,246,0.16)",
  color: "#dbeafe",
  padding: "10px 14px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  ...buttonStyle,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
};

const statusBoxStyle = {
  borderRadius: 18,
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(15,23,42,0.48)",
  padding: 16,
  display: "grid",
  gap: 8,
};

const latestSummaryStyle = {
  borderRadius: 22,
  border: "1px solid rgba(96,165,250,0.28)",
  background: "linear-gradient(180deg, rgba(30,41,59,0.92) 0%, rgba(15,23,42,0.88) 100%)",
  padding: 18,
  display: "grid",
  gap: 10,
};

const summaryHeaderStyle = {
  display: "flex",
  justifyContent: "space-between" as const,
  gap: 12,
  alignItems: "center" as const,
  flexWrap: "wrap" as const,
};

const summaryEyebrowStyle = {
  color: "#93c5fd",
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  fontSize: 12,
  fontWeight: 700,
};

const statusPillStyle = {
  borderRadius: 999,
  padding: "6px 10px",
  background: "rgba(59,130,246,0.16)",
  border: "1px solid rgba(59,130,246,0.32)",
  color: "#dbeafe",
  fontSize: 13,
  fontWeight: 700,
};

const metaStyle = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 14,
};

const attemptListStyle = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  gap: 10,
};

const attemptItemStyle = {
  display: "grid",
  gap: 4,
  borderTop: "1px solid rgba(148,163,184,0.12)",
  paddingTop: 10,
};
