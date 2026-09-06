import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import {
  checkLatestCustomSideQuestForProvider,
  checkSubmittedCustomSideQuestForProvider,
} from "../src/lib/custom-side-quests";

const winningQuest = {
  id: "custom-replay-completeness",
  title: "Complete replay only",
  config: JSON.stringify({
    version: 2,
    logic: "all",
    blocks: [{ type: "gameResult", result: "win" }],
  }),
};

async function checkReplay(t: TestContext, pgn: string | undefined, {
  provider = "lichess",
  entry = "submitted",
  gameMode = "live",
  moves = "e2e4 e7e5",
  username = "alice",
  includeWinner = true,
  winner = "white",
  providerStatus = "resign",
  whiteResult = "win",
  blackResult = "resigned",
  questResult = "win",
  endTime = 1788650000,
}: {
  provider?: "lichess" | "chesscom";
  entry?: "latest" | "submitted";
  gameMode?: "live" | "daily";
  moves?: string;
  username?: string;
  includeWinner?: boolean;
  winner?: string;
  providerStatus?: string;
  whiteResult?: string;
  blackResult?: string;
  questResult?: "win" | "draw" | "lose";
  endTime?: unknown;
} = {}) {
  const gameId = provider === "lichess" ? "Replay01" : `https://www.chess.com/game/${gameMode}/123456`;
  const archive = `https://api.chess.com/pub/player/${username}/games/2026/09`;
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    if (provider === "lichess") return Response.json({
      id: gameId, status: providerStatus, winner: includeWinner ? winner : undefined, moves, pgn,
      players: { white: { user: { name: "alice" } }, black: { user: { name: "bob" } } },
    });
    if (String(input).endsWith("/archives")) return Response.json({ archives: [archive] });
    assert.equal(String(input), archive);
    return Response.json({ games: [{
      url: gameId, pgn, end_time: endTime,
      white: { username: "alice", result: whiteResult },
      black: { username: "bob", result: blackResult },
    }] });
  });
  const quest = { ...winningQuest, config: JSON.stringify({
    version: 2, logic: "all", blocks: [{ type: "gameResult", result: questResult }],
  }) };
  const input = { quest, provider, username, gameId };
  return entry === "latest"
    ? checkLatestCustomSideQuestForProvider(input)
    : checkSubmittedCustomSideQuestForProvider(input);
}

for (const entry of ["latest", "submitted"] as const) {
  for (const token of ["e2e4*", "e2e4garbage"]) {
    for (const provider of ["lichess", "chesscom"] as const) {
      test(`${provider} ${entry}: consumes the entire PGN move token ${token}`, async (t) => {
        const result = await checkReplay(t, `1. ${token} e7e5 1-0`, { provider, entry });
        assert.equal(result.status, "pending");
        assert.equal(result.finalPositionFen, undefined);
      });
    }
    test(`lichess ${entry}: consumes the entire missing-PGN move token ${token}`, async (t) => {
      const result = await checkReplay(t, undefined, { entry, moves: `${token} e7e5` });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }
}

for (const entry of ["latest", "submitted"] as const) {
  for (const moves of ["e4 e5", "e2e4 e7e5"]) {
    for (const terminal of ["0-1", "1-0", ""]) {
      test(`lichess ${entry}: missing-PGN terminal agrees with outcome (${moves}, ${terminal || "none"})`, async (t) => {
        const result = await checkReplay(t, undefined, { entry, moves: `${moves} ${terminal}` });
        assert.equal(result.status, terminal === "0-1" ? "pending" : "passed");
        assert.equal(result.lastMoveUci, terminal === "0-1" ? undefined : "e7e5");
        if (terminal === "0-1") {
          assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
          assert.equal(result.finalPositionFen, undefined);
        }
      });
    }
  }
}

for (const entry of ["latest", "submitted"] as const) {
  for (const [provider, invalidOutcome] of [
    ["lichess", "purple"], ["chesscom", "invalid"], ["chesscom", " "],
  ] as const) {
    test(`${provider} ${entry}: unrecognized outcome ${JSON.stringify(invalidOutcome)} cannot pass a lose quest`, async (t) => {
      const result = await checkReplay(t, "1. e4 e5 0-1", {
        provider, entry, winner: invalidOutcome, whiteResult: invalidOutcome, blackResult: "win", questResult: "lose",
      });
      assert.equal(result.status, "pending");
      assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
      assert.equal(result.finalPositionFen, undefined);
      assert.equal(result.failureDiagnostic, undefined);
    });
  }
  for (const [winner, providerStatus, outcome, terminal] of [
    ["white", "resign", "win", "1-0"], ["black", "resign", "lose", "0-1"],
    ["", "draw", "draw", "1/2-1/2"],
  ] as const) {
    test(`lichess ${entry}: recognized outcome ${winner || providerStatus} remains evaluable`, async (t) => {
      const result = await checkReplay(t, `1. e4 e5 ${terminal}`, {
        entry, winner, includeWinner: Boolean(winner), providerStatus, questResult: outcome,
      });
      assert.equal(result.status, "passed");
      assert.equal(result.outcome, outcome);
      assert.equal(result.lastMoveUci, "e7e5");
    });
  }
  for (const [providerStatus, winner] of [
    ["invalid", "white"], ["aborted", "white"], ["draw", "white"],
  ] as const) {
    test(`lichess ${entry}: ${providerStatus} with winner ${winner} stays pending`, async (t) => {
      const result = await checkReplay(t, "1. e4 e5 1-0", {
        entry,
        providerStatus,
        winner,
      });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }
  for (const [outcome, terminal, results] of [
    ["win", "1-0", ["win"]],
    ["lose", "0-1", ["resigned", "timeout", "abandoned", "lose"]],
    ["draw", "1/2-1/2", ["agreed"]],
  ] as const) {
    for (const whiteResult of results) {
      test(`chesscom ${entry}: recognized outcome ${whiteResult} remains evaluable`, async (t) => {
        const result = await checkReplay(t, `1. e4 e5 ${terminal}`, {
          provider: "chesscom", entry, whiteResult, blackResult: outcome === "draw" ? whiteResult : outcome === "win" ? "resigned" : "win", questResult: outcome,
        });
        assert.equal(result.status, "passed");
        assert.equal(result.outcome, outcome);
        assert.equal(result.lastMoveUci, "e7e5");
      });
    }
  }
  for (const blackResult of ["win", "invalid", ""] as const) {
    test(`chesscom ${entry}: white win with black result ${JSON.stringify(blackResult)} stays pending`, async (t) => {
      const result = await checkReplay(t, "1. e4 e5 1-0", {
        provider: "chesscom",
        entry,
        whiteResult: "win",
        blackResult,
      });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }

  for (const [providerStatus, winner, terminal, questResult] of [
    ["mate", "white", "1-0", "win"],
    ["stalemate", "", "1/2-1/2", "draw"],
  ] as const) {
    test(`lichess ${entry}: ${providerStatus} requires a matching final position`, async (t) => {
      const result = await checkReplay(t, `1. e4 e5 ${terminal}`, {
        entry,
        providerStatus,
        winner,
        includeWinner: Boolean(winner),
        questResult,
      });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }

  for (const resultCode of ["checkmated", "stalemate", "repetition", "insufficient", "50move", "timevsinsufficient"] as const) {
    test(`chesscom ${entry}: ${resultCode} requires a matching final position`, async (t) => {
      const decisive = resultCode === "checkmated";
      const result = await checkReplay(t, `1. e4 e5 ${decisive ? "0-1" : "1/2-1/2"}`, {
        provider: "chesscom",
        entry,
        whiteResult: resultCode,
        blackResult: decisive ? "win" : resultCode,
        questResult: decisive ? "lose" : "draw",
      });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }

  test(`lichess ${entry}: actual checkmate remains evaluable`, async (t) => {
    const result = await checkReplay(t, "1. f3 e5 2. g4 Qh4# 0-1", {
      entry,
      moves: "f2f3 e7e5 g2g4 d8h4",
      providerStatus: "mate",
      winner: "black",
      questResult: "lose",
    });
    assert.equal(result.status, "passed");
  });

  test(`lichess ${entry}: actual stalemate remains evaluable`, async (t) => {
    const result = await checkReplay(t, "1. e3 a5 2. Qh5 Ra6 3. Qxa5 h5 4. Qxc7 Rah6 5. h4 f6 6. Qxd7+ Kf7 7. Qxb7 Qd3 8. Qxb8 Qh7 9. Qxc8 Kg6 10. Qe6 1/2-1/2", {
      entry,
      moves: "e2e3 a7a5 d1h5 a8a6 h5a5 h7h5 a5c7 a6h6 h2h4 f7f6 c7d7 e8f7 d7b7 d8d3 b7b8 d3h7 b8c8 f7g6 c8e6",
      providerStatus: "stalemate",
      includeWinner: false,
      questResult: "draw",
    });
    assert.equal(result.status, "passed");
  });

  test(`chesscom ${entry}: actual checkmate remains evaluable`, async (t) => {
    const result = await checkReplay(t, "1. f3 e5 2. g4 Qh4# 0-1", {
      provider: "chesscom",
      entry,
      whiteResult: "checkmated",
      blackResult: "win",
      questResult: "lose",
    });
    assert.equal(result.status, "passed");
  });

  test(`chesscom ${entry}: actual stalemate remains evaluable`, async (t) => {
    const result = await checkReplay(t, "1. e3 a5 2. Qh5 Ra6 3. Qxa5 h5 4. Qxc7 Rah6 5. h4 f6 6. Qxd7+ Kf7 7. Qxb7 Qd3 8. Qxb8 Qh7 9. Qxc8 Kg6 10. Qe6 1/2-1/2", {
      provider: "chesscom",
      entry,
      whiteResult: "stalemate",
      blackResult: "stalemate",
      questResult: "draw",
    });
    assert.equal(result.status, "passed");
  });

  test(`chesscom ${entry}: actual repetition remains evaluable`, async (t) => {
    const result = await checkReplay(t, "1. Nf3 Nf6 2. Ng1 Ng8 3. Nf3 Nf6 4. Ng1 Ng8 1/2-1/2", {
      provider: "chesscom",
      entry,
      whiteResult: "repetition",
      blackResult: "repetition",
      questResult: "draw",
    });
    assert.equal(result.status, "passed");
  });

  test(`lichess ${entry}: checkmate winner must match the checkmating color`, async (t) => {
    const result = await checkReplay(t, "1. f3 e5 2. g4 Qh4# 1-0", {
      entry,
      moves: "f2f3 e7e5 g2g4 d8h4",
      providerStatus: "mate",
      winner: "white",
      questResult: "win",
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  test(`chesscom ${entry}: checkmated result must identify the mated color`, async (t) => {
    const result = await checkReplay(t, "1. f3 e5 2. g4 Qh4# 1-0", {
      provider: "chesscom",
      entry,
      whiteResult: "win",
      blackResult: "checkmated",
      questResult: "win",
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  test(`chesscom ${entry}: contradictory draw reasons stay pending`, async (t) => {
    const result = await checkReplay(t, "1. Nf3 Nf6 2. Ng1 Ng8 3. Nf3 Nf6 4. Ng1 Ng8 1/2-1/2", {
      provider: "chesscom",
      entry,
      whiteResult: "agreed",
      blackResult: "repetition",
      questResult: "draw",
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  test(`lichess ${entry}: resignation cannot override an actual checkmate`, async (t) => {
    const result = await checkReplay(t, "1. f3 e5 2. g4 Qh4# 1-0", {
      entry,
      moves: "f2f3 e7e5 g2g4 d8h4",
      providerStatus: "resign",
      winner: "white",
      questResult: "win",
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  test(`chesscom ${entry}: resignation cannot override an actual checkmate`, async (t) => {
    const result = await checkReplay(t, "1. f3 e5 2. g4 Qh4# 1-0", {
      provider: "chesscom",
      entry,
      whiteResult: "win",
      blackResult: "resigned",
      questResult: "win",
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  const stalematePgn = "1. e3 a5 2. Qh5 Ra6 3. Qxa5 h5 4. Qxc7 Rah6 5. h4 f6 6. Qxd7+ Kf7 7. Qxb7 Qd3 8. Qxb8 Qh7 9. Qxc8 Kg6 10. Qe6 1/2-1/2";
  const stalemateMoves = "e2e3 a7a5 d1h5 a8a6 h5a5 h7h5 a5c7 a6h6 h2h4 f7f6 c7d7 e8f7 d7b7 d8d3 b7b8 d3h7 b8c8 f7g6 c8e6";
  test(`lichess ${entry}: generic draw cannot override an actual stalemate`, async (t) => {
    const result = await checkReplay(t, stalematePgn, {
      entry,
      moves: stalemateMoves,
      providerStatus: "draw",
      includeWinner: false,
      questResult: "draw",
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  test(`chesscom ${entry}: agreed draw cannot override an actual stalemate`, async (t) => {
    const result = await checkReplay(t, stalematePgn, {
      provider: "chesscom",
      entry,
      whiteResult: "agreed",
      blackResult: "agreed",
      questResult: "draw",
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  test(`chesscom ${entry}: timevsinsufficient stays pending when the flagging side is unknown`, async (t) => {
    const result = await checkReplay(t, "b4 f6 d3 Na6 d4 b6 h3 c5 Be3 cxd4 Bf4 d6 g3 Kd7 f3 Nb8 Nd2 g5 Nb3 Bh6 Bc1 Ba6 h4 Bb7 Bf4 gxh4 Bc1 Bd2+ Qxd2 Bxf3 Na5 bxa5 Qf4 axb4 Kf2 Bxe2 Qe4 Bxf1 Qb7+ Qc7 Qc6+ Kc8 Qc5 dxc5 a3 Be2 Bf4 Bd1 g4 Be2 Be3 Bd1 Bf4 Be2 Bh2 bxa3 Re1 Bd1 c3 Bc2 Rf1 a2 Ke2 dxc3 Rc1 Qb6 g5 Qb2 Bf4 Qb1 Nf3 fxg5 Bc7 Bd1+ Rhxd1 Qxc1 Bh2 Qxd1+ Kxd1 c2+ Kd2 Nh6 Ke3 a6 Kd3 Rd8+ Nd4 Ng8 Bg1 cxd4 1/2-1/2", {
      provider: "chesscom",
      entry,
      whiteResult: "timevsinsufficient",
      blackResult: "timevsinsufficient",
      questResult: "draw",
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });
}

test("lichess submitted: same-length PGN and UCI must describe the same moves", async (t) => {
  const result = await checkReplay(t, "1. d4 d5 1-0");
  assert.equal(result.status, "pending");
  assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
});

test("chesscom latest: terminal result must agree with the provider outcome", async (t) => {
  const result = await checkReplay(t, "1. e4 e5 0-1", { provider: "chesscom", entry: "latest" });
  assert.equal(result.status, "pending");
  assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
});

test("lichess submitted: multiple top-level termination markers stay pending", async (t) => {
  const result = await checkReplay(t, "1. e4 e5 1-0 1-0");
  assert.equal(result.status, "pending");
  assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
});

test("lichess submitted: duplicate Result tags stay pending", async (t) => {
  const result = await checkReplay(t, `[Result "1-0"]\n[Result "1-0"]\n\n1. e4 e5 1-0`);
  assert.equal(result.status, "pending");
  assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
});

test("lichess submitted: malformed provider moves cannot disable PGN consistency", async (t) => {
  const result = await checkReplay(t, "1. e4 e5 1-0", { moves: "e2e4 e7e9" });
  assert.equal(result.status, "pending");
  assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
});

test("chesscom submitted: PGN null moves stay pending", async (t) => {
  const result = await checkReplay(t, "1. e4 -- 1-0", { provider: "chesscom" });
  assert.equal(result.status, "pending");
  assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
});

test("lichess submitted: missing PGN cannot admit a legacy SAN null move", async (t) => {
  const result = await checkReplay(t, undefined, { moves: "e4 --" });
  assert.equal(result.status, "pending");
  assert.equal(result.finalPositionFen, undefined);
});

for (const entry of ["latest", "submitted"] as const) {
  for (const token of ["--!", "--+"]) {
    for (const provider of ["lichess", "chesscom"] as const) {
      test(`${provider} ${entry}: decorated null ${token} in PGN stays pending`, async (t) => {
        const result = await checkReplay(t, `1. e4 ${token} 1-0`, { provider, entry, moves: `e4 ${token}` });
        assert.equal(result.status, "pending");
        assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
        assert.equal(result.finalPositionFen, undefined);
      });
    }
    test(`lichess ${entry}: decorated null ${token} without PGN stays pending`, async (t) => {
      const result = await checkReplay(t, undefined, { entry, moves: `e4 ${token}` });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }
  for (const provider of ["lichess", "chesscom"] as const) {
    test(`${provider} ${entry}: ordinary annotations in PGN remain valid`, async (t) => {
      const result = await checkReplay(t, "1. e4! e5?! 1-0", { provider, entry });
      assert.equal(result.status, "passed");
      assert.equal(result.lastMoveSan, "e5");
      assert.equal(result.lastMoveUci, "e7e5");
    });
  }
  test(`lichess ${entry}: ordinary annotations without PGN remain valid`, async (t) => {
    const result = await checkReplay(t, undefined, { entry, moves: "e4! e5?!" });
    assert.equal(result.status, "passed");
    assert.equal(result.lastMoveSan, "e5");
    assert.equal(result.lastMoveUci, "e7e5");
  });
}

test("lichess submitted: a finished replay with unknown provider outcome stays pending", async (t) => {
  const result = await checkReplay(t, "1. e4 e5 1-0", { includeWinner: false });
  assert.equal(result.status, "pending");
  assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
  assert.equal(result.finalPositionFen, undefined);
});

for (const entry of ["latest", "submitted"] as const) {
  for (const [label, pgn, moves] of [
    ["different same-length moves", "1. d4 d5 1-0", "e2e4 e7e5"],
    ["illegal same-length PGN", "1. e4 e4 1-0", "e2e4 e7e5"],
    ["different move order reaching the same position", "1. Nc3 Nc6 2. Nf3 Nf6 1-0", "g1f3 g8f6 b1c3 b8c6"],
  ]) {
    test(`lichess ${entry}: rejects ${label}`, async (t) => {
      const result = await checkReplay(t, pgn, { entry, moves });
      assert.equal(result.status, "pending");
      assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
      assert.equal(result.finalPositionFen, undefined);
    });
  }

  for (const moves of ["e2e4 e7e5", "e4 e5"]) {
    test(`lichess ${entry}: missing PGN with unknown provider outcome stays pending (${moves})`, async (t) => {
      const result = await checkReplay(t, undefined, { entry, moves, includeWinner: false });
      assert.equal(result.status, "pending");
      assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
      assert.equal(result.finalPositionFen, undefined);
      assert.equal(result.failureDiagnostic, undefined);
    });
  }

  test(`lichess ${entry}: missing PGN remains compatible with valid UCI`, async (t) => {
    const result = await checkReplay(t, undefined, { entry });
    assert.equal(result.status, "passed");
    assert.equal(result.lastMoveUci, "e7e5");
    assert.equal(result.lastMoveSan, "e5");
  });

  test(`lichess ${entry}: missing PGN does not allow illegal UCI`, async (t) => {
    const result = await checkReplay(t, undefined, { entry, moves: "e2e4 e7e4" });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  for (const provider of ["lichess", "chesscom"] as const) {
    for (const username of ["alice", "bob"]) {
      for (const terminal of ["0-1", "1/2-1/2"]) {
        test(`${provider} ${entry}: ${username}'s provider outcome contradicts ${terminal}`, async (t) => {
          const result = await checkReplay(t, `1. e4 e5 ${terminal}`, { provider, entry, username });
          assert.equal(result.status, "pending");
          assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
          assert.equal(result.finalPositionFen, undefined);
        });
      }

      test(`${provider} ${entry}: consistent result is evaluated from ${username}'s color`, async (t) => {
        const result = await checkReplay(t, `[Result "1-0"]\n\n1. e4 e5 1-0`, { provider, entry, username });
        assert.equal(result.status, username === "alice" ? "passed" : "failed");
        assert.equal(result.outcome, username === "alice" ? "win" : "lose");
        assert.equal(result.playerColor, username === "alice" ? "white" : "black");
        assert.equal(result.lastMoveUci, "e7e5");
      });
    }

    for (const tag of ["0-1", "1/2-1/2", "*"]) {
      test(`${provider} ${entry}: Result tag ${tag} contradicts terminal 1-0`, async (t) => {
        const result = await checkReplay(t, `[Result "${tag}"]\r\n\r\n1. e4 e5 1-0`, { provider, entry });
        assert.equal(result.status, "pending");
        assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
        assert.equal(result.finalPositionFen, undefined);
      });
    }

    for (const pgn of [
      "1. e4 e5 1-0 1-0",
      "1. e4 e5 0-1 1-0",
      "1. e4 e5 * 1-0",
      "1. e4 1-0 e5 1-0",
      "1. e4 1-0 e5",
      "1. e4 e5 1-0 2.",
      "1. e4 e5 1-0 $1",
      "1. e4 e5 *",
    ]) {
      test(`${provider} ${entry}: rejects invalid termination in ${pgn}`, async (t) => {
        const result = await checkReplay(t, pgn, { provider, entry });
        assert.equal(result.status, "pending");
        assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
        assert.equal(result.finalPositionFen, undefined);
      });
    }

    for (const [label, headers] of [
      ["space", `[Event "Normal" ]`],
      ["tab and Result", `[Event "Normal"\t]\n[Result "1-0" \t]`],
      ["after opening bracket", `[ Event "Normal"]`],
      ["leading tabs and standard tags", `[\tVariant "Standard"]\n[ SetUp "0"]\n[ Result "1-0"]`],
    ]) {
      test(`${provider} ${entry}: legal tag-pair whitespace (${label}) preserves replay`, async (t) => {
        const result = await checkReplay(t, `${headers}\n\n1. e4 e5 1-0`, { provider, entry });
        assert.equal(result.status, "passed");
        assert.equal(result.lastMoveSan, "e5");
        assert.equal(result.lastMoveUci, "e7e5");
        assert.equal(result.finalPositionFen, "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2");
      });
    }

    for (const [label, headers] of [
      ["duplicate", `[Result "1-0" ]\n[Result "1-0"\t]`],
      ["malformed value", `[Result "invalid" ]`],
      ["missing quote", `[Result "1-0 ]`],
      ["extra content", `[Result "1-0" extra ]`],
      ["leading-space duplicate", `[ Result "1-0"]\n[\tResult "1-0"]`],
      ["leading-space malformed value", `[ Result "invalid"]`],
    ]) {
      test(`${provider} ${entry}: tag-pair whitespace cannot admit ${label} Result`, async (t) => {
        const result = await checkReplay(t, `${headers}\n\n1. e4 e5 1-0`, { provider, entry });
        assert.equal(result.status, "pending");
        assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
        assert.equal(result.finalPositionFen, undefined);
      });
    }

    for (const [label, pgn] of [
      ["headerless blank lines", "1. e4\n\ne5 1-0"],
      ["CRLF headers, comments, NAGs and nested variations", `[Event "Normal provider PGN"]\r\n[Result "1-0"]\r\n\r\n1.e4! $1 { ordinary 0-1 } (1. d4 (1. c4 c5) d5 0-1) 1...e5$2 ; { 0-1\r\n1-0 { final comment }`],
    ]) {
      test(`${provider} ${entry}: preserves ${label}`, async (t) => {
        const result = await checkReplay(t, pgn, { provider, entry });
        assert.equal(result.status, "passed");
        assert.equal(result.lastMoveSan, "e5");
        assert.equal(result.lastMoveUci, "e7e5");
        assert.equal(result.finalPositionFen, "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2");
      });
    }
  }
}

for (const entry of ["latest", "submitted"] as const) {
  test(`lichess ${entry}: a legal UCI prefix that disagrees with the complete PGN stays pending`, async (t) => {
    const gameId = "Comple01";
    t.mock.method(globalThis, "fetch", async () => Response.json({
      id: gameId,
      status: "resign",
      winner: "white",
      moves: "e2e4 e7e5",
      pgn: `[Event "Complete replay"]\n\n1. e4 e5 2. Nf3 Nc6 1-0`,
      players: {
        white: { user: { name: "alice" } },
        black: { user: { name: "bob" } },
      },
    }));

    const input = {
      quest: winningQuest,
      provider: "lichess" as const,
      username: "alice",
      gameId,
    };
    const result = entry === "latest"
      ? await checkLatestCustomSideQuestForProvider(input)
      : await checkSubmittedCustomSideQuestForProvider(input);

    assert.equal(result.status, "pending");
    assert.equal(result.gameId, gameId);
    assert.equal(result.finalPositionFen, undefined);
    assert.equal(result.completedGameAt, undefined);
  });

  test(`chesscom ${entry}: a finished record with legally truncated PGN movetext stays pending`, async (t) => {
    const gameId = "https://www.chess.com/game/live/123456";
    const archive = "https://api.chess.com/pub/player/alice/games/2026/09";
    t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
      if (String(input).endsWith("/archives")) return Response.json({ archives: [archive] });
      assert.equal(String(input), archive);
      return Response.json({ games: [{
        url: gameId,
        pgn: `[Event "Truncated replay"]\n\n1. e4 e5`,
        end_time: 1788650000,
        white: { username: "alice", result: "win" },
        black: { username: "bob", result: "resigned" },
      }] });
    });

    const input = {
      quest: winningQuest,
      provider: "chesscom" as const,
      username: "alice",
      gameId,
    };
    const result = entry === "latest"
      ? await checkLatestCustomSideQuestForProvider(input)
      : await checkSubmittedCustomSideQuestForProvider(input);

    assert.equal(result.status, "pending");
    assert.equal(result.gameId, gameId);
    assert.equal(result.finalPositionFen, undefined);
    assert.equal(result.completedGameAt, undefined);
  });
}

test("lichess submitted: a result inside a semicolon comment stays pending", async (t) => {
  const gameId = "Comment1";
  t.mock.method(globalThis, "fetch", async () => Response.json({
    id: gameId,
    status: "resign",
    winner: "white",
    moves: "e2e4 e7e5",
    pgn: "1. e4 ; 1-0",
    players: {
      white: { user: { name: "alice" } },
      black: { user: { name: "bob" } },
    },
  }));

  const result = await checkSubmittedCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "lichess",
    username: "alice",
    gameId,
  });

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, gameId);
  assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
  assert.equal(result.finalPositionFen, undefined);
  assert.equal(result.completedGameAt, undefined);
});

test("lichess submitted: a result inside an unterminated brace comment stays pending", async (t) => {
  const gameId = "OpenBr01";
  t.mock.method(globalThis, "fetch", async () => Response.json({
    id: gameId,
    status: "resign",
    winner: "white",
    moves: "e2e4 e7e5",
    pgn: "1. e4 { 1-0",
    players: {
      white: { user: { name: "alice" } },
      black: { user: { name: "bob" } },
    },
  }));

  const result = await checkSubmittedCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "lichess",
    username: "alice",
    gameId,
  });

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, gameId);
  assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
  assert.equal(result.finalPositionFen, undefined);
  assert.equal(result.completedGameAt, undefined);
});

test("lichess submitted: a headerless annotation cannot hide before a blank line", async (t) => {
  const gameId = "Bypass01";
  t.mock.method(globalThis, "fetch", async () => Response.json({
    id: gameId,
    status: "resign",
    winner: "white",
    moves: "e2e4 e7e5",
    pgn: "1. e4 {\n\n1. e4 e5 1-0",
    players: {
      white: { user: { name: "alice" } },
      black: { user: { name: "bob" } },
    },
  }));

  const result = await checkSubmittedCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "lichess",
    username: "alice",
    gameId,
  });

  assert.equal(result.status, "pending");
  assert.equal(result.gameId, gameId);
  assert.deepEqual(result.evidence, ["Provider replay evidence was incomplete or inconsistent."]);
  assert.equal(result.finalPositionFen, undefined);
  assert.equal(result.completedGameAt, undefined);
});

test("lichess submitted: headerless movetext may contain a blank line", async (t) => {
  const gameId = "Blank001";
  t.mock.method(globalThis, "fetch", async () => Response.json({
    id: gameId,
    status: "resign",
    winner: "white",
    moves: "e2e4 e7e5",
    pgn: "1. e4\n\ne5 1-0",
    players: {
      white: { user: { name: "alice" } },
      black: { user: { name: "bob" } },
    },
  }));

  const result = await checkSubmittedCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "lichess",
    username: "alice",
    gameId,
  });

  assert.equal(result.status, "passed");
  assert.equal(result.gameId, gameId);
  assert.equal(result.finalPositionFen, "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2");
});

test("lichess submitted: a brace inside a semicolon comment preserves complete movetext", async (t) => {
  const gameId = "SemiBr01";
  t.mock.method(globalThis, "fetch", async () => Response.json({
    id: gameId,
    status: "resign",
    winner: "white",
    moves: "e2e4 e7e5",
    pgn: "1. e4 ; {\ne5 { note } 1-0",
    players: {
      white: { user: { name: "alice" } },
      black: { user: { name: "bob" } },
    },
  }));

  const result = await checkSubmittedCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "lichess",
    username: "alice",
    gameId,
  });

  assert.equal(result.status, "passed");
  assert.equal(result.gameId, gameId);
  assert.equal(result.finalPositionFen, "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2");
});

test("lichess submitted: complete PGN with CRLF headers replays successfully", async (t) => {
  const gameId = "CrlfGame";
  t.mock.method(globalThis, "fetch", async () => Response.json({
    id: gameId,
    status: "resign",
    winner: "white",
    moves: "e2e4 e7e5",
    pgn: `[Event "Complete replay"]\r\n[Result "1-0"]\r\n\r\n1. e4 e5 1-0`,
    players: {
      white: { user: { name: "alice" } },
      black: { user: { name: "bob" } },
    },
  }));

  const result = await checkSubmittedCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "lichess",
    username: "alice",
    gameId,
  });

  assert.equal(result.status, "passed");
  assert.equal(result.gameId, gameId);
  assert.equal(result.finalPositionFen, "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2");
});

for (const entry of ["latest", "submitted"] as const) {
  const capturePromotionPgn = "1. h4 a5 2. h5 a4 3. h6 a3 4. hxg7 axb2 5. gxh8 1-0";
  const capturePromotionMoves = "h2h4 a7a5 h4h5 a5a4 h5h6 a4a3 h6g7 a3b2 g7h8n";
  for (const provider of ["lichess", "chesscom"] as const) {
    test(`${provider} ${entry}: omitted SAN capture promotion stays pending`, async (t) => {
      const result = await checkReplay(t, capturePromotionPgn, {
        provider,
        entry,
        moves: capturePromotionMoves,
      });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }

  test(`lichess ${entry}: omitted SAN capture promotion without PGN stays pending`, async (t) => {
    const result = await checkReplay(t, undefined, {
      entry,
      moves: "h4 a5 h5 a4 h6 a3 hxg7 axb2 gxh8",
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  test(`lichess ${entry}: an inapplicable UCI promotion cannot match the PGN`, async (t) => {
    const result = await checkReplay(t, "1. e4 e5 1-0", { entry, moves: "e2e4q e7e5" });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  for (const moves of ["", "   "]) {
    test(`lichess ${entry}: explicit ${moves ? "whitespace" : "empty"} moves cannot be replaced by PGN`, async (t) => {
      const result = await checkReplay(t, "1. e4 e5 1-0", { entry, moves });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }

  test(`lichess ${entry}: a no-PGN move list cannot hide a nonstandard start declaration`, async (t) => {
    const result = await checkReplay(t, undefined, {
      entry,
      moves: `[Variant "Atomic"]\n\n1. e4 e5 1-0`,
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  for (const provider of ["lichess", "chesscom"] as const) {
    test(`${provider} ${entry}: a NAG cannot splice one invalid token into a move`, async (t) => {
      const result = await checkReplay(t, "1. e2$1e4 e5 1-0", { provider, entry });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });

    test(`${provider} ${entry}: compact NAG boundaries preserve adjacent legal moves`, async (t) => {
      const result = await checkReplay(t, "1.e4$1e5 1-0", { provider, entry });
      assert.equal(result.status, "passed");
      assert.equal(result.lastMoveUci, "e7e5");
    });

    test(`${provider} ${entry}: a NAG after termination stays pending`, async (t) => {
      const result = await checkReplay(t, "1. e4 e5 1-0$1", { provider, entry });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });

    test(`${provider} ${entry}: whitespace-only header separation preserves replay`, async (t) => {
      const result = await checkReplay(t, `[Event "Normal"]\n \t\n1. e4 e5 1-0`, { provider, entry });
      assert.equal(result.status, "passed");
      assert.equal(result.lastMoveUci, "e7e5");
    });

    test(`${provider} ${entry}: multiple tag pairs on one line preserve replay`, async (t) => {
      const result = await checkReplay(t, `[Event "Normal"] [Result "1-0"]\n\n1. e4 e5 1-0`, { provider, entry });
      assert.equal(result.status, "passed");
      assert.equal(result.lastMoveUci, "e7e5");
    });

    test(`${provider} ${entry}: duplicate ordinary tags stay pending`, async (t) => {
      const result = await checkReplay(t, `[Event "A"]\n[Event "B"]\n\n1. e4 e5 1-0`, { provider, entry });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });

    test(`${provider} ${entry}: omitted coordinate promotion stays pending`, async (t) => {
      const result = await checkReplay(t, "1. a4 h5 2. a5 h4 3. a6 h3 4. axb7 hxg2 5. b7a8 1-0", {
        provider,
        entry,
        moves: "a2a4 h7h5 a4a5 h5h4 a5a6 h4h3 a6b7 h3g2 b7a8n",
      });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });

    test(`${provider} ${entry}: decorated omitted coordinate promotion stays pending`, async (t) => {
      const result = await checkReplay(t, "1. a4 h5 2. a5 h4 3. a6 h3 4. axb7 hxg2 5. b7a8! 1-0", {
        provider,
        entry,
        moves: "a2a4 h7h5 a4a5 h5h4 a5a6 h4h3 a6b7 h3g2 b7a8n",
      });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });

    for (const [label, pgn] of [
      ["brace comment", `1. e4 { [Variant "Chess960"] } e5 1-0`],
      ["variation", `1. e4 (1. d4 [SetUp "1"] d5) e5 1-0`],
      ["semicolon comment", `1. e4 ; [FEN "not a position"]\ne5 1-0`],
    ]) {
      test(`${provider} ${entry}: context text inside a ${label} is not a start declaration`, async (t) => {
        const result = await checkReplay(t, pgn, { provider, entry });
        assert.equal(result.status, "passed");
        assert.equal(result.lastMoveUci, "e7e5");
      });
    }
  }
}

for (const entry of ["latest", "submitted"] as const) {
  for (const [label, firstMove] of [
    ["contradictory capture", "Ng1xf3"],
    ["false check", "Nf3+"],
    ["false mate", "Nf3#"],
  ] as const) {
    for (const provider of ["lichess", "chesscom"] as const) {
      test(`${provider} ${entry}: ${label} SAN stays pending`, async (t) => {
        const result = await checkReplay(t, `1. ${firstMove} e5 1-0`, {
          provider,
          entry,
          moves: "g1f3 e7e5",
        });
        assert.equal(result.status, "pending");
        assert.equal(result.finalPositionFen, undefined);
      });
    }

    test(`lichess ${entry}: ${label} SAN without PGN stays pending`, async (t) => {
      const result = await checkReplay(t, undefined, {
        entry,
        moves: `${firstMove} e5`,
      });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }
}

for (const entry of ["latest", "submitted"] as const) {
  for (const providerStatus of ["timeout", "outoftime"] as const) {
    test(`lichess ${entry}: ${providerStatus} loser must be the side to move`, async (t) => {
      const result = await checkReplay(t, "1. e4 e5 1-0", {
        entry,
        providerStatus,
        winner: "white",
      });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }

  test(`chesscom ${entry}: timeout loser must be the side to move`, async (t) => {
    const result = await checkReplay(t, "1. e4 e5 1-0", {
      provider: "chesscom",
      entry,
      whiteResult: "win",
      blackResult: "timeout",
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });
}

const postInsufficientMaterialSan = "a4 Nh6 c4 b6 a5 bxa5 Rxa5 Rg8 Rxa7 Rxa7 b4 Ba6 e3 Bxc4 Bxc4 Ra5 bxa5 Qc8 Bxf7+ Nxf7 e4 Nc6 a6 Qxa6 d3 Qxd3 Qxd3 d5 exd5 Nh8 Qxh7 Kd7 Qxg8 e5 dxc6+ Kxc6 Qxg7 Bxg7 Nc3 Kb7 Na2 Ka6 Nc3 c6 Nd1 Nf7 g4 Nh8 h4 Kb7 f3 Ng6 Bf4 Nxh4 Rxh4 exf4 Rh7 Ka8 Rxg7 Kb8 Re7 Ka8 Ra7+ Kxa7 Ke2 c5 g5 Ka8 Nc3 c4 Nd5 Kb7 Nxf4 Ka7 Nfh3 Kb7 Nf2 Kb8 Nd3 cxd3+ Kxd3 Kb7 Ke3 Ka8 Kf4 Kb7 Ne2 Kc8 Ke4 Kd7 Kd4 Kc7 Ke5 Kd7 Kf4 Kc8 Ke3 Kb7 Kf4 Kc7 Ke4 Kd8 g6 Ke7 Ke3 Kd8 Ke4 Ke7 Kd5 Kf6 Kd4 Kxg6 Ke4 Kf6 Kd3 Kg7 f4 Kg6 Kd2 Kh6 Ke1 Kg7 Kf2 Kf6 f5 Kxf5 Nc3 1/2-1/2";
const postInsufficientMaterialUci = "a2a4 g8h6 c2c4 b7b6 a4a5 b6a5 a1a5 h8g8 a5a7 a8a7 b2b4 c8a6 e2e3 a6c4 f1c4 a7a5 b4a5 d8c8 c4f7 h6f7 e3e4 b8c6 a5a6 c8a6 d2d3 a6d3 d1d3 d7d5 e4d5 f7h8 d3h7 e8d7 h7g8 e7e5 d5c6 d7c6 g8g7 f8g7 b1c3 c6b7 c3a2 b7a6 a2c3 c7c6 c3d1 h8f7 g2g4 f7h8 h2h4 a6b7 f2f3 h8g6 c1f4 g6h4 h1h4 e5f4 h4h7 b7a8 h7g7 a8b8 g7e7 b8a8 e7a7 a8a7 e1e2 c6c5 g4g5 a7a8 d1c3 c5c4 c3d5 a8b7 d5f4 b7a7 f4h3 a7b7 h3f2 b7b8 f2d3 c4d3 e2d3 b8b7 d3e3 b7a8 e3f4 a8b7 g1e2 b7c8 f4e4 c8d7 e4d4 d7c7 d4e5 c7d7 e5f4 d7c8 f4e3 c8b7 e3f4 b7c7 f4e4 c7d8 g5g6 d8e7 e4e3 e7d8 e3e4 d8e7 e4d5 e7f6 d5d4 f6g6 d4e4 g6f6 e4d3 f6g7 f3f4 g7g6 d3d2 g6h6 d2e1 h6g7 e1f2 g7f6 f4f5 f6f5 e2c3";

for (const entry of ["latest", "submitted"] as const) {
  for (const provider of ["lichess", "chesscom"] as const) {
    test(`${provider} ${entry}: rejects a legal ply after automatic insufficient-material termination`, async (t) => {
      const result = await checkReplay(t, postInsufficientMaterialSan, {
        provider,
        entry,
        moves: postInsufficientMaterialUci,
        providerStatus: "draw",
        includeWinner: false,
        whiteResult: "insufficient",
        blackResult: "insufficient",
        questResult: "draw",
      });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }
}

for (const entry of ["latest", "submitted"] as const) {
  for (const [label, coordinateMove] of [
    ["false check", "e2e4+"],
    ["false mate", "e2e4#"],
  ] as const) {
    for (const provider of ["lichess", "chesscom"] as const) {
      test(`${provider} ${entry}: coordinate ${label} stays pending`, async (t) => {
        const result = await checkReplay(t, `1. ${coordinateMove} e7e5 1-0`, {
          provider,
          entry,
          moves: "e2e4 e7e5",
        });
        assert.equal(result.status, "pending");
        assert.equal(result.finalPositionFen, undefined);
      });
    }

    test(`lichess ${entry}: coordinate ${label} without PGN stays pending`, async (t) => {
      const result = await checkReplay(t, undefined, {
        entry,
        moves: `${coordinateMove} e7e5`,
      });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }
}

const validTimeVsInsufficientPgn = "a4 Nh6 c4 b6 a5 bxa5 Rxa5 Rg8 Rxa7 Rxa7 b4 Ba6 e3 Bxc4 Bxc4 Ra5 Bxf7+ Kxf7 bxa5 Rh8 e4 Nc6 a6 Qb8 e5 Nxe5 f4 Qxb1 fxe5 Qxc1 Qxc1 c6 Qxc6 dxc6 d4 Kg6 g3 Nf7 Ke2 Nxe5 dxe5 Kh5 e6 g5 Kf2 Bh6 Kf3 Rf8+ Ke2 Rf3 Kxf3 c5 h3 Bf8 g4+ Kg6 Kg2 Bg7 Kf3 Bh8 Ke3 Bd4+ Ke4 Bxg1 Rxg1 c4 a7 h6 Rg3 c3 Rxc3 Kh7 Kd3 h5 gxh5 Kh6 Rc7 Kxh5 Rxe7 Kh6 Rc7 Kg6 Rg7+ Kxg7 Ke4 Kh6 Kd4 Kh7 Kd3 Kh8 Kc2 g4 hxg4 Kg7 1/2-1/2";
const lichessBishopVsRookTimeoutMoves = "Nf3 e5 Nxe5 g5 Nxf7 Kxf7 d3 Ba3 bxa3 d6 Bxg5 Qxg5 g4 Qe5 f3 Qxe2+ Bxe2 Nc6 Qd2 Nge7 Kf2 Ng8 Bd1 Ke6 Kg1 h6 Qxh6+ Rxh6 d4 Nxd4 Kg2 Nxc2 Bxc2 Rxh2+ Rxh2 d5 Nc3 Kd6 Nxd5 Bxg4 Nxc7 Kxc7 Rg1 Bxf3+ Kf1 Kd7 Rxg8 Rxg8 Ba4+ Kd8 Bd1 Bxd1 Kf2 Rg1 Kxg1 b5 Kh1 Kc8 Rb2 Kb8 Rxb5+ Kc7 Kg1 Kd7 Kh2 a6 Kg3 Kc7 Kh4 Kd8 Kg5 a5 Rf5 Kc7 Kh4 a4 Kg3 Kc8 Kh3 Kd8 Rc5 Ke7 Kh4 Bh5 Rc8 Kf6 Kg3 Ke5 Kg2 Kd4 Re8 Kc4 Kg3 Kd3 Kh3 Kd4 Re1 Kc4 Kh4 Kc5 Kg5 Kb6 Kf5 Kc6 Re2 Kb6 Ke5 Kc7 Kd5 Kb7 Kc4 Ka6 Kb4 Kb7 Kxa4 Kb6 Kb4 Kc7 Rc2+ Kd8 Rb2 Ke7 Kc3 Kf7 Kb3 Kf6 Ka4 Kg5 Rd2 Kh6 Rd4 Bd1+ Ka5 Kh7 Ka6 Kg7 a4 Bxa4 Ka5 Kf8 Ka6 Be8 Ka7 Ke7 Kb7 Kf7 Ka7 Kg8 Kb6 Kf8 a4 Bxa4";
const lichessKnightVsQueenTimeoutMoves = "f3 Nf6 f4 Na6 e4 Nxe4 h4 Nxd2 Bxd2 e5 fxe5 Qxh4+ Rxh4 Rb8 Rxh7 d6 exd6 Bf5 Rxg7 Bxc2 Rxf7 Kxf7 Bb4 Bxd6 Nd2 Bxb4 Qxc2 Bxd2+ Kxd2 Rhg8 Nf3 Rxg2+ Bxg2 Kg7 a4 Kg8 Kd1 Ra8 Nd4 b6 Bf3 Rd8 Bc6 Rxd4+ Ke2 Rxa4 Bxa4 Kh8 Re1 c6 b3 Kg8 Kd2 Kf8 Bxc6 b5 Bxb5 Kg8 b4 Kg7 Be8 Kg8 Ke2 Nxb4 Rg1+ Kh8 Ra1 a6 Rxa6 Nxa6 Kd2 Kg8 Kc3 Nb8 Bf7+ Kf8 Bg8 Kxg8";
const chessComBishopVsKnightInsufficientMoves = "h4 b6 Nf3 d5 Nh2 b5 d4 Be6 g4 Bxg4 Nxg4 c6 Rh2 Kd7 Ne5+ Ke6 Nxf7 Kxf7 a3 Qc7 Bd2 Qxh2 Bg5 Qxf2+ Kxf2 e6 Kg2 Kg6 e3 Bxa3 Bxb5 cxb5 Rxa3 b4 Rxa7 Rxa7 e4 dxe4 Qd2 Kh5 Qxb4 Rf7 Qxb8 Rf3 Qa8 e3 Qxf3+ Kg6 Bxe3 e5 dxe5 h6 Bxh6 Kh7 c4 Kg6 Qb7 Kh5 Qxg7 Kxh4 Qxh8 Kh5 Nc3 Kg6 Nd5 Kh5 Kf1 Kg4 b3 Kh4 c5 Kh3 e6 Kh2 Qb2+ Kh3 Ke2 Kg4 Kf2 Kf5 Nc3 Kxe6 Qe2+ Kf6 Qd1 Ke5 Qa1 Kd4 Bf8 Ke5 Qh1 Kf4 Nb5 Kg4 Kg1 Kg5 Qd5+ Kg6 Qd3+ Kf7 Qe4 Kf6 Qh1 Kf5 Na7 Kg5 Kf2 Kf6 b4 Ke5 c6 Kf6 b5 Kf5 Ke1 Kf4 Qf1+ Ke4 Qc4+ Kf5 Kd1 Kf6 Qe6+ Kxe6 b6 Ke5 Ke2 Ke6 Ke1 Ke5 Ke2 Ke4 Ke1 Kd3 Kf2 Nh6 Be7 Kc2 Nc8 Kd3 Kf3 Kc4 Kg2 Nf7 Kh1 Kd5 Kg2 Kxc6 Kh2 Kb7 Kh3 Kxc8 Kg3 Kb7 Kf4 Kxb6";
const chessComTwoKnightsVsKingInsufficientMoves = "e4 g6 Ke2 Bg7 b3 Bxa1 b4 f6 g4 Bd4 h3 Bxf2 Kxf2 Na6 Bxa6 bxa6 Rh2 h6 Kf3 Kf8 Kg3 a5 bxa5 Kf7 Kg2 Bb7 a4 Bxe4+ Nf3 Bxc2 Qxc2 f5 gxf5 gxf5 Qxc7 Qxc7 Ba3 Qc1 Bxe7 Qc5 Bxc5 Ke6 Bxa7 Rxa7 d4 Rxa5 Kf1 Rxa4 Rg2 Rxd4 Rxg8 Rxg8 Kf2 Ke7 Nxd4 Ra8 Kf1 Ra3 Ke1 Rxh3 Nxf5+ Kf6 Nxh6 Kg6 Ng8 Rh4 Kd2 Ra4 Kc3 Kg5 Kb2 Rh4 Ka2 Rg4 Kb3 Re4 Kb2 Rd4 Kc3 Rd3+ Kxd3 Kf4 Kd4 d6 Kd5 Kg5 Kxd6";
const fivefoldReplay = Array(4).fill("Nf3 Nf6 Ng1 Ng8").join(" ");
const hundredHalfmoveReplayWithExtra = "e4 e5 Na3 Nf6 Bd3 Bd6 Qh5 Rg8 Ke2 Nc6 Qg4 Nd4+ Kd1 Rf8 Qg6 Nc6 Ba6 Bb4 Bf1 Nd5 Qe6+ Nce7 Nf3 Ne3+ Ke1 Ng4 Ng5 Rh8 Ke2 Rg8 Qb6 Bc5 Kf3 Nh6 Rb1 Nc6 Ra1 Na5 Bc4 Nf5 Qa6 Qe7 Qf6 Bb4 Rf1 Nd4+ Ke3 Nf5+ Kf3 Ne3 Qd6 Bc3 Ba6 Nf5 Re1 Rb8 Qd3 Qf6 Qd6 Ne3+ Ke2 Bd4 Nh3 Qf3+ Kd3 Qd1 Qc6 Nac4 Qh6 Nd6 Rb1 Kd8 Qh4+ Ke8 Qg4 Rf8 Ng5 Ke7 Qf4 Kd8 Qf3 Bb6 Re2 Qe1 Ne6+ Ke7 Nc5 Qf1 Ne6 Ra8 Qf4 Ne8 Nc4 Ng4 Qe3 Bc5 Kc3 Bb4+ Kd3 Ba3 Na5 Nd6 Kc3";
const hundredHalfmoveReplay = hundredHalfmoveReplayWithExtra.split(" ").slice(0, -1).join(" ");
const chessComMinorVsPawnPgns = [
  ["bishop", "f3 a6 Kf2 e5 Kg3 Qf6 h3 Qxf3+ exf3 b6 Bxa6 Bxa6 Kh2 h5 Kg3 g6 Ne2 Bxe2 Qxe2 Rh6 Qxe5+ Ne7 Qxe7+ Kxe7 a4 Nc6 Na3 Rb8 Rh2 d5 c3 Ne5 Rb1 Nxf3 Kxf3 h4 Rh1 d4 cxd4 Kf6 d3 Bxa3 Bxh6 Bxb2 Rxb2 Kf5 Rxb6 Rxb6 Kf2 Rb4 Be3 Rxa4 Rh2 Rxd4 g3 Rxd3 gxh4 Rb3 Ke1 c6 Re2 Rb6 Bc5 Rb5 Bf2 Kf4 Bb6 Rb4 Bf2 Rd4 Bxd4 Kf5 Bf6 g5 hxg5 Kf4 Rc2 c5 Rxc5 Ke4 Bh8 Ke3 Kd1 Kf4 Rd5 f6 Rd3 fxg5 Kc2 Kf5 Rd4 Ke6 Rd7 Kxd7 Ba1 Kd8 Bg7 Kc7 Bh8 Kc6 Kc1 Kd5 Kc2 g4 Kd3 gxh3 Bc3"],
  ["knight", "b3 Nh6 a3 Ng8 e4 f6 Bb2 a5 Ra2 Nh6 Bxf6 a4 Nh3 exf6 Qg4 Nf7 Qxg7 Qe7 Qxh7 Nh6 Qxe7+ Kxe7 bxa4 Rxa4 Bc4 Rxc4 Ra1 Kd8 Ng5 Rxe4+ Nxe4 Bxa3 Rxa3 Rf8 Nd6 cxd6 Re3 d5 c3 Nc6 Rf1 Nf7 d3 Ng5 Na3 Ne5 Rxe5 fxe5 f3 Re8 c4 Nxf3+ Rxf3 dxc4 Nc2 cxd3 Rh3 b6 Rxd3 Bb7 Rxd7+ Kxd7 g4 Bc8 Kd2 Rd8 Na1 Ke6+ Kc1 e4 h3 Kd7 g5 Kd6 Kd1 Bxh3 Kc2 Ke5 Kc3 Kf4 g6 Kg3 Nc2 Rd1 Ne3 Kf3 Kb3 Bf1 Ka4 b5+ Ka5 Rd5 Nxf1 Rd1 Kxb5 Re1 Ka5 Rb1 Ng3 Rb4 Kxb4 Kg4 Nf1 Kf3 Ne3 Kf4 Ka4 Kg5 Kb3 Kxg6 Nf1"],
] as const;

for (const entry of ["latest", "submitted"] as const) {
  test(`lichess ${entry}: winnerless timeout against a lone king remains a draw`, async (t) => {
    const result = await checkReplay(t, validTimeVsInsufficientPgn, {
      entry,
      moves: validTimeVsInsufficientPgn.replace(/\s+1\/2-1\/2$/, ""),
      providerStatus: "outoftime",
      includeWinner: false,
      questResult: "draw",
    });
    assert.equal(result.status, "passed");
    assert.equal(result.outcome, "draw");
  });

  test(`lichess ${entry}: bishop versus rook is insufficient on timeout`, async (t) => {
    const result = await checkReplay(t, `${lichessBishopVsRookTimeoutMoves} 1/2-1/2`, {
      entry,
      moves: lichessBishopVsRookTimeoutMoves,
      providerStatus: "outoftime",
      includeWinner: false,
      questResult: "draw",
    });
    assert.equal(result.status, "passed");
    assert.equal(result.outcome, "draw");
  });

  test(`lichess ${entry}: bishop versus rook cannot become a timeout win`, async (t) => {
    const result = await checkReplay(t, `${lichessBishopVsRookTimeoutMoves} 0-1`, {
      entry,
      moves: lichessBishopVsRookTimeoutMoves,
      providerStatus: "outoftime",
      winner: "black",
      questResult: "lose",
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  test(`lichess ${entry}: knight versus queen is insufficient on timeout`, async (t) => {
    const result = await checkReplay(t, `${lichessKnightVsQueenTimeoutMoves} 1/2-1/2`, {
      entry,
      moves: lichessKnightVsQueenTimeoutMoves,
      providerStatus: "outoftime",
      includeWinner: false,
      questResult: "draw",
    });
    assert.equal(result.status, "passed");
    assert.equal(result.outcome, "draw");
  });

  test(`lichess ${entry}: knight versus queen cannot become a timeout win`, async (t) => {
    const result = await checkReplay(t, `${lichessKnightVsQueenTimeoutMoves} 0-1`, {
      entry,
      moves: lichessKnightVsQueenTimeoutMoves,
      providerStatus: "outoftime",
      winner: "black",
      questResult: "lose",
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  for (const [label, moves] of [
    ["fivefold repetition", fivefoldReplay],
    ["100-halfmove draw", hundredHalfmoveReplay],
  ] as const) {
    for (const provider of ["lichess", "chesscom"] as const) {
      test(`${provider} ${entry}: ${label} cannot be reported as a decisive result`, async (t) => {
        const result = await checkReplay(t, `${moves} 1-0`, {
          provider,
          entry,
          moves,
          providerStatus: "resign",
          winner: "white",
        });
        assert.equal(result.status, "pending");
        assert.equal(result.finalPositionFen, undefined);
      });
    }
  }

  for (const [label, moves, chessComResult] of [
    ["fivefold repetition", fivefoldReplay, "repetition"],
    ["100-halfmove draw", hundredHalfmoveReplay, "50move"],
  ] as const) {
    for (const provider of ["lichess", "chesscom"] as const) {
      test(`${provider} ${entry}: automatic ${label} remains a draw`, async (t) => {
        const result = await checkReplay(t, `${moves} 1/2-1/2`, {
          provider,
          entry,
          moves,
          providerStatus: "draw",
          includeWinner: false,
          whiteResult: chessComResult,
          blackResult: chessComResult,
          questResult: "draw",
        });
        assert.equal(result.status, "passed");
        assert.equal(result.outcome, "draw");
      });
    }
  }

  for (const [label, moves] of [
    ["fivefold repetition", `${fivefoldReplay} e4`],
    ["100-halfmove draw", hundredHalfmoveReplayWithExtra],
  ] as const) {
    for (const provider of ["lichess", "chesscom"] as const) {
      test(`${provider} ${entry}: rejects a legal ply after automatic ${label}`, async (t) => {
        const result = await checkReplay(t, `${moves} 1-0`, {
          provider,
          entry,
          moves,
          providerStatus: "resign",
          winner: "white",
        });
        assert.equal(result.status, "pending");
        assert.equal(result.finalPositionFen, undefined);
      });
    }
  }

  test(`chesscom ${entry}: genuine timeout against a lone king remains evaluable`, async (t) => {
    const result = await checkReplay(t, validTimeVsInsufficientPgn, {
      provider: "chesscom",
      entry,
      whiteResult: "timevsinsufficient",
      blackResult: "timevsinsufficient",
      questResult: "draw",
    });
    assert.equal(result.status, "passed");
    assert.equal(result.outcome, "draw");
  });

  test(`chesscom ${entry}: bishop versus knight is automatic insufficient material`, async (t) => {
    const result = await checkReplay(t, `${chessComBishopVsKnightInsufficientMoves} 1/2-1/2`, {
      provider: "chesscom",
      entry,
      whiteResult: "insufficient",
      blackResult: "insufficient",
      questResult: "draw",
    });
    assert.equal(result.status, "passed");
    assert.equal(result.outcome, "draw");
  });

  test(`chesscom ${entry}: rejects a ply after bishop-versus-knight termination`, async (t) => {
    const result = await checkReplay(t, `${chessComBishopVsKnightInsufficientMoves} Bd8+ 1/2-1/2`, {
      provider: "chesscom",
      entry,
      whiteResult: "insufficient",
      blackResult: "insufficient",
      questResult: "draw",
    });
    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });

  test(`chesscom ${entry}: two knights versus a lone king is automatic insufficient material`, async (t) => {
    const result = await checkReplay(t, `${chessComTwoKnightsVsKingInsufficientMoves} 1/2-1/2`, {
      provider: "chesscom",
      entry,
      whiteResult: "insufficient",
      blackResult: "insufficient",
      questResult: "draw",
    });
    assert.equal(result.status, "passed");
    assert.equal(result.outcome, "draw");
  });

  for (const [piece, moves] of chessComMinorVsPawnPgns) {
    test(`lichess ${entry}: ${piece} versus pawn remains a decisive timeout`, async (t) => {
      const result = await checkReplay(t, `${moves} 1-0`, {
        entry,
        moves,
        providerStatus: "outoftime",
        winner: "white",
        questResult: "win",
      });
      assert.equal(result.status, "passed");
      assert.equal(result.outcome, "win");
    });

    test(`chesscom ${entry}: timeout against king and ${piece} is a valid insufficient-material draw`, async (t) => {
      const result = await checkReplay(t, `${moves} 1/2-1/2`, {
        provider: "chesscom",
        entry,
        whiteResult: "timevsinsufficient",
        blackResult: "timevsinsufficient",
        questResult: "draw",
      });
      assert.equal(result.status, "passed");
      assert.equal(result.outcome, "draw");
    });

    test(`chesscom ${entry}: king and ${piece} cannot turn the same timeout into a win`, async (t) => {
      const result = await checkReplay(t, `${moves} 1-0`, {
        provider: "chesscom",
        entry,
        whiteResult: "win",
        blackResult: "timeout",
        questResult: "win",
      });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }

  for (const provider of ["lichess", "chesscom"] as const) {
    test(`${provider} ${entry}: decisive timeout requires mating material for the winner`, async (t) => {
      const decisivePgn = validTimeVsInsufficientPgn.replace(/1\/2-1\/2$/, "0-1");
      const result = await checkReplay(t, decisivePgn, {
        provider,
        entry,
        moves: decisivePgn.replace(/\s+0-1$/, ""),
        providerStatus: "timeout",
        winner: "black",
        whiteResult: "timeout",
        blackResult: "win",
        questResult: "lose",
      });
      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }
}

test("chesscom submitted: Daily can end by resignation after 100 halfmoves", async (t) => {
  const result = await checkReplay(t, `${hundredHalfmoveReplayWithExtra} 1-0`, {
    provider: "chesscom",
    entry: "submitted",
    gameMode: "daily",
    whiteResult: "win",
    blackResult: "resigned",
  });

  assert.equal(result.status, "passed");
  assert.equal(result.outcome, "win");
});

test("chesscom latest: Daily can end by resignation after 100 halfmoves", async (t) => {
  const result = await checkReplay(t, `${hundredHalfmoveReplayWithExtra} 1-0`, {
    provider: "chesscom",
    entry: "latest",
    gameMode: "daily",
    whiteResult: "win",
    blackResult: "resigned",
  });

  assert.equal(result.status, "passed");
  assert.equal(result.outcome, "win");
});

test("lichess latest and submitted: winnerless timeout abandonment remains a draw with mating material", async (t) => {
  for (const entry of ["latest", "submitted"] as const) {
    const result = await checkReplay(t, "1. e4 e5 1/2-1/2", {
      entry,
      providerStatus: "timeout",
      includeWinner: false,
      questResult: "draw",
    });

    assert.equal(result.status, "passed");
    assert.equal(result.outcome, "draw");
    t.mock.reset();
  }
});

test("chesscom latest: an unusable newest owned game cannot fall back to an older win", async (t) => {
  const newerArchive = "https://api.chess.com/pub/player/alice/games/2026/09";
  const olderArchive = "https://api.chess.com/pub/player/alice/games/2026/08";
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url.endsWith("/archives")) return Response.json({ archives: [olderArchive, newerArchive] });
    if (url === newerArchive) return Response.json({ games: [{
      url: "https://www.chess.com/game/archive/999999",
      pgn: "1. e4 e5 1-0",
      end_time: 1788650000,
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    if (url === olderArchive) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "1. e4 e5 1-0",
      end_time: 1786058000,
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Unexpected URL: ${url}`);
  });

  const result = await checkLatestCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "chesscom",
    username: "alice",
  });

  assert.equal(result.status, "pending");
  assert.deepEqual(requested, [
    "https://api.chess.com/pub/player/alice/games/archives",
    newerArchive,
  ]);
});

const sameColorBishopsPgn = "1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. g3 Ba6 5. b3 b5 6. cxb5 Bxb5 7. Bg2 d5 8. O-O Bd6 9. Nc3 Ba6 10. Re1 O-O 11. Qc2 Nbd7 12. e4 dxe4 13. Nxe4 Bb7 14. Nfg5 Rb8 15. d5 exd5 16. Nxf6+ Nxf6 17. Bb2 Ne4 18. Nxe4 dxe4 19. Bxe4 Bxe4 20. Rxe4 Qd7 21. Rae1 Rfe8 22. Qc3 Bf8 23. Qe3 Rxe4 24. Qxe4 c5 25. Bc3 h6 26. h4 a6 27. Re2 Qb5 28. Re3 Rd8 29. Qg4 Qc6 30. Qe2 Qb5 31. Kh2 Qc6 32. Re4 Qb5 33. Bd2 Qc6 34. Rc4 Rd5 35. Be3 Qb5 36. Qc2 h5 37. Qe4 Qd7 38. Ra4 Qc6 39. Ra5 Rd6 40. Qxc6 Rxc6 41. Kg2 f6 42. Kf3 Kf7 43. Ra4 Be7 44. Rc4 Ke6 45. g4 hxg4+ 46. Rxg4 f5 47. Rxg7 Bxh4 48. Kf4 Kf6 49. Rg8 c4 50. Bd4+ Kf7 51. Rg7+ Kf8 52. Rh7 Be7 53. Rh3 Bb4 54. Bc3 Bc5 55. b4 Bxf2 56. Kxf5 Ke8 57. Ke5 Kd7 58. Kd5 Rd6+ 59. Kxc4 Kc6 60. Rf3 Bb6 61. a4 Rd7 62. Be5 Kb7 63. Rg3 Bc7 64. Rg7 Rxg7 65. Bxg7 Bd6 66. b5 axb5+ 67. axb5 Bc7 68. b6 Kc6 69. b7 Bd8 70. b8=B 1-0";

for (const entry of ["latest", "submitted"] as const) {
  test(`chesscom ${entry}: same-color promoted bishops cannot support a decisive result`, async (t) => {
    const result = await checkReplay(t, sameColorBishopsPgn, {
      provider: "chesscom",
      entry,
      whiteResult: "win",
      blackResult: "resigned",
    });

    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });
}

test("chesscom latest: an unavailable newest archive cannot fall back to an older win", async (t) => {
  const newerArchive = "https://api.chess.com/pub/player/alice/games/2026/09";
  const olderArchive = "https://api.chess.com/pub/player/alice/games/2026/08";
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url.endsWith("/archives")) return Response.json({ archives: [olderArchive, newerArchive] });
    if (url === newerArchive) return new Response("temporarily unavailable", { status: 503 });
    if (url === olderArchive) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "1. e4 e5 1-0",
      end_time: 1786058000,
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Unexpected URL: ${url}`);
  });

  const result = await checkLatestCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "chesscom",
    username: "alice",
  });

  assert.equal(result.status, "pending");
  assert.deepEqual(requested, [
    "https://api.chess.com/pub/player/alice/games/archives",
    newerArchive,
  ]);
});

test("chesscom latest: an incomplete newest archive cannot fall back to an older win", async (t) => {
  const newerArchive = "https://api.chess.com/pub/player/alice/games/2026/09";
  const olderArchive = "https://api.chess.com/pub/player/alice/games/2026/08";
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url.endsWith("/archives")) return Response.json({ archives: [olderArchive, newerArchive] });
    if (url === newerArchive) return Response.json({ unexpected: [] });
    if (url === olderArchive) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "1. e4 e5 1-0",
      end_time: 1786058000,
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Unexpected URL: ${url}`);
  });

  const result = await checkLatestCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "chesscom",
    username: "alice",
  });

  assert.equal(result.status, "pending");
  assert.deepEqual(requested, [
    "https://api.chess.com/pub/player/alice/games/archives",
    newerArchive,
  ]);
});

test("lichess submitted: binds response identity to the requested supported ID form", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const requestedId = decodeURIComponent(String(input).split("/").at(-1) ?? "");
    return Response.json({
      id: requestedId === "Replay01abcd" ? "Replay01" : "Other001",
      status: "resign",
      winner: "white",
      moves: "e2e4 e7e5",
      pgn: "1. e4 e5 1-0",
      players: {
        white: { user: { name: "alice" } },
        black: { user: { name: "bob" } },
      },
    });
  });

  const input = {
    quest: winningQuest,
    provider: "lichess" as const,
    username: "alice",
  };
  const mismatched = await checkSubmittedCustomSideQuestForProvider({ ...input, gameId: "Replay01" });
  const matchingFullId = await checkSubmittedCustomSideQuestForProvider({ ...input, gameId: "Replay01abcd" });

  assert.equal(mismatched.status, "pending");
  assert.equal(mismatched.finalPositionFen, undefined);
  assert.equal(matchingFullId.status, "passed");
  assert.equal(matchingFullId.gameId, "Replay01");
});

test("chesscom latest: a malformed newest record cannot fall back within its archive", async (t) => {
  const archive = "https://api.chess.com/pub/player/alice/games/2026/09";
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    if (String(input).endsWith("/archives")) return Response.json({ archives: [archive] });
    assert.equal(String(input), archive);
    return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "1. e4 e5 1-0",
      end_time: 1786058000,
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }, {}] });
  });

  const result = await checkLatestCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "chesscom",
    username: "alice",
  });

  assert.equal(result.status, "pending");
  assert.equal(result.finalPositionFen, undefined);
});

test("chesscom latest: a null newest record cannot fall back to an older archive", async (t) => {
  const newerArchive = "https://api.chess.com/pub/player/alice/games/2026/09";
  const olderArchive = "https://api.chess.com/pub/player/alice/games/2026/08";
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url.endsWith("/archives")) return Response.json({ archives: [olderArchive, newerArchive] });
    if (url === newerArchive) return Response.json({ games: [null] });
    if (url === olderArchive) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "1. e4 e5 1-0",
      end_time: 1786058000,
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Unexpected URL: ${url}`);
  });

  const result = await checkLatestCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "chesscom",
    username: "alice",
  });

  assert.equal(result.status, "pending");
  assert.deepEqual(requested, [
    "https://api.chess.com/pub/player/alice/games/archives",
    newerArchive,
  ]);
});

test("chesscom latest: an unowned newest archive cannot expose an older win", async (t) => {
  const newestUnownedArchive = "https://api.chess.com/pub/player/mallory/games/2026/09";
  const olderArchive = "https://api.chess.com/pub/player/alice/games/2026/08";
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url.endsWith("/archives")) return Response.json({ archives: [olderArchive, newestUnownedArchive] });
    if (url === olderArchive) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "1. e4 e5 1-0",
      end_time: 1786058000,
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Rejected archive was fetched: ${url}`);
  });

  const result = await checkLatestCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "chesscom",
    username: "alice",
  });

  assert.equal(result.status, "pending");
  assert.deepEqual(requested, ["https://api.chess.com/pub/player/alice/games/archives"]);
});

test("lichess latest: requires an eight-character provider game identity", async (t) => {
  const providerIds = [undefined, "bad"];
  let call = 0;
  t.mock.method(globalThis, "fetch", async () => Response.json({
    id: providerIds[call++],
    status: "resign",
    winner: "white",
    moves: "e4 e5",
    players: {
      white: { user: { name: "alice" } },
      black: { user: { name: "bob" } },
    },
  }));

  for (const providerId of providerIds) {
    const result = await checkLatestCustomSideQuestForProvider({
      quest: winningQuest,
      provider: "lichess",
      username: "alice",
    });
    assert.equal(result.status, "pending", `provider id ${String(providerId)}`);
    assert.equal(result.finalPositionFen, undefined);
  }
});

for (const entry of ["latest", "submitted"] as const) {
  for (const provider of ["lichess", "chesscom"] as const) {
    test(`${provider} ${entry}: PGN players must match the provider record`, async (t) => {
      const result = await checkReplay(t, `[White "mallory"]\n[Black "eve"]\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
        provider,
        entry,
      });

      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }
}

for (const entry of ["latest", "submitted"] as const) {
  for (const provider of ["lichess", "chesscom"] as const) {
    test(`${provider} ${entry}: PGN game identity must match the provider record`, async (t) => {
      const identityTag = provider === "lichess"
        ? `[Site "https://lichess.org/Other001"]`
        : `[Link "https://www.chess.com/game/live/999999"]`;
      const result = await checkReplay(t, `${identityTag}\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
        provider,
        entry,
      });

      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });

    test(`${provider} ${entry}: protocol-relative PGN identity cannot bypass matching`, async (t) => {
      const identityTag = provider === "lichess"
        ? `[Site "//lichess.org/Other001"]`
        : `[Link "//www.chess.com/game/live/999999"]`;
      const result = await checkReplay(t, `${identityTag}\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
        provider,
        entry,
      });

      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });

    test(`${provider} ${entry}: whitespace-padded PGN identity cannot bypass matching`, async (t) => {
      const identityTag = provider === "lichess"
        ? `[Site " https://lichess.org/Replay01"]`
        : `[Site " Chess.com "]`;
      const result = await checkReplay(t, `${identityTag}\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
        provider,
        entry,
      });

      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });

    test(`${provider} ${entry}: PGN identity query cannot impersonate the provider game`, async (t) => {
      const identityTag = provider === "lichess"
        ? `[Site "https://lichess.org/Replay01?other=1"]`
        : `[Link "https://www.chess.com/game/live/123456?other=1"]`;
      const result = await checkReplay(t, `${identityTag}\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
        provider,
        entry,
      });

      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });

    for (const suffix of ["?", "#"] as const) {
      test(`${provider} ${entry}: bare ${suffix} cannot decorate a matching PGN identity`, async (t) => {
        const identityTag = provider === "lichess"
          ? `[Site "https://lichess.org/Replay01${suffix}"]`
          : `[Link "https://www.chess.com/game/live/123456${suffix}"]`;
        const result = await checkReplay(t, `${identityTag}\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
          provider,
          entry,
        });

        assert.equal(result.status, "pending");
        assert.equal(result.finalPositionFen, undefined);
      });
    }

    if (provider === "chesscom") {
      test(`chesscom ${entry}: insecure PGN identity URL cannot impersonate the provider game`, async (t) => {
        const result = await checkReplay(t, `[Link "http://www.chess.com/game/live/123456"]\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
          provider,
          entry,
        });

        assert.equal(result.status, "pending");
        assert.equal(result.finalPositionFen, undefined);
      });
    }

    if (provider === "lichess") {
      test(`lichess ${entry}: PGN identity path suffix cannot impersonate the provider game`, async (t) => {
        const result = await checkReplay(t, `[Site "https://lichess.org/Replay01/black"]\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
          provider,
          entry,
        });

        assert.equal(result.status, "pending");
        assert.equal(result.finalPositionFen, undefined);
      });

      test(`lichess ${entry}: dot segments cannot normalize into a matching PGN identity`, async (t) => {
        const result = await checkReplay(t, `[Site "https://lichess.org/Other001/../Replay01"]\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
          provider,
          entry,
        });

        assert.equal(result.status, "pending");
        assert.equal(result.finalPositionFen, undefined);
      });

      test(`lichess ${entry}: PGN identity on a nonstandard port cannot impersonate the provider game`, async (t) => {
        const result = await checkReplay(t, `[Site "https://lichess.org:444/Replay01"]\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
          provider,
          entry,
        });

        assert.equal(result.status, "pending");
        assert.equal(result.finalPositionFen, undefined);
      });

      test(`lichess ${entry}: credential-bearing PGN identity cannot impersonate the provider game`, async (t) => {
        const result = await checkReplay(t, `[Site "https://other@lichess.org/Replay01"]\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
          provider,
          entry,
        });

        assert.equal(result.status, "pending");
        assert.equal(result.finalPositionFen, undefined);
      });
    }
  }
}

for (const entry of ["latest", "submitted"] as const) {
  for (const provider of ["lichess", "chesscom"] as const) {
    test(`${provider} ${entry}: PGN termination must match provider evidence`, async (t) => {
      const termination = provider === "lichess" ? "Time forfeit" : "eve won by checkmate";
      const result = await checkReplay(t, `[Termination "${termination}"]\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
        provider,
        entry,
      });

      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }
}

for (const entry of ["latest", "submitted"] as const) {
  for (const provider of ["lichess", "chesscom"] as const) {
    test(`${provider} ${entry}: PlyCount must equal the canonical replay length`, async (t) => {
      const result = await checkReplay(t, `[PlyCount "4"]\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
        provider,
        entry,
      });

      assert.equal(result.status, "pending");
      assert.equal(result.finalPositionFen, undefined);
    });
  }
}

for (const entry of ["latest", "submitted"] as const) {
  test(`chesscom ${entry}: malformed completion timestamps cannot finish a game`, async (t) => {
    const result = await checkReplay(t, "1. e4 e5 1-0", {
      provider: "chesscom",
      entry,
      endTime: true,
    });

    assert.equal(result.status, "pending");
    assert.equal(result.completedGameAt, undefined);
    assert.equal(result.finalPositionFen, undefined);
  });
}

for (const entry of ["latest", "submitted"] as const) {
  test(`chesscom ${entry}: PGN termination winner must match the provider winner`, async (t) => {
    const result = await checkReplay(t, `[Termination "eve won by resignation"]\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
      provider: "chesscom",
      entry,
    });

    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });
}

for (const entry of ["latest", "submitted"] as const) {
  for (const provider of ["lichess", "chesscom"] as const) {
    test(`${provider} ${entry}: matching PGN metadata remains evaluable`, async (t) => {
      const headers = provider === "lichess"
        ? `[Site "https://lichess.org/Replay01"]\n[White "Alice"]\n[Black "Bob"]\n[Termination "Normal"]`
        : `[Site "Chess.com"]\n[Link "https://www.chess.com/game/live/123456"]\n[White "Alice"]\n[Black "Bob"]\n[Termination "Alice won by resignation"]`;
      const result = await checkReplay(t, `${headers}\n[PlyCount "2"]\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
        provider,
        entry,
      });

      assert.equal(result.status, "passed");
      assert.equal(result.lastMoveUci, "e7e5");
    });
  }
}

test("chesscom latest: a truly empty newest archive can continue to the older game", async (t) => {
  const newerArchive = "https://api.chess.com/pub/player/alice/games/2026/09";
  const olderArchive = "https://api.chess.com/pub/player/alice/games/2026/08";
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url.endsWith("/archives")) return Response.json({ archives: [olderArchive, newerArchive] });
    if (url === newerArchive) return Response.json({ games: [] });
    if (url === olderArchive) return Response.json({ games: [{
      url: "https://www.chess.com/game/live/123456",
      pgn: "1. e4 e5 1-0",
      end_time: 1786058000,
      white: { username: "alice", result: "win" },
      black: { username: "bob", result: "resigned" },
    }] });
    throw new Error(`Unexpected URL: ${url}`);
  });

  const result = await checkLatestCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "chesscom",
    username: "alice",
  });

  assert.equal(result.status, "passed");
  assert.deepEqual(requested, [
    "https://api.chess.com/pub/player/alice/games/archives",
    newerArchive,
    olderArchive,
  ]);
});

test("chesscom latest: an invalid-host newest archive is rejected without a fetch", async (t) => {
  const olderArchive = "https://api.chess.com/pub/player/alice/games/2026/08";
  const invalidArchive = "https://example.test/pub/player/alice/games/2026/09";
  const requested: string[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    requested.push(url);
    if (url.endsWith("/archives")) return Response.json({ archives: [olderArchive, invalidArchive] });
    throw new Error(`Rejected archive was fetched: ${url}`);
  });

  const result = await checkLatestCustomSideQuestForProvider({
    quest: winningQuest,
    provider: "chesscom",
    username: "alice",
  });

  assert.equal(result.status, "pending");
  assert.deepEqual(requested, ["https://api.chess.com/pub/player/alice/games/archives"]);
});

for (const entry of ["latest", "submitted"] as const) {
  test(`chesscom ${entry}: extended PGN termination text is rejected`, async (t) => {
    const result = await checkReplay(t, `[Termination "Alice won by resignation later"]\n[Result "1-0"]\n\n1. e4 e5 1-0`, {
      provider: "chesscom",
      entry,
    });

    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });
}

for (const entry of ["latest", "submitted"] as const) {
  test(`chesscom ${entry}: a non-array archive index fails closed`, async (t) => {
    t.mock.method(globalThis, "fetch", async () => Response.json({ archives: "not-an-array" }));
    const input = {
      quest: winningQuest,
      provider: "chesscom" as const,
      username: "alice",
      gameId: "https://www.chess.com/game/live/123456",
    };
    const result = entry === "latest"
      ? await checkLatestCustomSideQuestForProvider(input)
      : await checkSubmittedCustomSideQuestForProvider(input);

    assert.equal(result.status, "pending");
    assert.equal(result.finalPositionFen, undefined);
  });
}
