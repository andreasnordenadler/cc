import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import ChallengeRoulette from "@/components/challenge-roulette";
import SiteNav from "@/components/site-nav";
import { CHALLENGES, getDailyChallenge } from "@/lib/challenges";

export const metadata: Metadata = {
  title: "Random quest machine — Side Quest Chess",
  description: "Spin up a random Side Quest Chess quest, accept the bad idea, and send the exact friend-quest link.",
  alternates: { canonical: "/random" },
  openGraph: {
    title: "Random quest machine — Side Quest Chess",
    description: "Spin up a random chess side quest, accept the bad idea, and send it to a friend to do the same cursed thing.",
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
            <span className="eyebrow">One-click premise</span>
            <h3>Spin first, justify later.</h3>
            <p>The page makes the quest choice feel like a ritual, not a settings screen.</p>
          </article>
          <article className="stat-card mission-card">
            <span className="eyebrow">Exact links</span>
            <h3>Every result has a friend-quest URL.</h3>
            <p>The CTA points recipients straight at the same quest, badge, reward, and rules.</p>
          </article>
          <article className="stat-card mission-card">
            <span className="eyebrow">Still verifiable</span>
            <h3>Ridiculous, not vague.</h3>
            <p>Each spin keeps the rule checklist and real-game verification loop intact.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
