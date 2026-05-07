import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProofImage from "@/components/proof-image";
import ProofTime from "@/components/proof-time";
import ShareProofActions from "@/components/share-proof-actions";
import SiteNav from "@/components/site-nav";
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
      images: [{ url: image, width: 1200, height: 1600, alt: `${decoded.payload.challengeTitle} victory proof scroll` }],
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

  const { payload } = decoded;
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

        <section className="mission-card public-proof-scroll-card" aria-label="Shareable victory scroll image">
          <ProofImage
            imagePath={publicProofImagePath(token)}
            alt={`Victory scroll image for ${payload.challengeTitle}`}
            className="proof-generated-image public-proof-image"
          />
        </section>

        <section className="mission-card proof-details-section">
          <span className="eyebrow">Share this proof</span>
          <h2>Public link and image preview.</h2>
          <p className="proof-details-line">{payload.challengeTitle} completed · <ProofTime value={payload.completedGameAt ?? payload.checkedAt} /></p>
          <ShareProofActions
            copy={shareCopy}
            challengeTitle={payload.challengeTitle}
            sharePath={`/proof/${token}`}
            imagePath={publicProofImagePath(token)}
            shareLabel="Share proof"
          />
        </section>
      </div>
    </main>
  );
}

