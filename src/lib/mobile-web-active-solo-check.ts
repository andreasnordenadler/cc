import type { SoloCheckActionResult } from "./solo-check-result";

type FetchActiveSolo = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

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
    const payload = await response.json().catch(() => null) as { ok?: unknown; message?: unknown } | null;
    if (!response.ok || payload?.ok !== true) {
      return {
        status: "error",
        completion: null,
        message: null,
        error: "Could not check this Side Quest. Try again in a moment.",
      };
    }
    return {
      status: "checked",
      completion: null,
      message: typeof payload.message === "string" && payload.message.trim()
        ? payload.message.trim()
        : "Side Quest proof checked. Your latest result is shown below.",
      error: null,
    };
  } catch {
    return {
      status: "error",
      completion: null,
      message: null,
      error: "Could not check this Side Quest. Try again in a moment.",
    };
  }
}
