import MobileAppWebShell from "@/components/mobile-app-web-shell";

export default function Loading() {
  return (
    <MobileAppWebShell activeTab="home" signedIn={false} loadingPresentation>
      <div className="sqc-stack sqc-loading-screen">
        <section className="sqc-loading-card" role="status" aria-live="polite" aria-busy="true">
          <span className="sqc-loading-spinner" aria-hidden="true" />
          <p>Loading the live quest board...</p>
        </section>
      </div>
    </MobileAppWebShell>
  );
}
