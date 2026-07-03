import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Privacy Policy — Side Quest Chess",
  description:
    "Privacy policy for Side Quest Chess, including accounts, public chess-game checks, proof receipts, support requests, and third-party services.",
  openGraph: {
    title: "Privacy Policy — Side Quest Chess",
    description:
      "What Side Quest Chess collects, uses, stores, shares, and deletes.",
    url: "/privacy",
  },
};

const updatedAt = "July 3, 2026";

const summary = [
  {
    label: "Account data",
    value: "Sign-in profile",
    copy: "SQC uses Clerk for authentication and stores the account details needed to recognize your Side Quest Chess profile.",
  },
  {
    label: "Proof checks",
    value: "Public chess games",
    copy: "SQC checks public Lichess and Chess.com game records for the public chess username you save.",
  },
  {
    label: "Progress",
    value: "Quest state",
    copy: "SQC stores active quests, completed quests, proof receipts, Coat of Arms progress, and multiplayer participation.",
  },
  {
    label: "Support",
    value: "Messages you send",
    copy: "SQC stores support messages and issue context so we can answer reports and data requests.",
  },
];

const sections = [
  {
    title: "Information we collect",
    copy:
      "Side Quest Chess collects the account information needed to sign you in, such as the account identifier and profile details provided by the authentication provider. If you use the product, SQC may also store your public chess usernames, runner display name, profile text, active and completed Side Quests, proof attempts, proof receipts, Coat of Arms progress, multiplayer tables, community quest activity, support messages, and basic first-party analytics events.",
  },
  {
    title: "Public chess-game data",
    copy:
      "When you ask SQC to verify a Side Quest, SQC reads recent public game records from the chess site connected to your saved public username. SQC does not ask for, collect, or store Lichess or Chess.com passwords. Those chess platforms control their own game records, account settings, and privacy tools.",
  },
  {
    title: "How we use information",
    copy:
      "SQC uses information to provide sign-in, save your progress, verify Side Quests, show proof receipts, support multiplayer tables, display community content, respond to support requests, protect the service from abuse, debug product issues, and understand whether core product flows are working.",
  },
  {
    title: "What can become public",
    copy:
      "Public proof links, public multiplayer tables, community Side Quests, public player names, quest titles, proof summaries, timestamps, and public chess-game references may be visible to other people. Do not publish a proof link, table, or community quest if you do not want that information viewed by others.",
  },
  {
    title: "Third-party services",
    copy:
      "SQC may rely on third-party services for authentication, hosting, app distribution, crash or platform diagnostics, and public chess-game access. These services have their own privacy policies and may process information under their own terms. SQC is independent from Lichess, Chess.com, Apple, Google, Clerk, and hosting providers.",
  },
  {
    title: "Analytics and diagnostics",
    copy:
      "SQC may collect limited first-party product events such as page path, device type, action type, and feature status so we can improve reliability and understand product usage. SQC should not include chess-site passwords, private invite codes, raw custom quest configuration, or support-message text in analytics events.",
  },
  {
    title: "Data deletion and support",
    copy:
      "You can request help deleting SQC-controlled account data, saved chess usernames, progress, proof receipts, public proof links, or support messages by using the support page. To identify the account, include the account email or profile details connected to your request. Third-party chess sites control their own account and game-record deletion tools.",
  },
  {
    title: "Children",
    copy:
      "Side Quest Chess is not intentionally directed to children under 13. If you believe a child provided personal information to SQC without appropriate consent, contact support so we can review and remove SQC-controlled data where required.",
  },
  {
    title: "Security and retention",
    copy:
      "SQC uses reasonable technical and organizational safeguards for account and product data. No service can guarantee perfect security. SQC keeps data for as long as needed to provide the product, maintain proof history, handle support, meet legal obligations, and protect the service, unless deletion is requested and legally permitted.",
  },
  {
    title: "Changes to this policy",
    copy:
      "We may update this privacy policy as Side Quest Chess changes. The updated date on this page shows when the policy was last revised. Continued use after an update means the revised policy applies.",
  },
];

export default async function PrivacyPage() {
  const { userId } = await auth();

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="support" />

      <div className="content-wrap">
        <section className="hero-card terms-hero">
          <span className="eyebrow">Privacy Policy</span>
          <h1>Public games, private account basics.</h1>
          <p className="hero-copy">
            Side Quest Chess checks public chess games, stores your SQC progress, and keeps support requests focused on what we need to fix or delete things. Last updated: {updatedAt}.
          </p>
          <div className="button-row hero-actions">
            <Link href="/support" className="button primary">Open support</Link>
            <Link href="/terms" className="button secondary">Terms of Use</Link>
          </div>
        </section>

        <section className="grid" aria-label="Privacy summary">
          {summary.map((item) => (
            <article className="stat-card mission-card" key={item.label}>
              <span className="eyebrow">{item.label}</span>
              <h3>{item.value}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </section>

        <section className="terms-section-list" aria-label="Privacy Policy sections">
          {sections.map((section) => (
            <article className="mission-card terms-section-card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.copy}</p>
            </article>
          ))}
        </section>

        <section className="note-card terms-note-card">
          <strong>Need a privacy or deletion review?</strong>
          <p>Use support and include the account email or profile details needed to identify the SQC account, proof link, or public item.</p>
          <div className="button-row">
            <Link href="/support" className="button primary">Open support</Link>
            <Link href="/connect" className="button secondary">Manage chess username</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
