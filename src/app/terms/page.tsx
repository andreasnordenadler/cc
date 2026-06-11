import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Terms of Use — Side Quest Chess",
  description: "Basic terms of use for Side Quest Chess, including public-game proof checks, accounts, fair use, and limitations.",
  openGraph: {
    title: "Terms of Use — Side Quest Chess",
    description: "Basic terms of use for Side Quest Chess.",
    url: "/terms",
  },
};

const sections = [
  {
    title: "Use Side Quest Chess for entertainment.",
    copy: "Side Quest Chess is a playful chess challenge site. Side quests, points, coats of arms, proof receipts, and leaderboards are for fun, bragging rights, and community competition — not financial, professional, or official chess ratings advice.",
  },
  {
    title: "Only public chess data is checked.",
    copy: "Proof checks use public Lichess or Chess.com game records connected to the public username you provide. Do not enter or share chess-site passwords with Side Quest Chess. You are responsible for making sure the username you connect is yours or one you are allowed to use.",
  },
  {
    title: "Proof receipts can be wrong.",
    copy: "Side Quest Chess tries to read public game records accurately, but verifier logic, third-party data, delays, outages, or unusual games can produce incorrect passed, failed, or pending results. We may correct, remove, or adjust receipts, points, quests, and leaderboard entries when needed.",
  },
  {
    title: "Play fairly and do not abuse the service.",
    copy: "Do not use Side Quest Chess to harass others, submit misleading information, attack the service, spam proof checks, bypass limits, scrape aggressively, or interfere with other users. You are also responsible for following Lichess, Chess.com, and other third-party rules when playing games there.",
  },
  {
    title: "Your account and content.",
    copy: "You are responsible for activity on your account. If you share proof cards, usernames, screenshots, or other content, you confirm you have the right to share it and that it does not violate laws, platform rules, or anyone else’s rights.",
  },
  {
    title: "Third-party services are separate.",
    copy: "Side Quest Chess may link to or read public information from third-party chess services, authentication providers, and hosting providers. Those services are not controlled by Side Quest Chess and have their own terms, privacy policies, uptime, and data practices.",
  },
  {
    title: "Side Quest Chess is independent.",
    copy: "Side Quest Chess is not affiliated with, endorsed by, sponsored by, or officially connected to Lichess, Chess.com, FIDE, or any other chess platform or governing body. Names such as Lichess and Chess.com are used only to describe where public games may be played and checked.",
  },
  {
    title: "Public proof sharing is visible.",
    copy: "If you share a proof card or public proof link, people with that link may see the quest title, coat of arms, points, proof summary, timestamp, and public chess-game reference included in the receipt. Do not share proof you do not want others to view.",
  },
  {
    title: "Data deletion requests.",
    copy: "If you want help removing SQC account data, saved chess usernames, proof receipts, or public proof links controlled by Side Quest Chess, use the support page and include the account email or profile details needed to identify the request. Third-party chess sites control their own game records.",
  },
  {
    title: "No warranties.",
    copy: "Side Quest Chess is provided as-is and as-available. We do not promise uninterrupted access, perfect accuracy, permanent storage, specific features, or that every quest can always be verified from every public game source.",
  },
  {
    title: "Limits on liability.",
    copy: "To the fullest extent allowed by law, Side Quest Chess is not liable for indirect, incidental, special, consequential, or punitive damages, or for lost data, lost profits, lost rankings, unavailable services, third-party platform issues, or incorrect proof results.",
  },
  {
    title: "Changes and access.",
    copy: "We may update quests, points, coats of arms, verification rules, leaderboards, these terms, or access to the service as the product evolves. Continued use after changes means you accept the updated terms.",
  },
];

export default async function TermsPage() {
  const { userId } = await auth();

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="support" />

      <div className="content-wrap">
        <section className="hero-card terms-hero">
          <span className="eyebrow">Terms of Use</span>
          <h1>Simple rules for the chaos.</h1>
          <p className="hero-copy">
            Side Quest Chess is built for ridiculous chess challenges, public-game proof receipts, and friendly competition. These terms set the basic guardrails for using it.
          </p>
          <div className="button-row hero-actions">
            <Link href="/support" className="button primary">Support & privacy</Link>
            <Link href="/rules" className="button secondary">Proof rules</Link>
          </div>
        </section>

        <section className="mission-card terms-guide-card" aria-label="Terms quick guide">
          <div>
            <span className="eyebrow">Before you run</span>
            <h2>Keep the quest fair, public, and easy to fix.</h2>
            <p>
              The short version: play on your own public chess account, let SQC check only the public game record, and ask for help when a receipt or report needs review.
            </p>
          </div>
          <div className="terms-guide-steps" aria-label="Terms highlights">
            <div>
              <strong>1. Connect a real proof source</strong>
              <span>Lichess or Chess.com usernames power the verifier checks.</span>
            </div>
            <div>
              <strong>2. Share only receipts you want public</strong>
              <span>Proof links can show quest, reward, timestamp, and game context.</span>
            </div>
            <div>
              <strong>3. Report messy results</strong>
              <span>Support can review unclear checks, account requests, or community issues.</span>
            </div>
          </div>
        </section>

        <section className="terms-section-list" aria-label="Terms of Use sections">
          {sections.map((section) => (
            <article className="mission-card terms-section-card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.copy}</p>
            </article>
          ))}
        </section>

        <section className="note-card terms-note-card">
          <strong>Need a human review?</strong>
          <p>Use support for proof receipts, account data requests, community reports, or privacy questions.</p>
          <div className="button-row">
            <Link href="/support" className="button primary">Open support</Link>
            <Link href="/verifiers" className="button secondary">Verifier board</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
