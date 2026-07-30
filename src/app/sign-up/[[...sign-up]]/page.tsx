import { SignUp } from "@clerk/nextjs";
import MobileAppWebShell from "@/components/mobile-app-web-shell";
import { safeAuthReturnPath } from "@/lib/auth-return-path";

type SignUpPageProps = {
  searchParams?: Promise<{ redirect_url?: string | string[] }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const returnTo = safeAuthReturnPath(params?.redirect_url);
  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(returnTo)}`;

  return (
    <MobileAppWebShell activeTab="account" signedIn={false}>
      <div className="sqc-stack">
        <section className="sqc-panel hero">
          <span className="sqc-eyebrow">Account</span>
          <h1>Choose how to sign in.</h1>
          <p>Sign in to save progress, verify proof, manage Multiplayer Quests, and keep your Coat of Arms progress synced.</p>
        </section>
        <section className="sqc-auth-card" aria-label="Sign up form">
          <SignUp signInUrl={signInUrl} fallbackRedirectUrl={returnTo} />
        </section>
      </div>
    </MobileAppWebShell>
  );
}
