import Image from "next/image";
import Link from "next/link";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import SiteNav from "@/components/site-nav";
import { getCustomSideQuests, type CustomSideQuest } from "@/lib/custom-side-quests";
import { describeCustomSideQuestRule, describeCustomSideQuestRuleDetails } from "@/lib/community-side-quests";
import { getPreferredRunnerName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata = {
  title: "My Custom Side Quests · Side Quest Chess",
  description: "Manage your Side Quest Chess custom Side Quest library.",
};

export default async function MyCustomSideQuestsPage() {
  noStore();
  const authUser = await currentUser();
  if (!authUser) redirect("/sign-in");

  const client = await clerkClient();
  const user = await client.users.getUser(authUser.id);
  const publicMetadata = user.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? (user.privateMetadata as UserMetadataRecord) : {};
  const customQuests = getCustomSideQuests(privateMetadata).length ? getCustomSideQuests(privateMetadata) : getCustomSideQuests(publicMetadata);
  const runnerDisplayName = getPreferredRunnerName(publicMetadata, {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    emailAddress: user.primaryEmailAddress?.emailAddress,
  }) || "SQC player";

  const publishedPublic = customQuests.filter((quest) => quest.lifecycle === "published" && quest.visibility === "public").length;
  const privateCount = customQuests.filter((quest) => quest.visibility !== "public").length;
  const draftCount = customQuests.filter((quest) => quest.lifecycle === "draft").length;
  const archivedCount = customQuests.filter((quest) => quest.lifecycle === "archived").length;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn active="account" />

      <div className="content-wrap quest-detail-wrap">
        <Link href="/account" className="button secondary back-to-hub">← Back to account</Link>

        <section className="hero-card side-quests-hub-hero">
          <span className="eyebrow">My Custom Side Quests</span>
          <h1>{runnerDisplayName}&apos;s suspicious recipe shelf.</h1>
          <p className="hero-copy">
            This is the website view of your Custom Side Quest library: drafts, private experiments, published public recipes, and archived ideas that probably deserved it.
          </p>
          <div className="hero-actions button-row">
            <Link className="button primary" href="/challenges/community">Browse Community Solo</Link>
            <Link className="button secondary" href="/groupquests/create">Use one in Multiplayer</Link>
          </div>
        </section>

        <section className="grid side-quest-mode-grid" aria-label="Custom Side Quest library summary">
          <StatCard label="Published public" value={publishedPublic} copy="Visible on the Community Solo browse page." />
          <StatCard label="Private" value={privateCount} copy="Only available to you and your own Multiplayer lineups." />
          <StatCard label="Draft / archived" value={draftCount + archivedCount} copy="Not public and not available for public discovery." />
        </section>

        <section className="mission-card" aria-label="My Custom Side Quest library">
          <div className="section-head">
            <div>
              <span className="eyebrow">Library</span>
              <h2>{customQuests.length ? "Your saved bad ideas." : "No saved custom Side Quests yet."}</h2>
              <p>
                Website management starts with clear ownership and lifecycle visibility. Editing still belongs in the app for now; the website gives you the safer public/private map.
              </p>
            </div>
            <span className="badge gold">{customQuests.length}</span>
          </div>

          {customQuests.length ? (
            <div className="big-grid starter-route-grid">
              {customQuests.map((quest) => <CustomQuestCard key={quest.id} quest={quest} />)}
            </div>
          ) : (
            <div className="groupquest-empty-state" role="status">
              <p>No custom recipes yet. Use the mobile app to create one, then come back here when the shelf starts looking dangerous.</p>
              <Link className="button primary" href="/challenges/community">Browse public examples</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ copy, label, value }: { copy: string; label: string; value: number }) {
  return (
    <article className="mission-card side-quest-mode-card">
      <span className="eyebrow">{label}</span>
      <h2>{value}</h2>
      <p>{copy}</p>
    </article>
  );
}

function CustomQuestCard({ quest }: { quest: CustomSideQuest }) {
  const isPublic = quest.visibility === "public" && quest.lifecycle === "published";
  const lifecycle = quest.lifecycle ?? "published";
  const statusLabel = isPublic ? "Public" : lifecycle === "draft" ? "Draft" : lifecycle === "archived" ? "Archived" : "Private";
  const statusTone = isPublic ? "green" : lifecycle === "archived" ? "" : "gold";
  const ruleDetails = describeCustomSideQuestRuleDetails(quest.config).slice(0, 3);

  return (
    <article className="challenge-card community-side-quest-card">
      <div className="challenge-card-art custom-side-quest-art" aria-hidden="true">
        <Image src={quest.badgeImageUrl || "/badges/custom/custom-side-quest-crest.png"} alt="" width={96} height={96} />
      </div>
      <div className="challenge-card-body">
        <span className="eyebrow">Custom · {statusLabel}</span>
        <h3>{quest.title}</h3>
        <p>{quest.summary}</p>
        <div className="public-groupquest-meta">
          <small>{describeCustomSideQuestRule(quest.config)}</small>
          <small>Updated {formatDate(quest.updatedAt)}</small>
        </div>
        <div className="groupquest-onboarding-steps">
          {ruleDetails.map((line, index) => (
            <div className="groupquest-onboarding-step" key={`${quest.id}-${index}`}>
              <em>{index + 1}</em>
              <span><strong>{index === 0 ? "Rule" : "Also"}</strong><small>{line}</small></span>
            </div>
          ))}
        </div>
        <div className="button-row">
          <span className={statusTone ? `badge ${statusTone}` : "badge"}>{statusLabel}</span>
          {isPublic ? <Link className="button secondary" href={`/challenges/community/${encodeURIComponent(quest.id)}`}>Open public page</Link> : null}
          {lifecycle !== "archived" ? <Link className="button ghost" href="/groupquests/create">Use in Multiplayer</Link> : null}
        </div>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "Europe/Stockholm" }).format(date);
}
