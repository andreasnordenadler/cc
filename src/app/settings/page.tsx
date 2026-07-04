import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

export const metadata = {
  title: "Settings · Side Quest Chess",
  description: "Side Quest Chess settings hub for profile, chess usernames, support, privacy, and account readiness.",
};

const settingsSections = [
  {
    label: "Profile",
    title: "Player profile",
    copy: "Set the name, short line, and public identity used on proof receipts, leaderboards, and Multiplayer Side Quest tables.",
    href: "/profile",
    action: "Edit profile",
  },
  {
    label: "Proof source",
    title: "Chess usernames",
    copy: "Connect or update the public Lichess and Chess.com usernames SQC can check for Solo and Multiplayer proof.",
    href: "/connect",
    action: "Update usernames",
  },
  {
    label: "Quest library",
    title: "Custom Side Quests",
    copy: "Manage private drafts and public custom rules that can be used for Solo attempts or hosted Multiplayer Side Quests.",
    href: "/account/custom-side-quests",
    action: "Manage custom",
  },
  {
    label: "Help",
    title: "Support and privacy",
    copy: "Review data basics, send support context, and find the proof troubleshooting checklist from the mobile help modal.",
    href: "/support",
    action: "Open support",
  },
];

export default async function SettingsPage() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={isSignedIn} active="settings" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Settings</span>
          <h1>Keep your Side Quest Chess account ready.</h1>
          <p className="hero-copy">
            The mobile app keeps profile, chess usernames, custom quests, and support close to Account. This web settings hub puts those same destinations in one place.
          </p>
          <div className="button-row hero-actions">
            <Link className="button primary" href={isSignedIn ? "/account" : "/sign-in"}>
              {isSignedIn ? "Open My Account" : "Sign in"}
            </Link>
            <Link className="button secondary" href="/support">Help &amp; Support</Link>
          </div>
        </section>

        <section className="mission-card" aria-label="Settings destinations">
          <div className="section-head">
            <div>
              <span className="eyebrow">Account tools</span>
              <h2>Profile, proof, custom rules, and support.</h2>
              <p>Use these routes to keep receipts, leaderboards, and Multiplayer tables tied to the right public chess identity.</p>
            </div>
          </div>
          <div className="home-mobile-map-grid">
            {settingsSections.map((section) => (
              <Link href={section.href} className="home-mobile-map-item" key={section.href}>
                <span>{section.label}</span>
                <strong>{section.title}</strong>
                <small>{section.copy}</small>
                <em>{section.action}</em>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
