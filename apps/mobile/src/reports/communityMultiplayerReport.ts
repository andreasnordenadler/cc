import { submitMobileCommunityMultiplayerReport } from "../api/sqc";

type ReportableQuest = {
  official?: boolean;
  inviteMode?: "public" | "unlisted-link" | "private-key";
  isOwner?: boolean;
};

type SubmitInput = Parameters<typeof submitMobileCommunityMultiplayerReport>[0];
type SubmitResult = Awaited<ReturnType<typeof submitMobileCommunityMultiplayerReport>>;
type SubmitReport = (input: SubmitInput) => Promise<SubmitResult>;

export function canReportCommunityMultiplayerQuest(quest: ReportableQuest | null, signedIn: boolean) {
  return Boolean(signedIn && quest && !quest.official && quest.inviteMode === "public" && !quest.isOwner);
}

export function createMobileCommunityReportSubmitter(submitReport: SubmitReport = submitMobileCommunityMultiplayerReport) {
  let busy = false;
  return async (resolveInput: () => Promise<SubmitInput>) => {
    if (busy) return { kind: "busy" as const, message: "Report already sending." };
    busy = true;
    try {
      return { kind: "success" as const, result: await submitReport(await resolveInput()) };
    } finally {
      busy = false;
    }
  };
}
