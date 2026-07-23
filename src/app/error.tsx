"use client";

import { useState } from "react";
import MobileAppWebShell, { GuestHome } from "@/components/mobile-app-web-shell";
import { CHALLENGES } from "@/lib/challenges";

const androidV338OfflineChallengeIds = [
  "finish-any-game",
  "knights-before-coffee",
  "bishop-field-trip",
  "queen-never-heard-of-her",
  "knightmare-mode",
] as const;

export function getSavedOfficialChallenges() {
  const challengesById = new Map(CHALLENGES.map((challenge) => [challenge.id, challenge]));
  return androidV338OfflineChallengeIds.flatMap((id) => {
    const challenge = challengesById.get(id);
    return challenge ? [challenge] : [];
  });
}

const savedOfficialChallenges = getSavedOfficialChallenges();
type OfflineView = "home" | "solo";
type OfflineState = { view: OfflineView; message: string | null };
type OfflineEvent = "browse-solo" | "back" | "multiplayer" | "sign-in";

export function reduceOfflineView(view: OfflineView, event: "browse-solo" | "back"): OfflineView {
  if (event === "browse-solo") return "solo";
  if (event === "back") return "home";
  return view;
}

export function reduceOfflineState(state: OfflineState, event: OfflineEvent): OfflineState {
  if (event === "browse-solo") return { view: "solo", message: null };
  if (event === "back") return { view: "home", message: null };
  if (event === "multiplayer") return { ...state, message: "Multiplayer Side Quests need the live board. Try again when your connection returns." };
  return { ...state, message: "Sign-in needs a connection. Try the live board again when you are online." };
}

export default function ErrorScreen({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <OfflineErrorContent unstable_retry={unstable_retry} />;
}

function OfflineErrorContent({ unstable_retry }: { unstable_retry: () => void }) {
  const [offlineState, setOfflineState] = useState<OfflineState>({ view: "home", message: null });

  return (
    <MobileAppWebShell activeTab="home" signedIn={false} immersivePresentation>
      <div className="sqc-stack sqc-offline-screen">
        <section className="sqc-offline-notice" role="alert" aria-live="assertive">
          <strong>OFFLINE SIDE QUEST BOARD</strong>
          <span>Showing the saved fallback board because the live board could not refresh.</span>
          <button type="button" onClick={unstable_retry}>Try the live board again</button>
        </section>
        {offlineState.view === "home" ? (
          <>
            <GuestHome
              onBrowseSolo={() => setOfflineState((current) => reduceOfflineState(current, "browse-solo"))}
              onBrowseMultiplayer={() => setOfflineState((current) => reduceOfflineState(current, "multiplayer"))}
              onSignIn={() => setOfflineState((current) => reduceOfflineState(current, "sign-in"))}
            />
            {offlineState.message ? <p className="sqc-offline-message" role="status">{offlineState.message}</p> : null}
          </>
        ) : (
          <section className="sqc-native-card sqc-offline-catalog" aria-labelledby="saved-official-board-title">
            <span className="sqc-card-eyebrow">Offline preview</span>
            <h2 id="saved-official-board-title">Saved official board</h2>
            <p>Live account, likes, progress, and Multiplayer are unavailable. These official rules are bundled with this website and remain safe to browse here.</p>
            <button type="button" className="sqc-detail-quiet-button" onClick={() => setOfflineState((current) => reduceOfflineState(current, "back"))}>Back to offline Home</button>
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
        )}
      </div>
    </MobileAppWebShell>
  );
}
