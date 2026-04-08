import Link from "next/link";
import { revalidatePath } from "next/cache";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { getChallengeById, type Challenge } from "@/lib/challenges";

type Attempt = {
  id: string;
  gameId: string;
  status: "verified" | "failed" | "unable";
  summary: string;
  checkedAt: string;
};

type UserMetadataRecord = Record<string, unknown>;

type Props = {
  params: {
    challengeId: string;
  };
};

export default async function ChallengeDetailPage({ params }: Props) {
  const { challengeId } = params;
  const challenge = getChallengeById(challengeId);
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;

  if (!challenge) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <section>
          Challenge not found.
        </section>
      </main>
    );
  }

  const metadata = user?.publicMetadata
    ? (user.publicMetadata as UserMetadataRecord)
    : {};

  const lichessUsername = typeof metadata.lichessUsername === "string" ? metadata.lichessUsername : "";
  const activeChallenge =
    typeof metadata.activeChallenge === "object" &&
    metadata.activeChallenge !== null &&
    "id" in (metadata.activeChallenge as Record<string, unknown>)
      ? (metadata.activeChallenge as { id: string; status?: string })
      : null;

  const attempts: Attempt[] = Array.isArray(metadata.challengeAttempts)
    ? (metadata.challengeAttempts as Attempt[]).filter(
        (attempt): attempt is Attempt =>
          attempt !== null &&
          typeof attempt === "object" &&
          typeof (attempt as Attempt).gameId === "string" &&
          typeof (attempt as Attempt).status === "string",
      )
    : [];

  const latest = attempts
    .filter((attempt) => attempt.id.startsWith(challenge.id) || attempt.id.includes(challenge.id))
    .at(-1);
  const accepted = activeChallenge?.id === challenge.id;

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
              maxWidth: 680,
            }}
          >
            <strong>Status</strong>
            <ul style={{ margin: "10px 0 0", color: "#cbd5e1" }}>
              <li>Saved Lichess identity: {lichessUsername || "not saved yet"}</li>
              <li>Challenge active: {accepted ? "Yes" : "No"}</li>
              {latest ? <li>Latest attempt: {latest.status.toUpperCase()} @ {latest.checkedAt}</li> : null}
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
                    background: "rgba(15,23,42,0.75)",
                    color: "#cbd5e1",
                    padding: "10px 16px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Mark as accepted
                </button>
              </form>
            ) : null}
          </div>
        </div>

        {userId ? (
          <section
            style={{ marginTop: 22, borderTop: "1px solid rgba(148,163,184,0.2)", paddingTop: 24 }}
          >
            <h2 style={{ margin: 0, fontSize: 20 }}>Verify your return game</h2>
            <p style={{ color: "#94a3b8", marginTop: 8 }}>
              Paste any finished Lichess game ID or URL after you finish your game.
            </p>

            <form action={verifyChallenge.bind(null, challenge.id)} style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <input
                name="gameReference"
                required
                minLength={5}
                placeholder="e.g. 8v4f7y8j or https://lichess.org/8v4f7y8j"
                style={{
                  width: "min(100%, 500px)",
                  borderRadius: 12,
                  border: "1px solid rgba(148,163,184,0.26)",
                  background: "rgba(15,23,42,0.72)",
                  color: "#f8fafc",
                  padding: "12px 14px",
                  fontSize: 16,
                }}
              />
              <button
                type="submit"
                style={{
                  width: "fit-content",
                  borderRadius: 999,
                  border: "1px solid rgba(96,165,250,0.32)",
                  background: "#eff6ff",
                  color: "#0f172a",
                  padding: "10px 16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Check result
              </button>
            </form>
          </section>
        ) : (
          <p style={{ marginTop: 22, color: "#cbd5e1" }}>
            Sign in to accept and verify this challenge.
          </p>
        )}

        {attempts.length ? (
          <section
            style={{ marginTop: 24, borderTop: "1px solid rgba(148,163,184,0.2)", paddingTop: 20 }}
          >
            <h3 style={{ margin: 0 }}>Challenge attempts</h3>
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {attempts
                .filter((attempt) => attempt.id.includes(challenge.id))
                .slice(-6)
                .reverse()
                .map((attempt) => (
                  <div
                    key={`${challenge.id}-${attempt.checkedAt}`}
                    style={{
                      borderRadius: 12,
                      border: "1px solid rgba(148,163,184,0.2)",
                      background: "rgba(15,23,42,0.62)",
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ color: "#f8fafc", fontSize: 14 }}>
                      {attempt.summary}
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

function parseGameId(input: string): string {
  const trimmed = input.trim();
  const byPath = trimmed.match(/lichess\.org\/(?:game\/)?([a-zA-Z0-9]{5,16})(?:[?#/].*)?$/);
  if (byPath) {
    return byPath[1].toLowerCase();
  }

  const bare = trimmed.replace(/[\s]/g, "").toLowerCase();
  if (/^[a-zA-Z0-9]{5,16}$/.test(bare)) {
    return bare;
  }

  return "";
}

function parseGamePlayersAndResult(pgn: string) {
  const white = /\[White "([^"]+)"\]/.exec(pgn)?.[1] ?? "";
  const black = /\[Black "([^"]+)"\]/.exec(pgn)?.[1] ?? "";
  const result = /\[Result "([^"]+)"\]/.exec(pgn)?.[1] ?? "*";
  const termination = /\[Termination "([^"]+)"\]/.exec(pgn)?.[1] ?? "unknown";
  return {
    white,
    black,
    result,
    termination,
  };
}

function evaluateVerification(
  game: {
    white: string;
    black: string;
    result: string;
    termination: string;
  },
  challenge: Challenge,
  lichessUsername: string,
) {
  if (!lichessUsername) {
    return {
      status: "unable" as const,
      summary: "No saved Lichess username. Add it in /account first.",
    };
  }

  const whiteNormalized = game.white.toLowerCase();
  const blackNormalized = game.black.toLowerCase();
  const userNormalized = lichessUsername.toLowerCase();

  const isWhite = userNormalized === whiteNormalized;
  const isBlack = userNormalized === blackNormalized;

  if (!isWhite && !isBlack) {
    return {
      status: "failed" as const,
      summary: `This game does not contain user ${lichessUsername}.`,
    };
  }

  const playedSide = isWhite ? "white" : "black";

  if (challenge.requirement.result === "win") {
    if (challenge.requirement.side !== "either" && challenge.requirement.side !== playedSide) {
      return {
        status: "failed" as const,
        summary: `Challenge requires side ${challenge.requirement.side}, but game has ${playedSide}.`,
      };
    }

    if (game.result === "1-0" && playedSide === "white") {
      return {
        status: "verified" as const,
        summary: `Verified: you won as White. (${game.termination})`,
      };
    }

    if (game.result === "0-1" && playedSide === "black") {
      return {
        status: "verified" as const,
        summary: `Verified: you won as Black. (${game.termination})`,
      };
    }

    return {
      status: "failed" as const,
      summary: `Game finished but not a win for your required side (${playedSide}).`,
    };
  }

  // result === finish
  if (game.result === "*") {
    return {
      status: "failed" as const,
      summary: "Game not finished yet. Finish it on Lichess first.",
    };
  }

  return {
    status: "verified" as const,
    summary: `Verified: finished as ${playedSide} (${game.result}, ${game.termination}).`,
  };
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

async function verifyChallenge(challengeId: string, formData: FormData) {
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

  const rawInput = formData.get("gameReference");
  const gameReference =
    typeof rawInput === "string" ? rawInput.trim() : "";
  const gameId = parseGameId(gameReference);

  let result: { status: Attempt["status"]; summary: string } = {
    status: "unable",
    summary: "Unable to parse a valid Lichess game id from your input.",
  };

  if (!gameId) {
    await writeAttempt(challenge, userId, metadata, {
      gameId: gameReference || "(invalid)",
      ...result,
    });
    revalidatePath(`/challenges/${challengeId}`);
    return;
  }

  try {
    const response = await fetch(`https://lichess.org/game/export/${gameId}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      result = {
        status: "unable" as const,
        summary: `Could not fetch game ${gameId} from Lichess (status ${response.status}).`,
      };
    } else {
      const pgn = await response.text();
      const parsed = parseGamePlayersAndResult(pgn);
      result = evaluateVerification(
        parsed,
        challenge,
        typeof metadata.lichessUsername === "string" ? metadata.lichessUsername : "",
      );
    }
  } catch (error) {
    console.error(error);
    result = {
      status: "unable" as const,
      summary: "Network error while trying to contact Lichess for verification.",
    };
  }

  const latestAttempts = Array.isArray(metadata.challengeAttempts)
    ? (metadata.challengeAttempts as Attempt[])
    : [];

  const nextAttempts = [
    ...latestAttempts,
    {
      id: `${challengeId}-${Date.now()}`,
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
        id: challengeId,
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
