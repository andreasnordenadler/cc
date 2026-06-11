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
  const proofSources = [
    { label: "Lichess", value: lichessUsername || "Add username", ready: Boolean(lichessUsername) },
    { label: "Chess.com", value: chessComUsername || "Add username", ready: Boolean(chessComUsername) },
  ];
  const setupSteps = [
    {
      label: "Choose source",
      value: hasChessIdentity ? "At least one public chess account is ready." : "Add Lichess, Chess.com, or both.",
      ready: hasChessIdentity,
    },
    {
      label: "Start a run",
      value: "Pick a Solo Side Quest, Community Solo quest, or Multiplayer table.",
      ready: hasChessIdentity,
    },
    {
      label: "Check proof",
      value: "SQC reads your public games and returns a clear receipt.",
      ready: hasChessIdentity,
    },
  ];

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="connect" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Proof source</span>
          <h1>Tell SQC which public chess account to check.</h1>
          <p className="hero-copy">
            Add at least one public Lichess or Chess.com username so SQC can verify your Side Quest from public games. No chess-site password, no OAuth link, just the public name.
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
            <span className="eyebrow">Run setup</span>
            <h2>{hasChessIdentity ? "Your proof source is ready." : "Add one chess username before starting verified runs."}</h2>
            <p>
              SQC only needs a public username. Save one source here, then use the same Fastest check and Specific game proof choices across Solo and Multiplayer runs.
            </p>

            <div className="account-readiness-panel" aria-label="Chess account readiness">
              <div className="account-readiness-head">
                <span className="eyebrow">Ready to run</span>
                <p>{hasChessIdentity ? "You can start a Side Quest and let SQC check your latest public games." : "Finish this quick setup once, then every proof check knows where to look."}</p>
              </div>
              <div className="account-readiness-grid" aria-label="Saved proof sources">
                {proofSources.map((source) => (
                  <div className={`account-readiness-chip ${source.ready ? "ready" : "missing"}`} key={source.label}>
                    <span>{source.label}</span>
                    <strong>{source.value}</strong>
                  </div>
                ))}
              </div>
              <div className="account-run-checklist" aria-label="Proof setup steps">
                {setupSteps.map((step) => (
                  <div className={`account-run-checklist-row ${step.ready ? "ready" : "missing"}`} key={step.label}>
                    <span>{step.label}</span>
                    <strong>{step.value}</strong>
                  </div>
                ))}
              </div>
            </div>

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
            <h2>Sign in, then add one public chess username.</h2>
            <p>
              Once a username is saved, return to any Side Quest and run the checker. SQC will look at your public games and tell you whether the quest passed, failed, or still needs another try.
            </p>
            <div className="account-run-checklist" aria-label="Signed-out proof setup steps">
              <div className="account-run-checklist-row missing">
                <span>1 · Sign in</span>
                <strong>Create your SQC account.</strong>
              </div>
              <div className="account-run-checklist-row missing">
                <span>2 · Add source</span>
                <strong>Save one Lichess or Chess.com username.</strong>
              </div>
              <div className="account-run-checklist-row missing">
                <span>3 · Run check</span>
                <strong>Pick a quest and get a verifier-backed receipt.</strong>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
