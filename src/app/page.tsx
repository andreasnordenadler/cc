import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";

type UserMetadataRecord = Record<string, unknown>;

type ChallengeProgress = {
  completedChallengeIds: string[];
  totalCompletedChallenges: number;
  totalRewardPoints: number;
};

type ActiveChallenge = {
  id: string;
  status?: string;
  startedAt?: string;
  verifiedAt?: string;
};

type ChallengeAttempt = {
  id?: string;
  gameId?: string;
  status?: string;
  summary?: string;
  checkedAt?: string;
};

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const user = isSignedIn ? await currentUser() : null;

  const metadata = user?.publicMetadata
    ? (user.publicMetadata as UserMetadataRecord)
    : {};

  const lichessUsername =
    typeof metadata.lichessUsername === "string" ? metadata.lichessUsername : "";
  const activeChallenge = getActiveChallenge(metadata);
  const latestAttempt = getLatestChallengeAttempt(metadata, activeChallenge);
  const progress = getChallengeProgress(metadata);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "clamp(20px, 3vw, 36px)",
        background:
          "radial-gradient(circle at top, rgba(96,165,250,0.18), transparent 32%), linear-gradient(180deg, #0b1020 0%, #111827 100%)",
        color: "#f8fafc",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        <header
          style={{
            border: "1px solid rgba(148,163,184,0.22)",
            background: "rgba(15,23,42,0.72)",
            backdropFilter: "blur(14px)",
            borderRadius: 28,
            padding: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 999,
                padding: "8px 14px",
                background: "rgba(59,130,246,0.14)",
                border: "1px solid rgba(96,165,250,0.28)",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#bfdbfe",
              }}
            >
              CC
            </p>

            <h1
              style={{
                margin: "12px 0 0",
                fontSize: "clamp(2.2rem, 5vw, 3rem)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              Your next chess challenge starts with your real Lichess game.
            </h1>

            <p
              style={{
                margin: "12px 0 0",
                color: "#94a3b8",
                maxWidth: 640,
                lineHeight: 1.5,
              }}
            >
              CC is a chess challenge platform about winning for the wrong reasons.
            </p>
          </div>

          {isSignedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link
                href="/account"
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.24)",
                  background: "rgba(15,23,42,0.7)",
                  padding: "10px 14px",
                  color: "#f8fafc",
                  textDecoration: "none",
                  fontSize: 14,
                }}
              >
                Account
              </Link>
            </div>
          ) : null}
        </header>

        <section
          style={{
            borderRadius: 28,
            border: "1px solid rgba(148,163,184,0.22)",
            background: "rgba(15,23,42,0.72)",
            backdropFilter: "blur(14px)",
            padding: "26px",
            boxShadow: "0 30px 80px rgba(2,6,23,0.45)",
            display: "grid",
            gap: 14,
          }}
        >
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 15 }}>
            Play a real, complete Lichess game and come back to check your result.
          </p>

          <h2 style={{ margin: 0 }}>How it works</h2>

          <ol
            style={{
              margin: "4px 0 0",
              paddingLeft: 20,
              display: "grid",
              gap: 10,
              color: "#cbd5e1",
              lineHeight: 1.45,
            }}
          >
            <li>
              Sign in and save your Lichess username in your account.
            </li>
            <li>Pick a challenge (e.g., win as White or finish any game).</li>
            <li>Play that game on Lichess and return here to verify automatically.</li>
            <li>Retry until the check passes and move to the next challenge.</li>
          </ol>

          {isSignedIn ? (
            <div
              style={{
                marginTop: 12,
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(148,163,184,0.2)",
                  background: "rgba(15,23,42,0.58)",
                  padding: 14,
                }}
              >
                <div style={{ color: "#93c5fd", marginBottom: 6, fontSize: 13 }}>
                  Lichess identity
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {lichessUsername || "Not set yet"}
                </div>
                <Link
                  href="/account"
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    color: "#93c5fd",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  {lichessUsername ? "Update identity" : "Add your username"}
                </Link>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(148,163,184,0.2)",
                  background: "rgba(15,23,42,0.58)",
                  padding: 14,
                }}
              >
                <div style={{ color: "#93c5fd", marginBottom: 6, fontSize: 13 }}>
                  Current challenge
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                  {activeChallenge?.id ? formatChallengeId(activeChallenge.id) : "No challenge started"}
                </div>
                <div style={{ color: activeChallenge ? "#e2e8f0" : "#94a3b8", fontSize: 14 }}>
                  {challengeBanner(activeChallenge)}
                </div>

                <Link
                  href={activeChallenge?.id ? `/challenges/${activeChallenge.id}` : "/challenges"}
                  style={{
                    display: "inline-block",
                    marginTop: 10,
                    color: "#93c5fd",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  {activeChallenge?.id ? "Open this challenge" : "Choose a challenge"}
                </Link>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(251,191,36,0.3)",
                  background: "rgba(120,53,15,0.25)",
                  padding: 14,
                }}
              >
                <div style={{ color: "#fde68a", marginBottom: 6, fontSize: 13 }}>
                  Your progress
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {progress.totalRewardPoints} pts · {progress.totalCompletedChallenges} solved
                </div>
                <div style={{ color: "#f8fafc", fontSize: 14, marginTop: 6 }}>
                  {progress.totalCompletedChallenges > 0
                    ? "Keep going to unlock the next milestone."
                    : "Start your first challenge to begin earning points."}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(148,163,184,0.2)",
                  background: "rgba(15,23,42,0.58)",
                  padding: 14,
                }}
              >
                <div style={{ color: "#93c5fd", marginBottom: 6, fontSize: 13 }}>
                  Latest check
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                  {latestAttempt?.status
                    ? latestAttempt.status.toUpperCase()
                    : "No checks yet"}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 14 }}>
                  {latestAttempt?.summary || "Complete a challenge and we\'ll verify your latest matched game."}
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section
          style={{
            borderRadius: 28,
            border: "1px solid rgba(148,163,184,0.22)",
            background: "rgba(15,23,42,0.72)",
            padding: "24px",
            display: "grid",
            gap: 16,
          }}
        >
          <h2 style={{ margin: 0 }}>Get started</h2>
          <p style={{ margin: 0, color: "#cbd5e1", maxWidth: 780 }}>
            This page is for you: sign in, save your username, start a challenge,
            and let CC verify against your latest completed games.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/challenges"
              style={{
                borderRadius: 999,
                border: "1px solid rgba(59,130,246,0.32)",
                background: "rgba(59,130,246,0.16)",
                color: "#dbeafe",
                padding: "12px 18px",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Open challenge list
            </Link>

            <a
              href="https://lichess.org"
              target="_blank"
              rel="noreferrer"
              style={{
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.3)",
                color: "#f8fafc",
                padding: "12px 18px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Open Lichess
            </a>
          </div>

          {isSignedIn ? null : (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <SignUpButton mode="modal">
                <button
                  style={{
                    borderRadius: 999,
                    border: "1px solid rgba(96,165,250,0.32)",
                    background: "#eff6ff",
                    color: "#0f172a",
                    padding: "12px 18px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Create account
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button
                  style={{
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.24)",
                    background: "rgba(15,23,42,0.7)",
                    color: "#f8fafc",
                    padding: "12px 18px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Sign in
                </button>
              </SignInButton>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function challengeBanner(challenge: ActiveChallenge | null): string {
  if (!challenge) {
    return "Pick one to begin a new run.";
  }

  if (!challenge.startedAt) {
    return "Accepted but not started yet.";
  }

  if (challenge.status === "verified") {
    return `Verified at ${formatTime(challenge.verifiedAt)}.`;
  }

  if (challenge.status === "accepted") {
    return `Started ${formatTime(challenge.startedAt)}. Check your latest games after you finish one.`;
  }

  return `Challenge is active since ${formatTime(challenge.startedAt)}.`;
}

function formatChallengeId(id: string): string {
  const formatted = id.replace(/-/g, " ");
  return formatted
    .split(" ")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getActiveChallenge(metadata: UserMetadataRecord): ActiveChallenge | null {
  if (
    typeof metadata.activeChallenge === "object" &&
    metadata.activeChallenge !== null &&
    "id" in (metadata.activeChallenge as Record<string, unknown>)
  ) {
    const candidate = metadata.activeChallenge as Record<string, unknown>;

    if (typeof candidate.id === "string") {
      return {
        id: candidate.id,
        status: typeof candidate.status === "string" ? candidate.status : undefined,
        startedAt:
          typeof candidate.startedAt === "string" ? candidate.startedAt : undefined,
        verifiedAt:
          typeof candidate.verifiedAt === "string" ? candidate.verifiedAt : undefined,
      };
    }
  }

  return null;
}

function getLatestChallengeAttempt(
  metadata: UserMetadataRecord,
  activeChallenge: ActiveChallenge | null,
): ChallengeAttempt | null {
  if (!activeChallenge || typeof metadata.challengeAttempts !== "object") {
    return null;
  }

  if (!Array.isArray(metadata.challengeAttempts)) {
    return null;
  }

  const items = metadata.challengeAttempts
    .filter((entry): entry is ChallengeAttempt => {
      return Boolean(
        entry &&
          typeof entry === "object" &&
          (entry as Record<string, unknown>).summary &&
          (entry as Record<string, unknown>).checkedAt,
      );
    })
    .filter((attempt) => {
      if (typeof attempt.id !== "string") {
        return false;
      }

      return attempt.id.startsWith(activeChallenge.id);
    });

  const latest = items.at(-1);
  return latest ?? null;
}

function getChallengeProgress(metadata: UserMetadataRecord): ChallengeProgress {
  const raw = metadata.challengeProgress;

  if (!raw || typeof raw !== "object") {
    return {
      completedChallengeIds: [],
      totalCompletedChallenges: 0,
      totalRewardPoints: 0,
    };
  }

  const record = raw as Record<string, unknown>;
  const completedChallengeIds =
    Array.isArray(record.completedChallengeIds)
      ? record.completedChallengeIds.filter((entry): entry is string => typeof entry === "string")
      : [];

  return {
    completedChallengeIds,
    totalCompletedChallenges:
      typeof record.totalCompletedChallenges === "number" && record.totalCompletedChallenges >= 0
        ? record.totalCompletedChallenges
        : completedChallengeIds.length,
    totalRewardPoints:
      typeof record.totalRewardPoints === "number" && record.totalRewardPoints >= 0
        ? record.totalRewardPoints
        : 0,
  };
}

function formatTime(value?: string): string {
  if (!value) {
    return "just now";
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}
