import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

export const metadata = {
  title: "Quest not found — Side Quest Chess",
  description: "A Side Quest Chess page could not be found. Return to Solo Side Quests, Multiplayer tables, or support.",
};

export default async function NotFoundPage() {
  const { userId } = await auth();

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />
      <div className="content-wrap quest-detail-wrap">
        <section className="hero-card detail-hero quest-detail-hero">
          <span className="eyebrow">Lost Side Quest</span>
          <h1>This page slipped off the tavern wall.</h1>
          <p className="hero-copy">
            The link may be old, mistyped, private, or already cleaned up. Your SQC account, proof receipts, and public tables are still available from the main rooms.
          </p>
          <div className="next-step-panel" aria-label="Choose where to go next">
            <div>
              <span className="eyebrow">Next step</span>
              <h2>Pick up the run from a safe room.</h2>
              <p>Browse official Solo Side Quests, find a Multiplayer table, or ask Support if a proof receipt or Community Solo Side Quest link should still exist.</p>
            </div>
            <div className="button-row hero-actions quest-detail-actions">
              <Link className="button primary" href="/solo">Browse Solo Side Quests</Link>
              <Link className="button secondary" href="/groupquests/public">Find a Multiplayer table</Link>
              <Link className="button ghost" href="/support">Open support</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
