export type MultiplayerCreateIntent = {
  sequence: number;
  pendingToken: number;
  pendingQuestId: string | null;
};

export const initialMultiplayerCreateIntent: MultiplayerCreateIntent = {
  sequence: 0,
  pendingToken: 0,
  pendingQuestId: null,
};

export function requestMultiplayerCreateIntent(
  current: MultiplayerCreateIntent,
  questId?: string,
): MultiplayerCreateIntent {
  const sequence = current.sequence + 1;
  return {
    sequence,
    pendingToken: sequence,
    pendingQuestId: questId ?? null,
  };
}

export function consumeMultiplayerCreateIntent(
  current: MultiplayerCreateIntent,
): MultiplayerCreateIntent {
  return {
    ...current,
    pendingToken: 0,
    pendingQuestId: null,
  };
}

export function scheduleMultiplayerCreateOpen({
  pendingToken,
  handledToken,
  delayMs,
  onOpen,
}: {
  pendingToken: number;
  handledToken: number;
  delayMs: number;
  onOpen: (token: number) => void;
}): () => void {
  if (!pendingToken || handledToken === pendingToken) return () => undefined;

  const timer = setTimeout(() => onOpen(pendingToken), delayMs);
  return () => clearTimeout(timer);
}

export async function completeMultiplayerCreateTransition({
  createdGroupQuestId,
  message,
  closeCreate,
  consumeIntent,
  resetDraft,
  refreshAccount,
  waitForRefresh,
  publishSuccess,
  openCreatedQuest,
}: {
  createdGroupQuestId: string;
  message: string;
  closeCreate: () => void;
  consumeIntent: () => void;
  resetDraft: () => void;
  refreshAccount: () => unknown | PromiseLike<unknown>;
  waitForRefresh: () => unknown | PromiseLike<unknown>;
  publishSuccess: (questId: string, message: string) => void;
  openCreatedQuest: (questId: string) => void;
}): Promise<void> {
  closeCreate();
  consumeIntent();
  resetDraft();
  await refreshAccount();
  await waitForRefresh();
  await refreshAccount();
  publishSuccess(createdGroupQuestId, message);
  openCreatedQuest(createdGroupQuestId);
}
