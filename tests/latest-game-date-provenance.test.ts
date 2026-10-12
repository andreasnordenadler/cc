import assert from "node:assert/strict";
import test from "node:test";
import { checkLatestCustomSideQuestForProvider, checkSubmittedCustomSideQuestForProvider } from "../src/lib/custom-side-quests";

import { checkLatestChallengeForProvider } from "../src/lib/challenge-latest-verifiers";
import { CHALLENGES } from "../src/lib/challenges";

const quest = { id: "custom-date-proof", title: "Date provenance", config: JSON.stringify({ version: 2, logic: "all", blocks: [{ type: "gameResult", result: "win" }] }) };
const finished = { id: "Abcd1234", variant: "standard", status: "resign", winner: "white", moves: "e2e4 e7e5", createdAt: Date.parse("2026-10-12T10:00:00Z"), players: { white: { user: { name: "alice" } }, black: { user: { name: "bob" } } } };

for (const entry of ["latest", "submitted"] as const) {
  test(`custom Lichess ${entry}: a start timestamp never becomes an end timestamp`, async (t) => {
    t.mock.method(globalThis, "fetch", async () => Response.json(finished));
    const input = { quest, provider: "lichess" as const, username: "alice", gameId: "Abcd1234" };
    const verdict = entry === "latest" ? await checkLatestCustomSideQuestForProvider(input) : await checkSubmittedCustomSideQuestForProvider(input);
    assert.equal(verdict.gameId, "Abcd1234");
    assert.equal(verdict.startedGameAt, "2026-10-12T10:00:00.000Z");
    assert.equal(verdict.completedGameAt, undefined);
  });
  test(`custom Lichess ${entry}: malformed dates do not lose the observed identity`, async (t) => {
    t.mock.method(globalThis, "fetch", async () => Response.json({ ...finished, createdAt: 1e30, lastMoveAt: 1e30 }));
    const input = { quest, provider: "lichess" as const, username: "alice", gameId: "Abcd1234" };
    const verdict = entry === "latest" ? await checkLatestCustomSideQuestForProvider(input) : await checkSubmittedCustomSideQuestForProvider(input);
    assert.equal(verdict.gameId, "Abcd1234");
    assert.equal(verdict.startedGameAt, undefined);
    assert.equal(verdict.completedGameAt, undefined);
  });
}
for (const challenge of CHALLENGES) {
  test(`official Lichess ${challenge.id}: malformed dates do not lose the observed identity`, async (t) => {
    t.mock.method(globalThis, "fetch", async () => Response.json({ ...finished, createdAt: 1e30, lastMoveAt: 1e30 }));
    const verdict = await checkLatestChallengeForProvider({ challengeId: challenge.id, provider: "lichess", username: "alice" });
    assert.equal(verdict.gameId, "Abcd1234");
    assert.equal(verdict.startedGameAt, undefined);
    assert.equal(verdict.completedGameAt, undefined);
  });
}
