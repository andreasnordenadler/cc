import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

type ActiveNavItem = "home" | "solo" | "custom" | "community" | "multiplayer" | "trophy" | "random" | "path" | "challenges" | "groupquests" | "leaderboards" | "badges" | "scoreboard" | "rules" | "verifiers" | "share-kit" | "connect" | "account" | "profile" | "settings" | "result" | "beta" | "support";

type SiteNavProps = {
  isSignedIn: boolean;
  active: ActiveNavItem;
};

export default function SiteNav({ isSignedIn, active }: SiteNavProps) {
  if (!isSignedIn) {
    return (
      <header className="site-nav softer-site-nav app-source-nav app-source-nav-guest">
        <Link href="/" className="app-source-guest-title" aria-label="Side Quest Chess home">
          Side Quest Chess
        </Link>
        {active !== "home" ? (
          <Link href="/" className="app-source-close-screen" aria-label="Close screen">
            x
          </Link>
        ) : null}
      </header>
    );
  }

  const soloActive = active === "solo" || active === "challenges" || active === "random" || active === "path";
  const customActive = active === "custom";
  const communityActive = active === "community";
  const sideQuestTabActive = soloActive || customActive || communityActive;
  const multiplayerActive = active === "multiplayer" || active === "groupquests";
  const leaderboardsActive = active === "leaderboards" || active === "scoreboard";
  const multiplayerTabActive = multiplayerActive || leaderboardsActive;
  const trophyActive = active === "trophy" || active === "badges";
  const accountActive = active === "account" || active === "profile" || active === "connect" || active === "settings";
  const moreActive = leaderboardsActive || active === "support" || active === "settings";
  const menuItems = [
    { id: "home", label: "Home", href: "/", active: active === "home", glyph: "HM" },
    { id: "solo", label: "Solo Side Quests", href: "/side-quests", active: soloActive, glyph: "SQ" },
    { id: "multiplayer", label: "Multiplayer Side Quests", href: "/multiplayer", active: multiplayerActive, glyph: "MP" },
    { id: "trophy", label: "Trophy Cabinet", href: "/trophy-cabinet", active: trophyActive, glyph: "TC" },
    { id: "custom", label: "My Custom Side Quests", href: "/custom-side-quests", active: customActive, glyph: "CS" },
    { id: "create-custom", label: "Create Custom Side Quest", href: "/create-custom-side-quest", active: false, glyph: "+C" },
    { id: "create-multiplayer", label: "Create Multiplayer Side Quest", href: "/create-multiplayer-side-quest", active: false, glyph: "+M" },
    { id: "account", label: isSignedIn ? "My Account" : "Sign in / Account", href: "/account", active: accountActive, glyph: isSignedIn ? "OK" : "IN" },
    { id: "support", label: "Help & Support", href: "/support", active: active === "support", glyph: "HP" },
    { id: "community", label: "Community Side Quests", href: "/community-side-quests", active: communityActive, glyph: "CM" },
    { id: "leaderboards", label: "Official Leaderboards", href: "/official-leaderboards", active: leaderboardsActive, glyph: "LB" },
    { id: "settings", label: "Settings", href: "/settings", active: active === "settings", glyph: "ST" },
  ];
  return (
    <header className="site-nav softer-site-nav app-source-nav">
      <div className="site-nav-inner">
        <nav className="nav-links app-source-nav-menu" aria-label="Primary">
          <details className={moreActive || sideQuestTabActive || multiplayerTabActive || trophyActive || accountActive ? "mobile-app-menu active" : "mobile-app-menu"}>
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
        </nav>

        <div className="nav-actions">
          <Link href="/account" className={accountActive ? "nav-pill active" : "nav-pill"}>My Account</Link>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
