import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import SupportContactForm from "@/components/support-contact-form";

export const metadata: Metadata = {
  title: "Support & privacy — Side Quest Chess",
  description:
    "Support and privacy notes for Side Quest Chess: public-game checks, proof receipts, account setup, and what to send when something looks wrong.",
  openGraph: {
    title: "Support & privacy — Side Quest Chess",
    description:
      "What Side Quest Chess reads, what it never asks for, and how to report proof or account issues.",
    url: "/support",
  },
};

const supportTopics = [
  {
    label: "Proof receipts",
    value: "Passed, failed, or pending",
    copy: "If a receipt looks wrong, include the quest name, chess site, public username, game link, and what result you expected.",
  },
  {
    label: "Account setup",
    value: "Public username only",
    copy: "Side Quest Chess only needs your public Lichess or Chess.com username to check recent public games.",
  },
  {
    label: "Quest rules",
    value: "One weird rule at a time",
    copy: "Every quest page explains the exact condition. If a rule feels unclear, send the quest name and the confusing line.",
  },
];

const privacyNotes = [
  {
    label: "Reads",
    value: "Public chess games",
    copy: "When you run a proof check, SQC reads recent public games for the Lichess or Chess.com username saved on your profile.",
  },
  {
    label: "Stores",
    value: "SQC progress",
    copy: "SQC stores your sign-in profile, saved chess usernames, active quest, points, coat-of-arms progress, and proof receipts.",
  },
  {
    label: "Never asks for",
    value: "Chess-site passwords",
    copy: "Never enter a Lichess or Chess.com password into SQC. Proof checks are username-based and public-game based.",
  },
];

export default async function SupportPage() {
  const { userId } = await auth();

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="support" />

      <div className="content-wrap">
        <section className="hero-card support-launch-hero">
          <h1>Support & privacy.</h1>
          <p className="hero-copy">
            Side Quest Chess checks public chess games, saves your quest progress, and turns completed nonsense into proof receipts. Here is the simple version of what to do when something looks wrong — and what data SQC does, and does not, need.
          </p>
          <div className="button-row hero-actions">
            <Link href="/challenges" className="button primary">Browse quests</Link>
            <Link href="/connect" className="button secondary">Connect chess username</Link>
            <Link href="/rules" className="button secondary">Read proof rules</Link>
            <Link href="/terms" className="button secondary">Terms of Use</Link>
          </div>
        </section>

        <section className="grid" aria-label="Support topics">
          {supportTopics.map((item) => (
            <Fact key={item.label} label={item.label} value={item.value} copy={item.copy} />
          ))}
        </section>

        <section className="mission-card support-simple-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Contact us</span>
              <h2>Send the smallest useful proof packet.</h2>
            </div>
          </div>
          <p>
            Include the quest name, chess site, public username, game link if relevant, the receipt result you saw, and what you expected instead. A screenshot helps if the issue is visual.
          </p>
          <SupportContactForm />
        </section>

        <section className="mission-card support-simple-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Data basics</span>
              <h2>Public games only. No password nonsense.</h2>
            </div>
            <span className="badge gold">privacy first</span>
          </div>
          <div className="grid">
            {privacyNotes.map((item) => (
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
