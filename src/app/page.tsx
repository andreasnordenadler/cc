import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, getChallengeById, type Challenge } from "@/lib/challenges";
import {
  challengeBanner,
  formatChallengeId,
  getActiveChallenge,
  getChallengeProgress,
  getChessComUsername,
  getLatestChallengeAttempt,
  getLichessUsername,
  type ActiveChallenge,
  type ChallengeProgress,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const user = isSignedIn ? await currentUser() : null;

  const metadata = user?.publicMetadata
    ? (user.publicMetadata as UserMetadataRecord)
    : {};

  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const latestAttempt = getLatestChallengeAttempt(metadata, activeChallenge?.id);
  const progress = getChallengeProgress(metadata);
  const nextChallenge = getNextChallenge(activeChallenge, progress);
  const completedSet = new Set(progress.completedChallengeIds);
  const currentChallenge = activeChallenge?.id ? getChallengeById(activeChallenge.id) ?? null : null;
  const latestCompletedChallenge = [...CHALLENGES].reverse().find((challenge) => completedSet.has(challenge.id)) ?? null;

  return (
    <main style={pageStyle}>
      <SiteNav isSignedIn={isSignedIn} active="home" />
      <section style={contentStyle}>
        <header
          style={heroCardStyle}
        >
          <div>
            <h1 style={heroTitleStyle}>
              Your next chess challenge starts with your real game on Lichess or Chess.com.
            </h1>

            <p style={heroCopyStyle}>
              Play real games, verify the result automatically, and track your progress clearly.
            </p>
          </div>

          {isSignedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link
                href="/account"
                style={accountLinkStyle}
              >
                Your account
              </Link>
            </div>
          ) : null}
        </header>

        <section style={workAreaStyle}>
          <p style={sectionLeadStyle}>
            Play a real, complete game on Lichess or Chess.com and come back to check your result.
          </p>

          <h2 style={sectionTitleStyle}>How it works</h2>

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
              Sign in and save your Lichess and/or Chess.com username in your account.
            </li>
            <li>Pick a challenge (e.g., win as White or finish any game).</li>
            <li>Play that game on Lichess or Chess.com and return here to verify automatically.</li>
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
              <div style={metricCardStyle}>
                <div style={metricLabelStyle}>
                  Chess identities
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {lichessUsername || chessComUsername
                    ? [lichessUsername, chessComUsername].filter(Boolean).join(" • ")
                    : "Not set yet"}
                </div>
                <Link
                  href="/account"
                  style={inlineLinkStyle}
                >
                  {lichessUsername || chessComUsername ? "Update identities" : "Add your usernames"}
                </Link>
              </div>

              <div style={metricCardStyle}>
                <div style={metricLabelStyle}>
                  Journey status
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                  {currentChallenge ? formatChallengeId(currentChallenge.id) : "No active challenge"}
                </div>
                <div style={{ color: currentChallenge ? "#e2e8f0" : "#94a3b8", fontSize: 14 }}>
                  {currentChallenge
                    ? challengeBanner(activeChallenge)
                    : "Choose a challenge to begin your tracked run."}
                </div>

                <div style={journeyListStyle}>
                  <div style={journeyRowStyle}>
                    <span style={journeyKeyStyle}>Completed</span>
                    <span>{progress.totalCompletedChallenges}</span>
                  </div>
                  <div style={journeyRowStyle}>
                    <span style={journeyKeyStyle}>Points</span>
                    <span>{progress.totalRewardPoints}</span>
                  </div>
                  <div style={journeyRowStyle}>
                    <span style={journeyKeyStyle}>Next</span>
                    <span>{nextChallenge ? formatChallengeId(nextChallenge.id) : "All clear"}</span>
                  </div>
                </div>

                <Link
                  href={currentChallenge ? `/challenges/${currentChallenge.id}` : "/challenges"}
                  style={inlineLinkStyle}
                >
                  {currentChallenge ? "Continue current challenge" : "Choose a challenge"}
                </Link>
              </div>

              <div style={progressCardStyle}>
                <div style={metricLabelStyleYellow}>
                  Completed recently
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {latestCompletedChallenge ? latestCompletedChallenge.title : "Nothing completed yet"}
                </div>
                <div style={{ color: "#f8fafc", fontSize: 14, marginTop: 6 }}>
                  {latestCompletedChallenge
                    ? `${latestCompletedChallenge.reward} pts locked in. Finished challenges stay visible in the challenge list.`
                    : "Once a challenge passes verification, it will move into the completed section."}
                </div>
              </div>

              <div style={metricCardStyle}>
                <div style={metricLabelStyle}>
                  Latest check
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
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
          style={getStartedStyle}
        >
          <h2 style={sectionTitleStyle}>Get started</h2>
          <p style={getStartedCopyStyle}>
            This page is for you: sign in, save your usernames, start a challenge,
            and let CC verify against your latest completed games.
          </p>

          <Link
            href="/challenges"
            style={primaryCtaStyle}
          >
            Open challenge list
          </Link>

          {isSignedIn ? null : (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <SignUpButton mode="modal">
                <button
                  style={primaryButtonStyle}
                >
                  Create account
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button
                  style={secondaryButtonStyle}
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

const pageStyle = {
  minHeight: "100vh",
  padding: "clamp(20px, 3vw, 36px)",
  background: "#0a0f1f",
  color: "#f8fafc",
};

const contentStyle = {
  width: "100%",
  maxWidth: 980,
  margin: "0 auto",
  display: "grid",
  gap: 24,
};

const heroCardStyle = {
  border: "1px solid rgba(148,163,184,0.22)",
  background: "#111827",
  borderRadius: 28,
  padding: "24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap" as const,
};

const heroTitleStyle = {
  margin: "12px 0 0",
  fontSize: "clamp(2rem, 5vw, 2.9rem)",
  lineHeight: 1.05,
  letterSpacing: "-0.04em",
  maxWidth: 720,
};

const heroCopyStyle = {
  margin: "12px 0 0",
  color: "#94a3b8",
  maxWidth: 640,
  lineHeight: 1.6,
  fontSize: 18,
};

const accountLinkStyle = {
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.24)",
  background: "#1e293b",
  padding: "10px 14px",
  color: "#f8fafc",
  textDecoration: "none",
  fontSize: 14,
};

const workAreaStyle = {
  borderRadius: 28,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "#111827",
  padding: "26px",
  display: "grid",
  gap: 14,
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "1.35rem",
  lineHeight: 1.2,
};

const sectionLeadStyle = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 15,
  lineHeight: 1.45,
};

const metricCardStyle = {
  borderRadius: 18,
  border: "1px solid rgba(148,163,184,0.2)",
  background: "#1f2937",
  padding: 14,
};

const metricLabelStyle = {
  color: "#93c5fd",
  marginBottom: 6,
  fontSize: 13,
};

const metricLabelStyleYellow = {
  color: "#fde68a",
  marginBottom: 6,
  fontSize: 13,
};

const progressCardStyle = {
  borderRadius: 18,
  border: "1px solid rgba(251,191,36,0.3)",
  borderColor: "#ca8a04",
  background: "#1f2937",
  padding: 14,
};

const inlineLinkStyle = {
  display: "inline-block",
  marginTop: 8,
  color: "#93c5fd",
  textDecoration: "none",
  fontSize: 14,
};

const journeyListStyle = {
  marginTop: 12,
  borderTop: "1px solid rgba(148,163,184,0.18)",
  paddingTop: 12,
  display: "grid",
  gap: 8,
};

const journeyRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  color: "#e2e8f0",
  fontSize: 14,
};

const journeyKeyStyle = {
  color: "#94a3b8",
};

const getStartedStyle = {
  borderRadius: 28,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "#111827",
  padding: "24px",
  display: "grid",
  gap: 16,
};

const getStartedCopyStyle = {
  margin: 0,
  color: "#cbd5e1",
  maxWidth: 780,
  lineHeight: 1.5,
};

const primaryCtaStyle = {
  borderRadius: 999,
  border: "1px solid rgba(59,130,246,0.32)",
  background: "#1e3a8a",
  color: "#dbeafe",
  padding: "12px 18px",
  fontWeight: 600,
  textDecoration: "none",
  display: "inline-block",
};

const primaryButtonStyle = {
  borderRadius: 999,
  border: "1px solid rgba(96,165,250,0.32)",
  background: "#eff6ff",
  color: "#0f172a",
  padding: "12px 18px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.24)",
  background: "#1e293b",
  color: "#f8fafc",
  padding: "12px 18px",
  fontWeight: 600,
  cursor: "pointer",
};

function getNextChallenge(
  activeChallenge: ActiveChallenge | null,
  progress: ChallengeProgress,
): Challenge | null {
  if (!progress.completedChallengeIds.length) {
    return CHALLENGES[0] ?? null;
  }

  if (
    activeChallenge?.status === "suggested" &&
    activeChallenge.id
  ) {
    const suggested = getChallengeById(activeChallenge.id);
    if (suggested && !progress.completedChallengeIds.includes(suggested.id)) {
      return suggested;
    }
  }

  const completedSet = new Set(progress.completedChallengeIds);

  const firstRemaining = CHALLENGES.find(
    (challenge) => !completedSet.has(challenge.id),
  );

  if (firstRemaining) {
    return firstRemaining;
  }

  if (activeChallenge && activeChallenge.status !== "verified") {
    return getChallengeById(activeChallenge.id) ?? CHALLENGES[0] ?? null;
  }

  return null;
}
