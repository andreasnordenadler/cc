import { SignIn } from "@clerk/nextjs";
import MobileAppWebShell from "@/components/mobile-app-web-shell";
import { safeAuthReturnPath } from "@/lib/auth-return-path";

type SignInPageProps = {
  searchParams?: Promise<{ redirect_url?: string | string[] }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const returnTo = safeAuthReturnPath(params?.redirect_url);
  const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent(returnTo)}`;

  return (
    <MobileAppWebShell activeTab="account" signedIn={false} desktopPresentation="auth">
      <div className="sqc-stack sqc-auth-workspace">
        <section className="sqc-panel hero sqc-auth-intro">
          <span className="sqc-eyebrow">Account</span>
          <h1>Sign in, then go make terrible chess decisions.</h1>
          <p>Logging in lets Side Quest Chess remember your profile, public chess usernames, active Side Quest, badges, and proof cards.</p>
          <div className="sqc-desktop-auth-context" aria-label="What your account keeps">
            <div><span>01</span><strong>Your quest log</strong><small>Active Solo and Multiplayer Side Quests stay ready across web and Android.</small></div>
            <div><span>02</span><strong>Public-game proof</strong><small>Connect a Lichess or Chess.com username. Your chess-site password stays there.</small></div>
            <div><span>03</span><strong>Unnecessary heraldry</strong><small>Proof receipts and unlocked Coats of Arms remain in your Trophy Cabinet.</small></div>
          </div>
        </section>
        <section className="sqc-auth-card" aria-label="Sign in form">
          <SignIn signUpUrl={signUpUrl} fallbackRedirectUrl={returnTo} />
        </section>
      </div>
    </MobileAppWebShell>
  );
}
