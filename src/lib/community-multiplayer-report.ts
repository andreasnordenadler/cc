import { validateCommunityMultiplayerReport } from "@/lib/mobile-web-parity-actions";

type ReportRequest = (url: string, init?: RequestInit) => Promise<Response>;

export function createCommunityMultiplayerReportSubmitter(request: ReportRequest = fetch) {
  let busy = false;
  return async (questId: string, reason: string) => {
    if (busy) return { kind: "busy" as const, message: "Report already sending." };
    busy = true;
    try {
      return await submitCommunityMultiplayerReport(questId, reason, request);
    } finally {
      busy = false;
    }
  };
}

export async function submitCommunityMultiplayerReport(questId: string, reason: string, request: ReportRequest = fetch) {
  const validated = validateCommunityMultiplayerReport(questId, reason);
  if (!validated.ok) return { kind: "error" as const, message: validated.message };

  try {
    const response = await request("/api/support", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: validated.message }),
    });
    await response.json().catch(() => ({}));
    if (!response.ok) return { kind: "error" as const, message: "Could not send the report. Try again." };
    return { kind: "success" as const, message: "Report sent. We’ll review this Multiplayer Side Quest." };
  } catch {
    return { kind: "error" as const, message: "Could not send the report. Try again." };
  }
}
