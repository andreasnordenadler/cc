import type { Metadata } from "next";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import SiteNav from "@/components/site-nav";
import { getAnalyticsStore, isAdminAnalyticsViewer, type SQCAnalyticsEvent } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "SQC Analytics · Side Quest Chess",
  robots: { index: false, follow: false },
};

type AnalyticsUserRow = {
  id: string;
  name: string;
  email: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  pageViews: number;
  questStarts: number;
  questCompletions: number;
  questFailures: number;
  questPending: number;
  profileSaves: number;
  recentEvents: SQCAnalyticsEvent[];
};

type QuestSummary = {
  questId: string;
  starts: number;
  completions: number;
  failures: number;
  pending: number;
};

export default async function AdminAnalyticsPage() {
  const authState = await auth();
  const viewer = await currentUser().catch(() => null);
  const claimEmail = getEmailFromClaims(authState.sessionClaims);
  const canView = isAdminAnalyticsViewer(viewer) || isAllowedAdminEmail(claimEmail);

  if (!canView) {
    return (
      <main className="site-shell">
        <SiteNav isSignedIn={Boolean(viewer)} active="account" />
        <div className="content-wrap">
          <section className="hero-card">
            <span className="eyebrow">SQC Analytics</span>
            <h1>Admin access needed.</h1>
            <p className="hero-copy">
              This private dashboard shows user activity and quest outcomes. Ask Sam to grant your Clerk user <code>sqcAdmin</code> access or add your email to <code>SQC_ADMIN_EMAILS</code>.
            </p>
            <Link href="/account" className="button secondary">Back to My Side Quests</Link>
          </section>
        </div>
      </main>
    );
  }

  const client = await clerkClient();
  const response = await client.users.getUserList({ limit: 100, orderBy: "-created_at" });
  const rows: AnalyticsUserRow[] = response.data.map((user) => {
    const store = getAnalyticsStore(user.privateMetadata);
    return {
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Unnamed user",
      email: user.primaryEmailAddress?.emailAddress ?? "No email",
      firstSeenAt: store.firstSeenAt,
      lastSeenAt: store.lastSeenAt,
      pageViews: store.pageViews ?? 0,
      questStarts: store.questStarts ?? 0,
      questCompletions: store.questCompletions ?? 0,
      questFailures: store.questFailures ?? 0,
      questPending: store.questPending ?? 0,
      profileSaves: store.profileSaves ?? 0,
      recentEvents: store.recentEvents ?? [],
    };
  });
  const activeRows = rows.filter((row) => row.pageViews || row.questStarts || row.profileSaves || row.recentEvents.length);
  const questSummaries = buildQuestSummaries(response.data.map((user) => getAnalyticsStore(user.privateMetadata).questStats ?? {}));
  const totalUsers = response.data.length;
  const activeUsers = activeRows.length;
  const totalPageViews = sum(activeRows, "pageViews");
  const totalQuestStarts = sum(activeRows, "questStarts");
  const totalCompletions = sum(activeRows, "questCompletions");
  const totalFailures = sum(activeRows, "questFailures");
  const recentEvents = activeRows
    .flatMap((row) => row.recentEvents.map((event) => ({ ...event, user: row.name, email: row.email })))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 30);

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(viewer)} active="account" />
      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">SQC Analytics</span>
          <h1>User activity command center.</h1>
          <p className="hero-copy">
            First-party activity tracking for launch: sign-ins, page views, profile saves, quest starts, completions, failures, and pending checks.
          </p>
        </section>

        <section className="grid lean-status-grid" aria-label="Analytics summary">
          <Fact label="Tracked users" value={`${activeUsers} / ${totalUsers}`} />
          <Fact label="Page views" value={String(totalPageViews)} />
          <Fact label="Quest starts" value={String(totalQuestStarts)} />
          <Fact label="Completions" value={String(totalCompletions)} />
          <Fact label="Failures" value={String(totalFailures)} />
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Quest signals</span>
              <h2>Popular and painful quests.</h2>
              <p>Starts show interest. Completion/failure/pending counts show where quests work or frustrate people.</p>
            </div>
          </div>
          <div className="public-groupquests-list">
            {questSummaries.length ? questSummaries.map((quest) => (
              <div className="public-groupquest-row" key={quest.questId}>
                <div>
                  <span>{quest.questId}</span>
                  <strong>{quest.starts} starts</strong>
                  <p>{quest.completions} completed · {quest.failures} failed · {quest.pending} pending</p>
                </div>
              </div>
            )) : <p>No quest analytics yet.</p>}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Users</span>
              <h2>Who is using SQC?</h2>
            </div>
          </div>
          <div className="public-groupquests-list">
            {activeRows.length ? activeRows.map((row) => (
              <article className="public-groupquest-row" key={row.id}>
                <div>
                  <span>{row.email}</span>
                  <strong>{row.name}</strong>
                  <p>Last seen {formatDate(row.lastSeenAt)} · first seen {formatDate(row.firstSeenAt)}</p>
                </div>
                <div className="public-groupquest-meta">
                  <small>{row.pageViews} page views</small>
                  <small>{row.questStarts} starts</small>
                  <small>{row.questCompletions} complete / {row.questFailures} failed / {row.questPending} pending</small>
                </div>
              </article>
            )) : <p>No signed-in analytics events yet.</p>}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Recent events</span>
              <h2>Latest interaction trail.</h2>
            </div>
          </div>
          <div className="public-groupquests-list">
            {recentEvents.length ? recentEvents.map((event, index) => (
              <div className="public-groupquest-row" key={`${event.at}-${event.type}-${index}`}>
                <div>
                  <span>{formatDate(event.at)} · {event.user}</span>
                  <strong>{event.type.replaceAll("_", " ")}</strong>
                  <p>{[event.path, event.questId, event.provider, event.status].filter(Boolean).join(" · ") || event.email}</p>
                </div>
              </div>
            )) : <p>No events yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

function getEmailFromClaims(claims: unknown) {
  if (!claims || typeof claims !== "object") return "";
  const record = claims as Record<string, unknown>;
  for (const key of ["email", "email_address", "primary_email_address"]) {
    const value = record[key];
    if (typeof value === "string" && value.includes("@")) return value.toLowerCase();
  }
  return "";
}

function isAllowedAdminEmail(email: string) {
  const allowed = (process.env.SQC_ADMIN_EMAILS ?? "andreas.nordenadler@gmail.com")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && allowed.includes(email));
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function sum(rows: AnalyticsUserRow[], key: keyof Pick<AnalyticsUserRow, "pageViews" | "questStarts" | "questCompletions" | "questFailures">) {
  return rows.reduce((total, row) => total + row[key], 0);
}

function buildQuestSummaries(stores: Array<NonNullable<ReturnType<typeof getAnalyticsStore>["questStats"]>>): QuestSummary[] {
  const totals = new Map<string, QuestSummary>();

  for (const stats of stores) {
    for (const [questId, stat] of Object.entries(stats)) {
      const current = totals.get(questId) ?? { questId, starts: 0, completions: 0, failures: 0, pending: 0 };
      current.starts += stat.starts ?? 0;
      current.completions += stat.completions ?? 0;
      current.failures += stat.failures ?? 0;
      current.pending += stat.pending ?? 0;
      totals.set(questId, current);
    }
  }

  return [...totals.values()].sort((a, b) => b.starts + b.completions - (a.starts + a.completions));
}

function formatDate(value?: string) {
  if (!value) return "never";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Stockholm",
  }).format(new Date(value));
}
