import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Challenge } from "@/lib/challenges";

type AppTab = "home" | "sideQuests" | "multiplayerSideQuests" | "coatOfArms" | "account";

type MobileAppWebShellProps = {
  activeTab: AppTab;
  signedIn: boolean;
  displayName?: string | null;
  lichessUsername?: string | null;
  chessComUsername?: string | null;
  children?: ReactNode;
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
  lichessUsername,
  chessComUsername,
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
                {!hasChessAccount ? <small>Chess account not connected</small> : null}
              </span>
            </div>
            <Link href="/account" className="sqc-account-dot" aria-label="Open account settings">
              {profileInitial}
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
            <SignedInHome hasChessAccount={hasChessAccount} />
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
    <div className="sqc-stack">
      <section className="sqc-guest-hero" aria-label="Side Quest Chess introduction">
        <MobileAssetMark className="sqc-quest-mark" image={mobileAsset.coat} glow={mobileAsset.coatGlow} size={176} glowSize={220} />
        <h2>Sign in to continue.</h2>
        <p>
          Chess, but with stupidly hard side quests — solo or multiplayer. Browse the live boards first;
          sign in when you want SQC to save progress, verify proof, or join a table.
        </p>
        <div className="sqc-action-pair">
          <Link href="/side-quests" className="sqc-secondary-action">Browse Solo Side Quests</Link>
          <Link href="/multiplayer" className="sqc-secondary-action">Browse Multiplayer Side Quests</Link>
        </div>
        <Link href="/account" className="sqc-primary-action">Choose sign-in method</Link>
      </section>

      <section className="sqc-panel">
        <span className="sqc-eyebrow">What happens after sign-in</span>
        <h2>A tiny ritual, not another chess dashboard.</h2>
        <div className="sqc-flow">
          <FlowStep title="Choose solo or multiplayer" body="Start one Side Quest for yourself, or join a shared table when the bad idea deserves witnesses." />
          <FlowStep title="Play where you already play" body="Use a normal public Lichess or Chess.com game. SQC never asks for chess-site passwords." />
          <FlowStep title="Get the receipt" body="SQC checks your latest public game and updates proof, progress, and leaderboard results." />
        </div>
      </section>
    </div>
  );
}

function SignedInHome({ hasChessAccount }: { hasChessAccount: boolean }) {
  return (
    <div className="sqc-stack">
      {!hasChessAccount ? (
        <Link href="/account" className="sqc-blocker">
          <strong>Connect a chess username</strong>
          <span>SQC needs Lichess or Chess.com before it can check real games.</span>
        </Link>
      ) : null}

      <section className="sqc-current-card">
        <button className="sqc-refresh" type="button" aria-label="Refresh active Solo Side Quest">
          <span aria-hidden="true" />
        </button>
        <div className="sqc-current-body">
          <MobileAssetMark className="sqc-current-mark" image={mobileAsset.coat} glow={mobileAsset.coatGlow} size={82} glowSize={104} />
          <div>
            <p className="sqc-pill">Active Solo Side Quest</p>
            <h2>Choose a Solo Side Quest</h2>
            <p>Choose a Side Quest, play on Lichess or Chess.com, then come back for automatic proof.</p>
          </div>
        </div>
        <Link href="/side-quests" className="sqc-primary-action fit">Explore Solo Side Quests</Link>
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
          <AppRow title="No Coat of Arms yet" meta="Complete a Side Quest to unlock your first trophy." status="Explore" href="/side-quests" image={mobileAsset.coat} />
        </div>
        <Link href="/trophy-cabinet" className="sqc-secondary-action full">Open Trophy Cabinet</Link>
      </section>
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
        <p>Choose one Solo Side Quest, play a fresh public game, then come back for proof.</p>
        <div className="sqc-tabs" role="tablist" aria-label="Solo Side Quest catalog">
          <Link href="/side-quests" className="active" role="tab" aria-selected="true">Official</Link>
          <Link href="/community-side-quests" role="tab" aria-selected="false">Community</Link>
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

export function MobileCreateMultiplayerScreen() {
  const fields = [
    { label: "Quest name", value: "Friday night no-castle table" },
    { label: "Invite mode", value: "Invite link or code" },
    { label: "Games allowed", value: "Lichess or Chess.com" },
    { label: "Time window", value: "Starts now · ends in 7 days" },
    { label: "Included Side Quests", value: "Choose up to 4 Solo Side Quests" },
  ];

  return (
    <div className="sqc-stack">
      <section className="sqc-panel hero">
        <span className="sqc-eyebrow">Create Multiplayer Side Quest</span>
        <h1>Start a shared Multiplayer Side Quest</h1>
        <p>Choose the quests, time window, provider rules, and invite settings before players join.</p>
      </section>

      <section className="sqc-panel list">
        <div className="sqc-form-list">
          <div className="sqc-create-hero-graphic" aria-hidden="true">
            <MobileAssetMark className="sqc-section-mark group" image={mobileAsset.multiplayerSeal} glow={mobileAsset.coatGlow} size={100} glowSize={142} />
          </div>
          {fields.map((field) => (
            <label key={field.label} className="sqc-form-row">
              <span>{field.label}</span>
              <input readOnly value={field.value} aria-label={field.label} />
            </label>
          ))}
        </div>
        <Link href="/multiplayer" className="sqc-primary-action">Create Multiplayer Side Quest</Link>
      </section>
    </div>
  );
}

function FlowStep({ title, body }: { title: string; body: string }) {
  return (
    <div className="sqc-flow-step">
      <span aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
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
}: {
  title: string;
  meta: string;
  status: string;
  href: string;
  image?: string;
  glow?: string | null;
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
      <span className="sqc-row-status">{status}</span>
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
