import { submitMobileCommunityCreatorReport } from "../api/sqc";

type SubmitInput = Parameters<typeof submitMobileCommunityCreatorReport>[0];
type SubmitResult = Awaited<ReturnType<typeof submitMobileCommunityCreatorReport>>;
type SubmitReport = (input: SubmitInput) => Promise<SubmitResult>;

export function createMobileCommunityCreatorReportSubmitter(submitReport: SubmitReport = submitMobileCommunityCreatorReport) {
  let busy = false;
  return async (resolveInput: () => Promise<SubmitInput>) => {
    if (busy) return { kind: "busy" as const, message: "Creator report already sending." };
    busy = true;
    try {
      return { kind: "success" as const, result: await submitReport(await resolveInput()) };
    } finally {
      busy = false;
    }
  };
}
