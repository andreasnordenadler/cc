import { SignUp } from "@clerk/nextjs";
import MobileAppWebShell from "@/components/mobile-app-web-shell";

type SignUpPageProps = {
  searchParams?: Promise<{ redirect_url?: string | string[] }>;
};

function safeRedirectPath(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/account";
  }

  return raw;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const returnTo = safeRedirectPath(params?.redirect_url);
  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(returnTo)}`;

  return (
    <MobileAppWebShell activeTab="account" signedIn={false}>
      <div className="sqc-stack">
        <section className="sqc-panel hero">
          <span className="sqc-eyebrow">Start your SQC account</span>
          <h1>Make a player profile for your Side Quests.</h1>
          <p>One lightweight account saves your active Side Quest, proof receipts, coats of arms, and Multiplayer Side Quests.</p>
        </section>
        <section className="sqc-auth-card" aria-label="Sign up form">
          <SignUp signInUrl={signInUrl} fallbackRedirectUrl={returnTo} />
        </section>
      </div>
    </MobileAppWebShell>
  );
}
