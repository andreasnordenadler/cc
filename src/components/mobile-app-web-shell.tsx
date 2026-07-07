import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AppTab = "home" | "sideQuests" | "multiplayerSideQuests" | "coatOfArms" | "account";

type MobileAppWebShellProps = {
  activeTab: AppTab;
  signedIn: boolean;
};

const tabItems: Array<{
  id: AppTab;
  label: string;
  href: string;
  image?: string;
  glyph?: string;
}> = [
  { id: "home", label: "Home", href: "/", image: "/brand/sqc-alt-logo-topbar-20260507-v2.png" },
  { id: "sideQuests", label: "Side Quests", href: "/side-quests", image: "/sqc-logo-v11.png" },
  { id: "multiplayerSideQuests", label: "Multiplayer Side Quests", href: "/multiplayer", glyph: "groups" },
  { id: "coatOfArms", label: "Trophy Cabinet", href: "/trophy-cabinet", image: "/badges/v6/proof-loop-test-badge.png" },
  { id: "account", label: "Account", href: "/account", glyph: "person" },
];

const menuItems = [
  { id: "home", label: "Home", href: "/", glyph: "home" },
  { id: "sideQuests", label: "Solo Side Quests", href: "/side-quests", glyph: "flag" },
  { id: "multiplayer", label: "Multiplayer Side Quests", href: "/multiplayer", glyph: "groups" },
  { id: "coats", label: "Trophy Cabinet", href: "/trophy-cabinet", glyph: "shield" },
  { id: "custom", label: "My Custom Side Quests", href: "/my-custom-side-quests", glyph: "edit" },
  { id: "createCustom", label: "Create Custom Side Quest", href: "/create-custom-side-quest", glyph: "add" },
  { id: "createMultiplayer", label: "Create Multiplayer Side Quest", href: "/create-multiplayer-side-quest", glyph: "add" },
  { id: "account", label: "Sign in / Account", href: "/account", glyph: "person" },
  { id: "support", label: "Help & Support", href: "/support", glyph: "help" },
  { id: "community", label: "Community Side Quests", href: "/community", glyph: "flag" },
  { id: "leaderboards", label: "Official Leaderboards", href: "/official-leaderboards", glyph: "bars" },
  { id: "settings", label: "Settings", href: "/settings", glyph: "gear" },
];

const soloRows = [
  {
    title: "No active Solo Side Quest",
    meta: "Pick one Solo Side Quest, play a fresh public game, then check proof.",
    status: "Explore",
    href: "/side-quests",
    image: "/sqc-logo-v11.png",
  },
  {
    title: "Connect a chess username",
    meta: "SQC reads public Lichess or Chess.com games. No chess-site password needed.",
    status: "Account",
    href: "/account",
    image: "/brand/sqc-alt-logo-topbar-20260507-v2.png",
  },
];

const multiplayerRows = [
  {
    title: "No active Multiplayer Side Quests",
    meta: "Join or host shared challenges with friends.",
    status: "Explore",
    href: "/multiplayer",
    glyph: "groups",
  },
  {
    title: "Create a Multiplayer Side Quest",
    meta: "Choose quests, time window, provider, and invite friends.",
    status: "Create",
    href: "/create-multiplayer-side-quest",
    glyph: "add",
  },
];

export default function MobileAppWebShell({ activeTab, signedIn }: MobileAppWebShellProps) {
  const activeTabLabel = tabItems.find((item) => item.id === activeTab)?.label ?? "Home";

  return (
    <main className="mobile-web-app-shell">
      <header className="mobile-web-topbar" aria-label="App header">
        <details className="mobile-web-menu">
          <summary aria-label="Open main menu">
            <span aria-hidden="true" />
          </summary>
          <nav className="mobile-web-menu-panel" aria-label="Main menu">
            {menuItems.map((item) => (
              <Link href={item.href} key={item.id} className="mobile-web-menu-row">
                <IconBox glyph={item.glyph} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </details>

        <Link href="/" className="mobile-web-title" aria-label="Side Quest Chess home">
          <Image alt="" src="/brand/sqc-alt-logo-topbar-20260507-v2.png" width={72} height={42} priority />
          <span>
            <strong>{activeTabLabel}</strong>
            <small>{signedIn ? "Signed in" : "Signed out"}</small>
          </span>
        </Link>

        <Link href="/account" className="mobile-web-account-dot" aria-label={signedIn ? "Open account" : "Sign in"}>
          {signedIn ? "S" : "IN"}
        </Link>
      </header>

      <section className="mobile-web-screen" aria-label="Home">
        <div className="mobile-web-hero">
          <div className="mobile-web-logo-stage">
            <Image alt="" src="/sqc-logo-v11.png" width={132} height={132} priority />
          </div>
          <p>Chess, but with stupidly hard side quests — solo or multiplayer.</p>
          <div className="mobile-web-action-row">
            <Link href="/side-quests" className="mobile-web-primary-action">Browse Solo Side Quests</Link>
            <Link href="/multiplayer" className="mobile-web-secondary-action">Browse Multiplayer Side Quests</Link>
          </div>
        </div>

        <section className="mobile-web-panel mobile-web-readiness" aria-label="Account readiness">
          <div>
            <span className="mobile-web-eyebrow">Proof readiness</span>
            <h1>Connect a public chess username before checking proof.</h1>
            <p>Side Quest Chess can verify fresh public Lichess and Chess.com games after you sign in.</p>
          </div>
          <Link href="/account" className="mobile-web-primary-action">Sign in / Account</Link>
        </section>

        <MobileSection title="Solo Side Quest" actionLabel="Explore More Solo Side Quests" href="/side-quests">
          {soloRows.map((row) => (
            <AppRow key={row.title} {...row} />
          ))}
        </MobileSection>

        <MobileSection title="Multiplayer Side Quests" actionLabel="Explore More Multiplayer Side Quests" href="/multiplayer">
          {multiplayerRows.map((row) => (
            <AppRow key={row.title} {...row} />
          ))}
        </MobileSection>

        <section className="mobile-web-panel" aria-label="Trophy Cabinet">
          <div className="mobile-web-section-head">
            <div>
              <span className="mobile-web-eyebrow">Trophy Cabinet</span>
              <h2>No Coat of Arms yet</h2>
            </div>
            <Link href="/trophy-cabinet" className="mobile-web-text-action">Open</Link>
          </div>
          <AppRow
            title="Complete a Side Quest"
            meta="Unlocked coats stay in your account and appear in the Trophy Cabinet."
            status="Explore"
            href="/side-quests"
            image="/badges/v6/proof-loop-test-badge.png"
          />
        </section>
      </section>

      <nav className="mobile-web-tab-dock" aria-label="Mobile app tabs">
        {tabItems.map((item) => (
          <Link
            aria-current={activeTab === item.id ? "page" : undefined}
            className={activeTab === item.id ? "mobile-web-tab active" : "mobile-web-tab"}
            href={item.href}
            key={item.id}
          >
            <span className="mobile-web-tab-icon" aria-hidden="true">
              {item.image ? <Image alt="" src={item.image} width={30} height={30} /> : <IconBox glyph={item.glyph ?? ""} small />}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}

function MobileSection({
  title,
  actionLabel,
  href,
  children,
}: {
  title: string;
  actionLabel: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className="mobile-web-panel" aria-label={title}>
      <div className="mobile-web-section-head">
        <div>
          <span className="mobile-web-eyebrow">Today</span>
          <h2>{title}</h2>
        </div>
        <Link href={href} className="mobile-web-text-action">{actionLabel}</Link>
      </div>
      <div className="mobile-web-row-list">{children}</div>
    </section>
  );
}

function AppRow({
  title,
  meta,
  status,
  href,
  image,
  glyph,
}: {
  title: string;
  meta: string;
  status: string;
  href: string;
  image?: string;
  glyph?: string;
}) {
  return (
    <Link href={href} className="mobile-web-app-row">
      <span className="mobile-web-row-art" aria-hidden="true">
        {image ? <Image alt="" src={image} width={48} height={48} /> : <IconBox glyph={glyph ?? ""} />}
      </span>
      <span className="mobile-web-row-copy">
        <strong>{title}</strong>
        <small>{meta}</small>
      </span>
      <span className="mobile-web-row-status">{status}</span>
    </Link>
  );
}

function IconBox({ glyph, small = false }: { glyph: string; small?: boolean }) {
  return (
    <span className={small ? "mobile-web-icon-box small" : "mobile-web-icon-box"} aria-hidden="true">
      {glyph}
    </span>
  );
}
