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

const PILL_STYLE = {
  borderRadius: 999,
  padding: "2px 10px",
  fontSize: 12,
} as const;

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
  const startedText =
    activeChallenge?.startedAt
      ? `Started ${new Date(activeChallenge.startedAt).toLocaleString()}`
      : "Not started yet";
  const expectedRequirement = getChallengeExpectation(challenge);

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

            <ul style={{ margin: 0, color: "#cbd5e1", display: "grid", gap: 8 }}>
              <li>
                Saved Lichess identity: {lichessUsername || "not saved yet"}
              </li>
              <li>
                Challenge state: {" "}
                <span
                  style={{
                    ...PILL_STYLE,
                    ...{
                      border:
                        accepted ? "1px solid rgba(74,222,128,0.4)" : "1px solid rgba(248,113,113,0.4)",
                      background: accepted
                        ? "rgba(134,239,172,0.16)"
                        : "rgba(248,113,113,0.16)",
                      color: accepted ? "#bbf7d0" : "#fecaca",
                    },
                  }}
                >
                  {accepted ? "Active" : "Not active"}
                </span>
              </li>
              <li>{startedText}</li>
              <li>
                Last verification: {latest ? latest.checkedAt : "None yet"}
                {latest ? (
                  <span
                    style={{
                      ...PILL_STYLE,
                      marginLeft: 8,
                      border: `1px solid ${RESULT_LABELS[latest.status].bg}`,
                      background: RESULT_LABELS[latest.status].bg,
                      color: RESULT_LABELS[latest.status].color,
                    }}
                  >
                    {RESULT_LABELS[latest.status].label}
                  </span>
                ) : null}
              </li>
            </ul>
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
                Check recent games
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

                      <span>{attempt.summary}</span>
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

function getPlayerName(game: LichessGame, side: "white" | "black"): string {
  const players = game.players;
  if (!players) {
    return "";
  }

  const section = side === "white" ? players.white : players.black;
  return section?.user?.name ?? "";
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
    return Date.now() - 15 * 60 * 1000;
  }

  const parsed = Date.parse(activeChallenge.startedAt);
  if (Number.isNaN(parsed)) {
    return Date.now() - 15 * 60 * 1000;
  }

  return parsed;
}

function getMostRecentChallengeResult(
  games: LichessGame[],
  challenge: Challenge,
  lichessUsername: string,
): { status: Attempt["status"]; summary: string; gameId: string } {
  const sorted = [...games].sort((a, b) => {
    const aTime = typeof a.createdAt === "number" ? a.createdAt : 0;
    const bTime = typeof b.createdAt === "number" ? b.createdAt : 0;

    return bTime - aTime;
  });

  for (const game of sorted) {
    const result = evaluateVerification(game, challenge, lichessUsername);
    if (result.status === "verified") {
      return {
        ...result,
        gameId: game.id,
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
  return {
    ...result,
    gameId: mostRecent.id,
  };
}

async function fetchRecentGamesForUser(username: string, startedAt: number): Promise<LichessGame[]> {
  const url = new URL(`https://lichess.org/api/games/user/${encodeURIComponent(username)}`);
  url.searchParams.set("since", String(startedAt));
  url.searchParams.set("max", "50");
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

  let result: { status: Attempt["status"]; summary: string } = {
    status: "unable",
    summary: "No matching recent games were found. Play and finish a game first.",
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
