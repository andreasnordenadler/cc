export type QuestGameStartEligibility =
  | { status: "eligible"; gameStartedAtUtc: string; questStartedAtUtc: string }
  | { status: "before_cutoff"; gameStartedAtUtc: string; questStartedAtUtc: string; message: string }
  | { status: "game_start_unconfirmed"; message: string }
  | { status: "quest_start_unconfirmed"; message: string };

type QuestGameStartEligibilityInput = {
  gameStartedAt?: string;
  gameCompletedAt?: string;
  questStartedAt?: string;
};

const GAME_START_UNCONFIRMED_MESSAGE = "The chess provider did not supply a valid authoritative game-start time. Play a fresh public game, then check again.";
const QUEST_START_UNCONFIRMED_MESSAGE = "This quest has no valid persisted start time. Restart or rejoin the quest before checking a game.";

function parseUtcTimestamp(value?: string): { timestamp: number; iso: string } | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return { timestamp, iso: new Date(timestamp).toISOString() };
}

export function evaluateQuestGameStartEligibility({
  gameStartedAt,
  questStartedAt,
}: QuestGameStartEligibilityInput): QuestGameStartEligibility {
  const questStart = parseUtcTimestamp(questStartedAt);
  if (!questStart) {
    return { status: "quest_start_unconfirmed", message: QUEST_START_UNCONFIRMED_MESSAGE };
  }

  const gameStart = parseUtcTimestamp(gameStartedAt);
  if (!gameStart) {
    return { status: "game_start_unconfirmed", message: GAME_START_UNCONFIRMED_MESSAGE };
  }

  if (gameStart.timestamp <= questStart.timestamp) {
    return {
      status: "before_cutoff",
      gameStartedAtUtc: gameStart.iso,
      questStartedAtUtc: questStart.iso,
      message: "This game started before the quest was accepted. Play a fresh public game after starting the quest, then check again.",
    };
  }

  return {
    status: "eligible",
    gameStartedAtUtc: gameStart.iso,
    questStartedAtUtc: questStart.iso,
  };
}

export function getMultiplayerQuestStartCutoff(
  _quest: { official?: boolean; startAt?: string },
  participant: { joinedAt?: string },
): string | undefined {
  return participant.joinedAt;
}
