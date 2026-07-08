import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MobileAppWebShell from "@/components/mobile-app-web-shell";
import ProofImage from "@/components/proof-image";
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
  const title = `${decoded.payload.challengeTitle} completed — Side Quest Chess`;
  const description = `${decoded.payload.badgeName} unlocked on Side Quest Chess.`;

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
      images: [{ url: image, width: 1200, height: 630, alt: `${decoded.payload.challengeTitle} victory proof card` }],
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

  if (!decoded) {
    notFound();
  }

  const { payload } = decoded;

  return (
    <MobileAppWebShell activeTab="sideQuests" signedIn={false}>
      <div className="sqc-stack">
        <section className="sqc-native-card">
          <span className="sqc-card-eyebrow">Victory scroll</span>
          <h1>{payload.challengeTitle}</h1>
          <h2>The clerks accept this proof.</h2>
          <p>{payload.badgeName} unlocked</p>
        </section>

        <section className="sqc-native-card" aria-label="Victory scroll">
          <ProofImage imagePath={publicProofImagePath(token)} alt={`Victory scroll image for ${payload.challengeTitle}`} className="sqc-proof-image" />
        </section>

        <section className="sqc-native-card">
          <span className="sqc-card-eyebrow">Receipt details</span>
          <h2>Latest verified proof</h2>
          <p>The app keeps the same proof receipt data as your SQC account: provider, game reference, final move, completion time, and canonical proof link when available.</p>
          <div className="sqc-action-pair one-or-two">
            <Link href={publicProofImagePath(token)} className="sqc-secondary-action">Share proof</Link>
            <Link href="/side-quests" className="sqc-primary-action">Browse Solo Side Quests</Link>
          </div>
        </section>
      </div>
    </MobileAppWebShell>
  );
}
