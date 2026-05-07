import { SignUp } from "@clerk/nextjs";
import SiteNav from "@/components/site-nav";

export default function SignUpPage() {
  return (
    <main className="site-shell">
      <SiteNav isSignedIn={false} active="account" />
      <div className="content-wrap auth-wrap">
        <section className="hero-card auth-copy-card">
          <span className="eyebrow">Create user profile</span>
          <h1>Make a profile for your chess side quests.</h1>
          <p className="hero-copy">
            One lightweight account. Add a public Lichess or Chess.com username, pick a side quest, play real chess, and let SQC check the receipt.
          </p>
          <div className="auth-reassurance-grid" aria-label="Sign-up privacy reassurance">
            <span>No chess-site passwords.</span>
            <span>Only public chess games.</span>
            <span>You can change usernames later.</span>
          </div>
        </section>
        <section className="auth-card" aria-label="Sign up form">
          <SignUp signInUrl="/sign-in" fallbackRedirectUrl="/profile" />
        </section>
      </div>
    </main>
  );
}
