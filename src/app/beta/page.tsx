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
      "A clear friends/private beta test loop for weird chess side quests, live receipts, and honest verifier feedback.",
    url: "/beta",
  },
};

const betaChecklist = [
  {
    title: "Connect a chess identity",
    copy: "Add either chess username. Every current starter-deck quest now works on Lichess or Chess.com, so beta testers can use their real chess home instead of hunting for a provider-specific dare.",
    href: "/connect",
    action: "Connect username",
  },
  {
    title: "Start with the beginner path",
    copy: "The private beta path now opens with three survivable but still weird win-required quests before the full chaos deck.",
    href: "/path",
    action: "Open path",
  },
  {
    title: "Create one honest receipt",
    copy: "Play normal games elsewhere, return to SQC, and use latest-game checking to produce a passed, failed, or pending proof card.",
    href: "/account",
    action: "Open test drive",
  },
];


const fiveMinuteScript = [
  {
    title: "1. Add one username",
    copy: "Open Connect, save either a Lichess or Chess.com username, and confirm the account page shows the saved identity before starting a quest.",
    href: "/connect",
    action: "Save identity",
  },
  {
    title: "2. Pick a survivable weird win",
    copy: "Use the beginner path if you want the cleanest first pass, or pick any deck quest now that the full set has dual-host latest-game checking.",
    href: "/path",
    action: "Choose quest",
  },
  {
    title: "3. Bring back one receipt",
    copy: "After a real game, return to Account and run latest-game verification. A good beta report says whether the proof card passed, failed honestly, or got confusing.",
    href: "/account",
    action: "Verify latest game",
  },
];


const feedbackBrief = [
  {
    label: "Challenge",
    copy: "Name the dare you tested and whether you used the beginner path, account quest launcher, or challenge page.",
  },
  {
    label: "Chess source",
    copy: "Say Lichess or Chess.com, include the public username, and paste the game link if the receipt looked wrong.",
  },
  {
    label: "Receipt outcome",
    copy: "Report passed, failed, or pending, then add one sentence on whether the result felt fair and understandable.",
  },
  {
    label: "Screenshot",
    copy: "If anything is confusing, send a screenshot of the account preflight, result card, or verifier copy that caused the confusion.",
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
    copy: "For this friends/private beta, send rough edges, confusing copy, wrong verifier outcomes, or badge/UI glitches directly to Andreas with the challenge name and game link.",
  },
];

export default async function BetaPage() {
  const { userId } = await auth();
  const beginnerCount = CHALLENGES.filter((challenge) => challenge.category === "Beginner").length;
  const fullDeckCount = CHALLENGES.length;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="beta" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Friends / private beta</span>
          <h1>Test the weird loop before the public launch push.</h1>
          <p className="hero-copy">
            Side Quest Chess is in private-beta hardening: clear onboarding, honest latest-game verification, readable proof cards, and no launch-marketing pressure until the first-user flow feels properly solid.
          </p>
          <div className="button-row hero-actions">
            <Link href="/account" className="button primary">Run the beta checklist</Link>
            <Link href="/path" className="button pink">Try beginner path</Link>
            <Link href="/verifiers" className="button secondary">See live verifiers</Link>
            <Link href="/rules" className="button secondary">Read proof rules</Link>
          </div>
        </section>

        <section className="grid" aria-label="Private beta status">
          <Fact label="Launch posture" value="private beta" copy="The product should feel useful and legible for friends before any wider public launch push." />
          <Fact label="Beginner path" value={`${beginnerCount} quests`} copy="The first-run path starts with easier, abnormal, win-required dares instead of throwing people straight into peak chaos." />
          <Fact label="Verifier posture" value="full dual-host deck" copy="All ten current starter-deck quests can produce latest-game receipts from Lichess or Chess.com today." />
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
              <span className="eyebrow">5-minute tester script</span>
              <h2>Give friends one exact loop to run, not a vague app tour.</h2>
            </div>
            <span className="badge green">identity → quest → receipt</span>
          </div>
          <p>
            If a tester only has a few minutes, this is the smallest useful pass: connect one public chess identity, choose one win-required dare, then bring back one latest-game receipt and report where the loop felt unclear.
          </p>
          <div className="big-grid" aria-label="Five-minute private beta tester script">
            {fiveMinuteScript.map((item) => (
              <article className="mission-card" key={item.title}>
                <span className="eyebrow">Tester script</span>
                <h2>{item.title}</h2>
                <p>{item.copy}</p>
                <Link href={item.href} className="button secondary">{item.action}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Live beta deck</span>
              <h2>All {fullDeckCount} starter-deck quests are dual-host now.</h2>
            </div>
            <span className="badge green">Lichess + Chess.com</span>
          </div>
          <p>
            This is the current private-beta proof surface: every listed quest can be made active, played on either supported chess site, and checked from latest public games without a pasted PGN or game URL.
          </p>
          <div className="grid">
            {CHALLENGES.map((challenge) => (
              <article className="fact" key={challenge.id}>
                <span>{challenge.category} · {challenge.difficulty}</span>
                <strong>{challenge.title}</strong>
                <p>{challenge.objective}</p>
                <Link href={`/challenges/${challenge.id}`} className="button secondary">Open rules</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Feedback packet</span>
              <h2>Tell testers exactly what useful feedback looks like.</h2>
            </div>
            <span className="badge blue">challenge · source · receipt</span>
          </div>
          <p>
            Private-beta reports should be small but diagnostic: one tested dare, one chess source, one receipt outcome, and the exact place where the loop became unclear.
          </p>
          <div className="grid" aria-label="Useful private beta feedback packet">
            {feedbackBrief.map((item) => (
              <article className="fact" key={item.label}>
                <span>Include</span>
                <strong>{item.label}</strong>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
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
