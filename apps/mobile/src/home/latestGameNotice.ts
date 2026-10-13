export type LatestGameVisibility = {
  game: { provider: "lichess" | "chess.com"; gameId: string; startedGameAt?: string; completedGameAt?: string } | null;
  checkedAt: string | null;
  pending: boolean;
};

function utcDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? `${date.toISOString().slice(0, 16).replace("T", " ")} UTC` : null;
}

export function buildLatestGameNotice(visibility: LatestGameVisibility | null | undefined) {
  if (!visibility) return null;
  const game = visibility.game;
  const provider = game?.provider === "lichess" ? "Lichess" : "Chess.com";
  const ended = utcDate(game?.completedGameAt);
  const started = utcDate(game?.startedGameAt);
  const checked = utcDate(visibility.checkedAt);
  return {
    title: game ? "Latest game found" : "No game found yet",
    gameLine: game ? `${provider} · ${ended ? `Ended ${ended}` : started ? `Started ${started} · End time unavailable` : "Game time unavailable"}` : "No public game was observed in the latest checks.",
    checkLine: checked ? `Game search last checked ${checked}` : "Check time unavailable",
    guidance: visibility.pending || !game
      ? "Recently finished games may take a little while to appear on Lichess or Chess.com. If your new game is missing, wait a moment and refresh again."
      : null,
  };
}
