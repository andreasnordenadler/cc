export type MultiplayerProvider = "lichess" | "chesscom";
export type MultiplayerGameResult = "win" | "draw" | "lose" | "unknown";

export type MultiplayerGameMetadata = {
  provider: MultiplayerProvider;
  gameId: string;
  gameUrl: string;
  timeControl: "bullet" | "blitz" | "rapid" | "classical" | "daily" | "unknown";
  initialSeconds?: number;
  incrementSeconds?: number;
  rated: boolean | null;
  playerColor: "white" | "black" | null;
  playedAt?: string;
  variant: "standard" | string | null;
  result: MultiplayerGameResult;
};

export type MultiplayerProofMismatchReason =
  | "metadata_missing"
  | "provider_mismatch"
  | "time_control_mismatch"
  | "rated_state_mismatch"
  | "player_color_mismatch"
  | "variant_mismatch"
  | "outside_time_window"
  | "result_mismatch";

export type MultiplayerProofRuleDecision =
  | { ok: true; reasons: []; summary: string }
  | { ok: false; reasons: MultiplayerProofMismatchReason[]; summary: string };

export function evaluateMultiplayerProofRules(input: {
  expectedProvider: MultiplayerProvider;
  rules?: Record<string, string>;
  startAt?: string;
  endAt?: string;
  game?: MultiplayerGameMetadata | null;
}): MultiplayerProofRuleDecision {
  const game = input.game;
  if (!game || !game.gameId || !game.gameUrl || game.timeControl === "unknown" || game.rated === null || !game.playerColor || !game.playedAt || !Number.isFinite(Date.parse(game.playedAt)) || !game.variant || game.result === "unknown") {
    return { ok: false, reasons: ["metadata_missing"], summary: "Latest game metadata is unavailable, so proof cannot be awarded. Play a new public standard game and refresh." };
  }

  const reasons: MultiplayerProofMismatchReason[] = [];
  if (game.provider !== input.expectedProvider) reasons.push("provider_mismatch");

  const selectedTimeControl = input.rules?.timeControl?.trim().toLowerCase() ?? "any time control";
  if (selectedTimeControl !== "any time control" && game.timeControl !== selectedTimeControl) reasons.push("time_control_mismatch");

  const ratedRule = input.rules?.rated?.trim().toLowerCase() ?? "any rated state";
  if ((ratedRule === "rated only" && game.rated !== true) || (ratedRule === "casual only" && game.rated !== false)) reasons.push("rated_state_mismatch");

  const colorRule = input.rules?.color?.trim().toLowerCase() ?? "any color";
  if ((colorRule === "white only" && game.playerColor !== "white") || (colorRule === "black only" && game.playerColor !== "black")) reasons.push("player_color_mismatch");

  if (game.variant !== "standard") reasons.push("variant_mismatch");

  const playedTs = game.playedAt ? Date.parse(game.playedAt) : NaN;
  const startTs = input.startAt ? Date.parse(input.startAt) : NaN;
  const endTs = input.endAt ? Date.parse(input.endAt) : NaN;
  if ((Number.isFinite(startTs) || Number.isFinite(endTs)) && !Number.isFinite(playedTs)) reasons.push("outside_time_window");
  else if ((Number.isFinite(startTs) && playedTs <= startTs) || (Number.isFinite(endTs) && playedTs > endTs)) reasons.push("outside_time_window");

  const resultRule = input.rules?.result?.trim().toLowerCase() ?? "any result";
  if (resultRule === "win required" && game.result !== "win") reasons.push("result_mismatch");

  if (!reasons.length) return { ok: true, reasons: [], summary: "Latest game matches all selected Multiplayer proof rules." };
  return { ok: false, reasons, summary: mismatchSummary(reasons) };
}

function mismatchSummary(reasons: MultiplayerProofMismatchReason[]) {
  const actions: Record<MultiplayerProofMismatchReason, string> = {
    metadata_missing: "game metadata was unavailable",
    provider_mismatch: "the game came from the wrong provider",
    time_control_mismatch: "the time control did not match",
    rated_state_mismatch: "the rated/casual setting did not match",
    player_color_mismatch: "the player color did not match",
    variant_mismatch: "the game was not standard chess",
    outside_time_window: "the game was outside the quest time window",
    result_mismatch: "the required result was not achieved",
  };
  return `Proof was not awarded because ${reasons.map((reason) => actions[reason]).join(", ")}. Play a new public game matching every selected rule, then refresh.`;
}
