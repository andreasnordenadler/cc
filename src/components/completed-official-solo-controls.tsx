import Link from "next/link";
import ResetQuestControl from "@/components/reset-quest-control";
import type { Challenge } from "@/lib/challenges";

export default function CompletedOfficialSoloControls({
  challenge,
  proofPath,
}: {
  challenge: Challenge;
  proofPath: string | null;
}) {
  return (
    <section className="sqc-native-card sqc-proof-action-card" aria-label="Completed Solo Side Quest management">
      <span className="sqc-card-eyebrow">Completed Side Quest</span>
      <h2>{proofPath ? "Your accepted proof is ready." : "This legacy completion has no accepted receipt attached."}</h2>
      <p>
        {proofPath
          ? "Open the same verified proof receipt available from Android v338, or reset this Side Quest to run it again."
          : "You can still reset this saved completion and run the Side Quest again to create a new verified receipt."}
      </p>
      <div className="sqc-active-detail-management">
        {proofPath ? <Link href={proofPath} className="sqc-primary-action">View proof details</Link> : null}
        <ResetQuestControl challenge={challenge} />
      </div>
    </section>
  );
}
