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
    copy: "Set the name, short line, and public identity used on proof receipts, leaderboards, and Multiplayer Side Quests.",
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
    title: "Help & Support",
    copy: "Review data basics, send support context, and find the proof troubleshooting checklist from the mobile help modal.",
    href: "/support",
    action: "Open Help & Support",
  },
];

const mobileMenuShortcuts = [
  { label: "Home", title: "Return to the app entry", href: "/" },
  { label: "Side Quests", title: "Pick a Solo Side Quest", href: "/side-quests" },
  { label: "Multiplayer Side Quests", title: "Browse shared quests", href: "/multiplayer" },
  { label: "Official Leaderboards", title: "Open the app companion leaderboard screen", href: "/official-leaderboards" },
  { label: "Trophy Cabinet", title: "Review coats and receipts", href: "/trophy-cabinet" },
  { label: "My Custom Side Quests", title: "Open saved custom quests", href: "/custom" },
  { label: "Create Custom Side Quest", title: "Start the rule builder", href: "/create-custom-side-quest" },
  { label: "Create Multiplayer Side Quest", title: "Host a shared quest", href: "/create-multiplayer-side-quest" },
  { label: "My Account", title: "Profile and proof tools", href: "/account" },
  { label: "Help & Support", title: "Get account or proof help", href: "/support" },
];

const webCompanionShortcuts = [
  { label: "Community Side Quests", title: "Browse player-made rules", href: "/community" },
  { label: "Leaderboards alias", title: "Legacy route to the same screen", href: "/leaderboards" },
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
            <Link className="button primary" href="/account">
              {isSignedIn ? "Open My Account" : "Open Sign in / Account"}
            </Link>
            <Link className="button secondary" href="/support">Help &amp; Support</Link>
          </div>
        </section>

        <section className="account-mobile-shortcuts settings-mobile-shortcuts" aria-label="Mobile menu shortcuts">
          <div className="account-mobile-shortcuts-head">
            <span className="eyebrow">Mobile menu shortcuts</span>
            <h2>The same key routes, grouped for web.</h2>
            <p>Mobile keeps these actions in the hamburger menu; the settings hub mirrors that order first, with web-only Community and Leaderboard shortcuts separated below.</p>
          </div>
          <div className="account-mobile-shortcut-grid">
            {mobileMenuShortcuts.map((shortcut) => (
              <Link className="account-mobile-shortcut" href={shortcut.href} key={shortcut.href}>
                <span>{shortcut.label}</span>
                <strong>{shortcut.title}</strong>
              </Link>
            ))}
          </div>
          <div className="account-mobile-shortcut-grid companion">
            {webCompanionShortcuts.map((shortcut) => (
              <Link className="account-mobile-shortcut" href={shortcut.href} key={shortcut.href}>
                <span>{shortcut.label}</span>
                <strong>{shortcut.title}</strong>
              </Link>
            ))}
          </div>
        </section>

        <section className="mission-card" aria-label="Settings destinations">
          <div className="section-head">
            <div>
              <span className="eyebrow">Account tools</span>
              <h2>Profile, proof, custom rules, and support.</h2>
              <p>Use these routes to keep receipts, leaderboards, and Multiplayer Side Quests tied to the right public chess identity.</p>
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
