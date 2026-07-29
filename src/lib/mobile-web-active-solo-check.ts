import type { SoloCheckActionResult, SoloCheckResult, SoloCompletion } from "./solo-check-result";

type FetchActiveSolo = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type ActiveSoloCheckPayload = {
  ok?: unknown;
  message?: unknown;
  completion?: unknown;
};

function parseSoloCompletion(value: unknown): SoloCompletion | null {
  if (!value || typeof value !== "object") return null;
  const completion = value as Record<string, unknown>;
  const fields = ["challengeId", "challengeTitle", "badgeName", "badgeImage", "unlockCopy", "accentColor"] as const;
  if (fields.some((field) => typeof completion[field] !== "string" || !(completion[field] as string).trim())) return null;
  const badgeImage = (completion.badgeImage as string).trim();
  const accentColor = (completion.accentColor as string).trim();
  if (!/^\/(?:badges|mobile-source\/badges)\/[A-Za-z0-9._/-]+$/.test(badgeImage) || badgeImage.split("/").includes("..")) return null;
  if (accentColor.length > 100 || /url\s*\(|[;{}]/i.test(accentColor)) return null;
  return Object.fromEntries(fields.map((field) => [field, (completion[field] as string).trim()])) as unknown as SoloCompletion;
}

export function shouldReloadCustomSoloAfterCheck(result: SoloCheckResult): boolean {
  return result.status === "checked";
}

export async function checkActiveCustomSoloQuestAction(
  previousState: SoloCheckActionResult,
  formData: FormData,
): Promise<SoloCheckActionResult> {
  void previousState;
  void formData;
  return checkActiveCustomSoloQuest();
}

export async function checkActiveCustomSoloQuest(fetcher: FetchActiveSolo = fetch): Promise<SoloCheckActionResult> {
  try {
    const response = await fetcher("/api/mobile/quest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "check" }),
    });
    const payload = await response.json().catch(() => null) as ActiveSoloCheckPayload | null;
    if (!response.ok || payload?.ok !== true) {
      return {
        status: "error",
        completion: null,
        message: null,
        error: "Could not check this Side Quest. Try again in a moment.",
      };
    }
    const message = typeof payload.message === "string" && payload.message.trim()
      ? payload.message.trim()
      : "Side Quest proof checked. Your latest result is shown below.";
    const completion = parseSoloCompletion(payload.completion);
    if (completion) {
      return { status: "completed", completion, message, error: null };
    }
    return { status: "checked", completion: null, message, error: null };
  } catch {
    return {
      status: "error",
      completion: null,
      message: null,
      error: "Could not check this Side Quest. Try again in a moment.",
    };
  }
}
