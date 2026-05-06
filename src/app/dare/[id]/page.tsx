import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ChallengeBadge from "@/components/challenge-badge";
import ChallengeInviteActions from "@/components/challenge-invite-actions";
import SiteNav from "@/components/site-nav";
import { startChallenge } from "@/app/actions";
import { CHALLENGES, getChallengeById } from "@/lib/challenges";
import { getVerifierStateLabel, getVerifierStatus } from "@/lib/verifier-status";

export function generateStaticParams() {
  return CHALLENGES.map((challenge) => ({ id: challenge.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const challenge = getChallengeById(id);

  if (!challenge) {
    return {
      title: "Side Quest Chess quest",
    };
  }

  const title = `Quest for you: ${challenge.title} — Side Quest Chess`;
  const description = `${challenge.objective} Unlock ${challenge.badgeIdentity.name} for +${challenge.reward} points.`;
  const url = `/dare/${challenge.id}`;
  const image = `/api/og/dare/${challenge.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Side Quest Chess",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: `${challenge.title} Side Quest Chess quest card` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default async function DarePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = getChallengeById(id);

  if (!challenge) {
    notFound();
  }

  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const verifierStatus = getVerifierStatus(challenge);
  const verifierLabel = getVerifierStateLabel(verifierStatus);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="challenges" />

      <div className="content-wrap">
        <section className="hero-grid">
          <article className="hero-card detail-hero">
            <span className="eyebrow">Friend quest received</span>
            <h1>A friend sent you a quest.</h1>
            <p className="hero-copy">
              Someone thinks you should try <strong>{challenge.title}</strong>: {challenge.objective}
            </p>
            <div className="button-row hero-actions">
              {isSignedIn ? (
                <form action={startChallenge}>
                  <input type="hidden" name="challengeId" value={challenge.id} />
                  <button type="submit" className="button primary">Accept and save this quest</button>
                </form>
              ) : (
                <Link href="/connect" className="button primary">Connect to accept quest</Link>
              )}
              <Link href={`/challenges/${challenge.id}`} className="button secondary">Read full rules</Link>
              <Link href="/challenges" className="button secondary">Browse safer nonsense</Link>
            </div>
          </article>

          <aside className="mission-card share-card">
            <div className="section-head">
              <span className="eyebrow">The prize</span>
              <span className={verifierLabel.className}>{verifierLabel.label}</span>
            </div>
            <ChallengeBadge challenge={challenge} size="hero" />
            <h2>{challenge.badgeIdentity.name}</h2>
            <p>{challenge.badgeIdentity.unlockCopy}</p>
            <div className="proof-line">{challenge.proofCallout} · +{challenge.reward} points</div>
          </aside>
        </section>

        <section className="mission-card" aria-label="Friend quest quickstart">
          <div className="section-head">
            <div>
              <span className="eyebrow">Friend quest quickstart</span>
              <h2>Accept exactly one dare, then come back with proof.</h2>
            </div>
            <span className="badge gold">10-second loop</span>
          </div>
          <p>
            This invite page now makes the handoff explicit: save this exact quest, play one normal public game on your chess site, and use My Side Quests for an honest pass, fail, or pending receipt.
          </p>
          <div className="proof-grid">
            <Fact label="Quest" value={challenge.title} />
            <Fact label="Verifier" value={verifierStatus.summary} />
            <Fact label="Reward" value={`+${challenge.reward} pts`} />
            <Fact label="Proof" value="Latest public game" />
          </div>
          <p className="microcopy"><strong>{verifierLabel.promise}</strong> {verifierStatus.evidence}</p>
          <div className="button-row">
            {isSignedIn ? (
              <form action={startChallenge}>
                <input type="hidden" name="challengeId" value={challenge.id} />
                <button type="submit" className="button primary">Save this friend quest</button>
              </form>
            ) : (
              <Link href="/connect" className="button primary">Connect to accept quest</Link>
            )}
            <Link href="/account" className="button secondary">Open checker</Link>
            <Link href="/result" className="button secondary">Preview receipt</Link>
          </div>
        </section>

        <section className="big-grid">
          <article className="mission-card">
            <span className="eyebrow">What counts</span>
            <h2>Rules before chaos.</h2>
            <ul className="rules-list">
              {challenge.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Proof path</span>
            <h2>Play normally, then let SQC check the mess.</h2>
            <p>
              Accepting a friend quest should feel simple: save the quest, play one eligible public game on Lichess or Chess.com, then come back for the receipt.
            </p>
            <div className="checker-flow" aria-label="Friend quest proof path">
              <div className="flow-step ready">
                <strong>1 · Accept</strong>
                <p>Save this exact friend quest as your active quest right from this page.</p>
              </div>
              <div className="flow-step hot">
                <strong>2 · Play</strong>
                <p>Use your normal chess site. No PGN upload or password sharing.</p>
              </div>
              <div className="flow-step ready">
                <strong>3 · Prove</strong>
                <p>Run the latest-game check and share the honest receipt.</p>
              </div>
            </div>
            <div className="button-row">
              {isSignedIn ? (
                <form action={startChallenge}>
                  <input type="hidden" name="challengeId" value={challenge.id} />
                  <button type="submit" className="button primary">Make this my active quest</button>
                </form>
              ) : (
                <Link href="/connect" className="button primary">Connect to save quest</Link>
              )}
              <Link href="/result" className="button secondary">Open receipt</Link>
            </div>
          </article>

          <article className="mission-card share-card">
            <span className="eyebrow">Escalate responsibly</span>
            <h2>Send this quest on.</h2>
            <p>
              Copy the same quest-specific invite and make the group chat worse in a very measurable way.
            </p>
            <ChallengeInviteActions
              challengeTitle={challenge.title}
              challengeObjective={challenge.objective}
              challengePath={`/dare/${challenge.id}`}
              reward={challenge.reward}
              badgeName={challenge.badgeIdentity.name}
            />
          </article>
        </section>
      </div>
    </main>
  );
}
