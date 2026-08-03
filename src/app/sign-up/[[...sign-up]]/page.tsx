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
    <MobileAppWebShell activeTab="account" signedIn={false} desktopPresentation="auth">
      <div className="sqc-stack sqc-auth-workspace">
        <section className="sqc-panel hero sqc-auth-intro">
          <span className="sqc-eyebrow">Account</span>
          <h1>Choose how to sign in.</h1>
          <p>Sign in to save progress, verify proof, manage Multiplayer Quests, and keep your Coat of Arms progress synced.</p>
          <div className="sqc-desktop-auth-context" aria-label="What comes with your profile">
            <div><span>01</span><strong>One shared quest log</strong><small>Your account state follows you between the desktop site and Android app.</small></div>
            <div><span>02</span><strong>Proof without passwords</strong><small>Side Quest Chess reads finished public games, never your chess-site password.</small></div>
            <div><span>03</span><strong>A cabinet for bad ideas</strong><small>Keep proof receipts, completed Side Quests, and every unlocked coat together.</small></div>
          </div>
        </section>
        <section className="sqc-auth-card" aria-label="Sign up form">
          <SignUp signInUrl={signInUrl} fallbackRedirectUrl={returnTo} />
        </section>
      </div>
    </MobileAppWebShell>
  );
}
