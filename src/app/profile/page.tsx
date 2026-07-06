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
  const hasRunnerIdentity = Boolean(runnerDisplayName || runnerBio);
  const readinessItems = [
    { label: "Player name", value: runnerDisplayName || "Add", ready: Boolean(runnerDisplayName) },
    { label: "Profile line", value: runnerBio || "Add", ready: Boolean(runnerBio) },
    { label: "Lichess", value: lichessUsername || "Not connected", ready: Boolean(lichessUsername) },
    { label: "Chess.com", value: chessComUsername || "Not connected", ready: Boolean(chessComUsername) },
  ];
  const setupSteps = [
    {
      label: "Public player card",
      value: hasRunnerIdentity ? "Ready for receipts and leaderboards" : "Add the name friends should see",
      ready: hasRunnerIdentity,
    },
    {
      label: "Proof source",
      value: hasChessIdentity ? "Side Quest Chess can check public games" : "Connect Lichess or Chess.com",
      ready: hasChessIdentity,
    },
    {
      label: "Next Side Quest",
      value: hasChessIdentity ? "Start a Solo Side Quest or Multiplayer Side Quest" : "Save once, then pick a Side Quest",
      ready: hasChessIdentity,
    },
  ];

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(user)} active="profile" />
      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Player profile</span>
          <h1>{user ? "Set up your proof checks." : "Sign in to set up your player profile."}</h1>
          <p className="hero-copy">
            Add the public chess usernames Side Quest Chess is allowed to check. No passwords, no private games - just the public accounts used for Side Quest proof receipts.
          </p>
          {!user ? <Link href="/sign-in" className="button primary">Sign in to edit profile</Link> : null}
        </section>

        {user ? (
          <section className="mission-card">
            <span className="eyebrow">Proof readiness</span>
            <h2>{hasChessIdentity ? "Your profile is ready for proof checks." : "Connect one public chess account."}</h2>
            <p>
              Choose the name shown on receipts, add a short profile line, and connect at least one public chess username for proof checks.
            </p>
            <div className="account-readiness-panel" aria-label="Profile readiness">
              <div className="account-readiness-head">
                <span className="eyebrow">Ready for proof</span>
                <p>Save these basics once, then Side Quest Chess can use the same profile across Solo Side Quests, Multiplayer Side Quests, proof receipts, and leaderboards.</p>
              </div>
              <div className="account-readiness-grid">
                {readinessItems.map((item) => (
                  <div className={`account-readiness-chip ${item.ready ? "ready" : "missing"}`} key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
              <div className="account-run-checklist" aria-label="Player setup steps">
                {setupSteps.map((step) => (
                  <div className={`account-run-checklist-row ${step.ready ? "ready" : "missing"}`} key={step.label}>
                    <span>{step.label}</span>
                    <strong>{step.value}</strong>
                  </div>
                ))}
              </div>
            </div>
            <form action={saveRunnerProfile} className="form-grid wide-form">
              <label className="input-card">
                <span>Player name</span>
                <input type="text" name="runnerDisplayName" defaultValue={runnerDisplayName} placeholder="e.g. Andreas" maxLength={60} />
              </label>
              <label className="input-card">
                <span>Profile line</span>
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
              <p className="form-helper-copy">Add at least one chess username. Use the public account name only - never a chess-site password.</p>
              <div className="button-row">
                <button type="submit" className="button primary">Save player profile</button>
                <Link href="/account" className="button secondary">Back to My Side Quests</Link>
              </div>
            </form>
          </section>
        ) : (
          <section className="mission-card">
            <span className="eyebrow">Before your first Side Quest</span>
            <h2>Sign in, save a public chess username, then pick a Side Quest.</h2>
            <div className="account-run-checklist" aria-label="Signed-out profile setup steps">
              <Link href="/sign-in" className="account-run-checklist-row missing">
                <span>Step 1</span>
                <strong>Sign in to unlock your editable player profile.</strong>
              </Link>
              <div className="account-run-checklist-row missing">
                <span>Step 2</span>
                <strong>Add Lichess or Chess.com so Side Quest Chess can check public games.</strong>
              </div>
              <Link href="/solo" className="account-run-checklist-row ready">
                <span>Step 3</span>
                <strong>Browse Solo Side Quests once your profile is saved.</strong>
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
