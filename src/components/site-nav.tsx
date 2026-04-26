import Image from "next/image";
import Link from "next/link";

type ActiveNavItem = "home" | "challenges" | "badges" | "connect" | "account" | "result";

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
            <Image src="/sqc-temp-logo.jpg" alt="" width={120} height={63} priority />
          </span>
          <span className="brand-text">
            <strong>Side Quest Chess</strong>
            <span>stupidly hard side quests</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          <Link href="/" className={active === "home" ? "active" : undefined}>Home</Link>
          <Link href="/challenges" className={active === "challenges" ? "active" : undefined}>Challenges</Link>
          <Link href="/badges" className={active === "badges" ? "active" : undefined}>Badges</Link>
          <Link href="/connect" className={active === "connect" ? "active" : undefined}>Connect</Link>
          <Link href="/result" className={active === "result" ? "active" : undefined}>Proof card</Link>
          <Link href="/account" className={active === "account" ? "active" : undefined}>Profile</Link>
        </nav>

        <div className="nav-actions">
          {isSignedIn ? (
            <span className="nav-pill">Signed in</span>
          ) : (
            <>
              <Link href="/challenges" className="button secondary">Browse</Link>
              <Link href="/connect" className="button primary">Connect</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
