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

const multiplayerRows = [
  {
    title: "No active Multiplayer Side Quests",
    meta: "Join or host shared challenges with friends.",
    status: "Explore",
    href: "/multiplayer",
    glyph: "groups",
  },
  {
    title: "Create a Multiplayer Side Quest",
    meta: "Choose quests, time window, provider, and invite friends.",
    status: "Create",
    href: "/create-multiplayer-side-quest",
    glyph: "add",
  },
];

const coatImage = "/mobile-source/sqc-coat-of-arms.png";
const coatGlowImage = "/mobile-source/badges/glow/sqc-coat-generic-glow.png";
const multiplayerSealImage = "/mobile-source/stamps/sqc-multiplayer-seal.png";

export default function MobileAppWebShell({
  activeTab,
  signedIn,
  displayName,
  lichessUsername,
  chessComUsername,
  children,
}: MobileAppWebShellProps) {
  const profileInitial = (displayName?.trim().slice(0, 1) || "S").toUpperCase();
  const menuItems = [
    { id: "home", label: "Home", href: "/", glyph: "home" },
    { id: "sideQuests", label: "Solo Side Quests", href: "/side-quests", glyph: "flag" },
    { id: "multiplayer", label: "Multiplayer Side Quests", href: "/multiplayer", glyph: "groups" },
    { id: "coats", label: "Trophy Cabinet", href: "/trophy-cabinet", glyph: "shield" },
    { id: "custom", label: "My Custom Side Quests", href: "/custom-side-quests", glyph: "edit" },
    { id: "createCustom", label: "Create Custom Side Quest", href: "/create-custom-side-quest", glyph: "add" },
    { id: "createMultiplayer", label: "Create Multiplayer Side Quest", href: "/create-multiplayer-side-quest", glyph: "add" },
    { id: "account", label: signedIn ? "My Account" : "Sign in / Account", href: "/account", glyph: "person" },
    { id: "support", label: "Help & Support", href: "/support", glyph: "help" },
  ];

  return (
    <main className="mobile-web-app-shell">
      {signedIn ? (
        <>
          <details className="mobile-web-floating-menu">
            <summary aria-label="Open main menu" title="Main menu">
              <span aria-hidden="true" />
            </summary>
            <nav className="mobile-web-menu-panel" aria-label="Main menu">
              {menuItems.map((item) => (
                <Link
                  aria-current={isActiveMenuItem(item.id, activeTab) ? "page" : undefined}
                  href={item.href}
                  key={item.id}
                  className={isActiveMenuItem(item.id, activeTab) ? "mobile-web-menu-row active" : "mobile-web-menu-row"}
                >
                  <IconBox glyph={item.glyph} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </details>

          <header className="mobile-web-signed-in-header" aria-label="App header">
            <div className="mobile-web-identity">
              <strong>{displayName || "Side Quest Chess"}</strong>
              {lichessUsername || chessComUsername ? (
                <span className="mobile-web-identity-accounts">
                  {lichessUsername ? (
                    <span className="mobile-web-identity-account">
                      <span className="mobile-web-identity-platform lichess">lichess</span>
                      <small>{lichessUsername}</small>
                    </span>
                  ) : null}
                  {chessComUsername ? (
                    <span className="mobile-web-identity-account">
                      <span className="mobile-web-identity-platform chesscom">chess.com</span>
                      <small>{chessComUsername}</small>
                    </span>
                  ) : null}
                </span>
              ) : null}
            </div>
            <Link href="/account" className="mobile-web-account-dot" aria-label="Open account settings">
              {profileInitial}
            </Link>
          </header>
        </>
      ) : (
        <header className="mobile-web-guest-header" aria-label="App header">
          <h1>Side Quest Chess</h1>
        </header>
      )}

      {activeTab !== "home" ? (
        <Link href="/" className="mobile-web-close-screen" aria-label={activeTab === "sideQuests" ? "Close Solo Side Quests" : "Close screen"}>
          x
        </Link>
      ) : null}

      <section className="mobile-web-screen" aria-label={activeTab === "sideQuests" ? "Solo Side Quests" : "Home"}>
        {children ? children : null}

        {!children && !signedIn ? (
          <div className="mobile-web-guest-coat" aria-hidden="true">
            <Image className="mobile-web-coat-glow" alt="" src={coatGlowImage} width={220} height={220} priority />
            <Image className="mobile-web-coat" alt="" src={coatImage} width={176} height={176} priority />
          </div>
        ) : null}

        {!children && !signedIn ? (
          <div className="mobile-web-guest-panel">
            <h2>Sign in to continue.</h2>
            <p>Chess, but with stupidly hard side quests — solo or multiplayer. Browse the live boards first; sign in when you want SQC to save progress, verify proof, or join a table.</p>
            <div className="mobile-web-action-row">
              <Link href="/side-quests" className="mobile-web-secondary-action">Browse Solo Side Quests</Link>
              <Link href="/multiplayer" className="mobile-web-secondary-action">Browse Multiplayer Side Quests</Link>
            </div>
            <Link href="/account" className="mobile-web-primary-action mobile-web-centered-action">Choose sign-in method</Link>
          </div>
        ) : null}

        {!children && signedIn && !lichessUsername && !chessComUsername ? (
          <Link href="/account" className="mobile-web-blocker-panel">
            <strong>Connect a chess username</strong>
            <span>SQC needs Lichess or Chess.com before it can check real games.</span>
          </Link>
        ) : null}

        {!children && signedIn ? (
          <>
            <section className="mobile-web-active-solo-section" aria-label="Active Solo Side Quest">
              <span className="mobile-web-active-solo-refresh" aria-hidden="true">
                ↻
              </span>
              <div className="mobile-web-empty-quest-panel">
                <div className="mobile-web-empty-quest-hero-row">
                  <span className="mobile-web-empty-quest-coat-wrap" aria-hidden="true">
                    <Image className="mobile-web-empty-quest-coat-glow" alt="" src={coatGlowImage} width={104} height={108} />
                    <Image className="mobile-web-empty-quest-coat" alt="" src={coatImage} width={82} height={82} />
                  </span>
                  <span className="mobile-web-current-quest-text">
                    <strong>Choose a Solo Side Quest</strong>
                    <small>Choose a Side Quest, play on Lichess or Chess.com, then come back for automatic proof.</small>
                  </span>
                </div>
                <Link href="/side-quests" className="mobile-web-primary-action mobile-web-fit-action">Explore Solo Side Quests</Link>
              </div>
            </section>

            <div className="mobile-web-refresh-hint" aria-hidden="true">
              <span>↓</span>
              <small>Pull down to refresh</small>
            </div>

            <section className="mobile-web-active-multiplayer-section" aria-label="Active Multiplayer Side Quests">
              <Link href="/multiplayer" className="mobile-web-active-multiplayer-summary">
                <span className="mobile-web-multiplayer-hero-marker" aria-hidden="true">
                  <Image className="mobile-web-multiplayer-hero-glow" alt="" src={coatGlowImage} width={142} height={152} />
                  <Image className="mobile-web-multiplayer-hero-seal" alt="" src={multiplayerSealImage} width={100} height={100} />
                </span>
                <span className="mobile-web-pill">Active Multiplayer Side Quests</span>
                <strong>No active Multiplayer Side Quests</strong>
              </Link>
              <div className="mobile-web-row-list framed">
                {multiplayerRows.slice(0, 1).map((row) => (
                  <AppRow key={row.title} {...row} />
                ))}
              </div>
              <Link href="/multiplayer" className="mobile-web-secondary-action mobile-web-full-action">Explore More Multiplayer Side Quests</Link>
            </section>

            <section className="mobile-web-trophy-cabinet-section" aria-label="Trophy Cabinet">
              <Link href="/trophy-cabinet" className="mobile-web-active-multiplayer-summary">
                <span className="mobile-web-trophy-hero-marker" aria-hidden="true">
                  <Image className="mobile-web-trophy-hero-glow" alt="" src={coatGlowImage} width={156} height={166} />
                  <Image className="mobile-web-trophy-hero-coat" alt="" src={coatImage} width={112} height={126} />
                </span>
                <span className="mobile-web-pill">Trophy Cabinet</span>
              </Link>
              <div className="mobile-web-row-list framed">
                <AppRow
                  title="No Coat of Arms yet"
                  meta="Complete a Side Quest to unlock your first trophy."
                  status="Explore"
                  href="/side-quests"
                  image={coatImage}
                />
              </div>
              <Link href="/trophy-cabinet" className="mobile-web-secondary-action mobile-web-full-action">Open Trophy Cabinet</Link>
            </section>
          </>
        ) : null}
      </section>
    </main>
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
    <>
      <div className="mobile-web-sidequest-emblem" aria-hidden="true">
        <Image className="mobile-web-section-glow" alt="" src={coatGlowImage} width={128} height={128} priority />
        <Image className="mobile-web-section-art" alt="" src={coatImage} width={94} height={94} priority />
      </div>

      <div className="mobile-web-brand-tabs" role="tablist" aria-label="Solo Side Quest catalog">
        <Link href="/side-quests" className="mobile-web-brand-tab official active" role="tab" aria-selected="true">
          Official Side Quests
        </Link>
        <span className="mobile-web-brand-tab-switch" aria-hidden="true" />
        <Link href="/community-side-quests" className="mobile-web-brand-tab community" role="tab" aria-selected="false">
          Community Side Quests
        </Link>
      </div>

      <section className="mobile-web-app-section" aria-labelledby="official-side-quests-title">
        <div className="mobile-web-section-head">
          <h1 id="official-side-quests-title">Official Side Quests</h1>
          <span className="mobile-web-section-count">{sortedChallenges.length} official</span>
        </div>
        <div className="mobile-web-catalog-rows">
          {sortedChallenges.map((challenge) => (
            <AppRow
              key={challenge.id}
              title={challenge.title}
              meta={challenge.objective}
              status={challenge.id === activeChallengeId ? "Active" : completedSet.has(challenge.id) ? "Completed" : challenge.difficulty}
              href={`/challenges/${challenge.id}`}
              image={challenge.badgeIdentity.image ?? coatImage}
            />
          ))}
        </div>
      </section>
    </>
  );
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

function AppRow({
  title,
  meta,
  status,
  href,
  image,
  glyph,
}: {
  title: string;
  meta: string;
  status: string;
  href: string;
  image?: string;
  glyph?: string;
}) {
  return (
    <Link href={href} className="mobile-web-app-row">
      <span className="mobile-web-row-art" aria-hidden="true">
        {image ? <Image alt="" src={image} width={48} height={48} /> : <IconBox glyph={glyph ?? ""} />}
      </span>
      <span className="mobile-web-row-copy">
        <strong>{title}</strong>
        <small>{meta}</small>
      </span>
      <span className="mobile-web-row-status">{status}</span>
    </Link>
  );
}

function IconBox({ glyph, small = false }: { glyph: string; small?: boolean }) {
  return (
    <span className={`${small ? "mobile-web-icon-box small" : "mobile-web-icon-box"} glyph-${glyph}`} aria-hidden="true" />
  );
}
