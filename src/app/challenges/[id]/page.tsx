import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { startChallenge } from "@/app/actions";
import { getChallengeById } from "@/lib/challenges";
import {
  getActiveChallenge,
  getChallengeAttempts,
  getChessComUsername,
  getLichessUsername,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function ChallengeDetailPage({
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
  const user = userId ? await currentUser() : null;
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const attempts = getChallengeAttempts(metadata, challenge.id).slice().reverse();
  const isSignedIn = Boolean(userId);
  const isActive = activeChallenge?.id === challenge.id;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="challenges" />

      <div className="content-wrap">
        <Link href="/challenges" className="button secondary">← Back to challenge hub</Link>

        <section className="hero-card detail-hero">
          <div className="badge-row">
            <span className="eyebrow">{challenge.category}</span>
            <span className="badge danger">{challenge.difficulty}</span>
            <span className="badge gold">+{challenge.reward} pts</span>
          </div>
          <h1>{challenge.title}</h1>
          <p className="hero-copy">{challenge.objective}</p>
          <p>{challenge.flavor}</p>
          <div className="button-row hero-actions">
            {isSignedIn ? (
              <form action={startChallenge}>
                <input type="hidden" name="challengeId" value={challenge.id} />
                <button type="submit" className="button primary">
                  {isActive ? "Restart this bad idea" : "Start this bad idea"}
                </button>
              </form>
            ) : (
              <Link href="/connect" className="button primary">Connect to start</Link>
            )}
            <Link href="/result" className="button secondary">Preview proof card</Link>
          </div>
        </section>

        <section className="big-grid">
          <article className="mission-card">
            <span className="eyebrow">What counts</span>
            <h2>Funny, but rule-clear.</h2>
            <ul className="rules-list">
              {challenge.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </article>

          <article className="mission-card">
            <span className="eyebrow">Unlock badge</span>
            <h2>{challenge.badge}</h2>
            <p>{challenge.proofCallout}</p>
            <div className="note-card">
              <strong>Verifier direction</strong>
              <p>V1 should check Lichess/Chess.com games automatically. No PGN upload/import path belongs on this surface.</p>
            </div>
          </article>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Your run</span>
              <h2>{isActive ? "This dare is active" : "Not active yet"}</h2>
            </div>
            <span className="badge blue">{challenge.completionRate}</span>
          </div>

          {isSignedIn ? (
            <div className="grid">
              <Fact label="Lichess" value={lichessUsername || "not set yet"} />
              <Fact label="Chess.com" value={chessComUsername || "not set yet"} />
              <Fact label="Attempts" value={`${attempts.length}`} />
            </div>
          ) : (
            <p>Browse first. Connect only when you want BlunderCheck to remember this chaos and turn it into proof.</p>
          )}
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
