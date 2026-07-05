import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import AuthActionButtons from "@/components/auth-action-buttons";

type ActiveNavItem = "home" | "solo" | "custom" | "community" | "multiplayer" | "trophy" | "random" | "path" | "challenges" | "groupquests" | "leaderboards" | "badges" | "scoreboard" | "rules" | "verifiers" | "share-kit" | "connect" | "account" | "profile" | "settings" | "result" | "beta" | "support";

type SiteNavProps = {
  isSignedIn: boolean;
  active: ActiveNavItem;
};

export default function SiteNav({ isSignedIn, active }: SiteNavProps) {
  const soloActive = active === "solo" || active === "challenges" || active === "random" || active === "path";
  const customActive = active === "custom";
  const communityActive = active === "community";
  const multiplayerActive = active === "multiplayer" || active === "groupquests";
  const leaderboardsActive = active === "leaderboards" || active === "scoreboard";
  const trophyActive = active === "trophy" || active === "badges";
  const accountActive = active === "account" || active === "profile" || active === "connect" || active === "settings";
  const menuItems = [
    { id: "home", label: "Home", href: "/", active: active === "home", glyph: "HM" },
    { id: "solo", label: "Solo Side Quests", href: "/solo", active: soloActive, glyph: "SQ" },
    { id: "multiplayer", label: "Multiplayer Side Quests", href: "/multiplayer", active: multiplayerActive, glyph: "MP" },
    { id: "trophy", label: "Trophy Cabinet", href: "/trophy-cabinet", active: trophyActive, glyph: "TC" },
    { id: "custom", label: "My Custom Side Quests", href: "/custom", active: customActive, glyph: "CS" },
    { id: "create-custom", label: "Create Custom Side Quest", href: "/custom#custom-side-quest-builder", active: false, glyph: "+C" },
    { id: "create-multiplayer", label: "Create Multiplayer Side Quest", href: "/groupquests/create", active: false, glyph: "+M" },
    { id: "account", label: isSignedIn ? "My Account" : "Sign in / Account", href: "/account", active: accountActive, glyph: isSignedIn ? "OK" : "IN" },
    { id: "support", label: "Help & Support", href: "/support", active: active === "support", glyph: "HP" },
    { id: "community", label: "Community Side Quests", href: "/community", active: communityActive, glyph: "CO" },
    { id: "leaderboards", label: "Official Leaderboards", href: "/leaderboards", active: leaderboardsActive, glyph: "LB" },
    { id: "settings", label: "Settings", href: "/settings", active: active === "settings", glyph: "ST" },
  ];
  const mobileDockItems = [
    {
      id: "home",
      label: "Home",
      labelLines: ["Home"],
      href: "/",
      active: active === "home",
      icon: <span className="mobile-app-dock-letter">SQC</span>,
    },
    {
      id: "solo",
      label: "Side Quests",
      labelLines: ["Side", "Quests"],
      href: "/solo",
      active: soloActive,
      icon: (
        <Image
          alt=""
          height={28}
          src="/sqc-logo-v11.png"
          width={28}
        />
      ),
    },
    {
      id: "multiplayer",
      label: "Multiplayer Side Quests",
      labelLines: ["Multiplayer", "Side Quests"],
      href: "/multiplayer",
      active: multiplayerActive,
      icon: (
        <Image
          alt=""
          height={28}
          src="/stamps/sqc-multiplayer-seal.png"
          width={28}
        />
      ),
    },
    {
      id: "trophy",
      label: "Trophy Cabinet",
      labelLines: ["Trophy", "Cabinet"],
      href: "/trophy-cabinet",
      active: trophyActive,
      icon: (
        <Image
          alt=""
          height={28}
          src="/badges/v6/proof-loop-test-badge.png"
          width={28}
        />
      ),
    },
    {
      id: "leaderboards",
      label: "Official Leaderboards",
      labelLines: ["Leaders"],
      href: "/leaderboards",
      active: leaderboardsActive,
      icon: <span className="mobile-app-dock-letter">LB</span>,
    },
    {
      id: "account",
      label: "Account",
      labelLines: ["Account"],
      href: "/account",
      active: accountActive,
      icon: <span className="mobile-app-dock-account">{isSignedIn ? "OK" : "IN"}</span>,
    },
  ];

  return (
    <>
      <header className="site-nav softer-site-nav">
        <div className="site-nav-inner">
          <nav className="nav-links" aria-label="Primary">
            <Link href="/" className="nav-brand-mark" aria-label="Side Quest Chess home">
              <Image
                alt=""
                height={44}
                src="/brand/sqc-alt-logo-topbar-20260507-v2.png"
                width={76}
              />
            </Link>
            <Link href="/" className={active === "home" ? "active" : undefined}>Home</Link>
            <Link href="/solo" className={soloActive ? "active" : undefined}>Solo Side Quests</Link>
            <Link href="/multiplayer" className={multiplayerActive ? "active" : undefined}>Multiplayer Side Quests</Link>
            <Link href="/trophy-cabinet" className={trophyActive ? "active" : undefined}>Trophy Cabinet</Link>
            <Link href="/custom" className={customActive ? "active" : undefined}>My Custom Side Quests</Link>
            <Link href="/community" className={communityActive ? "active" : undefined}>Community Side Quests</Link>
            <Link href="/leaderboards" className={leaderboardsActive ? "active" : undefined}>Official Leaderboards</Link>
          </nav>

          <div className="nav-actions">
            <details className="mobile-app-menu">
              <summary aria-label="Open main menu">
                <span aria-hidden="true"></span>
                <strong>Menu</strong>
              </summary>
              <div className="mobile-app-menu-panel" aria-label="Main menu">
                {menuItems.map((item) => (
                  <Link
                    aria-current={item.active ? "page" : undefined}
                    className={item.active ? "mobile-app-menu-item active" : "mobile-app-menu-item"}
                    href={item.href}
                    key={item.id}
                  >
                    <span className="mobile-app-menu-glyph" aria-hidden="true">{item.glyph}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </details>
            <Link href="/custom#custom-side-quest-builder" className={customActive ? "nav-pill nav-shortcut active" : "nav-pill nav-shortcut"}>Create Custom</Link>
            <Link href="/groupquests/create" className={multiplayerActive ? "nav-pill nav-shortcut active" : "nav-pill nav-shortcut"}>Create Multiplayer</Link>
            {isSignedIn ? (
              <>
                <Link href="/account" className={accountActive ? "nav-pill active" : "nav-pill"}>My Account</Link>
                <Link href="/profile" className={active === "profile" ? "nav-pill active" : "nav-pill"}>Profile</Link>
                <Link href="/settings" className={active === "settings" ? "nav-pill active" : "nav-pill"}>Settings</Link>
                <Link href="/support" className={active === "support" ? "nav-pill active" : "nav-pill"}>Help &amp; Support</Link>
                <UserButton />
              </>
            ) : (
              <>
                <AuthActionButtons />
                <Link href="/support" className={active === "support" ? "nav-pill active" : "nav-pill"}>Help &amp; Support</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <nav className="mobile-app-dock" aria-label="Mobile app tabs">
        {mobileDockItems.map((item) => (
          <Link
            aria-current={item.active ? "page" : undefined}
            className={item.active ? "mobile-app-dock-item active" : "mobile-app-dock-item"}
            href={item.href}
            key={item.id}
          >
            <span className="mobile-app-dock-icon" aria-hidden="true">{item.icon}</span>
            <span className="mobile-app-dock-item-label">
              {item.labelLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
