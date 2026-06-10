import type { Metadata } from "next";
import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import SupportContactForm from "@/components/support-contact-form";
import { getSupportMessages } from "@/lib/analytics";
import { getActiveChallenge, getChallengeAttempts, getChallengeProgress, getChessComUsername, getLichessUsername, getRunnerDisplayName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata: Metadata = {
  title: "Support & privacy — Side Quest Chess",
  description:
    "Support and privacy notes for Side Quest Chess: public-game checks, proof receipts, account setup, and what to send when something looks wrong.",
  openGraph: {
    title: "Support & privacy — Side Quest Chess",
    description:
      "What Side Quest Chess reads, what it never asks for, and how to report proof or account issues.",
    url: "/support",
  },
};

const supportTopics = [
  {
    label: "How Side Quests work",
    value: "Pick, play, prove",
    copy: "Choose one Solo Side Quest at a time, play a new public game on your connected Lichess or Chess.com account, then come back and check proof.",
  },
  {
    label: "Why proof may not verify",
    value: "Public, finished, matching",
    copy: "If a game does not verify, make sure it is public, finished, on the connected username, played after you picked the quest, and matches the Side Quest rule.",
  },
  {
    label: "Connecting chess accounts",
    value: "Public username only",
    copy: "Add your public Lichess or Chess.com username so SQC knows which games to check. SQC only reads public game records.",
  },
  {
    label: "Multiplayer Side Quests",
    value: "Separate scored tables",
    copy: "Browse shared Multiplayer Side Quests, create your own, or join official tables. Multiplayer progress is scored separately from your Solo Side Quest.",
  },
  {
    label: "Coat of Arms",
    value: "Trophy Cabinet unlocks",
    copy: "Completing a Side Quest unlocks its Coat of Arms. Your unlocked coats stay in your account and can be opened from the Trophy Cabinet.",
  },
];

const privacyNotes = [
  {
    label: "Reads",
    value: "Public chess games",
    copy: "When you run a proof check, SQC reads recent public games for the Lichess or Chess.com username saved on your profile.",
  },
  {
    label: "Stores",
    value: "SQC progress",
    copy: "SQC stores your sign-in profile, saved chess usernames, active quest, points, coat-of-arms progress, and proof receipts.",
  },
  {
    label: "Never asks for",
    value: "Chess-site passwords",
    copy: "Never enter a Lichess or Chess.com password into SQC. Proof checks are username-based and public-game based.",
  },
  {
    label: "Can help remove",
    value: "SQC account data",
    copy: "Use support for deletion requests involving saved SQC usernames, progress, proof receipts, or public proof links controlled by Side Quest Chess.",
  },
];

export default async function SupportPage({ searchParams }: { searchParams?: Promise<{ topic?: string; quest?: string; host?: string }> }) {
  const { userId } = await auth();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const supportContext = buildSupportContext(resolvedSearchParams);
  const signedInUser = userId ? await (await clerkClient()).users.getUser(userId) : null;
  const userMetadata = (signedInUser?.privateMetadata ?? {}) as UserMetadataRecord;
  const supportMessages = signedInUser ? getSupportMessages(signedInUser.privateMetadata) : [];
  const supportDiagnostics = signedInUser ? buildSupportDiagnostics(userMetadata) : "";

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="support" />

      <div className="content-wrap">
        <section className="hero-card support-launch-hero">
          <h1>Support & privacy.</h1>
          <p className="hero-copy">
            Side Quest Chess checks public chess games, saves your quest progress, and turns completed nonsense into proof receipts. Here is the simple version of what to do when something looks wrong — and what data SQC does, and does not, need.
          </p>
          <div className="button-row hero-actions">
            <Link href="/challenges" className="button primary">Browse quests</Link>
            <Link href="/connect" className="button secondary">Connect chess username</Link>
            <Link href="/rules" className="button secondary">Read proof rules</Link>
            <Link href="/terms" className="button secondary">Terms of Use</Link>
          </div>
        </section>

        <section className="grid" aria-label="Support topics">
          {supportTopics.map((item) => (
            <Fact key={item.label} label={item.label} value={item.value} copy={item.copy} />
          ))}
        </section>

        <section className="mission-card support-simple-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Contact us</span>
              <h2>Send the smallest useful proof packet.</h2>
            </div>
          </div>
          <p>
            Include the quest name, chess site, public username, game link if relevant, the receipt result you saw, and what you expected instead. For deletion requests, include the account email or profile details needed to identify your SQC account. A screenshot helps if the issue is visual.
          </p>
          <SupportContactForm isSignedIn={Boolean(userId)} initialMessages={supportMessages} initialContext={supportContext} supportDiagnostics={supportDiagnostics} />
        </section>

        <section className="mission-card support-simple-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Data basics</span>
              <h2>Public games only. No password nonsense.</h2>
            </div>
            <span className="badge gold">privacy first</span>
          </div>
          <div className="grid">
            {privacyNotes.map((item) => (
              <Fact key={item.label} label={item.label} value={item.value} copy={item.copy} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function buildSupportDiagnostics(metadata: UserMetadataRecord) {
  const progress = getChallengeProgress(metadata);
  const activeChallenge = getActiveChallenge(metadata);
  const attempts = getChallengeAttempts(metadata);
  const supportMessages = getSupportMessages(metadata);
  const lines = [
    `Surface: website`,
    `Runner display name saved: ${getRunnerDisplayName(metadata) ? "yes" : "no"}`,
    `Lichess username saved: ${getLichessUsername(metadata) ? "yes" : "no"}`,
    `Chess.com username saved: ${getChessComUsername(metadata) ? "yes" : "no"}`,
    `Active solo quest: ${activeChallenge?.id ?? "none"}`,
    `Completed solo quests: ${progress.totalCompletedChallenges}`,
    `Reward points: ${progress.totalRewardPoints}`,
    `Stored proof attempts: ${attempts.length}`,
    `Support thread messages: ${supportMessages.length}`,
  ];

  return lines.join("\n");
}

function buildSupportContext(searchParams: { topic?: string; quest?: string; host?: string }) {
  const topic = typeof searchParams.topic === "string" ? searchParams.topic : "";
  const quest = typeof searchParams.quest === "string" ? searchParams.quest : "";
  const host = typeof searchParams.host === "string" ? searchParams.host : "";

  if (!topic && !quest && !host) return "";

  const lines = [
    topic === "community-multiplayer" ? "Report Community Multiplayer Side Quest" : topic === "community-side-quest" ? "Report Community Solo Side Quest" : "Side Quest Chess support request",
  ];
  if (quest) lines.push(`Quest ID: ${quest}`);
  if (host) lines.push(`Host / creator context: ${host}`);
  lines.push("", "What happened:");
  return lines.join("\n");
}

function Fact({ label, value, copy }: { label: string; value: string; copy: string }) {
  return (
    <article className="stat-card mission-card">
      <span className="eyebrow">{label}</span>
      <h3>{value}</h3>
      <p>{copy}</p>
    </article>
  );
}
