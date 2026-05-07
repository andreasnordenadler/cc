import { SignIn } from "@clerk/nextjs";
import SiteNav from "@/components/site-nav";

export default function SignInPage() {
  return (
    <main className="site-shell">
      <SiteNav isSignedIn={false} active="account" />
      <div className="content-wrap auth-wrap">
        <section className="hero-card auth-copy-card">
          <span className="eyebrow">User login</span>
          <h1>Sign in, then go make terrible chess decisions.</h1>
          <p className="hero-copy">
            Logging in lets Side Quest Chess remember your profile, public chess usernames, active side quest, badges, and proof cards.
          </p>
          <div className="auth-reassurance-grid" aria-label="Sign-in privacy reassurance">
            <span>No chess-site passwords.</span>
            <span>Only public Lichess/Chess.com games.</span>
            <span>Browse side quests before signing in.</span>
          </div>
        </section>
        <section className="auth-card" aria-label="Sign in form">
          <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/account" />
        </section>
      </div>
    </main>
  );
}
