import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import AuthActionButtons from "@/components/auth-action-buttons";

type ActiveNavItem = "home" | "solo" | "custom" | "community" | "multiplayer" | "trophy" | "random" | "path" | "challenges" | "groupquests" | "leaderboards" | "badges" | "scoreboard" | "rules" | "verifiers" | "share-kit" | "connect" | "account" | "profile" | "settings" | "result" | "beta" | "support";

type SiteNavProps = {
  isSignedIn: boolean;
  active: ActiveNavItem;
};

type MobileDockItem =
  | { id: string; label: string; href: string; active: boolean; image: string; glyph?: never }
  | { id: string; label: string; href: string; active: boolean; glyph: string; image?: never };

export default function SiteNav({ isSignedIn, active }: SiteNavProps) {
  const soloActive = active === "solo" || active === "challenges" || active === "random" || active === "path";
  const customActive = active === "custom";
  const communityActive = active === "community";
  const sideQuestTabActive = soloActive || customActive || communityActive;
  const multiplayerActive = active === "multiplayer" || active === "groupquests";
  const leaderboardsActive = active === "leaderboards" || active === "scoreboard";
  const trophyActive = active === "trophy" || active === "badges";
  const accountActive = active === "account" || active === "profile" || active === "connect" || active === "settings";
  const currentScreen =
    active === "home" ? "Home" :
    sideQuestTabActive ? "Side Quests" :
    multiplayerActive ? "Multiplayer Side Quests" :
    leaderboardsActive ? "Official Leaderboards" :
    trophyActive ? "Trophy Cabinet" :
    accountActive ? "Account" :
    active === "support" ? "Help & Support" :
    "Side Quest Chess";
  const menuItems = [
    { id: "home", label: "Home", href: "/", active: active === "home", glyph: "HM" },
    { id: "solo", label: "Solo Side Quests", href: "/solo", active: soloActive, glyph: "SQ" },
    { id: "multiplayer", label: "Multiplayer Side Quests", href: "/multiplayer", active: multiplayerActive, glyph: "MP" },
    { id: "leaderboards", label: "Official Leaderboards", href: "/official-leaderboards", active: leaderboardsActive, glyph: "LB" },
    { id: "trophy", label: "Trophy Cabinet", href: "/trophy-cabinet", active: trophyActive, glyph: "TC" },
    { id: "custom", label: "My Custom Side Quests", href: "/custom", active: customActive, glyph: "CS" },
    { id: "create-custom", label: "Create Custom Side Quest", href: "/create-custom-side-quest", active: false, glyph: "+C" },
    { id: "create-multiplayer", label: "Create Multiplayer Side Quest", href: "/groupquests/create", active: false, glyph: "+M" },
    { id: "account", label: isSignedIn ? "My Account" : "Sign in / Account", href: "/account", active: accountActive, glyph: isSignedIn ? "OK" : "IN" },
    { id: "support", label: "Help & Support", href: "/support", active: active === "support", glyph: "HP" },
    { id: "community", label: "Community Side Quests", href: "/community", active: communityActive, glyph: "CM" },
    { id: "settings", label: "Settings", href: "/settings", active: active === "settings", glyph: "ST" },
  ];
  const dockItems: MobileDockItem[] = [
    { id: "home", label: "Home", href: "/", active: active === "home", image: "/brand/sqc-alt-logo-topbar-20260507-v2.png" },
    { id: "solo", label: "Side Quests", href: "/solo", active: sideQuestTabActive, image: "/sqc-logo-v11.png" },
    { id: "multiplayer", label: "Multiplayer Side Quests", href: "/multiplayer", active: multiplayerActive, glyph: "MP" },
    { id: "trophy", label: "Trophy Cabinet", href: "/trophy-cabinet", active: trophyActive, image: "/badges/v6/proof-loop-test-badge.png" },
    { id: "account", label: "Account", href: "/account", active: accountActive, glyph: isSignedIn ? "OK" : "IN" },
  ];
  return (
    <>
      <header className="site-nav softer-site-nav">
        <div className="site-nav-inner">
          <div className="mobile-web-app-bar">
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

            <Link href="/" className="mobile-web-app-title" aria-label="Side Quest Chess home">
              <Image
                alt=""
                height={42}
                src="/brand/sqc-alt-logo-topbar-20260507-v2.png"
                width={72}
              />
              <span>
                <strong>{currentScreen}</strong>
                <small>{isSignedIn ? "Signed in" : "Signed out"}</small>
              </span>
            </Link>

            <div className="nav-actions">
              {isSignedIn ? (
                <>
                  <Link href="/profile" className={active === "profile" ? "nav-pill active" : "nav-pill"}>Profile</Link>
                  <Link href="/settings" className={active === "settings" ? "nav-pill active" : "nav-pill"}>Settings</Link>
                  <UserButton />
                </>
              ) : (
                <AuthActionButtons />
              )}
            </div>
          </div>

          <nav className="nav-links" aria-label="Primary app destinations">
            {menuItems.slice(0, 5).map((item) => (
              <Link
                aria-current={item.active ? "page" : undefined}
                className={item.active ? "active" : undefined}
                href={item.href}
                key={item.id}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <nav className="mobile-tab-dock" aria-label="Mobile app tabs">
        {dockItems.map((item) => (
          <Link
            aria-current={item.active ? "page" : undefined}
            className={item.active ? "mobile-tab-item active" : "mobile-tab-item"}
            href={item.href}
            key={item.id}
          >
            <span className="mobile-tab-icon" aria-hidden="true">
              {item.image ? (
                <Image alt="" height={30} src={item.image} width={30} />
              ) : (
                <span>{item.glyph}</span>
              )}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
