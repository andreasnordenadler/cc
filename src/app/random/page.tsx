import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import ChallengeRoulette from "@/components/challenge-roulette";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, getDailyChallenge } from "@/lib/challenges";

export const metadata: Metadata = {
  title: "Random quest machine — Side Quest Chess",
  description: "Spin up a random Solo Side Quest, preview the proof rules, and share the exact friend-quest link.",
  alternates: { canonical: "/random" },
  openGraph: {
    title: "Random quest machine — Side Quest Chess",
    description: "Spin up a random chess Side Quest, preview the proof rules, and send it to a friend with the same reward and receipt path.",
    url: "/random",
    siteName: "Side Quest Chess",
    type: "website",
    images: [{ url: "/api/og/dare/queen-never-heard-of-her", width: 1200, height: 630, alt: "Side Quest Chess random quest machine preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Random quest machine — Side Quest Chess",
    description: "Spin up a random chess side quest and send the exact friend-quest link.",
    images: ["/api/og/dare/queen-never-heard-of-her"],
  },
};

export default async function RandomDarePage() {
  const { userId } = await auth();
  const initialChallenge = getDailyChallenge();

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="random" />

      <div className="content-wrap">
        <ChallengeRoulette challenges={CHALLENGES} initialChallengeId={initialChallenge.id} />

        <section className="grid" aria-label="Why random works">
          <article className="stat-card mission-card">
            <span className="eyebrow">One-click run</span>
            <h3>Spin, inspect, start.</h3>
            <p>The page gives each random Solo Side Quest a clear proof preview and a deliberate next step.</p>
          </article>
          <article className="stat-card mission-card">
            <span className="eyebrow">Exact links</span>
            <h3>Every result has a friend-quest URL.</h3>
            <p>The share path points recipients straight at the same quest, coat, reward, and rules.</p>
          </article>
          <article className="stat-card mission-card">
            <span className="eyebrow">Still verifiable</span>
            <h3>Ridiculous, not vague.</h3>
            <p>Each spin keeps the rule checklist and real-game verification path intact.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
