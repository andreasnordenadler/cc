import { getCustomSideQuests, type CustomSideQuest } from "./custom-side-quests";
import type { UserMetadataRecord } from "./user-metadata";

export type CustomQuestDeleteInput = {
  customSideQuests: CustomSideQuest[];
  privateMetadata: UserMetadataRecord;
  publicMetadata: UserMetadataRecord;
  clearActiveChallenge: boolean;
};

export type CustomQuestDeleteDependencies = {
  getAuthenticatedUserId: (request: Request) => Promise<string | null>;
  getMetadata: (userId: string) => Promise<{
    publicMetadata: UserMetadataRecord;
    privateMetadata: UserMetadataRecord;
  }>;
  persistDeletion: (userId: string, input: CustomQuestDeleteInput) => Promise<CustomSideQuest[]>;
  logPersistenceError?: (message: string, context: { reason: "metadata_load_error" | "persistence_error" }) => void;
};

function unavailableDeleteResponse() {
  return Response.json(
    {
      apiVersion: 1,
      authenticated: true,
      ok: false,
      message: "Could not delete this custom Side Quest right now. Please try again.",
    },
    { status: 503 },
  );
}

export async function handleCustomQuestDeleteRequest(
  request: Request,
  dependencies: CustomQuestDeleteDependencies,
): Promise<Response> {
  const userId = await dependencies.getAuthenticatedUserId(request).catch(() => null);
  if (!userId) {
    return Response.json(
      { apiVersion: 1, authenticated: false, ok: false, message: "Sign in to delete custom Side Quests." },
      { status: 401 },
    );
  }

  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^custom-[a-z0-9-]+$/i.test(id)) {
    return Response.json(
      { apiVersion: 1, authenticated: true, ok: false, message: "Unknown custom Side Quest." },
      { status: 400 },
    );
  }

  let metadata: Awaited<ReturnType<CustomQuestDeleteDependencies["getMetadata"]>>;
  try {
    metadata = await dependencies.getMetadata(userId);
  } catch {
    dependencies.logPersistenceError?.("mobile custom Side Quest delete failed", { reason: "metadata_load_error" });
    return unavailableDeleteResponse();
  }
  const { publicMetadata, privateMetadata } = metadata;
  const privateQuests = getCustomSideQuests(privateMetadata);
  const existing = privateQuests.length ? privateQuests : getCustomSideQuests(publicMetadata);
  if (!existing.some((item) => item.id === id)) {
    return Response.json(
      {
        apiVersion: 1,
        authenticated: true,
        ok: false,
        message: "That Custom Side Quest was not found in your library.",
      },
      { status: 404 },
    );
  }
  const customSideQuests = existing.filter((item) => item.id !== id);
  const activeChallenge = publicMetadata.activeChallenge;
  const clearActiveChallenge = Boolean(
    activeChallenge
    && typeof activeChallenge === "object"
    && (activeChallenge as { id?: string }).id === id,
  );
  let saved: CustomSideQuest[];
  try {
    saved = await dependencies.persistDeletion(userId, {
      customSideQuests,
      privateMetadata,
      publicMetadata,
      clearActiveChallenge,
    });
  } catch {
    dependencies.logPersistenceError?.("mobile custom Side Quest delete failed", { reason: "persistence_error" });
    return unavailableDeleteResponse();
  }

  return Response.json({
    apiVersion: 1,
    authenticated: true,
    ok: true,
    action: "delete",
    customSideQuests: saved,
    message: "Custom Side Quest deleted.",
  });
}
