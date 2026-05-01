import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Support & privacy — Side Quest Chess",
  description:
    "Private-beta support, public-game-data privacy notes, and what to send when a Side Quest Chess verifier looks wrong.",
  openGraph: {
    title: "Support & privacy — Side Quest Chess",
    description:
      "What Side Quest Chess reads, what it never asks for, and how private-beta testers should report verifier or setup issues.",
    url: "/support",
  },
};

const supportSteps = [
  {
    label: "Issue type",
    value: "Setup, receipt, rule, or UI",
    copy: "Name the exact thing that felt wrong: saving a username, starting a quest, reading a pass/fail/pending receipt, understanding a rule, or spotting a visual bug.",
  },
  {
    label: "Chess context",
    value: "Public username + site",
    copy: "Say whether the test used Lichess or Chess.com, include the public username, and add the latest public game link if the verifier result seemed unfair.",
  },
  {
    label: "Expected result",
    value: "What should have happened?",
    copy: "For verifier issues, say whether you expected passed, failed, or pending. For setup/UI issues, say which next action was unclear.",
  },
];

const privacyNotes = [
  {
    label: "Reads",
    value: "Public chess games",
    copy: "When you ask for proof, SQC checks recent public games for the Lichess or Chess.com username saved on your SQC profile.",
  },
  {
    label: "Stores",
    value: "SQC profile choices",
    copy: "The beta stores your SQC sign-in profile, saved chess usernames, active quest, badges, points, and proof receipts so the loop can continue across sessions.",
  },
  {
    label: "Never asks for",
    value: "Chess-site passwords",
    copy: "Do not enter a Lichess or Chess.com password into SQC. The beta is username-based and public-game based; no chess-site credential sharing is needed.",
  },
];

export default async function SupportPage() {
  const { userId } = await auth();

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="support" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Support & privacy</span>
          <h1>Funny dares, boringly clear trust rules.</h1>
          <p className="hero-copy">
            Side Quest Chess private beta should be easy to test without guessing what data is used or what to send back when a receipt looks odd.
          </p>
          <div className="button-row hero-actions">
            <Link href="/beta" className="button primary">Open beta guide</Link>
            <Link href="/connect" className="button pink">Connect username</Link>
            <Link href="/rules" className="button secondary">Read proof rules</Link>
          </div>
        </section>

        <section className="grid" aria-label="Support summary">
          <Fact label="Best report" value="Challenge + site + receipt" copy="One useful report names the quest, chess site, public username, receipt outcome, and first confusing moment." />
          <Fact label="Privacy posture" value="public game data only" copy="SQC checks public games from a saved username. It does not need chess-site passwords, PGN uploads, or engine analysis." />
          <Fact label="Beta contact" value="send it to Andreas" copy="During friends/private beta, route confusing receipts, broken flows, and UI glitches directly to Andreas with the details below." />
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">What to send</span>
              <h2>Make every support note diagnosable in one pass.</h2>
            </div>
            <span className="badge green">private beta</span>
          </div>
          <p>
            Reports should be lightweight, but not vague. These three fields are enough for Sam to reproduce the problem or decide whether the copy needs work.
          </p>
          <div className="grid">
            {supportSteps.map((item) => (
              <Fact key={item.label} label={item.label} value={item.value} copy={item.copy} />
            ))}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Data basics</span>
              <h2>What SQC reads, stores, and never needs.</h2>
            </div>
            <span className="badge gold">no password sharing</span>
          </div>
          <div className="grid">
            {privacyNotes.map((item) => (
              <Fact key={item.label} label={item.label} value={item.value} copy={item.copy} />
            ))}
          </div>
        </section>

        <section className="note-card">
          <strong>Need a quick route back?</strong>
          <p>Start from the beta guide, choose a quest, then return to the result page after a real game so the receipt can explain passed, failed, or pending.</p>
          <div className="button-row">
            <Link href="/challenges" className="button primary">Choose a quest</Link>
            <Link href="/result" className="button secondary">View receipt</Link>
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
