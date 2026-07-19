import MobileAppWebShell from "@/components/mobile-app-web-shell";

export default function Loading() {
  return (
    <MobileAppWebShell activeTab="home" signedIn={false}>
      <div className="sqc-stack sqc-loading-screen">
        <section className="sqc-native-card sqc-loading-card" role="status" aria-live="polite" aria-busy="true">
          <span className="sqc-loading-spinner" aria-hidden="true" />
          <div>
            <span className="sqc-card-eyebrow">Side Quest Chess</span>
            <h2>Loading the live quest board…</h2>
            <p>Checking the current Side Quests and your account state.</p>
          </div>
        </section>
      </div>
    </MobileAppWebShell>
  );
}
