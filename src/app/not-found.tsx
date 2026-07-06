import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

export const metadata = {
  title: "Quest not found — Side Quest Chess",
  description: "A Side Quest Chess page could not be found. Return to Solo Side Quests, Multiplayer Side Quests, or Help & Support.",
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
            The link may be old, mistyped, private, or already cleaned up. Your SQC account, proof receipts, and public Multiplayer Side Quests are still available from the main app sections.
          </p>
          <div className="next-step-panel" aria-label="Choose where to go next">
            <div>
              <span className="eyebrow">Next step</span>
              <h2>Pick up the quest from a working route.</h2>
              <p>Browse official Solo Side Quests, find a Multiplayer Side Quest, or ask Help &amp; Support if a proof receipt or Community Solo Side Quest link should still exist.</p>
            </div>
            <div className="button-row hero-actions quest-detail-actions">
              <Link className="button primary" href="/solo">Browse Solo Side Quests</Link>
              <Link className="button secondary" href="/groupquests/public">Find a Multiplayer Side Quest</Link>
              <Link className="button ghost" href="/support">Open Help &amp; Support</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
