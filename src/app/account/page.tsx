import MobileAppWebShell from "@/components/mobile-app-web-shell";
import AccountLogoutButton from "@/components/account-logout-button";
import DeleteAccountControl from "@/components/delete-account-control";
import { saveRunnerProfile } from "@/app/actions";
import type { ActiveMultiplayerAccountSummary, MobileWebAccountStats, MobileWebTrophyRow } from "@/lib/mobile-web-trophies";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { CHALLENGES } from "@/lib/challenges";
import { getChessRatingSnapshots } from "@/lib/chess-ratings";
import { getCustomSideQuests, type CustomSideQuest } from "@/lib/custom-side-quests";
import { getActiveMultiplayerAccountRow, getMobileWebAccountOverview } from "@/lib/mobile-web-trophies";
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
  const privateMetadata = user?.privateMetadata && typeof user.privateMetadata === "object"
    ? (user.privateMetadata as UserMetadataRecord)
    : {};
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
  const privateCustomSideQuests = getCustomSideQuests(privateMetadata);
  const customSideQuests = privateCustomSideQuests.length ? privateCustomSideQuests : getCustomSideQuests(metadata);
  const accountOverview = user
    ? await getMobileWebAccountOverview(await clerkClient(), user.id, {
        completedChallengeIds: progress.completedChallengeIds,
        attempts: getChallengeAttempts(metadata),
        customSideQuestIds: customSideQuests.map((quest) => quest.id),
        limit: 5,
      })
    : null;

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
          trophyRows={accountOverview?.trophyRows ?? []}
          accountStats={accountOverview?.stats ?? null}
          activeMultiplayer={accountOverview?.activeMultiplayer ?? null}
          customSideQuests={customSideQuests}
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
  accountStats,
  activeMultiplayer,
  customSideQuests,
}: {
  displayName: string;
  email: string | null;
  imageUrl: string | null;
  lastSignInAt: string | null;
  metadata: UserMetadataRecord;
  lichessUsername: string;
  chessComUsername: string;
  trophyRows: MobileWebTrophyRow[];
  accountStats: MobileWebAccountStats | null;
  activeMultiplayer: ActiveMultiplayerAccountSummary | null;
  customSideQuests: CustomSideQuest[];
}) {
  const activeChallenge = getActiveChallenge(metadata);
  const activeChallengeRecord = activeChallenge?.id ? CHALLENGES.find((challenge) => challenge.id === activeChallenge.id) ?? null : null;
  const activeAttempt = getLatestChallengeAttempt(metadata, activeChallenge?.id);
  const ratings = getChessRatingSnapshots(metadata);


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
          <ReadinessChip label="Lichess" value={lichessUsername} href="#lichess-username" />
          <ReadinessChip label="Chess.com" value={chessComUsername} href="#chesscom-username" />
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
        <AccountMultiplayerRow summary={activeMultiplayer} />
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
            <Metric label="Completed" value={accountStats?.completedCount ?? 0} />
            <Metric label="Proofs" value={accountStats?.proofCount ?? 0} />
            <Metric label="Coats" value={accountStats?.coatCount ?? 0} />
            <Metric label="Podiums" value={accountStats?.podiumCount ?? 0} />
          </div>
          <p>Custom Side Quests: {accountStats?.customQuestCount ?? 0} made · {accountStats?.customTries ?? 0} tries · {accountStats?.customWins ?? 0} wins</p>
          <p>Multiplayer trophies: {accountStats?.podiumCount ?? 0} podium{accountStats?.podiumCount === 1 ? "" : "s"}</p>
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
              status={row.source === "solo" ? "Unlocked" : "Podium"}
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

      <DeleteAccountControl />
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
          <input id="lichess-username" name="lichessUsername" defaultValue={lichessUsername} autoCapitalize="none" autoCorrect="off" />
        </label>
        <label className="sqc-form-row">
          <span>Chess.com username</span>
          <input id="chesscom-username" name="chessComUsername" defaultValue={chessComUsername} autoCapitalize="none" autoCorrect="off" placeholder="optional" />
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

function ReadinessChip({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="sqc-readiness-chip">
      <span>{label}</span>
      <strong>{value || "Add"}</strong>
    </Link>
  );
}

export function AccountMultiplayerRow({ summary }: { summary: ActiveMultiplayerAccountSummary | null }) {
  const row = getActiveMultiplayerAccountRow(summary ?? {
    activeCount: 0,
    hostedCount: 0,
    joinedCount: 0,
    firstTitle: null,
  });

  return (
    <AccountRow
      title={row.title}
      meta={row.meta}
      status={row.status}
      href="/multiplayer"
      image={mobileAsset.multiplayerSeal}
    />
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
