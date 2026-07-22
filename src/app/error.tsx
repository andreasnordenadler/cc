"use client";

import MobileAppWebShell from "@/components/mobile-app-web-shell";
import { CHALLENGES } from "@/lib/challenges";

const savedOfficialChallenges = CHALLENGES.slice(0, 6);

export default function ErrorScreen({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <MobileAppWebShell activeTab="home" signedIn={false} immersivePresentation>
      <div className="sqc-stack sqc-offline-screen">
        <section className="sqc-native-card sqc-offline-card" role="alert" aria-live="assertive">
          <span className="sqc-card-eyebrow">Side Quest Chess</span>
          <h1>Side Quest board unavailable</h1>
          <p>The live board could not refresh. This may be a temporary connection or service problem, so no live quest or account data is shown.</p>
          <button className="sqc-primary-action" type="button" onClick={unstable_retry}>Try the live board again</button>
        </section>
        <section className="sqc-native-card sqc-offline-catalog" aria-labelledby="saved-official-board-title">
          <span className="sqc-card-eyebrow">Offline preview</span>
          <h2 id="saved-official-board-title">Saved official board</h2>
          <p>Live account, likes, progress, and Multiplayer are unavailable. These official rules are bundled with this website and remain safe to browse here.</p>
          <div className="sqc-offline-quest-list">
            {savedOfficialChallenges.map((challenge) => (
              <details key={challenge.id}>
                <summary>
                  <strong>{challenge.title}</strong>
                  <span>{challenge.objective}</span>
                </summary>
                <div className="sqc-offline-quest-rules">
                  <p>{challenge.instruction}</p>
                  <ul>
                    {challenge.rules.map((rule) => <li key={rule}>{rule}</li>)}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </MobileAppWebShell>
  );
}
