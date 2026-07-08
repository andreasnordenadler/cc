import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Challenge } from "@/lib/challenges";

type AppTab = "home" | "sideQuests" | "multiplayerSideQuests" | "coatOfArms" | "account";

type MobileAppWebShellProps = {
  activeTab: AppTab;
  signedIn: boolean;
  displayName?: string | null;
  profileImageUrl?: string | null;
  lichessUsername?: string | null;
  chessComUsername?: string | null;
  activeSolo?: ActiveSoloHome | null;
  activeSoloTitle?: string | null;
  trophyRows?: TrophyRow[];
  completedSoloCount?: number;
  proofReceiptCount?: number;
  children?: ReactNode;
};

type ActiveSoloHome = {
  title: string;
  objective: string;
  instruction: string;
  badgeImage?: string | null;
  glowImage?: string | null;
  pickedAt?: string | null;
  verifiedAt?: string | null;
  completed?: boolean;
  latestAttempt?: {
    status?: string | null;
    checkedAt?: string | null;
    finalPositionFen?: string | null;
    lastMoveUci?: string | null;
    lastMoveSan?: string | null;
    playerColor?: "white" | "black" | null;
    failureFen?: string | null;
    failureUci?: string | null;
    summary?: string | null;
    headline?: string | null;
  } | null;
};

type TrophyRow = {
  id: string;
  title: string;
  meta: string;
  href: string;
  image?: string | null;
  glow?: string | null;
  statusImage?: string | null;
};

const menuItems = [
  { id: "home", label: "Home", href: "/", icon: "home" },
  { id: "sideQuests", label: "Solo Side Quests", href: "/side-quests", icon: "flag" },
  { id: "multiplayer", label: "Multiplayer Side Quests", href: "/multiplayer", icon: "group" },
  { id: "coats", label: "Trophy Cabinet", href: "/trophy-cabinet", icon: "shield" },
  { id: "custom", label: "My Custom Side Quests", href: "/custom-side-quests", icon: "edit" },
  { id: "createCustom", label: "Create Custom Side Quest", href: "/create-custom-side-quest", icon: "plus" },
  { id: "createMultiplayer", label: "Create Multiplayer Side Quest", href: "/create-multiplayer-side-quest", icon: "plus" },
  { id: "account", label: "My Account", href: "/account", icon: "person" },
  { id: "support", label: "Help & Support", href: "/support", icon: "help" },
];

const mobileAsset = {
  coat: "/mobile-source/sqc-coat-of-arms.png",
  coatGlow: "/mobile-source/badges/glow/sqc-coat-generic-glow.png",
  multiplayerSeal: "/mobile-source/stamps/sqc-multiplayer-seal.png",
  customCrest: "/mobile-source/badges/custom-side-quest-crest.png",
  completedSeal: "/mobile-source/stamps/quest-complete-red-wax-sqc-v15.png",
  fallbackBadge: "/mobile-source/badges/v6/proof-loop-test-badge.png",
};

export default function MobileAppWebShell({
  activeTab,
  signedIn,
  displayName,
  profileImageUrl,
  lichessUsername,
  chessComUsername,
  activeSolo,
  activeSoloTitle,
  trophyRows = [],
  completedSoloCount = 0,
  proofReceiptCount = 0,
  children,
}: MobileAppWebShellProps) {
  const profileInitial = (displayName?.trim().slice(0, 1) || "S").toUpperCase();
  const hasChessAccount = Boolean(lichessUsername || chessComUsername);

  return (
    <main className="sqc-mobile-web" data-source="active-mobile-today-dashboard">
      <div className="sqc-mobile-backdrop" aria-hidden="true" />

      {signedIn ? (
        <>
          <details className="sqc-menu">
            <summary aria-label="Open main menu">
              <span />
            </summary>
            <nav aria-label="Main menu" className="sqc-menu-panel">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={isActiveMenuItem(item.id, activeTab) ? "sqc-menu-row active" : "sqc-menu-row"}
                  aria-current={isActiveMenuItem(item.id, activeTab) ? "page" : undefined}
                >
                  <span className={`sqc-menu-icon ${item.icon}`} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </details>

          <header className="sqc-app-header">
            <div className="sqc-identity">
              <strong>{displayName || "Side Quest Chess"}</strong>
              <span>
                {lichessUsername ? <small>lichess · {lichessUsername}</small> : null}
                {chessComUsername ? <small>chess.com · {chessComUsername}</small> : null}
                {!hasChessAccount ? <small>Add a public chess username before checking Side Quest proof.</small> : null}
              </span>
            </div>
            <Link href="/account" className="sqc-account-dot" aria-label="Open account settings">
              {profileImageUrl ? <img alt="" src={profileImageUrl} referrerPolicy="no-referrer" /> : profileInitial}
            </Link>
          </header>
        </>
      ) : (
        <header className="sqc-app-header guest">
          <h1>Side Quest Chess</h1>
        </header>
      )}

      {activeTab !== "home" ? (
        <Link href="/" className="sqc-close-screen" aria-label="Close screen">
          <span aria-hidden="true" />
        </Link>
      ) : null}

      <section className="sqc-screen" aria-label={activeTab === "home" ? "Home" : "Current screen"}>
        {children ?? (
          signedIn ? (
            <SignedInHome
              hasChessAccount={hasChessAccount}
              activeSolo={activeSolo}
              activeSoloTitle={activeSoloTitle}
              trophyRows={trophyRows}
              completedSoloCount={completedSoloCount}
              proofReceiptCount={proofReceiptCount}
            />
          ) : (
            <GuestHome />
          )
        )}
      </section>
    </main>
  );
}

function GuestHome() {
  return (
    <div className="sqc-fresh-shell">
      <div className="sqc-fresh-guest-coat-wrap" aria-hidden="true">
        <Image className="sqc-fresh-guest-coat-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-fresh-guest-coat" alt="" src={mobileAsset.coat} width={132} height={148} priority />
      </div>
      <section className="sqc-fresh-panel-centered" aria-label="Side Quest Chess introduction">
        <h2>Sign in to continue.</h2>
        <p>
          Chess, but with stupidly hard side quests — solo or multiplayer. Browse the live boards first;
          sign in when you want SQC to save progress, verify proof, or join a table.
        </p>
        <div className="sqc-action-pair">
          <Link href="/side-quests" className="sqc-secondary-action">Browse Solo Side Quests</Link>
          <Link href="/multiplayer" className="sqc-secondary-action">Browse Multiplayer Side Quests</Link>
        </div>
        <Link href="/sign-in" className="sqc-primary-action">Choose sign-in method</Link>
      </section>
    </div>
  );
}

function SignedInHome({
  hasChessAccount,
  activeSolo,
  activeSoloTitle,
  trophyRows,
  completedSoloCount,
  proofReceiptCount,
}: {
  hasChessAccount: boolean;
  activeSolo?: ActiveSoloHome | null;
  activeSoloTitle?: string | null;
  trophyRows: TrophyRow[];
  completedSoloCount: number;
  proofReceiptCount: number;
}) {
  const activeTitle = activeSolo?.title ?? activeSoloTitle ?? null;
  const hasActiveSolo = Boolean(activeTitle);

  return (
    <div className="sqc-stack">
      {!hasChessAccount ? (
        <Link href="/account" className="sqc-blocker">
          <strong>Connect a chess username</strong>
          <span>SQC needs Lichess or Chess.com before it can check real games.</span>
        </Link>
      ) : null}

      {activeSolo?.badgeImage ? (
        <MobileAssetMark
          className="sqc-active-solo-emblem"
          image={toMobileAssetPath(activeSolo.badgeImage) ?? mobileAsset.fallbackBadge}
          glow={activeSolo.glowImage ?? mobileAsset.coatGlow}
          size={138}
          glowSize={170}
        />
      ) : null}

      <section className="sqc-current-card">
        <button className="sqc-refresh" type="button" aria-label="Refresh active Solo Side Quest">
          <span aria-hidden="true" />
        </button>
        <div className="sqc-current-body">
          {!activeSolo?.badgeImage ? <MobileAssetMark className="sqc-current-mark" image={mobileAsset.coat} glow={mobileAsset.coatGlow} size={82} glowSize={104} /> : null}
          <div>
            <p className="sqc-pill">Active Solo Side Quest</p>
            <h2>{activeTitle ?? "Choose a Solo Side Quest"}</h2>
            {activeSolo ? (
              <ActiveSoloDetail activeSolo={activeSolo} />
            ) : (
              <p>{hasActiveSolo ? "Play a new public game on Lichess or Chess.com, then come back for automatic proof." : "Choose a Side Quest, play on Lichess or Chess.com, then come back for automatic proof."}</p>
            )}
          </div>
        </div>
        <Link href="/side-quests" className="sqc-primary-action fit">{hasActiveSolo ? "Explore More Solo Side Quests" : "Explore Solo Side Quests"}</Link>
      </section>

      <div className="sqc-refresh-hint" aria-hidden="true">
        <span />
        <small>Pull down to refresh</small>
      </div>

      <section className="sqc-home-section">
        <div className="sqc-section-hero">
          <MobileAssetMark className="sqc-section-mark group" image={mobileAsset.multiplayerSeal} glow={mobileAsset.coatGlow} size={100} glowSize={142} />
          <p className="sqc-pill">Active Multiplayer Side Quests</p>
          <h2>No active Multiplayer Side Quests</h2>
        </div>
        <div className="sqc-row-list">
          <AppRow title="No active Multiplayer Side Quests" meta="Join or host shared challenges with friends." status="Explore" href="/multiplayer" />
        </div>
        <Link href="/multiplayer" className="sqc-secondary-action full">Explore More Multiplayer Side Quests</Link>
      </section>

      <section className="sqc-home-section">
        <div className="sqc-section-hero">
          <MobileAssetMark className="sqc-section-mark trophy" image={mobileAsset.coat} glow={mobileAsset.coatGlow} size={112} glowSize={156} />
          <p className="sqc-pill">Trophy Cabinet</p>
        </div>
        <div className="sqc-row-list">
          {trophyRows.length ? trophyRows.map((row) => (
            <AppRow
              key={row.id}
              title={row.title}
              meta={row.meta}
              status="Open"
              href={row.href}
              image={row.image ?? undefined}
              glow={row.glow}
              statusImage={row.statusImage}
            />
          )) : (
            <AppRow
              title={completedSoloCount ? `${completedSoloCount} Coat of Arms unlocked` : "No Coat of Arms yet"}
              meta={completedSoloCount ? `${proofReceiptCount} proof receipt${proofReceiptCount === 1 ? "" : "s"} recorded.` : "Complete a Side Quest to unlock your first trophy."}
              status={completedSoloCount ? "Open" : "Explore"}
              href={completedSoloCount ? "/trophy-cabinet" : "/side-quests"}
              image={mobileAsset.coat}
            />
          )}
        </div>
        <Link href="/trophy-cabinet" className="sqc-secondary-action full">Open Trophy Cabinet</Link>
      </section>

      <div className="sqc-refresh-hint" aria-hidden="true">
        <span />
        <small>Pull down to refresh</small>
      </div>
    </div>
  );
}

function ActiveSoloDetail({ activeSolo }: { activeSolo: ActiveSoloHome }) {
  const attempt = activeSolo.latestAttempt;
  const passed = activeSolo.completed || attempt?.status === "passed" || Boolean(attempt?.headline?.toLowerCase().includes("passed"));
  const failed = Boolean(attempt && !passed && attempt.status && attempt.status !== "pending");
  const boardFen = failed ? attempt?.failureFen ?? attempt?.finalPositionFen : attempt?.finalPositionFen;
  const boardUci = failed ? attempt?.failureUci ?? attempt?.lastMoveUci : attempt?.lastMoveUci;

  return (
    <div className="sqc-active-detail">
      <MiniChessBoard fen={boardFen} highlightUci={boardUci} orientation={attempt?.playerColor ?? "white"} />
      <div className="sqc-active-detail-copy">
        <p><strong>Goal:</strong> {activeSolo.objective}</p>
        <p><strong>Picked:</strong> {formatRelativeDateTime(activeSolo.pickedAt, "not recorded")}</p>
        <p><strong>Latest check:</strong> {formatRelativeDateTime(attempt?.checkedAt ?? activeSolo.verifiedAt, "not yet")}</p>
        <p><strong>Status:</strong> <span className={passed ? "sqc-good" : "sqc-danger"}>{passed ? "Completed" : "Not Completed"}</span></p>
        <p className="sqc-active-summary">{attempt?.summary ?? activeSolo.instruction}</p>
      </div>
    </div>
  );
}

function MiniChessBoard({ fen, highlightUci, orientation }: { fen?: string | null; highlightUci?: string | null; orientation?: "white" | "black" | null }) {
  const squares = parseFenBoard(fen, orientation ?? "white");
  const highlight = highlightUci ? [highlightUci.slice(0, 2), highlightUci.slice(2, 4)] : [];

  return (
    <div className="sqc-mini-board" aria-label="Latest chess position">
      {squares.map((square, index) => (
        <span
          key={square.square}
          className={[
            "sqc-mini-square",
            (Math.floor(index / 8) + index) % 2 === 0 ? "light" : "dark",
            highlight.includes(square.square) ? "highlight" : "",
          ].filter(Boolean).join(" ")}
        >
          {square.piece ? chessPiece(square.piece) : ""}
        </span>
      ))}
    </div>
  );
}

export function MobileSoloSideQuestsScreen({
  challenges,
  activeChallengeId,
  completedChallengeIds,
}: {
  challenges: Challenge[];
  activeChallengeId?: string | null;
  completedChallengeIds?: string[];
}) {
  const completedSet = new Set(completedChallengeIds ?? []);
  const sortedChallenges = [...challenges].sort((a, b) => {
    if (a.id === activeChallengeId) return -1;
    if (b.id === activeChallengeId) return 1;
    const aCompleted = completedSet.has(a.id);
    const bCompleted = completedSet.has(b.id);
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
    const difficultyDelta = difficultyRank(a.difficulty) - difficultyRank(b.difficulty);
    if (difficultyDelta !== 0) return difficultyDelta;
    if (a.reward !== b.reward) return a.reward - b.reward;
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="sqc-stack">
      <section className="sqc-panel hero">
        <span className="sqc-eyebrow">Solo Side Quests</span>
        <h1>Official Side Quests</h1>
        <p>Pick one Solo Side Quest at a time. After you choose it, play a new public Lichess or Chess.com game so Side Quest Chess has a fresh game to check.</p>
        <div className="sqc-brand-tabs" role="tablist" aria-label="Solo Side Quest catalog">
          <Link href="/side-quests" className="sqc-brand-tab official active" role="tab" aria-selected="true">Official Side Quests</Link>
          <Link href="/community-side-quests" className="sqc-brand-switch" aria-label="Switch to Community Side Quests">
            <span aria-hidden="true" />
          </Link>
          <Link href="/community-side-quests" className="sqc-brand-tab community" role="tab" aria-selected="false">Community Side Quests</Link>
        </div>
      </section>

      <section className="sqc-panel list">
        <div className="sqc-list-head">
          <h2>{sortedChallenges.length} official Side Quests</h2>
        </div>
        <div className="sqc-catalog">
          {sortedChallenges.map((challenge) => (
            <AppRow
              key={challenge.id}
              title={challenge.title}
              meta={challenge.objective}
              status={challenge.id === activeChallengeId ? "Active" : completedSet.has(challenge.id) ? "Completed" : challenge.difficulty}
              href={`/challenges/${challenge.id}`}
              image={toMobileAssetPath(challenge.badgeIdentity.image) ?? mobileAsset.fallbackBadge}
              glow={getChallengeGlowPath(challenge.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export function MobileSimpleScreen({
  eyebrow,
  title,
  body,
  primaryAction,
  secondaryAction,
  rows,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  rows?: Array<{ title: string; meta: string; status: string; href: string }>;
}) {
  return (
    <div className="sqc-stack">
      <section className="sqc-panel hero">
        <span className="sqc-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{body}</p>
        {primaryAction || secondaryAction ? (
          <div className="sqc-action-pair one-or-two">
            {secondaryAction ? <Link href={secondaryAction.href} className="sqc-secondary-action">{secondaryAction.label}</Link> : null}
            {primaryAction ? <Link href={primaryAction.href} className="sqc-primary-action">{primaryAction.label}</Link> : null}
          </div>
        ) : null}
      </section>

      {rows?.length ? (
        <section className="sqc-panel list">
          <div className="sqc-catalog">
            {rows.map((row) => (
              <AppRow key={`${row.title}-${row.href}`} {...row} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function MobileMultiplayerSideQuestsScreen({
  selectedTab,
  signedIn,
}: {
  selectedTab: "official" | "community";
  signedIn: boolean;
}) {
  return (
    <div className="sqc-stack">
      <div className="sqc-screen-emblem" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image multiplayer" alt="" src={mobileAsset.multiplayerSeal} width={118} height={118} priority />
      </div>

      <div className="sqc-brand-tabs" role="tablist" aria-label="Multiplayer Side Quest catalog">
        <Link
          href="/multiplayer"
          className={selectedTab === "official" ? "sqc-brand-tab official active" : "sqc-brand-tab official"}
          role="tab"
          aria-selected={selectedTab === "official"}
        >
          Official Side Quests
        </Link>
        <Link
          href={selectedTab === "official" ? "/multiplayer-side-quests" : "/multiplayer"}
          className="sqc-brand-switch"
          aria-label={selectedTab === "official" ? "Switch to Community Multiplayer Side Quests" : "Switch to Official Multiplayer Side Quests"}
        >
          <span aria-hidden="true" />
        </Link>
        <Link
          href="/multiplayer-side-quests"
          className={selectedTab === "community" ? "sqc-brand-tab community active" : "sqc-brand-tab community"}
          role="tab"
          aria-selected={selectedTab === "community"}
        >
          Community Side Quests
        </Link>
      </div>

      {selectedTab === "official" ? <OfficialMultiplayerPanel signedIn={signedIn} /> : <CommunityMultiplayerPanel signedIn={signedIn} />}
    </div>
  );
}

function OfficialMultiplayerPanel({ signedIn }: { signedIn: boolean }) {
  return (
    <>
      <section className="sqc-native-card" aria-label="SQC Official Multiplayer Side Quests">
        <div className="sqc-list-head inline">
          <h2>Official Multiplayer Side Quests</h2>
          <span>0 official</span>
        </div>
        <div className="sqc-empty-panel">
          <strong>Official Multiplayer Side Quests</strong>
          <span>No official Multiplayer Side Quests are open right now.</span>
        </div>
      </section>

      {signedIn ? (
        <>
          <section className="sqc-native-card green" aria-label="Latest finished official Multiplayer Side Quest results">
            <span className="sqc-card-eyebrow">Latest finished official set</span>
            <h2>Gold, silver, bronze.</h2>
            <p>The latest completed official weekly set appears here after the leaderboard closes.</p>
            <p>Results will appear here after the first official weekly set finishes.</p>
          </section>

          <section className="sqc-native-card green" aria-label="Browse earlier official Multiplayer Side Quest results">
            <span className="sqc-card-eyebrow">Earlier official weeks</span>
            <h2>Browse weekly results.</h2>
            <p>Finished official Multiplayer Side Quest sets are grouped by week so we can keep running this weekly.</p>
            <p>Earlier weekly result sets will appear here after the next official cycle closes.</p>
          </section>
        </>
      ) : null}
    </>
  );
}

function CommunityMultiplayerPanel({ signedIn }: { signedIn: boolean }) {
  return (
    <>
      <section className="sqc-empty-panel standalone">
        <strong>Community Multiplayer Side Quests</strong>
        <span>
          {signedIn
            ? "These are Multiplayer Side Quests created, joined, hosted, or finished by the Side Quest Chess community."
            : "Browse public Multiplayer Side Quests from the Side Quest Chess community. Sign in when you want to join one."}
        </span>
      </section>

      {signedIn ? (
        <>
          <section className="sqc-native-card green" aria-label="Your Multiplayer Side Quests">
            <span className="sqc-card-eyebrow">Active · joined and hosted</span>
            <h2>Your active Multiplayer Side Quests.</h2>
            <p>Joined and hosted Multiplayer Side Quests come first so your current tables are easy to resume.</p>
            <div className="sqc-empty-panel">
              <strong>No active Multiplayer Side Quests yet.</strong>
              <span>Join an open Multiplayer Side Quest, paste an invite code, or create your own.</span>
            </div>
          </section>

          <section className="sqc-native-card green" aria-label="Finished Multiplayer Side Quests">
            <span className="sqc-card-eyebrow">Recently finished · 0</span>
            <h2>Recently finished Multiplayer Side Quests.</h2>
            <p>No finished Multiplayer Side Quests yet.</p>
          </section>
        </>
      ) : null}

      <section className="sqc-native-card green" aria-label="Community Multiplayer Side Quests">
        <span className="sqc-card-eyebrow">Available to join · community</span>
        <h2>Community Multiplayer Side Quests.</h2>
        <p>{signedIn ? "Public player-hosted Multiplayer Side Quests appear after your active and recently finished tables." : "Public player-hosted Multiplayer Side Quests you can inspect before signing in."}</p>
        <div className="sqc-community-browse-panel">
          <label className="sqc-search-shell">
            <input readOnly placeholder="Search multiplayer community" aria-label="Search multiplayer community" />
          </label>
          <div className="sqc-community-controls">
            <div className="sqc-filter-row">
              <span className="active">Open</span>
              <span>All</span>
              {signedIn ? (
                <>
                  <span>Joined</span>
                  <span>Hosted</span>
                  <span>Finished</span>
                </>
              ) : null}
            </div>
            <span className="sqc-sort-pill">Sort: Closing</span>
          </div>
        </div>
        <p>No public community Multiplayer Side Quests right now.</p>
      </section>

      {signedIn ? (
        <>
          <section className="sqc-native-card green" aria-label="Create Multiplayer Side Quest fast action">
            <span className="sqc-card-eyebrow">Create</span>
            <h2>Create a Community Multiplayer Side Quest.</h2>
            <p>Pick up to four Side Quests, set the time window, then share the table with players.</p>
            <Link href="/create-multiplayer-side-quest" className="sqc-primary-action">Create Multiplayer Side Quest</Link>
          </section>

          <section className="sqc-native-card green" aria-label="Join private Multiplayer Side Quest">
            <span className="sqc-card-eyebrow">Invite Code</span>
            <h2>Join private Multiplayer Side Quest.</h2>
            <p>Paste an invite code from the host to join a private Multiplayer Side Quest.</p>
            <label className="sqc-form-row">
              <span>Invite code</span>
              <input readOnly placeholder="e.g. nocastle-ab12cd" aria-label="Invite code" />
            </label>
            <span className="sqc-secondary-action full">Join with code</span>
          </section>
        </>
      ) : null}
    </>
  );
}

export function MobileCreateMultiplayerScreen() {
  return (
    <div className="sqc-stack">
      <section className="sqc-multiplayer-detail-hero">
        <MobileAssetMark className="sqc-section-mark group" image={mobileAsset.multiplayerSeal} glow={mobileAsset.coatGlow} size={100} glowSize={142} />
        <span className="sqc-multiplayer-kicker">Create Multiplayer Side Quest</span>
        <h1>Start a shared Multiplayer Side Quest.</h1>
        <p>Choose the rules, create the Multiplayer Side Quest, then share the invite with players.</p>
      </section>

      <section className="sqc-native-card">
        <div className="sqc-form-list">
          <label className="sqc-form-row">
            <span>Quest name</span>
            <input readOnly value="" placeholder="Name this Multiplayer Side Quest" aria-label="Quest name" />
            <small>Required. Make it clear enough that players know what they are joining.</small>
          </label>
          <label className="sqc-form-row">
            <span>Intro text</span>
            <textarea readOnly placeholder="Explain what players are joining..." aria-label="Intro text" />
            <small>Shown to players before they join.</small>
          </label>
          <span className="sqc-form-label">Access</span>
          <div className="sqc-option-grid">
            <OptionCard title="Public" helper="Visible in Browse" selected />
            <OptionCard title="Unlisted link" helper="Only players with the link can join" />
            <OptionCard title="Invite code" helper="Only players with the invite code or link can join" />
          </div>
          <span className="sqc-form-label">Games allowed</span>
          <div className="sqc-option-grid">
            <OptionCard title="Lichess or Chess.com" helper="Players can use Lichess or Chess.com" selected />
            <OptionCard title="Lichess" helper="Only public Lichess games" />
            <OptionCard title="Chess.com" helper="Only public Chess.com games" />
          </div>
          <label className="sqc-form-row">
            <span>Start</span>
            <input readOnly value="A few minutes from now" aria-label="Start" />
            <small>Defaults to a few minutes from now so players can join before games count.</small>
          </label>
          <label className="sqc-form-row">
            <span>End</span>
            <input readOnly value="7 days after start" aria-label="End" />
          </label>
          <span className="sqc-form-label">Quick duration</span>
          <div className="sqc-filter-row">
            <span>24h</span>
            <span>3 days</span>
            <span className="active">1 week</span>
            <span>2 weeks</span>
          </div>
          <Link href="/create-multiplayer-side-quest" className="sqc-quiet-button">Advanced: time, rated, color</Link>
        </div>
      </section>

      <section className="sqc-native-card">
        <span className="sqc-card-eyebrow">Included Side Quests</span>
        <div className="sqc-create-selection-head">
          <div>
            <h2>Your Multiplayer draft</h2>
            <p>0/4 Side Quests selected</p>
          </div>
        </div>
        <div className="sqc-selection-empty">
          <strong>No Side Quests selected yet.</strong>
          <span>Search or browse below, then tap rows to add them here.</span>
        </div>
      </section>

      <section className="sqc-native-card">
        <span className="sqc-card-eyebrow">Add from catalog</span>
        <h2>Browse like Community Side Quests.</h2>
        <label className="sqc-search-shell">
          <input readOnly placeholder="Search Side Quests" aria-label="Search Side Quests" />
        </label>
        <div className="sqc-filter-row">
          <span className="active">Browse</span>
          <span>Selected (0)</span>
        </div>
        <div className="sqc-brand-tabs" role="tablist" aria-label="Choose Side Quest source">
          <Link href="/create-multiplayer-side-quest" className="sqc-brand-tab official active" role="tab" aria-selected="true">Official (13)</Link>
          <Link href="/create-multiplayer-side-quest" className="sqc-brand-switch" aria-label="Switch to Community Side Quests">
            <span aria-hidden="true" />
          </Link>
          <Link href="/create-multiplayer-side-quest" className="sqc-brand-tab community" role="tab" aria-selected="false">Community (0)</Link>
        </div>
        <div className="sqc-catalog">
          <AppRow title="Any Game Counts" meta="Play any finished game — win, lose, or draw — and complete the quest." status="Add" href="/challenges/finish-any-game" image="/mobile-source/badges/v6/proof-loop-test-badge.png" glow="/mobile-source/badges/glow/finish-any-game-glow.png" />
          <AppRow title="Knights Before Coffee" meta="For your first four moves, only move knights — then win the game." status="Add" href="/challenges/knights-before-coffee" image="/mobile-source/badges/v6/knights-before-coffee-badge.png" glow="/mobile-source/badges/glow/knights-before-coffee-glow.png" />
          <AppRow title="No Castle Club" meta="Win a 10+ move game without castling." status="Add" href="/challenges/no-castle-club" image="/mobile-source/badges/v4/no-castle-club-badge.png" glow="/mobile-source/badges/glow/no-castle-club-glow.png" />
        </div>
      </section>

      <section className="sqc-create-footer-bar">
        <div>
          <strong>Choose at least one Side Quest</strong>
          <span>Name the Multiplayer Side Quest before creating.</span>
        </div>
        <Link href="/multiplayer" className="sqc-create-footer-button">Create</Link>
      </section>
    </div>
  );
}

function OptionCard({ title, helper, selected = false }: { title: string; helper: string; selected?: boolean }) {
  return (
    <div className={selected ? "sqc-option-card selected" : "sqc-option-card"}>
      <span aria-hidden="true" />
      <strong>{title}</strong>
      <small>{helper}</small>
    </div>
  );
}

function MobileAssetMark({
  className,
  image,
  glow,
  size,
  glowSize,
}: {
  className: string;
  image: string;
  glow?: string;
  size: number;
  glowSize?: number;
}) {
  return (
    <span className={className} aria-hidden="true">
      {glow ? <Image className="sqc-mark-glow" alt="" src={glow} width={glowSize ?? size} height={glowSize ?? size} priority /> : null}
      <Image className="sqc-mark-image" alt="" src={image} width={size} height={size} priority />
    </span>
  );
}

function AppRow({
  title,
  meta,
  status,
  href,
  image,
  glow,
  statusImage,
}: {
  title: string;
  meta: string;
  status: string;
  href: string;
  image?: string;
  glow?: string | null;
  statusImage?: string | null;
}) {
  return (
    <Link href={href} className="sqc-app-row">
      <span className="sqc-row-icon" aria-hidden="true">
        {glow ? <Image className="sqc-row-glow" alt="" src={glow} width={50} height={50} /> : null}
        <Image className="sqc-row-image" alt="" src={image ?? getRowImage(title, href)} width={42} height={42} />
      </span>
      <span className="sqc-row-copy">
        <strong>{title}</strong>
        <small>{meta}</small>
      </span>
      {statusImage ? (
        <Image className="sqc-row-status-image" alt="" src={statusImage} width={38} height={38} />
      ) : (
        <span className="sqc-row-status">{status}</span>
      )}
    </Link>
  );
}

function getRowImage(title: string, href: string) {
  if (href.includes("multiplayer") || title.toLowerCase().includes("multiplayer")) return mobileAsset.multiplayerSeal;
  if (href.includes("custom") || title.toLowerCase().includes("custom")) return mobileAsset.customCrest;
  if (href.includes("trophy") || title.toLowerCase().includes("coat")) return mobileAsset.coat;
  if (title.toLowerCase().includes("completed")) return mobileAsset.completedSeal;
  return mobileAsset.fallbackBadge;
}

function toMobileAssetPath(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("/mobile-source/")) return path;
  if (path.startsWith("/badges/")) return `/mobile-source${path}`;
  if (path.startsWith("/stamps/")) return `/mobile-source${path}`;
  return path;
}

function getChallengeGlowPath(challengeId: string) {
  const known = new Set([
    "bishop-field-trip",
    "early-king-walk",
    "finish-any-game",
    "knightmare-mode",
    "knights-before-coffee",
    "no-castle-club",
    "pawn-only-picnic",
    "queen-never-heard-of-her",
    "the-blunder-gambit",
  ]);
  return known.has(challengeId) ? `/mobile-source/badges/glow/${challengeId}-glow.png` : null;
}

function isActiveMenuItem(id: string, activeTab: AppTab) {
  if (id === "home") return activeTab === "home";
  if (id === "sideQuests" || id === "custom" || id === "createCustom") return activeTab === "sideQuests";
  if (id === "multiplayer" || id === "createMultiplayer") return activeTab === "multiplayerSideQuests";
  if (id === "coats") return activeTab === "coatOfArms";
  if (id === "account") return activeTab === "account";
  return false;
}

function difficultyRank(difficulty: Challenge["difficulty"]) {
  if (difficulty === "Easy") return 1;
  if (difficulty === "Medium") return 2;
  if (difficulty === "Hard") return 3;
  if (difficulty === "Brutal") return 4;
  return 5;
}

function formatRelativeDateTime(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dateKey = date.toDateString();
  const prefix = dateKey === today.toDateString()
    ? "Today"
    : dateKey === yesterday.toDateString()
      ? "Yesterday"
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${prefix} · ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}

function parseFenBoard(fen: string | null | undefined, orientation: "white" | "black") {
  const boardFen = fen?.split(" ")[0] || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  const ranks = boardFen.split("/");
  const files = orientation === "black" ? ["h", "g", "f", "e", "d", "c", "b", "a"] : ["a", "b", "c", "d", "e", "f", "g", "h"];
  const rankNumbers = orientation === "black" ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

  return rankNumbers.flatMap((rankNumber, rankIndex) => {
    const sourceRank = ranks[8 - rankNumber] ?? "8";
    const expanded = [...sourceRank].flatMap((entry) => /\d/.test(entry) ? Array(Number(entry)).fill("") : [entry]);
    const oriented = orientation === "black" ? expanded.reverse() : expanded;

    return files.map((file, fileIndex) => ({
      square: `${file}${rankNumber}`,
      piece: oriented[fileIndex] ?? "",
      rankIndex,
    }));
  });
}

function chessPiece(piece: string) {
  const pieces: Record<string, string> = {
    K: "♔",
    Q: "♕",
    R: "♖",
    B: "♗",
    N: "♘",
    P: "♙",
    k: "♚",
    q: "♛",
    r: "♜",
    b: "♝",
    n: "♞",
    p: "♟",
  };
  return pieces[piece] ?? "";
}
