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
            One lightweight account. Add your Lichess username, pick a quest, play real chess, and let SQC check the receipt.
          </p>
        </section>
        <section className="auth-card" aria-label="Sign up form">
          <SignUp signInUrl="/sign-in" fallbackRedirectUrl="/profile" />
        </section>
      </div>
    </main>
  );
}
