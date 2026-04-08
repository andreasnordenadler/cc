import Link from "next/link";
import { revalidatePath } from "next/cache";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { CHALLENGES, getChallengeById, type Challenge } from "@/lib/challenges";

type ActiveChallenge = {
  id: string;
  status?: string;
  startedAt?: string;
  verifiedAt?: string;
};

type Attempt = {
  id: string;
  gameId: string;
  status: "verified" | "failed" | "unable";
  summary: string;
  candidateSummary?: string;
  checkedAt: string;
};

type LichessGame = {
  id: string;
  status?: string;
  winner?: "white" | "black";
  createdAt?: number;
  players?: {
    white?: {
      user?: {
        name?: string;
      };
    };
    black?: {
      user?: {
        name?: string;
      };
    };
  };
};

type ChallengeCheckResult = {
  status: Attempt["status"];
  summary: string;
  gameId: string;
  candidateSummary?: string;
};

type UserMetadataRecord = Record<string, unknown>;

type Props = {
  params: Promise<{
    challengeId: string;
  }>;
};

const RESULT_LABELS: Record<Attempt["status"], { label: string; color: string; bg: string }> = {
  verified: { label: "Verified", color: "#86efac", bg: "rgba(134, 239, 172, 0.16)" },
  failed: { label: "Failed", color: "#fca5a5", bg: "rgba(252, 165, 165, 0.16)" },
  unable: { label: "Unable", color: "#fde68a", bg: "rgba(253, 230, 138, 0.16)" },
};

const RECENT_GAME_WINDOW = 12;
const RECENT_GAME_CUTOFF_MINUTES = 15;

const PILL_STYLE = {
  borderRadius: 999,
  padding: "2px 10px",
  fontSize: 12,
} as const;

type BannerTone = "green" | "amber" | "red" | "neutral";

const BANNER_TONES: Record<BannerTone, { border: string; bg: string; color: string }> = {
  green: {
    border: "1px solid rgba(74, 222, 128, 0.45)",
    bg: "rgba(22, 101, 52, 0.2)",
    color: "#bbf7d0",
  },
  amber: {
    border: "1px solid rgba(251, 191, 36, 0.45)",
    bg: "rgba(120, 53, 15, 0.2)",
    color: "#fde68a",
  },
  red: {
    border: "1px solid rgba(248, 113, 113, 0.45)",
    bg: "rgba(127, 29, 29, 0.2)",
    color: "#fecaca",
  },
  neutral: {
    border: "1px solid rgba(148, 163, 184, 0.3)",
    bg: "rgba(15, 23, 42, 0.6)",
    color: "#cbd5e1",
  },
};

function getGameLink(gameId: string): string | null {
  if (!gameId || gameId.startsWith("(") || /\s/.test(gameId)) {
    return null;
  }

  return `https://lichess.org/${encodeURIComponent(gameId)}`;
}

export async function generateStaticParams() {
  return CHALLENGES.map((challenge) => ({
    challengeId: challenge.id,
  }));
}

export const dynamicParams = false;

export default async function ChallengeDetailPage({ params }: Props) {
  const { challengeId } = await params;
  const normalizedChallengeId = decodeURIComponent(String(challengeId)).trim().toLowerCase();
  const challenge = getChallengeById(normalizedChallengeId);
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;

  if (!challenge) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <section>Challenge not found.</section>
      </main>
    );
  }

  const metadata = user?.publicMetadata
    ? (user.publicMetadata as UserMetadataRecord)
    : {};

  const lichessUsername =
    typeof metadata.lichessUsername === "string" ? metadata.lichessUsername : "";
  const activeChallenge = getActiveChallenge(metadata);
  const accepted = activeChallenge?.id === challenge.id;

  const attempts: Attempt[] = Array.isArray(metadata.challengeAttempts)
    ? (metadata.challengeAttempts as Attempt[]).filter(
        (attempt): attempt is Attempt =>
          attempt !== null &&
          typeof attempt === "object" &&
          typeof (attempt as Attempt).gameId === "string" &&
          typeof (attempt as Attempt).status === "string" &&
          ((attempt as Attempt).status === "verified" ||
            (attempt as Attempt).status === "failed" ||
            (attempt as Attempt).status === "unable"),
      )
    : [];

  const challengeAttempts = attempts
    .filter((attempt) => attempt.id.includes(challenge.id))
    .slice(-20);

  const latest = challengeAttempts.at(-1);
  const expectedRequirement = getChallengeExpectation(challenge);
  const latestVerificationSummary = latest
    ? `Last check: ${new Date(latest.checkedAt).toLocaleString()} · ${RESULT_LABELS[latest.status].label} · ${latest.summary}${
        latest.candidateSummary ? ` (${latest.candidateSummary})` : ""
      }`
    : "No verification check yet.";
  const showRetryVerification = accepted && userId && latest?.status && latest.status !== "verified";
  const verificationButtonLabel = getVerificationActionLabel(latest);
  const statusTone: BannerTone = !accepted
    ? "neutral"
    : latest?.status === "verified"
      ? "green"
      : latest?.status === "failed"
        ? "red"
        : latest?.status === "unable"
          ? "amber"
          : "neutral";
  const bannerStyle = BANNER_TONES[statusTone];
  const acceptanceBanner = accepted
    ? activeChallenge?.startedAt
      ? `Accepted ${new Date(activeChallenge.startedAt).toLocaleString()} · checks scan last ${RECENT_GAME_WINDOW} completed games. Window starts at this timestamp.`
      : `Accepted with no recorded timestamp · checks scan last ${RECENT_GAME_WINDOW} completed games. Retry if this is stale.`
    : "Accept this challenge to begin verification checks.";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px",
        background:
          "radial-gradient(circle at top, rgba(96,165,250,0.18), transparent 32%), linear-gradient(180deg, #0b1020 0%, #111827 100%)",
        color: "#f8fafc",
      }}
    >
      <section
        style={{
          margin: "0 auto",
          width: "100%",
          maxWidth: 940,
          border: "1px solid rgba(148,163,184,0.22)",
          background: "rgba(15,23,42,0.72)",
          backdropFilter: "blur(14px)",
          borderRadius: 28,
          padding: "32px",
          boxShadow: "0 30px 80px rgba(2,6,23,0.45)",
        }}
      >
        <Link
          href="/challenges"
          style={{
            display: "inline-block",
            marginBottom: 14,
            color: "#93c5fd",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          ← Back to hub
        </Link>

        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          {challenge.title}
        </h1>

        <p style={{ color: "#cbd5e1", maxWidth: 680, lineHeight: 1.6 }}>
          {challenge.objective}
        </p>

        <p style={{ color: "#93c5fd", maxWidth: 680 }}>{challenge.instruction}</p>

        <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
          <div
            style={{
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.2)",
              background: "rgba(15,23,42,0.62)",
              padding: 14,
              maxWidth: 760,
            }}
          >
            <strong>Challenge status</strong>

            <p style={{ color: "#94a3b8", marginBottom: 10, marginTop: 8 }}>
              {expectedRequirement}
            </p>

            <div
              style={{
                borderRadius: 12,
                border: bannerStyle.border,
                background: bannerStyle.bg,
                color: bannerStyle.color,
                padding: "12px 14px",
                display: "grid",
                gap: 8,
                fontSize: 14,
                position: "sticky",
                top: 18,
                zIndex: 2,
              }}
            >
              <div>
                Saved Lichess identity: <strong>{lichessUsername || "not saved yet"}</strong>
              </div>

              <div>
                Challenge state: {" "}
                <span
                  style={{
                    ...PILL_STYLE,
                    border:
                      accepted
                        ? "1px solid rgba(74,222,128,0.4)"
                        : "1px solid rgba(248,113,113,0.4)",
                    background: accepted
                      ? "rgba(134,239,172,0.16)"
                      : "rgba(248,113,113,0.16)",
                    color: accepted ? "#bbf7d0" : "#fecaca",
                  }}
                >
                  {accepted ? "Active" : "Not active"}
                </span>
              </div>

              <div>{acceptanceBanner}</div>
              <div>{latestVerificationSummary}</div>

              {showRetryVerification ? (
                    <form
                      action={verifyChallenge.bind(null, challenge.id)}
                      style={{
                        display: "grid",
                        justifyItems: "start",
                    marginTop: 2,
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      width: "fit-content",
                      borderRadius: 999,
                      border: "1px solid rgba(251, 191, 36, 0.4)",
                      background: "rgba(120, 53, 15, 0.2)",
                      color: "#fde68a",
                      padding: "8px 14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    >
                    {verificationButtonLabel}
                    </button>
                  </form>
                ) : null}
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a
              href="https://lichess.org"
              target="_blank"
              rel="noreferrer"
              style={{
                borderRadius: 999,
                border: "1px solid rgba(96,165,250,0.32)",
                background: "#eff6ff",
                color: "#0f172a",
                padding: "10px 16px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Open Lichess
            </a>

            {userId ? (
              <form action={startChallenge.bind(null, challenge.id)}>
                <button
                  type="submit"
                  style={{
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.28)",
                    background: accepted
                      ? "rgba(15,23,42,0.75)"
                      : "rgba(52,211,153,0.22)",
                    color: "#cbd5e1",
                    padding: "10px 16px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {accepted ? "Reset challenge state" : "Mark as accepted"}
                </button>
              </form>
            ) : null}
          </div>
        </div>

        {userId ? (
          <section
            style={{
              marginTop: 22,
              borderTop: "1px solid rgba(148,163,184,0.2)",
              paddingTop: 24,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 20 }}>Verify your return game</h2>

            <p style={{ color: "#94a3b8", marginTop: 8 }}>
              {accepted
                ? "After you finish a game, click Check games to verify the latest matching result automatically (no game ID needed)."
                : "Mark this challenge as accepted before verifying. Then play on Lichess and return here to check your recent games."
              }
            </p>

            <form action={verifyChallenge.bind(null, challenge.id)} style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <button
                type="submit"
                disabled={!accepted}
                style={{
                  width: "fit-content",
                  borderRadius: 999,
                  border: "1px solid rgba(96,165,250,0.32)",
                  background: accepted ? "#eff6ff" : "rgba(148,163,184,0.2)",
                  color: accepted ? "#0f172a" : "#94a3b8",
                  padding: "10px 16px",
                  fontWeight: 600,
                  cursor: accepted ? "pointer" : "not-allowed",
                }}
              >
                {verificationButtonLabel}
              </button>
            </form>
          </section>
        ) : (
          <p style={{ marginTop: 22, color: "#cbd5e1" }}>
            Sign in to accept and verify this challenge.
          </p>
        )}

        {challengeAttempts.length ? (
          <section
            style={{ marginTop: 24, borderTop: "1px solid rgba(148,163,184,0.2)", paddingTop: 20 }}
          >
            <h3 style={{ margin: 0 }}>Challenge attempts</h3>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {challengeAttempts
                .slice()
                .reverse()
                .map((attempt) => (
                  <div
                    key={`${challenge.id}-${attempt.checkedAt}-${attempt.gameId}`}
                    style={{
                      borderRadius: 12,
                      border: "1px solid rgba(148,163,184,0.2)",
                      background: "rgba(15,23,42,0.62)",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        color: "#f8fafc",
                        fontSize: 14,
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          ...PILL_STYLE,
                          border: `1px solid ${RESULT_LABELS[attempt.status].bg}`,
                          background: RESULT_LABELS[attempt.status].bg,
                          color: RESULT_LABELS[attempt.status].color,
                        }}
                      >
                        {RESULT_LABELS[attempt.status].label}
                      </span>

                      <span>
                        {attempt.summary}
                        {attempt.candidateSummary
                          ? ` (${attempt.candidateSummary})`
                          : null}
                      </span>

                      {getGameLink(attempt.gameId) ? (
                        <a
                          href={getGameLink(attempt.gameId) as string}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            marginLeft: 4,
                            color: "#93c5fd",
                            textDecoration: "underline",
                            textUnderlineOffset: 2,
                          }}
                        >
                          Open game
                        </a>
                      ) : null}
                    </div>

                    <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
                      {attempt.checkedAt} · game {attempt.gameId}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
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

function getChallengeExpectation(challenge: Challenge): string {
  if (challenge.requirement.result === "win") {
    const side =
      challenge.requirement.side === "either"
        ? "either color"
        : challenge.requirement.side;

    return `To pass this challenge, play as ${side} and finish with your result as the winner.`;
  }

  return "To pass this challenge, finish any completed game where your identity appears.";
}

function getVerificationActionLabel(latest?: Attempt): string {
  if (!latest) {
    return "Check recent games";
  }

  if (latest.status === "unable") {
    if (latest.summary.includes("No completed games found")) {
      return "Check again after a new game";
    }

    if (latest.summary.includes("No matching recent games")) {
      return "Check for newer games";
    }

    if (latest.summary.includes("No saved Lichess username")) {
      return "Save username and retry";
    }

    if (latest.summary.includes("Please mark this challenge")) {
      return "Mark challenge first";
    }

    if (latest.candidateSummary?.includes("not finished")) {
      return "Wait for game to finish";
    }

    if (latest.summary.includes("not finished yet")) {
      return "Wait for game to finish";
    }

    return "Retry verification";
  }

  if (latest.status === "failed") {
    if (latest.summary.includes("Challenge requires side")) {
      return "Play required side and retry";
    }

    if (latest.summary.includes("does not contain user")) {
      return "Play on your saved account";
    }

    if (latest.summary.includes("not a win")) {
      return "Play and win again";
    }

    return "Retry after next game";
  }

  return "Retry verification";
}

function getPlayerName(game: LichessGame, side: "white" | "black"): string {
  const players = game.players;
  if (!players) {
    return "";
  }

  const section = side === "white" ? players.white : players.black;
  return section?.user?.name ?? "";
}

function getPlayerSideForUser(game: LichessGame, lichessUsername: string): string | null {
  const whiteNormalized = getPlayerName(game, "white").toLowerCase();
  const blackNormalized = getPlayerName(game, "black").toLowerCase();
  const userNormalized = lichessUsername.toLowerCase();

  if (userNormalized === whiteNormalized) {
    return "white";
  }

  if (userNormalized === blackNormalized) {
    return "black";
  }

  return null;
}

function isFinishedGame(game: LichessGame): boolean {
  return !!game.status && game.status !== "started";
}

function evaluateVerification(
  game: LichessGame,
  challenge: Challenge,
  lichessUsername: string,
): { status: Attempt["status"]; summary: string } {
  if (!lichessUsername) {
    return {
      status: "unable",
      summary: "No saved Lichess username. Add it in /account first.",
    };
  }

  const whiteNormalized = getPlayerName(game, "white").toLowerCase();
  const blackNormalized = getPlayerName(game, "black").toLowerCase();
  const userNormalized = lichessUsername.toLowerCase();

  const isWhite = userNormalized === whiteNormalized;
  const isBlack = userNormalized === blackNormalized;

  if (!isWhite && !isBlack) {
    return {
      status: "failed",
      summary: `This game does not contain user ${lichessUsername}.`,
    };
  }

  const playedSide = isWhite ? "white" : "black";

  if (challenge.requirement.result === "win") {
    if (
      challenge.requirement.side !== "either" &&
      challenge.requirement.side !== playedSide
    ) {
      return {
        status: "failed",
        summary: `Challenge requires side ${challenge.requirement.side}, but this game has ${playedSide}.`,
      };
    }

    if (!isFinishedGame(game)) {
      return {
        status: "failed",
        summary: "This matching game is not finished yet.",
      };
    }

    if (game.winner === "white" && playedSide === "white") {
      return {
        status: "verified",
        summary: "Verified: you won as White.",
      };
    }

    if (game.winner === "black" && playedSide === "black") {
      return {
        status: "verified",
        summary: "Verified: you won as Black.",
      };
    }

    return {
      status: "failed",
      summary: `Game finished but not a win for your required side (${playedSide}).`,
    };
  }

  if (!isFinishedGame(game)) {
    return {
      status: "failed",
      summary: "Game not finished yet. Finish it on Lichess first.",
    };
  }

  return {
    status: "verified",
    summary: `Verified: finished as ${playedSide}.`,
  };
}

function getChallengeStartTime(activeChallenge?: ActiveChallenge | null): number {
  if (!activeChallenge?.startedAt) {
    return Date.now() - RECENT_GAME_CUTOFF_MINUTES * 60 * 1000;
  }

  const parsed = Date.parse(activeChallenge.startedAt);
  if (Number.isNaN(parsed)) {
    return Date.now() - RECENT_GAME_CUTOFF_MINUTES * 60 * 1000;
  }

  return parsed;
}

function getMostRecentChallengeResult(
  games: LichessGame[],
  challenge: Challenge,
  lichessUsername: string,
): ChallengeCheckResult {
  const sorted = [...games]
    .sort((a, b) => {
      const aTime = typeof a.createdAt === "number" ? a.createdAt : 0;
      const bTime = typeof b.createdAt === "number" ? b.createdAt : 0;

      return bTime - aTime;
    })
    .slice(0, RECENT_GAME_WINDOW);

  let fallback: ChallengeCheckResult | null = null;

  for (const game of sorted) {
    const result = evaluateVerification(game, challenge, lichessUsername);
    if (result.status === "verified") {
      return {
        ...result,
        gameId: game.id,
      };
    }

    const sideText = getPlayerSideForUser(game, lichessUsername);
    if (sideText && !fallback) {
      fallback = {
        status: "unable",
        gameId: game.id,
        summary: "No matching passing game yet.",
        candidateSummary: `Latest candidate (${sideText}, status: ${game.status ?? "unknown"}) → ${result.summary}`,
      };
    }
  }

  if (!sorted.length) {
    return {
      status: "unable",
      summary: "No completed games found after this challenge was accepted.",
      gameId: "(none)",
    };
  }

  const mostRecent = sorted[0];
  const result = evaluateVerification(mostRecent, challenge, lichessUsername);
  const sideText = getPlayerSideForUser(mostRecent, lichessUsername);

  if (fallback) {
    return fallback;
  }

  return {
    ...result,
    gameId: mostRecent.id,
    ...(sideText
      ? {
          candidateSummary: `Latest candidate (${sideText}, status: ${mostRecent.status ?? "unknown"})`,
        }
      : {}),
  };
}

async function fetchRecentGamesForUser(username: string, startedAt: number): Promise<LichessGame[]> {
  const url = new URL(`https://lichess.org/api/games/user/${encodeURIComponent(username)}`);
  url.searchParams.set("since", String(startedAt));
  url.searchParams.set("max", String(RECENT_GAME_WINDOW));
  url.searchParams.set("pgnInJson", "true");
  url.searchParams.set("moves", "0");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/x-ndjson",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Could not fetch recent games from Lichess (status ${response.status}).`);
  }

  const text = await response.text();
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      try {
        return JSON.parse(line) as LichessGame;
      } catch (error) {
        console.error("Failed to parse Lichess game JSON", error);
        return null;
      }
    })
    .filter((game): game is LichessGame => {
      if (!game || typeof game.id !== "string") {
        return false;
      }

      if (typeof game.createdAt !== "number") {
        return false;
      }

      return game.createdAt >= startedAt;
    });
}

async function startChallenge(challengeId: string) {
  "use server";
  const { userId } = await auth();

  if (!userId) {
    return;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = (user.publicMetadata ?? {}) as UserMetadataRecord;

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      activeChallenge: {
        id: challengeId,
        status: "accepted",
        startedAt: new Date().toISOString(),
      },
    },
  });

  revalidatePath(`/challenges/${challengeId}`);
}

async function verifyChallenge(challengeId: string) {
  "use server";
  const { userId } = await auth();

  if (!userId) {
    return;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = (user.publicMetadata ?? {}) as UserMetadataRecord;
  const challenge = getChallengeById(challengeId);

  if (!challenge) {
    return;
  }

  const activeChallenge = getActiveChallenge(metadata);
  if (!activeChallenge || activeChallenge.id !== challenge.id) {
    await writeAttempt(challenge, userId, metadata, {
      gameId: "(not accepted)",
      status: "unable",
      summary: "Please mark this challenge as accepted before verifying.",
    });

    revalidatePath(`/challenges/${challengeId}`);
    return;
  }

  const lichessUsername =
    typeof metadata.lichessUsername === "string" ? metadata.lichessUsername : "";

  if (!lichessUsername) {
    await writeAttempt(challenge, userId, metadata, {
      gameId: "(missing username)",
      status: "unable",
      summary: "Save your Lichess username in /account before verifying.",
    });

    revalidatePath(`/challenges/${challengeId}`);
    return;
  }

  let result: ChallengeCheckResult = {
    status: "unable",
    summary: "No matching recent games were found. Play and finish a game first.",
    gameId: "(none)",
  };
  let gameId = "(none)";

  try {
    const since = getChallengeStartTime(activeChallenge);
    const recentGames = await fetchRecentGamesForUser(lichessUsername, since);
    const best = getMostRecentChallengeResult(
      recentGames,
      challenge,
      lichessUsername,
    );

    gameId = best.gameId;
    result = best;
  } catch (error) {
    console.error(error);
    result = {
      status: "unable",
      summary: error instanceof Error ? error.message : "Network error while trying to contact Lichess for verification.",
      gameId: "(none)",
    };
  }

  const latestAttempts = Array.isArray(metadata.challengeAttempts)
    ? (metadata.challengeAttempts as Attempt[])
    : [];

  const nextAttempts = [
    ...latestAttempts,
    {
      id: `${challenge.id}-${Date.now()}`,
      gameId,
      status: result.status,
      summary: result.summary,
      ...(result.candidateSummary
        ? {
            candidateSummary: result.candidateSummary,
          }
        : {}),
      checkedAt: new Date().toISOString(),
    },
  ].slice(-40);

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      activeChallenge: {
        id: challenge.id,
        status: result.status,
        verifiedAt: new Date().toISOString(),
      },
      challengeAttempts: nextAttempts,
    },
  });

  revalidatePath(`/challenges/${challengeId}`);
}

async function writeAttempt(
  challenge: Challenge,
  userId: string,
  metadata: UserMetadataRecord,
  attempt: Omit<Attempt, "checkedAt" | "id">,
) {
  const client = await clerkClient();
  const latestAttempts = Array.isArray(metadata.challengeAttempts)
    ? (metadata.challengeAttempts as Attempt[])
    : [];

  const nextAttempts = [
    ...latestAttempts,
    {
      id: `${challenge.id}-${Date.now()}`,
      ...attempt,
      checkedAt: new Date().toISOString(),
    },
  ].slice(-40);

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...metadata,
      activeChallenge: {
        id: challenge.id,
        status: attempt.status,
      },
      challengeAttempts: nextAttempts,
    },
  });
}
