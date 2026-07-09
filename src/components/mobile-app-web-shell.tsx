import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Challenge } from "@/lib/challenges";
import type { MobileWebShellTheme } from "@/lib/mobile-web-theme";
import { MobileWebRelativeTime } from "./mobile-web-relative-time";

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
  theme?: MobileWebShellTheme | null;
  trophyRows?: TrophyRow[];
  completedSoloCount?: number;
  proofReceiptCount?: number;
  modalPresentation?: boolean;
  immersivePresentation?: boolean;
  closeHref?: string;
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
  theme?: MobileWebShellTheme | null;
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
  source?: "multiplayer" | "solo";
};

type CommunitySideQuestRow = {
  id: string;
  title: string;
  meta: string;
  href: string;
  image?: string | null;
  sourceBadge?: string | null;
  status?: string | null;
};

const publicMultiplayerRows = [
  {
    id: "official-preview-knights",
    title: "Knights Before Coffee Rush",
    meta: "SQC official · 8 players · 18h left",
    href: "/groupquests/official-preview-knights",
    sourceBadge: "SQC Official",
  },
  {
    id: "official-preview-no-castle",
    title: "No Castle Club Night",
    meta: "SQC official · 14 players · 2d left",
    href: "/groupquests/official-preview-no-castle",
    sourceBadge: "SQC Official",
  },
  {
    id: "official-preview-queenless",
    title: "Queenless Cup",
    meta: "SQC official · 5 players · 4d left",
    href: "/groupquests/official-preview-queenless",
    sourceBadge: "SQC Official",
  },
];

const communityMultiplayerRows = [
  {
    id: "community-preview-rookless",
    title: "Rookless Weekend Table",
    meta: "Community public · 6 players · 23h left",
    href: "/groupquests/community-preview-rookless",
    sourceBadge: "Community",
  },
  {
    id: "community-preview-pawn-storm",
    title: "Pawn Storm Sprint",
    meta: "Community public · 4 players · 2d left",
    href: "/groupquests/community-preview-pawn-storm",
    sourceBadge: "Community",
  },
];

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
  theme,
  trophyRows = [],
  completedSoloCount = 0,
  proofReceiptCount = 0,
  modalPresentation = false,
  immersivePresentation = false,
  closeHref = "/",
  children,
}: MobileAppWebShellProps) {
  const profileInitial = (displayName?.trim().slice(0, 1) || "S").toUpperCase();
  const hasChessAccount = Boolean(lichessUsername || chessComUsername);
  const activeTheme = activeSolo?.theme ?? theme;
  const shellStyle = {
    "--sqc-bg-top": activeTheme?.backgroundTop ?? "#1e7773",
    "--sqc-bg-mid": activeTheme?.backgroundMid ?? "#123a3f",
    "--sqc-bg-glow": activeTheme?.glow ?? "rgba(96, 240, 175, .28)",
    "--sqc-bg-accent": activeTheme?.accent ?? "rgba(45, 212, 191, .2)",
  } as CSSProperties;

  return (
    <main className={immersivePresentation ? "sqc-mobile-web immersive" : "sqc-mobile-web"} data-source="active-mobile-today-dashboard" style={shellStyle}>
      <div className="sqc-mobile-backdrop" aria-hidden="true" />

      {modalPresentation ? null : signedIn ? (
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

          {immersivePresentation ? null : (
            <header className="sqc-app-header">
              <div className="sqc-identity">
                <strong>{displayName || "Side Quest Chess"}</strong>
                <span>
                  {lichessUsername ? <small><b>LICHESS</b> {lichessUsername}</small> : null}
                  {chessComUsername ? <small><b>CHESS.COM</b> {chessComUsername}</small> : null}
                  {!hasChessAccount ? <small>Add a public chess username before checking Side Quest proof.</small> : null}
                </span>
              </div>
              <Link href="/account" className="sqc-account-dot" aria-label="Open account settings">
                {profileImageUrl ? <img alt="" src={profileImageUrl} referrerPolicy="no-referrer" /> : profileInitial}
              </Link>
            </header>
          )}
        </>
      ) : (
        immersivePresentation ? null : (
          <header className="sqc-app-header guest">
            <h1>Side Quest Chess</h1>
          </header>
        )
      )}

      {activeTab !== "home" || modalPresentation ? (
        <Link href={closeHref} className="sqc-close-screen" aria-label="Close screen">
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

      <section className="sqc-current-card">
        {activeSolo?.badgeImage ? (
          <MobileAssetMark
            className="sqc-active-solo-emblem"
            image={toMobileAssetPath(activeSolo.badgeImage) ?? mobileAsset.fallbackBadge}
            glow={activeSolo.glowImage ?? mobileAsset.coatGlow}
            size={139}
            glowSize={170}
          />
        ) : null}
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
        <Link href="/side-quests" className="sqc-secondary-action full">{hasActiveSolo ? "Explore More Solo Side Quests" : "Explore Solo Side Quests"}</Link>
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
        <div className="sqc-row-list trophy-preview">
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
        <p><strong>Picked:</strong> <MobileWebRelativeTime value={activeSolo.pickedAt} fallback="not recorded" /></p>
        <p><strong>Latest check:</strong> <MobileWebRelativeTime value={attempt?.checkedAt ?? activeSolo.verifiedAt} fallback="not yet" /></p>
        <p><strong>Status:</strong> <span className={passed ? "sqc-good" : "sqc-danger"}>{passed ? "Completed" : "Not Completed"}</span></p>
        {attempt ? null : <p className="sqc-active-summary">Starting position shown until your next public game is available. Play on Lichess or Chess.com, then come back and refresh proof.</p>}
      </div>
    </div>
  );
}

export function MiniChessBoard({ fen, highlightUci, orientation }: { fen?: string | null; highlightUci?: string | null; orientation?: "white" | "black" | null }) {
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
    <div className="sqc-stack sqc-catalog-screen">
      <div className="sqc-screen-emblem solo" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image" alt="" src={mobileAsset.coat} width={132} height={148} priority />
      </div>

      <div className="sqc-brand-tabs" role="tablist" aria-label="Solo Side Quest catalog">
        <Link href="/side-quests" className="sqc-brand-tab official active" role="tab" aria-selected="true">Official Side Quests</Link>
        <Link href="/community-side-quests" className="sqc-brand-switch" aria-label="Switch to Community Side Quests">
          <span aria-hidden="true" />
        </Link>
        <Link href="/community-side-quests" className="sqc-brand-tab community" role="tab" aria-selected="false">Community Side Quests</Link>
      </div>

      <section className="sqc-panel list">
        <div className="sqc-list-head inline">
          <h2>Official Side Quests</h2>
          <span>{sortedChallenges.length} official</span>
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
  rows?: Array<{ title: string; meta: string; status: string; href: string; image?: string | null; glow?: string | null; statusImage?: string | null }>;
}) {
  return (
    <div className="sqc-stack sqc-simple-screen">
      <div className="sqc-screen-emblem" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image" alt="" src={mobileAsset.coat} width={132} height={148} priority />
      </div>

      <section className="sqc-native-card sqc-simple-hero">
        <span className="sqc-card-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{body}</p>
        {primaryAction || secondaryAction ? (
          <div className="sqc-action-pair one-or-two">
            {secondaryAction ? <Link href={secondaryAction.href} className="sqc-secondary-action">{secondaryAction.label}</Link> : null}
            {primaryAction ? <Link href={primaryAction.href} className="sqc-primary-action">{primaryAction.label}</Link> : null}
          </div>
        ) : null}
      </section>

      {rows?.length ? (
        <section className="sqc-native-card">
          <div className="sqc-catalog">
            {rows.map((row) => (
              <AppRow key={`${row.title}-${row.href}`} {...row} image={row.image ?? undefined} glow={row.glow} statusImage={row.statusImage} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function MobileCreateCustomScreen() {
  return (
    <div className="sqc-stack sqc-create-custom-screen">
      <section className="sqc-multiplayer-detail-hero sqc-custom-builder-hero">
        <MobileAssetMark className="sqc-section-mark custom" image={mobileAsset.customCrest} glow={mobileAsset.coatGlow} size={112} glowSize={152} />
        <span className="sqc-multiplayer-kicker">Custom Side Quest</span>
        <h1>Build your Side Quest.</h1>
        <p>Choose what should happen in a real game. SQC will check it after you play.</p>
      </section>

      <section className="sqc-native-card sqc-custom-builder-card" aria-label="Custom Side Quest builder">
        <span className="sqc-card-eyebrow">Start from a template</span>
        <div className="sqc-option-grid">
          <OptionCard title="Knight-only opening" helper="Win after moving only knights for the first four moves." selected />
          <OptionCard title="No-castle game" helper="Win a game without castling." />
          <OptionCard title="Queen trade challenge" helper="Trade queens, then win the game." />
        </div>

        <label className="sqc-form-row">
          <span>Side Quest name</span>
          <input readOnly value="" placeholder="Name this custom Side Quest" aria-label="Side Quest name" />
        </label>
        <p>Saved Side Quests appear in My Custom Side Quests and can be used as Solo Side Quests or Multiplayer Side Quests.</p>

        <div className="sqc-custom-coat-preview">
          <MobileAssetMark className="sqc-section-mark custom preview" image={mobileAsset.customCrest} glow={mobileAsset.coatGlow} size={66} glowSize={94} />
          <div>
            <span className="sqc-form-label">Side Quest Coat of Arms</span>
            <p>This is the Coat of Arms players unlock when this Side Quest is completed.</p>
          </div>
        </div>

        <span className="sqc-card-eyebrow">How to complete it</span>
        <h2>What must happen?</h2>
        <p>Add one or more conditions. SQC checks them against your next public game. Public means the game is visible on your connected chess account.</p>

        <span className="sqc-form-label">If you add several conditions, how should they count?</span>
        <div className="sqc-option-grid">
          <OptionCard title="Complete every condition" helper="All selected conditions must happen. You can change this later." selected />
          <OptionCard title="Complete any one condition" helper="One selected condition is enough. You can change this later." />
        </div>

        <div className="sqc-selection-empty">
          <strong>Your conditions</strong>
          <span>No conditions yet. Add the first thing players must do.</span>
        </div>
      </section>

      <section className="sqc-create-footer-bar">
        <div>
          <strong>Name and add one condition</strong>
          <span>Custom Side Quests start private until you publish them.</span>
        </div>
        <Link href="/custom-side-quests" className="sqc-create-footer-button">Save</Link>
      </section>
    </div>
  );
}

export function MobileSupportScreen() {
  const helpRows = [
    {
      title: "How Side Quests work",
      body: "Pick one Solo Side Quest at a time. After you choose it, play a new public Lichess or Chess.com game so Side Quest Chess has a fresh game to check.",
    },
    {
      title: "Why proof may not work yet",
      body: "Proof checks your newest public games after you choose a Side Quest. If it does not pass, make sure the game is finished, public, played on your connected username, and matches the rule.",
    },
    {
      title: "Connecting a chess username",
      body: "Add your public Lichess or Chess.com username so Side Quest Chess knows which games belong to you. It only reads public game records and never needs your chess-site password.",
    },
    {
      title: "Multiplayer Side Quests",
      body: "Multiplayer Side Quests are shared challenges with their own rules, time window, players, and leaderboard. Join an official challenge, join a community challenge, or create one for friends.",
    },
    {
      title: "Coat of Arms",
      body: "Completing a Side Quest unlocks its Coat of Arms. Your unlocked coats stay in your account and appear in the Trophy Cabinet.",
    },
  ];

  return (
    <div className="sqc-stack sqc-support-screen">
      <div className="sqc-screen-emblem support" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image" alt="" src={mobileAsset.coat} width={132} height={148} priority />
      </div>

      <section className="sqc-support-hero" aria-label="Help and Support">
        <span className="sqc-card-eyebrow">Help & Support</span>
        <h2>How can we help?</h2>
        <p>New to Side Quest Chess? Start here for Side Quests, proof, chess usernames, and Multiplayer.</p>
      </section>

      <section className="sqc-support-quick" aria-label="Quick answers">
        <h3>Quick answers</h3>
        <p>Side Quest Chess checks public Lichess or Chess.com games after you choose a Side Quest or join a Multiplayer Side Quest. If proof looks wrong, wait until the game is fully finished and refresh proof.</p>
      </section>

      <details className="sqc-support-diagnostics">
        <summary>
          <span>
            <b>App diagnostics</b>
            <small>Only needed if support asks for your build details.</small>
          </span>
        </summary>
        <p>Web support page. Include your browser, account email, and what you tried when reporting an issue.</p>
      </details>

      <section className="sqc-support-row-list" aria-label="Help topics">
        {helpRows.map((row) => (
          <article className="sqc-support-row" key={row.title}>
            <h3>{row.title}</h3>
            <p>{row.body}</p>
          </article>
        ))}
      </section>

      <section className="sqc-support-card" aria-label="Legal and privacy">
        <span className="sqc-card-eyebrow">Legal & privacy</span>
        <p>Read the Privacy Policy, support notes, or the Terms of Use. Side Quest Chess only asks for public chess usernames and never chess-site passwords.</p>
        <div className="sqc-support-link-row">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/support">Support & privacy</Link>
          <Link href="/terms">Terms of Use</Link>
        </div>
      </section>

      <section className="sqc-support-card" aria-label="Report a problem">
        <span className="sqc-card-eyebrow">Report a problem</span>
        <p>Something not working? Send a short note with what you tried and what happened. We can reply if we need more details.</p>
      </section>
    </div>
  );
}

export function MobileTrophyCabinetScreen({
  trophyRows,
  completedSoloCount,
  proofReceiptCount: _proofReceiptCount,
  officialSoloCount,
  officialChallenges,
}: {
  trophyRows: TrophyRow[];
  completedSoloCount: number;
  proofReceiptCount: number;
  officialSoloCount: number;
  officialChallenges: Challenge[];
}) {
  const multiplayerRows = trophyRows.filter((row) => row.source === "multiplayer");
  const soloRows = trophyRows.filter((row) => row.source !== "multiplayer");
  const earnedIds = new Set(soloRows.map((row) => row.id.replace(/^solo-/, "")));
  const unlockedCount = trophyRows.length;
  const customRewardCount = Math.max(0, unlockedCount - completedSoloCount - multiplayerRows.length);
  void _proofReceiptCount;

  return (
    <div className="sqc-stack sqc-trophy-screen">
      <div className="sqc-screen-emblem trophy" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image" alt="" src={mobileAsset.coat} width={132} height={148} priority />
      </div>

      <section className="sqc-native-card" aria-label="Trophy Cabinet summary">
        <span className="sqc-card-eyebrow">Trophy Cabinet</span>
        <h2>{unlockedCount ? `${unlockedCount} unlocked: ${completedSoloCount} Official Solo Side Quest${completedSoloCount === 1 ? "" : "s"} · ${multiplayerRows.length} Official Multiplayer Side Quest${multiplayerRows.length === 1 ? "" : "s"} · ${customRewardCount} community/custom reward${customRewardCount === 1 ? "" : "s"}` : "No unlocked trophies yet."}</h2>
        <p>
          {unlockedCount
            ? "This is your unified Side Quest Chess reward shelf. Official Solo coats and Official Multiplayer podiums are highlighted first; community and custom rewards still belong here."
            : "Complete any Official Solo Side Quest, Custom Solo Side Quest, or Multiplayer Side Quest and it will appear on this shelf."}
        </p>
      </section>

      <section className="sqc-native-card" aria-label="Official Multiplayer Side Quest trophies">
        <span className="sqc-card-eyebrow">Official Multiplayer trophies</span>
        <h2>{multiplayerRows.length} podium seal{multiplayerRows.length === 1 ? "" : "s"}.</h2>
        {multiplayerRows.length ? (
          <div className="sqc-catalog">
            {multiplayerRows.map((row) => (
            <AppRow key={row.id} title={row.title} meta={row.meta} status="Open" href={row.href} image={row.image ?? undefined} glow={row.glow} statusImage={row.statusImage} />
            ))}
          </div>
        ) : (
          <p>Place on the podium in an official Multiplayer Side Quest to earn one here.</p>
        )}
      </section>

      <section className="sqc-native-card" aria-label="Unlocked Solo Side Quest rewards">
        <span className="sqc-card-eyebrow">Unlocked Solo Side Quest rewards</span>
        <h2>{soloRows.length ? "Official and Custom Solo Side Quest Coats of Arms" : "No Solo coats yet."}</h2>
        <div className="sqc-catalog">
          {soloRows.length ? soloRows.map((row) => (
            <AppRow key={row.id} title={row.title} meta={row.meta} status="Unlocked" href={row.href} image={row.image ?? undefined} glow={row.glow} statusImage={row.statusImage} />
          )) : (
            <AppRow title="No Coat of Arms yet" meta="Complete a Side Quest to unlock your first trophy." status="Explore" href="/side-quests" image={mobileAsset.coat} />
          )}
        </div>
      </section>

      <section className="sqc-native-card" aria-label="Official Solo Side Quest collection">
        <span className="sqc-card-eyebrow">Official Solo Side Quest collection</span>
        <h2>{completedSoloCount} of {officialSoloCount} official coats unlocked.</h2>
        <p>Locked official coats are previews. Custom Solo Side Quest and community Multiplayer rewards appear above when earned.</p>
      </section>

      <div className="sqc-coat-grid" aria-label="Official Solo Side Quest coat grid">
        {officialChallenges.map((challenge) => {
          const earned = earnedIds.has(challenge.id);
          return (
            <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="sqc-coat-tile">
              <span className="sqc-coat-tile-art" aria-hidden="true">
                <Image
                  className={earned ? "sqc-coat-tile-image" : "sqc-coat-tile-image locked"}
                  alt=""
                  src={toMobileAssetPath(challenge.badgeIdentity.image) ?? mobileAsset.fallbackBadge}
                  width={74}
                  height={74}
                />
              </span>
              <strong>{challenge.title}</strong>
              <small>{earned ? "Unlocked" : "Locked preview"}</small>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function MobileCommunitySideQuestsScreen({
  rows,
  signedIn,
}: {
  rows: CommunitySideQuestRow[];
  signedIn: boolean;
}) {
  const visibleRows = rows.slice(0, 12);

  return (
    <div className="sqc-stack sqc-community-solo-screen">
      <div className="sqc-screen-emblem" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image" alt="" src={mobileAsset.coat} width={132} height={148} priority />
      </div>

      <div className="sqc-brand-tabs" role="tablist" aria-label="Solo Side Quest catalog">
        <Link href="/side-quests" className="sqc-brand-tab official" role="tab" aria-selected="false">
          Official Side Quests
        </Link>
        <Link href="/side-quests" className="sqc-brand-switch" aria-label="Switch to Official Side Quests">
          <span />
        </Link>
        <Link href="/community-side-quests" className="sqc-brand-tab community active" role="tab" aria-selected="true">
          Community Side Quests
        </Link>
      </div>

      <section className="sqc-community-intro" aria-label="Community Side Quests">
        <h1>Pocket tracker for borrowed bad ideas.</h1>
        <p>Use mobile to pick, check, prove, and collect. Use the website when you want the full tavern-wall browse, public detail pages, and report links.</p>
      </section>

      <div className="sqc-community-subtabs" role="tablist" aria-label="Community Solo views">
        <span className="active" role="tab" aria-selected="true">Discover</span>
        <Link href="/custom-side-quests" role="tab" aria-selected="false">My Library</Link>
      </div>

      <section className="sqc-community-catalog-section" aria-label="Community Solo Discover">
        <div className="sqc-community-section-header">
          <h2>Community Solo Discover</h2>
          <span>{rows.length ? `${rows.length}/${rows.length}` : "0 public"}</span>
        </div>

        <div className="sqc-community-browse-panel" aria-label="Community Side Quest filters">
          <div className="sqc-community-search" aria-hidden="true">
            <span />
            <strong>Search by name or rule</strong>
          </div>
          <div className="sqc-community-filter-row">
            <span className="active">All</span>
            <span>Popular</span>
            <span>New</span>
            <span>Completed</span>
            <span className="sort">Sort: Top</span>
          </div>
        </div>

        {visibleRows.length ? (
          <div className="sqc-catalog">
            {visibleRows.map((row) => (
              <AppRow
                key={row.id}
                title={row.title}
                meta={row.meta}
                status={row.status ?? "Ready"}
                href={row.href}
                image={row.image ?? undefined}
                sourceBadge={row.sourceBadge ?? "Community"}
              />
            ))}
          </div>
        ) : (
          <div className="sqc-empty-panel standalone">
            <strong>No public Community Side Quests yet.</strong>
            <span>{signedIn ? "Create the first public Side Quest from My Custom Side Quests. Public quests will appear here as the catalog grows." : "Public player-made Side Quests will appear here as the catalog grows."}</span>
          </div>
        )}
      </section>
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
      <section className="sqc-panel list" aria-label="SQC Official Multiplayer Side Quests">
        <div className="sqc-list-head inline">
          <h2>Official Multiplayer Side Quests</h2>
          <span>{publicMultiplayerRows.length} official</span>
        </div>
        <div className="sqc-catalog">
          {publicMultiplayerRows.map((row) => (
            <AppRow
              key={row.id}
              title={row.title}
              meta={row.meta}
              status={signedIn ? "Join" : "Sign in"}
              href={row.href}
              image={mobileAsset.multiplayerSeal}
              sourceBadge={row.sourceBadge}
            />
          ))}
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
        <div className="sqc-catalog">
          {communityMultiplayerRows.map((row) => (
            <AppRow
              key={row.id}
              title={row.title}
              meta={row.meta}
              status={signedIn ? "Join" : "Sign in"}
              href={row.href}
              image={mobileAsset.multiplayerSeal}
              sourceBadge={row.sourceBadge}
            />
          ))}
        </div>
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
    <div className="sqc-stack sqc-create-multiplayer-screen">
      <section className="sqc-multiplayer-detail-hero sqc-create-multiplayer-hero">
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
  sourceBadge,
}: {
  title: string;
  meta: string;
  status: string;
  href: string;
  image?: string;
  glow?: string | null;
  statusImage?: string | null;
  sourceBadge?: string | null;
}) {
  return (
    <Link href={href} className="sqc-app-row">
      <span className="sqc-row-icon" aria-hidden="true">
        {glow ? <Image className="sqc-row-glow" alt="" src={glow} width={50} height={50} /> : null}
        <Image className="sqc-row-image" alt="" src={image ?? getRowImage(title, href)} width={42} height={42} />
      </span>
      <span className="sqc-row-copy">
        {sourceBadge ? <span className="sqc-row-badge">{sourceBadge}</span> : null}
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
