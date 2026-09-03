import MobileAppWebShell, { MobileSimpleScreen } from "@/components/mobile-app-web-shell";
import Link from "next/link";

export default function NotFound() {
  return (
    <MobileAppWebShell activeTab="home" signedIn={false} desktopPresentation="recovery">
      <div className="sqc-recovery-mobile">
        <MobileSimpleScreen
          eyebrow="Home"
          title="Side Quest Chess"
          body="Chess, but with stupidly hard side quests — solo or multiplayer. Browse the live boards first; sign in when you want Side Quest Chess to save progress, verify proof, or join a table."
          primaryAction={{ label: "Browse Solo Side Quests", href: "/side-quests" }}
          secondaryAction={{ label: "Browse Multiplayer Side Quests", href: "/multiplayer" }}
        />
      </div>
      <section className="sqc-desktop-recovery" aria-labelledby="desktop-recovery-title">
        <div className="sqc-desktop-recovery-copy">
          <span className="sqc-card-eyebrow">404 · Wrong square</span>
          <h1 id="desktop-recovery-title">That page wandered off the board.</h1>
          <p>The position is gone, but the live Side Quests are still in play. Pick up from the board that matches what you came to do.</p>
          <Link href="/" className="sqc-primary-action">Return home</Link>
        </div>
        <nav className="sqc-desktop-recovery-routes" aria-label="Recovery destinations">
          <Link href="/side-quests"><span>01</span><strong>Browse Solo</strong><small>Pick an official challenge.</small></Link>
          <Link href="/community-side-quests"><span>02</span><strong>Browse Community</strong><small>Find player-made Side Quests.</small></Link>
          <Link href="/multiplayer"><span>03</span><strong>Browse Multiplayer</strong><small>Join a shared objective.</small></Link>
          <Link href="/support"><span>04</span><strong>Get help</strong><small>Visit support and troubleshooting.</small></Link>
        </nav>
      </section>
    </MobileAppWebShell>
  );
}
