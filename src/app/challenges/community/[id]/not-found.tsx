import Link from "next/link";
import SiteNav from "@/components/site-nav";

export default function CommunitySideQuestNotFound() {
  return (
    <main className="site-shell">
      <SiteNav isSignedIn={false} active="challenges" />
      <div className="content-wrap quest-detail-wrap">
        <section className="hero-card detail-hero quest-detail-hero community-side-quest-detail-hero">
          <span className="eyebrow">Community Solo Side Quest</span>
          <h1>This recipe slipped off the tavern wall.</h1>
          <p className="hero-copy">
            The Community Solo link may be malformed, unpublished, archived, or cleaned up. Draft and private custom Side Quests stay hidden, even if someone guesses a URL.
          </p>
          <div className="button-row hero-actions quest-detail-actions">
            <Link className="button primary" href="/challenges/community">Browse Community Solo</Link>
            <Link className="button secondary" href="/account">Open your account</Link>
            <Link className="button ghost" href="/support?topic=community-side-quest">Ask Support</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
