import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShareProofActions from "@/components/share-proof-actions";
import SiteNav from "@/components/site-nav";
import VictoryScroll from "@/components/victory-scroll";
import { decodePublicProof, publicProofImagePath } from "@/lib/proof-share";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const decoded = await decodePublicProof(token);

  if (!decoded) {
    return { title: "Side Quest Chess proof" };
  }

  const image = publicProofImagePath(token);
  const title = `${decoded.payload.badgeName} unlocked — Side Quest Chess`;
  const description = `${decoded.payload.challengeTitle} completed for +${decoded.payload.reward} points.`;

  return {
    title,
    description,
    alternates: { canonical: `/proof/${token}` },
    openGraph: {
      title,
      description,
      url: `/proof/${token}`,
      siteName: "Side Quest Chess",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: `${decoded.payload.challengeTitle} victory proof scroll` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PublicProofPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const decoded = await decodePublicProof(token);

  if (!decoded?.challenge) {
    notFound();
  }

  const { payload, challenge } = decoded;
  const dateLabel = formatScrollDate(payload.completedGameAt ?? payload.checkedAt);
  const achievementCopy = buildPublicAchievementCopy(payload.challengeId, payload.summary);
  const shareCopy = `${payload.runnerName ? `${payload.runnerName} completed` : "I completed"} “${payload.challengeTitle}” on Side Quest Chess. ${payload.badgeName} unlocked. +${payload.reward} points.`;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={false} active="result" />

      <div className="content-wrap public-proof-wrap">
        <section className="hero-card public-proof-hero">
          <span className="eyebrow">Public victory proof</span>
          <h1>{payload.badgeName} unlocked.</h1>
          <p className="hero-copy">
            {payload.runnerName ? `${payload.runnerName} completed` : "A player completed"} {payload.challengeTitle} on Side Quest Chess. This link is the shareable proof receipt.
          </p>
          <div className="button-row">
            <Link href="/challenges" className="button primary">Browse Side Quests</Link>
            <Link href={publicProofImagePath(token)} className="button secondary">Open proof image</Link>
          </div>
        </section>

        <section className="mission-card public-proof-scroll-card" aria-label="Shareable victory scroll">
          <VictoryScroll
            challenge={challenge}
            badgeName={payload.badgeName}
            achievementCopy={achievementCopy}
            proofLine={<>Proof accepted: <strong>{payload.challengeTitle}</strong> — {payload.summary}</>}
            dateLabel={dateLabel}
            reward={payload.reward}
            className="proof-victory-scroll public-proof-scroll"
          />
        </section>

        <section className="mission-card proof-details-section">
          <span className="eyebrow">Share this proof</span>
          <h2>Public link and image preview.</h2>
          <p className="proof-details-line">{payload.challengeTitle} completed · {dateLabel}</p>
          <ShareProofActions
            copy={shareCopy}
            challengeTitle={payload.challengeTitle}
            sharePath={`/proof/${token}`}
            copyLabel="Copy proof link"
            shareLabel="Share proof"
            idleCopy=""
          >
            <Link href={publicProofImagePath(token)} className="button secondary">Proof image</Link>
          </ShareProofActions>
        </section>
      </div>
    </main>
  );
}

function buildPublicAchievementCopy(challengeId: string, summary: string) {
  if (challengeId === "finish-any-game") {
    return "A public chess game was, against all odds, completed. Win, loss, or draw — the clerks checked the paperwork and declared this good enough for a coat of arms.";
  }

  return `${summary} The verifier accepted the evidence, so the coat of arms may now be displayed with entirely appropriate smugness.`;
}

function formatScrollDate(value?: string) {
  if (!value) return "Recorded by the suspicious little verifier";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recorded by the suspicious little verifier";

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
