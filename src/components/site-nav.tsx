import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import AuthActionButtons from "@/components/auth-action-buttons";

type ActiveNavItem = "home" | "today" | "random" | "path" | "challenges" | "badges" | "scoreboard" | "rules" | "verifiers" | "share-kit" | "connect" | "account" | "profile" | "result" | "proof-log" | "beta" | "support";

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
            <img src="/brand/sqc-alt-logo-topbar-test.jpg" alt="" />
          </Link>
          <Link href="/" className={active === "home" ? "active" : undefined}>Home</Link>
          <Link href="/path" className={active === "path" ? "active" : undefined}>Starter path</Link>
          <Link href="/challenges" className={active === "challenges" ? "active" : undefined}>Quests</Link>
          <Link href="/today" className={active === "today" ? "active" : undefined}>Today</Link>
          <Link href="/badges" className={active === "badges" ? "active" : undefined}>Badges</Link>
          <Link href="/support" className={active === "support" ? "active" : undefined}>Support</Link>
          {isSignedIn ? (
            <Link href="/account" className={active === "account" ? "active" : undefined}>Account</Link>
          ) : null}
        </nav>

        <div className="nav-actions">
          {isSignedIn ? (
            <>
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
