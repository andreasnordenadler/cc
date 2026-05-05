import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import SiteNav from "@/components/site-nav";
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
            Sign in so Side Quest Chess can remember your quests, badges, points, and proof receipts. Then add your Lichess or Chess.com username on your profile page — public username only, no password needed.
          </p>
          {isSignedIn ? (
            <div className="button-row hero-actions">
              <Link href="/profile" className="button primary">
                {hasChessIdentity ? "Update chess usernames" : "Add chess usernames"}
              </Link>
              <Link href="/challenges" className="button secondary">Back to quests</Link>
            </div>
          ) : (
            <div className="button-row hero-actions">
              <SignInButton mode="modal" fallbackRedirectUrl="/profile">
                <button type="button" className="button primary">Sign in to add usernames</button>
              </SignInButton>
            </div>
          )}
        </section>

        <section className="mission-card">
          <span className="eyebrow">What happens next</span>
          <h2>{isSignedIn ? "Open your profile and save one chess username." : "Sign in, then SQC sends you to profile setup."}</h2>
          <p>
            Once a username is saved, return to any quest and press the checker. SQC will look at your latest public games and tell you whether the quest passed, failed, or still needs another try.
          </p>
        </section>
      </div>
    </main>
  );
}
