import Image from "next/image";
import Link from "next/link";

type ActiveNavItem = "home" | "today" | "random" | "path" | "challenges" | "badges" | "scoreboard" | "rules" | "verifiers" | "share-kit" | "connect" | "account" | "result" | "proof-log";

type SiteNavProps = {
  isSignedIn: boolean;
  active: ActiveNavItem;
};

export default function SiteNav({ isSignedIn, active }: SiteNavProps) {
  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="brand-lockup" aria-label="Side Quest Chess home">
          <span className="brand-mark logo-mark" aria-hidden="true">
            <Image src="/sqc-logo-v2.png" alt="" width={120} height={120} priority />
          </span>
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
          <Link href="/share-kit" className={active === "share-kit" ? "active" : undefined}>Share kit</Link>
          <Link href="/connect" className={active === "connect" ? "active" : undefined}>Connect</Link>
          <Link href="/result" className={active === "result" ? "active" : undefined}>Proof card</Link>
          <Link href="/proof-log" className={active === "proof-log" ? "active" : undefined}>Proof log</Link>
          <Link href="/account" className={active === "account" ? "active" : undefined}>Profile</Link>
        </nav>

        <div className="nav-actions">
          {isSignedIn ? (
            <span className="nav-pill">Signed in</span>
          ) : (
            <>
              <Link href="/random" className="button secondary">Spin</Link>
              <Link href="/connect" className="button primary">Connect</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
