import MobileAppWebShell from "@/components/mobile-app-web-shell";
import CurrentPageSignInLink from "@/components/current-page-sign-in-link";
import { saveRunnerProfile } from "@/app/actions";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";

import { getChessComUsername, getLichessUsername, getPreferredRunnerName, getRunnerBio, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata = {
  title: "Settings — Side Quest Chess",
  description: "Side Quest Chess settings for profile, chess usernames, custom quests, and support.",
};

export default async function SettingsPage() {
  noStore();
  const user = await currentUser();
  const metadataRecord = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const displayName = user
    ? getPreferredRunnerName(metadataRecord, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      }) || "Side Quest Chess"
    : null;

  return (
    <MobileAppWebShell
      activeTab="account"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={getLichessUsername(metadataRecord)}
      chessComUsername={getChessComUsername(metadataRecord)}
      desktopPresentation="settings"
    >
      {user ? (
        <SettingsEditor
          displayName={displayName ?? ""}
          runnerBio={getRunnerBio(metadataRecord)}
          lichessUsername={getLichessUsername(metadataRecord)}
          chessComUsername={getChessComUsername(metadataRecord)}
        />
      ) : (
        <SignedOutSettings />
      )}
    </MobileAppWebShell>
  );
}

export function SettingsEditor({
  displayName,
  runnerBio,
  lichessUsername,
  chessComUsername,
}: {
  displayName: string;
  runnerBio: string;
  lichessUsername: string;
  chessComUsername: string;
}) {
  return (
    <div className="sqc-settings-stack sqc-settings-editor-layout">
      <form action={saveRunnerProfile} className="sqc-username-editor-card sqc-settings-profile-panel">
        <p className="sqc-account-kicker">Profile details</p>
        <h1>Edit profile and chess usernames</h1>
        <p>Save your public Side Quest Chess display name, brag line, and chess usernames from the app. Website and mobile stay in sync.</p>
        <div className="sqc-input-stack">
          <div className="sqc-settings-field-group sqc-settings-identity-group">
            <div className="sqc-settings-group-heading">
              <p>Identity</p>
              <h2 id="settings-profile-heading">Public profile</h2>
              <span>Shown with your Side Quest activity.</span>
            </div>
            <div className="sqc-settings-group-fields">
              <label className="sqc-form-row">
                <span>Display name</span>
                <input name="runnerDisplayName" defaultValue={displayName} maxLength={60} placeholder="e.g. Andreas" />
              </label>
              <label className="sqc-form-row">
                <span>Brag line</span>
                <textarea name="runnerBio" defaultValue={runnerBio} maxLength={180} rows={4} placeholder="Trying to win while doing deeply unreasonable things." />
              </label>
            </div>
          </div>
          <div className="sqc-settings-field-group sqc-settings-proof-group">
            <div className="sqc-settings-group-heading">
              <p>Game proof</p>
              <h2 id="settings-accounts-heading">Proof accounts</h2>
              <span>Public usernames only. One provider is enough.</span>
            </div>
            <div className="sqc-settings-group-fields">
              <label className="sqc-form-row">
                <span>Lichess username</span>
                <input id="lichess-username" name="lichessUsername" defaultValue={lichessUsername} autoCapitalize="none" autoCorrect="off" />
              </label>
              <label className="sqc-form-row">
                <span>Chess.com username</span>
                <input id="chesscom-username" name="chessComUsername" defaultValue={chessComUsername} autoCapitalize="none" autoCorrect="off" placeholder="optional" />
              </label>
            </div>
          </div>
        </div>
        <button className="sqc-primary-action" type="submit">Save usernames</button>
      </form>
      <aside className="sqc-settings-proof-panel sqc-desktop-settings-context" aria-labelledby="settings-proof-title">
        <p className="sqc-account-kicker">Proof account</p>
        <h2 id="settings-proof-title">One public username is enough.</h2>
        <p>Side Quest Chess reads finished public games to check your Side Quest. It never asks for your chess-site password.</p>
        <ol>
          <li><span>01</span><strong>Add Lichess or Chess.com</strong><small>Use the same public username you play with.</small></li>
          <li><span>02</span><strong>Play a new public game</strong><small>Your next game becomes the proof candidate.</small></li>
          <li><span>03</span><strong>Check proof</strong><small>Side Quest Chess compares the game with your active objective.</small></li>
        </ol>
        <p className="sqc-settings-sync-note">Saved changes sync with the Android app and your Account workspace.</p>
      </aside>
    </div>
  );
}

export function SignedOutSettings() {
  return (
    <div className="sqc-settings-stack sqc-settings-sign-in-layout">
      <section className="sqc-account-hero sqc-settings-sign-in-copy">
        <p className="sqc-account-kicker">Profile details</p>
        <h1>Sign in to edit account details.</h1>
        <p className="sqc-account-copy">Sign in first to enable account edits and sync chess usernames with the app.</p>
        <CurrentPageSignInLink className="sqc-primary-action">Choose sign-in method</CurrentPageSignInLink>
      </section>
      <aside className="sqc-settings-sign-in-context sqc-desktop-settings-context" aria-labelledby="settings-sign-in-context-title">
        <p className="sqc-account-kicker">Account workspace</p>
        <h2 id="settings-sign-in-context-title">Your profile and proof setup stay together.</h2>
        <p>Manage the public name shown on Side Quest Chess, your brag line, and the chess usernames used for proof checks.</p>
        <ul>
          <li>Website and Android use the same saved account state.</li>
          <li>Only public chess records are read.</li>
          <li>Your chess-site password stays with your chess provider.</li>
        </ul>
      </aside>
    </div>
  );
}
