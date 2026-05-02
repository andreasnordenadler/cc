import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

type ActiveNavItem = "home" | "today" | "random" | "path" | "challenges" | "badges" | "scoreboard" | "rules" | "verifiers" | "share-kit" | "connect" | "account" | "profile" | "result" | "proof-log" | "beta" | "support";

type SiteNavProps = {
  isSignedIn: boolean;
  active: ActiveNavItem;
};

export default function SiteNav({ isSignedIn, active }: SiteNavProps) {
  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="brand-lockup" aria-label="Side Quest Chess home">
          <Image src="/sqc-logo.png" alt="Side Quest Chess" width={1254} height={1254} priority className="brand-logo" />
        </Link>

        <nav className="nav-links" aria-label="Primary">
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
              <Link href="/challenges" className="button primary">Start quest</Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal" fallbackRedirectUrl="/account">
                <button type="button" className="button secondary">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl="/connect">
                <button type="button" className="button primary">Connect</button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
