import assert from "node:assert/strict";
import test from "node:test";
import {
  checkLatestCustomSideQuestForProvider,
  checkSubmittedCustomSideQuestForProvider,
  type CustomSideQuestRuleBlock,
} from "../src/lib/custom-side-quests";

const gameMoves = "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7";
const chessComGameId = "https://www.chess.com/game/live/606004";
const chessComArchive = "https://api.chess.com/pub/player/alice/games/2026/09";

type Provider = "lichess" | "chesscom";
type Entry = "latest" | "submitted";

function installFinishedGame(t: test.TestContext, provider: Provider, lichessMoves = gameMoves) {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    if (provider === "lichess") {
      const game = {
        id: "Timing01",
        status: "resign",
        winner: "white",
        moves: lichessMoves,
        players: {
          white: { user: { name: "alice" } },
          black: { user: { name: "bob" } },
        },
      };
      return String(input).includes("/api/games/user/")
        ? new Response(`${JSON.stringify(game)}\n`)
        : Response.json(game);
    }
    if (String(input).endsWith("/archives")) return Response.json({ archives: [chessComArchive] });
    assert.equal(String(input), chessComArchive);
    return Response.json({ games: [{
      url: chessComGameId,
      pgn: `[Event "Timing"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 1-0`,
      end_time: 1788650000,
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
  });
}

async function evaluate(provider: Provider, entry: Entry, block: CustomSideQuestRuleBlock) {
  const input = {
    provider,
    username: "alice",
    gameId: provider === "lichess" ? "Timing01" : chessComGameId,
    quest: {
      id: "custom-sequence-timing",
      title: "Sequence timing",
      config: JSON.stringify({ version: 2, logic: "all", blocks: [block] }),
    },
  };
  return entry === "latest"
    ? checkLatestCustomSideQuestForProvider(input)
    : checkSubmittedCustomSideQuestForProvider(input);
}

for (const entry of ["latest", "submitted"] as const) {
  test(`lichess ${entry}: UCI-only provider replay is matched as canonical SAN`, async (t) => {
    installFinishedGame(t, "lichess", "e2e4 e7e5 g1f3");
    for (const block of [
      { type: "moveSequence", sequence: "e4 e5", timing: { atMove: 1 } },
      { type: "moveSequence", sequence: "e4 e5", timing: { byMove: 1 } },
      { type: "moveSequence", sequence: "Nf3", timing: { atGameEnd: true } },
      { type: "openingSequence", raw: "1. e4 e5", moves: ["e4", "e5"], anchor: "gameStart" },
    ] satisfies CustomSideQuestRuleBlock[]) {
      const result = await evaluate("lichess", entry, block);
      assert.equal(result.status, "passed", JSON.stringify(block));
      assert.notEqual(result.lastMoveSan, undefined, JSON.stringify(block));
    }
  });
}

for (const provider of ["lichess", "chesscom"] as const) {
  for (const entry of ["latest", "submitted"] as const) {
    test(`${provider} ${entry}: at-move sequence window accepts either color's completion only on that move`, async (t) => {
      installFinishedGame(t, provider);
      for (const sample of [
        { sequence: "Bb5 a6 Ba4", expected: "passed" },
        { sequence: "a6 Ba4 Nf6", expected: "passed" },
        { sequence: "e4 e5", expected: "failed" },
        { sequence: "O-O Be7", expected: "failed" },
      ] as const) {
        const result = await evaluate(provider, entry, {
          type: "moveSequence",
          sequence: sample.sequence,
          timing: { atMove: 4 },
        });
        assert.equal(result.status, sample.expected, sample.sequence);
      }
    });

    test(`${provider} ${entry}: by-move sequence window accepts any completion through the deadline`, async (t) => {
      installFinishedGame(t, provider);
      for (const sample of [
        { sequence: "e4 e5", byMove: 4, expected: "passed" },
        { sequence: "Bb5 a6", byMove: 3, expected: "passed" },
        { sequence: "Bb5 a6 Ba4", byMove: 4, expected: "passed" },
        { sequence: "a6 Ba4 Nf6", byMove: 4, expected: "passed" },
        { sequence: "Ba4 Nf6 O-O", byMove: 4, expected: "failed" },
      ] as const) {
        const result = await evaluate(provider, entry, {
          type: "moveSequence",
          sequence: sample.sequence,
          timing: { byMove: sample.byMove },
        });
        assert.equal(result.status, sample.expected, sample.sequence);
      }
    });

    test(`${provider} ${entry}: game-end sequence window searches the complete replay`, async (t) => {
      installFinishedGame(t, provider);
      for (const sample of [
        { sequence: "e4 e5", expected: "passed" },
        { sequence: "a6 Ba4 Nf6", expected: "passed" },
        { sequence: "Be7 Re1", expected: "failed" },
      ] as const) {
        const result = await evaluate(provider, entry, {
          type: "moveSequence",
          sequence: sample.sequence,
          timing: { atGameEnd: true },
        });
        assert.equal(result.status, sample.expected, sample.sequence);
      }
    });
  }
}

test("invalid empty move-sequence tokens are rejected before timing and negation", async (t) => {
  installFinishedGame(t, "lichess");
  for (const block of [
    { type: "moveSequence", sequence: "", timing: { atMove: 4 } },
    { type: "moveSequence", sequence: "?!", timing: { byMove: 4 } },
    { type: "moveSequence", sequence: "? e4", timing: { atMove: 1 } },
    { type: "moveSequence", sequence: "$1", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "1.", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "1-0", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "garbage", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "e2e4", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "nf3", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "e4=Q", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "exe4", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "Kaa1", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "e8Q", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "axh4", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "Nff3", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "N3f3", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "Na1a1", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "Ra1a2", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "Ba1h8", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "Bah8", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "B1h8", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "e4 ?", timing: { atGameEnd: true }, negate: true },
  ] as const) {
    const result = await evaluate("lichess", "submitted", block);
    assert.equal(result.status, "pending", JSON.stringify(block));
  }
});

test("invalid opening-sequence tokens are rejected before timing and negation", async (t) => {
  installFinishedGame(t, "lichess");
  for (const block of [
    { type: "openingSequence", raw: "", moves: [], anchor: "gameStart" },
    { type: "openingSequence", raw: " ", moves: [" "], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "?! ", moves: ["?! "], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "? !", moves: ["? !"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "$1", moves: ["$1"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "1.", moves: ["1."], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "1-0", moves: ["1-0"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "not-a-move", moves: ["not-a-move"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "e2e4", moves: ["e2e4"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "nf3", moves: ["nf3"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "e4=Q", moves: ["e4=Q"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "exe4", moves: ["exe4"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "Kaa1", moves: ["Kaa1"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "e8Q", moves: ["e8Q"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "axh4", moves: ["axh4"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "Nff3", moves: ["Nff3"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "N3f3", moves: ["N3f3"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "Na1a1", moves: ["Na1a1"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "Ra1a2", moves: ["Ra1a2"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "Ba1h8", moves: ["Ba1h8"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "Bah8", moves: ["Bah8"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "B1h8", moves: ["B1h8"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "1. e4 ?", moves: ["e4", "?"], anchor: "gameStart", negate: true },
  ] satisfies CustomSideQuestRuleBlock[]) {
    const result = await evaluate("lichess", "submitted", block);
    assert.equal(result.status, "pending", JSON.stringify(block));
  }
});

test("canonical bishop disambiguation remains evaluable", async (t) => {
  installFinishedGame(t, "lichess");
  for (const block of [
    { type: "moveSequence", sequence: "Bbd4", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "B2d4", timing: { atGameEnd: true }, negate: true },
    { type: "moveSequence", sequence: "Bb2d4", timing: { atGameEnd: true }, negate: true },
    { type: "openingSequence", raw: "Bbd4", moves: ["Bbd4"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "B2d4", moves: ["B2d4"], anchor: "gameStart", negate: true },
    { type: "openingSequence", raw: "Bb2d4", moves: ["Bb2d4"], anchor: "gameStart", negate: true },
  ] satisfies CustomSideQuestRuleBlock[]) {
    const result = await evaluate("lichess", "submitted", block);
    assert.equal(result.status, "passed", JSON.stringify(block));
  }
});

test("opening-sequence proof diagnostics identify the opening completion snapshot", async (t) => {
  installFinishedGame(t, "lichess");
  const matched = await evaluate("lichess", "submitted", {
    type: "openingSequence",
    raw: "1. e4 e5",
    moves: ["e4", "e5"],
    anchor: "gameStart",
  });
  assert.equal(matched.status, "passed");
  assert.equal(matched.lastMoveSan, "e5");

  const negated = await evaluate("lichess", "submitted", {
    type: "openingSequence",
    raw: "1. e4 e5",
    moves: ["e4", "e5"],
    anchor: "gameStart",
    negate: true,
  });
  assert.equal(negated.status, "failed");
  assert.equal(negated.failureDiagnostic?.san, "e5");
});
