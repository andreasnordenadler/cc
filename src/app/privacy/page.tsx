import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Side Quest Chess",
  description: "How Side Quest Chess handles account, public chess-game, support, and product-usage information.",
};

const LAST_UPDATED = "July 23, 2026";

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <article className="privacy-policy" aria-labelledby="privacy-title">
        <header className="privacy-hero">
          <Link className="privacy-back" href="/">← Side Quest Chess</Link>
          <span className="privacy-kicker">Side Quest Chess</span>
          <h1 id="privacy-title">Privacy Policy</h1>
          <p className="privacy-lede">This page describes how the current Side Quest Chess (SQC) website and mobile app handle information. It is based on the product’s implemented data flows, not a promise to collect data the product does not use.</p>
          <p className="privacy-effective"><strong>Launch draft updated:</strong> {LAST_UPDATED}</p>
        </header>

        <nav className="privacy-contents" aria-label="Privacy policy sections">
          <a href="#information">Information</a>
          <a href="#verification">Verification</a>
          <a href="#use">Use</a>
          <a href="#sharing">Sharing</a>
          <a href="#retention">Retention</a>
          <a href="#choices">Choices</a>
          <a href="#children">Children</a>
          <a href="#contact">Contact</a>
        </nav>

        <section id="information">
          <h2>Information SQC handles</h2>
          <h3>Account and profile information</h3>
          <p>SQC uses Clerk for sign-in and account management. Depending on how you sign in, Clerk and SQC may handle an account identifier, email address, name, username, profile image, authentication session information, and the sign-in provider you choose. Authentication cookies or equivalent session storage are used where needed to keep you signed in and protect account-only features.</p>
          <h3>Chess and quest information</h3>
          <p>If you add one, SQC stores your public Lichess or Chess.com username. SQC also stores information needed to run the product, such as your display name and bio, active and completed quests, proof attempts and results, game identifiers, timestamps, ratings snapshots, unlocked rewards, custom quests, likes, and Multiplayer Side Quest participation, invitations, standings, and host records.</p>
          <h3>Support messages</h3>
          <p>Signed-in support messages are stored with your account and can include the text you submit, submission time, account email and display name, source (web or mobile), and any diagnostics you choose to include. Mobile diagnostics currently include app/build details and account-state summaries such as connected usernames and active-quest counts. Do not send passwords, private invite codes, or information you do not want included in a support thread.</p>
          <h3>Product analytics and technical information</h3>
          <p>SQC records limited first-party product events, such as page views, profile saves, quest starts and outcomes, community browsing actions, the relevant path or quest/game identifier, event time, source, and a coarse device category inferred from the browser user agent. For signed-in users, compact event totals and a limited recent-event history are stored with the account. Anonymous events are written to application logs and are not attached to an SQC account.</p>
          <p>The current application does not include a third-party advertising or behavioral-analytics SDK. Standard hosting, security, and request logs may still be created by the services that operate SQC.</p>
        </section>

        <section id="verification">
          <h2>Chess game verification</h2>
          <p>When you ask SQC to check a quest, SQC sends the public chess username or public game identifier needed for that check to the public Lichess or Chess.com interfaces. It reads public profile, rating, archive, PGN, move, result, color, and game-time information as needed to determine whether a quest rule was completed and to create a proof result.</p>
          <p>SQC does not ask for or receive your Lichess or Chess.com password. Lichess and Chess.com process requests under their own terms and privacy policies. Connecting a username does not connect your chess-site login credentials to SQC.</p>
        </section>

        <section id="use">
          <h2>How SQC uses information</h2>
          <ul>
            <li>Authenticate users and keep account features synchronized across web and mobile.</li>
            <li>Find eligible public chess games, verify quest rules, save progress, and display proof and rewards.</li>
            <li>Operate public, invite-only, and account-related community and Multiplayer Side Quest features.</li>
            <li>Respond to support requests, diagnose problems, secure the service, and understand product reliability and feature use.</li>
          </ul>
          <p>The implementation reviewed for this draft has no advertising feature or targeted-advertising integration. Whether SQC should make a broader legal statement about sale or sharing of personal information requires owner/legal confirmation.</p>
        </section>

        <section id="sharing">
          <h2>When information is visible or shared</h2>
          <p>SQC sends information to Clerk for authentication and to Lichess and Chess.com when retrieving public chess records. The deployed application also necessarily passes requests through its hosting and delivery infrastructure; the complete production vendor list and contractual roles require owner confirmation.</p>
          <p>Some SQC features are intentionally social. Depending on what you create, join, publish, or share, other people may see your SQC display name, public chess username and provider, avatar, custom or Multiplayer Side Quest content, participation, progress, standings, completed quests, and proof details. Public proof links can include a game identifier, provider, result, timestamps, board position, and move evidence. Review a link or quest’s visibility before sharing or publishing it.</p>

        </section>

        <section id="retention">
          <h2>Retention and deletion</h2>
          <p>SQC keeps account and quest information while it is needed to provide the account and product features. Implemented limits currently keep up to 30 signed-in support messages, a compact analytics history of up to 12 recent events and 12 quest-stat records, and up to 500 account likes. Those limits do not by themselves delete the rest of an account.</p>
          <p>Signed-in users can permanently delete their SQC account from My Account on the website or mobile app. This removes the Clerk sign-in and account-attached profile and progress data, and cleans hosted and participant references from replicated Multiplayer records. Deletion cannot be undone. If that cleanup cannot finish, SQC reports an error instead of deleting the sign-in identity so the user can retry or contact privacy support.</p>
          <p><strong>Current launch limitation:</strong> The exact backup/log deletion schedule and any legally required retention exceptions must still be confirmed by the product owner before this policy is treated as final.</p>
        </section>

        <section id="choices">
          <h2>Your choices</h2>
          <ul>
            <li>You may browse public quest pages without creating an account.</li>
            <li>You can replace connected public chess usernames in account settings. While keeping the account, account settings require at least one public chess username to remain. Deleting the account removes the account profile instead.</li>
            <li>You can choose not to publish custom content or share proof links.</li>
            <li>You can contact SQC about access, correction, or deletion of information associated with your account. The request process and response timeline still require owner confirmation.</li>
          </ul>
        </section>

        <section id="children">
          <h2>Children and international use</h2>
          <p><strong>Launch confirmation required:</strong> SQC’s intended minimum user age, parental-consent approach, operating legal entity/controller identity, and primary processing country have not been established in the implementation reviewed for this policy. These facts must be confirmed before final publication or app-store submission.</p>
        </section>

        <section id="changes">
          <h2>Changes to this policy</h2>
          <p>This page should be updated when SQC practices change. The final notice process and effective date require owner confirmation.</p>
        </section>

        <section id="contact" className="privacy-contact">
          <h2>Contact</h2>
          <p>For privacy questions or requests, email the current SQC support contact at <a href="mailto:andreas.nordenadler@gmail.com">andreas.nordenadler@gmail.com</a>. Signed-in users may also send an account-attached message from <Link href="/support">Help &amp; Support</Link>.</p>
          <a className="privacy-contact-link" href="mailto:andreas.nordenadler@gmail.com?subject=Side%20Quest%20Chess%20privacy%20request">Contact privacy support</a>
        </section>

        <aside className="privacy-notice" role="note" aria-label="Policy status">
          <strong>Policy status</strong>
          <p>This is an implementation-based launch draft, not legal advice. The owner confirmations called out above are unresolved and require legal/product review before this text is adopted as SQC’s final policy.</p>
        </aside>
      </article>
    </main>
  );
}
