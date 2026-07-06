import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import ChallengeDeckBrowser from "@/components/challenge-deck-browser";
import SideQuestModeSwitcher from "@/components/side-quest-mode-switcher";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
import { getCommunityLikeSummaries } from "@/lib/community-likes";
import { getCustomSideQuests } from "@/lib/custom-side-quests";
import {
  getActiveChallenge,
  getChallengeProgress,
  shouldPreselectDefaultStarterQuest,
  type UserMetadataRecord,
  withDefaultStarterQuest,
} from "@/lib/user-metadata";

const playableOfficialCount = CHALLENGES.filter(
  (challenge) => !challenge.id.includes("coming-soon"),
).length;

const sideQuestIntents = [
  {
    label: "Official Side Quests",
    title: "Official Side Quests",
    copy: "SQC-built Solo Side Quests with automatic proof checks and coat-of-arms rewards.",
    href: "/solo",
    badge: `${playableOfficialCount} playable`,
    image: "/sqc-logo-v11.png",
  },
  {
    label: "Community Side Quests",
    title: "Community Side Quests",
    copy: "Player-made public Solo Side Quests with creator context, likes, and discovery filters.",
    href: "/community",
    badge: "Discover",
    image: "/badges/custom/clean/custom-coat-knight-gold.png",
  },
  {
    label: "My Custom Side Quests",
    title: "My Custom Side Quests",
    copy: "Your saved custom Side Quests, drafts, published rules, and archived ideas.",
    href: "/custom",
    badge: "Library",
    image: "/badges/custom/clean/custom-coat-rook-silver.png",
  },
  {
    label: "Create Custom Side Quest",
    title: "Create Custom Side Quest",
    copy: "Start the Custom Side Quest builder path from the same Side Quests surface.",
    href: "/create-custom-side-quest",
    badge: "Create",
    image: "/badges/custom/custom-win-queen.png",
  },
];

export default async function SideQuestsPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  let metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const client = await clerkClient();
  if (user && shouldPreselectDefaultStarterQuest(metadata)) {
    metadata = withDefaultStarterQuest(metadata);
    await client.users.updateUserMetadata(user.id, { publicMetadata: metadata });
  }
  const likeSummaries = await getCommunityLikeSummaries(client, userId);
  const officialLikeSummaries = Object.fromEntries(
    CHALLENGES.map((challenge) => [
      challenge.id,
      likeSummaries.get("solo", challenge.id),
    ]),
  );
  const privateMetadata = user?.privateMetadata ? (user.privateMetadata as UserMetadataRecord) : {};
  const progress = getChallengeProgress(metadata);
  const completedSet = new Set(progress.completedChallengeIds);
  const completedCount = progress.completedChallengeIds.length;
  const activeQuest = getActiveChallenge(metadata);
  const activeOfficialQuest = activeQuest?.id
    ? CHALLENGES.find((challenge) => challenge.id === activeQuest.id) ?? null
    : null;
  const customSideQuests = user
    ? getCustomSideQuests(privateMetadata).length
      ? getCustomSideQuests(privateMetadata)
      : getCustomSideQuests(metadata)
    : [];
  const activeCustomQuest = activeQuest?.id
    ? customSideQuests.find((quest) => quest.id === activeQuest.id) ?? null
    : null;
  const activeQuestTitle = activeOfficialQuest?.title ?? activeCustomQuest?.title ?? null;
  const activeQuestHref = activeOfficialQuest
    ? `/challenges/${activeOfficialQuest.id}`
    : activeCustomQuest
      ? "/custom"
      : "/solo";
  const activeQuestImage = activeOfficialQuest?.badgeIdentity.image
    ?? activeCustomQuest?.badgeImageUrl
    ?? "/badges/custom/clean/custom-coat-knight-gold.png";
  const activeQuestCompleted = activeQuest?.id ? completedSet.has(activeQuest.id) : false;
  const activeQuestMeta = activeQuestTitle
    ? activeQuestCompleted
      ? "Completed Side Quest"
      : "Active Side Quest"
    : "No active Side Quest";
  const activeIncompleteChallengeId = activeOfficialQuest && !completedSet.has(activeOfficialQuest.id)
    ? activeOfficialQuest.id
    : undefined;

  return (
    <main className="site-shell challenges-page-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="solo" />

      <div className="content-wrap challenges-page-wrap app-side-quest-hub">
        <section className="challenges-clean-hero app-side-quest-hub-hero" aria-labelledby="side-quests-title">
          <div>
            <span className="eyebrow">Side Quests</span>
            <h1 id="side-quests-title">Choose your next Side Quest.</h1>
            <p>
              Pick one Side Quest, play on Lichess or Chess.com, then come back for automatic proof.
            </p>
            <div className="app-side-quest-stats" aria-label="Solo Side Quest status">
              <span>{playableOfficialCount} available</span>
              <span>{completedCount} completed</span>
              <span>{activeQuestTitle && !activeQuestCompleted ? "1 active" : "none active"}</span>
            </div>
          </div>
          <div className="app-side-quest-emblem" aria-hidden="true">
            <Image
              alt=""
              height={180}
              priority
              src="/sqc-logo-v11.png"
              width={180}
            />
          </div>
        </section>

        <section className="mission-card app-side-quest-current" aria-labelledby="side-quest-current-title">
          <div className="app-side-quest-current-copy">
            <span className="eyebrow">Current Side Quest</span>
            <h2 id="side-quest-current-title">{activeQuestTitle ?? "No active Solo Side Quest yet"}</h2>
            <p>
              {activeQuestTitle
                ? "Open the current Side Quest to review its rule, check proof, or switch to a different challenge."
                : "Start with the official deck, browse community rules, or build your own custom Side Quest."}
            </p>
            <div className="button-row">
              <Link className="button primary" href={activeQuestHref}>
                {activeQuestTitle ? "Open current Side Quest" : "Browse Official Side Quests"}
              </Link>
              <Link className="button secondary" href="/create-custom-side-quest">
                Build a Side Quest
              </Link>
            </div>
          </div>
          <Link className="app-side-quest-current-badge" href={activeQuestHref} aria-label={activeQuestTitle ? `Open ${activeQuestTitle}` : "Open Solo Side Quests"}>
            <Image alt="" height={94} src={activeQuestImage} width={94} />
            <span>{activeQuestMeta}</span>
          </Link>
        </section>

        <SideQuestModeSwitcher active="official" />

        <section className="app-side-quest-intents" aria-label="Side Quest catalog paths">
          {sideQuestIntents.map((intent) => (
            <Link className="app-side-quest-intent" href={intent.href} key={intent.label}>
              <span className="app-side-quest-intent-image" aria-hidden="true">
                <Image alt="" height={72} src={intent.image} width={72} />
              </span>
              <span className="app-side-quest-intent-copy">
                <span>{intent.label}</span>
                <strong>{intent.title}</strong>
                <small>{intent.copy}</small>
              </span>
              <span className="app-side-quest-intent-badge">{intent.badge}</span>
            </Link>
          ))}
        </section>

        <section className="official-side-quest-deck" aria-labelledby="official-side-quest-deck-title">
          <div className="solo-deck-app-heading">
            <span className="eyebrow">Solo Side Quest deck</span>
            <h2 id="official-side-quest-deck-title">Tap a Coat of Arms to review the rule.</h2>
            <p>
              This is the official mobile deck on the web tab destination, with active and completed state carried from your SQC account.
            </p>
          </div>
          <ChallengeDeckBrowser
            challenges={CHALLENGES}
            activeChallengeId={activeIncompleteChallengeId}
            completedChallengeIds={progress.completedChallengeIds}
            likeSummaries={officialLikeSummaries}
            signedIn={Boolean(userId)}
          />
        </section>

        <section className="mission-card app-side-quest-proof-note" aria-labelledby="side-quest-parity-proof-title">
          <p className="eyebrow">Parity note</p>
          <h2 id="side-quest-parity-proof-title">Mobile app intent coverage</h2>
          <p>
            Source: apps/mobile/App.tsx defines SideQuestCatalogIntent as official, community-discover, my-custom, and create-custom. This page exposes those four intents and keeps the official Solo deck on the same app-style Side Quests screen.
          </p>
        </section>
      </div>
    </main>
  );
}
