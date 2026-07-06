import type { Metadata } from "next";
import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import SupportContactForm from "@/components/support-contact-form";
import { getSupportMessages } from "@/lib/analytics";
import { getActiveChallenge, getChallengeAttempts, getChallengeProgress, getChessComUsername, getLichessUsername, getRunnerDisplayName, type UserMetadataRecord } from "@/lib/user-metadata";

export const metadata: Metadata = {
  title: "Help & Support — Side Quest Chess",
  description:
    "Help and support notes for Side Quest Chess: public-game checks, proof receipts, account setup, and what to send when something looks wrong.",
  openGraph: {
    title: "Help & Support — Side Quest Chess",
    description:
      "What Side Quest Chess reads, what it never asks for, and how to report proof or account issues.",
    url: "/support",
  },
};

const supportTopics = [
  {
    label: "Your active Side Quest",
    value: "Current Solo proof",
    copy: "The active card shows the Solo Side Quest you are trying now. Play a new public game on the Lichess or Chess.com username you connected, then come back and check proof.",
  },
  {
    label: "Choosing a Solo Side Quest",
    value: "Pick one quest",
    copy: "Pick one Solo Side Quest at a time. After you choose it, play a new public Lichess or Chess.com game so Side Quest Chess has a fresh game to check.",
  },
  {
    label: "Why proof may not verify",
    value: "Public, finished, matching",
    copy: "If a game does not verify, make sure it is public, finished, on the connected username, played after you picked the quest, and matches the Side Quest rule.",
  },
  {
    label: "Coat of Arms",
    value: "Trophy Cabinet unlocks",
    copy: "Completing a Side Quest unlocks its Coat of Arms. Your unlocked coats stay in your account and can be opened from the Trophy Cabinet.",
  },
  {
    label: "This Multiplayer Side Quest",
    value: "Rules, players, scores",
    copy: "A Multiplayer Side Quest page shows the time window, rules, players, and leaderboard. Join while it is open, play matching public games during the window, then refresh proof.",
  },
  {
    label: "Multiplayer Side Quests",
    value: "Separate scored quests",
    copy: "Browse shared Multiplayer Side Quests, create your own, or join official ones. Multiplayer progress is scored separately from your Solo Side Quest.",
  },
  {
    label: "Connecting chess accounts",
    value: "Public username only",
    copy: "Add your public Lichess or Chess.com username so Side Quest Chess knows which games belong to you. It only reads public game records and never needs your chess-site password.",
  },
];


const reportChecklist = [
  {
    label: "Proof result",
    copy: "Tell us which Side Quest, chess site, username, and game or proof link you expected SQC to check.",
  },
  {
    label: "What felt wrong",
    copy: "Describe the result you saw, the result you expected, and whether the game was public and finished.",
  },
  {
    label: "Community report",
    copy: "For Community Solo Side Quests or Multiplayer, include the quest link and the public player or host name shown on SQC.",
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
    copy: "SQC stores your sign-in profile, saved chess usernames, active quest, coat-of-arms progress, and proof receipts.",
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
          <span className="eyebrow">Help &amp; Support</span>
          <h1>Help &amp; Support.</h1>
          <p className="hero-copy">
            Side Quest Chess checks public chess games, saves your quest progress, and turns completed nonsense into proof receipts. Here is the simple version of what to do when something looks wrong — and what data SQC does, and does not, need.
          </p>
          <div className="button-row hero-actions">
            <Link href="/solo" className="button primary">Browse quests</Link>
            <Link href="/connect" className="button secondary">Connect chess username</Link>
            <Link href="/rules" className="button secondary">Read proof rules</Link>
            <Link href="/privacy" className="button secondary">Privacy Policy</Link>
            <Link href="/terms" className="button secondary">Terms of Use</Link>
          </div>
        </section>

        <section className="grid" aria-label="Support topics">
          {supportTopics.map((item) => (
            <Fact key={item.label} label={item.label} value={item.value} copy={item.copy} />
          ))}
        </section>

        <section className="mission-card support-simple-card support-report-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Contact us</span>
              <h2>Send the smallest useful proof packet.</h2>
            </div>
            <span className="badge gold">safe report</span>
          </div>
          <p>
            Keep it focused: quest name, chess site, public username, game or proof link if relevant, what SQC showed, and what you expected instead. A screenshot helps if the issue is visual. For deletion requests, include the account email or profile details needed to identify your SQC account.
          </p>
          <div className="support-report-grid" aria-label="What to include in a support report">
            {reportChecklist.map((item) => (
              <article key={item.label} className="support-report-step">
                <strong>{item.label}</strong>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
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
    `Surface: SQC web`,
    `Runner display name saved: ${getRunnerDisplayName(metadata) ? "yes" : "no"}`,
    `Lichess username saved: ${getLichessUsername(metadata) ? "yes" : "no"}`,
    `Chess.com username saved: ${getChessComUsername(metadata) ? "yes" : "no"}`,
    `Active Solo Side Quest: ${activeChallenge?.id ?? "none"}`,
    `Completed solo quests: ${progress.totalCompletedChallenges}`,
    `Coat-of-Arms progress: ${progress.totalCompletedChallenges}`,
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
  if (host) lines.push(`Host / public player context: ${host}`);
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
