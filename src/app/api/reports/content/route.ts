import { auth, clerkClient } from "@clerk/nextjs/server";
import { AsyncLocalStorage } from "node:async_hooks";
import { findGroupQuestById } from "@/lib/groupquests";

const CONTENT_REPORTS_KEY = "sqcContentReports";
const MAX_PRIVATE_METADATA_BYTES = 7680;
const MAX_CONTENT_REPORTS = 12;
const TARGET_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_./:-]{0,119}$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/;

type Client = Awaited<ReturnType<typeof clerkClient>>;
type TargetRecord = Awaited<ReturnType<typeof findGroupQuestById>>;

type ContentReport = {
  id: string;
  submittedAt: string;
  reporterUserId: string;
  targetType: "community-multiplayer";
  targetId: string;
  targetOwnerUserId: string;
  reason: string;
  source: "website" | "mobile";
};

type ContentReportRouteDependencies = {
  authenticate: () => Promise<string | null>;
  getClient: () => Promise<Client>;
  findTarget: (client: Client, targetId: string) => Promise<TargetRecord>;
  now?: () => Date;
  makeId?: () => string;
};

const testDependencies = new AsyncLocalStorage<ContentReportRouteDependencies>();

export function withContentReportRouteTestDependencies<Result>(dependencies: ContentReportRouteDependencies, callback: () => Result): Result {
  if (process.env.NODE_ENV !== "test") throw new Error("Content report route dependency overrides are test-only.");
  return testDependencies.run(dependencies, callback);
}

function createDependencies(): ContentReportRouteDependencies {
  return {
    authenticate: async () => (await auth()).userId,
    getClient: clerkClient,
    findTarget: findGroupQuestById,
  };
}

export async function POST(request: Request) {
  const dependencies = process.env.NODE_ENV === "test" ? testDependencies.getStore() ?? createDependencies() : createDependencies();
  const reporterUserId = await dependencies.authenticate();
  if (!reporterUserId) return Response.json({ ok: false, message: "Sign in before reporting Community content." }, { status: 401 });

  const payload = await request.json().catch(() => null);
  if (!isExactContentReportPayload(payload)) {
    return Response.json({ ok: false, message: "Choose a Community Multiplayer Side Quest and add a short reason." }, { status: 400 });
  }

  const targetId = payload.targetId.trim();
  const reason = payload.reason.trim().replace(/\s+/g, " ");
  if (!TARGET_ID_PATTERN.test(targetId) || payload.targetId !== targetId || payload.reason.length > 500 || reason.length < 3 || CONTROL_CHARACTER_PATTERN.test(payload.reason)) {
    return Response.json({ ok: false, message: "Choose a valid Community Multiplayer Side Quest and add a short reason." }, { status: 400 });
  }

  const client = await dependencies.getClient();
  const target = await dependencies.findTarget(client, targetId);
  if (!target
    || target.groupQuest.id !== targetId
    || target.groupQuest.official
    || target.groupQuest.inviteMode !== "public"
    || target.userId !== target.groupQuest.hostUserId) {
    return Response.json({ ok: false, message: "That Community Multiplayer Side Quest is not available to report." }, { status: 404 });
  }
  if (reporterUserId === target.userId) {
    return Response.json({ ok: false, message: "You cannot report your own Multiplayer Side Quest." }, { status: 403 });
  }

  const user = await client.users.getUser(reporterUserId);
  const privateMetadata = asMetadata(user.privateMetadata);
  const submittedAt = (dependencies.now?.() ?? new Date()).toISOString();
  const report: ContentReport = {
    id: dependencies.makeId?.() ?? `content-report-${submittedAt}-${Math.random().toString(36).slice(2, 8)}`,
    submittedAt,
    reporterUserId,
    targetType: "community-multiplayer",
    targetId: target.groupQuest.id,
    targetOwnerUserId: target.userId,
    reason,
    source: request.headers.get("x-side-quest-chess-client") === "android" ? "mobile" : "website",
  };
  const nextMetadata = fitWithinMetadataBudget(privateMetadata, report);
  if (!nextMetadata) {
    return Response.json({ ok: false, message: "Could not safely store this report. Please contact support." }, { status: 507 });
  }

  await client.users.updateUserMetadata(reporterUserId, { privateMetadata: nextMetadata });
  return Response.json({ ok: true, reportId: report.id, submittedAt, message: "Report sent. We’ll review this Multiplayer Side Quest." });
}

function isExactContentReportPayload(payload: unknown): payload is { targetType: "community-multiplayer"; targetId: string; reason: string } {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
  const record = payload as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return keys.length === 3
    && keys[0] === "reason"
    && keys[1] === "targetId"
    && keys[2] === "targetType"
    && record.targetType === "community-multiplayer"
    && typeof record.targetId === "string"
    && typeof record.reason === "string";
}

function fitWithinMetadataBudget(privateMetadata: Record<string, unknown>, report: ContentReport) {
  const reports = [...getContentReports(privateMetadata), report].slice(-MAX_CONTENT_REPORTS);
  while (reports.length) {
    const candidate = { ...privateMetadata, [CONTENT_REPORTS_KEY]: reports };
    if (Buffer.byteLength(JSON.stringify(candidate), "utf8") <= MAX_PRIVATE_METADATA_BYTES) return candidate;
    reports.shift();
  }
  return null;
}

function getContentReports(metadata: Record<string, unknown>): ContentReport[] {
  const value = metadata[CONTENT_REPORTS_KEY];
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is ContentReport => {
    if (!entry || typeof entry !== "object") return false;
    const report = entry as Partial<ContentReport>;
    return typeof report.id === "string"
      && typeof report.submittedAt === "string"
      && typeof report.reporterUserId === "string"
      && report.targetType === "community-multiplayer"
      && typeof report.targetId === "string"
      && typeof report.targetOwnerUserId === "string"
      && typeof report.reason === "string"
      && (report.source === "website" || report.source === "mobile");
  });
}

function asMetadata(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
