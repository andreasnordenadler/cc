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
          <span className="brand-text">
            <strong>Side Quest Chess</strong>
            <span>stupidly hard side quests</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          <Link href="/" className={active === "home" ? "active" : undefined}>Home</Link>
          <Link href="/today" className={active === "today" ? "active" : undefined}>Today</Link>
          <Link href="/random" className={active === "random" ? "active" : undefined}>Random</Link>
          <Link href="/challenges" className={active === "challenges" ? "active" : undefined}>Challenges</Link>
          <Link href="/path" className={active === "path" ? "active" : undefined}>Path</Link>
          <Link href="/badges" className={active === "badges" ? "active" : undefined}>Badges</Link>
          <Link href="/scoreboard" className={active === "scoreboard" ? "active" : undefined}>Score</Link>
          <Link href="/rules" className={active === "rules" ? "active" : undefined}>Rules</Link>
          <Link href="/verifiers" className={active === "verifiers" ? "active" : undefined}>Verifiers</Link>
          <Link href="/beta" className={active === "beta" ? "active" : undefined}>Beta</Link>
          <Link href="/support" className={active === "support" ? "active" : undefined}>Support</Link>
          <Link href="/share-kit" className={active === "share-kit" ? "active" : undefined}>Share kit</Link>
          <Link href="/connect" className={active === "connect" ? "active" : undefined}>Connect</Link>
          <Link href="/result" className={active === "result" ? "active" : undefined}>Proof card</Link>
          <Link href="/proof-log" className={active === "proof-log" ? "active" : undefined}>Proof log</Link>
          <Link href="/account" className={active === "account" ? "active" : undefined}>Account</Link>
          <Link href="/profile" className={active === "profile" ? "active" : undefined}>Edit profile</Link>
        </nav>

        <div className="nav-actions">
          {isSignedIn ? (
            <>
              <Link href="/profile" className="button secondary">Edit profile</Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/random" className="button secondary">Spin</Link>
              <SignInButton mode="modal" fallbackRedirectUrl="/account">
                <button type="button" className="button secondary">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl="/profile">
                <button type="button" className="button primary">Connect</button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
