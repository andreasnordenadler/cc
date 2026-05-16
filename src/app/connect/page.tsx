import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import AuthActionButtons from "@/components/auth-action-buttons";
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
          <span className="eyebrow">Connect to start</span>
          <h1>Tell SQC which public chess account to check.</h1>
          <p className="hero-copy">
            This is the activation key: add at least one public Lichess or Chess.com username so SQC can verify your quest from public games. No chess-site password, no OAuth link, just the public name.
          </p>
          {isSignedIn ? (
            <div className="button-row hero-actions">
              <a href="#connect-chess-username" className="button primary">
                {hasChessIdentity ? "Update chess usernames" : "Add chess username"}
              </a>
              <Link href="/challenges" className="button secondary">Back to quests</Link>
            </div>
          ) : (
            <div className="button-row hero-actions">
              <AuthActionButtons variant="connect" />
            </div>
          )}
        </section>

        {isSignedIn ? (
          <section id="connect-chess-username" className="mission-card">
            <span className="eyebrow">Step 2 · unlock verification</span>
            <h2>{hasChessIdentity ? "Your chess username is connected." : "Add one chess username before starting quests."}</h2>
            <p>
              SQC needs at least one public chess username to know which recent games to check. Add Lichess, Chess.com, or both.
            </p>
            <form action={saveChessUsernames} className="form-grid wide-form">
              <label className="input-card">
                <span>Lichess username</span>
                <input type="text" name="lichessUsername" defaultValue={lichessUsername} placeholder="e.g. and72nor" />
              </label>
              <label className="input-card">
                <span>Chess.com username</span>
                <input type="text" name="chessComUsername" defaultValue={chessComUsername} placeholder="e.g. and72nor" />
              </label>
              <div className="button-row">
                <button type="submit" className="button primary">Save and unlock quests</button>
                <Link href="/profile" className="button secondary">Edit full profile</Link>
              </div>
            </form>
          </section>
        ) : (
          <section className="mission-card">
            <span className="eyebrow">What happens next</span>
            <h2>Sign in, then add one chess username.</h2>
            <p>
              Once a username is saved, return to any quest and press the checker. SQC will look at your latest public games and tell you whether the quest passed, failed, or still needs another try.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
