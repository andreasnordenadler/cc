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
  const moreActive = customActive || communityActive || leaderboardsActive || active === "support" || active === "settings";
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
  ];
  const moreItems = [
    { id: "custom", label: "My Custom Side Quests", href: "/custom", active: customActive },
    { id: "create-custom", label: "Create Custom Side Quest", href: "/custom#custom-side-quest-builder", active: false },
    { id: "create-multiplayer", label: "Create Multiplayer Side Quest", href: "/groupquests/create", active: false },
    { id: "community", label: "Community Side Quests", href: "/community", active: communityActive },
    { id: "leaderboards", label: "Official Leaderboards", href: "/leaderboards", active: leaderboardsActive },
    { id: "settings", label: "Settings", href: "/settings", active: active === "settings" },
    { id: "support", label: "Help & Support", href: "/support", active: active === "support" },
  ];
  return (
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
          <Link href="/account" className={accountActive ? "active" : undefined}>{isSignedIn ? "My Account" : "Sign in / Account"}</Link>
          <details className={moreActive ? "nav-more-menu active" : "nav-more-menu"}>
            <summary>More</summary>
            <div className="nav-more-menu-panel" aria-label="More Side Quest Chess routes">
              {moreItems.map((item) => (
                <Link
                  aria-current={item.active ? "page" : undefined}
                  className={item.active ? "active" : undefined}
                  href={item.href}
                  key={item.id}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
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
    </header>
  );
}
