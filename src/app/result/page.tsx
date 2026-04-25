import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";

export default async function ResultPage() {
  const { userId } = await auth();
  const challenge = CHALLENGES[0];

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="result" />

      <div className="content-wrap">
        <section className="hero-grid">
          <article className="result-poster">
            <div className="eyebrow" style={{ color: "#140d0d", background: "rgba(20,13,13,.12)" }}>BlunderCheck proof</div>
            <h1>You did it. Somehow.</h1>
            <p>
              You lost your queen before move 15 and still won. This was either genius or illegal.
            </p>
            <div className="proof-grid">
              <Fact label="Challenge" value={challenge.title} />
              <Fact label="Queen lost" value="Move 11" />
              <Fact label="Victory" value="Checkmate" />
              <Fact label="Points" value={`+${challenge.reward}`} />
            </div>
            <strong>“I made a terrible chess decision and BlunderCheck says it counts.”</strong>
          </article>

          <aside className="mission-card">
            <span className="eyebrow">Why this matters</span>
            <h2>The result is the viral object.</h2>
            <p>
              BlunderCheck should make the proof moment feel collectible and shareable. The user is not just completing a task — they are earning evidence of a weird chess story.
            </p>
            <div className="button-row">
              <Link href="/challenges" className="button primary">Try another bad idea</Link>
              <Link href={`/challenges/${challenge.id}`} className="button secondary">View rules</Link>
            </div>
          </aside>
        </section>

        <section className="big-grid">
          <article className="mission-card">
            <span className="eyebrow">Share copy</span>
            <h2>I completed “Queen? Never Heard of Her.”</h2>
            <p>Lost my queen on move 11. Won anyway. +500 points · Brutal challenge · Certified Queenless Maniac.</p>
          </article>
          <article className="mission-card">
            <span className="eyebrow">Next dare</span>
            <h2>The Blunder Gambit</h2>
            <p>Hang a piece early and still win. It was not a mistake. It was branding.</p>
            <Link href="/challenges/the-blunder-gambit" className="button pink">Accept quest</Link>
          </article>
        </section>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
