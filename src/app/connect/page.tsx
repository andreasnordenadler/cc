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

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="connect" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Connect account</span>
          <h1>Connect the account you already embarrass yourself on.</h1>
          <p className="hero-copy">
            Side Quest Chess should check real Lichess/Chess.com games for completed side quests. No PGN uploads, no game-file imports, no engine lecture.
          </p>
        </section>

        <section className="big-grid">
          <article className="connect-card active">
            <span className="eyebrow">Lichess</span>
            <h2>Full starter-deck support</h2>
            <p>Save your public Lichess username and every current starter-deck quest can use latest-game checks for honest pass, fail, or pending receipts.</p>
          </article>

          <article className="connect-card">
            <span className="eyebrow">Chess.com</span>
            <h2>Full starter-deck support</h2>
            <p>Save your Chess.com username and every current starter-deck quest can use latest-game checks too — no provider-specific quest hunting, PGN upload, or password sharing.</p>
          </article>
        </section>

        {isSignedIn ? (
          <section className="mission-card">
            <span className="eyebrow">Your chess identities</span>
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
                {hasChessIdentity ? "Update identities" : "Save identities"}
              </button>
            </form>
          </section>
        ) : (
          <section className="mission-card">
            <span className="eyebrow">Login needed</span>
            <h2>Sign in to save your chess usernames.</h2>
            <p>The verifier can browse public games, but SQC needs a saved runner profile to remember your chess usernames, active quest, badges, and proof cards.</p>
            <div className="button-row">
              <Link href="/sign-in" className="button primary">Sign in to connect</Link>
              <Link href="/profile" className="button secondary">Profile setup</Link>
            </div>
          </section>
        )}

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Private beta connection handoff</span>
              <h2>{hasChessIdentity ? "Identity saved. Run the first proof loop." : "Save one username, then follow the tester route."}</h2>
            </div>
            <span className={hasChessIdentity ? "badge green" : "badge blue"}>
              {hasChessIdentity ? "ready for proof" : "setup step"}
            </span>
          </div>
          <p>
            The connect page is only step one: after a public username is saved, use the private-beta starter route, play and win one eligible public game, then return for one honest latest-game receipt.
          </p>
          <div className="checker-flow" aria-label="Post-connection proof path">
            <div className={hasChessIdentity ? "flow-step ready" : "flow-step"}>
              <strong>{hasChessIdentity ? "✓ Chess identity saved" : "1. Save identity"}</strong>
              <p>{hasChessIdentity ? `${lichessUsername || chessComUsername} can be checked from public game history.` : "Add either Lichess or Chess.com. No password, upload, or PGN chore."}</p>
            </div>
            <div className="flow-step ready">
              <strong>2. Start a tester-route quest</strong>
              <p>Use the guided starter picks before browsing the whole chaos deck cold.</p>
            </div>
            <div className="flow-step hot">
              <strong>3. Check receipt</strong>
              <p>After the game, SQC records pass, fail, or pending proof with next-step guidance.</p>
            </div>
          </div>
          <div className="button-row">
            <Link href="/account" className="button primary">Open account preflight</Link>
            <Link href="/challenges" className="button secondary">Open starter route</Link>
            <Link href="/result" className="button secondary">View latest receipt</Link>
          </div>
        </section>

        <section className="note-card">
          <strong>Product rule</strong>
          <p>The connect flow must stay lightweight. If a screen starts asking for PGN files, engine analysis, or upload chores, it is drifting away from the product.</p>
        </section>
      </div>
    </main>
  );
}
