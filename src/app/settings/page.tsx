import MobileAppWebShell from "@/components/mobile-app-web-shell";
import { saveRunnerProfile } from "@/app/actions";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
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

function SettingsEditor({
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
    <div className="sqc-settings-stack">
      <form action={saveRunnerProfile} className="sqc-username-editor-card">
        <p className="sqc-account-kicker">Profile details</p>
        <h1>Edit profile and chess usernames</h1>
        <p>Save your public Side Quest Chess display name, brag line, and chess usernames from the app. Website and mobile stay in sync.</p>
        <div className="sqc-input-stack">
          <label className="sqc-form-row">
            <span>Display name</span>
            <input name="runnerDisplayName" defaultValue={displayName} maxLength={60} placeholder="e.g. Andreas" />
          </label>
          <label className="sqc-form-row">
            <span>Brag line</span>
            <textarea name="runnerBio" defaultValue={runnerBio} maxLength={180} rows={4} placeholder="Trying to win while doing deeply unreasonable things." />
          </label>
          <label className="sqc-form-row">
            <span>Lichess username</span>
            <input name="lichessUsername" defaultValue={lichessUsername} autoCapitalize="none" autoCorrect="off" />
          </label>
          <label className="sqc-form-row">
            <span>Chess.com username</span>
            <input name="chessComUsername" defaultValue={chessComUsername} autoCapitalize="none" autoCorrect="off" placeholder="optional" />
          </label>
        </div>
        <button className="sqc-primary-action" type="submit">Save usernames</button>
      </form>
    </div>
  );
}

function SignedOutSettings() {
  return (
    <div className="sqc-settings-stack">
      <section className="sqc-account-hero">
        <p className="sqc-account-kicker">Profile details</p>
        <h1>Sign in to edit account details.</h1>
        <p className="sqc-account-copy">Sign in first to enable account edits and sync chess usernames with the app.</p>
        <Link className="sqc-primary-action" href="/sign-in">Choose sign-in method</Link>
      </section>
    </div>
  );
}
