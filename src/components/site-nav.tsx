import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import AuthActionButtons from "@/components/auth-action-buttons";

type ActiveNavItem = "home" | "solo" | "custom" | "community" | "multiplayer" | "trophy" | "random" | "path" | "challenges" | "groupquests" | "badges" | "scoreboard" | "rules" | "verifiers" | "share-kit" | "connect" | "account" | "profile" | "result" | "beta" | "support";

type SiteNavProps = {
  isSignedIn: boolean;
  active: ActiveNavItem;
};

export default function SiteNav({ isSignedIn, active }: SiteNavProps) {
  const soloActive = active === "solo" || active === "challenges" || active === "random" || active === "path";
  const customActive = active === "custom";
  const communityActive = active === "community";
  const multiplayerActive = active === "multiplayer" || active === "groupquests";
  const trophyActive = active === "trophy" || active === "badges";

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
          <Link href="/trophy-cabinet" className={trophyActive ? "active" : undefined}>Trophy Cabinet</Link>
        </nav>

        <div className="nav-actions">
          {isSignedIn ? (
            <>
              <Link href="/account" className={active === "account" || active === "profile" || active === "connect" ? "nav-pill active" : "nav-pill"}>Account</Link>
              <Link href="/support" className={active === "support" ? "nav-pill active" : "nav-pill"}>Support</Link>
              <UserButton />
            </>
          ) : (
            <>
              <AuthActionButtons />
              <Link href="/support" className={active === "support" ? "nav-pill active" : "nav-pill"}>Support</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
