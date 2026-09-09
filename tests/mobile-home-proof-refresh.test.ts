import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createMobileHomeProofRefreshCoordinator,
  toMobileHomeProofRefreshActionState,
  type MobileHomeProofRefreshSnapshot,
} from "../apps/mobile/src/home/mobileHomeProofRefresh";

function activeSnapshot(overrides: Partial<MobileHomeProofRefreshSnapshot> = {}): MobileHomeProofRefreshSnapshot {
  return {
    activeQuestId: "finish-any-game",
    activeQuestCompleted: false,
    latestReceipt: null,
    feedback: "No qualifying game found yet.",
    ...overrides,
  };
}

test("a suppressed Home proof result releases the refresh button", () => {
  assert.deepEqual(toMobileHomeProofRefreshActionState(null), {
    busy: false,
    message: null,
    error: null,
  });
});

test("a successful Home proof result becomes inline success feedback", () => {
  assert.deepEqual(toMobileHomeProofRefreshActionState({ kind: "success", message: "Proof accepted." }), {
    busy: false,
    message: "Proof accepted.",
    error: null,
  });
});

test("a failed Home proof result becomes inline retry guidance", () => {
  assert.deepEqual(toMobileHomeProofRefreshActionState({ kind: "error", message: "Pull down again to sync." }), {
    busy: false,
    message: null,
    error: "Pull down again to sync.",
  });
});

test("a rejected pull-to-refresh proof check resolves with safe retry guidance", async () => {
  const coordinator = createMobileHomeProofRefreshCoordinator();

  const result = await coordinator.refresh({
    challengeId: "finish-any-game",
    syncAccount: async () => activeSnapshot(),
    checkProof: async () => {
      throw new Error("https://provider.example/private upstream socket failed");
    },
  });

  assert.deepEqual(result, {
    kind: "error",
    message: "Proof refresh didn’t finish. It may have reached the referee. Pull down again to sync before retrying.",
  });
  assert.doesNotMatch(result.message, /provider|private|socket/i);
});

test("overlapping pull-to-refresh gestures share one proof mutation", async () => {
  const coordinator = createMobileHomeProofRefreshCoordinator();
  let checkCalls = 0;
  let releaseCheck: (() => void) | undefined;
  const checkGate = new Promise<void>((resolve) => {
    releaseCheck = resolve;
  });
  const dependencies = {
    challengeId: "finish-any-game",
    syncAccount: async () => activeSnapshot({ feedback: "Proof result synced." }),
    checkProof: async () => {
      checkCalls += 1;
      await checkGate;
    },
  };

  const first = coordinator.refresh(dependencies);
  const second = coordinator.refresh(dependencies);
  await new Promise<void>((resolve) => setImmediate(resolve));

  assert.equal(checkCalls, 1);
  releaseCheck?.();
  assert.deepEqual(await first, { kind: "success", message: "Proof result synced." });
  assert.deepEqual(await second, { kind: "success", message: "Proof result synced." });
});

test("retry syncs a timed-out server success without sending a second proof check", async () => {
  const coordinator = createMobileHomeProofRefreshCoordinator();
  let syncCalls = 0;
  let checkCalls = 0;
  const syncAccount = async () => {
    syncCalls += 1;
    if (syncCalls === 1) return activeSnapshot();
    return activeSnapshot({
      activeQuestCompleted: true,
      latestReceipt: { id: "receipt-success", challengeId: "finish-any-game", checkedAt: "2026-09-09T02:00:01.000Z" },
      feedback: "Quest completed. Your proof is ready.",
    });
  };
  const checkProof = async () => {
    checkCalls += 1;
    throw new Error("Request timed out after the server accepted it.");
  };

  assert.equal((await coordinator.refresh({ challengeId: "finish-any-game", syncAccount, checkProof }))?.kind, "error");
  assert.deepEqual(await coordinator.refresh({ challengeId: "finish-any-game", syncAccount, checkProof }), {
    kind: "success",
    message: "Quest completed. Your proof is ready.",
  });
  assert.equal(checkCalls, 1);
});

test("retry recognizes a new receipt despite server and device clock skew", async () => {
  const coordinator = createMobileHomeProofRefreshCoordinator();
  let syncCalls = 0;
  let checkCalls = 0;
  const syncAccount = async () => {
    syncCalls += 1;
    return syncCalls === 1
      ? activeSnapshot()
      : activeSnapshot({
        latestReceipt: { id: "receipt-clock-skew", challengeId: "finish-any-game", checkedAt: "2026-09-09T01:59:59.000Z" },
        feedback: "That game did not match. Try another fresh public game.",
      });
  };
  const checkProof = async () => {
    checkCalls += 1;
    throw new Error("Request timed out after the server accepted it.");
  };

  assert.equal((await coordinator.refresh({ challengeId: "finish-any-game", syncAccount, checkProof }))?.kind, "error");
  assert.deepEqual(await coordinator.refresh({ challengeId: "finish-any-game", syncAccount, checkProof }), {
    kind: "success",
    message: "That game did not match. Try another fresh public game.",
  });
  assert.equal(checkCalls, 1);
});

test("an ambiguous failure gets one sync-only pull before a later explicit retry", async () => {
  const coordinator = createMobileHomeProofRefreshCoordinator();
  let checkCalls = 0;
  const dependencies = {
    challengeId: "finish-any-game",
    syncAccount: async () => activeSnapshot({ feedback: "No new proof result yet." }),
    checkProof: async () => {
      checkCalls += 1;
      if (checkCalls === 1) throw new Error("The response was lost.");
    },
  };

  assert.equal((await coordinator.refresh(dependencies))?.kind, "error");
  assert.deepEqual(await coordinator.refresh(dependencies), {
    kind: "error",
    message: "No new proof result arrived. Pull down once more to retry the check.",
  });
  assert.equal(checkCalls, 1);
  assert.deepEqual(await coordinator.refresh(dependencies), {
    kind: "success",
    message: "No new proof result yet.",
  });
  assert.equal(checkCalls, 2);
});

test("a changed active quest gets a sync-only recovery pull after an ambiguous failure", async () => {
  const coordinator = createMobileHomeProofRefreshCoordinator();
  let checkCalls = 0;

  assert.equal((await coordinator.refresh({
    challengeId: "finish-any-game",
    syncAccount: async () => activeSnapshot(),
    checkProof: async () => {
      checkCalls += 1;
      throw new Error("The response was lost.");
    },
  }))?.kind, "error");

  assert.deepEqual(await coordinator.refresh({
    challengeId: "win-as-white",
    syncAccount: async () => activeSnapshot({
      activeQuestId: "win-as-white",
      feedback: "Your next Side Quest is synced.",
    }),
    checkProof: async () => {
      checkCalls += 1;
    },
  }), {
    kind: "success",
    message: "Your next Side Quest is synced.",
  });
  assert.equal(checkCalls, 1);
});

test("an account sync failure resolves with connection guidance and sends no proof check", async () => {
  const coordinator = createMobileHomeProofRefreshCoordinator();
  let checkCalls = 0;

  const result = await coordinator.refresh({
    challengeId: "finish-any-game",
    syncAccount: async () => {
      throw new Error("private provider response");
    },
    checkProof: async () => {
      checkCalls += 1;
    },
  });

  assert.deepEqual(result, {
    kind: "error",
    message: "Couldn’t sync your proof. Check your connection, then pull down to try again.",
  });
  assert.equal(checkCalls, 0);
});

test("a synced account without the stale active quest sends no proof check", async () => {
  const coordinator = createMobileHomeProofRefreshCoordinator();
  let checkCalls = 0;

  const result = await coordinator.refresh({
    challengeId: "finish-any-game",
    syncAccount: async () => activeSnapshot({
      activeQuestId: null,
      feedback: "Your latest account state is synced.",
    }),
    checkProof: async () => {
      checkCalls += 1;
    },
  });

  assert.deepEqual(result, { kind: "success", message: "Your latest account state is synced." });
  assert.equal(checkCalls, 0);
});

test("leaving Home suppresses feedback from an in-flight refresh", async () => {
  const coordinator = createMobileHomeProofRefreshCoordinator();
  let checkStarted: (() => void) | undefined;
  let releaseCheck: (() => void) | undefined;
  const started = new Promise<void>((resolve) => {
    checkStarted = resolve;
  });
  const checkGate = new Promise<void>((resolve) => {
    releaseCheck = resolve;
  });

  const refresh = coordinator.refresh({
    challengeId: "finish-any-game",
    syncAccount: async () => activeSnapshot({ feedback: "Proof result synced." }),
    checkProof: async () => {
      checkStarted?.();
      await checkGate;
    },
  });
  await started;
  coordinator.leaveHome();
  releaseCheck?.();

  assert.equal(await refresh, null);
});

test("the native shell invalidates and clears refresh feedback whenever Home is left", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

  assert.match(source, /if \(shell\.activeTab === "home"\) return;\s*homeProofRefreshCoordinator\.leaveHome\(\);/);
  assert.match(source, /current\.activeTab === "home" \? \{ \.\.\.current, refreshFeedback \} : current/);
  assert.match(source, /current\.refreshFeedback === null \? current : \{ \.\.\.current, refreshFeedback: null \}/);
});

test("the active native shell routes home pull-to-refresh through the coordinator and announces feedback", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

  assert.match(source, /createMobileHomeProofRefreshCoordinator/);
  assert.match(source, /homeProofRefreshCoordinator\.refresh\(\{/);
  assert.match(source, /syncAccountForProofRefresh/);
  assert.match(source, /refreshFeedback: MobileHomeProofRefreshFeedback \| null/);
  assert.match(source, /accessibilityRole="alert"/);
  assert.match(source, /accessibilityLiveRegion="polite"/);
  assert.match(source, /Pull down again to sync before retrying/);
});

test("the Home refresh button shares the retry-safe proof coordinator", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  const dashboardStart = source.indexOf("function TodayDashboard");
  const dashboardEnd = source.indexOf("function JoinedMultiplayerQuestModal", dashboardStart);
  assert.notEqual(dashboardStart, -1);
  assert.notEqual(dashboardEnd, -1);
  const dashboardSource = source.slice(dashboardStart, dashboardEnd);

  assert.match(source, /onRefreshActiveProof=\{refreshActiveHomeProof\}/);
  assert.match(dashboardSource, /await onRefreshActiveProof\(signedIn\.activeQuest\.id\)/);
  assert.match(dashboardSource, /setActionState\(toMobileHomeProofRefreshActionState\(result\)\)/);
  assert.doesNotMatch(dashboardSource, /if \(!result\) return/);
  assert.doesNotMatch(dashboardSource, /runMobileQuestAction/);
});
