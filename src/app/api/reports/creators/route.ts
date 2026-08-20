import { auth, clerkClient } from "@clerk/nextjs/server";
import { AsyncLocalStorage } from "node:async_hooks";
import { findGroupQuestById } from "@/lib/groupquests";

const CREATOR_REPORTS_KEY = "sqcCreatorReports";
const MAX_PRIVATE_METADATA_BYTES = 7680;
const MAX_CREATOR_REPORTS = 12;
const TARGET_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_./:-]{0,119}$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/;

type Client = Awaited<ReturnType<typeof clerkClient>>;
type TargetRecord = Awaited<ReturnType<typeof findGroupQuestById>>;
type CreatorReport = {
  id: string;
  submittedAt: string;
  reporterUserId: string;
  targetType: "community-creator";
  targetOwnerUserId: string;
  evidenceTargetType: "community-multiplayer";
  evidenceTargetId: string;
  reason: string;
  source: "website" | "mobile";
};
type CreatorReportRouteDependencies = {
  authenticate: () => Promise<string | null>;
  getClient: () => Promise<Client>;
  findTarget: (client: Client, targetId: string) => Promise<TargetRecord>;
  now?: () => Date;
  makeId?: () => string;
};

const testDependencies = new AsyncLocalStorage<CreatorReportRouteDependencies>();

export function withCreatorReportRouteTestDependencies<Result>(dependencies: CreatorReportRouteDependencies, callback: () => Result): Result {
  if (process.env.NODE_ENV !== "test") throw new Error("Creator report route dependency overrides are test-only.");
  return testDependencies.run(dependencies, callback);
}

function createDependencies(): CreatorReportRouteDependencies {
  return { authenticate: async () => (await auth()).userId, getClient: clerkClient, findTarget: findGroupQuestById };
}

export async function POST(request: Request) {
  const dependencies = process.env.NODE_ENV === "test" ? testDependencies.getStore() ?? createDependencies() : createDependencies();
  const reporterUserId = await dependencies.authenticate();
  if (!reporterUserId) return Response.json({ ok: false, message: "Sign in before reporting a Community creator." }, { status: 401 });

  const payload = await request.json().catch(() => null);
  if (!isExactPayload(payload)) return Response.json({ ok: false, message: "Choose a Community creator and add a short reason." }, { status: 400 });
  const targetId = payload.targetId.trim();
  const reason = payload.reason.trim().replace(/\s+/g, " ");
  if (targetId !== payload.targetId || !TARGET_ID_PATTERN.test(targetId) || payload.reason.length > 500 || reason.length < 3 || CONTROL_CHARACTER_PATTERN.test(payload.reason)) {
    return Response.json({ ok: false, message: "Choose a valid Community creator and add a short reason." }, { status: 400 });
  }

  const client = await dependencies.getClient();
  const target = await dependencies.findTarget(client, targetId);
  if (!target || target.groupQuest.id !== targetId || target.groupQuest.official || target.groupQuest.inviteMode !== "public" || target.userId !== target.groupQuest.hostUserId) {
    return Response.json({ ok: false, message: "That Community creator is not available to report." }, { status: 404 });
  }
  if (reporterUserId === target.userId) return Response.json({ ok: false, message: "You cannot report yourself." }, { status: 403 });

  const user = await client.users.getUser(reporterUserId);
  const privateMetadata = asMetadata(user.privateMetadata);
  const submittedAt = (dependencies.now?.() ?? new Date()).toISOString();
  const report: CreatorReport = {
    id: dependencies.makeId?.() ?? `creator-report-${submittedAt}-${Math.random().toString(36).slice(2, 8)}`,
    submittedAt,
    reporterUserId,
    targetType: "community-creator",
    targetOwnerUserId: target.userId,
    evidenceTargetType: "community-multiplayer",
    evidenceTargetId: target.groupQuest.id,
    reason,
    source: ["android", "ios", "mobile"].includes(request.headers.get("x-side-quest-chess-client") ?? "") ? "mobile" : "website",
  };
  const nextMetadata = fitWithinMetadataBudget(privateMetadata, report);
  if (!nextMetadata) return Response.json({ ok: false, message: "Could not safely store this creator report. Please contact support." }, { status: 507 });
  await client.users.updateUserMetadata(reporterUserId, { privateMetadata: nextMetadata });
  return Response.json({ ok: true, reportId: report.id, submittedAt, message: "Creator report sent. We’ll review this Community creator." });
}

function isExactPayload(payload: unknown): payload is { targetType: "community-multiplayer"; targetId: string; reason: string } {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
  const record = payload as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return keys.length === 3 && keys[0] === "reason" && keys[1] === "targetId" && keys[2] === "targetType" && record.targetType === "community-multiplayer" && typeof record.targetId === "string" && typeof record.reason === "string";
}

function fitWithinMetadataBudget(privateMetadata: Record<string, unknown>, report: CreatorReport) {
  const reports = [...getCreatorReports(privateMetadata), report].slice(-MAX_CREATOR_REPORTS);
  while (reports.length) {
    const candidate = { ...privateMetadata, [CREATOR_REPORTS_KEY]: reports };
    if (Buffer.byteLength(JSON.stringify(candidate), "utf8") <= MAX_PRIVATE_METADATA_BYTES) return candidate;
    reports.shift();
  }
  return null;
}

function getCreatorReports(metadata: Record<string, unknown>): CreatorReport[] {
  const value = metadata[CREATOR_REPORTS_KEY];
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is CreatorReport => {
    if (!entry || typeof entry !== "object") return false;
    const report = entry as Partial<CreatorReport>;
    return typeof report.id === "string" && typeof report.submittedAt === "string" && typeof report.reporterUserId === "string" && report.targetType === "community-creator" && typeof report.targetOwnerUserId === "string" && report.evidenceTargetType === "community-multiplayer" && typeof report.evidenceTargetId === "string" && typeof report.reason === "string" && (report.source === "website" || report.source === "mobile");
  });
}

function asMetadata(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
