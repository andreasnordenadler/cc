import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMultiplayerCompletionAccountPatch,
  buildPendingGroupQuestCompletions,
  normalizePendingGroupQuestCompletions,
} from "../src/lib/groupquest-completion-reconciliation";
import {
  compactChallengeAttempts,
  getLatestChallengeAttempt,
  getLatestPassedChallengeAttempt,
  type ChallengeAttempt,
} from "../src/lib/user-metadata";

const canonicalReceipt = {
  id: "gq:new:multiplayer:chesscom:game-42:2026-07-03T05:06:07.000Z",
  challengeId: "new", gameId: "game-42", provider: "chesscom" as const,
  summary: "Accepted proof", checkedAt: "2026-07-03T05:06:07.000Z",
  completedGameAt: "2026-07-03T04:05:06.000Z",
};
const receiptContext = {
  groupQuestId: "gq", participantProvider: "chesscom" as const,
  acceptedChallengeIds: new Set(["new"]),
  acceptedCompletionTimes: { new: canonicalReceipt.completedGameAt },
};

for (const alreadyProjected of [true, false]) {
  for (const newerCount of [1, 10]) {
    test(`account reconciliation preserves chronological latest with ${alreadyProjected ? "projected" : "missing"} receipt and ${newerCount} newer attempts`, () => {
      const projected: ChallengeAttempt = {
        id: canonicalReceipt.id,
        challengeId: canonicalReceipt.challengeId,
        gameId: canonicalReceipt.gameId,
        provider: "chess.com",
        status: "passed",
        summary: `Multiplayer proof verified: ${canonicalReceipt.summary}`,
        checkedAt: canonicalReceipt.checkedAt,
        completedGameAt: canonicalReceipt.completedGameAt,
      };
      const newer: ChallengeAttempt[] = Array.from({ length: newerCount }, (_, index) => ({
        id: `newer-${index}`, challengeId: "new", gameId: `newer-game-${index}`, provider: "chess.com",
        status: "passed", summary: "Newer proof", checkedAt: new Date(Date.parse(canonicalReceipt.checkedAt) + (index + 1) * 1000).toISOString(),
      }));
      const metadata = {
        challengeProgress: { completedChallengeIds: ["old", "new"] },
        challengeAttempts: alreadyProjected ? [projected, ...newer] : newer,
      };
      const before = structuredClone(metadata);
      const patch = buildMultiplayerCompletionAccountPatch(metadata, [canonicalReceipt]);
      assert.deepEqual(patch.challengeAttempts.map((attempt) => attempt.id),
        compactChallengeAttempts([projected, ...newer]).map((attempt) => attempt.id),
        "reconciliation must retain existing positions or insert stale receipts before newer attempts, then compact");
      assert.equal(getLatestChallengeAttempt(patch, "new")?.id, newer.at(-1)!.id);
      assert.equal(getLatestPassedChallengeAttempt(patch, "new")?.id, newer.at(-1)!.id);
      if (alreadyProjected && newerCount === 1) assert.deepEqual(patch.challengeAttempts[0], projected, "matching projected proof stays unchanged in place");
      assert.deepEqual(metadata, before, "projection must not mutate its input");
      const serialized = JSON.parse(JSON.stringify(patch));
      assert.deepEqual(JSON.parse(JSON.stringify(buildMultiplayerCompletionAccountPatch(serialized, [canonicalReceipt]))), serialized,
        "serialized retries remain idempotent even when compaction has removed a superseded receipt");
      assert.deepEqual(patch.challengeProgress.completedChallengeIds, ["old", "new"]);
    });
  }
}

test("account reconciliation inserts missing receipts chronologically without sorting existing attempts", () => {
  const attempt = (id: string, checkedAt: string): ChallengeAttempt => ({
    id, challengeId: "new", gameId: id, provider: "chess.com", status: "failed", summary: id, checkedAt,
  });
  const existing = [
    attempt("older", "2026-07-01T00:00:00.000Z"),
    attempt("newer-first", "2026-07-05T00:00:00.000Z"),
    attempt("newer-last", "2026-07-04T00:00:00.000Z"),
  ];
  const earlierReceipt = { ...canonicalReceipt,
    id: "gq:new:multiplayer:chesscom:earlier-game:2026-07-02T05:06:07.000Z",
    gameId: "earlier-game", checkedAt: "2026-07-02T05:06:07.000Z", completedGameAt: "2026-07-02T04:05:06.000Z",
  };
  const patch = buildMultiplayerCompletionAccountPatch({ challengeAttempts: existing }, [canonicalReceipt, earlierReceipt]);
  assert.deepEqual(patch.challengeAttempts.map((entry) => entry.id), [
    "older", earlierReceipt.id, canonicalReceipt.id, "newer-first", "newer-last",
  ]);
  assert.equal(getLatestChallengeAttempt(patch, "new")?.id, "newer-last");
  const serialized = JSON.parse(JSON.stringify(patch));
  assert.deepEqual(JSON.parse(JSON.stringify(buildMultiplayerCompletionAccountPatch(serialized, [canonicalReceipt, earlierReceipt]))), serialized);
});

test("optional completedGameAt rejects each supplied malformed value in an otherwise reconcilable receipt", () => {
  assert.equal(normalizePendingGroupQuestCompletions([canonicalReceipt], receiptContext).length, 1);
  const withoutTime: Partial<typeof canonicalReceipt> = { ...canonicalReceipt };
  delete withoutTime.completedGameAt;
  assert.equal(normalizePendingGroupQuestCompletions([withoutTime], receiptContext).length, 1);
  for (const value of [null, 42, ` ${canonicalReceipt.completedGameAt}`, `${canonicalReceipt.completedGameAt} `,
    "x".repeat(41), "2026-07-03T04:05:06Z", "2026-07-03T06:05:06.000+02:00", "", undefined]) {
    assert.deepEqual(normalizePendingGroupQuestCompletions([{ ...canonicalReceipt, completedGameAt: value }], receiptContext), [], String(value));
  }
});

test("duplicate deterministic receipt IDs are rejected as a set, including conflicting copies", () => {
  for (const copy of [{ ...canonicalReceipt }, { ...canonicalReceipt, summary: "Conflicting proof" }, { ...canonicalReceipt, gameId: "another-game" }]) {
    assert.deepEqual(normalizePendingGroupQuestCompletions([canonicalReceipt, copy], receiptContext), []);
  }
});

test("account patch defensively emits one attempt per receipt ID", () => {
  const patch = buildMultiplayerCompletionAccountPatch({}, [canonicalReceipt, { ...canonicalReceipt }]);
  assert.equal(patch.challengeAttempts.length, 1);
  assert.equal(patch.challengeAttempts[0].id, canonicalReceipt.id);
});

test("persisted multiplayer completion rejects overlong provider game identities instead of truncating them", () => {
  assert.throws(() => buildPendingGroupQuestCompletions({
    groupQuestId: "g".repeat(80),
    provider: "chesscom",
    existing: [],
    newlyPassedQuestIds: ["q".repeat(100)],
    checks: [{
      questId: "q".repeat(100),
      result: {
        status: "passed",
        gameId: "game-" + "x".repeat(1000),
        summary: "summary",
        gameTime: "2026-07-03T04:05:06.000Z",
      },
    }],
    checkedAt: "2026-07-03T05:06:07.000Z",
  }), /groupquest_completion_receipt_invalid/);
});

test("canonical persisted multiplayer completion remains idempotent after serialized retry", () => {
  const pending = buildPendingGroupQuestCompletions({
    groupQuestId: "group-quest",
    provider: "chesscom",
    existing: [],
    newlyPassedQuestIds: ["finish-any-game"],
    checks: [{
      questId: "finish-any-game",
      result: {
        status: "passed",
        gameId: "game-42",
        summary: "Passed once",
        gameTime: "2026-07-03T04:05:06.000Z",
      },
    }],
    checkedAt: "2026-07-03T05:06:07.000Z",
  });

  const firstPatch = buildMultiplayerCompletionAccountPatch({}, pending);
  const retriedPatch = buildMultiplayerCompletionAccountPatch(JSON.parse(JSON.stringify(firstPatch)), pending);
  assert.equal(retriedPatch.challengeAttempts.length, 1);
  assert.equal(retriedPatch.challengeAttempts[0].id, pending[0].id);
});
