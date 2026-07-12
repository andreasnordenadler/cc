import { buildActiveMultiplayerHomeRows, buildSoloProofHomeStatus, type SoloProofHomeAttempt } from "./mobile-web-home";
import { validateCommunitySoloReport } from "./mobile-web-parity-actions";
import type { ServerGroupQuest } from "./groupquests";

type Solo = { id: string; completed: boolean; attempt?: SoloProofHomeAttempt | null };
type CustomInput = { title: string; summary: string };
type MultiplayerInput = { name: string; questIds: string[] };

const NOW = Date.parse("2026-07-12T13:00:00.000Z");

function group(id: string, overrides: Partial<ServerGroupQuest> = {}): ServerGroupQuest {
  return {
    id,
    hostUserId: "other-user",
    hostName: "Fixture Host",
    name: id,
    inviteCopy: "Disposable fixture",
    inviteMode: "public",
    questIds: ["finish-any-game"],
    providerMode: "both",
    providerLabel: "Lichess or Chess.com",
    startAt: "2026-07-10T12:00:00.000Z",
    endAt: "2026-07-20T12:00:00.000Z",
    rules: {},
    createdAt: "2026-07-09T12:00:00.000Z",
    participants: [],
    ...overrides,
  };
}

/** Disposable authenticated integration seam. It has no provider client, fetch,
 * environment credentials, or persistence callbacks, so it cannot touch Clerk
 * or production data. Tests exercise the same pure outcome contracts used by
 * authenticated pages and route handlers. */
export function createAuthenticatedWebFixture() {
  const userId = "fixture-user";
  let signedIn = true;
  let solo: Solo | null = { id: "solo-active", completed: false, attempt: null };
  const likes = new Set<string>();
  let customCount = 0;
  let multiplayerCount = 0;
  const customIds = new Set<string>();
  const quests: ServerGroupQuest[] = [
    group("hosted-active", { hostUserId: userId, name: "Hosted active", startAt: "2026-07-12T12:00:00.000Z" }),
    group("joined-active", { name: "Joined active", startAt: "2026-07-11T12:00:00.000Z", participants: [{ userId, provider: "lichess", username: "fixture-lichess", leaderboardName: "Fixture Runner", joinedAt: "2026-07-10T00:00:00.000Z" }] }),
    group("invited-private", { inviteMode: "private-key", inviteKey: "DISPOSABLE", name: "Private fixture" }),
  ];

  const requireSession = () => signedIn;
  return {
    session: () => signedIn ? { userId } : null,
    account: () => ({ lichessUsername: "fixture-lichess", chessComUsername: "fixture-chess" }),
    home: () => ({
      solo: solo ? { id: solo.id, proof: buildSoloProofHomeStatus(solo.completed, solo.attempt) } : null,
      multiplayer: buildActiveMultiplayerHomeRows(quests, userId, NOW),
    }),
    pickCommunitySolo: (questId: string) => {
      if (!requireSession()) return { ok: false as const, error: "sign_in_required" as const };
      solo = { id: questId, completed: false, attempt: null };
      return { ok: true as const, href: `/challenges/community/${encodeURIComponent(questId)}` };
    },
    likeCommunitySolo: (questId: string) => {
      if (!requireSession()) return { ok: false as const, error: "sign_in_required" as const };
      likes.add(`solo:${questId}`);
      return { ok: true as const, likes: likes.has(`solo:${questId}`) ? 1 : 0 };
    },
    reportCommunitySolo: (questId: string, reason: string) => validateCommunitySoloReport(questId, reason),
    joinInvite: async (inviteKey: string) => {
      if (!requireSession()) return { ok: false as const, error: "sign_in_required" as const };
      const quest = quests.find((item) => item.inviteKey === inviteKey);
      if (!quest) return { ok: false as const, error: "invite_not_found" as const };
      if (!quest.participants.some((participant) => participant.userId === userId)) quest.participants.push({ userId, provider: "lichess", username: "fixture-lichess", leaderboardName: "Fixture Runner", joinedAt: "2026-07-12T13:00:00.000Z" });
      return { ok: true as const, href: `/groupquests/${quest.id}?accepted=1` };
    },
    createCustomSolo: (input: CustomInput) => {
      if (!requireSession()) return { ok: false as const, error: "sign_in_required" as const };
      void input;
      const id = `custom-${++customCount}`;
      customIds.add(id);
      return { ok: true as const, id, href: "/account/custom-side-quests" as const };
    },
    createMultiplayer: (input: MultiplayerInput) => {
      if (!requireSession()) return { ok: false as const, error: "sign_in_required" as const };
      if (!input.questIds.every((id) => customIds.has(id))) return { ok: false as const, error: "invalid_quest" as const };
      const id = `multiplayer-${++multiplayerCount}`;
      quests.push(group(id, { hostUserId: userId, name: input.name, startAt: "2026-07-13T12:00:00.000Z", participants: [{ userId, provider: "lichess", username: "fixture-lichess", leaderboardName: "Fixture Runner", joinedAt: "2026-07-12T13:00:00.000Z" }] }));
      return { ok: true as const, id, href: `/groupquests/${id}?accepted=1` };
    },
    checkProof: (attempt: SoloProofHomeAttempt) => {
      if (solo) solo.attempt = attempt;
      return buildSoloProofHomeStatus(false, attempt);
    },
    resetSolo: (confirmed: boolean) => {
      if (!confirmed) return { ok: false as const, cancelled: true as const };
      solo = null;
      return { ok: true as const, cancelled: false as const };
    },
    logout: () => { signedIn = false; },
  };
}
