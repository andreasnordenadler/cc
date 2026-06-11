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
        <section className="hero-card auth-copy-card auth-copy-card-filled">
          <div>
            <span className="eyebrow">Start your SQC account</span>
            <h1>Make a runner profile for your Side Quests.</h1>
            <p className="hero-copy">
              One lightweight account saves your active run, proof receipts, coats of arms, and Multiplayer Side Quest tables.
            </p>
          </div>

          <div className="auth-run-guide" aria-label="New account setup guide">
            <div>
              <strong>1</strong>
              <span>Create the account</span>
              <small>Use it to keep runs, coats, receipts, and tables tied to the same runner profile.</small>
            </div>
            <div>
              <strong>2</strong>
              <span>Add proof source</span>
              <small>Connect a public Lichess or Chess.com username — never a chess-site password.</small>
            </div>
            <div>
              <strong>3</strong>
              <span>Pick a first run</span>
              <small>Start with Any Game Counts, browse Solo Side Quests, or join a Multiplayer table.</small>
            </div>
          </div>

          <div className="auth-ready-strip" aria-label="Account readiness checklist">
            <span>Public chess username ready</span>
            <span>Proof checks from public games</span>
            <span>Receipts saved after clears</span>
          </div>
        </section>
        <section className="auth-card" aria-label="Sign up form">
          <SignUp signInUrl={signInUrl} fallbackRedirectUrl={returnTo} />
        </section>
      </div>
    </main>
  );
}
