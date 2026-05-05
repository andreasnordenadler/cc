import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

export const metadata: Metadata = {
  title: "SQC alternate logo test — Side Quest Chess",
  description:
    "Internal visual test surface for the alternate ornate SQC top-bar logo treatment before any final navigation use.",
  robots: { index: false, follow: false },
};

const assetPath = "/brand/sqc-alt-logo-topbar-transparent.png";

export default async function BrandTestPage() {
  const { userId } = await auth();

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="home" />

      <div className="content-wrap">
        <section className="hero-card brand-test-hero">
          <span className="eyebrow">Internal brand test</span>
          <h1>Alternate SQC top-bar logo treatment.</h1>
          <p className="hero-copy">
            This page tests the ornate logo Andreas supplied as a cropped transparent PNG. It is deliberately not wired into the production nav yet.
          </p>
          <div className="button-row hero-actions">
            <Link href={assetPath} className="button primary">Open transparent PNG</Link>
            <Link href="/challenges" className="button secondary">Back to Quest Hub</Link>
          </div>
        </section>

        <section className="card brand-test-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Top-bar size</span>
              <h2>Navigation-height preview</h2>
              <p>Rendered as a small lockup inside a sticky-nav-sized strip, without changing the real site nav.</p>
            </div>
          </div>
          <div className="brand-test-nav-strip" aria-label="Alternate SQC logo top-bar preview">
            <Image src={assetPath} alt="Ornate SQC alternate logo transparent crop" width={720} height={362} priority />
            <nav className="brand-test-fake-links" aria-label="Preview links">
              <span>Home</span>
              <span>Quests</span>
              <span>Quests</span>
              <span>Today</span>
            </nav>
          </div>
        </section>

        <section className="grid">
          <article className="card brand-test-swatch brand-test-swatch-dark">
            <span className="eyebrow">Dark nav</span>
            <Image src={assetPath} alt="Alternate SQC logo on dark background" width={720} height={362} />
          </article>
          <article className="card brand-test-swatch brand-test-swatch-gold">
            <span className="eyebrow">Gold glow</span>
            <Image src={assetPath} alt="Alternate SQC logo on gold background" width={720} height={362} />
          </article>
          <article className="card brand-test-swatch brand-test-swatch-light">
            <span className="eyebrow">Light edge check</span>
            <Image src={assetPath} alt="Alternate SQC logo on light background" width={720} height={362} />
          </article>
        </section>

        <section className="note-card">
          <strong>QA note</strong>
          <p>
            Source JPEG background was a baked checkerboard. The prepared PNG is cropped to the logo bounds with transparent background for review before any final top-bar/nav use.
          </p>
        </section>
      </div>
    </main>
  );
}
