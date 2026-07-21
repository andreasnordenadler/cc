import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — Side Quest Chess",
  description: "Launch-draft terms for using the Side Quest Chess website and mobile app.",
};

const LAST_UPDATED = "July 21, 2026";

export default function TermsPage() {
  return (
    <main className="privacy-page">
      <article className="privacy-policy" aria-labelledby="terms-title">
        <header className="privacy-hero">
          <Link className="privacy-back" href="/">← Side Quest Chess</Link>
          <span className="privacy-kicker">Side Quest Chess</span>
          <h1 id="terms-title">Terms of Use</h1>
          <p className="privacy-lede">These launch-draft terms describe the current Side Quest Chess (SQC) product and the basic expectations for using its website and mobile app.</p>
          <p className="privacy-effective"><strong>Launch draft updated:</strong> {LAST_UPDATED}</p>
        </header>

        <nav className="privacy-contents" aria-label="Terms of Use sections">
          <a href="#status">Status</a>
          <a href="#service">Service</a>
          <a href="#accounts">Accounts</a>
          <a href="#content">Content</a>
          <a href="#conduct">Conduct</a>
          <a href="#third-parties">Third parties</a>
          <a href="#changes">Changes</a>
          <a href="#contact">Contact</a>
        </nav>

        <section id="status">
          <h2>Draft status</h2>
          <p>This page is an implementation-based launch draft, not legal advice or a final adopted agreement. Legal entity, minimum-age, governing-law, dispute, warranty, liability, termination, and other legal terms still require owner/legal review before adoption.</p>
        </section>

        <section id="service">
          <h2>Using SQC</h2>
          <p>SQC lets people browse and complete chess Side Quests, verify eligible public chess games, create or join community and Multiplayer Side Quests, track progress, and share selected results. Features may differ between the website and mobile app while the product is under active development.</p>
          <p>Do not rely on SQC as an official chess result, rating, tournament, prize, or eligibility authority. Quest checks use available public game data and product rules and can fail when a provider or network is unavailable.</p>
        </section>

        <section id="accounts">
          <h2>Accounts and connected chess profiles</h2>
          <p>Some features require an SQC account. Keep access to that account secure and provide accurate public Lichess or Chess.com usernames when using game-verification features. SQC does not ask for your Lichess or Chess.com password.</p>
          <p>Account and product data practices are described in the <Link href="/privacy">Privacy Policy</Link>.</p>
        </section>

        <section id="content">
          <h2>Your quests and shared results</h2>
          <p>You are responsible for quest names, descriptions, support messages, and other material you submit. Visibility controls matter: public quests, participation, standings, and proof links may expose the public profile and game details shown before publishing or sharing.</p>
          <p>Only submit material you have the right to use. Do not submit passwords, private invite codes to public fields, unlawful material, impersonation, harassment, or content designed to compromise the service or another person.</p>
        </section>

        <section id="conduct">
          <h2>Fair and safe use</h2>
          <p>Do not misuse SQC to disrupt the service, evade access controls, falsify proof, manipulate participation or standings, scrape private data, or interfere with other users. Product safeguards may reject malformed, unauthorized, duplicate, or ineligible actions.</p>
        </section>

        <section id="third-parties">
          <h2>Third-party services</h2>
          <p>SQC currently relies on services including Clerk for authentication and public Lichess and Chess.com interfaces for chess information. Those services operate under their own terms and policies, and their availability is outside SQC’s direct control.</p>
        </section>

        <section id="changes">
          <h2>Product and terms changes</h2>
          <p>SQC is actively developed, so features and this draft may change. A final effective date, notice process, termination policy, and treatment of existing users require owner/legal confirmation before these terms are adopted.</p>
        </section>

        <section id="contact" className="privacy-contact">
          <h2>Questions or problems</h2>
          <p>Use <Link href="/support">Help &amp; Support</Link> for product questions. Signed-out users can email <a href="mailto:andreas.nordenadler@gmail.com">andreas.nordenadler@gmail.com</a>.</p>
          <Link className="privacy-contact-link" href="/support">Open Help &amp; Support</Link>
        </section>

        <aside className="privacy-notice" role="note" aria-label="Terms status">
          <strong>Terms status</strong>
          <p>This launch draft has not been adopted as final Terms of Use. The unresolved decisions above must be confirmed through owner/legal review before publication as a binding agreement.</p>
        </aside>
      </article>
    </main>
  );
}
