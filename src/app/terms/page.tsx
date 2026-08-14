import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { DesktopHomeHeader } from "@/components/mobile-app-web-shell";
import { getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata: Metadata = {
  title: "Terms of Use — Side Quest Chess",
  description: "Terms for using the Side Quest Chess website and mobile app.",
};

const LAST_UPDATED = "August 13, 2026";

export default async function TermsPage() {
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

  return <TermsPageView signedIn={Boolean(user)} displayName={displayName} />;
}

export function TermsPageView({ signedIn, displayName }: { signedIn: boolean; displayName?: string | null }) {
  return (
    <div className="terms-desktop-shell">
      <div className="sqc-desktop-route-only">
        <DesktopHomeHeader signedIn={signedIn} displayName={displayName} activeTab={null} activeItemId="terms" />
      </div>
      <main className="privacy-page">
      <article className="privacy-policy terms-policy" aria-labelledby="terms-title">
        <div className="terms-rail">
          <header className="privacy-hero">
            <div className="terms-brand-row">
              <Link className="privacy-back" href="/">← Side Quest Chess</Link>
              <span className="privacy-kicker">Side Quest Chess</span>
            </div>
            <h1 id="terms-title">Terms of Use</h1>
            <p className="privacy-lede">These terms describe Side Quest Chess and the expectations for using its website and mobile app.</p>
            <p className="privacy-effective"><strong>Effective:</strong> {LAST_UPDATED}</p>
          </header>

          <nav className="privacy-contents" aria-label="Terms of Use sections">
            <a href="#provider">Provider</a>
            <a href="#service">Service</a>
            <a href="#accounts">Accounts</a>
            <a href="#content">Content</a>
            <a href="#conduct">Conduct</a>
            <a href="#third-parties">Third parties</a>
            <a href="#changes">Changes</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>

        <div className="terms-document-grid">
          <section id="provider">
            <h2>Provider and eligibility</h2>
            <p>Side Quest Chess is provided by Crowdler AB, Kvarnängsvägen 15, 182 47 Enebyberg, Sweden. You must be at least 13 years old to use the service. By using Side Quest Chess, you agree to these terms.</p>
          </section>

          <section id="service">
            <h2>Using Side Quest Chess</h2>
            <p>Side Quest Chess lets people browse and complete chess Side Quests, verify eligible public chess games, create or join community and Multiplayer Side Quests, track progress, and share selected results. Features may differ between the website and mobile app while the product is under active development.</p>
            <p>Do not rely on Side Quest Chess as an official chess result, rating, tournament, prize, or eligibility authority. Quest checks use available public game data and product rules and can fail when a provider or network is unavailable.</p>
          </section>

          <section id="accounts">
            <h2>Accounts and connected chess profiles</h2>
            <p>Some features require a Side Quest Chess account. Keep access to that account secure and provide accurate public Lichess or Chess.com usernames when using game-verification features. Side Quest Chess does not ask for your Lichess or Chess.com password.</p>
            <p>Account and product data practices are described in the <Link href="/privacy">Privacy Policy</Link>.</p>
          </section>

          <section id="content">
            <h2>Your quests and shared results</h2>
            <p>You are responsible for quest names, descriptions, support messages, and other material you submit. Visibility controls matter: public quests, participation, standings, and proof links may expose the public profile and game details shown before publishing or sharing.</p>
            <p>Only submit material you have the right to use. Do not submit passwords, private invite codes to public fields, unlawful material, impersonation, harassment, or content designed to compromise the service or another person.</p>
          </section>

          <section id="conduct">
            <h2>Fair and safe use</h2>
            <p>Do not misuse Side Quest Chess to disrupt the service, evade access controls, falsify proof, manipulate participation or standings, scrape private data, or interfere with other users. Product safeguards may reject malformed, unauthorized, duplicate, or ineligible actions.</p>
          </section>

          <section id="third-parties">
            <h2>Third-party services</h2>
            <p>Side Quest Chess currently relies on services including Clerk for authentication and public Lichess and Chess.com interfaces for chess information. Those services operate under their own terms and policies, and their availability is outside the app’s direct control.</p>
          </section>

          <section id="changes">
            <h2>Product and terms changes</h2>
            <p>Side Quest Chess is actively developed, so features may change. We may suspend or terminate access when reasonably necessary to protect users, the service, or comply with law. We may update these terms and will identify material changes with a new effective date and, where appropriate, an in-product notice.</p>
          </section>

          <section id="law">
            <h2>Availability, liability, and governing law</h2>
            <p>Side Quest Chess is provided as available. We do not guarantee uninterrupted operation, provider availability, or that every automated quest check will be correct. Nothing in these terms limits liability that cannot legally be limited. To the extent permitted by law, Crowdler AB is not liable for indirect or consequential loss arising from use of the service.</p>
            <p>These terms are governed by Swedish law. Disputes should first be raised with us at the contact below. Mandatory consumer protections and the jurisdiction rights available to consumers remain unaffected.</p>
          </section>

          <section id="contact" className="privacy-contact">
            <h2>Questions or problems</h2>
            <p>Use <Link href="/support">Help &amp; Support</Link> for product questions. You can also contact Crowdler AB at <a href="mailto:sam@crowdler.com">sam@crowdler.com</a> or Kvarnängsvägen 15, 182 47 Enebyberg, Sweden.</p>
            <Link className="privacy-contact-link" href="/support">Open Help &amp; Support</Link>
          </section>
        </div>

        <aside className="privacy-notice" role="note" aria-label="Provider information">
          <strong>Provider</strong>
          <p>Crowdler AB, Kvarnängsvägen 15, 182 47 Enebyberg, Sweden · sam@crowdler.com</p>
        </aside>
      </article>
      </main>
    </div>
  );
}
