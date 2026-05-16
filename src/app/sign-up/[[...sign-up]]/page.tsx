import { SignUp } from "@clerk/nextjs";
import SiteNav from "@/components/site-nav";

type SignUpPageProps = {
  searchParams?: Promise<{ redirect_url?: string | string[] }>;
};

function safeRedirectPath(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/profile";
  }

  return raw;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const returnTo = safeRedirectPath(params?.redirect_url);
  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(returnTo)}`;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={false} active="account" />
      <div className="content-wrap auth-wrap">
        <section className="hero-card auth-copy-card">
          <h1>Make a profile for your chess side quests.</h1>
          <p className="hero-copy">
            One lightweight account. Right after sign-up, add one public Lichess or Chess.com username — that is what unlocks quest verification.
          </p>
        </section>
        <section className="auth-card" aria-label="Sign up form">
          <SignUp signInUrl={signInUrl} fallbackRedirectUrl={returnTo} />
        </section>
      </div>
    </main>
  );
}
