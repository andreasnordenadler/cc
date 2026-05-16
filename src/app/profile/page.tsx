import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { saveRunnerProfile } from "@/app/actions";
import {
  getChessComUsername,
  getLichessUsername,
  getRunnerBio,
  getRunnerDisplayName,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function ProfilePage() {
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const runnerDisplayName = getRunnerDisplayName(metadata) || user?.username || user?.firstName || "";
  const runnerBio = getRunnerBio(metadata);
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(user)} active="profile" />
      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Step 2 · activate quest verification</span>
          <h1>{user ? "Add a chess username to unlock quests." : "Sign in to save your profile."}</h1>
          <p className="hero-copy">
            Your public Lichess or Chess.com username is the key piece. SQC uses it to check public games, verify quests, and save proof receipts.
          </p>
          {!user ? <Link href="/sign-in" className="button primary">Sign in to edit profile</Link> : null}
        </section>

        {user ? (
          <section className="mission-card">
            <span className="eyebrow">Profile details</span>
            <form action={saveRunnerProfile} className="form-grid wide-form">
              <label className="input-card">
                <span>Display name</span>
                <input type="text" name="runnerDisplayName" defaultValue={runnerDisplayName} placeholder="e.g. Andreas" maxLength={60} />
              </label>
              <label className="input-card">
                <span>Brag line</span>
                <textarea name="runnerBio" defaultValue={runnerBio} placeholder="e.g. Trying to win while doing deeply unreasonable things." maxLength={180} rows={4} />
              </label>
              <label className="input-card">
                <span>Lichess username</span>
                <input type="text" name="lichessUsername" defaultValue={lichessUsername} placeholder="e.g. and72nor" />
              </label>
              <label className="input-card">
                <span>Chess.com username</span>
                <input type="text" name="chessComUsername" defaultValue={chessComUsername} placeholder="e.g. and72nor" />
              </label>
              <p className="form-helper-copy">Add at least one. Public username only — never a chess-site password.</p>
              <div className="button-row">
                <button type="submit" className="button primary">Save profile</button>
                <Link href="/account" className="button secondary">Back to My Side Quests</Link>
              </div>
            </form>
          </section>
        ) : (
          <section className="mission-card">
            <span className="eyebrow">Getting started</span>
            <h2>Login first, then this page becomes editable.</h2>
            <p>After sign-in, add at least one public Lichess or Chess.com username first. That unlocks quest starting, latest-game checks, and proof cards.</p>
          </section>
        )}
      </div>
    </main>
  );
}
