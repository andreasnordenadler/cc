import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { CHALLENGES } from "@/lib/challenges";

type UserMetadataRecord = Record<string, unknown>;

type ChallengeProgress = {
  completedChallengeIds: string[];
};

export default async function ChallengesPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata
    ? (user.publicMetadata as UserMetadataRecord)
    : {};

  const progress = getChallengeProgress(metadata);
  const nextChallenge = getNextChallenge(progress);

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
          href="/"
          style={{
            display: "inline-block",
            marginBottom: 14,
            color: "#93c5fd",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          ← Back home
        </Link>

        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            marginBottom: 8,
          }}
        >
          Challenge Hub
        </h1>

        <p style={{ color: "#94a3b8", marginBottom: 24, maxWidth: 700 }}>
          Pick one challenge, play it on Lichess, then return here and we&apos;ll verify it from
          your recent games automatically.
        </p>

        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          }}
        >
          {CHALLENGES.map((challenge) => {
            const isCompleted = progress.completedChallengeIds.includes(challenge.id);
            const isNext = challenge.id === nextChallenge?.id;

            return (
            <article
              key={challenge.id}
              style={{
                borderRadius: 18,
                background: isCompleted
                  ? "rgba(22, 163, 74, 0.10)"
                  : "rgba(15,23,42,0.58)",
                border: isCompleted
                  ? "1px solid rgba(74, 222, 128, 0.35)"
                  : "1px solid rgba(148,163,184,0.18)",
                padding: 16,
                display: "grid",
                gap: 12,
              }}
            >
              {isCompleted ? (
                <span
                  style={{
                    borderRadius: 999,
                    alignSelf: "start",
                    background: "rgba(74, 222, 128, 0.18)",
                    border: "1px solid rgba(74, 222, 128, 0.35)",
                    color: "#bbf7d0",
                    padding: "4px 10px",
                    width: "fit-content",
                    fontSize: 12,
                  }}
                >
                  Completed
                </span>
              ) : null}

              {isNext ? (
                <span
                  style={{
                    borderRadius: 999,
                    alignSelf: "start",
                    background: "rgba(96, 165, 250, 0.16)",
                    border: "1px solid rgba(96,165,250,0.35)",
                    color: "#93c5fd",
                    padding: "4px 10px",
                    width: "fit-content",
                    fontSize: 12,
                  }}
                >
                  Next
                </span>
              ) : null}

              <h2 style={{ margin: 0, fontSize: 22 }}>{challenge.title}</h2>
              <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.5 }}>
                {challenge.objective}
              </p>
              <p style={{ margin: 0, color: "#93c5fd", fontSize: 14 }}>
                {challenge.openingHint}
                <br />
                <span style={{ color: "#fde68a", fontWeight: 600 }}>
                  Reward: {challenge.reward} points
                </span>
              </p>
              <Link
                href={`/challenges/${challenge.id}`}
                style={{
                  display: "inline-block",
                  borderRadius: 999,
                  border: "1px solid rgba(96,165,250,0.32)",
                  background: "#eff6ff",
                  color: "#0f172a",
                  padding: "10px 14px",
                  textAlign: "center",
                  fontWeight: 600,
                  textDecoration: "none",
                  width: "fit-content",
                }}
              >
                {isCompleted ? "Review challenge" : isNext ? "Start next" : "Open challenge"}
              </Link>
            </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function getChallengeProgress(metadata: UserMetadataRecord): ChallengeProgress {
  const raw = metadata.challengeProgress;

  if (!raw || typeof raw !== "object") {
    return {
      completedChallengeIds: [],
    };
  }

  const record = raw as Record<string, unknown>;

  return {
    completedChallengeIds: Array.isArray(record.completedChallengeIds)
      ? record.completedChallengeIds.filter((entry): entry is string => typeof entry === "string")
      : [],
  };
}

function getNextChallenge(progress: ChallengeProgress) {
  const completedSet = new Set(progress.completedChallengeIds);
  return CHALLENGES.find((challenge) => !completedSet.has(challenge.id)) || null;
}
