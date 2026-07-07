import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SideQuestModeSwitcher from "@/components/side-quest-mode-switcher";
import SiteNav from "@/components/site-nav";

export const metadata = {
  title: "Create Custom Side Quest · Side Quest Chess",
  description: "Start the Custom Side Quest builder flow for Side Quest Chess.",
};

export default async function CreateCustomSideQuestPage() {
  const user = await currentUser();
  if (user) redirect("/account/custom-side-quests#custom-side-quest-builder");

  return (
    <main className="site-shell challenges-page-shell">
      <SiteNav isSignedIn={false} active="create-custom" />

      <div className="content-wrap challenges-page-wrap app-side-quest-hub app-create-custom-route">
        <section className="challenges-clean-hero app-side-quest-hub-hero" aria-labelledby="create-custom-title">
          <div>
            <span className="eyebrow">Create Custom Side Quest</span>
            <h1 id="create-custom-title">Start the rule builder from Side Quests.</h1>
            <p>
              The mobile app opens Custom Side Quest creation from the Side Quests catalog. Sign in to save a private draft, publish to Community Side Quests, or use your rule in Multiplayer.
            </p>
            <div className="button-row hero-actions">
              <Link className="button primary" href="/sign-in">
                Continue with Google
              </Link>
              <Link className="button secondary" href="/community">
                Browse Community Side Quests
              </Link>
            </div>
          </div>
          <div className="app-side-quest-emblem" aria-hidden="true">
            <Image alt="" height={180} priority src="/badges/custom/custom-win-queen.png" width={180} />
          </div>
        </section>

        <SideQuestModeSwitcher active="create" />

        <section className="mission-card" aria-label="Create Custom Side Quest flow">
          <span className="eyebrow">Builder flow</span>
          <h2>Draft first, then publish when the rule is ready.</h2>
          <div className="account-run-checklist" aria-label="Custom Side Quest creation steps">
            <Link className="account-run-checklist-row ready" href="/sign-in">
              <span>1. Sign in</span>
              <strong>Save drafts, edits, published state, and proof history to your SQC account.</strong>
            </Link>
            <div className="account-run-checklist-row missing">
              <span>2. Build the rule</span>
              <strong>Name the quest, choose the proof condition, and keep optional rule slots tucked away until needed.</strong>
            </div>
            <div className="account-run-checklist-row missing">
              <span>3. Release or run</span>
              <strong>Keep it private, publish to Community Side Quests, or add it to a Multiplayer Side Quest lineup.</strong>
            </div>
          </div>
        </section>

        <section className="mission-card app-side-quest-proof-note" aria-labelledby="create-custom-parity-title">
          <p className="eyebrow">Parity note</p>
          <h2 id="create-custom-parity-title">Mobile app create-custom intent</h2>
          <p>
            Source: apps/mobile/App.tsx sets pendingSideQuestCatalogIntent to create-custom from the hamburger menu and opens the custom editor. This route now mirrors that as a dedicated web entry instead of being only a silent redirect.
          </p>
        </section>
      </div>
    </main>
  );
}
