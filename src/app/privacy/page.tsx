import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { DesktopHomeHeader } from "@/components/mobile-app-web-shell";
import { getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata: Metadata = {
  title: "Privacy Policy — Side Quest Chess",
  description: "How Side Quest Chess handles account, public chess-game, support, and product-usage information.",
};

const LAST_UPDATED = "August 22, 2026";

export default async function PrivacyPage() {
  noStore();
  const user = await currentUser();
  const metadata = user?.publicMetadata ? user.publicMetadata as UserMetadataRecord : {};
  const displayName = user
    ? getPreferredRunnerName(metadata, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailAddress: user.primaryEmailAddress?.emailAddress,
      }) || "Side Quest Chess"
    : null;

  return <PrivacyPageView signedIn={Boolean(user)} displayName={displayName} />;
}

export function PrivacyPageView({ signedIn, displayName }: { signedIn: boolean; displayName?: string | null }) {
  return (
    <div className="privacy-desktop-shell">
      <div className="sqc-desktop-route-only">
        <DesktopHomeHeader signedIn={signedIn} displayName={displayName} activeTab={null} activeItemId="privacy" />
      </div>
      <main className="privacy-page">
      <article className="privacy-policy privacy-workspace" aria-labelledby="privacy-title">
        <div className="privacy-workspace-rail">
          <header className="privacy-hero">
            <Link className="privacy-back" href="/">← Side Quest Chess</Link>
            <span className="privacy-kicker">Side Quest Chess</span>
            <h1 id="privacy-title">Privacy Policy</h1>
            <p className="privacy-lede">This page describes how the current Side Quest Chess website and mobile app handle information. It is based on the product’s implemented data flows, not a promise to collect data the product does not use.</p>
            <p className="privacy-effective"><strong>Effective:</strong> {LAST_UPDATED}</p>
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
        </div>

        <div className="privacy-document-grid">

        <section id="information">
          <h2>Information Side Quest Chess handles</h2>
          <div className="privacy-topic-grid">
            <div>
              <h3>Account and profile information</h3>
              <p>Side Quest Chess uses Clerk for sign-in and account management. Depending on how you sign in, Clerk and Side Quest Chess may handle an account identifier, email address, name, username, profile image, authentication session information, and the sign-in provider you choose. Authentication cookies or equivalent session storage are used where needed to keep you signed in and protect account-only features.</p>
            </div>
            <div>
              <h3>Chess and quest information</h3>
              <p>If you add one, Side Quest Chess stores your public Lichess or Chess.com username. Side Quest Chess also stores information needed to run the product, such as your display name and bio, active and completed quests, proof attempts and results, game identifiers, timestamps, ratings snapshots, unlocked rewards, custom quests, likes, and Multiplayer Side Quest participation, invitations, standings, and host records.</p>
            </div>
            <div>
              <h3>Support messages</h3>
              <p>Signed-in support messages are stored with your account and can include the text you submit, submission time, account email and display name, source (web or mobile), and any diagnostics you choose to include. Mobile diagnostics currently include app/build details and account-state summaries such as connected usernames and active-quest counts. Do not send passwords, private invite codes, or information you do not want included in a support thread.</p>
            </div>
            <div>
              <h3>Safety reports and blocks</h3>
              <p>When you report Community content or a Community creator, or block a Community creator, Side Quest Chess stores the action with your account. This can include the reported or blocked account and content identifiers, the reason you submit, timestamps, and the source of the action. Block records are used to apply your block choices. Current report records remain attached to the reporting account and are not copied into an independent moderation system.</p>
            </div>
            <div>
              <h3>Product analytics and technical information</h3>
              <p>Side Quest Chess records limited first-party product events, such as page views, profile saves, quest starts and outcomes, community browsing actions, the relevant path or quest/game identifier, event time, source, and a coarse device category inferred from the browser user agent. For signed-in users, compact event totals and a limited recent-event history are stored with the account. Anonymous events are written to application logs and are not attached to a Side Quest Chess account.</p>
              <p>The current application does not include a third-party advertising or behavioral-analytics SDK. Standard hosting, security, and request logs may still be created by the services that operate Side Quest Chess.</p>
            </div>
          </div>
        </section>

        <section id="verification">
          <h2>Chess game verification</h2>
          <p>When you ask Side Quest Chess to check a quest, Side Quest Chess sends the public chess username or public game identifier needed for that check to the public Lichess or Chess.com interfaces. It reads public profile, rating, archive, PGN, move, result, color, and game-time information as needed to determine whether a quest rule was completed and to create a proof result.</p>
          <p>Side Quest Chess does not ask for or receive your Lichess or Chess.com password. Lichess and Chess.com process requests under their own terms and privacy policies. Connecting a username does not connect your chess-site login credentials to Side Quest Chess.</p>
        </section>

        <section id="use">
          <h2>How Side Quest Chess uses information</h2>
          <ul>
            <li>Authenticate users and keep account features synchronized across web and mobile.</li>
            <li>Find eligible public chess games, verify quest rules, save progress, and display proof and rewards.</li>
            <li>Operate public, invite-only, and account-related community and Multiplayer Side Quest features.</li>
            <li>Respond to support requests, diagnose problems, secure the service, and understand product reliability and feature use.</li>
          </ul>
          <p>Side Quest Chess has no advertising, in-app purchases, subscriptions, or real-money prizes. Crowdler AB does not sell personal information or use it for targeted advertising.</p>
        </section>

        <section id="sharing">
          <h2>When information is visible or shared</h2>
          <p>Side Quest Chess sends information to Clerk for authentication and to Lichess and Chess.com when retrieving public chess records. Requests also pass through the hosting and delivery infrastructure used to operate and secure the service. Service providers process information only as needed to provide their services to Crowdler AB.</p>
          <p>Some Side Quest Chess features are intentionally social. Depending on what you create, join, publish, or share, other people may see your Side Quest Chess display name, public chess username and provider, avatar, custom or Multiplayer Side Quest content, participation, progress, standings, completed quests, and proof details. Public proof links can include a game identifier, provider, result, timestamps, board position, and move evidence. Review a link or quest’s visibility before sharing or publishing it.</p>

        </section>

        <section id="retention">
          <h2>Retention and deletion</h2>
          <p>Side Quest Chess keeps account and quest information while it is needed to provide the account and product features. Implemented limits currently keep up to 30 signed-in support messages, a compact analytics history of up to 12 recent events and 12 quest-stat records, and up to 500 account likes. Those limits do not by themselves delete the rest of an account.</p>
          <p>Signed-in users can permanently delete their Side Quest Chess account from My Account on the website or mobile app. This removes the Clerk sign-in and account-attached profile, progress, report, and block data, and cleans hosted and participant references from replicated Multiplayer records. Current report and block records are not retained in an independent moderation system after the reporting or blocking account is deleted. Deleting a reported or blocked account does not currently remove references to that account from report and block records held by other users. Deletion cannot be undone. If that cleanup cannot finish, Side Quest Chess reports an error instead of deleting the sign-in identity so the user can retry or contact privacy support.</p>
          <p>Backups and security logs may persist for a limited period after account deletion. Crowdler AB may retain information when required by law, to resolve disputes, or to protect the service and its users.</p>
        </section>

        <section id="choices">
          <h2>Your choices</h2>
          <ul>
            <li>You may browse public quest pages without creating an account.</li>
            <li>You can replace connected public chess usernames in account settings. While keeping the account, account settings require at least one public chess username to remain. Deleting the account removes the account profile instead.</li>
            <li>You can choose not to publish custom content or share proof links.</li>
            <li>You can contact Side Quest Chess about access, correction, deletion, restriction, portability, or objection rights applicable to information associated with your account.</li>
          </ul>
        </section>

        <section id="children">
          <h2>Children and international use</h2>
          <p>Side Quest Chess is intended for people aged 13 and older. It is not directed to children under 13. If you believe a child under 13 has provided personal information, contact us so we can investigate and delete it where appropriate.</p>
          <p>The data controller is Crowdler AB, Kvarnängsvägen 15, 182 47 Enebyberg, Sweden. Information may be processed in other countries by the service providers used to operate Side Quest Chess, subject to applicable safeguards.</p>
        </section>

        <section id="changes">
          <h2>Changes to this policy</h2>
          <p>We may update this policy when Side Quest Chess practices or legal requirements change. Material changes will be identified by a new effective date and, where appropriate, an in-product notice.</p>
        </section>

        <section id="contact" className="privacy-contact">
          <h2>Contact</h2>
          <p>For privacy questions or requests, contact Crowdler AB at <a href="mailto:sam@crowdler.com">sam@crowdler.com</a> or Kvarnängsvägen 15, 182 47 Enebyberg, Sweden. Signed-in users may also send an account-attached message from <Link href="/support">Help &amp; Support</Link>.</p>
          <a className="privacy-contact-link" href="mailto:sam@crowdler.com?subject=Side%20Quest%20Chess%20privacy%20request">Contact privacy support</a>
        </section>
        </div>

        <aside className="privacy-notice" role="note" aria-label="Controller information">
          <strong>Controller</strong>
          <p>Crowdler AB, Kvarnängsvägen 15, 182 47 Enebyberg, Sweden · sam@crowdler.com</p>
        </aside>
      </article>
      </main>
    </div>
  );
}
