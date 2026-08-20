import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { submitMobileCommunityCreatorReport } from "../apps/mobile/src/api/sqc";
import { createMobileCommunityCreatorReportSubmitter } from "../apps/mobile/src/reports/communityCreatorReport";
import { POST as creatorReportPOST, withCreatorReportRouteTestDependencies } from "../src/app/api/reports/creators/route";

const originalFetch = globalThis.fetch;

function setNodeEnv(value: string | undefined) {
  Object.defineProperty(process.env, "NODE_ENV", { configurable: true, enumerable: true, value, writable: true });
}

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://sidequestchess.com/api/reports/creators", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function routeDependencies({ reporterUserId = "reporter", targetUserId = "creator", privateMetadata = { unrelated: "preserved" } as Record<string, unknown> } = {}) {
  const writes: Array<{ userId: string; metadata: unknown }> = [];
  return {
    writes,
    dependencies: {
      authenticate: async () => reporterUserId,
      getClient: async () => ({ users: {
        getUser: async (userId: string) => {
          assert.equal(userId, reporterUserId);
          return { privateMetadata };
        },
        updateUserMetadata: async (userId: string, metadata: unknown) => { writes.push({ userId, metadata }); },
      } }) as never,
      findTarget: async (_client: unknown, targetId: string) => ({
        userId: targetUserId,
        groupQuest: { id: targetId, hostUserId: targetUserId, inviteMode: "public", official: false },
      }) as never,
      now: () => new Date("2026-08-03T10:00:00.000Z"),
      makeId: () => "creator-report-1",
    },
  };
}

test.afterEach(() => { globalThis.fetch = originalFetch; });

test("Android creator reporting sends only immutable evidence fields with bearer provenance", async () => {
  let sent: Request | null = null;
  globalThis.fetch = async (input, init) => {
    sent = new Request(input, init);
    return Response.json({ ok: true, reportId: "creator-report-1", submittedAt: "2026-08-03T10:00:00.000Z", message: "Creator report sent." });
  };

  const result = await submitMobileCommunityCreatorReport({ sessionToken: "session-token", targetId: "community/table", reason: "  repeated   abusive behavior " });
  assert.ok(sent);
  const sentRequest = sent as unknown as Request;
  assert.equal(new URL(sentRequest.url).pathname, "/api/reports/creators");
  assert.equal(sentRequest.headers.get("authorization"), "Bearer session-token");
  assert.equal(sentRequest.headers.get("x-side-quest-chess-client"), "mobile");
  assert.deepEqual(await sentRequest.json(), { targetType: "community-multiplayer", targetId: "community/table", reason: "repeated abusive behavior" });
  assert.equal(result.reportId, "creator-report-1");
});

test("Android creator reporting validates before network and rejects overlapping activation", async () => {
  let requests = 0;
  globalThis.fetch = async () => { requests += 1; return Response.json({ ok: true }); };
  await assert.rejects(submitMobileCommunityCreatorReport({ sessionToken: "token", targetId: " community/table", reason: "abuse" }), /valid Community creator/);
  await assert.rejects(submitMobileCommunityCreatorReport({ sessionToken: "token", targetId: "community/table", reason: "x" }), /short reason/);
  assert.equal(requests, 0);

  let release!: () => void;
  const submitter = createMobileCommunityCreatorReportSubmitter(async () => {
    requests += 1;
    await new Promise<void>((resolve) => { release = resolve; });
    return { ok: true, reportId: "creator-report-1", submittedAt: "now", message: "sent" };
  });
  const first = submitter(async () => ({ sessionToken: "token", targetId: "community/table", reason: "abuse" }));
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(await submitter(async () => ({ sessionToken: "token", targetId: "community/table", reason: "abuse" })), { kind: "busy", message: "Creator report already sending." });
  release();
  assert.equal((await first).kind, "success");
  assert.equal(requests, 1);
});

test("exported creator report route derives canonical identities and preserves unrelated metadata", async (t) => {
  const previous = process.env.NODE_ENV;
  setNodeEnv("test");
  t.after(() => setNodeEnv(previous));
  const { dependencies, writes } = routeDependencies();

  const response = await withCreatorReportRouteTestDependencies(dependencies, () => creatorReportPOST(request({ targetType: "community-multiplayer", targetId: "community/table", reason: " repeated   abusive behavior " }, { "x-side-quest-chess-client": "android" })));
  assert.equal(response.status, 200);
  assert.equal(writes.length, 1);
  assert.equal(writes[0]?.userId, "reporter");
  const saved = writes[0]?.metadata as { privateMetadata: { unrelated: string; sqcCreatorReports: Array<Record<string, unknown>> } };
  assert.equal(saved.privateMetadata.unrelated, "preserved");
  assert.deepEqual(saved.privateMetadata.sqcCreatorReports, [{
    id: "creator-report-1",
    submittedAt: "2026-08-03T10:00:00.000Z",
    reporterUserId: "reporter",
    targetType: "community-creator",
    targetOwnerUserId: "creator",
    evidenceTargetType: "community-multiplayer",
    evidenceTargetId: "community/table",
    reason: "repeated abusive behavior",
    source: "mobile",
  }]);
});

test("creator report route fails closed for anonymous, spoofed, replica, self, and over-budget requests", async (t) => {
  const previous = process.env.NODE_ENV;
  setNodeEnv("test");
  t.after(() => setNodeEnv(previous));
  const base = routeDependencies();

  const anonymous = await withCreatorReportRouteTestDependencies({ ...base.dependencies, authenticate: async () => null }, () => creatorReportPOST(request({ targetType: "community-multiplayer", targetId: "community/table", reason: "abuse" })));
  assert.equal(anonymous.status, 401);
  const spoofed = await withCreatorReportRouteTestDependencies(base.dependencies, () => creatorReportPOST(request({ targetType: "community-multiplayer", targetId: "community/table", reason: "abuse", targetOwnerUserId: "victim" })));
  assert.equal(spoofed.status, 400);
  const replica = await withCreatorReportRouteTestDependencies({ ...base.dependencies, findTarget: async () => ({ userId: "replica", groupQuest: { id: "community/table", hostUserId: "creator", inviteMode: "public", official: false } }) as never }, () => creatorReportPOST(request({ targetType: "community-multiplayer", targetId: "community/table", reason: "abuse" })));
  assert.equal(replica.status, 404);
  const self = routeDependencies({ reporterUserId: "creator", targetUserId: "creator" });
  assert.equal((await withCreatorReportRouteTestDependencies(self.dependencies, () => creatorReportPOST(request({ targetType: "community-multiplayer", targetId: "community/table", reason: "abuse" })))).status, 403);
  const full = routeDependencies({ privateMetadata: { unrelated: "x".repeat(7600) } });
  assert.equal((await withCreatorReportRouteTestDependencies(full.dependencies, () => creatorReportPOST(request({ targetType: "community-multiplayer", targetId: "community/table", reason: "abuse" })))).status, 507);
  assert.equal(full.writes.length, 0);
  assert.equal(base.writes.length, 0);
});

test("Android safety sheet exposes distinct Side Quest report, creator report, and block controls", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  assert.match(source, /createMobileCommunityCreatorReportSubmitter/);
  assert.match(source, /accessibilityLabel="Send Community Multiplayer report"/);
  assert.match(source, /accessibilityLabel="Report Community creator"/);
  assert.match(source, /accessibilityLabel="Block Community creator"/);
  assert.match(source, /Report creator/);
  assert.match(source, /reportCreator/);
});
