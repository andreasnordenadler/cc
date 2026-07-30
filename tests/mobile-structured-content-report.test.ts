import assert from "node:assert/strict";
import test from "node:test";
import { submitMobileCommunityMultiplayerReport } from "../apps/mobile/src/api/sqc";
import { canReportCommunityMultiplayerQuest, createMobileCommunityReportSubmitter } from "../apps/mobile/src/reports/communityMultiplayerReport";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("Android Community Multiplayer reporting sends bearer auth and immutable target fields", async () => {
  let request: Request | null = null;
  globalThis.fetch = async (input, init) => {
    request = new Request(input, init);
    return Response.json({ ok: true, reportId: "report-1", submittedAt: "2026-07-30T12:00:00.000Z", message: "Report sent." });
  };

  const result = await submitMobileCommunityMultiplayerReport({
    sessionToken: "session-token",
    targetId: "community/table",
    reason: "  misleading   rules  ",
  });

  assert.ok(request);
  const sentRequest = request as unknown as Request;
  assert.equal(sentRequest.method, "POST");
  assert.equal(sentRequest.headers.get("authorization"), "Bearer session-token");
  assert.equal(new URL(sentRequest.url).pathname, "/api/reports/content");
  assert.deepEqual(await sentRequest.json(), {
    targetType: "community-multiplayer",
    targetId: "community/table",
    reason: "misleading rules",
  });
  assert.equal(result.reportId, "report-1");
});

test("Android Community Multiplayer reporting rejects invalid input without a request", async () => {
  let requests = 0;
  globalThis.fetch = async () => {
    requests += 1;
    return Response.json({ ok: true });
  };

  await assert.rejects(
    submitMobileCommunityMultiplayerReport({ sessionToken: "session-token", targetId: "community/table", reason: "x" }),
    /Add a short reason/,
  );
  await assert.rejects(
    submitMobileCommunityMultiplayerReport({ sessionToken: "session-token", targetId: " community/table", reason: "misleading rules" }),
    /valid Community Multiplayer Side Quest/,
  );
  assert.equal(requests, 0);
});

test("Android Community Multiplayer detail wires a dedicated structured report form instead of support messaging", async () => {
  const appSource = await import("node:fs/promises").then(({ readFile }) => readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8"));

  assert.match(appSource, /createMobileCommunityReportSubmitter/);
  assert.match(appSource, /function CommunityMultiplayerReportModal/);
  assert.match(appSource, /targetId: quest\.id/);
  assert.match(appSource, /accessibilityLabel="Report reason"/);
  assert.match(appSource, /accessibilityLabel="Send Community Multiplayer report"/);
  assert.doesNotMatch(appSource, /HelpSupportModal key=\{multiplayerReportMessage/);
});

test("Android report action is limited to signed-in public Community Multiplayer guests", () => {
  const base = { official: false, inviteMode: "public" as const, isOwner: false };
  assert.equal(canReportCommunityMultiplayerQuest(base, true), true);
  assert.equal(canReportCommunityMultiplayerQuest({ ...base, official: true }, true), false);
  assert.equal(canReportCommunityMultiplayerQuest({ ...base, inviteMode: "unlisted-link" }, true), false);
  assert.equal(canReportCommunityMultiplayerQuest({ ...base, inviteMode: "private-key" }, true), false);
  assert.equal(canReportCommunityMultiplayerQuest({ ...base, isOwner: true }, true), false);
  assert.equal(canReportCommunityMultiplayerQuest(base, false), false);
});

test("Android report submitter rejects overlapping activation until the first request settles", async () => {
  let resolve!: () => void;
  let requests = 0;
  const submit = createMobileCommunityReportSubmitter(async () => {
    requests += 1;
    await new Promise<void>((done) => { resolve = done; });
    return { ok: true as const, reportId: "report-1", submittedAt: "now", message: "sent" };
  });
  let resolveToken!: () => void;
  const first = submit(async () => {
    await new Promise<void>((done) => { resolveToken = done; });
    return { sessionToken: "token", targetId: "community/table", reason: "misleading rules" };
  });
  const duplicate = await submit(async () => ({ sessionToken: "token", targetId: "community/table", reason: "misleading rules" }));
  assert.deepEqual(duplicate, { kind: "busy", message: "Report already sending." });
  assert.equal(requests, 0);
  resolveToken();
  await new Promise<void>((done) => setTimeout(done, 0));
  assert.equal(requests, 1);
  resolve();
  assert.equal((await first).kind, "success");
});

test("Android Community Multiplayer reporting exposes only the server safe message", async () => {
  globalThis.fetch = async () => Response.json({ ok: false, message: "You cannot report your own Multiplayer Side Quest.", providerDetail: "private" }, { status: 403 });

  await assert.rejects(
    submitMobileCommunityMultiplayerReport({ sessionToken: "session-token", targetId: "community/table", reason: "misleading rules" }),
    /You cannot report your own Multiplayer Side Quest\./,
  );
});

test("Android Community Multiplayer reporting hides unexpected upstream details", async () => {
  globalThis.fetch = async () => Response.json({ ok: false, message: "private provider detail" }, { status: 503 });
  await assert.rejects(
    submitMobileCommunityMultiplayerReport({ sessionToken: "session-token", targetId: "community/table", reason: "misleading rules" }),
    /^Error: Could not send the report\. Try again\.$/,
  );

  globalThis.fetch = async () => new Response("<title>private proxy detail</title>", { status: 502, headers: { "content-type": "text/html" } });
  await assert.rejects(
    submitMobileCommunityMultiplayerReport({ sessionToken: "session-token", targetId: "community/table", reason: "misleading rules" }),
    /^Error: Could not send the report\. Try again\.$/,
  );
});
