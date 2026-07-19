"use client";

import MobileAppWebShell from "@/components/mobile-app-web-shell";

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
      </div>
    </MobileAppWebShell>
  );
}
