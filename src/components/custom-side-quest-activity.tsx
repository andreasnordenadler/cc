import { formatCustomQuestActivity, type CustomSideQuestActivityStats } from "@/lib/custom-side-quest-activity";

export default function CustomSideQuestActivity({ stats }: { stats: CustomSideQuestActivityStats }) {
  return (
    <section className="sqc-native-card sqc-multiplayer-native-card sqc-custom-owner-activity" aria-label="Custom Side Quest activity">
      <span className="sqc-card-eyebrow">Stats</span>
      <h2>Activity so far</h2>
      <p>{formatCustomQuestActivity(stats)}</p>
      <p>Stats show your activity with this Side Quest.</p>
    </section>
  );
}
