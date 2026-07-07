import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import AuthActionButtons from "@/components/auth-action-buttons";

type ActiveNavItem = "home" | "solo" | "custom" | "create-custom" | "community" | "multiplayer" | "create-multiplayer" | "trophy" | "random" | "path" | "challenges" | "groupquests" | "leaderboards" | "badges" | "scoreboard" | "rules" | "verifiers" | "share-kit" | "connect" | "account" | "profile" | "settings" | "result" | "beta" | "support";

type SiteNavProps = {
  isSignedIn: boolean;
  active: ActiveNavItem;
};

type MobileDockItem =
  | { id: string; label: string; href: string; active: boolean; image: string }
  | { id: string; label: string; href: string; active: boolean; icon: NavIconName };

type NavIconName = "account" | "flag" | "home" | "leaderboard" | "lifebuoy" | "plus" | "ruler" | "settings" | "shield" | "users";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  active: boolean;
  icon: NavIconName;
};

export default function SiteNav({ isSignedIn, active }: SiteNavProps) {
  const soloActive = active === "solo" || active === "challenges" || active === "random" || active === "path";
  const customActive = active === "custom";
  const createCustomActive = active === "create-custom";
  const communityActive = active === "community";
  const sideQuestTabActive = soloActive || customActive || createCustomActive || communityActive;
  const createMultiplayerActive = active === "create-multiplayer";
  const multiplayerActive = active === "multiplayer" || active === "groupquests" || createMultiplayerActive;
  const leaderboardsActive = active === "leaderboards" || active === "scoreboard";
  const trophyActive = active === "trophy" || active === "badges";
  const accountActive = active === "account" || active === "profile" || active === "connect" || active === "settings";
  const currentScreen =
    active === "home" ? "Home" :
    createCustomActive ? "Create Custom Side Quest" :
    sideQuestTabActive ? "Side Quests" :
    createMultiplayerActive ? "Create Multiplayer Side Quest" :
    multiplayerActive ? "Multiplayer Side Quests" :
    leaderboardsActive ? "Official Leaderboards" :
    trophyActive ? "Trophy Cabinet" :
    accountActive ? "Account" :
    active === "support" ? "Help & Support" :
    "Side Quest Chess";
  const menuItems: MenuItem[] = [
    { id: "home", label: "Home", href: "/", active: active === "home", icon: "home" },
    { id: "solo", label: "Solo Side Quests", href: "/side-quests", active: soloActive, icon: "flag" },
    { id: "multiplayer", label: "Multiplayer Side Quests", href: "/multiplayer", active: multiplayerActive, icon: "users" },
    { id: "leaderboards", label: "Official Leaderboards", href: "/official-leaderboards", active: leaderboardsActive, icon: "leaderboard" },
    { id: "trophy", label: "Trophy Cabinet", href: "/trophy-cabinet", active: trophyActive, icon: "shield" },
    { id: "custom", label: "My Custom Side Quests", href: "/my-custom-side-quests", active: customActive, icon: "ruler" },
    { id: "create-custom", label: "Create Custom Side Quest", href: "/create-custom-side-quest", active: createCustomActive, icon: "plus" },
    { id: "create-multiplayer", label: "Create Multiplayer Side Quest", href: "/create-multiplayer-side-quest", active: createMultiplayerActive, icon: "plus" },
    { id: "account", label: isSignedIn ? "My Account" : "Sign in / Account", href: "/account", active: accountActive, icon: "account" },
    { id: "support", label: "Help & Support", href: "/support", active: active === "support", icon: "lifebuoy" },
    { id: "community", label: "Community Side Quests", href: "/community", active: communityActive, icon: "flag" },
    { id: "settings", label: "Settings", href: "/settings", active: active === "settings", icon: "settings" },
  ];
  const dockItems: MobileDockItem[] = [
    { id: "home", label: "Home", href: "/", active: active === "home", image: "/brand/sqc-alt-logo-topbar-20260507-v2.png" },
    { id: "solo", label: "Side Quests", href: "/side-quests", active: sideQuestTabActive, image: "/sqc-logo-v11.png" },
    { id: "multiplayer", label: "Multiplayer Side Quests", href: "/multiplayer", active: multiplayerActive, icon: "users" },
    { id: "trophy", label: "Trophy Cabinet", href: "/trophy-cabinet", active: trophyActive, image: "/badges/v6/proof-loop-test-badge.png" },
    { id: "account", label: "Account", href: "/account", active: accountActive, icon: "account" },
  ];
  const primaryNavIds = new Set(["home", "solo", "multiplayer", "trophy", "account"]);
  const primaryNavItems = menuItems.filter((item) => primaryNavIds.has(item.id));
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
                    <span className="mobile-app-menu-glyph" aria-hidden="true">
                      <NavIcon name={item.icon} />
                    </span>
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
            {primaryNavItems.map((item) => (
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
              {"image" in item ? (
                <Image alt="" height={30} src={item.image} width={30} />
              ) : (
                <span><NavIcon name={item.icon} /></span>
              )}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

function NavIcon({ name }: { name: NavIconName }) {
  const common = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 2 };

  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...common} d="M4 11.5 12 5l8 6.5" />
        <path {...common} d="M6.5 10.5V20h11v-9.5" />
        <path {...common} d="M10 20v-5h4v5" />
      </svg>
    );
  }

  if (name === "flag") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...common} d="M6 21V4" />
        <path {...common} d="M7 4h11l-2.5 4L18 12H7" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...common} d="M9.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path {...common} d="M3.5 19c.8-3.2 3-5 6-5s5.2 1.8 6 5" />
        <path {...common} d="M16 11a2.5 2.5 0 0 0 .2-5" />
        <path {...common} d="M17 14.5c1.8.5 3 2 3.5 4.5" />
      </svg>
    );
  }

  if (name === "leaderboard") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...common} d="M5 20V9h4v11" />
        <path {...common} d="M10 20V5h4v15" />
        <path {...common} d="M15 20v-8h4v8" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...common} d="M12 21s7-3.5 7-10V5l-7-2-7 2v6c0 6.5 7 10 7 10Z" />
        <path {...common} d="m12 8 1 2.2 2.4.2-1.8 1.6.6 2.4-2.2-1.3-2.2 1.3.6-2.4-1.8-1.6 2.4-.2Z" />
      </svg>
    );
  }

  if (name === "ruler") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...common} d="m5 16 11-11 3 3L8 19H5Z" />
        <path {...common} d="m13 8 3 3" />
        <path {...common} d="m10.5 10.5 1.5 1.5" />
        <path {...common} d="M8 13l3 3" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...common} d="M12 5v14" />
        <path {...common} d="M5 12h14" />
      </svg>
    );
  }

  if (name === "lifebuoy") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle {...common} cx="12" cy="12" r="8" />
        <circle {...common} cx="12" cy="12" r="3" />
        <path {...common} d="m6.5 6.5 3.3 3.3" />
        <path {...common} d="m14.2 14.2 3.3 3.3" />
        <path {...common} d="m17.5 6.5-3.3 3.3" />
        <path {...common} d="m9.8 14.2-3.3 3.3" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle {...common} cx="12" cy="12" r="3" />
        <path {...common} d="M12 3v3" />
        <path {...common} d="M12 18v3" />
        <path {...common} d="M3 12h3" />
        <path {...common} d="M18 12h3" />
        <path {...common} d="m5.6 5.6 2.1 2.1" />
        <path {...common} d="m16.3 16.3 2.1 2.1" />
        <path {...common} d="m18.4 5.6-2.1 2.1" />
        <path {...common} d="m7.7 16.3-2.1 2.1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle {...common} cx="12" cy="8" r="4" />
      <path {...common} d="M5 21c1-4 3.3-6 7-6s6 2 7 6" />
    </svg>
  );
}
