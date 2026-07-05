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

  return (
    <header className="site-nav softer-site-nav">
      <div className="site-nav-inner">
        <nav className="nav-links" aria-label="Primary">
          <Link href="/" className="nav-brand-mark" aria-label="Side Quest Chess home">
            <img src="/brand/sqc-alt-logo-topbar-20260507-v2.png" alt="" />
          </Link>
          <Link href="/" className={active === "home" ? "active" : undefined}>Home</Link>
          <Link href="/solo" className={soloActive ? "active" : undefined}>Solo</Link>
          <Link href="/custom" className={customActive ? "active" : undefined}>Custom</Link>
          <Link href="/community" className={communityActive ? "active" : undefined}>Community</Link>
          <Link href="/multiplayer" className={multiplayerActive ? "active" : undefined}>Multiplayer</Link>
          <Link href="/leaderboards" className={leaderboardsActive ? "active" : undefined}>Leaderboards</Link>
          <Link href="/trophy-cabinet" className={trophyActive ? "active" : undefined}>Trophy Cabinet</Link>
        </nav>

        <div className="nav-actions">
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
  );
}
