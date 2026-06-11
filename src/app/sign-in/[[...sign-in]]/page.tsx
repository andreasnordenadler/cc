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
            <span className="eyebrow">SQC account</span>
            <h1>Sign in, then go make terrible chess decisions.</h1>
            <p className="hero-copy">
              Your account remembers your runner profile, public chess usernames, active Side Quest, coats, proof receipts, and Multiplayer tables.
            </p>
          </div>

          <div className="auth-run-guide" aria-label="Sign-in run guide">
            <div>
              <strong>1</strong>
              <span>Open your run</span>
              <small>Return to the Side Quest, table, or proof receipt you were trying to reach.</small>
            </div>
            <div>
              <strong>2</strong>
              <span>Check public games</span>
              <small>SQC only needs a public Lichess or Chess.com username — never a chess-site password.</small>
            </div>
            <div>
              <strong>3</strong>
              <span>Keep the receipt</span>
              <small>Passed runs save as proof cards and coats you can reopen or share later.</small>
            </div>
          </div>

          <div className="auth-lightweight-copy" aria-label="Lightweight sign-in notes">
            <p><strong>Lightweight by design.</strong> Browse before signing in; sign in when you want SQC to save progress, verify proof, or manage Multiplayer Side Quests.</p>
            <p>Use a public chess username only. SQC checks public games and stores the minimum needed to remember your quests, proof, and Coat of Arms progress.</p>
          </div>
        </section>
        <section className="auth-card" aria-label="Sign in form">
          <SignIn signUpUrl={signUpUrl} fallbackRedirectUrl={returnTo} />
        </section>
      </div>
    </main>
  );
}
