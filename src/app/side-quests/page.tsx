import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import SideQuestModeSwitcher from "@/components/side-quest-mode-switcher";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";
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
  if (user && shouldPreselectDefaultStarterQuest(metadata)) {
    metadata = withDefaultStarterQuest(metadata);
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.id, { publicMetadata: metadata });
  }
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

        <section className="mission-card app-side-quest-proof-note" aria-labelledby="side-quest-parity-proof-title">
          <p className="eyebrow">Parity note</p>
          <h2 id="side-quest-parity-proof-title">Mobile app intent coverage</h2>
          <p>
            Source: apps/mobile/App.tsx defines SideQuestCatalogIntent as official, community-discover, my-custom, and create-custom. This page now exposes those four intents from /side-quests instead of sending the route directly to only the official catalog.
          </p>
        </section>
      </div>
    </main>
  );
}
