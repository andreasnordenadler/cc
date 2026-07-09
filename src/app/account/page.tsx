import MobileAppWebShell from "@/components/mobile-app-web-shell";
import AccountLogoutButton from "@/components/account-logout-button";
import { saveRunnerProfile } from "@/app/actions";
import type { MobileWebTrophyRow } from "@/lib/mobile-web-trophies";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { CHALLENGES } from "@/lib/challenges";
import { getChessRatingSnapshots } from "@/lib/chess-ratings";
import { getCustomSideQuests } from "@/lib/custom-side-quests";
import { getMobileWebTrophyRows } from "@/lib/mobile-web-trophies";
import {
  getActiveChallenge,
  getChallengeAttempts,
  getChallengeProgress,
  getChessComUsername,
  getLatestChallengeAttempt,
  getLichessUsername,
  getPreferredRunnerName,
  getRunnerBio,
  type UserMetadataRecord,
} from "@/lib/user-metadata";

const mobileAsset = {
  coat: "/mobile-source/sqc-coat-of-arms.png",
  multiplayerSeal: "/mobile-source/stamps/sqc-multiplayer-seal.png",
  customCrest: "/badges/custom/community/community-coat-01.png",
  fallbackBadge: "/mobile-source/badges/v6/proof-loop-test-badge.png",
};

export default async function AccountPage() {
  noStore();
  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const displayName = user
    ? getPreferredRunnerName(metadata, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      }) || "Side Quest Chess"
    : null;
  const lichessUsername = getLichessUsername(metadata);
  const chessComUsername = getChessComUsername(metadata);
  const progress = getChallengeProgress(metadata);
  const trophyRows = user
    ? await getMobileWebTrophyRows(await clerkClient(), user.id, progress.completedChallengeIds, 5)
    : [];

  return (
    <MobileAppWebShell
      activeTab="account"
      signedIn={Boolean(user)}
      displayName={displayName}
      profileImageUrl={user?.imageUrl ?? null}
      lichessUsername={lichessUsername}
      chessComUsername={chessComUsername}
      controlsOnlyHeader
    >
      {user ? (
        <SignedInAccountScreen
          displayName={displayName ?? "SQC player"}
          email={user.primaryEmailAddress?.emailAddress ?? null}
          imageUrl={user.imageUrl ?? null}
          lastSignInAt={user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : null}
          metadata={metadata}
          lichessUsername={lichessUsername}
          chessComUsername={chessComUsername}
          trophyRows={trophyRows}
        />
      ) : (
        <SignedOutAccountScreen />
      )}
    </MobileAppWebShell>
  );
}

function SignedInAccountScreen({
  displayName,
  email,
  imageUrl,
  lastSignInAt,
  metadata,
  lichessUsername,
  chessComUsername,
  trophyRows,
}: {
  displayName: string;
  email: string | null;
  imageUrl: string | null;
  lastSignInAt: string | null;
  metadata: UserMetadataRecord;
  lichessUsername: string;
  chessComUsername: string;
  trophyRows: MobileWebTrophyRow[];
}) {
  const activeChallenge = getActiveChallenge(metadata);
  const activeChallengeRecord = activeChallenge?.id ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id) ?? null : null;
  const activeAttempt = getLatestChallengeAttempt(metadata, activeChallenge?.id);
  const progress = getChallengeProgress(metadata);
  const attempts = getChallengeAttempts(metadata);
  const customSideQuests = getCustomSideQuests(metadata).filter((quest) => quest.lifecycle !== "archived");
  const ratings = getChessRatingSnapshots(metadata);
  const completedCount = progress.totalCompletedChallenges;
  const proofCount = attempts.length;

  return (
    <div className="sqc-account-stack">
      <section className="sqc-account-hero">
        <p className="sqc-account-kicker">My Account</p>
        <div className="sqc-account-identity-card">
          <span className="sqc-account-avatar">
            {imageUrl ? <img alt="" src={imageUrl} referrerPolicy="no-referrer" /> : displayName.slice(0, 1).toUpperCase()}
          </span>
          <span className="sqc-account-identity-copy">
            <span className="sqc-account-name-row">
              <strong>{displayName}</strong>
              <small>Synced</small>
            </span>
            {email ? <span>{email}</span> : null}
            <span>Recently active: {formatRecentActivity(lastSignInAt)}</span>
          </span>
        </div>
        <p className="sqc-account-copy">
          {lichessUsername || chessComUsername
            ? "Proof checks ready. Side Quest Chess can check your public Lichess and Chess.com games."
            : "Add a public chess username before checking Side Quest proof."}
        </p>
        <div className="sqc-readiness-row">
          <ReadinessChip label="Lichess" value={lichessUsername} />
          <ReadinessChip label="Chess.com" value={chessComUsername} />
        </div>
      </section>

      <AccountSection title="Your Side Quests" action={{ label: "Browse Solo", href: "/side-quests" }}>
        <AccountRow
          title={`Solo Side Quest: ${activeChallengeRecord?.title ?? "Choose a Solo Side Quest"}`}
          meta={activeChallengeRecord ? `${activeChallengeRecord.objective} · ${formatLatestCheck(activeAttempt?.checkedAt ?? activeChallenge?.verifiedAt)}` : "Pick one Side Quest to judge against your next public game."}
          status={activeChallengeRecord ? "Active" : "Open"}
          href={activeChallengeRecord ? `/challenges/${activeChallengeRecord.id}` : "/side-quests"}
          image={activeChallengeRecord?.badgeIdentity.image ? toMobileAssetPath(activeChallengeRecord.badgeIdentity.image) : mobileAsset.coat}
        />
        <AccountRow
          title="Multiplayer Side Quests"
          meta="Join an official table, join a community table, or create one for friends."
          status="Open"
          href="/multiplayer"
          image={mobileAsset.multiplayerSeal}
        />
        <AccountRow
          title="Your Custom Side Quests"
          meta={customSideQuests.length ? `${customSideQuests.length} made · private by default` : "Build a private custom Side Quest for solo or multiplayer use."}
          status={customSideQuests.length ? `${customSideQuests.length} made` : "Create"}
          href="/custom-side-quests"
          image={mobileAsset.customCrest}
        />
      </AccountSection>

      <AccountSection title="Progress & Stats" action={{ label: "Details", href: "/trophy-cabinet" }}>
        <div className="sqc-account-stats-panel">
          <div className="sqc-account-metric-grid">
            <Metric label="Completed" value={completedCount} />
            <Metric label="Proofs" value={proofCount} />
            <Metric label="Coats" value={completedCount} />
            <Metric label="Podiums" value={0} />
          </div>
          <p>Custom Side Quests: {customSideQuests.length} made · 0 tries · 0 wins</p>
          <p>Multiplayer trophies: 0 podiums</p>
        </div>
      </AccountSection>

      <AccountSection title="Chess Strength">
        <div className="sqc-chess-strength-card">
          <p className="sqc-account-kicker">Chess Strength</p>
          <h2>Public chess ratings</h2>
          <p>Provider ratings are kept as context. Your Side Quest proof still comes from finished public games.</p>
          <div className="sqc-rating-grid">
            <RatingColumn title="Lichess" username={lichessUsername} ratings={ratings.lichess?.ratings ?? []} />
            <RatingColumn title="Chess.com" username={chessComUsername} ratings={ratings.chessCom?.ratings ?? []} />
          </div>
        </div>
      </AccountSection>

      <AccountSection title="Trophy Cabinet" action={{ label: "Open Trophy Cabinet", href: "/trophy-cabinet" }}>
        {trophyRows.length ? (
          trophyRows.map((row) => (
            <AccountRow
              key={row.id}
              title={row.title}
              meta={row.meta}
              status={row.source === "multiplayer" ? "Podium" : "Unlocked"}
              href={row.href}
              image={row.image ?? mobileAsset.coat}
              statusImage={row.statusImage}
            />
          ))
        ) : (
          <AccountRow
            title="No trophies yet"
            meta="Complete a Side Quest to unlock your first Coat of Arms."
            status="Explore"
            href="/side-quests"
            image={mobileAsset.coat}
          />
        )}
      </AccountSection>

      <ProfileEditorCard
        displayName={displayName}
        runnerBio={getRunnerBio(metadata)}
        lichessUsername={lichessUsername}
        chessComUsername={chessComUsername}
      />

      <AccountSection title="Help & Support" action={{ label: "Open", href: "/support" }}>
        <AccountRow
          title="How Side Quest Chess works"
          meta="Start here for Side Quests, proof, chess usernames, and Multiplayer."
          status=""
          href="/support"
          image={mobileAsset.coat}
        />
        <AccountRow
          title="Report a problem"
          meta="Tell us what you tried, what happened, and where you got stuck."
          status=""
          href="/support"
          image={mobileAsset.coat}
        />
      </AccountSection>

      <AccountLogoutButton />
    </div>
  );
}

function SignedOutAccountScreen() {
  return (
    <div className="sqc-account-stack">
      <section className="sqc-account-hero">
        <p className="sqc-account-kicker">My Account</p>
        <h1>Sign in to sync your board.</h1>
        <p className="sqc-account-copy">Sign in to save Side Quest progress, latest proof, Coat of Arms unlocks, and connected chess usernames.</p>
        <Link href="/sign-in" className="sqc-primary-action">Choose sign-in method</Link>
      </section>
    </div>
  );
}

function ProfileEditorCard({
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
  );
}

function AccountSection({ title, action, children }: { title: string; action?: { label: string; href: string }; children: ReactNode }) {
  return (
    <section className="sqc-account-section">
      <div className="sqc-account-section-head">
        <h2>{title}</h2>
        {action ? <Link href={action.href}>{action.label}</Link> : null}
      </div>
      <div className="sqc-account-list">{children}</div>
    </section>
  );
}

function ReadinessChip({ label, value }: { label: string; value: string }) {
  return (
    <Link href="/settings" className="sqc-readiness-chip">
      <span>{label}</span>
      <strong>{value || "Add"}</strong>
    </Link>
  );
}

function AccountRow({ title, meta, status, href, image, statusImage }: { title: string; meta: string; status?: string; href: string; image: string; statusImage?: string | null }) {
  const visibleStatus = status && !["Open", "-", "Proof"].includes(status) ? status : null;

  return (
    <Link href={href} className="sqc-account-row">
      <span className="sqc-account-row-image">
        <Image alt="" src={image} width={44} height={44} />
      </span>
      <span className="sqc-account-row-copy">
        <strong>{title}</strong>
        <small>{meta}</small>
      </span>
      {statusImage ? <Image className="sqc-account-row-status-image" alt="" src={statusImage} width={35} height={35} /> : visibleStatus ? <span className="sqc-account-row-status">{visibleStatus}</span> : null}
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <span className="sqc-account-metric">
      <strong>{value}</strong>
      <small>{label}</small>
    </span>
  );
}

function RatingColumn({ title, username, ratings }: { title: string; username: string; ratings: Array<{ label: string; rating: number }> }) {
  return (
    <div className="sqc-rating-column">
      <strong>{title}</strong>
      <small>{username || "Not connected"}</small>
      {ratings.slice(0, 4).map((rating) => (
        <span key={`${title}-${rating.label}`}>
          {rating.label}
          <b>{rating.rating}</b>
        </span>
      ))}
      {!ratings.length ? <em>No public ratings loaded yet.</em> : null}
    </div>
  );
}

function formatRecentActivity(value: string | null) {
  if (!value) return "recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  const deltaMs = Date.now() - date.getTime();
  if (deltaMs < 10 * 60 * 1000) return "just now";
  if (deltaMs < 60 * 60 * 1000) return `${Math.max(1, Math.round(deltaMs / 60000))} min ago`;
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatLatestCheck(value: string | null | undefined) {
  if (!value) return "no new eligible games";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "no new eligible games";
  return `latest check ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function toMobileAssetPath(path?: string | null) {
  if (!path) return mobileAsset.fallbackBadge;
  if (path.startsWith("/mobile-source/")) return path;
  if (path.startsWith("/badges/")) return `/mobile-source${path}`;
  if (path.startsWith("/stamps/")) return `/mobile-source${path}`;
  return path;
}
