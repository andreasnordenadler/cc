import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { saveLichessUsername } from "@/app/actions";
import {
  challengeBanner,
  formatChallengeId,
  formatTime,
  getActiveChallenge,
  getChallengeAttempts,
  getLichessUsername,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function AccountPage() {
  const user = await currentUser();
  const metadata = user?.publicMetadata
    ? (user.publicMetadata as UserMetadataRecord)
    : {};
  const lichessUsername = getLichessUsername(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const attempts = getChallengeAttempts(metadata).slice().reverse();
  const activeChallengeLabel = activeChallenge
    ? formatChallengeId(activeChallenge.id)
    : null;
  const activeChallengeBanner = challengeBanner(activeChallenge);

  return (
    <main style={shellStyle}>
      <SiteNav isSignedIn={Boolean(user)} active="account" />
      <section style={cardStyle}>
        <Link href="/" style={backLinkStyle}>← Back to home</Link>

        <p style={eyebrowStyle}>Account</p>
        <h1 style={titleStyle}>Save your Lichess username</h1>
        <p style={copyStyle}>
          This is the identity shown alongside your challenge submissions.
        </p>

        <form action={saveLichessUsername} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
            <label style={{ display: "grid", gap: 8 }}>
              <span style={labelStyle}>Lichess username</span>
              <input
                type="text"
                name="lichessUsername"
                defaultValue={lichessUsername}
              placeholder="e.g. AndreasN"
              style={inputStyle}
            />
          </label>

          <button type="submit" style={buttonStyle}>
            {lichessUsername ? "Update username" : "Save username"}
          </button>
        </form>

        <p style={metaStyle}>
          Current value: {lichessUsername || "not set yet"}
        </p>

        <div style={challengeSectionStyle}>
          <h2 style={sectionTitleStyle}>Active challenge</h2>
          {activeChallenge ? (
            <>
              <p style={copyStyle}>
                <strong style={{ color: "#dbeafe" }}>Continue:</strong> {activeChallengeLabel}
              </p>
              <p style={metaStyle}>{activeChallengeBanner}</p>
              <Link href={`/challenges/${activeChallenge.id}`} style={buttonStyle}>
                Open challenge
              </Link>
            </>
          ) : (
            <p style={copyStyle}>No active challenge currently tracked. Choose one from the challenge list.</p>
          )}
        </div>

        <div style={historyStyle}>
          <h2 style={sectionTitleStyle}>Recent submissions</h2>
          {attempts.length ? (
            <ul style={historyListStyle}>
              {attempts.map((attempt) => {
                const challengeId = attempt.challengeId ?? attempt.id?.split(":")[0] ?? "challenge";

                return (
                  <li key={attempt.id ?? `${challengeId}-${attempt.checkedAt ?? "unknown"}`} style={historyItemStyle}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <strong>{formatChallengeId(challengeId)}</strong>
                      <span style={metaStyle}>{attempt.summary}</span>
                      <span style={metaStyle}>Checked {formatTime(attempt.checkedAt)}</span>
                    </div>
                    <Link href={`/challenges/${challengeId}`} style={historyLinkStyle}>
                      Open challenge
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p style={metaStyle}>No submissions yet. Your latest challenge attempt will show up here after you submit one.</p>
          )}
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

const cardStyle = {
  width: "100%",
  maxWidth: 720,
  margin: "0 auto",
  borderRadius: 28,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "#111827",
  padding: 24,
  display: "grid",
  gap: 16,
};

const eyebrowStyle = {
  margin: 0,
  color: "#93c5fd",
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  fontSize: 12,
};

const titleStyle = {
  margin: 0,
  fontSize: "clamp(1.8rem, 5vw, 2.2rem)",
  letterSpacing: "-0.02em",
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "1.3rem",
};

const labelStyle = {
  fontWeight: 600,
  color: "#e2e8f0",
};

const copyStyle = {
  margin: 0,
  color: "#cbd5e1",
  lineHeight: 1.5,
};

const inputStyle = {
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "#1f2937",
  color: "#f8fafc",
  padding: "12px 14px",
};

const buttonStyle = {
  borderRadius: 999,
  border: "1px solid rgba(59,130,246,0.32)",
  background: "#1e3a8a",
  color: "#dbeafe",
  padding: "12px 18px",
  fontWeight: 600,
  cursor: "pointer",
};

const challengeSectionStyle = {
  display: "grid",
  gap: 8,
};

const backLinkStyle = {
  display: "inline-flex",
  color: "#93c5fd",
  textDecoration: "none",
  fontWeight: 500,
};

const metaStyle = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 14,
};

const historyStyle = {
  display: "grid",
  gap: 12,
};

const historyListStyle = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  gap: 12,
};

const historyItemStyle = {
  borderRadius: 18,
  border: "1px solid rgba(148,163,184,0.18)",
  background: "#1f2937",
  padding: 16,
  display: "flex",
  gap: 12,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  flexWrap: "wrap" as const,
};

const historyLinkStyle = {
  color: "#dbeafe",
  textDecoration: "none",
  fontWeight: 600,
};
