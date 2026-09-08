import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("consuming a hamburger create intent preserves the mounted Multiplayer screen", async () => {
  const app = await readFile("apps/mobile/App.tsx", "utf8");
  const multiplayerCase = app.match(
    /case "multiplayerSideQuests":\s*return <MultiplayerSideQuestsScreen\b[^;]+;/,
  );

  assert.ok(multiplayerCase, "expected the active Multiplayer screen branch");
  assert.match(
    multiplayerCase[0],
    /pendingCreateOpenToken=\{pendingMultiplayerCreateOpenToken\}/,
    "the one-shot create intent must still reach the mounted screen",
  );
  assert.doesNotMatch(
    multiplayerCase[0],
    /\bkey=\{[^}]*pendingMultiplayerCreateOpenToken/,
    "consuming the one-shot token must not remount and erase the async success/detail transition",
  );
});

test("the mobile shell uses the executable create-intent contract", async () => {
  const app = await readFile("apps/mobile/App.tsx", "utf8");

  assert.match(
    app,
    /useState\(initialMultiplayerCreateIntent\)/,
    "the shell must retain the monotonic intent sequence after the pending token is consumed",
  );
  assert.match(
    app,
    /setMultiplayerCreateIntent\(\(current\) => requestMultiplayerCreateIntent\(current, questId\)\)/,
    "each hamburger open must request a fresh intent through the tested contract",
  );
  assert.match(
    app,
    /setMultiplayerCreateIntent\(consumeMultiplayerCreateIntent\)/,
    "consumption must clear only the pending intent through the tested contract",
  );
});

test("the native screen schedules delayed creator opens through the executable contract", async () => {
  const app = await readFile("apps/mobile/App.tsx", "utf8");
  const effectStart = app.indexOf("useEffect(() => {\n    if (!pendingCreateOpenToken) return;");
  const effectEnd = app.indexOf("  }, [createQuestChoices, pendingCreateOpenToken, pendingCreateQuestId]);", effectStart);

  assert.notEqual(effectStart, -1, "expected the tested pending create scheduling contract");
  assert.notEqual(effectEnd, -1, "expected the pending create intent dependency");

  const effect = app.slice(effectStart, effectEnd);
  assert.match(effect, /pendingToken: pendingCreateOpenToken \?\? 0/);
  assert.match(effect, /handledToken: lastHandledPendingCreateTokenRef\.current/);
  assert.match(effect, /lastHandledPendingCreateTokenRef\.current = token;\s*setCreateOpen\(true\);/);
});

test("successful native creation uses the tested exact-detail transition", async () => {
  const app = await readFile("apps/mobile/App.tsx", "utf8");
  const createStart = app.indexOf("  async function createGroupQuest()");
  const createEnd = app.indexOf("  async function joinByInviteKey()", createStart);

  assert.notEqual(createStart, -1, "expected the native Multiplayer creator");
  assert.notEqual(createEnd, -1, "expected the complete native create handler");
  assert.match(
    app.slice(createStart, createEnd),
    /await completeMultiplayerCreateTransition\(\{[\s\S]*createdGroupQuestId,[\s\S]*refreshAccount: onAccountUpdated,[\s\S]*openCreatedQuest:/,
  );
});
