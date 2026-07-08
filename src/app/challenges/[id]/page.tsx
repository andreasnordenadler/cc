import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import MobileAppWebShell from "@/components/mobile-app-web-shell";
import { CHALLENGES, getChallengeById } from "@/lib/challenges";
import { getChessComUsername, getLichessUsername, getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export function generateStaticParams() {
  return CHALLENGES.map((challenge) => ({ id: challenge.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const challenge = getChallengeById(id);

  if (!challenge) {
    return {
      title: "Side Quest Chess quest",
    };
  }

  return {
    title: `${challenge.title} — Side Quest Chess`,
    description: challenge.objective,
  };
}

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const challenge = getChallengeById(id);

  if (!challenge) {
    notFound();
  }

  const user = await currentUser();
  const metadata = user?.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const displayName = user
    ? getPreferredRunnerName(metadata, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      }) || "Side Quest Chess"
    : null;
  const badgePath = toMobileAssetPath(challenge.badgeIdentity.image) ?? "/mobile-source/badges/v6/proof-loop-test-badge.png";

  return (
    <MobileAppWebShell
      activeTab="sideQuests"
      signedIn={Boolean(user)}
      displayName={displayName}
      lichessUsername={getLichessUsername(metadata)}
      chessComUsername={getChessComUsername(metadata)}
    >
      <div className="sqc-stack">
        <section className="sqc-multiplayer-detail-hero">
          <span className="sqc-section-mark trophy" aria-hidden="true">
            <Image className="sqc-mark-image" alt="" src={badgePath} width={112} height={112} priority />
          </span>
          <span className="sqc-multiplayer-kicker">Solo Side Quests</span>
          <h1>{challenge.title}</h1>
          <p>{challenge.objective}</p>
        </section>

        <section className="sqc-native-card">
          <span className="sqc-card-eyebrow">Proof</span>
          <h2>No qualifying game yet</h2>
          <p>Next step: play a new public game on your connected chess account, then tap Check my latest game again.</p>
          <div className="sqc-option-grid">
            <ProofStep number="1" text="Play a new public game on your connected chess account." />
            <ProofStep number="2" text="Complete your Side Quest during that game." />
            <ProofStep number="3" text="Come back here and tap Check my latest game." />
          </div>
          <div className="sqc-action-pair one-or-two">
            <Link href="/account" className="sqc-secondary-action">Start this Side Quest</Link>
            <Link href="/account" className="sqc-primary-action">Check my latest game</Link>
          </div>
        </section>

        <section className="sqc-native-card">
          <span className="sqc-card-eyebrow">How to complete it</span>
          <h2>What must happen?</h2>
          <p>{challenge.instruction ?? challenge.proofCallout ?? challenge.objective}</p>
          <div className="sqc-option-grid">
            {challenge.conditions.map((condition) => (
              <div className="sqc-option-card" key={condition}>
                <span aria-hidden="true" />
                <strong>{condition}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MobileAppWebShell>
  );
}

function ProofStep({ number, text }: { number: string; text: string }) {
  return (
    <div className="sqc-option-card">
      <span aria-hidden="true">{number}</span>
      <strong>{text}</strong>
    </div>
  );
}

function toMobileAssetPath(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("/mobile-source/")) return path;
  if (path.startsWith("/badges/") || path.startsWith("/stamps/")) return `/mobile-source${path}`;
  return path;
}
