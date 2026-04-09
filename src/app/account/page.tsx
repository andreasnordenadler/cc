import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { saveLichessUsername } from "@/app/actions";
import {
  formatChallengeId,
  formatTime,
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
  const attempts = getChallengeAttempts(metadata).slice().reverse();

  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Account</p>
        <h1 style={{ margin: 0 }}>Save your Lichess username</h1>
        <p style={copyStyle}>
          This is the identity CC will show alongside your challenge submissions.
        </p>

        <form action={saveLichessUsername} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontWeight: 600 }}>Lichess username</span>
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

        <div style={historyStyle}>
          <h2 style={{ margin: 0 }}>Recent submissions</h2>
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
  background: "linear-gradient(180deg, #0b1020 0%, #111827 100%)",
  color: "#f8fafc",
};

const cardStyle = {
  width: "100%",
  maxWidth: 720,
  margin: "0 auto",
  borderRadius: 28,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "rgba(15,23,42,0.78)",
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

const copyStyle = {
  margin: 0,
  color: "#cbd5e1",
  lineHeight: 1.5,
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
  padding: "12px 18px",
  fontWeight: 600,
  cursor: "pointer",
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
  background: "rgba(15,23,42,0.48)",
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
