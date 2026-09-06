import assert from "node:assert/strict";
import test from "node:test";
import { checkLatestCustomSideQuestForProvider, checkSubmittedCustomSideQuestForProvider } from "../src/lib/custom-side-quests";

const standardFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const otherFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1";

for (const provider of ["lichess", "chesscom"] as const) {
  for (const entry of ["latest", "submitted"] as const) {
    for (const sample of [
      { name: "nonstandard PGN start", tags: `[SetUp "1"]\n[FEN "${otherFen}"]`, metadata: {}, expected: "pending" },
      { name: "provider variant", tags: "", metadata: provider === "lichess" ? { variant: "antichess" } : { rules: "chess960" }, expected: "pending" },
      { name: provider === "lichess" ? "provider initial FEN" : "provider final FEN is not initial context", tags: "", metadata: provider === "lichess" ? { initialFen: otherFen } : { fen: otherFen }, expected: provider === "lichess" ? "pending" : "passed" },
      { name: "PGN variant", tags: '[Variant "Atomic"]', metadata: {}, expected: "pending" },
      { name: "setup without FEN", tags: '[SetUp "1"]', metadata: {}, expected: "pending" },
      { name: "explicit standard", tags: `[Variant "Standard"]\n[SetUp "1"]\n[FEN "${standardFen}"]`, metadata: provider === "lichess" ? { variant: "standard", initialFen: standardFen } : { rules: "chess" }, expected: "passed" },
      { name: "duplicate FEN", tags: `[FEN "${standardFen}"]\n[FEN "${otherFen}"]`, metadata: {}, expected: "pending" },
      { name: "unterminated FEN", tags: '[FEN "invalid"', metadata: {}, expected: "pending" },
      { name: "malformed FEN", tags: '[FEN invalid]', metadata: {}, expected: "pending" },
      { name: "invalid provider variant", tags: "", metadata: provider === "lichess" ? { variant: null } : { rules: null }, expected: "pending" },
      { name: "legacy standard", tags: "", metadata: {}, expected: "passed" },
    ]) {
    test(`${provider} ${entry}: ${sample.name} respects the standard-start boundary`, async (t) => {
      const gameId = provider === "lichess" ? "Context1" : "https://www.chess.com/game/live/123456";
      const archive = "https://api.chess.com/pub/player/alice/games/2026/09";
      t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
        const pgn = `[Event "Context"]\n${sample.tags}\n\n1. e4 e5 1-0`;
        if (provider === "lichess") return Response.json({ ...sample.metadata, id: gameId, status: "resign", winner: "white", moves: "e2e4 e7e5", pgn,
          players: { white: { user: { name: "alice" } }, black: { user: { name: "bob" } } } });
        if (String(input).endsWith("/archives")) return Response.json({ archives: [archive] });
        assert.equal(String(input), archive);
        return Response.json({ games: [{ ...sample.metadata, url: gameId, pgn, end_time: 1788650000,
          white: { username: "alice", result: "win" }, black: { username: "bob", result: "resigned" } }] });
      });
      const input = { provider, username: "alice", gameId, quest: { id: "custom-context", title: "Context", config: JSON.stringify({ version: 2, logic: "any", blocks: [
        { type: "pieceState", piece: "queen", owner: "my", condition: "moved", negate: true },
        { type: "gameResult", result: "win" },
      ] }) } };
      const result = entry === "latest" ? await checkLatestCustomSideQuestForProvider(input) : await checkSubmittedCustomSideQuestForProvider(input);
      assert.equal(result.status, sample.expected);
      assert.equal(result.gameId, gameId);
      if (sample.expected === "pending") {
      assert.equal(result.finalPositionFen, undefined);
      assert.equal(result.completedGameAt, undefined);
      assert.equal(result.failureDiagnostic, undefined);
      } else {
        assert.ok(result.finalPositionFen);
      }
    });
    }
  }
}
