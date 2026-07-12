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
  | "invalid_rule"
  | "invalid_date"
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
  const timeControlRule = parseTimeControlRule(input.rules?.timeControl);
  const ratedRule = normalizeRule(input.rules?.rated, ["any rated state", "rated only", "casual only"], "any rated state");
  const colorRule = normalizeRule(input.rules?.color, ["any color", "white only", "black only"], "any color");
  const resultRule = normalizeRule(input.rules?.result, ["any result", "win required"], "any result");
  if (!timeControlRule || !ratedRule || !colorRule || !resultRule) {
    return { ok: false, reasons: ["invalid_rule"], summary: mismatchSummary(["invalid_rule"]) };
  }
  if (!isValidProofWindow(input.startAt, input.endAt)) {
    return { ok: false, reasons: ["invalid_date"], summary: mismatchSummary(["invalid_date"]) };
  }
  const game = input.game;
  if (!game || !game.gameId || !game.gameUrl || game.timeControl === "unknown" || game.rated === null || !game.playerColor || !game.playedAt || !Number.isFinite(Date.parse(game.playedAt)) || !game.variant || game.result === "unknown") {
    return { ok: false, reasons: ["metadata_missing"], summary: "Latest game metadata is unavailable, so proof cannot be awarded. Play a new public standard game and refresh." };
  }

  const reasons: MultiplayerProofMismatchReason[] = [];
  if (game.provider !== input.expectedProvider) reasons.push("provider_mismatch");

  if (timeControlRule.kind === "exact" && (!Number.isFinite(game.initialSeconds) || !Number.isFinite(game.incrementSeconds))) {
    return { ok: false, reasons: ["metadata_missing"], summary: "Latest game metadata is unavailable, so proof cannot be awarded. Play a new public standard game and refresh." };
  }
  if (timeControlRule.kind !== "any" && (game.timeControl !== timeControlRule.timeClass || (timeControlRule.kind === "exact" && (game.initialSeconds !== timeControlRule.initialSeconds || game.incrementSeconds !== timeControlRule.incrementSeconds)))) reasons.push("time_control_mismatch");

  if ((ratedRule === "rated only" && game.rated !== true) || (ratedRule === "casual only" && game.rated !== false)) reasons.push("rated_state_mismatch");

  if ((colorRule === "white only" && game.playerColor !== "white") || (colorRule === "black only" && game.playerColor !== "black")) reasons.push("player_color_mismatch");

  if (game.variant !== "standard") reasons.push("variant_mismatch");

  const playedTs = game.playedAt ? Date.parse(game.playedAt) : NaN;
  const startTs = input.startAt ? Date.parse(input.startAt) : NaN;
  const endTs = input.endAt ? Date.parse(input.endAt) : NaN;
  if ((Number.isFinite(startTs) || Number.isFinite(endTs)) && !Number.isFinite(playedTs)) reasons.push("outside_time_window");
  else if ((Number.isFinite(startTs) && playedTs <= startTs) || (Number.isFinite(endTs) && playedTs > endTs)) reasons.push("outside_time_window");

  if (resultRule === "win required" && game.result !== "win") reasons.push("result_mismatch");

  if (!reasons.length) return { ok: true, reasons: [], summary: "Latest game matches all selected Multiplayer proof rules." };
  return { ok: false, reasons, summary: mismatchSummary(reasons) };
}

function mismatchSummary(reasons: MultiplayerProofMismatchReason[]) {
  const actions: Record<MultiplayerProofMismatchReason, string> = {
    metadata_missing: "game metadata was unavailable",
    invalid_rule: "the stored proof rule was invalid",
    invalid_date: "the stored quest date was invalid",
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

type ParsedTimeControlRule =
  | { kind: "any" }
  | { kind: "class"; timeClass: Exclude<MultiplayerGameMetadata["timeControl"], "unknown"> }
  | { kind: "exact"; timeClass: Exclude<MultiplayerGameMetadata["timeControl"], "unknown">; initialSeconds: number; incrementSeconds: number };

export function parseMultiplayerTimeControlRule(value?: string): ParsedTimeControlRule | null {
  const normalized = value === undefined ? "any time control" : value.trim().toLowerCase();
  if (normalized === "any time control") return { kind: "any" };
  const match = normalized.match(/^(bullet|blitz|rapid|classical|daily)(?:\s+(\d+)\+(\d+))?$/);
  if (!match) return null;
  const timeClass = match[1] as Exclude<MultiplayerGameMetadata["timeControl"], "unknown">;
  if (match[2] === undefined) return { kind: "class", timeClass };
  return { kind: "exact", timeClass, initialSeconds: Number(match[2]) * 60, incrementSeconds: Number(match[3]) };
}

export function validateMultiplayerProofConfiguration(input: {
  providerMode?: unknown;
  startAt?: unknown;
  endAt?: unknown;
  rules?: unknown;
}):
  | { ok: false; code: "invalid_rule" | "invalid_date" }
  | { ok: true; providerMode?: "both" | MultiplayerProvider; startAt?: string; endAt?: string; rules?: Record<string, string> } {
  const output: { ok: true; providerMode?: "both" | MultiplayerProvider; startAt?: string; endAt?: string; rules?: Record<string, string> } = { ok: true };
  if (input.providerMode !== undefined) {
    if (typeof input.providerMode !== "string") return { ok: false, code: "invalid_rule" };
    const providerMode = input.providerMode.trim().toLowerCase();
    if (providerMode !== "both" && providerMode !== "lichess" && providerMode !== "chesscom") return { ok: false, code: "invalid_rule" };
    output.providerMode = providerMode;
  }
  for (const key of ["startAt", "endAt"] as const) {
    const value = input[key];
    if (value === undefined) continue;
    if (typeof value !== "string" || !isValidDate(value)) return { ok: false, code: "invalid_date" };
    output[key] = new Date(value).toISOString();
  }
  if (!isValidProofWindow(output.startAt, output.endAt)) return { ok: false, code: "invalid_date" };
  if (input.rules !== undefined) {
    if (!input.rules || typeof input.rules !== "object") return { ok: false, code: "invalid_rule" };
    const record = input.rules as Record<string, unknown>;
    const rules: Record<string, string> = {};
    const definitions = {
      result: ["any result", "win required"],
      rated: ["any rated state", "rated only", "casual only"],
      color: ["any color", "white only", "black only"],
    } as const;
    for (const [key, allowed] of Object.entries(definitions)) {
      const value = record[key];
      if (value === undefined) continue;
      if (typeof value !== "string") return { ok: false, code: "invalid_rule" };
      const normalized = value.trim().toLowerCase();
      if (!(allowed as readonly string[]).includes(normalized)) return { ok: false, code: "invalid_rule" };
      rules[key] = titleCaseRule(normalized);
    }
    if (record.timeControl !== undefined) {
      if (typeof record.timeControl !== "string") return { ok: false, code: "invalid_rule" };
      const parsed = parseMultiplayerTimeControlRule(record.timeControl);
      if (!parsed) return { ok: false, code: "invalid_rule" };
      rules.timeControl = formatTimeControlRule(parsed);
    }
    for (const key of ["customRuleSummary", "customRuleConfig"] as const) {
      if (typeof record[key] === "string" && record[key].trim()) rules[key] = record[key].trim();
    }
    output.rules = rules;
  }
  return output;
}

export function validateMultiplayerProofUpdate(
  input: { providerMode?: unknown; startAt?: unknown; endAt?: unknown; rules?: unknown },
  existing: { startAt?: string; endAt?: string },
) {
  return validateMultiplayerProofConfiguration({
    ...input,
    startAt: input.startAt ?? existing.startAt,
    endAt: input.endAt ?? existing.endAt,
  });
}

function titleCaseRule(value: string) {
  return `${value[0]?.toUpperCase() ?? ""}${value.slice(1)}`;
}

function formatTimeControlRule(rule: ParsedTimeControlRule) {
  if (rule.kind === "any") return "Any time control";
  const label = titleCaseRule(rule.timeClass);
  return rule.kind === "exact" ? `${label} ${rule.initialSeconds / 60}+${rule.incrementSeconds}` : label;
}

function parseTimeControlRule(value?: string) {
  return parseMultiplayerTimeControlRule(value);
}

function normalizeRule<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T | null {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  return allowed.includes(normalized as T) ? normalized as T : null;
}

function isValidDate(value: string) {
  if (!value.trim() || !Number.isFinite(Date.parse(value))) return false;
  const calendarDate = /^(\d{4})-(\d{2})-(\d{2})(?:T|\s|$)/.exec(value.trim());
  if (!calendarDate) return true;
  const year = Number(calendarDate[1]);
  const month = Number(calendarDate[2]);
  const day = Number(calendarDate[3]);
  return month >= 1 && month <= 12 && day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isValidProofWindow(startAt?: string, endAt?: string) {
  if ((startAt !== undefined && !isValidDate(startAt)) || (endAt !== undefined && !isValidDate(endAt))) return false;
  return startAt === undefined || endAt === undefined || Date.parse(endAt) > Date.parse(startAt);
}
