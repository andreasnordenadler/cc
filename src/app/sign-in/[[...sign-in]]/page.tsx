import { SignIn } from "@clerk/nextjs";
import SiteNav from "@/components/site-nav";

export default function SignInPage() {
  return (
    <main className="site-shell">
      <SiteNav isSignedIn={false} active="account" />
      <div className="content-wrap auth-wrap">
        <section className="hero-card auth-copy-card">
          <h1>Sign in, then go make terrible chess decisions.</h1>
          <p className="hero-copy">
            Logging in lets Side Quest Chess remember your profile, public chess usernames, active side quest, badges, and proof cards.
          </p>
        </section>
        <section className="auth-card" aria-label="Sign in form">
          <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/account" />
        </section>
      </div>
    </main>
  );
}
