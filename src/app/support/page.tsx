import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Support — Side Quest Chess",
  description:
    "Side Quest Chess private-beta support: what to send when a quest receipt, chess identity, badge, or share card feels wrong.",
  openGraph: {
    title: "Support — Side Quest Chess",
    description:
      "A simple support packet for private-beta testers reporting confusing Side Quest Chess receipts, quests, badges, or account setup.",
    url: "/support",
  },
};

const supportPackets = [
  {
    label: "Wrong receipt",
    title: "A quest passed or failed incorrectly",
    copy: "Send the quest name, chess provider, username, game link, and whether the receipt felt passed, failed, pending, or unclear.",
  },
  {
    label: "Setup friction",
    title: "Connecting a chess identity was confusing",
    copy: "Send the route you were on, which provider you tried, the visible error/copy that confused you, and whether you expected to use Lichess or Chess.com.",
  },
  {
    label: "Share/badge glitch",
    title: "A proof card, badge, or invite looked off",
    copy: "Send the page URL, quest name, screenshot if possible, and what looked stale, broken, too serious, or not Side-Quest-Chess enough.",
  },
];

const quickFacts = [
  {
    label: "Use",
    value: "public chess evidence",
    copy: "SQC checks public game data for the username you provide. It never needs your Lichess or Chess.com password.",
  },
  {
    label: "Best report",
    value: "quest + game link",
    copy: "The fastest report names the quest, provider, username, latest game link, receipt status, and one sentence about what felt wrong.",
  },
  {
    label: "Beta goal",
    value: "confusion removal",
    copy: "Private beta support is for catching unclear rules, unfair receipts, account friction, and share-card rough edges before wider launch.",
  },
];

export default async function SupportPage() {
  const { userId } = await auth();

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="support" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Private beta support</span>
          <h1>When a quest feels wrong, send the useful bits.</h1>
          <p className="hero-copy">
            Side Quest Chess is still being hardened for friends/private beta. This page turns rough edges into actionable reports without asking testers to write a novel.
          </p>
          <div className="button-row hero-actions">
            <Link href="/account" className="button primary">Check account setup</Link>
            <Link href="/result" className="button pink">Review latest receipt</Link>
            <Link href="/rules" className="button secondary">Read proof rules</Link>
            <Link href="/beta" className="button secondary">Beta guide</Link>
          </div>
        </section>

        <section className="grid" aria-label="Support basics">
          {quickFacts.map((fact) => (
            <Fact key={fact.label} label={fact.label} value={fact.value} copy={fact.copy} />
          ))}
        </section>

        <section className="big-grid" aria-label="What to send">
          {supportPackets.map((packet) => (
            <article className="mission-card" key={packet.label}>
              <span className="eyebrow">{packet.label}</span>
              <h2>{packet.title}</h2>
              <p>{packet.copy}</p>
            </article>
          ))}
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Copy / paste report</span>
              <h2>A small packet beats a vague “it broke”.</h2>
            </div>
            <span className="badge gold">beta-friendly</span>
          </div>
          <pre className="receipt-copy" aria-label="Copyable support report template">{`Quest:
Provider: Lichess / Chess.com
Username:
Game link:
Receipt status: passed / failed / pending / unclear
What felt wrong:
Screenshot attached: yes / no`}</pre>
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
