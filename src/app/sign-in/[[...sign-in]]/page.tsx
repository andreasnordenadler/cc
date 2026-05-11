import { SignIn } from "@clerk/nextjs";
import SiteNav from "@/components/site-nav";

type SignInPageProps = {
  searchParams?: Promise<{ redirect_url?: string | string[] }>;
};

function safeRedirectPath(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/account";
  }

  return raw;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const returnTo = safeRedirectPath(params?.redirect_url);
  const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent(returnTo)}`;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={false} active="account" />
      <div className="content-wrap auth-wrap">
        <section className="hero-card auth-copy-card auth-copy-card-filled">
          <div>
            <h1>Sign in, then go make terrible chess decisions.</h1>
            <p className="hero-copy">
              Logging in lets Side Quest Chess remember your profile, public chess usernames, active side quest, badges, and proof cards.
            </p>
          </div>
          <div className="auth-lightweight-copy" aria-label="Lightweight sign-in notes">
            <p><strong>Lightweight by design.</strong> We do not need or ask for any Lichess or Chess.com passwords.</p>
            <p>Use a public chess username only. SQC checks public games and stores the minimum needed to remember your quests, proof, and Coat of Arms progress.</p>
            <p>You can browse Side Quests before signing in. Sign in when you want SQC to save progress, verify proof, or manage Multiplayer Quests.</p>
          </div>
        </section>
        <section className="auth-card" aria-label="Sign in form">
          <SignIn signUpUrl={signUpUrl} fallbackRedirectUrl={returnTo} />
        </section>
      </div>
    </main>
  );
}
