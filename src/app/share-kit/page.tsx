import type { Metadata } from "next";
import Link from "next/link";
import ChallengeBadge from "@/components/challenge-badge";
import ChallengeInviteActions from "@/components/challenge-invite-actions";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import { getVerifierStateLabel, getVerifierStatus } from "@/lib/verifier-status";

export const metadata: Metadata = {
  title: "Share Kit — Side Quest Chess",
  description:
    "Quest-specific Side Quest Chess links, preview targets, and friend-copy for every starter side quest.",
  alternates: { canonical: "/share-kit" },
  openGraph: {
    title: "Side Quest Chess share kit",
    description: "Every stupidly hard chess side quest, ready to send to a friend with exact quest links.",
    url: "/share-kit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Side Quest Chess share kit",
    description: "Send exact friend-quest links for the SQC starter deck.",
  },
};

export default function ShareKitPage() {
  const featured = CHALLENGES.find((challenge) => challenge.id === "queen-never-heard-of-her") ?? CHALLENGES[0];
  const deckValue = CHALLENGES.reduce((total, challenge) => total + challenge.reward, 0);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={false} active="share-kit" />

      <div className="content-wrap">
        <section className="hero-grid">
          <article className="hero-card">
            <span className="eyebrow">SQC share kit</span>
            <h1>Every bad idea, packaged for one-tap peer pressure.</h1>
            <p className="hero-copy">
              Use this page when the product needs to spread: quest-specific friend-quest links, daily and random rituals, and proof-preview targets in one place.
            </p>
            <div className="button-row hero-actions">
              <Link href="/today" className="button primary">Share today’s quest</Link>
              <Link href="/random" className="button pink">Spin a random quest</Link>
              <Link href={`/dare/${featured.id}`} className="button secondary">Open featured quest</Link>
            </div>

            <div className="steps" aria-label="What the share kit covers">
              <Step num="1" title="Direct" copy="Every quest has its own friend-quest URL." />
              <Step num="2" title="Previewable" copy="Quest links carry quest-specific social cards." />
              <Step num="3" title="Honest" copy="No fake wins, manual uploads, or serious training vibes." />
            </div>
          </article>

          <aside className="side-card card">
            <div className="spread">
              <span className="eyebrow">Starter deck value</span>
              <span className="badge gold">{deckValue} pts</span>
            </div>
            <ChallengeBadge challenge={featured} />
            <h2>{featured.title}</h2>
            <p>{featured.objective}</p>
            <div className="note-card">
              <strong>Best first share:</strong>
              <p>Lead with the queenless quest. It explains the whole product in one gloriously questionable chess decision.</p>
            </div>
          </aside>
        </section>

        <section className="big-grid" aria-label="Reusable sharing rituals">
          <article className="mission-card daily-card">
            <span className="eyebrow">Daily ritual</span>
            <h2>Same quest for everyone today.</h2>
            <p>Best for group chat chaos: one canonical quest of the day, same badge target, same bad idea.</p>
            <Link href="/today" className="button primary">Open daily quest</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Random ritual</span>
            <h2>Let the machine choose violence.</h2>
            <p>Best for quick starts: spin the starter deck, then send the exact quest that lands.</p>
            <Link href="/random" className="button pink">Open random quest</Link>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Proof loop</span>
            <h2>Receipts after the game.</h2>
            <p>Best for bragging honestly: proof cards and logs show passed, failed, and pending checks without pretending.</p>
            <Link href="/proof-log" className="button secondary">Open proof log</Link>
          </article>
        </section>

        <section className="mission-card" aria-label="Ten second friend quest script">
          <div className="section-head">
            <div>
              <span className="eyebrow">10-second friend quest</span>
              <h2>Send one cursed chess errand, then bring them back for proof.</h2>
            </div>
            <span className="badge gold">Invite → receipt</span>
          </div>
          <p>
            The strongest SQC share loop is deliberately tiny: send one quest link before the game, play on the normal chess site, then come back to the receipt when the bad idea either works or detonates.
          </p>
          <div className="checker-flow" aria-label="Friend quest share loop">
            <div className="flow-step ready">
              <strong>1 · Invite</strong>
              <p>Pick one exact side quest instead of pitching the whole product.</p>
            </div>
            <div className="flow-step hot">
              <strong>2 · Play</strong>
              <p>Use Lichess or Chess.com normally. No PGN upload homework.</p>
            </div>
            <div className="flow-step ready">
              <strong>3 · Prove</strong>
              <p>Open the receipt and share the passed, failed, or pending result honestly.</p>
            </div>
          </div>
          <div className="button-row">
            <Link href={`/dare/${featured.id}`} className="button primary">Send the queenless quest</Link>
            <Link href="/result" className="button secondary">Open receipt page</Link>
            <Link href="/proof-log" className="button secondary">Review proof log</Link>
          </div>
        </section>

        <section className="section-head">
          <div>
            <span className="eyebrow">Quest-specific links</span>
            <h2>Starter deck invite cards</h2>
          </div>
          <span className="badge gold">{CHALLENGES.length} links</span>
        </section>

        <section className="challenge-grid" aria-label="Starter deck share cards">
          {CHALLENGES.map((challenge) => {
            const verifierStatus = getVerifierStatus(challenge);
            const verifierLabel = getVerifierStateLabel(verifierStatus);

            return (
            <article key={challenge.id} className="challenge-card">
              <div className="card-meta">
                <span>{challenge.category}</span>
                <span className="badge danger">{challenge.difficulty}</span>
              </div>
              <ChallengeBadge challenge={challenge} />
              <h3>{challenge.title}</h3>
              <p>{challenge.objective}</p>
              <em>{challenge.openingHint}</em>
              <div className="proof-line">{challenge.badgeIdentity.heraldry.motto} · +{challenge.reward} pts</div>
              <p className="microcopy"><strong>{verifierStatus.summary}.</strong> {verifierLabel.promise}</p>
              <div className="button-row">
                <Link href={`/dare/${challenge.id}`} className="button secondary">Open quest page</Link>
                <Link href={`/api/og/dare/${challenge.id}`} className="button secondary">Preview card</Link>
              </div>
              <ChallengeInviteActions
                challengeTitle={challenge.title}
                challengeObjective={challenge.objective}
                challengePath={`/dare/${challenge.id}`}
                reward={challenge.reward}
                badgeName={challenge.badgeIdentity.name}
              />
            </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function Step({ num, title, copy }: { num: string; title: string; copy: string }) {
  return (
    <div className="step">
      <strong>{num}</strong>
      <span>{title}</span>
      <p>{copy}</p>
    </div>
  );
}
