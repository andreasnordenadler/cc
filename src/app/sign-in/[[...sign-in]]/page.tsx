import { SignIn } from "@clerk/nextjs";
import MobileAppWebShell from "@/components/mobile-app-web-shell";

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
    <MobileAppWebShell activeTab="account" signedIn={false}>
      <div className="sqc-stack">
        <section className="sqc-panel hero">
          <span className="sqc-eyebrow">Account</span>
          <h1>Sign in, then go make terrible chess decisions.</h1>
          <p>Logging in lets Side Quest Chess remember your profile, public chess usernames, active Side Quest, badges, and proof cards.</p>
        </section>
        <section className="sqc-auth-card" aria-label="Sign in form">
          <SignIn signUpUrl={signUpUrl} fallbackRedirectUrl={returnTo} />
        </section>
      </div>
    </MobileAppWebShell>
  );
}
