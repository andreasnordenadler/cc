import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { saveChessUsernames } from "@/app/actions";
import {
  getChessComUsername,
  getLichessUsername,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function ConnectPage() {
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const isSignedIn = Boolean(user);
  const hasChessIdentity = Boolean(lichessUsername || chessComUsername);
  const savedIdentityLabel = [
    lichessUsername ? `Lichess: ${lichessUsername}` : null,
    chessComUsername ? `Chess.com: ${chessComUsername}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="connect" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Connect to start</span>
          <h1>Tell SQC which public chess account to check.</h1>
          <p className="hero-copy">
            When you click Connect from the nav or a quest, this is the one setup step: save your public Lichess or Chess.com username so Side Quest Chess can check your latest games after you play.
          </p>
          <div className="checker-flow" aria-label="Connect page purpose">
            <div className={isSignedIn ? "flow-step ready" : "flow-step"}>
              <strong>{isSignedIn ? "✓ Signed in" : "1. Sign in"}</strong>
              <p>{isSignedIn ? "SQC can remember your active quest, receipts, badges, and points." : "Create or open your SQC profile first so your proof loop can persist."}</p>
            </div>
            <div className={hasChessIdentity ? "flow-step ready" : "flow-step hot"}>
              <strong>{hasChessIdentity ? "✓ Chess account saved" : "2. Save chess username"}</strong>
              <p>{hasChessIdentity ? savedIdentityLabel : "Add Lichess or Chess.com. Public username only — no chess-site password."}</p>
            </div>
            <div className="flow-step">
              <strong>3. Start a quest</strong>
              <p>Pick a quest, play a public game, then SQC checks the latest-game receipt.</p>
            </div>
          </div>
        </section>

        {isSignedIn ? (
          <section className="mission-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Your chess accounts</span>
                <h2>{hasChessIdentity ? "Update the account SQC checks." : "Save one public username to unlock quest checking."}</h2>
              </div>
              <span className={hasChessIdentity ? "badge green" : "badge blue"}>
                {hasChessIdentity ? "ready" : "needed"}
              </span>
            </div>
            <p>
              Use the account you will actually play on. SQC reads public game history only; it never asks for a chess-site password, PGN upload, or engine analysis file.
            </p>
            <form action={saveChessUsernames} className="form-grid">
              <label className="input-card">
                <span>Lichess username</span>
                <input type="text" name="lichessUsername" defaultValue={lichessUsername} placeholder="e.g. ForkMaster3000" />
              </label>
              <label className="input-card">
                <span>Chess.com username</span>
                <input type="text" name="chessComUsername" defaultValue={chessComUsername} placeholder="e.g. ForkMaster3000" />
              </label>
              <button type="submit" className="button primary">
                {hasChessIdentity ? "Update chess accounts" : "Save and enable checking"}
              </button>
            </form>
          </section>
        ) : (
          <section className="mission-card">
            <span className="eyebrow">Sign in first</span>
            <h2>Connect needs an SQC profile.</h2>
            <p>
              The chess username can be public, but SQC still needs your own profile to remember active quests, proof receipts, badges, and points across sessions.
            </p>
            <div className="button-row">
              <Link href="/sign-in" className="button primary">Sign in to connect</Link>
              <Link href="/challenges" className="button secondary">Browse quests first</Link>
            </div>
          </section>
        )}

        <section className="big-grid">
          <article className="connect-card active">
            <span className="eyebrow">Lichess</span>
            <h2>Public latest-game checks</h2>
            <p>Save your Lichess username and SQC can check the current starter deck from recent public games.</p>
          </article>

          <article className="connect-card active">
            <span className="eyebrow">Chess.com</span>
            <h2>Public latest-game checks</h2>
            <p>Save your Chess.com username and SQC can use the same latest-game receipt loop without uploads or passwords.</p>
          </article>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">After connecting</span>
              <h2>{hasChessIdentity ? "You are ready to start a quest." : "Connection feeds directly into the quest loop."}</h2>
            </div>
            <span className={hasChessIdentity ? "badge green" : "badge gold"}>
              {hasChessIdentity ? "start now" : "next step"}
            </span>
          </div>
          <p>
            Connect is not a separate product area. It is the bridge from “I want to try this quest” to “SQC knows which public games to judge.”
          </p>
          <div className="button-row">
            <Link href="/challenges" className="button primary">Choose a quest</Link>
            <Link href="/path" className="button secondary">Use starter path</Link>
            <Link href="/account" className="button secondary">Open account checker</Link>
          </div>
        </section>

        <section className="note-card">
          <strong>No password rule</strong>
          <p>Side Quest Chess only needs public chess usernames. If a flow starts asking for passwords, PGN files, or engine uploads, it is wrong.</p>
        </section>
      </div>
    </main>
  );
}
