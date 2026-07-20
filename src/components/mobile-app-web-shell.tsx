import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import OfficialSoloLikeControl from "./official-solo-like-control";
import { MobileSupportComposer, type MobileWebSupportMessage } from "./mobile-support-composer";
import type { CommunityLikeSummary } from "@/lib/community-likes";
import type { Challenge } from "@/lib/challenges";
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
import ActiveSoloActions from "./active-solo-actions";
import GroupQuestRefreshButton from "./group-quest-refresh-button";
import GroupQuestShareControls from "./group-quest-share-controls";
import GroupQuestLeaveAction from "./group-quest-leave-action";
import GroupQuestRemoveParticipantAction from "./group-quest-remove-participant-action";
import CommunityMultiplayerReportControl from "./community-multiplayer-report-control";
import GroupQuestInviteKeyControl from "./group-quest-invite-key-control";
import type { CustomEditQuestInput } from "@/lib/mobile-create-forms";
import type { WebSupportAccountContext } from "@/lib/web-support-diagnostics";
import MobileWebHamburgerMenu from "./mobile-web-hamburger-menu";

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
  activeMultiplayerRows?: ActiveMultiplayerHomeRow[];
  theme?: MobileWebShellTheme | null;
  trophyRows?: TrophyRow[];
  completedSoloCount?: number;
  proofReceiptCount?: number;
  modalPresentation?: boolean;
  immersivePresentation?: boolean;
  controlsOnlyHeader?: boolean;
  closeHref?: string;
  children?: ReactNode;
};

type ActiveSoloHome = {
  id: string;
  href?: string | null;
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
  source?: "multiplayer" | "officialMultiplayer" | "communityMultiplayer" | "solo";
};

type CommunitySideQuestRow = {
  id: string;
  title: string;
  meta: string;
  href: string;
  image?: string | null;
  sourceBadge?: string | null;
  status?: string | null;
  updatedAtMs: number;
  popularityScore: number;
  likeCount: number;
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
  { id: "privacy", label: "Privacy Policy", href: "/privacy", icon: "shield" },
];

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

  return (
    <main
      className={[
        "sqc-mobile-web",
        immersivePresentation ? "immersive" : "",
        controlsOnlyHeader ? "controls-only" : "",
        signedIn ? "signed-in" : "signed-out",
      ].filter(Boolean).join(" ")}
      data-source="active-mobile-today-dashboard"
      style={shellStyle}
    >
      <div className="sqc-mobile-backdrop" aria-hidden="true" />

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
      ) : immersivePresentation ? null : activeTab === "home" ? (
        <header className="sqc-app-header guest">
          <h1>Side Quest Chess</h1>
        </header>
      ) : null}

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
      {!signedIn && !modalPresentation && !immersivePresentation ? (
        <GuestNavigation activeTab={activeTab} />
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
    { label: "Sign in", href: "/sign-in", active: false },
  ];

  return (
    <nav aria-label="Guest menu" className="sqc-guest-nav">
      {items.map((item) => (
        <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined}>
          {item.label}
        </Link>
      ))}
    </nav>
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
          <span>SQC needs Lichess or Chess.com before it can check real games.</span>
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
        {activeSolo ? <ActiveSoloActions /> : null}
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

      <section className="sqc-home-section first">
        <Link href={activeMultiplayerRows[0]?.href ?? "/multiplayer"} className="sqc-section-hero" aria-label="Open active Multiplayer Side Quest details">
          <MobileAssetMark className="sqc-section-mark group" image={mobileAsset.multiplayerSeal} glow={mobileAsset.coatGlow} size={100} glowSize={142} />
          <p className="sqc-pill">Active Multiplayer Side Quests</p>
          <h2>{activeMultiplayerRows.length ? `${activeMultiplayerRows.length} active Multiplayer Side Quest${activeMultiplayerRows.length === 1 ? "" : "s"}` : "No active Multiplayer Side Quests"}</h2>
        </Link>
        {activeMultiplayerRows.length ? (
          <div className="sqc-row-list trophy-preview">
            {activeMultiplayerRows.map((row) => (
              <AppRow key={row.id} title={row.title} meta={row.meta} status={row.status} sourceBadge={row.sourceBadge} href={row.href} />
            ))}
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
          {trophyRows.length ? trophyRows.map((row) => (
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
}: {
  challenges: Challenge[];
  activeChallengeId?: string | null;
  completedChallengeIds?: string[];
  likeSummaries?: Record<string, CommunityLikeSummary>;
  signedIn?: boolean;
}) {
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

  return (
    <div className="sqc-stack sqc-catalog-screen">
      <div className="sqc-screen-emblem solo" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image" alt="" src={mobileAsset.coat} width={132} height={148} priority />
      </div>

      <div className="sqc-brand-tabs sqc-solo-brand-tabs" role="tablist" aria-label="Solo Side Quest catalog">
        <Link href="/side-quests" className="sqc-brand-tab official active" role="tab" aria-selected="true">Official Side Quests</Link>
        <Link href="/community-side-quests" className="sqc-brand-switch" data-icon="swap-horizontal" aria-label="Switch to Community Side Quests">
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
              glowColor={challenge.badgeIdentity.colors.glow}
              likeSummary={likeSummaries?.[challenge.id]}
              likeAction={{
                signedIn,
                targetType: "solo",
                targetId: challenge.id,
                returnTo: "/side-quests",
              }}
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

export function MobileCreateCustomScreen({ signedIn = false, initialQuest = null }: { signedIn?: boolean; initialQuest?: CustomEditQuestInput | null }) {
  return (
    <div className="sqc-stack sqc-create-custom-screen">
      <section className="sqc-multiplayer-detail-hero sqc-custom-builder-hero">
        <MobileAssetMark className="sqc-section-mark custom" image={mobileAsset.customCrest} glow={mobileAsset.coatGlow} size={112} glowSize={152} />
        <span className="sqc-multiplayer-kicker">Custom Side Quest</span>
        <h1>{initialQuest ? "Edit your Side Quest." : "Build your Side Quest."}</h1>
        <p>{initialQuest ? "Update the saved proof conditions without changing who owns this Side Quest." : "Choose what should happen in a real game. SQC will check it after you play."}</p>
      </section>
      <MobileCustomCreateForm key={initialQuest?.id ?? "new-custom-side-quest"} signedIn={signedIn} initialQuest={initialQuest} />
    </div>
  );
}

export function MobileSupportScreen({
  signedIn = false,
  supportMessages = [],
  accountContext = null,
}: {
  signedIn?: boolean;
  supportMessages?: MobileWebSupportMessage[];
  accountContext?: WebSupportAccountContext | null;
}) {
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
        <p><strong>Web app</strong></p>
        <p>{accountContext ? `Signed in as ${accountContext.displayName ?? "SQC player"}.` : "Not signed in."}</p>
        <p>Lichess: {accountContext?.lichessUsername ?? "not connected"} · Chess.com: {accountContext?.chessComUsername ?? "not connected"}</p>
        <p>Active Solo: {accountContext?.activeSoloQuestTitle ?? "none"} · Active Multiplayer: {accountContext?.activeMultiplayerQuestCount ?? 0} · Public hosted: {accountContext?.publicHostedMultiplayerQuestCount ?? 0}</p>
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

      {signedIn ? (
        <MobileSupportComposer signedIn initialMessages={supportMessages} accountContext={accountContext} />
      ) : (
        <section className="sqc-support-card sqc-support-report" aria-label="Report a problem">
          <span className="sqc-card-eyebrow">Report a problem</span>
          <h3>Support messages require a signed-in SQC account.</h3>
          <p>Anonymous messages are not accepted by the support API. Sign in so your note and any reply stay attached to your account.</p>
          <Link href="/sign-in?redirect_url=/support" className="sqc-primary-action">Sign in to message support</Link>
        </section>
      )}
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
  const officialMultiplayerRows = trophyRows.filter((row) => row.source === "officialMultiplayer" || row.source === "multiplayer");
  const communityMultiplayerRows = trophyRows.filter((row) => row.source === "communityMultiplayer");
  const multiplayerRows = [...officialMultiplayerRows, ...communityMultiplayerRows];
  const soloRows = trophyRows.filter((row) => row.source === "solo" || !row.source);
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
        <h2>{unlockedCount ? `${unlockedCount} unlocked: ${completedSoloCount} Official Solo Side Quest${completedSoloCount === 1 ? "" : "s"} · ${officialMultiplayerRows.length} Official Multiplayer Side Quest${officialMultiplayerRows.length === 1 ? "" : "s"} · ${communityMultiplayerRows.length} Community Multiplayer Side Quest${communityMultiplayerRows.length === 1 ? "" : "s"} · ${customRewardCount} custom reward${customRewardCount === 1 ? "" : "s"}` : "No unlocked trophies yet."}</h2>
        <p>
          {unlockedCount
            ? "This is your unified Side Quest Chess reward shelf. Official Solo coats and Official Multiplayer podiums are highlighted first; community and custom rewards still belong here."
            : "Complete any Official Solo Side Quest, Custom Solo Side Quest, or Multiplayer Side Quest and it will appear on this shelf."}
        </p>
      </section>

      <section className="sqc-native-card" aria-label="Official Multiplayer Side Quest trophies">
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

      <section className="sqc-native-card" aria-label="Community Multiplayer Side Quest trophies">
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
        <h2>{completedSoloCount} of {officialSoloCount} official Side Quest coats unlocked.</h2>
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
  return (
    <div className="sqc-stack sqc-community-solo-screen">
      <div className="sqc-screen-emblem" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image" alt="" src={mobileAsset.coat} width={132} height={148} priority />
      </div>

      <div className="sqc-brand-tabs sqc-solo-brand-tabs" role="tablist" aria-label="Solo Side Quest catalog">
        <Link href="/side-quests" className="sqc-brand-tab official" role="tab" aria-selected="false">
          Official Side Quests
        </Link>
        <Link href="/side-quests" className="sqc-brand-switch" data-icon="swap-horizontal" aria-label="Switch to Official Side Quests"><span aria-hidden="true" /></Link>
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

        <CommunitySoloCatalog rows={rows} signedIn={signedIn} />
      </section>
    </div>
  );
}

export function MobileCommunitySideQuestDetailScreen({
  quest,
  signedIn,
  ownedByYou = false,
  activeQuestId,
  likeSummary = { count: 0, likedByViewer: false },
}: {
  quest: CommunitySideQuestDetail;
  signedIn: boolean;
  ownedByYou?: boolean;
  activeQuestId?: string | null;
  likeSummary?: CommunityLikeSummary;
}) {
  const badge = toMobileAssetPath(quest.badgeImageUrl) ?? mobileAsset.customCrest;
  const totalSolo = quest.stats.soloAttempts + quest.stats.soloSelections + quest.stats.soloCompletions;

  return (
    <div className="sqc-stack sqc-community-detail-screen">
      <section className="sqc-multiplayer-detail-hero sqc-community-detail-hero">
        <MobileAssetMark className="sqc-section-mark community" image={badge} glow={mobileAsset.coatGlow} size={118} glowSize={144} />
        <span className="sqc-detail-latest-check">{ownedByYou ? "Your Community Solo Side Quest" : "Community Solo Side Quest"}</span>
        <h1>{quest.title}</h1>
        <p>{quest.summary}</p>
        <small>Ready · Public</small>
      </section>

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

      <section className="sqc-native-card sqc-multiplayer-native-card">
        <span className="sqc-card-eyebrow">{activeQuestId === quest.id ? "Active now" : signedIn ? "Pick first" : "Sign in first"}</span>
        <h2>{activeQuestId === quest.id ? "This is your active Solo Side Quest." : signedIn ? "Pick this Side Quest before playing your proof game." : "Sign in to pick this Community Solo Side Quest."}</h2>
        <p>{activeQuestId === quest.id ? "Play a fresh public game, then return to check your proof." : "Your account keeps active Side Quests, usernames, proof checks, and trophies in sync."}</p>
      </section>

      <div className="sqc-community-detail-actions" aria-label="Community Solo Side Quest actions">
        <CommunitySoloPickControl questId={quest.id} signedIn={signedIn} activeQuestId={activeQuestId} />
        <CommunitySoloSocialActions questId={quest.id} title={quest.title} signedIn={signedIn} initialCount={likeSummary.count} initiallyLiked={likeSummary.likedByViewer} />
        <Link href="/community-side-quests" className="sqc-detail-quiet-button">Back to list</Link>
        <Link href={quest.creatorBrowsePath} className="sqc-detail-secondary-button">More by {quest.creatorName}</Link>
        {signedIn ? <Link href={`/create-multiplayer-side-quest?quest=${encodeURIComponent(quest.id)}`} className="sqc-detail-secondary-button">Use in Multiplayer</Link> : null}
        <CommunitySoloShareControls id={quest.id} title={quest.title} />
      </div>
    </div>
  );
}

export function MobileCustomSideQuestsScreen({
  rows,
  localDrafts,
}: {
  rows: CustomSideQuestLibraryRow[];
  localDrafts?: ReactNode;
}) {
  return (
    <div className="sqc-stack sqc-custom-library-screen">
      <div className="sqc-screen-emblem" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image" alt="" src={mobileAsset.coat} width={132} height={148} priority />
      </div>

      <div className="sqc-brand-tabs sqc-solo-brand-tabs" role="tablist" aria-label="Solo Side Quest catalog">
        <Link href="/side-quests" className="sqc-brand-tab official" role="tab" aria-selected="false">
          Official Side Quests
        </Link>
        <Link href="/side-quests" className="sqc-brand-switch" data-icon="swap-horizontal" role="tab" aria-selected="false" aria-label="Switch to Official Side Quests"><span aria-hidden="true" /></Link>
        <Link href="/community-side-quests" className="sqc-brand-tab community active" role="tab" aria-selected="true">
          Community Side Quests
        </Link>
      </div>

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
}: {
  selectedTab: "official" | "community";
  signedIn: boolean;
  officialRows: MobileWebMultiplayerPreview[];
  communityRows: MobileWebMultiplayerPreview[];
  communityHost?: string | null;
  previousOfficialRows?: MobileWebMultiplayerResult[];
  earlierOfficialWeeks?: MobileWebOfficialWeek[];
}) {
  return (
    <div className="sqc-stack">
      <div className="sqc-screen-emblem" aria-hidden="true">
        <Image className="sqc-screen-emblem-glow" alt="" src={mobileAsset.coatGlow} width={166} height={176} priority />
        <Image className="sqc-screen-emblem-image multiplayer" alt="" src={mobileAsset.multiplayerSeal} width={118} height={118} priority />
      </div>

      <div className="sqc-brand-tabs sqc-multiplayer-brand-tabs" role="tablist" aria-label="Multiplayer Side Quest catalog">
        <Link
          href="/multiplayer-side-quests"
          className={selectedTab === "official" ? "sqc-brand-tab official active" : "sqc-brand-tab official"}
          role="tab"
          aria-selected={selectedTab === "official"}
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
          role="tab"
          aria-selected={selectedTab === "community"}
        >
          Community Side Quests
        </Link>
      </div>

      {selectedTab === "official"
        ? <OfficialMultiplayerPanel signedIn={signedIn} rows={officialRows} previousOfficialRows={previousOfficialRows ?? []} earlierOfficialWeeks={earlierOfficialWeeks ?? []} />
        : <CommunityMultiplayerPanel signedIn={signedIn} rows={communityRows} initialHost={communityHost} />}
    </div>
  );
}

function OfficialMultiplayerPanel({
  signedIn,
  rows,
  previousOfficialRows,
  earlierOfficialWeeks,
}: {
  signedIn: boolean;
  rows: MobileWebMultiplayerPreview[];
  previousOfficialRows: MobileWebMultiplayerResult[];
  earlierOfficialWeeks: MobileWebOfficialWeek[];
}) {
  return (
    <>
      <section className="sqc-panel list" aria-label="SQC Official Multiplayer Side Quests">
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
              />
            ))}
          </div>
        ) : (
          <div className="sqc-empty-panel standalone">
            <strong>No official Multiplayer Side Quests are open.</strong>
            <span>The next official cycle will appear here when it opens.</span>
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
                  <AppRow
                    key={week.id}
                    title={week.title}
                    meta={week.meta}
                    status="Results"
                    href={week.href}
                    image={mobileAsset.multiplayerSeal}
                    sourceBadge="Archive"
                  />
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

function CommunityMultiplayerPanel({ signedIn, rows, initialHost }: { signedIn: boolean; rows: MobileWebMultiplayerPreview[]; initialHost?: string | null }) {
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

      <CommunityMultiplayerCatalog rows={rows} signedIn={signedIn} initialHost={initialHost} />

      {signedIn ? (
        <section className="sqc-native-card green" aria-label="Create Multiplayer Side Quest fast action">
          <span className="sqc-card-eyebrow">Create</span>
          <h2>Create a Community Multiplayer Side Quest.</h2>
          <p>Pick up to four Side Quests, set the time window, then share the table with players.</p>
          <Link href="/create-multiplayer-side-quest" className="sqc-primary-action">Create Multiplayer Side Quest</Link>
        </section>
      ) : null}

      <section className="sqc-native-card green" aria-label="Join private Multiplayer Side Quest">
        <span className="sqc-card-eyebrow">Invite Code</span>
        <h2>Join private Multiplayer Side Quest.</h2>
        <p>Paste an invite code from the host to join a private Multiplayer Side Quest.</p>
        <GroupQuestInviteKeyJoin isSignedIn={signedIn} />
      </section>
    </>
  );
}

export function MobileCreateMultiplayerScreen({ signedIn = false, quests = [], communityUnavailable = false, initialQuestId }: { signedIn?: boolean; quests?: MultiplayerCreateQuest[]; communityUnavailable?: boolean; initialQuestId?: string }) {
  return (
    <div className="sqc-stack sqc-create-multiplayer-screen">
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
  const official = quest.sourceBadge === "SQC Official";
  const joinState = getMultiplayerJoinState({ questId: quest.id, signedIn, status: quest.status });
  const participating = joinState.kind === "joined" || (joinState.kind === "hosted" && quest.viewerJoined === true);
  const hostedNeedsJoin = joinState.kind === "hosted" && !participating;
  const viewerFinalRow = quest.leaderboardRows.find((row) => row.viewer);
  const finalResultTitle = viewerFinalRow?.placement
    ? `${viewerFinalRow.placement} finish.`
    : viewerFinalRow
      ? `Final place #${viewerFinalRow.rank}.`
      : "Final leaderboard frozen.";

  return (
    <div className="sqc-stack sqc-multiplayer-public-detail-screen">
      <section className="sqc-multiplayer-detail-hero">
        <MobileAssetMark className="sqc-section-mark group" image={mobileAsset.multiplayerSeal} glow={mobileAsset.coatGlow} size={116} glowSize={146} />
        <span className="sqc-multiplayer-kicker">{official ? "SQC Official Multiplayer Side Quest" : "Community Multiplayer Side Quest"}</span>
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
          <GroupQuestShareControls id={quest.id} title={quest.title} isOwner={joinState.kind === "hosted"} shareLabel="Share final result" copyLabel="Copy final link" />
        </section>
      ) : null}

      <section className="sqc-native-card sqc-multiplayer-native-card">
        <span className="sqc-card-eyebrow">{quest.lifecycle === "finished" ? "Receipts locked" : participating ? "Next action" : signedIn ? "Join first" : "Sign in first"}</span>
        <h2>{quest.lifecycle === "finished" ? "Final standings are frozen." : participating ? "Refresh proof after your next eligible game." : hostedNeedsJoin ? "Join your Multiplayer Side Quest before playing your proof game." : "Join this Multiplayer Side Quest before playing your proof game."}</h2>
        <p>{quest.lifecycle === "finished" ? "The event window has ended, so SQC keeps the leaderboard as the final proof record." : participating ? "SQC checks only fresh public games inside this Multiplayer window." : "You can inspect the quests and rules below before joining."}</p>
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
      ) : null}

      {joinState.kind === "hosted" && quest.inviteKey ? (
        <GroupQuestInviteKeyControl inviteKey={quest.inviteKey} />
      ) : null}

      <section className="sqc-native-card sqc-multiplayer-native-card">
        <span className="sqc-card-eyebrow">Share</span>
        <h2>Send this Multiplayer Side Quest to another player.</h2>
        <GroupQuestShareControls id={quest.id} title={quest.title} isOwner={joinState.kind === "hosted"} />
      </section>

      {quest.lifecycle === "finished" ? (
        <section className="sqc-native-card sqc-multiplayer-native-card" aria-label="Final leaderboard">
          <span className="sqc-card-eyebrow">Final leaderboard</span>
          <h2>Frozen player standings.</h2>
          <div className="sqc-condition-list">
            {quest.leaderboardRows.length ? quest.leaderboardRows.map((row) => (
              <div key={`${row.rank}-${row.name}`} className="sqc-condition-compact-row">
                <span>#{row.rank}</span>
                <div>
                  <strong>{row.name}{row.viewer ? " · You" : ""}</strong>
                  <p>{[row.placement, row.progress, row.provider].filter(Boolean).join(" · ")}</p>
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
          <CommunityMultiplayerReportControl questId={quest.id} title={quest.title} signedIn={signedIn} />
        </section>
      ) : null}

      <section className="sqc-native-card sqc-multiplayer-native-card">
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
        <section className="sqc-native-card sqc-multiplayer-native-card" aria-label="Live leaderboard">
          <span className="sqc-card-eyebrow">Leaderboard</span>
          <h2>{participating ? "Current Multiplayer Side Quest standings." : "Who is in so far."}</h2>
          <div className="sqc-condition-list">
            {quest.leaderboardRows.length ? quest.leaderboardRows.map((row) => (
              <div key={`${row.rank}-${row.name}`} className="sqc-condition-compact-row">
                <span>#{row.rank}</span>
                <div>
                  <strong>{row.name}{row.viewer ? " · You" : ""}</strong>
                  <p>{[row.progress, row.provider].filter(Boolean).join(" · ")}</p>
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

      <section className="sqc-native-card sqc-multiplayer-native-card">
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
  glowColor,
  statusImage,
  sourceBadge,
  likeSummary,
  likeAction,
}: {
  title: string;
  meta: string;
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
