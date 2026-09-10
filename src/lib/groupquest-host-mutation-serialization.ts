const mutationState = globalThis as typeof globalThis & {
  __sqcHostGroupQuestMutationTails?: Map<string, Promise<void>>;
};
const hostMutationTails = mutationState.__sqcHostGroupQuestMutationTails ??= new Map<string, Promise<void>>();

export async function runSerializedHostGroupQuestMutation<Result>(
  hostUserId: string,
  mutation: () => Promise<Result>,
): Promise<Result> {
  const previous = hostMutationTails.get(hostUserId) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const tail = previous.catch(() => undefined).then(() => current);
  hostMutationTails.set(hostUserId, tail);

  await previous.catch(() => undefined);
  try {
    return await mutation();
  } finally {
    release();
    if (hostMutationTails.get(hostUserId) === tail) {
      hostMutationTails.delete(hostUserId);
    }
  }
}
