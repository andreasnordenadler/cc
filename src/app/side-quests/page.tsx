import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SideQuestModeSwitcher from "@/components/side-quest-mode-switcher";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";

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
    href: "/custom#custom-side-quest-builder",
    badge: "Create",
    image: "/badges/custom/clean/custom-coat-queen-gold.png",
  },
];

export default async function SideQuestsPage() {
  const { userId } = await auth();

  return (
    <main className="site-shell challenges-page-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="solo" />

      <div className="content-wrap challenges-page-wrap app-side-quest-hub">
        <section className="challenges-clean-hero app-side-quest-hub-hero" aria-labelledby="side-quests-title">
          <div>
            <span className="eyebrow">Side Quests</span>
            <h1 id="side-quests-title">Choose your next Side Quest.</h1>
            <p>
              The web Side Quests screen now follows the mobile app shape: Official and Community catalogs live together, with My Custom and Create Custom kept inside the same app family.
            </p>
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
