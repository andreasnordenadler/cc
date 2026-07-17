import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { AsyncLocalStorage } from "node:async_hooks";
import { compactAnalyticsStore, getAnalyticsStore } from "@/lib/analytics";
import {
  findGroupQuestById,
  getStoredGroupQuests,
  isGroupQuestFinished,
  removeParticipantFromGroupQuest,
  upsertHostGroupQuest,
  type ServerGroupQuest,
} from "@/lib/groupquests";

type RemoveParticipantRouteDependencies = {
  authenticate: () => Promise<string | null>;
  findQuest: (id: string) => Promise<{ userId: string; groupQuest: ServerGroupQuest } | null>;
  getHost: (userId: string) => Promise<{ privateMetadata?: unknown }>;
  saveHost: (userId: string, privateMetadata: Record<string, unknown>) => Promise<void>;
};

const testDependencies = new AsyncLocalStorage<RemoveParticipantRouteDependencies>();

export function withRemoveParticipantRouteTestDependencies<Result>(
  dependencies: RemoveParticipantRouteDependencies,
  callback: () => Result,
): Result {
  if (process.env.NODE_ENV !== "test") throw new Error("Remove participant route dependency overrides are test-only.");
  return testDependencies.run(dependencies, callback);
}

function createRouteDependencies(): RemoveParticipantRouteDependencies {
  const clientPromise = clerkClient();
  return {
    authenticate: async () => (await auth()).userId,
    findQuest: async (id) => findGroupQuestById(await clientPromise, id),
    getHost: async (userId) => (await clientPromise).users.getUser(userId),
    saveHost: async (userId, privateMetadata) => {
      await (await clientPromise).users.updateUserMetadata(userId, { privateMetadata });
    },
  };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const dependencies = process.env.NODE_ENV === "test"
    ? testDependencies.getStore() ?? createRouteDependencies()
    : createRouteDependencies();
  const userId = await dependencies.authenticate();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "sign_in_required" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null) as { participantUserId?: unknown } | null;
  const participantUserId = typeof payload?.participantUserId === "string" ? payload.participantUserId : "";

  if (!participantUserId) {
    return NextResponse.json({ ok: false, error: "participant_required" }, { status: 400 });
  }

  if (participantUserId === userId) {
    return NextResponse.json({ ok: false, error: "cannot_remove_self" }, { status: 400 });
  }

  const found = await dependencies.findQuest(id);
  if (!found) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  if (isGroupQuestFinished(found.groupQuest)) {
    return NextResponse.json({ ok: false, error: "finished" }, { status: 400 });
  }

  if (found.groupQuest.hostUserId !== userId) {
    return NextResponse.json({ ok: false, error: "host_only" }, { status: 403 });
  }

  const host = await dependencies.getHost(found.userId);
  const privateMetadata = host.privateMetadata && typeof host.privateMetadata === "object"
    ? host.privateMetadata as Record<string, unknown>
    : {};
  const authoritativeQuest = getStoredGroupQuests(privateMetadata).find((quest) => quest.id === id);
  if (!authoritativeQuest) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  if (authoritativeQuest.hostUserId !== userId) {
    return NextResponse.json({ ok: false, error: "host_only" }, { status: 403 });
  }
  if (isGroupQuestFinished(authoritativeQuest)) {
    return NextResponse.json({ ok: false, error: "finished" }, { status: 400 });
  }
  const joined = authoritativeQuest.participants.some((participant) => participant.userId === participantUserId);
  if (!joined) {
    return NextResponse.json({ ok: false, error: "participant_not_found" }, { status: 404 });
  }

  const updatedQuest = removeParticipantFromGroupQuest(authoritativeQuest, participantUserId);
  await dependencies.saveHost(found.userId, {
    ...privateMetadata,
    sqcAnalytics: compactAnalyticsStore(getAnalyticsStore(privateMetadata)),
    sqcGroupQuests: upsertHostGroupQuest(privateMetadata, updatedQuest),
  });

  return NextResponse.json({ ok: true, href: `/groupquests/${id}` });
}
