import assert from "node:assert/strict";
import test from "node:test";
import { POST, withMobileQuestRouteTestDependencies } from "../src/app/api/mobile/quest/route";
import { buildLatestGameVisibility, type ChallengeAttempt } from "../src/lib/user-metadata";

for (const provider of ["lichess", "chess.com"] as const) {
  for (const scenario of ["no-game", "provider-error", "old-game", "fresh-game"] as const) {
    test(`${provider} ${scenario}: actual game observation cannot turn indexing delay into quest failure`, async (t) => {
      const started = scenario === "fresh-game" ? "2026-10-12T12:00:00Z" : "2026-10-12T10:00:00Z";
      const ended = scenario === "fresh-game" ? "2026-10-12T12:05:00Z" : "2026-10-12T10:05:00Z";
      t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
        if (scenario === "provider-error") return new Response("unavailable", { status: 503 });
        if (provider === "lichess") return new Response(scenario === "no-game" ? "" : JSON.stringify({ id: "Abcd1234", status: "mate", winner: "white", createdAt: Date.parse(started), lastMoveAt: Date.parse(ended), moves: "e2e4 e7e5 d1h5 b8c6 f1c4 g8f6 h5f7", players: { white: { user: { name: "Alice" } }, black: { user: { name: "Bob" } } } }));
        if (String(input).endsWith("/archives")) return Response.json({ archives: ["https://api.chess.com/pub/player/alice/games/2026/10"] });
        return Response.json({ games: scenario === "no-game" ? [] : [{ url: "https://www.chess.com/game/live/100001", end_time: Date.parse(ended) / 1000, pgn: `[UTCDate "2026.10.12"]\n[UTCTime "${started.slice(11, 19)}"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0`, rated: true, rules: "chess", time_class: "blitz", time_control: "180", white: { username: "alice", result: "win" }, black: { username: "bob", result: "checkmated" } }] });
      });
      let current: Record<string, unknown> = { [provider === "lichess" ? "lichessUsername" : "chessComUsername"]: "alice", activeChallenge: { id: "finish-any-game", status: "accepted", startedAt: "2026-10-12T11:00:00Z" }, challengeProgress: { completedChallengeIds: [] } };
      const response = await withMobileQuestRouteTestDependencies({ authenticate: async () => "fixture-user", getClient: async () => ({ users: {
        getUser: async () => ({ publicMetadata: current, privateMetadata: {} }), updateUserMetadata: async (_id: string, update: { publicMetadata: Record<string, unknown> }) => { current = update.publicMetadata; },
      } }) as never }, () => POST(new Request("https://sidequestchess.com/api/mobile/quest", { method: "POST", body: JSON.stringify({ action: "check" }) })));
      assert.equal(response.status, 200);
      const attempts = current.challengeAttempts as ChallengeAttempt[];
      assert.equal(attempts.at(-1)?.status, scenario === "fresh-game" ? "passed" : "pending");
      const visibility = buildLatestGameVisibility(attempts);
      if (scenario === "no-game" || scenario === "provider-error") assert.equal(visibility?.game, null);
      else {
        assert.equal(visibility?.game?.provider, provider);
        assert.equal(visibility?.game?.gameId, provider === "lichess" ? "Abcd1234" : "https://www.chess.com/game/live/100001");
        assert.equal(visibility?.game?.completedGameAt, new Date(ended).toISOString());
        assert.notEqual(visibility?.checkedAt, visibility?.game?.completedGameAt);
      }
    });
  }
}
