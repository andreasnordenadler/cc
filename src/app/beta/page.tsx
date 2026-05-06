import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";

export const metadata: Metadata = {
  title: "Private beta — Side Quest Chess",
  description:
    "Side Quest Chess private beta notes: what is ready to test, what data is used, and how to report rough edges.",
  openGraph: {
    title: "Private beta — Side Quest Chess",
    description:
      "A clear friends/private beta test path for weird chess side quests, live receipts, and honest verifier feedback.",
    url: "/beta",
  },
};

const betaChecklist = [
  {
    title: "Connect a chess identity",
    copy: "Add either chess username. Every current quest now works on Lichess or Chess.com, so beta testers can use their real chess home instead of hunting for a provider-specific quest.",
    href: "/connect",
    action: "Connect username",
  },
  {
    title: "Choose your first quest",
    copy: "The private beta now offers easy, trouble, and badass starting picks before people browse the full chaos deck.",
    href: "/challenges",
    action: "Open quest picks",
  },
  {
    title: "Create one honest receipt",
    copy: "Play normal games elsewhere, return to SQC, and use latest-game checking to produce a passed, failed, or pending proof card.",
    href: "/account",
    action: "Open test drive",
  },
];

const trustNotes = [
  {
    label: "Data used",
    value: "Public chess evidence only",
    copy: "SQC reads public Lichess or Chess.com game metadata/move text for the username you provide, then stores your SQC profile choices and proof receipts.",
  },
  {
    label: "Not used",
    value: "No chess-site passwords",
    copy: "Do not enter your Lichess or Chess.com password here. The beta uses usernames and public game records, not account credentials from those sites.",
  },
  {
    label: "Support",
    value: "Tell Andreas what broke",
    copy: "For this friends/private beta, send rough edges, confusing copy, wrong verifier outcomes, or badge/UI glitches directly to Andreas with the quest name and game link. The support page spells out the minimum useful report.",
  },
];

export default async function BetaPage() {
  const { userId } = await auth();
  const beginnerCount = CHALLENGES.filter((challenge) => challenge.category === "Beginner").length;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="beta" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Friends / private beta</span>
          <h1>Test the weird quests before the public launch push.</h1>
          <p className="hero-copy">
            Side Quest Chess is in private-beta hardening: clear onboarding, honest latest-game verification, readable proof cards, and no launch-marketing pressure until the first-user flow feels properly solid.
          </p>
          <div className="button-row hero-actions">
            <Link href="/account" className="button primary">Open My Side Quests</Link>
            <Link href="/challenges" className="button pink">Pick first quest</Link>
            <Link href="/verifiers" className="button secondary">See live verifiers</Link>
            <Link href="/rules" className="button secondary">Read proof rules</Link>
            <Link href="/support" className="button secondary">Support & privacy</Link>
          </div>
        </section>

        <section className="grid" aria-label="Private beta status">
          <Fact label="Launch posture" value="private beta" copy="The product should feel useful and legible for friends before any wider public launch push." />
          <Fact label="First quest picks" value={`${beginnerCount} quests`} copy="The first-run picks offer easier, abnormal, win-required quests before people jump into peak chaos." />
          <Fact label="Verifier posture" value="full dual-host deck" copy="All ten current quests can produce latest-game receipts from Lichess or Chess.com today." />
        </section>

        <section className="big-grid" aria-label="Private beta checklist">
          {betaChecklist.map((item, index) => (
            <article className="mission-card" key={item.title}>
              <span className="eyebrow">Beta step {index + 1}</span>
              <h2>{item.title}</h2>
              <p>{item.copy}</p>
              <Link href={item.href} className="button secondary">{item.action}</Link>
            </article>
          ))}
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Trust basics</span>
              <h2>What beta testers should know before connecting.</h2>
            </div>
            <span className="badge gold">no password sharing</span>
          </div>
          <div className="grid">
            {trustNotes.map((item) => (
              <Fact key={item.label} label={item.label} value={item.value} copy={item.copy} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Fact({ label, value, copy }: { label: string; value: string; copy: string }) {
  return (
    <article className="stat-card mission-card">
      <span className="eyebrow">{label}</span>
      <h3>{value}</h3>
      <p>{copy}</p>
    </article>
  );
}
