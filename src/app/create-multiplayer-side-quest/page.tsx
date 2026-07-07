import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MultiplayerModeSwitcher from "@/components/multiplayer-mode-switcher";
import SiteNav from "@/components/site-nav";

export const metadata = {
  title: "Create Multiplayer Side Quest · Side Quest Chess",
  description: "Start the Multiplayer Side Quest creation flow from the mobile app hamburger action.",
};

export default async function CreateMultiplayerSideQuestAlias({
  searchParams,
}: {
  searchParams?: Promise<{ quest?: string | string[] }>;
}) {
  const { userId } = await auth();
  const resolvedSearchParams = await searchParams;
  const rawRequestedQuestId = Array.isArray(resolvedSearchParams?.quest)
    ? resolvedSearchParams?.quest[0]
    : resolvedSearchParams?.quest;
  const createHref = rawRequestedQuestId
    ? `/groupquests/create?quest=${encodeURIComponent(rawRequestedQuestId)}`
    : "/groupquests/create";

  if (userId) redirect(createHref);

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={false} active="create-multiplayer" />

      <div className="content-wrap challenges-page-wrap app-side-quest-hub app-create-custom-route">
        <section className="challenges-clean-hero app-side-quest-hub-hero" aria-labelledby="create-multiplayer-title">
          <div>
            <span className="eyebrow">Create Multiplayer Side Quest</span>
            <h1 id="create-multiplayer-title">Host the shared Side Quest flow from Multiplayer.</h1>
            <p>
              The mobile app opens this action from the hamburger menu and the Multiplayer Side Quests screen. Sign in to pick up to four Side Quests, set the proof window, choose invite visibility, and share the table with players.
            </p>
            <div className="button-row hero-actions">
              <Link className="button primary" href={`/sign-in?redirect_url=${encodeURIComponent(createHref)}`}>
                Continue with Google
              </Link>
              <Link className="button secondary" href="/multiplayer">
                Browse Multiplayer Side Quests
              </Link>
            </div>
          </div>
          <div className="app-side-quest-emblem multiplayer" aria-hidden="true">
            <Image alt="" height={180} priority src="/stamps/sqc-multiplayer-seal.png" width={180} />
          </div>
        </section>

        <MultiplayerModeSwitcher active="create" />

        <section className="mission-card groupquests-create-mobile-map" aria-label="Create Multiplayer Side Quest flow">
          <div className="section-head compact">
            <div>
              <span className="eyebrow">Create</span>
              <h2>Build the same Multiplayer Side Quest structure as the app.</h2>
              <p>Creation stays inside the Multiplayer product surface: title, invite copy, Side Quest stack, provider rules, proof window, and visibility.</p>
            </div>
            <div className="create-max-pill">
              <strong>Max 4</strong>
              <span>Side Quests</span>
            </div>
          </div>

          <div className="groupquests-create-flow-grid" aria-label="Create Multiplayer Side Quest mobile fields">
            <div>
              <span>1</span>
              <strong>Name and invite copy</strong>
              <p>A Multiplayer Side Quest where everyone tries the same Side Quests with fresh public games.</p>
            </div>
            <div>
              <span>2</span>
              <strong>Pick Side Quests</strong>
              <p>Official Side Quests open first; Community and Custom rules are available after sign-in.</p>
            </div>
            <div>
              <span>3</span>
              <strong>Provider and rules</strong>
              <p>Lichess or Chess.com, plus time control, rated state, and color constraints.</p>
            </div>
            <div>
              <span>4</span>
              <strong>Proof window and invite</strong>
              <p>Choose public listing, unlisted invite, or private host code with a clear start and deadline.</p>
            </div>
          </div>
        </section>

        <section className="mission-card app-side-quest-proof-note" aria-labelledby="create-multiplayer-parity-title">
          <p className="eyebrow">Parity note</p>
          <h2 id="create-multiplayer-parity-title">Mobile app create Multiplayer intent</h2>
          <p>
            Source: apps/mobile/App.tsx exposes Create Multiplayer Side Quest from the hamburger menu and Multiplayer action card. This route now mirrors that intent as a real web screen before handing signed-in players to the existing builder.
          </p>
        </section>
      </div>
    </main>
  );
}
