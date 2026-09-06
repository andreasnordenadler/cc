import assert from "node:assert/strict";
import test from "node:test";
import {
  checkLatestCustomSideQuestForProvider,
  checkSubmittedCustomSideQuestForProvider,
} from "../src/lib/custom-side-quests";

test("a specific pawn rule evaluates only the selected starting pawn across providers and entry points", async (t) => {
  const lichessGameId = "PawnId01";
  const chessComGameId = "https://www.chess.com/game/live/123456";
  const chessComArchive = "https://api.chess.com/pub/player/alice/games/2026/09";
  let lichessMoves = "a2a3 e7e5";
  let chessComMoves = "a3 e5";

  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("lichess.org")) {
      return Response.json({
        id: lichessGameId,
        status: "resign",
        winner: "white",
        moves: lichessMoves,
        players: {
          white: { user: { name: "alice" } },
          black: { user: { name: "bob" } },
        },
      });
    }
    if (url.endsWith("/archives")) return Response.json({ archives: [chessComArchive] });
    assert.equal(url, chessComArchive);
    return Response.json({
      games: [{
        url: chessComGameId,
        pgn: `[Event "Pawn identity"]\n\n1. ${chessComMoves} 1-0`,
        end_time: 1788650000,
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "resigned" },
      }],
    });
  });

  const quest = {
    id: "custom-specific-pawn",
    title: "Move the e-pawn",
    config: JSON.stringify({
      version: 2,
      logic: "all",
      blocks: [{
        type: "pieceState",
        piece: "pawn",
        owner: "my",
        selector: { quantifier: "any one", count: 1, maxAvailable: 8, identity: "e-pawn" },
        condition: "moved",
        timing: { atGameEnd: true },
      }],
    }),
  };

  for (const provider of ["lichess", "chesscom"] as const) {
    const gameId = provider === "lichess" ? lichessGameId : chessComGameId;
    for (const entry of ["latest", "submitted"] as const) {
      const input = { quest, provider, username: "alice", gameId };
      const verdict = entry === "latest"
        ? await checkLatestCustomSideQuestForProvider(input)
        : await checkSubmittedCustomSideQuestForProvider(input);
      assert.equal(verdict.status, "failed", `${provider} ${entry}`);
    }
  }

  lichessMoves = "e2e4 e7e5";
  chessComMoves = "e4 e5";
  for (const provider of ["lichess", "chesscom"] as const) {
    const gameId = provider === "lichess" ? lichessGameId : chessComGameId;
    for (const entry of ["latest", "submitted"] as const) {
      const input = { quest, provider, username: "alice", gameId };
      const verdict = entry === "latest"
        ? await checkLatestCustomSideQuestForProvider(input)
        : await checkSubmittedCustomSideQuestForProvider(input);
      assert.equal(verdict.status, "passed", `${provider} ${entry}`);
    }
  }
});

test("an unknown pawn identity is rejected instead of widening to every pawn", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({
    id: "PawnId02",
    status: "resign",
    winner: "white",
    moves: "a2a3 e7e5",
    players: {
      white: { user: { name: "alice" } },
      black: { user: { name: "bob" } },
    },
  }));

  const verdict = await checkSubmittedCustomSideQuestForProvider({
    provider: "lichess",
    username: "alice",
    gameId: "PawnId02",
    quest: {
      id: "custom-invalid-pawn-identity",
      title: "Invalid pawn identity",
      config: JSON.stringify({
        version: 2,
        logic: "all",
        blocks: [{
          type: "pieceState",
          piece: "pawn",
          owner: "my",
          selector: { quantifier: "any one", count: 1, maxAvailable: 8, identity: "z-pawn" },
          condition: "moved",
          timing: { atGameEnd: true },
        }],
      }),
    },
  });

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.finalPositionFen, undefined);
  assert.equal(verdict.failureDiagnostic, undefined);
});

test("a non-string piece cannot widen a specific pawn identity", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({
    id: "PawnId03",
    status: "resign",
    winner: "white",
    moves: "a2a3 e7e5",
    players: {
      white: { user: { name: "alice" } },
      black: { user: { name: "bob" } },
    },
  }));

  const verdict = await checkSubmittedCustomSideQuestForProvider({
    provider: "lichess",
    username: "alice",
    gameId: "PawnId03",
    quest: {
      id: "custom-malformed-piece",
      title: "Malformed piece",
      config: JSON.stringify({
        version: 2,
        logic: "all",
        blocks: [{
          type: "pieceState",
          piece: ["pawn"],
          owner: "my",
          selector: { quantifier: "any one", count: 1, maxAvailable: 8, identity: "e-pawn" },
          condition: "moved",
          timing: { atGameEnd: true },
        }],
      }),
    },
  });

  assert.equal(verdict.status, "pending");
  assert.equal(verdict.finalPositionFen, undefined);
  assert.equal(verdict.failureDiagnostic, undefined);
});

test("non-string piece-state enums are rejected instead of broadening proof semantics", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({
    id: "PawnId04",
    status: "resign",
    winner: "black",
    moves: "a2a3 e7e5",
    players: {
      white: { user: { name: "alice" } },
      black: { user: { name: "bob" } },
    },
  }));

  for (const malformed of [
    { owner: ["my"], condition: "moved" },
    { owner: "my", condition: ["moved"] },
  ]) {
    const verdict = await checkSubmittedCustomSideQuestForProvider({
      provider: "lichess",
      username: "alice",
      gameId: "PawnId04",
      quest: {
        id: "custom-malformed-piece-state",
        title: "Malformed piece state",
        config: JSON.stringify({
          version: 2,
          logic: "all",
          blocks: [{
            type: "pieceState",
            piece: "pawn",
            owner: malformed.owner,
            selector: { quantifier: "any one", count: 1, maxAvailable: 8, identity: "e-pawn" },
            condition: malformed.condition,
            timing: { atGameEnd: true },
          }],
        }),
      },
    });

    assert.equal(verdict.status, "pending", JSON.stringify(malformed));
    assert.equal(verdict.finalPositionFen, undefined);
    assert.equal(verdict.failureDiagnostic, undefined);
  }
});

test("a non-string quantifier is rejected instead of weakening all-piece semantics", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({
    id: "PawnId05",
    status: "resign",
    winner: "white",
    moves: "a2a3 e7e5",
    players: {
      white: { user: { name: "alice" } },
      black: { user: { name: "bob" } },
    },
  }));

  for (const quantifier of [["all"], ["exactly"]]) {
    const verdict = await checkSubmittedCustomSideQuestForProvider({
      provider: "lichess",
      username: "alice",
      gameId: "PawnId05",
      quest: {
        id: "custom-malformed-quantifier",
        title: "Malformed quantifier",
        config: JSON.stringify({
          version: 2,
          logic: "all",
          blocks: [{
            type: "pieceState",
            piece: "pawn",
            owner: "my",
            selector: { quantifier, count: 1, maxAvailable: 8, identity: "any" },
            condition: "moved",
            timing: { atGameEnd: true },
          }],
        }),
      },
    });

    assert.equal(verdict.status, "pending", JSON.stringify(quantifier));
    assert.equal(verdict.finalPositionFen, undefined);
    assert.equal(verdict.failureDiagnostic, undefined);
  }
});
