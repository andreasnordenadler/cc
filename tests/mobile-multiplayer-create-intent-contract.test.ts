import assert from "node:assert/strict";
import test from "node:test";

import {
  completeMultiplayerCreateTransition,
  consumeMultiplayerCreateIntent,
  initialMultiplayerCreateIntent,
  requestMultiplayerCreateIntent,
  scheduleMultiplayerCreateOpen,
} from "../apps/mobile/src/multiplayer/createIntent";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

test("a consumed Multiplayer create intent reopens with a fresh token", () => {
  const first = requestMultiplayerCreateIntent(initialMultiplayerCreateIntent, "quest-one");
  assert.deepEqual(first, {
    sequence: 1,
    pendingToken: 1,
    pendingQuestId: "quest-one",
  });

  const consumed = consumeMultiplayerCreateIntent(first);
  assert.deepEqual(consumed, {
    sequence: 1,
    pendingToken: 0,
    pendingQuestId: null,
  });

  const reopened = requestMultiplayerCreateIntent(consumed);
  assert.deepEqual(reopened, {
    sequence: 2,
    pendingToken: 2,
    pendingQuestId: null,
  });
});

test("a canceled delayed open can retry the same Multiplayer intent", async () => {
  const openedTokens: number[] = [];
  let handledToken = 0;
  const onOpen = (token: number) => {
    handledToken = token;
    openedTokens.push(token);
  };

  const cancelFirst = scheduleMultiplayerCreateOpen({
    pendingToken: 7,
    handledToken,
    delayMs: 0,
    onOpen,
  });
  cancelFirst();
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(handledToken, 0);
  assert.deepEqual(openedTokens, []);

  scheduleMultiplayerCreateOpen({
    pendingToken: 7,
    handledToken,
    delayMs: 0,
    onOpen,
  });
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(handledToken, 7);
  assert.deepEqual(openedTokens, [7]);
});

test("a created Multiplayer quest opens exact detail only after account refresh", async () => {
  const firstRefresh = deferred();
  const refreshDelay = deferred();
  const secondRefresh = deferred();
  const events: string[] = [];
  let refreshCount = 0;

  const completion = completeMultiplayerCreateTransition({
    createdGroupQuestId: "group-42",
    message: "The table is ready.",
    closeCreate: () => events.push("close"),
    consumeIntent: () => events.push("consume"),
    resetDraft: () => events.push("reset"),
    refreshAccount: () => {
      refreshCount += 1;
      events.push(`refresh-${refreshCount}`);
      return refreshCount === 1 ? firstRefresh.promise : secondRefresh.promise;
    },
    waitForRefresh: () => {
      events.push("wait");
      return refreshDelay.promise;
    },
    publishSuccess: (questId, message) => events.push(`success:${questId}:${message}`),
    openCreatedQuest: (questId) => events.push(`open:${questId}`),
  });

  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(events, ["close", "consume", "reset", "refresh-1"]);

  firstRefresh.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(events, ["close", "consume", "reset", "refresh-1", "wait"]);

  refreshDelay.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(events, ["close", "consume", "reset", "refresh-1", "wait", "refresh-2"]);

  secondRefresh.resolve();
  await completion;
  assert.deepEqual(events, [
    "close",
    "consume",
    "reset",
    "refresh-1",
    "wait",
    "refresh-2",
    "success:group-42:The table is ready.",
    "open:group-42",
  ]);
});
