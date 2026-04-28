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
            <h2>Fastest setup</h2>
            <p>Use your public username so Side Quest Chess can connect challenges to real games.</p>
          </article>

          <article className="connect-card">
            <span className="eyebrow">Chess.com</span>
            <h2>Username tracking</h2>
            <p>Use your Chess.com username for beginner-path, No Castle Club, Queen? Never Heard of Her, Pawn Storm Maniac, Knightmare Mode, and Rookless Rampage checks today, with more parity coming as the beta hardens.</p>
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
                {lichessUsername || chessComUsername ? "Update identities" : "Save identities"}
              </button>
            </form>
          </section>
        ) : (
          <section className="mission-card">
            <span className="eyebrow">Login needed</span>
            <h2>Sign in to save your chess usernames.</h2>
            <p>The verifier can browse public games, but SQC needs a saved runner profile to remember your Lichess username, active quest, badges, and proof cards.</p>
            <div className="button-row">
              <Link href="/sign-in" className="button primary">Sign in to connect</Link>
              <Link href="/profile" className="button secondary">Profile setup</Link>
            </div>
          </section>
        )}

        <section className="note-card">
          <strong>Product rule</strong>
          <p>The connect flow must stay lightweight. If a screen starts asking for PGN files, engine analysis, or upload chores, it is drifting away from the product.</p>
        </section>
      </div>
    </main>
  );
}
