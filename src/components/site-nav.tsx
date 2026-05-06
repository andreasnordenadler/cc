import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import AuthActionButtons from "@/components/auth-action-buttons";

type ActiveNavItem = "home" | "random" | "path" | "challenges" | "badges" | "scoreboard" | "rules" | "verifiers" | "share-kit" | "connect" | "account" | "profile" | "result" | "proof-log" | "beta" | "support";

type SiteNavProps = {
  isSignedIn: boolean;
  active: ActiveNavItem;
};

export default function SiteNav({ isSignedIn, active }: SiteNavProps) {
  return (
    <header className="site-nav softer-site-nav">
      <div className="site-nav-inner">
        <nav className="nav-links" aria-label="Primary">
          <Link href="/" className="nav-brand-mark" aria-label="Side Quest Chess home">
            <img src="/brand/sqc-alt-logo-topbar-transparent.png" alt="" />
          </Link>
          <Link href="/" className={active === "home" ? "active" : undefined}>Home</Link>
          <Link href="/challenges" className={active === "challenges" ? "active" : undefined}>Quests</Link>
          <Link href="/badges" className={active === "badges" ? "active" : undefined}>Coat of Arms</Link>
          <Link href="/scoreboard" className={active === "scoreboard" ? "active" : undefined}>Leaderboard</Link>
          <Link href="/support" className={active === "support" ? "active" : undefined}>Support</Link>
        </nav>

        <div className="nav-actions">
          {isSignedIn ? (
            <>
              <Link href="/account" className={active === "account" ? "nav-pill active" : "nav-pill"}>My Side Quests</Link>
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
