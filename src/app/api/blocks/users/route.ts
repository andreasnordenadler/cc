import { auth, clerkClient } from "@clerk/nextjs/server";
import { AsyncLocalStorage } from "node:async_hooks";
import { findGroupQuestById } from "@/lib/groupquests";
import { getBlockedUsers, type BlockedUser } from "@/lib/user-blocking";

const BLOCKED_USERS_KEY = "sqcBlockedUsers";
const MAX_BLOCKED_USERS = 50;
const MAX_PRIVATE_METADATA_BYTES = 7680;
const TARGET_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_./:-]{0,119}$/;

type Client = Awaited<ReturnType<typeof clerkClient>>;
type TargetRecord = Awaited<ReturnType<typeof findGroupQuestById>>;

type UserBlockRouteDependencies = {
  authenticate: () => Promise<string | null>;
  getClient: () => Promise<Client>;
  findTarget: (client: Client, targetId: string) => Promise<TargetRecord>;
  now?: () => Date;
};

const testDependencies = new AsyncLocalStorage<UserBlockRouteDependencies>();

export function withUserBlockRouteTestDependencies<Result>(dependencies: UserBlockRouteDependencies, callback: () => Result): Result {
  if (process.env.NODE_ENV !== "test") throw new Error("User block route dependency overrides are test-only.");
  return testDependencies.run(dependencies, callback);
}

function createDependencies(): UserBlockRouteDependencies {
  return {
    authenticate: async () => (await auth()).userId,
    getClient: clerkClient,
    findTarget: findGroupQuestById,
  };
}

export async function POST(request: Request) {
  const dependencies = process.env.NODE_ENV === "test" ? testDependencies.getStore() ?? createDependencies() : createDependencies();
  const viewerUserId = await dependencies.authenticate();
  if (!viewerUserId) return Response.json({ ok: false, message: "Sign in before blocking a Community creator." }, { status: 401 });

  const payload = await request.json().catch(() => null);
  if (!isExactBlockPayload(payload)) {
    return Response.json({ ok: false, message: "Choose a Community Multiplayer creator to block." }, { status: 400 });
  }
  const targetId = payload.targetId.trim();
  if (targetId !== payload.targetId || !TARGET_ID_PATTERN.test(targetId)) {
    return Response.json({ ok: false, message: "Choose a valid Community Multiplayer creator to block." }, { status: 400 });
  }

  const client = await dependencies.getClient();
  const target = await dependencies.findTarget(client, targetId);
  if (!target
    || target.groupQuest.id !== targetId
    || target.groupQuest.official
    || target.groupQuest.inviteMode !== "public"
    || target.userId !== target.groupQuest.hostUserId) {
    return Response.json({ ok: false, message: "That Community Multiplayer creator is not available to block." }, { status: 404 });
  }
  if (target.userId === viewerUserId) {
    return Response.json({ ok: false, message: "You cannot block yourself." }, { status: 403 });
  }

  const user = await client.users.getUser(viewerUserId);
  const privateMetadata = asMetadata(user.privateMetadata);
  const blockedAt = (dependencies.now?.() ?? new Date()).toISOString();
  const blockedUser: BlockedUser = {
    userId: target.userId,
    blockedAt,
    source: request.headers.get("x-side-quest-chess-client") === "android" ? "mobile" : "website",
  };
  const existing = getBlockedUsers(privateMetadata).filter((entry) => entry.userId !== target.userId);
  const nextMetadata = fitWithinMetadataBudget(privateMetadata, [...existing, blockedUser].slice(-MAX_BLOCKED_USERS));
  if (!nextMetadata) {
    return Response.json({ ok: false, message: "Could not safely save this block. Please contact support." }, { status: 507 });
  }

  await client.users.updateUserMetadata(viewerUserId, { privateMetadata: nextMetadata });
  return Response.json({
    ok: true,
    action: "blocked",
    message: "Creator blocked. Their Community content will no longer appear in discovery.",
  });
}

function isExactBlockPayload(payload: unknown): payload is { targetType: "community-multiplayer"; targetId: string; action: "block" } {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
  const record = payload as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return keys.length === 3
    && keys[0] === "action"
    && keys[1] === "targetId"
    && keys[2] === "targetType"
    && record.action === "block"
    && record.targetType === "community-multiplayer"
    && typeof record.targetId === "string";
}

function fitWithinMetadataBudget(privateMetadata: Record<string, unknown>, blockedUsers: BlockedUser[]) {
  const bounded = [...blockedUsers];
  while (bounded.length) {
    const candidate = { ...privateMetadata, [BLOCKED_USERS_KEY]: bounded };
    if (Buffer.byteLength(JSON.stringify(candidate), "utf8") <= MAX_PRIVATE_METADATA_BYTES) return candidate;
    bounded.shift();
  }
  return null;
}

function asMetadata(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
