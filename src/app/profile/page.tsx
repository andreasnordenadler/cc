import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { saveRunnerProfile } from "@/app/actions";
import {
  getChessComUsername,
  getLichessUsername,
  getRunnerBio,
  getPreferredRunnerName,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

export default async function ProfilePage() {
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const runnerDisplayName = user
    ? getPreferredRunnerName(metadata, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      })
    : "";
  const runnerBio = getRunnerBio(metadata);
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const hasChessIdentity = Boolean(lichessUsername || chessComUsername);
  const readinessItems = [
    { label: "Display name", value: runnerDisplayName || "Add", ready: Boolean(runnerDisplayName) },
    { label: "Brag line", value: runnerBio || "Add", ready: Boolean(runnerBio) },
    { label: "Lichess", value: lichessUsername || "Not connected", ready: Boolean(lichessUsername) },
    { label: "Chess.com", value: chessComUsername || "Not connected", ready: Boolean(chessComUsername) },
  ];

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
            <h2>{hasChessIdentity ? "Your profile can verify Side Quests." : "Add one chess username to unlock proof checks."}</h2>
            <p>
              Your SQC profile uses the same readiness basics everywhere: public SQC identity, brag line, and at least one public chess username for proof verification.
            </p>
            <div className="account-readiness-panel" aria-label="Profile readiness">
              <div className="account-readiness-grid">
                {readinessItems.map((item) => (
                  <div className={`account-readiness-chip ${item.ready ? "ready" : "missing"}`} key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
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
