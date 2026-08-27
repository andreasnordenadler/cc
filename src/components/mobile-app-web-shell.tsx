import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import OfficialSoloLikeControl from "./official-solo-like-control";
import { MobileSupportComposer, type MobileWebSupportMessage } from "./mobile-support-composer";
import type { CommunityLikeSummary } from "@/lib/community-likes";
import { CHALLENGES, type Challenge } from "@/lib/challenges";
import type { MobileWebMultiplayerPreview, MobileWebMultiplayerResult, MobileWebOfficialWeek } from "@/lib/mobile-web-multiplayer";
import type { MobileWebShellTheme } from "@/lib/mobile-web-theme";
import { buildSoloProofHomeStatus, formatHomeTrophyMeta, type ActiveMultiplayerHomeRow } from "@/lib/mobile-web-home";
import { MobileWebRelativeTime } from "./mobile-web-relative-time";
import CommunitySoloPickControl from "./community-solo-pick-control";
import GroupQuestDirectJoin from "./group-quest-direct-join";
import GroupQuestInviteKeyJoin from "./group-quest-invite-key-join";
import { getMultiplayerJoinState } from "@/lib/mobile-web-parity-actions";
import MobileCustomCreateForm from "./mobile-custom-create-form";
import MobileMultiplayerCreateForm, { type MultiplayerCreateQuest } from "./mobile-multiplayer-create-form";
import { CommunityMultiplayerCatalog, CommunitySoloCatalog, CustomSoloCatalog } from "./catalog-clients";
import CommunitySoloSocialActions from "./community-solo-social-actions";
import CommunitySoloShareControls from "./community-solo-share-controls";
import CustomSideQuestProofControls from "./custom-side-quest-proof-controls";
import SupportDiagnosticsCopy from "./support-diagnostics-copy";
import ActiveSoloActions from "./active-solo-actions";
import GroupQuestRefreshButton from "./group-quest-refresh-button";
import GroupQuestShareControls from "./group-quest-share-controls";
import GroupQuestLeaveAction from "./group-quest-leave-action";
import GroupQuestRemoveParticipantAction from "./group-quest-remove-participant-action";
import CommunityMultiplayerReportControl from "./community-multiplayer-report-control";
import GroupQuestInviteKeyControl from "./group-quest-invite-key-control";
import type { CustomEditQuestInput } from "@/lib/mobile-create-forms";
import type { WebSupportAccountContext, WebSupportReportContext } from "@/lib/web-support-diagnostics";
import DesktopHomeMenu from "./desktop-home-menu";
import DesktopRandomQuestButton from "./desktop-random-quest-button";
import MobileWebHamburgerMenu from "./mobile-web-hamburger-menu";
import CurrentPageSignInLink from "./current-page-sign-in-link";
import CommunitySoloDuplicateControl from "./community-solo-duplicate-control";
import { buildCommunityQuestDetailHref, type CommunityDiscoveryState } from "@/lib/community-discovery-state";
import type { CustomOwnerSaveInput } from "@/lib/custom-owner-controls";
import DesktopTrophyCollection from "./desktop-trophy-collection";
import DesktopSoloDifficultyNav from "./desktop-solo-difficulty-nav";

type AppTab = "home" | "sideQuests" | "multiplayerSideQuests" | "coatOfArms" | "account";

type MobileAppWebShellProps = {
  activeTab: AppTab;
  signedIn: boolean;
  desktopPresentation?: "solo-discovery" | "community-discovery" | "multiplayer-discovery" | "multiplayer-detail" | "multiplayer-create" | "custom-library" | "custom-detail" | "custom-editor" | "official-detail" | "community-detail" | "trophy-cabinet" | "account" | "settings" | "support" | "auth" | "proof";
  displayName?: string | null;
  profileImageUrl?: string | null;
  lichessUsername?: string | null;
  chessComUsername?: string | null;
  activeSolo?: ActiveSoloHome | null;
  activeSoloTitle?: string | null;
  activeMultiplayerRows?: ActiveMultiplayerHomeRow[];
  theme?: MobileWebShellTheme | null;
  trophyRows?: TrophyRow[];
  completedSoloCount?: number;
  proofReceiptCount?: number;
  modalPresentation?: boolean;
  immersivePresentation?: boolean;
  controlsOnlyHeader?: boolean;
  loadingPresentation?: boolean;
  closeHref?: string;
  children?: ReactNode;
};

type ActiveSoloHome = {
  id: string;
  source?: "official" | "custom" | "community";
  href?: string | null;
  title: string;
  objective: string;
  instruction: string;
  badgeImage?: string | null;
  glowImage?: string | null;
  pickedAt?: string | null;
  verifiedAt?: string | null;
  completed?: boolean;
  proofHref?: string | null;
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
  source?: "multiplayer" | "officialMultiplayer" | "communityMultiplayer" | "solo" | "officialSolo" | "customSolo" | "communitySolo";
};

type CommunitySideQuestRow = {
  id: string;
  title: string;
  meta: string;
  href: string;
  image?: string | null;
  sourceBadge?: string | null;
  status?: string | null;
  creatorKey?: string;
  creatorName?: string;
  creatorBrowsePath?: string;
  summary: string;
  stats: {
    soloAttempts: number;
    soloCompletions: number;
    multiplayerLineups: number;
  };
  updatedAtMs: number;
  popularityScore: number;
  likeCount: number;
  likedByViewer: boolean;
  completedByViewer: boolean;
  isNew: boolean;
};

type CommunitySideQuestDetail = {
  id: string;
  title: string;
  summary: string;
  creatorName: string;
  creatorBrowsePath: string;
  ruleLabel: string;
  ruleDetails: string[];
  badgeImageUrl?: string | null;
  stats: {
    soloAttempts: number;
    soloSelections: number;
    soloCompletions: number;
    multiplayerLineups: number;
    multiplayerAttempts: number;
    multiplayerFulfillments: number;
  };
};

type CustomSideQuestLibraryRow = {
  id: string;
  title: string;
  meta: string;
  href: string;
  image?: string | null;
  sourceBadge: string;
  status: string;
  lifecycle: "draft" | "published" | "archived";
  visibility: "private" | "public";
  updatedAt: string;
};

export const mobileWebMenuItems = [
  { id: "home", label: "Home", href: "/", icon: "home" },
  { id: "sideQuests", label: "Solo Side Quests", href: "/side-quests", icon: "flag" },
  { id: "multiplayer", label: "Multiplayer Side Quests", href: "/multiplayer", icon: "group" },
  { id: "coats", label: "Trophy Cabinet", href: "/trophy-cabinet", icon: "shield" },
  { id: "custom", label: "My Custom Side Quests", href: "/custom-side-quests", icon: "edit" },
  { id: "createCustom", label: "Create Custom Side Quest", href: "/create-custom-side-quest", icon: "plus" },
  { id: "createMultiplayer", label: "Create Multiplayer Side Quest", href: "/create-multiplayer-side-quest", icon: "plus" },
  { id: "account", label: "My Account", href: "/account", icon: "person" },
  { id: "support", label: "Help & Support", href: "/support", icon: "help" },
  { id: "privacy", label: "Privacy Policy", href: "/privacy", icon: "shield" },
] as const;

// Desktop derives from the app menu, but its persistent account action owns that destination.
// Terms remains available in the public footer on mobile and joins the roomier desktop menu.
export const desktopHomeMenuItems = [
  ...mobileWebMenuItems.filter((item) => item.id !== "account"),
  { id: "terms", label: "Terms of Use", href: "/terms", icon: "document" },
] as const;

const menuItems = mobileWebMenuItems;

const mobileAsset = {
  coat: "/mobile-source/sqc-coat-of-arms.png",
  coatGlow: "/mobile-source/badges/glow/sqc-coat-generic-glow.png",
  multiplayerSeal: "/mobile-source/stamps/sqc-multiplayer-seal.png",
  customCrest: "/mobile-source/badges/custom-side-quest-crest.png",
  completedSeal: "/mobile-source/stamps/quest-complete-red-wax-sqc-v15.png",
  fallbackBadge: "/mobile-source/badges/v6/proof-loop-test-badge.png",
  goldSeal: "/mobile-source/stamps/sqc-gold-seal.png",
  silverSeal: "/mobile-source/stamps/sqc-silver-seal.png",
  bronzeSeal: "/mobile-source/stamps/sqc-bronze-seal.png",
};

export default function MobileAppWebShell({
  activeTab,
  signedIn,
  desktopPresentation,
  displayName,
  profileImageUrl,
  lichessUsername,
  chessComUsername,
  activeSolo,
  activeSoloTitle,
  activeMultiplayerRows = [],
  theme,
  trophyRows = [],
  completedSoloCount = 0,
  proofReceiptCount = 0,
  modalPresentation = false,
  immersivePresentation = false,
  controlsOnlyHeader = false,
  loadingPresentation = false,
  closeHref = "/",
  children,
}: MobileAppWebShellProps) {
  const profileInitial = (displayName?.trim().slice(0, 1) || "S").toUpperCase();
  const hasChessAccount = Boolean(lichessUsername || chessComUsername);
  const activeTheme = activeSolo?.theme ?? theme;
  const shellStyle = {
    "--sqc-bg-top": activeTheme?.backgroundTop ?? (signedIn ? "#1e7773" : "#8d6b32"),
    "--sqc-bg-mid": activeTheme?.backgroundMid ?? (signedIn ? "#123a3f" : "#4b321b"),
    "--sqc-bg-glow": activeTheme?.glow ?? (signedIn ? "rgba(96, 240, 175, .28)" : "rgba(245, 200, 106, .2)"),
    "--sqc-bg-accent": activeTheme?.accent ?? (signedIn ? "rgba(45, 212, 191, .2)" : "rgba(179, 126, 43, .18)"),
  } as CSSProperties;

  const showDesktopHome = activeTab === "home" && children == null && !modalPresentation && !immersivePresentation && !loadingPresentation;
  const showDesktopAccountWorkspace = desktopPresentation === "account" || desktopPresentation === "settings" || desktopPresentation === "support";

  return (
    <main
      className={[
        "sqc-mobile-web",
        desktopPresentation ? `desktop-${desktopPresentation}` : "",
        immersivePresentation ? "immersive" : "",
        controlsOnlyHeader ? "controls-only" : "",
        signedIn ? "signed-in" : "signed-out",
      ].filter(Boolean).join(" ")}
      data-source="active-mobile-today-dashboard"
      style={shellStyle}
    >
      <div className="sqc-mobile-backdrop" aria-hidden="true" />

      {desktopPresentation && !loadingPresentation ? (
        <div className="sqc-desktop-route-only">
          <DesktopHomeHeader
            signedIn={signedIn}
            displayName={displayName}
            activeTab={desktopPresentation.startsWith("community-") || desktopPresentation.startsWith("custom-") || desktopPresentation === "multiplayer-create" ? null : activeTab}
            activeItemId={desktopPresentation === "custom-editor" ? "createCustom" : desktopPresentation === "multiplayer-create" ? "createMultiplayer" : desktopPresentation === "support" ? "support" : desktopPresentation.startsWith("custom-") ? "custom" : undefined}
            accountIsCurrent={desktopPresentation === "account"}
          />
          {showDesktopAccountWorkspace ? <DesktopAccountWorkspaceNav current={desktopPresentation} /> : null}
        </div>
      ) : null}

      <div className={showDesktopHome ? "sqc-app-only" : undefined}>
        {modalPresentation ? null : signedIn ? (
          <>
            <MobileWebHamburgerMenu
              items={menuItems.map((item) => ({
                ...item,
                active: isActiveMenuItem(item.id, activeTab),
              }))}
            />

            {immersivePresentation || controlsOnlyHeader ? null : (
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
        ) : immersivePresentation || loadingPresentation ? null : activeTab === "home" ? (
          <header className="sqc-app-header guest">
            <h1>Side Quest Chess</h1>
          </header>
        ) : null}

        {activeTab !== "home" || modalPresentation ? (
          <Link href={closeHref} className="sqc-close-screen" aria-label="Close screen">
            <span aria-hidden="true" />
          </Link>
        ) : null}

        {showDesktopHome && signedIn ? null : (
          <section className="sqc-screen" aria-label={activeTab === "home" ? "Home" : "Current screen"}>
            {children ?? (
              signedIn ? (
                <SignedInHome
                  hasChessAccount={hasChessAccount}
                  activeSolo={activeSolo}
                  activeSoloTitle={activeSoloTitle}
                  activeMultiplayerRows={activeMultiplayerRows}
                  trophyRows={trophyRows}
                  completedSoloCount={completedSoloCount}
                  proofReceiptCount={proofReceiptCount}
                />
              ) : (
                <GuestHome />
              )
            )}
          </section>
        )}
        {!signedIn && !(activeTab === "home" && children == null) && !modalPresentation && !immersivePresentation && !loadingPresentation ? (
          <GuestNavigation activeTab={activeTab} />
        ) : null}
      </div>

      {showDesktopHome && signedIn ? (
        <>
          <div className="sqc-desktop-home-only sqc-desktop-home-header-only">
            <DesktopHomeHeader signedIn displayName={displayName} activeTab="home" />
          </div>
          <DesktopSignedInHome
            displayName={displayName}
            hasChessAccount={hasChessAccount}
            activeSolo={activeSolo}
            activeSoloTitle={activeSoloTitle}
            activeMultiplayerRows={activeMultiplayerRows}
            trophyRows={trophyRows}
            completedSoloCount={completedSoloCount}
            proofReceiptCount={proofReceiptCount}
          />
        </>
      ) : showDesktopHome ? (
        <div className="sqc-desktop-home-only">
          <DesktopHomeHeader signedIn={false} displayName={displayName} activeTab="home" />
          <DesktopGuestHome />
        </div>
      ) : null}
    </main>
  );
}

function GuestNavigation({ activeTab }: { activeTab: AppTab }) {
  const items = [
    { label: "Home", href: "/", active: activeTab === "home" },
    { label: "Solo", href: "/side-quests", active: activeTab === "sideQuests" },
    { label: "Multiplayer", href: "/multiplayer", active: activeTab === "multiplayerSideQuests" },
    { label: "Help & Support", href: "/support", active: false },
    { label: "Privacy", href: "/privacy", active: false },
  ];

  return (
    <nav aria-label="Guest menu" className="sqc-guest-nav">
      {items.map((item) => (
        <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined}>
          {item.label}
        </Link>
      ))}
      <CurrentPageSignInLink>Sign in</CurrentPageSignInLink>
    </nav>
  );
}

export function DesktopHomeHeader({ signedIn, displayName, activeTab, activeItemId, accountIsCurrent = false }: { signedIn: boolean; displayName?: string | null; activeTab: AppTab | null; activeItemId?: string; accountIsCurrent?: boolean }) {
  const shortcuts = desktopHomeMenuItems.slice(0, 4);
  const resolvedActiveItemId = activeItemId ?? (activeTab === "multiplayerSideQuests" ? "multiplayer" : activeTab === "coatOfArms" ? "coats" : activeTab ?? "");

  return (
    <div className="sqc-desktop-header-shell">
      <header className="sqc-desktop-header">
        <Link href="/" className="sqc-desktop-brand" aria-label="Side Quest Chess home">
          <Image src={mobileAsset.coat} alt="" width={42} height={47} />
          <span>
            <strong>Side Quest Chess</strong>
            <small>Public games. Unreasonable objectives.</small>
          </span>
        </Link>
        <nav className="sqc-desktop-shortcuts" aria-label="Desktop shortcuts">
          {shortcuts.map((item) => (
            <Link key={item.id} href={item.href} aria-current={activeTab && isActiveMenuItem(item.id, activeTab) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <DesktopHomeMenu items={desktopHomeMenuItems.slice(shortcuts.length)} activeItemId={resolvedActiveItemId} />
        {signedIn ? (
          <Link href="/account" className="sqc-desktop-sign-in" aria-current={accountIsCurrent ? "page" : undefined}>{displayName || "My Account"}</Link>
        ) : (
          <CurrentPageSignInLink className="sqc-desktop-sign-in">Sign in</CurrentPageSignInLink>
        )}
      </header>
    </div>
  );
}

const desktopAccountWorkspaceItems = [
  { id: "account", label: "Overview", href: "/account" },
  { id: "settings", label: "Profile settings", href: "/settings" },
  { id: "support", label: "Help & Support", href: "/support" },
] as const;

function DesktopAccountWorkspaceNav({ current }: { current: "account" | "settings" | "support" }) {
  return (
    <nav className="sqc-account-workspace-nav" aria-label="Account workspace">
      <span>Account workspace</span>
      {desktopAccountWorkspaceItems.map((item) => (
        <Link key={item.id} href={item.href} aria-current={item.id === current ? "page" : undefined}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function DesktopGuestHome() {
  const featuredQuests = ["knights-before-coffee", "bishop-field-trip", "early-king-walk"]
    .map((id) => CHALLENGES.find((challenge) => challenge.id === id))
    .filter((challenge): challenge is Challenge => Boolean(challenge));
  const heroismPaths = [
    {
      label: "Cautiously heroic",
      copy: "I want chaos, but survivable.",
      cta: "Start with Knights Before Coffee",
      challenge: CHALLENGES.find((challenge) => challenge.id === "knights-before-coffee"),
    },
    {
      label: "Recklessly meaningful",
      copy: "I can handle one objectively bad idea.",
      cta: "Try No Castle Club",
      challenge: CHALLENGES.find((challenge) => challenge.id === "no-castle-club"),
    },
    {
      label: "Historically unwise",
      copy: "I am here to become a cautionary tale.",
      cta: "Lose the queen, win anyway",
      challenge: CHALLENGES.find((challenge) => challenge.id === "queen-never-heard-of-her"),
    },
  ].filter((path): path is { label: string; copy: string; cta: string; challenge: Challenge } => Boolean(path.challenge));
  const recommended = featuredQuests[0];

  return (
    <div className="sqc-desktop-guest">
      <section className="sqc-desktop-hero" aria-labelledby="desktop-home-title">
        <div className="sqc-desktop-hero-copy">
          <span className="sqc-desktop-eyebrow">Chess, with optional nonsense</span>
          <h1 id="desktop-home-title">Your next chess game needs a terrible side plot.</h1>
          <p>
            Pick one ridiculous rule, then play a normal public game on Lichess or Chess.com. Side Quest Chess handles the paperwork and awards unnecessary heraldry if your bad idea survives inspection.
          </p>
          <div className="sqc-desktop-hero-actions">
            <Link href="/side-quests" className="sqc-desktop-primary">Choose your bad idea</Link>
            <a href="#how-it-works" className="sqc-desktop-secondary">Inspect the ritual</a>
          </div>
          <p className="sqc-desktop-trust">No chess-site password. No special game mode. One public game and an unreasonable amount of heraldry.</p>
        </div>
        {recommended ? (
          <div className="sqc-desktop-featured-quest">
            <Link href={`/challenges/${recommended.id}`} className="sqc-desktop-featured-primary">
              <span className="sqc-desktop-quest-kicker">A sensible first mistake</span>
              <div className="sqc-desktop-featured-art" aria-hidden="true">
                <Image src={toMobileAssetPath(recommended.badgeIdentity.image) ?? mobileAsset.fallbackBadge} alt="" width={224} height={250} priority />
              </div>
              <div className="sqc-desktop-featured-copy">
                <span className="sqc-desktop-difficulty">{recommended.difficulty}</span>
                <h2>{recommended.title}</h2>
                <p>{recommended.objective}</p>
                <strong>Commit to this mistake <span aria-hidden="true">→</span></strong>
              </div>
            </Link>
            <nav className="sqc-desktop-featured-alternatives" aria-label="More recommended Solo Side Quests">
              {featuredQuests.slice(1).map((quest) => (
                <Link key={quest.id} href={`/challenges/${quest.id}`} className="sqc-desktop-featured-alternative">
                  <span>Next on the board</span>
                  <strong>{quest.title}</strong>
                  <small>{quest.difficulty} · {quest.reward} points</small>
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </section>

      <div className="sqc-desktop-command-deck">
        <section id="how-it-works" className="sqc-desktop-loop" aria-labelledby="desktop-loop-title">
          <div className="sqc-desktop-section-heading">
            <span className="sqc-desktop-eyebrow">The official procedure</span>
            <h2 id="desktop-loop-title">The ritual is suspiciously simple.</h2>
            <p>You supply the chess. Side Quest Chess supplies the strange objective, the paperwork, and a tiny heraldic reward department.</p>
          </div>
          <ol>
            <li><span>01</span><strong>Choose your bad idea</strong><p>Pick one rule likely to make your opening coach sigh.</p></li>
            <li><span>02</span><strong>Play normal chess</strong><p>Use a public Lichess or Chess.com game. No special lobby. No costume. We brought the clipboard.</p></li>
            <li><span>03</span><strong>Present evidence to the paperwork goblin</strong><p>Your newest public game is inspected for the required nonsense.</p></li>
            <li><span>04</span><strong>Receive unnecessary heraldry</strong><p>The Coat of Arms goes straight into your Trophy Cabinet.</p></li>
          </ol>
        </section>

        <section className="sqc-desktop-quest-shelf" aria-labelledby="desktop-quests-title">
          <div className="sqc-desktop-section-heading horizontal">
            <div>
              <span className="sqc-desktop-eyebrow">Where to begin</span>
              <h2 id="desktop-quests-title">How heroic are you feeling today?</h2>
              <p>Pick a starting quest based on your current tolerance for terrible chess decisions.</p>
            </div>
            <Link href="/side-quests">Or go find your own path.</Link>
          </div>
          <div className="sqc-desktop-quest-grid sqc-desktop-path-grid">
            {heroismPaths.map(({ label, copy, cta, challenge }) => (
              <Link href={`/challenges/${challenge.id}`} key={challenge.id} className="sqc-desktop-quest-card sqc-desktop-path-card">
                <Image src={toMobileAssetPath(challenge.badgeIdentity.image) ?? mobileAsset.fallbackBadge} alt="" width={116} height={130} />
                <div>
                  <span className="sqc-desktop-path-label">{label}</span>
                  <h3>{challenge.title}</h3>
                  <p>{copy}</p>
                  <strong>{cta} <span aria-hidden="true">→</span></strong>
                </div>
              </Link>
            ))}
          </div>
          <div className="sqc-desktop-path-footer">
            <span>Not in a decision-making mood?</span>
            <DesktopRandomQuestButton questIds={CHALLENGES.map((challenge) => challenge.id)} />
          </div>
        </section>
      </div>

      <section className="sqc-desktop-coat-story" aria-labelledby="desktop-coats-title">
        <div>
          <span className="sqc-desktop-eyebrow">The paperwork has a crest</span>
          <h2 id="desktop-coats-title">Every bad idea deserves a Coat of Arms.</h2>
          <p>
            Complete a quest and its shield enters your Trophy Cabinet: permanent evidence that, yes, you really chose to play like that.
          </p>
          <Link href="/trophy-cabinet">Open the Trophy Cabinet <span aria-hidden="true">→</span></Link>
        </div>
        <div className="sqc-desktop-coat-row" aria-hidden="true">
          {featuredQuests.map((quest) => (
            <Image key={quest.id} src={toMobileAssetPath(quest.badgeIdentity.image) ?? mobileAsset.fallbackBadge} alt="" width={148} height={166} />
          ))}
        </div>
      </section>

      <section className="sqc-desktop-multiplayer-teaser" aria-labelledby="desktop-multiplayer-title">
        <Image src={mobileAsset.multiplayerSeal} alt="" width={132} height={132} />
        <div>
          <span className="sqc-desktop-eyebrow">Multiplayer Side Quests</span>
          <h2 id="desktop-multiplayer-title">Same nonsense, now with witnesses.</h2>
          <p>Invite friends, agree on one terrible idea, then let public games decide who must live with the result.</p>
        </div>
        <Link href="/multiplayer" className="sqc-desktop-secondary">Start a Multiplayer Side Quest</Link>
      </section>

      <footer className="sqc-desktop-footer">
        <span>Side Quest Chess</span>
        <nav aria-label="Footer">
          <Link href="/support">Help & Support</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Use</Link>
        </nav>
      </footer>
    </div>
  );
}

function DesktopSignedInHome({
  displayName,
  hasChessAccount,
  activeSolo,
  activeSoloTitle,
  activeMultiplayerRows,
  trophyRows,
  completedSoloCount,
  proofReceiptCount,
}: {
  displayName?: string | null;
  hasChessAccount: boolean;
  activeSolo?: ActiveSoloHome | null;
  activeSoloTitle?: string | null;
  activeMultiplayerRows: ActiveMultiplayerHomeRow[];
  trophyRows: TrophyRow[];
  completedSoloCount: number;
  proofReceiptCount: number;
}) {
  const hasActiveSolo = Boolean(activeSolo?.title ?? activeSoloTitle);
  const setupComplete = hasChessAccount && hasActiveSolo;
  const completedSteps = Number(hasChessAccount) + Number(hasActiveSolo);

  return (
    <div className="sqc-desktop-signed-in sqc-responsive-signed-home">
      <section className="sqc-desktop-dashboard-intro">
        <div>
          <span className="sqc-desktop-eyebrow">Today&apos;s quest log</span>
          <h1>{setupComplete ? `Welcome back${displayName ? `, ${displayName}` : ""}.` : hasActiveSolo ? "Let’s finish setting up your quest log." : "Let’s choose your first Side Quest."}</h1>
          <p>{setupComplete ? "Your active quest, latest proof, shared challenges, and unlocked Coats of Arms are ready below." : hasActiveSolo ? "Your active quest is ready below. Connect a public chess username before Side Quest Chess can check its proof." : "Connect a public chess username, choose one quest, then play a new public game."}</p>
        </div>
        {!setupComplete ? (
          <ol className="sqc-desktop-onboarding-progress" aria-label="Getting started">
            <li className={hasChessAccount ? "done" : "current"}><span>1</span><Link href="/account">Connect chess account</Link></li>
            <li className={hasActiveSolo ? "done" : hasChessAccount ? "current" : ""}><span>2</span><Link href="/side-quests">Choose a Side Quest</Link></li>
            <li><span>3</span><strong>Play and verify</strong></li>
          </ol>
        ) : (
          <Link href="/side-quests" className="sqc-desktop-secondary">Explore more Side Quests</Link>
        )}
      </section>
      <nav className="sqc-desktop-dashboard-summary" aria-label="Quest log summary">
        <Link href={activeSolo?.href ?? "/side-quests"}>
          <span>Solo focus</span>
          <strong>{activeSolo?.completed ? "Proof complete" : hasActiveSolo ? "In progress" : "Choose a quest"}</strong>
          <small>{activeSolo?.title ?? activeSoloTitle ?? "Start your next public-game objective"}</small>
        </Link>
        <Link href="/multiplayer">
          <span>Shared tables</span>
          <strong>{activeMultiplayerRows.length} active</strong>
          <small>{activeMultiplayerRows.length ? "Open your current Multiplayer Side Quests" : "Join or host a Multiplayer Side Quest"}</small>
        </Link>
        <Link href="/trophy-cabinet">
          <span>Cabinet</span>
          <strong>{completedSoloCount} {completedSoloCount === 1 ? "Coat of Arms" : "Coats of Arms"}</strong>
          <small>{proofReceiptCount} proof receipt{proofReceiptCount === 1 ? "" : "s"} recorded</small>
        </Link>
      </nav>
      <div className="sqc-desktop-dashboard-grid">
        <SignedInHome
          hasChessAccount={hasChessAccount}
          activeSolo={activeSolo}
          activeSoloTitle={activeSoloTitle}
          activeMultiplayerRows={activeMultiplayerRows}
          trophyRows={trophyRows}
          completedSoloCount={completedSoloCount}
          proofReceiptCount={proofReceiptCount}
        />
      </div>
      <footer className="sqc-desktop-footer">
        <span>{completedSteps}/2 setup steps complete</span>
        <nav aria-label="Footer">
          <Link href="/support">Help & Support</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </nav>
      </footer>
    </div>
  );
}

export function GuestHome({
  onBrowseSolo,
  onBrowseMultiplayer,
  onSignIn,
}: {
  onBrowseSolo?: () => void;
  onBrowseMultiplayer?: () => void;
  onSignIn?: () => void;
} = {}) {
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
          sign in when you want Side Quest Chess to save progress, verify proof, or join a table.
        </p>
        <div className="sqc-action-pair">
          {onBrowseSolo ? <button type="button" className="sqc-secondary-action" onClick={onBrowseSolo}>Browse Solo Side Quests</button> : <Link href="/side-quests" className="sqc-secondary-action">Browse Solo Side Quests</Link>}
          {onBrowseMultiplayer ? <button type="button" className="sqc-secondary-action" onClick={onBrowseMultiplayer}>Browse Multiplayer Side Quests</button> : <Link href="/multiplayer" className="sqc-secondary-action">Browse Multiplayer Side Quests</Link>}
        </div>
        {onSignIn ? <button type="button" className="sqc-primary-action" onClick={onSignIn}>Choose sign-in method</button> : <CurrentPageSignInLink className="sqc-primary-action">Choose sign-in method</CurrentPageSignInLink>}
      </section>
    </div>
  );
}

export function SignedInHome({
  hasChessAccount,
  activeSolo,
  activeSoloTitle,
  activeMultiplayerRows,
  trophyRows,
  completedSoloCount,
  proofReceiptCount,
}: {
  hasChessAccount: boolean;
  activeSolo?: ActiveSoloHome | null;
  activeSoloTitle?: string | null;
  activeMultiplayerRows: ActiveMultiplayerHomeRow[];
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
          <span>Side Quest Chess needs Lichess or Chess.com before it can check real games.</span>
        </Link>
      ) : null}

      <section className={`sqc-current-card${activeSolo?.href ? " clickable" : ""}`}>
        {activeSolo?.href ? (
          <Link href={activeSolo.href} className="sqc-current-open-link" aria-label={`Open active Solo Side Quest ${activeSolo.title}`} />
        ) : null}
        {activeSolo?.badgeImage ? (
          <MobileAssetMark
            className="sqc-active-solo-emblem"
            image={toMobileAssetPath(activeSolo.badgeImage) ?? mobileAsset.fallbackBadge}
            glow={activeSolo.glowImage ?? mobileAsset.coatGlow}
            size={139}
            glowSize={170}
          />
        ) : null}
        {activeSolo && !activeSolo.completed ? <ActiveSoloActions checkMode={activeSolo.source === "custom" || activeSolo.source === "community" ? "custom" : "official"} /> : null}
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
        {activeSolo?.completed && activeSolo.proofHref ? (
          <Link href={activeSolo.proofHref} className="sqc-primary-action full">View victory proof</Link>
        ) : null}
        <Link href="/side-quests" className="sqc-secondary-action full">{hasActiveSolo ? "Explore More Solo Side Quests" : "Explore Solo Side Quests"}</Link>
      </section>

      <section className="sqc-home-section first">
        <Link href={activeMultiplayerRows[0]?.href ?? "/multiplayer"} className="sqc-section-hero" aria-label="Open active Multiplayer Side Quest details">
          <MobileAssetMark className="sqc-section-mark group" image={mobileAsset.multiplayerSeal} glow={mobileAsset.coatGlow} size={100} glowSize={142} />
          <p className="sqc-pill">Active Multiplayer Side Quests</p>
          <h2>{activeMultiplayerRows.length ? `${activeMultiplayerRows.length} active Multiplayer Side Quest${activeMultiplayerRows.length === 1 ? "" : "s"}` : "No active Multiplayer Side Quests"}</h2>
        </Link>
        {activeMultiplayerRows.length ? (
          <div className="sqc-row-list trophy-preview">
            {activeMultiplayerRows.slice(0, 5).map((row) => (
              <AppRow key={row.id} title={row.title} meta={row.meta} status={row.status} sourceBadge={row.sourceBadge} href={row.href} image={mobileAsset.multiplayerSeal} />
            ))}
            {activeMultiplayerRows.length > 5 ? (
              <details className="sqc-home-row-disclosure">
                <summary>
                  <span className="sqc-home-row-expand">Show all active Multiplayer Side Quests</span>
                  <span className="sqc-home-row-collapse">Show fewer active Multiplayer Side Quests</span>
                  <small>{activeMultiplayerRows.length - 5} more active Multiplayer Side Quest{activeMultiplayerRows.length - 5 === 1 ? "" : "s"}.</small>
                </summary>
                {activeMultiplayerRows.slice(5).map((row) => (
                  <AppRow key={row.id} title={row.title} meta={row.meta} status={row.status} sourceBadge={row.sourceBadge} href={row.href} image={mobileAsset.multiplayerSeal} />
                ))}
              </details>
            ) : null}
          </div>
        ) : (
          <div className="sqc-row-list trophy-preview">
            <AppRow
              title="No active Multiplayer Side Quests"
              meta="Join or host shared challenges with friends."
              status="Explore"
              image={mobileAsset.multiplayerSeal}
              href="/multiplayer"
            />
          </div>
        )}
        <Link href="/multiplayer" className="sqc-secondary-action full">Explore More Multiplayer Side Quests</Link>
      </section>

      <section className="sqc-home-section">
        <div className="sqc-section-hero">
          <MobileAssetMark className="sqc-section-mark trophy" image={mobileAsset.coat} glow={mobileAsset.coatGlow} size={112} glowSize={156} />
          <p className="sqc-pill">Trophy Cabinet</p>
        </div>
        <div className="sqc-row-list">
          {trophyRows.length ? (
            <>
              {trophyRows.slice(0, 5).map((row) => (
                <AppRow
                  key={row.id}
                  title={row.title}
                  meta={formatHomeTrophyMeta(row.meta, row.source)}
                  status="Open"
                  href={row.href}
                  image={row.image ?? undefined}
                  glow={row.glow}
                  statusImage={row.statusImage}
                />
              ))}
              {trophyRows.length > 5 ? (
                <details className="sqc-home-row-disclosure">
                  <summary>
                    <span className="sqc-home-row-expand">Show all Trophy Cabinet items</span>
                    <span className="sqc-home-row-collapse">Show fewer Trophy Cabinet items</span>
                    <small>{trophyRows.length - 5} more unlocked item{trophyRows.length - 5 === 1 ? "" : "s"}.</small>
                  </summary>
                  {trophyRows.slice(5).map((row) => (
                    <AppRow
                      key={row.id}
                      title={row.title}
                      meta={formatHomeTrophyMeta(row.meta, row.source)}
                      status="Open"
                      href={row.href}
                      image={row.image ?? undefined}
                      glow={row.glow}
                      statusImage={row.statusImage}
                    />
                  ))}
                </details>
              ) : null}
            </>
          ) : (
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

    </div>
  );
}

function ActiveSoloDetail({ activeSolo }: { activeSolo: ActiveSoloHome }) {
  const attempt = activeSolo.latestAttempt;
  const proofStatus = buildSoloProofHomeStatus(Boolean(activeSolo.completed), attempt);
  const failed = proofStatus.kind === "failed";
  const boardFen = failed ? attempt?.failureFen ?? attempt?.finalPositionFen : attempt?.finalPositionFen;
  const boardUci = failed ? attempt?.failureUci ?? attempt?.lastMoveUci : attempt?.lastMoveUci;

  return (
    <div className="sqc-active-detail">
      <MiniChessBoard fen={boardFen} highlightUci={boardUci} orientation={attempt?.playerColor ?? "white"} />
      <div className="sqc-active-detail-copy">
        <p><strong>Goal:</strong> {activeSolo.objective}</p>
        <p><strong>Picked:</strong> <MobileWebRelativeTime value={activeSolo.pickedAt} fallback="not recorded" /></p>
        <p><strong>Latest check:</strong> <MobileWebRelativeTime value={attempt?.checkedAt ?? activeSolo.verifiedAt} fallback="not yet" /></p>
        <p><strong>Status:</strong> <span className={proofStatus.tone === "good" ? "sqc-good" : proofStatus.tone === "danger" ? "sqc-danger" : ""}>{proofStatus.label}</span></p>
        <p className="sqc-active-summary">{proofStatus.detail}</p>
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
          {square.piece ? <span className={`sqc-mini-piece ${square.piece === square.piece.toUpperCase() ? "white" : "black"}`}>{chessPiece(square.piece)}</span> : ""}
        </span>
      ))}
    </div>
  );
}

export function MobileSoloSideQuestsScreen({
  challenges,
  activeChallengeId,
  completedChallengeIds,
  likeSummaries,
  signedIn = false,
  query = "",
  totalChallengeCount = challenges.length,
}: {
  challenges: Challenge[];
  activeChallengeId?: string | null;
  completedChallengeIds?: string[];
  likeSummaries?: Record<string, CommunityLikeSummary>;
  signedIn?: boolean;
  query?: string;
  totalChallengeCount?: number;
}) {
  const catalogReturnTo = query ? `/side-quests?q=${encodeURIComponent(query)}` : "/side-quests";
  const completedSet = new Set(completedChallengeIds ?? []);
  const sortedChallenges = [...challenges].sort((a, b) => {
    const difficultyDelta = difficultyRank(a.difficulty) - difficultyRank(b.difficulty);
    if (difficultyDelta !== 0) return difficultyDelta;
    if (a.id === activeChallengeId) return -1;
    if (b.id === activeChallengeId) return 1;
    const aCompleted = completedSet.has(a.id);
    const bCompleted = completedSet.has(b.id);
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
    if (a.reward !== b.reward) return a.reward - b.reward;
    return a.title.localeCompare(b.title);
  });

  const difficultyShelves = (["Easy", "Medium", "Hard", "Brutal", "Absurd"] as const)
    .map((difficulty) => ({
      difficulty,
      challenges: sortedChallenges.filter((challenge) => challenge.difficulty === difficulty),
    }))
    .filter((shelf) => shelf.challenges.length > 0);

  return (
    <div className="sqc-stack sqc-catalog-screen">
      <header className="sqc-desktop-catalog-intro">
        <span className="sqc-desktop-eyebrow">Official Solo Side Quests</span>
        <h1>Choose the rule that will ruin your next perfectly normal game.</h1>
        <p>Every card opens the complete objective before you commit. Start easy, or skip directly to the kind of decision that deserves its own Coat of Arms.</p>
      </header>
      <div className="sqc-screen-emblem solo" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image" alt="" src={mobileAsset.coat} width={132} height={148} priority />
      </div>

      <nav className="sqc-brand-tabs sqc-solo-brand-tabs" aria-label="Solo Side Quest catalog">
        <Link href="/side-quests" className="sqc-brand-tab official active" aria-current="page">Official Side Quests</Link>
        <Link href="/community-side-quests" className="sqc-brand-switch" data-icon="swap-horizontal" aria-label="Switch to Community Side Quests">
          <span aria-hidden="true" />
        </Link>
        <Link href="/community-side-quests" className="sqc-brand-tab community">Community Side Quests</Link>
      </nav>

      <section className="sqc-panel list">
        <div className="sqc-list-head inline">
          <h2>Official Side Quests</h2>
          <span>{query ? `${sortedChallenges.length} of ${totalChallengeCount} official` : `${sortedChallenges.length} official`}</span>
        </div>
        <form className="sqc-solo-search" action="/side-quests" role="search">
          <label htmlFor="official-solo-search">Find an official Side Quest</label>
          <div>
            <input
              id="official-solo-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search titles, rules, or difficulty"
            />
            <button type="submit">Search</button>
            {query ? <Link className="sqc-solo-search-clear" href="/side-quests">Clear search</Link> : null}
          </div>
        </form>
        {difficultyShelves.length ? (
          <div className="sqc-solo-browser">
            <DesktopSoloDifficultyNav
              items={difficultyShelves.map((shelf) => ({
                difficulty: shelf.difficulty,
                count: shelf.challenges.length,
              }))}
            />
            <div className="sqc-catalog">
              {difficultyShelves.map((shelf) => (
                <div className="sqc-solo-difficulty-shelf" key={shelf.difficulty}>
                  <header className="sqc-solo-difficulty-heading">
                    <h3
                      id={`solo-difficulty-${shelf.difficulty.toLowerCase()}`}
                      data-label={shelf.difficulty}
                    >{shelf.difficulty}</h3>
                    <span>{shelf.challenges.length} {shelf.challenges.length === 1 ? "quest" : "quests"}</span>
                  </header>
                  <div className="sqc-solo-difficulty-grid">
                    {shelf.challenges.map((challenge) => (
                      <AppRow
                        key={challenge.id}
                        title={challenge.title}
                        meta={challenge.objective}
                        desktopNote={challenge.openingHint}
                        status={challenge.id === activeChallengeId ? "Active" : completedSet.has(challenge.id) ? "Completed" : challenge.difficulty}
                        href={`/challenges/${challenge.id}`}
                        image={toMobileAssetPath(challenge.badgeIdentity.image) ?? mobileAsset.fallbackBadge}
                        glow={getChallengeGlowPath(challenge.id)}
                        glowColor={challenge.badgeIdentity.colors.glow}
                        likeSummary={likeSummaries?.[challenge.id]}
                        likeAction={{
                          signedIn,
                          targetType: "solo",
                          targetId: challenge.id,
                          returnTo: catalogReturnTo,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="sqc-empty-panel sqc-solo-empty-search">
            <h3>No official Side Quests match “{query}”.</h3>
            <p>Try a title, rule, category, or difficulty — or clear the search to restore all {totalChallengeCount} quests.</p>
            <Link href="/side-quests">Clear search</Link>
          </div>
        )}
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

export function MobileCreateCustomScreen({ signedIn = false, initialQuest = null }: { signedIn?: boolean; initialQuest?: CustomEditQuestInput | null }) {
  return (
    <div className="sqc-stack sqc-create-custom-screen">
      <section className="sqc-multiplayer-detail-hero sqc-custom-builder-hero">
        <MobileAssetMark className="sqc-section-mark custom" image={mobileAsset.customCrest} glow={mobileAsset.coatGlow} size={112} glowSize={152} />
        <span className="sqc-multiplayer-kicker">Custom Side Quest</span>
        <h1>{initialQuest ? "Edit your Side Quest." : "Build your Side Quest."}</h1>
        <p>{initialQuest ? "Update the saved proof conditions without changing who owns this Side Quest." : "Choose what should happen in a real game. Side Quest Chess will check it after you play."}</p>
      </section>
      <MobileCustomCreateForm key={initialQuest?.id ?? "new-custom-side-quest"} signedIn={signedIn} initialQuest={initialQuest} />
    </div>
  );
}

export function MobileSupportScreen({
  signedIn = false,
  supportMessages = [],
  accountContext = null,
  reportContext = null,
}: {
  signedIn?: boolean;
  supportMessages?: MobileWebSupportMessage[];
  accountContext?: WebSupportAccountContext | null;
  reportContext?: WebSupportReportContext | null;
}) {
  const helpRows = [
    {
      title: "How Side Quests work",
      body: "Pick one Solo Side Quest at a time. After you choose it, play a new public Lichess or Chess.com game so Side Quest Chess has a fresh game to check.",
      action: { label: "Browse Solo Side Quests", href: "/side-quests" },
    },
    {
      title: "Why proof may not work yet",
      body: "Proof checks your newest public games after you choose a Side Quest. If it does not pass, make sure the game is finished, public, played on your connected username, and matches the rule.",
      action: { label: "Choose a Side Quest", href: "/side-quests" },
    },
    {
      title: "Connecting a chess username",
      body: "Add your public Lichess or Chess.com username so Side Quest Chess knows which games belong to you. It only reads public game records and never needs your chess-site password.",
      action: { label: "Open chess account settings", href: "/settings#lichess-username" },
    },
    {
      title: "Multiplayer Side Quests",
      body: "Multiplayer Side Quests are shared challenges with their own rules, time window, players, and leaderboard. Join an official challenge, join a community challenge, or create one for friends.",
      action: { label: "Browse Multiplayer", href: "/multiplayer" },
    },
    {
      title: "Coat of Arms",
      body: "Completing a Side Quest unlocks its Coat of Arms. Your unlocked Coats of Arms stay in your account and appear in the Trophy Cabinet.",
      action: { label: "Open Trophy Cabinet", href: "/trophy-cabinet" },
    },
  ];

  return (
    <div className="sqc-stack sqc-support-screen">
      <div className="sqc-support-overview">
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
          <p><strong>Web app</strong></p>
          <p>{accountContext ? `Signed in as ${accountContext.displayName ?? "Quest runner"}.` : "Not signed in."}</p>
          <p>Lichess: {accountContext?.lichessUsername ?? "not connected"} · Chess.com: {accountContext?.chessComUsername ?? "not connected"}</p>
          <p>Active Solo: {accountContext?.activeSoloQuestTitle ?? "none"} · Active Multiplayer: {accountContext?.activeMultiplayerQuestCount ?? 0} · Public hosted: {accountContext?.publicHostedMultiplayerQuestCount ?? 0}</p>
          {!signedIn ? <SupportDiagnosticsCopy accountContext={accountContext} /> : null}
        </details>
      </div>

      <section className="sqc-support-row-list" aria-label="Help topics">
        <header className="sqc-support-directory-head">
          <span className="sqc-card-eyebrow">Five essentials</span>
          <h2>Help directory</h2>
          <p>Scan the essentials, then jump straight to the part of Side Quest Chess that can help.</p>
        </header>
        {helpRows.map((row, index) => (
          <article className="sqc-support-row" key={row.title}>
            <span className="sqc-support-row-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <h3>{row.title}</h3>
            <p>{row.body}</p>
            <Link className="sqc-support-row-action" href={row.action.href}>{row.action.label}</Link>
          </article>
        ))}
      </section>

      <section className="sqc-support-card sqc-support-legal" aria-label="Legal and privacy">
        <span className="sqc-card-eyebrow">Legal & privacy</span>
        <p>Read the Privacy Policy, support notes, or the Terms of Use. Side Quest Chess never asks for your Lichess or Chess.com password. The Privacy Policy explains the account and app data used to provide the service.</p>
        <div className="sqc-support-link-row">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/support">Support & privacy</Link>
          <Link href="/terms">Terms of Use</Link>
        </div>
      </section>

      <section className="sqc-support-card sqc-support-contact" aria-label="Contact Side Quest Chess support">
        <span className="sqc-card-eyebrow">Contact</span>
        <h3>Crowdler AB</h3>
        <p>Email <a href="mailto:sam@crowdler.com">sam@crowdler.com</a> for product, account, privacy, or safety support.</p>
        <p>Kvarnängsvägen 15, 182 47 Enebyberg, Sweden</p>
      </section>

      {signedIn ? (
        <MobileSupportComposer key={reportContext?.returnPath ?? "support"} signedIn initialMessages={supportMessages} accountContext={accountContext} initialMessage={reportContext?.initialMessage} />
      ) : (
        <section className="sqc-support-card sqc-support-report" aria-label="Report a problem">
          <span className="sqc-card-eyebrow">{reportContext ? reportContext.type === "community-solo" ? "Report Community Solo Side Quest" : "Report Community Multiplayer Side Quest" : "Report a problem"}</span>
          {reportContext ? <>
            <h3>{reportContext.title}</h3>
            <p>Side Quest ID: {reportContext.questId}</p>
            <p>{reportContext.type === "community-solo" ? `Creator: ${reportContext.creatorName}` : `Host: ${reportContext.hostName}`}</p>
            {reportContext.type === "community-multiplayer" ? <p>Status: {reportContext.status}</p> : null}
          </> : null}
          <h3>Support messages require a signed-in Side Quest Chess account.</h3>
          <p>Anonymous messages are not accepted by the support API. Sign in so your note and any reply stay attached to your account.</p>
          <Link href={reportContext ? `/sign-in?redirect_url=${encodeURIComponent(reportContext.returnPath)}` : "/sign-in?redirect_url=/support"} className="sqc-primary-action">Sign in to message support</Link>
        </section>
      )}
    </div>
  );
}

export function MobileTrophyCabinetScreen({
  signedIn,
  trophyRows,
  completedSoloCount,
  proofReceiptCount: _proofReceiptCount,
  officialSoloCount,
  officialChallenges,
}: {
  signedIn: boolean;
  trophyRows: TrophyRow[];
  completedSoloCount: number;
  proofReceiptCount: number;
  officialSoloCount: number;
  officialChallenges: Challenge[];
}) {
  const officialMultiplayerRows = trophyRows.filter((row) => row.source === "officialMultiplayer" || row.source === "multiplayer");
  const communityMultiplayerRows = trophyRows.filter((row) => row.source === "communityMultiplayer");
  const soloRows = trophyRows.filter((row) => row.source === "solo" || row.source?.endsWith("Solo") || !row.source);
  const officialSoloRows = soloRows.filter((row) => row.source === "officialSolo" || row.source === "solo" || !row.source);
  const customSoloRows = soloRows.filter((row) => row.source === "customSolo");
  const communitySoloRows = soloRows.filter((row) => row.source === "communitySolo");
  const earnedIds = new Set(soloRows.map((row) => row.id.replace(/^solo-/, "")));
  const unlockedCount = trophyRows.length;

  void _proofReceiptCount;

  return (
    <div className="sqc-stack sqc-trophy-screen">
      <div className="sqc-screen-emblem trophy" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image" alt="" src={mobileAsset.coat} width={132} height={148} priority />
      </div>

      <header className="sqc-desktop-trophy-intro">
        <span>Your reward archive</span>
        <h1>Every ridiculous victory, filed in one grand collection.</h1>
        <p>Review earned Coats of Arms and podium finishes, then browse the complete Official Solo collection without leaving your cabinet.</p>
      </header>

      {signedIn ? (
        <section className="sqc-native-card sqc-trophy-summary" aria-label="Trophy Cabinet summary">
          <span className="sqc-card-eyebrow">Trophy Cabinet</span>
          <h2>{unlockedCount ? `${unlockedCount} unlocked: ${officialSoloRows.length} Official Solo Side Quest${officialSoloRows.length === 1 ? "" : "s"} · ${customSoloRows.length} Custom Solo Side Quest${customSoloRows.length === 1 ? "" : "s"} · ${communitySoloRows.length} Community Solo Side Quest${communitySoloRows.length === 1 ? "" : "s"} · ${officialMultiplayerRows.length} Official Multiplayer Side Quest${officialMultiplayerRows.length === 1 ? "" : "s"} · ${communityMultiplayerRows.length} Community Multiplayer Side Quest${communityMultiplayerRows.length === 1 ? "" : "s"}` : "No unlocked trophies yet."}</h2>
          <p>
            {unlockedCount
              ? "This is your unified Side Quest Chess reward shelf. Official Solo Coats of Arms and Official Multiplayer podiums are highlighted first; community and custom rewards still belong here."
              : "Complete any Official Solo Side Quest, Custom Solo Side Quest, or Multiplayer Side Quest and it will appear on this shelf."}
          </p>
        </section>
      ) : (
        <section className="sqc-native-card sqc-trophy-summary sqc-trophy-sign-in" aria-label="Sign in to sync Trophy Cabinet">
          <span className="sqc-card-eyebrow">Your Trophy Cabinet</span>
          <h2>Sign in to sync your cabinet.</h2>
          <p>Your earned Coats of Arms and podium finishes are private account state. Sign in to view them here; the complete Official Solo collection remains open to browse below.</p>
          <Link href="/sign-in?redirect_url=%2Ftrophy-cabinet" className="sqc-primary-action">Sign in to view my rewards</Link>
        </section>
      )}

      {signedIn ? <>
        <section className="sqc-native-card sqc-trophy-official-multiplayer" aria-label="Official Multiplayer Side Quest trophies">
          <span className="sqc-card-eyebrow">Official Multiplayer trophies</span>
          <h2>{officialMultiplayerRows.length} Official Multiplayer Side Quest podium{officialMultiplayerRows.length === 1 ? "" : "s"}.</h2>
          {officialMultiplayerRows.length ? (
            <div className="sqc-catalog">
              {officialMultiplayerRows.map((row) => (
                <AppRow key={row.id} title={row.title} meta={row.meta} status="Open" href={row.href} image={row.image ?? undefined} glow={row.glow} statusImage={row.statusImage} />
              ))}
            </div>
          ) : (
            <p>Place on the podium in an official Multiplayer Side Quest to earn one here.</p>
          )}
        </section>

        <section className="sqc-native-card sqc-trophy-community-multiplayer" aria-label="Community Multiplayer Side Quest trophies">
          <span className="sqc-card-eyebrow">Community Multiplayer trophies</span>
          <h2>{communityMultiplayerRows.length} Community Multiplayer Side Quest podium{communityMultiplayerRows.length === 1 ? "" : "s"}.</h2>
          {communityMultiplayerRows.length ? (
            <div className="sqc-catalog">
              {communityMultiplayerRows.map((row) => (
                <AppRow key={row.id} title={row.title} meta={row.meta} status="Open" href={row.href} image={row.image ?? undefined} glow={row.glow} statusImage={row.statusImage} />
              ))}
            </div>
          ) : (
            <p>Place on the podium in a Community Multiplayer Side Quest to earn one here.</p>
          )}
        </section>

        <section className="sqc-native-card sqc-trophy-solo-rewards" aria-label="Unlocked Solo Side Quest rewards">
          <span className="sqc-card-eyebrow">Unlocked Solo Side Quest rewards</span>
          <h2>{soloRows.length ? "Official, Custom, and Community Solo Side Quest Coats of Arms" : "No Solo Coats of Arms yet."}</h2>
          <div className="sqc-catalog">
            {soloRows.length ? soloRows.map((row) => (
              <AppRow key={row.id} title={row.title} meta={row.meta} status="Unlocked" href={row.href} image={row.image ?? undefined} glow={row.glow} statusImage={row.statusImage} />
            )) : (
              <AppRow title="No Coat of Arms yet" meta="Complete a Side Quest to unlock your first trophy." status="Explore" href="/side-quests" image={mobileAsset.coat} />
            )}
          </div>
        </section>
      </> : null}

      <section className="sqc-native-card sqc-trophy-collection-summary" aria-label="Official Solo Side Quest collection">
        <span className="sqc-card-eyebrow">Official Solo Side Quest collection</span>
        <h2>{signedIn ? `${completedSoloCount} of ${officialSoloCount} official Side Quest Coats of Arms unlocked.` : `Browse all ${officialSoloCount} official Side Quest ${officialSoloCount === 1 ? "Coat of Arms" : "Coats of Arms"}.`}</h2>
        <p>{signedIn ? "Locked official Coats of Arms are previews. Custom and Community Solo Side Quest rewards appear above when earned." : "Open any Coat of Arms to inspect its Side Quest. Sign in to see which rewards you have unlocked."}</p>
      </section>

      <DesktopTrophyCollection
        signedIn={signedIn}
        coats={officialChallenges.map((challenge) => ({
          id: challenge.id,
          title: challenge.title,
          objective: challenge.objective,
          difficulty: challenge.difficulty,
          category: challenge.category,
          image: toMobileAssetPath(challenge.badgeIdentity.image) ?? mobileAsset.fallbackBadge,
          earned: earnedIds.has(challenge.id),
        }))}
      />
    </div>
  );
}

export function MobileCommunitySideQuestsScreen({
  rows,
  signedIn,
  initialCreator = null,
  initialState,
}: {
  rows: CommunitySideQuestRow[];
  signedIn: boolean;
  initialCreator?: string | null;
  initialState?: CommunityDiscoveryState;
}) {
  const creatorRow = initialCreator ? rows.find((row) => row.creatorKey === initialCreator) : null;
  const creatorRowCount = creatorRow
    ? rows.filter((row) => row.creatorKey === initialCreator).length
    : rows.length;
  const creatorDirectory = Array.from(rows.reduce((creators, row) => {
    if (!row.creatorKey || !row.creatorName || !row.creatorBrowsePath) return creators;
    const current = creators.get(row.creatorKey);
    creators.set(row.creatorKey, {
      key: row.creatorKey,
      name: row.creatorName,
      href: row.creatorBrowsePath,
      questCount: (current?.questCount ?? 0) + 1,
      popularity: (current?.popularity ?? 0) + row.popularityScore,
    });
    return creators;
  }, new Map<string, { key: string; name: string; href: string; questCount: number; popularity: number }>()).values())
    .sort((left, right) => right.questCount - left.questCount
      || right.popularity - left.popularity
      || (left.name < right.name ? -1 : left.name > right.name ? 1 : 0)
      || (left.key < right.key ? -1 : left.key > right.key ? 1 : 0))
    .slice(0, 6);

  return (
    <div className="sqc-stack sqc-community-solo-screen">
      <div className="sqc-screen-emblem" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image" alt="" src={mobileAsset.coat} width={132} height={148} priority />
      </div>

      <header className="sqc-desktop-community-intro">
        <span>Community Solo Side Quests</span>
        <h1>Player-made rules, arranged for serious browsing.</h1>
        <p>Search, compare, and sort every public Side Quest created by the Side Quest Chess community.</p>
      </header>

      <nav className="sqc-brand-tabs sqc-solo-brand-tabs" aria-label="Solo Side Quest catalog">
        <Link href="/side-quests" className="sqc-brand-tab official">
          Official Side Quests
        </Link>
        <Link href="/side-quests" className="sqc-brand-switch" data-icon="swap-horizontal" aria-label="Switch to Official Side Quests"><span aria-hidden="true" /></Link>
        <Link href="/community-side-quests" className="sqc-brand-tab community active" aria-current="page">
          Community Side Quests
        </Link>
      </nav>

      <section className="sqc-community-intro" aria-label="Community Side Quests">
        <h1>Community Side Quests</h1>
        <p>These are Side Quests created by the Side Quest Chess community.</p>
      </section>

      <nav className="sqc-community-subtabs" aria-label="Community Solo views">
        <span className="active" aria-current="page">Discover</span>
        <Link href="/custom-side-quests">My Library</Link>
      </nav>

      {creatorRow ? (
        <aside className="sqc-community-creator-shelf" aria-label="Creator shelf">
          <span>Browsing creator</span>
          <strong>{creatorRow.creatorName ?? "Quest runner"}</strong>
          <small>{creatorRowCount} public Side Quest{creatorRowCount === 1 ? "" : "s"}</small>
          <Link href="/community-side-quests">All creators</Link>
        </aside>
      ) : !initialCreator && creatorDirectory.length ? (
        <aside className="sqc-community-creator-directory" aria-label="Creator shortcuts">
          <span>Community directory</span>
          <h2>Browse creators</h2>
          <p>Jump to the most active public shelves.</p>
          <div>
            {creatorDirectory.map((creator) => (
              <Link key={creator.key} className="sqc-community-creator-directory-link" href={creator.href}>
                <span>{creator.name}</span>
                <small>{creator.questCount} {creator.questCount === 1 ? "quest" : "quests"}</small>
              </Link>
            ))}
          </div>
        </aside>
      ) : null}

      <section className="sqc-community-catalog-section" aria-label="Community Solo Discover">
        <div className="sqc-community-section-header">
          <h2>Community Side Quests</h2>
          <span>{creatorRowCount ? `${creatorRowCount}/${creatorRowCount}` : "0 public"}</span>
        </div>

        <CommunitySoloCatalog rows={rows} signedIn={signedIn} initialCreator={initialCreator} initialState={initialState} />
      </section>
    </div>
  );
}

export function MobileCommunitySideQuestDetailScreen({
  quest,
  signedIn,
  duplicateInput,
  ownedByYou = false,
  activeQuestId,
  likeSummary = { count: 0, likedByViewer: false },
  completed = false,
  completedAt,
  resultHref,
  latestAttempt,
  returnHref = "/community-side-quests",
}: {
  quest: CommunitySideQuestDetail;
  signedIn: boolean;
  duplicateInput?: CustomOwnerSaveInput;
  ownedByYou?: boolean;
  activeQuestId?: string | null;
  likeSummary?: CommunityLikeSummary;
  completed?: boolean;
  completedAt?: string | null;
  resultHref?: string | null;
  latestAttempt?: {
    status: string;
    summary: string;
    checkedAt: string;
    finalPositionFen?: string;
    lastMoveSan?: string;
    failureLabel?: string;
    failureExplanation?: string;
  } | null;
  returnHref?: string;
}) {
  const badge = toMobileAssetPath(quest.badgeImageUrl) ?? mobileAsset.customCrest;
  const totalSolo = quest.stats.soloAttempts + quest.stats.soloSelections + quest.stats.soloCompletions;
  const activeForViewer = signedIn && activeQuestId === quest.id;
  const hasDiscoveryContext = returnHref !== "/community-side-quests";
  const detailHref = buildCommunityQuestDetailHref(quest.id, returnHref);

  return (
    <div className="sqc-stack sqc-community-detail-screen">
      <nav className="sqc-community-detail-wayfinding" aria-label="Community Solo Side Quest navigation">
        <Link href={returnHref} className="sqc-community-detail-back">
          <span aria-hidden="true">←</span>
          {hasDiscoveryContext ? "Back to filtered results" : "All Community Side Quests"}
        </Link>
        <Link href={quest.creatorBrowsePath} className="sqc-community-detail-creator-link">
          <span>More by</span>
          <strong>{quest.creatorName}</strong>
        </Link>
      </nav>

      <section className="sqc-multiplayer-detail-hero sqc-community-detail-hero">
        <MobileAssetMark className="sqc-section-mark community" image={badge} glow={mobileAsset.coatGlow} size={118} glowSize={144} />
        <span className="sqc-detail-latest-check">{ownedByYou ? "Your Community Solo Side Quest" : "Community Solo Side Quest"}</span>
        <div className="sqc-active-detail-title-row">
          <h1>{quest.title}</h1>
          <OfficialSoloLikeControl
            targetId={quest.id}
            count={likeSummary.count}
            likedByViewer={likeSummary.likedByViewer}
            signedIn={signedIn}
            returnTo={detailHref}
            label={quest.title}
          />
        </div>
        <p>{quest.summary}</p>
        <small>{completed ? "Completed · Public" : "Ready · Public"}</small>
      </section>

      <div className="sqc-community-reading-panel">
        <section className="sqc-native-card sqc-detail-panel-strong">
          <span className="sqc-card-eyebrow">Challenge</span>
          <h2>What to do</h2>
          <p>{quest.summary}</p>
          <small>Play a new public game after picking this Side Quest.</small>
        </section>

        <section className="sqc-native-card sqc-multiplayer-native-card">
          <span className="sqc-card-eyebrow">Rule details</span>
          <h2>{quest.ruleLabel}</h2>
          <div className="sqc-condition-list">
            {quest.ruleDetails.map((line, index) => (
              <div key={`${quest.id}-rule-${index}`} className="sqc-condition-compact-row">
                <span>{index + 1}</span>
                <div>
                  <strong>{getConditionLabel(index)}</strong>
                  <p>{line}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="sqc-community-detail-support">
        <section className="sqc-multiplayer-score-grid" aria-label="Community Solo Side Quest summary">
          <div>
            <span>Solo use</span>
            <strong>{totalSolo || 0}</strong>
          </div>
          <div>
            <span>Completed</span>
            <strong>{quest.stats.soloCompletions || 0}</strong>
          </div>
          <div>
            <span>Multiplayer</span>
            <strong>{quest.stats.multiplayerLineups || 0}</strong>
          </div>
        </section>

        <section className="sqc-native-card sqc-multiplayer-native-card">
          <span className="sqc-card-eyebrow">Creator</span>
          <h2>Made by {quest.creatorName}</h2>
          <p>Browse more public Side Quests from this creator when available.</p>
        </section>
      </div>

      <div className="sqc-community-task-rail">
        {completed || activeForViewer ? (
          <CustomSideQuestProofControls
            questId={quest.id}
            active={activeForViewer}
            playable
            completed={completed}
            completedAt={completedAt}
            resultHref={resultHref}
            latestAttempt={latestAttempt}
          />
        ) : (
          <section className="sqc-native-card sqc-multiplayer-native-card">
            <span className="sqc-card-eyebrow">{signedIn ? "Pick first" : "Sign in first"}</span>
            <h2>{signedIn ? "Pick this Side Quest before playing your proof game." : "Sign in to pick this Community Solo Side Quest."}</h2>
            <p>Your account keeps active Side Quests, usernames, proof checks, and trophies in sync.</p>
          </section>
        )}

        <div className="sqc-community-detail-actions" aria-label="Community Solo Side Quest actions">
          {!completed && !activeForViewer ? <CommunitySoloPickControl questId={quest.id} signedIn={signedIn} activeQuestId={activeQuestId} detailHref={detailHref} /> : null}
          <CommunitySoloSocialActions questId={quest.id} title={quest.title} creatorName={quest.creatorName} signedIn={signedIn} />
          <div className="sqc-community-action-group sqc-community-next-actions" role="group" aria-labelledby="community-next-actions-label">
            <span className="sqc-community-action-group-label" id="community-next-actions-label">Continue exploring</span>
            <Link href={returnHref} className="sqc-detail-quiet-button">{hasDiscoveryContext ? "Back to results" : "Back to list"}</Link>
            <Link href={quest.creatorBrowsePath} className="sqc-detail-secondary-button">More by {quest.creatorName}</Link>
            {signedIn ? <Link href={`/create-multiplayer-side-quest?quest=${encodeURIComponent(quest.id)}`} className="sqc-detail-secondary-button">Use in Multiplayer</Link> : null}
            {signedIn && duplicateInput ? <CommunitySoloDuplicateControl quest={duplicateInput} /> : null}
            {!signedIn ? <CurrentPageSignInLink aria-label="Sign in to duplicate custom Side Quest" className="sqc-detail-secondary-button">Duplicate</CurrentPageSignInLink> : null}
          </div>
          <div className="sqc-community-action-group sqc-community-share-group" role="group" aria-labelledby="community-share-actions-label">
            <span className="sqc-community-action-group-label" id="community-share-actions-label">Share this Side Quest</span>
            <CommunitySoloShareControls id={quest.id} title={quest.title} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileCustomSideQuestsScreen({
  rows,
  signedIn = false,
  localDrafts,
  successMessage,
}: {
  rows: CustomSideQuestLibraryRow[];
  signedIn?: boolean;
  localDrafts?: ReactNode;
  successMessage?: string | null;
}) {
  return (
    <div className="sqc-stack sqc-custom-library-screen">
      <div className="sqc-screen-emblem" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image" alt="" src={mobileAsset.coat} width={132} height={148} priority />
      </div>

      <header className="sqc-desktop-custom-intro">
        <span>Your custom collection</span>
        <h1>Your Side Quest workshop, with room to think.</h1>
        <p>Search saved rules, separate drafts from published quests, and open the exact Side Quest you want to play, share, or refine.</p>
      </header>

      <nav className="sqc-brand-tabs sqc-solo-brand-tabs" aria-label="Solo Side Quest catalog">
        <Link href="/side-quests" className="sqc-brand-tab official">
          Official Side Quests
        </Link>
        <Link href="/side-quests" className="sqc-brand-switch" data-icon="swap-horizontal" aria-label="Switch to Official Side Quests"><span aria-hidden="true" /></Link>
        <Link href="/community-side-quests" className="sqc-brand-tab community active">
          Community Side Quests
        </Link>
      </nav>

      <nav className="sqc-community-subtabs" aria-label="Community Solo views">
        <Link href="/community-side-quests">Discover</Link>
        <span className="active" aria-current="page">My Library</span>
      </nav>

      {!signedIn ? (
        <aside className="sqc-custom-account-bridge" aria-label="Custom Side Quest account sync">
          <span aria-hidden="true">LOCAL WORKSHOP</span>
          <div>
            <strong>Draft here. Play anywhere.</strong>
            <p>This browser can keep local drafts. Sign in to sync saved Side Quests, pick one for proof, and use it in Multiplayer.</p>
          </div>
          <Link href="/sign-in?redirect_url=%2Fcustom-side-quests">Sign in to sync my workshop</Link>
        </aside>
      ) : null}

      {successMessage ? <p className="sqc-action-success" role="status">{successMessage}</p> : null}

      <section className="sqc-community-catalog-section" aria-label="My Custom Side Quests">
        <div className="sqc-community-section-header">
          <h2>My Custom Side Quests</h2>
          <Link href="/create-custom-side-quest">+ Create</Link>
        </div>

        {!rows.length && !localDrafts ? (
          <Link href="/create-custom-side-quest" className="sqc-custom-create-card">
            <MobileAssetMark className="sqc-custom-create-mark" image={mobileAsset.coat} glow={mobileAsset.coatGlow} size={74} glowSize={96} />
            <span>
              <strong>Build your own Side Quest</strong>
              <small>Create rules, keep drafts private, publish when ready, and use them solo or in Multiplayer Side Quests you host.</small>
            </span>
            <b>Build a Side Quest</b>
          </Link>
        ) : null}

        {rows.length ? <CustomSoloCatalog rows={rows} /> : null}
        {localDrafts}
      </section>
    </div>
  );
}

export function MobileMultiplayerSideQuestsScreen({
  selectedTab,
  signedIn,
  officialRows,
  communityRows,
  communityHost,
  previousOfficialRows,
  earlierOfficialWeeks,
  catalogStatus = "available",
}: {
  selectedTab: "official" | "community";
  signedIn: boolean;
  officialRows: MobileWebMultiplayerPreview[];
  communityRows: MobileWebMultiplayerPreview[];
  communityHost?: string | null;
  previousOfficialRows?: MobileWebMultiplayerResult[];
  earlierOfficialWeeks?: MobileWebOfficialWeek[];
  catalogStatus?: "available" | "unavailable";
}) {
  return (
    <div className="sqc-stack">
      <div className="sqc-screen-emblem" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image multiplayer" alt="" src={mobileAsset.multiplayerSeal} width={118} height={118} priority />
      </div>

      <div className="sqc-desktop-multiplayer-intro">
        <span>Multiplayer Side Quests</span>
        <h1>Shared challenges, arranged like a tournament desk.</h1>
        <p>Join an official challenge, browse community tables, or create one for friends. Every result still comes from fresh public games and checked proof.</p>
        <nav className="sqc-desktop-multiplayer-launchpad" aria-label="Multiplayer quick actions">
          <Link href="/create-multiplayer-side-quest">Create a Multiplayer Side Quest</Link>
          <Link href="/multiplayer-side-quests?tab=community#join-private-multiplayer">Join with invite code</Link>
        </nav>
      </div>

      <nav className="sqc-brand-tabs sqc-multiplayer-brand-tabs" aria-label="Multiplayer Side Quest catalog">
        <Link
          href="/multiplayer-side-quests"
          className={selectedTab === "official" ? "sqc-brand-tab official active" : "sqc-brand-tab official"}
          aria-current={selectedTab === "official" ? "page" : undefined}
        >
          Official Side Quests
        </Link>
        <Link
          href={selectedTab === "official" ? "/multiplayer-side-quests?tab=community" : "/multiplayer-side-quests"}
          className="sqc-brand-switch"
          data-icon="swap-horizontal"
          aria-label={selectedTab === "official" ? "Switch to Community Multiplayer Side Quests" : "Switch to Official Multiplayer Side Quests"}
        >
          <span aria-hidden="true" />
        </Link>
        <Link
          href="/multiplayer-side-quests?tab=community"
          className={selectedTab === "community" ? "sqc-brand-tab community active" : "sqc-brand-tab community"}
          aria-current={selectedTab === "community" ? "page" : undefined}
        >
          Community Side Quests
        </Link>
      </nav>

      {selectedTab === "official"
        ? <OfficialMultiplayerPanel signedIn={signedIn} rows={officialRows} previousOfficialRows={previousOfficialRows ?? []} earlierOfficialWeeks={earlierOfficialWeeks ?? []} catalogStatus={catalogStatus} />
        : <CommunityMultiplayerPanel signedIn={signedIn} rows={communityRows} initialHost={communityHost} catalogStatus={catalogStatus} />}
    </div>
  );
}

function OfficialMultiplayerPanel({
  signedIn,
  rows,
  previousOfficialRows,
  earlierOfficialWeeks,
  catalogStatus,
}: {
  signedIn: boolean;
  rows: MobileWebMultiplayerPreview[];
  previousOfficialRows: MobileWebMultiplayerResult[];
  earlierOfficialWeeks: MobileWebOfficialWeek[];
  catalogStatus: "available" | "unavailable";
}) {
  return (
    <>
      <section className="sqc-panel list" aria-label="Official Multiplayer Side Quests">
        <div className="sqc-list-head inline">
          <h2>Official Multiplayer Side Quests</h2>
          <span>{rows.length} official</span>
        </div>
        {rows.length ? (
          <div className="sqc-catalog">
            {rows.map((row) => (
              <AppRow
                key={row.id}
                title={row.title}
                meta={row.meta}
                status={signedIn ? row.status : "Sign in"}
                href={row.href}
                image={mobileAsset.multiplayerSeal}
                sourceBadge={row.sourceBadge}
                likeSummary={row.likeSummary}
                likeAction={{
                  signedIn,
                  targetType: "multiplayer",
                  targetId: row.id,
                  returnTo: "/multiplayer-side-quests",
                }}
                desktopMultiplayerFacts={{
                  players: String(row.playerCount),
                  quests: String(row.quests.length),
                  closes: row.timeLeftLabel,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="sqc-empty-panel standalone">
            <strong>{catalogStatus === "unavailable" ? "Public Multiplayer Side Quests could not be loaded." : "No official Multiplayer Side Quests are open."}</strong>
            <span>{catalogStatus === "unavailable" ? "Check your connection and try again." : "The next official cycle will appear here when it opens."}</span>
          </div>
        )}
      </section>

      {signedIn ? (
        <>
          <section className="sqc-native-card green" aria-label="Latest finished official Multiplayer Side Quest results">
            <span className="sqc-card-eyebrow">Latest finished official set</span>
            <h2>Gold, silver, bronze.</h2>
            <p>The latest completed official weekly set appears here after the leaderboard closes.</p>
            {previousOfficialRows.length ? (
              <div className="sqc-official-results-stack">
                {previousOfficialRows.map((result) => (
                  <OfficialResultCard key={result.id} result={result} />
                ))}
              </div>
            ) : (
              <p>Results will appear here after the first official weekly set finishes.</p>
            )}
          </section>

          <section className="sqc-native-card green" aria-label="Browse earlier official Multiplayer Side Quest results">
            <span className="sqc-card-eyebrow">Earlier official weeks</span>
            <h2>Browse weekly results.</h2>
            <p>Finished official Multiplayer Side Quest sets are grouped by week so we can keep running this weekly.</p>
            {earlierOfficialWeeks.length ? (
              <div className="sqc-catalog">
                {earlierOfficialWeeks.map((week) => (
                  <details className="sqc-official-week-results" key={week.id}>
                    <summary>
                      <span className="sqc-official-week-copy">
                        <strong>{week.title}</strong>
                        <small>{week.meta}</small>
                      </span>
                      <span className="sqc-pill">Results</span>
                    </summary>
                    <div className="sqc-official-results-stack">
                      {week.results.map((result) => (
                        <OfficialResultCard key={result.id} result={result} />
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <p>Earlier weekly result sets will appear here after the next official cycle closes.</p>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}

function OfficialResultCard({ result }: { result: MobileWebMultiplayerResult }) {
  return (
    <Link href={result.href} className="sqc-official-result-card" aria-label={`Open official result ${result.title}`}>
      <span className="sqc-official-result-head">
        <span className="sqc-official-result-seal" aria-hidden="true">
          <Image className="sqc-official-result-seal-glow" alt="" src={mobileAsset.coatGlow} width={58} height={62} />
          <Image className="sqc-official-result-seal-image" alt="" src={mobileAsset.multiplayerSeal} width={42} height={42} />
        </span>
        <span className="sqc-official-result-copy">
          <strong>{result.title}</strong>
          <small>{result.summary}</small>
        </span>
      </span>
      <span className="sqc-official-podium-list">
        {result.podiumRows.map((row) => (
          <span className="sqc-official-podium-row" key={row.placement}>
            <Image className="sqc-official-podium-seal" alt="" src={getOfficialPodiumSeal(row.placement)} width={28} height={28} />
            <span className="sqc-official-podium-copy">
              <strong>{row.name}</strong>
              <small>{row.meta}</small>
            </span>
          </span>
        ))}
      </span>
    </Link>
  );
}

function getOfficialPodiumSeal(placement: "Gold" | "Silver" | "Bronze") {
  if (placement === "Gold") return mobileAsset.goldSeal;
  if (placement === "Silver") return mobileAsset.silverSeal;
  return mobileAsset.bronzeSeal;
}

function CommunityMultiplayerPanel({ signedIn, rows, initialHost, catalogStatus }: { signedIn: boolean; rows: MobileWebMultiplayerPreview[]; initialHost?: string | null; catalogStatus: "available" | "unavailable" }) {
  return (
    <div className="sqc-multiplayer-community-workspace">
      <section className="sqc-empty-panel standalone">
        <strong>Community Multiplayer Side Quests</strong>
        <span>
          {signedIn
            ? "These are Multiplayer Side Quests created, joined, hosted, or finished by the Side Quest Chess community."
            : "Browse public Multiplayer Side Quests from the Side Quest Chess community. Sign in when you want to join one."}
        </span>
      </section>

      <CommunityMultiplayerCatalog rows={rows} signedIn={signedIn} initialHost={initialHost} catalogStatus={catalogStatus} />

      {signedIn ? (
        <section className="sqc-native-card green" aria-label="Create Multiplayer Side Quest fast action">
          <span className="sqc-card-eyebrow">Create</span>
          <h2>Create a Community Multiplayer Side Quest.</h2>
          <p>Pick up to four Side Quests, set the time window, then share the table with players.</p>
          <Link href="/create-multiplayer-side-quest" className="sqc-primary-action">Create Multiplayer Side Quest</Link>
        </section>
      ) : null}

      <section id="join-private-multiplayer" className="sqc-native-card green" aria-label="Join private Multiplayer Side Quest">
        <span className="sqc-card-eyebrow">Invite Code</span>
        <h2>Join private Multiplayer Side Quest.</h2>
        <p>Paste an invite code from the host to join a private Multiplayer Side Quest.</p>
        <GroupQuestInviteKeyJoin isSignedIn={signedIn} />
      </section>
    </div>
  );
}

export function MobileCreateMultiplayerScreen({ signedIn = false, quests = [], communityUnavailable = false, initialQuestId }: { signedIn?: boolean; quests?: MultiplayerCreateQuest[]; communityUnavailable?: boolean; initialQuestId?: string }) {
  return (
    <div className="sqc-stack sqc-create-multiplayer-screen">
      <nav className="sqc-multiplayer-create-context-nav" aria-label="Multiplayer creation context">
        <Link href="/multiplayer">Multiplayer Side Quests</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Create Multiplayer Side Quest</span>
      </nav>
      <section className="sqc-multiplayer-detail-hero sqc-create-multiplayer-hero">
        <MobileAssetMark className="sqc-section-mark group" image={mobileAsset.multiplayerSeal} glow={mobileAsset.coatGlow} size={100} glowSize={142} />
        <span className="sqc-multiplayer-kicker">Create Multiplayer Side Quest</span>
        <h1>Start a shared Multiplayer Side Quest.</h1>
        <p>Choose the rules, create the Multiplayer Side Quest, then share the invite with players.</p>
      </section>

      <MobileMultiplayerCreateForm signedIn={signedIn} quests={quests} stableNow={new Date().toISOString()} communityUnavailable={communityUnavailable} initialQuestId={initialQuestId} />

      <div hidden aria-hidden="true">
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
        <span className="sqc-create-footer-button">Create</span>
      </section>
      </div>
    </div>
  );
}

export function MobileMultiplayerDetailScreen({
  quest,
  signedIn,
}: {
  quest: MobileWebMultiplayerPreview;
  signedIn: boolean;
}) {
  const official = quest.sourceBadge === "Official";
  const joinState = getMultiplayerJoinState({ questId: quest.id, signedIn, status: quest.status });
  const participating = joinState.kind === "joined" || (joinState.kind === "hosted" && quest.viewerJoined === true);
  const hostedNeedsJoin = joinState.kind === "hosted" && !participating;
  const viewerFinalRow = quest.leaderboardRows.find((row) => row.viewer);
  const finalResultTitle = viewerFinalRow?.placement
    ? `${viewerFinalRow.placement} finish.`
    : viewerFinalRow
      ? `Final place #${viewerFinalRow.rank}.`
      : "Final leaderboard frozen.";
  const finalSealImage = viewerFinalRow?.placement === "Gold"
    ? mobileAsset.goldSeal
    : viewerFinalRow?.placement === "Silver"
      ? mobileAsset.silverSeal
      : viewerFinalRow?.placement === "Bronze"
        ? mobileAsset.bronzeSeal
        : mobileAsset.multiplayerSeal;

  return (
    <div className="sqc-stack sqc-multiplayer-public-detail-screen">
      <nav className="sqc-multiplayer-context-nav" aria-label="Multiplayer context">
        <Link href={official ? "/multiplayer" : "/multiplayer-side-quests"}>Multiplayer Side Quests</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{quest.title}</span>
      </nav>
      <section className="sqc-multiplayer-detail-hero">
        <MobileAssetMark className="sqc-section-mark group" image={mobileAsset.multiplayerSeal} glow={mobileAsset.coatGlow} size={116} glowSize={146} />
        <span className="sqc-multiplayer-kicker">{official ? "Official Multiplayer Side Quest" : "Community Multiplayer Side Quest"}</span>
        <div className="sqc-active-detail-title-row">
          <h1>{quest.title}</h1>
          <OfficialSoloLikeControl
            targetType="multiplayer"
            targetId={quest.id}
            count={quest.likeSummary.count}
            likedByViewer={quest.likeSummary.likedByViewer}
            signedIn={signedIn}
            returnTo={`/groupquests/${encodeURIComponent(quest.id)}`}
            label={quest.title}
          />
        </div>
        <p>{quest.inviteCopy}</p>
        <span className="sqc-detail-latest-check">{quest.lifecycle.toUpperCase()}</span>
      </section>

      <section className="sqc-multiplayer-score-grid" aria-label="Multiplayer Side Quest summary">
        <div>
          <span>Players</span>
          <strong>{quest.playersLabel}</strong>
        </div>
        <div>
          <span>Time left</span>
          <strong>{quest.timeLeftLabel}</strong>
        </div>
        <div>
          <span>Your place</span>
          <strong>{signedIn ? (quest.positionLabel ?? "Join to place") : "Sign in"}</strong>
        </div>
      </section>

      {quest.lifecycle === "finished" ? (
        <section className="sqc-native-card sqc-multiplayer-native-card" aria-label="Final Multiplayer result">
          <span className="sqc-card-eyebrow">Final result</span>
          <h2>{finalResultTitle}</h2>
          <p>{viewerFinalRow ? `${viewerFinalRow.progress} complete · Proof checks are closed, so this is your final table receipt.` : "Proof checks are closed, so this leaderboard is final."}</p>
          {viewerFinalRow ? (
            <div className="sqc-multiplayer-final-reward" aria-label="Final Multiplayer reward proof">
              <Image src={finalSealImage} alt="" width={92} height={92} unoptimized />
              <div>
                <strong>{viewerFinalRow.placement ? "Final reward sealed." : "Final proof saved."}</strong>
                <p>{viewerFinalRow.placement ? "Podium seal earned. This reward appears in your Trophy Cabinet after account sync." : "Final proof recorded. Podium seals are awarded to the top three finishers."}</p>
                <small>{viewerFinalRow.progress} complete · {viewerFinalRow.progress} verified</small>
                {viewerFinalRow.lastProofSummary ? <small>{viewerFinalRow.lastProofSummary}</small> : null}
              </div>
            </div>
          ) : null}
          <GroupQuestShareControls id={quest.id} title={quest.title} isOwner={joinState.kind === "hosted"} shareLabel="Share final result" copyLabel="Copy final link" />
        </section>
      ) : null}

      <aside className="sqc-multiplayer-command-rail" aria-label="Multiplayer Side Quest actions">
      <section className="sqc-native-card sqc-multiplayer-native-card sqc-multiplayer-primary-action">
        <span className="sqc-card-eyebrow">{quest.lifecycle === "finished" ? "Receipts locked" : participating ? "Next action" : signedIn ? "Join first" : "Sign in first"}</span>
        <h2>{quest.lifecycle === "finished" ? "Final standings are frozen." : participating ? "Refresh proof after your next eligible game." : hostedNeedsJoin ? "Join your Multiplayer Side Quest before playing your proof game." : "Join this Multiplayer Side Quest before playing your proof game."}</h2>
        <p>{quest.lifecycle === "finished" ? "The event window has ended, so Side Quest Chess keeps the leaderboard as the final proof record." : participating ? "Side Quest Chess checks only fresh public games inside this Multiplayer window." : "You can inspect the quests and rules below before joining."}</p>
        {quest.lifecycle === "finished" ? null : joinState.kind === "join" || hostedNeedsJoin ? (
          <GroupQuestDirectJoin
            id={quest.id}
            isSignedIn={signedIn}
            buttonClassName="sqc-primary-action"
            buttonLabel={hostedNeedsJoin ? "Join Side Quest" : joinState.label}
          />
        ) : participating ? (
          <>
            <GroupQuestRefreshButton id={quest.id} className="sqc-primary-action" label="Check my latest game" questDetails={quest.questRuleDetails} />
            <GroupQuestLeaveAction id={quest.id} />
          </>
        ) : (
          <Link href={joinState.href} className="sqc-primary-action">{joinState.label}</Link>
        )}
      </section>

      {joinState.kind === "hosted" && quest.lifecycle === "open" ? (
        <section className="sqc-native-card sqc-multiplayer-native-card" aria-label="Host controls">
          <span className="sqc-card-eyebrow">Host controls</span>
          <h2>Manage this Multiplayer Side Quest.</h2>
          <p>Update the invite, schedule, rules, and Side Quest lineup from the exact owner screen.</p>
          <Link href={`/groupquests/${encodeURIComponent(quest.id)}/edit`} className="sqc-detail-secondary-button">Manage Side Quest</Link>
        </section>
      ) : joinState.kind === "hosted" ? (
        <section className="sqc-native-card sqc-multiplayer-native-card" aria-label="Finished Multiplayer owner archive">
          <span className="sqc-card-eyebrow">Owner archive</span>
          <h2>This finished table is locked.</h2>
          <p>You can still share the final result and review player receipts, but settings and player removals are closed after the event window ends.</p>
        </section>
      ) : null}

      {joinState.kind === "hosted" && quest.inviteKey ? (
        <GroupQuestInviteKeyControl inviteKey={quest.inviteKey} />
      ) : null}

      <section className="sqc-native-card sqc-multiplayer-native-card sqc-multiplayer-share-card">
        <span className="sqc-card-eyebrow">Share</span>
        <h2>Send this Multiplayer Side Quest to another player.</h2>
        <GroupQuestShareControls id={quest.id} title={quest.title} isOwner={joinState.kind === "hosted"} />
      </section>
      </aside>

      {quest.lifecycle === "finished" ? (
        <section className="sqc-native-card sqc-multiplayer-native-card sqc-multiplayer-leaderboard" aria-label="Final leaderboard">
          <span className="sqc-card-eyebrow">Final leaderboard</span>
          <h2>Frozen player standings.</h2>
          <div className="sqc-condition-list">
            {quest.leaderboardRows.length ? quest.leaderboardRows.map((row) => (
              <div key={`${row.rank}-${row.name}`} className="sqc-condition-compact-row">
                <span>#{row.rank}</span>
                <div>
                  <strong>{row.name}{row.viewer ? " · You" : ""}</strong>
                  <p>{[row.placement, row.progress, row.provider].filter(Boolean).join(" · ")}</p>
                  <MultiplayerLeaderboardProgress progress={row.progress} />
                  {row.note ? <p className="sqc-multiplayer-proof-note">{row.note}</p> : null}
                </div>
              </div>
            )) : (
              <p>No verified player standings were recorded.</p>
            )}
          </div>
        </section>
      ) : null}

      {!official && quest.hostName ? (
        <section className="sqc-native-card sqc-multiplayer-native-card">
          <span className="sqc-card-eyebrow">Created by</span>
          <h2>Hosted by {quest.hostName}</h2>
          <p>See more public Side Quests from this host when they share them.</p>
          <Link
            href={`/multiplayer-side-quests?tab=community&host=${encodeURIComponent(quest.hostName)}`}
            className="sqc-detail-secondary-button"
          >
            More by host
          </Link>
        </section>
      ) : null}

      {!official && joinState.kind !== "hosted" ? (
        <section className="sqc-native-card sqc-multiplayer-native-card">
          <span className="sqc-card-eyebrow">Community safety</span>
          <h2>Report a problem with this Side Quest.</h2>
          <CommunityMultiplayerReportControl questId={quest.id} title={quest.title} hostName={quest.hostName} status={quest.eventStatus ?? (quest.lifecycle === "finished" ? "Finished" : "Live")} signedIn={signedIn} />
        </section>
      ) : null}

      <section className="sqc-native-card sqc-multiplayer-native-card sqc-multiplayer-quest-list">
        <span className="sqc-card-eyebrow">Quests in this Multiplayer Side Quest</span>
        <h2>{quest.quests.length} Side Quests to complete.</h2>
        <div className="sqc-condition-list">
          {(quest.questRuleDetails ?? quest.quests.map((title, index) => ({
            id: `${index}-${title}`,
            title,
            summary: "Complete this within the Multiplayer Side Quest window.",
            status: undefined,
            imageUrl: null,
            glowColor: undefined,
            ruleLines: ["Follow the saved Side Quest rules."],
          }))).map((detail, index) => (
            <details key={detail.id} className="sqc-multiplayer-rule-detail">
              <summary role="button" className="sqc-condition-compact-row" aria-label={`Open or close rules for ${detail.title}`}>
                <span>{index + 1}</span>
                <div>
                  <strong>{detail.title}</strong>
                  <p>{detail.summary}</p>
                </div>
              </summary>
              <div className="sqc-multiplayer-rule-detail-body">
                <header className="sqc-multiplayer-rule-detail-hero">
                  {detail.imageUrl ? (
                    <span className="sqc-multiplayer-rule-detail-coat" style={{ "--sqc-rule-glow": detail.glowColor ?? "rgba(245, 200, 106, .38)" } as CSSProperties} aria-hidden="true">
                      <Image src={detail.imageUrl} alt="" width={148} height={148} unoptimized />
                    </span>
                  ) : null}
                  <span className="sqc-multiplayer-kicker">Multiplayer Side Quest rules</span>
                  <h2>{detail.title}</h2>
                  <p>{detail.summary}</p>
                  {detail.status ? <span className="sqc-detail-latest-check">{detail.status.toUpperCase()}</span> : null}
                </header>
                <section className="sqc-multiplayer-rule-detail-card">
                  <span className="sqc-card-eyebrow">What counts</span>
                  <h3>Complete this within the Multiplayer Side Quest window.</h3>
                  <ul>
                    {detail.ruleLines.map((line) => <li key={line}>{line}</li>)}
                  </ul>
                </section>
                <section className="sqc-multiplayer-rule-detail-card">
                  <span className="sqc-card-eyebrow">Multiplayer proof</span>
                  <p><strong>Proof:</strong> Use a public game that starts after you joined this Multiplayer Side Quest.</p>
                  <p><strong>Solo Side Quest progress:</strong> Solo Side Quest completions only count here if they were completed during this Multiplayer Side Quest.</p>
                </section>
              </div>
            </details>
          ))}
        </div>
      </section>

      {quest.lifecycle === "open" ? (
        <section className="sqc-native-card sqc-multiplayer-native-card sqc-multiplayer-leaderboard" aria-label="Live leaderboard">
          <span className="sqc-card-eyebrow">Leaderboard</span>
          <h2>{participating ? "Current Multiplayer Side Quest standings." : "Who is in so far."}</h2>
          <div className="sqc-condition-list">
            {quest.leaderboardRows.length ? quest.leaderboardRows.map((row) => (
              <div key={`${row.rank}-${row.name}`} className="sqc-condition-compact-row">
                <span>#{row.rank}</span>
                <div>
                  <strong>{row.name}{row.viewer ? " · You" : ""}</strong>
                  <p>{[row.progress, row.provider].filter(Boolean).join(" · ")}</p>
                  <MultiplayerLeaderboardProgress progress={row.progress} />
                  {row.note ? <p className="sqc-multiplayer-proof-note">{row.note}</p> : null}
                  {row.participantUserId ? (
                    <GroupQuestRemoveParticipantAction
                      id={quest.id}
                      participantUserId={row.participantUserId}
                      participantName={row.name}
                    />
                  ) : null}
                </div>
              </div>
            )) : (
              <p>No players have joined yet.</p>
            )}
          </div>
        </section>
      ) : null}

      <section className="sqc-native-card sqc-multiplayer-native-card sqc-multiplayer-rules">
        <span className="sqc-card-eyebrow">Rules and time</span>
        <div className="sqc-multiplayer-rule-list">
          {quest.rules.map(([label, value]) => (
            <div key={label} className="sqc-multiplayer-rule-row">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MultiplayerLeaderboardProgress({ progress }: { progress: string }) {
  const match = progress.match(/(\d+)\s*\/\s*(\d+)/);
  const done = Number(match?.[1] ?? 0);
  const total = Number(match?.[2] ?? 0);
  const percent = total > 0 ? Math.max(0, Math.min(100, Math.round((done / total) * 100))) : 0;
  return (
    <span className="sqc-multiplayer-progress-track">
      <span
        className="sqc-multiplayer-progress-fill"
        role="progressbar"
        aria-label={`${progress} Side Quests verified`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        style={{ width: `${percent}%` }}
      />
    </span>
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
  desktopNote,
  status,
  href,
  image,
  glow,
  glowColor,
  statusImage,
  sourceBadge,
  likeSummary,
  likeAction,
  desktopMultiplayerFacts,
}: {
  title: string;
  meta: string;
  desktopNote?: string;
  status: string;
  href: string;
  image?: string;
  glow?: string | null;
  glowColor?: string | null;
  statusImage?: string | null;
  sourceBadge?: string | null;
  likeSummary?: CommunityLikeSummary | null;
  likeAction?: {
    signedIn: boolean;
    targetType: "solo" | "multiplayer";
    targetId: string;
    returnTo: string;
  };
  desktopMultiplayerFacts?: {
    players: string;
    quests: string;
    closes: string;
  };
}) {
  const content = (
    <>
      <span className="sqc-row-icon" aria-hidden="true">
        <RowGlow glow={glow} color={glowColor} />
        <Image className="sqc-row-image" alt="" src={image ?? getRowImage(title, href)} width={42} height={42} />
      </span>
      <span className="sqc-row-copy">
        {sourceBadge ? <span className="sqc-row-badge">{sourceBadge}</span> : null}
        <strong className="sqc-row-title-line">
          <span>{title}</span>
          {likeSummary && !likeAction ? <MobileRowLikeSummary summary={likeSummary} label={title} /> : null}
        </strong>
        <small>{meta}</small>
        {desktopMultiplayerFacts ? <MultiplayerRowDetails facts={desktopMultiplayerFacts} /> : null}
        {desktopNote ? (
          <span className="sqc-solo-card-details">
            <span className="sqc-solo-card-note">{desktopNote}</span>
            <span className="sqc-solo-card-open">View quest details <span aria-hidden="true">→</span></span>
          </span>
        ) : null}
      </span>
      {statusImage ? (
        <Image className="sqc-row-status-image" alt="" src={statusImage} width={38} height={38} />
      ) : (
        <span className={`sqc-row-status ${status.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{status}</span>
      )}
    </>
  );

  if (likeSummary && likeAction) {
    return (
      <div className="sqc-app-row sqc-app-row-with-like">
        <Link href={href} className="sqc-app-row-main" aria-label={`Open ${title}`} />
        <span className="sqc-row-icon" aria-hidden="true">
          <RowGlow glow={glow} color={glowColor} />
          <Image className="sqc-row-image" alt="" src={image ?? getRowImage(title, href)} width={42} height={42} />
        </span>
        <span className="sqc-row-copy">
          {sourceBadge ? <span className="sqc-row-badge">{sourceBadge}</span> : null}
          <span className="sqc-row-title-line">
            <strong><span>{title}</span></strong>
            <OfficialSoloLikeControl
              targetType={likeAction.targetType}
              targetId={likeAction.targetId}
              count={likeSummary.count}
              likedByViewer={likeSummary.likedByViewer}
              signedIn={likeAction.signedIn}
              returnTo={likeAction.returnTo}
              label={title}
            />
          </span>
          <small>{meta}</small>
        {desktopMultiplayerFacts ? <MultiplayerRowDetails facts={desktopMultiplayerFacts} /> : null}
          {desktopNote ? (
            <span className="sqc-solo-card-details">
              <span className="sqc-solo-card-note">{desktopNote}</span>
              <span className="sqc-solo-card-open">View quest details <span aria-hidden="true">→</span></span>
            </span>
          ) : null}
        </span>
        {statusImage ? (
          <Image className="sqc-row-status-image" alt="" src={statusImage} width={38} height={38} />
        ) : (
          <span className={`sqc-row-status ${status.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{status}</span>
        )}
      </div>
    );
  }

  return <Link href={href} className="sqc-app-row">{content}</Link>;
}

function MultiplayerRowDetails({ facts }: { facts: { players: string; quests: string; closes: string } }) {
  return (
    <span className="sqc-multiplayer-row-details">
      <span className="sqc-multiplayer-row-facts" aria-label="Tournament facts">
        <span><span>Players</span><strong>{facts.players}</strong></span>
        <span><span>Side Quests</span><strong>{facts.quests}</strong></span>
        <span><span>Closes</span><strong>{facts.closes}</strong></span>
      </span>
      <span className="sqc-multiplayer-row-open">View tournament desk <span aria-hidden="true">→</span></span>
    </span>
  );
}

function RowGlow({ glow, color }: { glow?: string | null; color?: string | null }) {
  if (!glow) return null;
  if (!color) return <Image className="sqc-row-glow" alt="" src={glow} width={50} height={50} />;

  return (
    <span
      className="sqc-row-glow tinted"
      style={{
        "--sqc-row-glow-image": `url("${glow}")`,
        "--sqc-row-glow-color": color ?? "rgba(245,200,106,.38)",
      } as CSSProperties}
    />
  );
}

function MobileRowLikeSummary({ summary, label }: { summary: CommunityLikeSummary; label: string }) {
  const liked = summary.likedByViewer;
  const count = summary.count;

  return (
    <span
      className={liked ? "sqc-row-like liked" : "sqc-row-like"}
      aria-label={`${liked ? "Liked" : "Like"} ${label}. ${count} like${count === 1 ? "" : "s"}.`}
      title={`${count} like${count === 1 ? "" : "s"}`}
    >
      <span aria-hidden="true" />
      <b>{count}</b>
    </span>
  );
}

function getRowImage(title: string, href: string) {
  if (href.includes("multiplayer") || title.toLowerCase().includes("multiplayer")) return mobileAsset.multiplayerSeal;
  if (href.includes("custom") || title.toLowerCase().includes("custom")) return mobileAsset.customCrest;
  if (href.includes("trophy") || title.toLowerCase().includes("coat")) return mobileAsset.coat;
  if (title.toLowerCase().includes("completed")) return mobileAsset.completedSeal;
  return mobileAsset.fallbackBadge;
}

function getConditionLabel(index: number) {
  return `Condition ${index + 1}`;
}

function toMobileAssetPath(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("/badges/custom/")) return path;
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
