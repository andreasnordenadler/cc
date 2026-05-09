import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";

const featuredQuestIds = ["no-castle-club", "knights-before-coffee", "rookless-rampage"];

const managedGroups = [
  {
    title: "No Castle Night",
    role: "You manage",
    status: "Live draft",
    members: "3 players",
    progress: "1 / 3 cleared",
    next: "Invite two friends, then lock quest window",
  },
  {
    title: "Weekend Horse Club",
    role: "You manage",
    status: "Draft setup",
    members: "Invite-only",
    progress: "0 / 5 joined",
    next: "Choose Knights Before Coffee as the first race",
  },
];

const memberGroups = [
  {
    title: "Queenless After Dark",
    role: "Participant",
    status: "Starts soon",
    members: "6 players",
    progress: "Waiting for start",
    next: "Prepare a public rated game attempt",
  },
  {
    title: "Beginner Chaos Ladder",
    role: "Participant",
    status: "Open invite",
    members: "4 players",
    progress: "Step 1 unlocked",
    next: "Complete Knights Before Coffee inside the group window",
  },
];

const participants = [
  {
    name: "Andreas",
    handle: "and72nor",
    status: "Completed quest 1",
    score: 120,
    tone: "green",
  },
  {
    name: "QueenlessHero",
    handle: "lichess: queenlesshero",
    status: "Attempting quest 1",
    score: 0,
    tone: "gold",
  },
  {
    name: "CoffeeKnight",
    handle: "chess.com: coffeeknight",
    status: "Joined",
    score: 0,
    tone: "blue",
  },
];

const eventFeed = [
  "Andreas completed No Castle Club with a competition-valid game.",
  "QueenlessHero joined the group quest room.",
  "The No Castle Night window opened. Solo completions before this window do not count here.",
];

const createSteps = [
  "Name the group quest",
  "Pick one quest or a small quest set",
  "Choose invite-only, unlisted, or public later",
  "Set the proof window: fresh games after join/start",
];

const settingCards = [
  {
    title: "Access",
    value: "Unlisted invite link",
    copy: "No public navigation yet. Players enter only if someone has the hidden URL or later invite link.",
  },
  {
    title: "Proof window",
    value: "Fresh games only",
    copy: "A quest already completed personally starts incomplete inside this group until new eligible proof lands.",
  },
  {
    title: "Scoring",
    value: "Completion time + points",
    copy: "First pass keeps scoring readable: clear the quest, earn points, sort by completion time.",
  },
  {
    title: "Messaging",
    value: "System feed first",
    copy: "Live activity events ship before free-form group chat, keeping moderation risk low while we shape the loop.",
  },
];

export const metadata = {
  title: "Group Quests · Side Quest Chess",
  description: "Hidden Side Quest Chess multiplayer group quest workbench.",
};

function GroupCard({ group }: { group: (typeof managedGroups)[number] }) {
  return (
    <article className="mission-card groupquests-group-card">
      <div className="card-meta">
        <span>{group.role}</span>
        <span className="badge green">{group.status}</span>
      </div>
      <h3>{group.title}</h3>
      <div className="groupquests-mini-stats">
        <span>{group.members}</span>
        <span>{group.progress}</span>
      </div>
      <p>{group.next}</p>
      <button className="button secondary" type="button">Open group room</button>
    </article>
  );
}

export default async function GroupQuestsPage() {
  const { userId } = await auth();
  const featuredQuests = featuredQuestIds
    .map((id) => CHALLENGES.find((challenge) => challenge.id === id))
    .filter((challenge): challenge is (typeof CHALLENGES)[number] => Boolean(challenge));

  return (
    <main className="site-shell groupquests-page">
      <SiteNav isSignedIn={Boolean(userId)} active="challenges" />

      <div className="content-wrap">
        <section className="hero-card groupquests-hero">
          <span className="eyebrow">Hidden multiplayer hub</span>
          <h1>Group quests are becoming a real place.</h1>
          <p className="hero-copy">
            Logged-in players should land here to see the group quests they belong to, the rooms they manage, and the next shared chaos they can create. This route is live but intentionally unlinked while we build fast.
          </p>
          <div className="auth-reassurance-grid" aria-label="Current group quest constraints">
            <span>{userId ? "Signed-in hub view" : "Signed-out preview"}</span>
            <span>Fresh competition proof</span>
            <span>No public nav link</span>
          </div>
        </section>

        <section className="grid groupquests-hub-grid" aria-label="Group quest hub">
          <article className="mission-card groupquests-create-card">
            <span className="eyebrow">Create</span>
            <h2>Start a group quest.</h2>
            <p>
              First real flow: create a draft room, pick one quest, invite friends, and keep proof scoped to that room.
            </p>
            <div className="groupquests-create-steps">
              {createSteps.map((step, index) => (
                <div key={step}>
                  <strong>{index + 1}</strong>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <button className="button primary" type="button">Create draft group quest</button>
          </article>

          <article className="mission-card groupquests-owned-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Managed by you</span>
                <h2>Your rooms.</h2>
              </div>
              <span className="badge gold">{managedGroups.length}</span>
            </div>
            <div className="groupquests-card-stack">
              {managedGroups.map((group) => (
                <GroupCard group={group} key={group.title} />
              ))}
            </div>
          </article>
        </section>

        <section className="mission-card" aria-label="Groups you belong to">
          <div className="section-head">
            <div>
              <span className="eyebrow">Member hub</span>
              <h2>Groups you belong to.</h2>
            </div>
            <span className="badge green">{memberGroups.length} active</span>
          </div>
          <div className="big-grid groupquests-member-grid">
            {memberGroups.map((group) => (
              <GroupCard group={group} key={group.title} />
            ))}
          </div>
        </section>

        <section className="mission-card groupquests-live-card" aria-label="Prototype group quest room">
          <div className="section-head">
            <div>
              <span className="eyebrow">Focused room prototype</span>
              <h2>No Castle Night</h2>
            </div>
            <span className="badge green">Live draft</span>
          </div>
          <p>
            Single quest race MVP: everyone tries the same quest inside the same time window. The important rule is already visible here — previous personal clears do not auto-complete this group room.
          </p>

          <div className="groupquests-status-strip" aria-label="Competition status">
            <div>
              <strong>Mode</strong>
              <span>Single Quest Race</span>
            </div>
            <div>
              <strong>Window</strong>
              <span>Manual start · 48h</span>
            </div>
            <div>
              <strong>Join</strong>
              <span>Unlisted invite</span>
            </div>
            <div>
              <strong>Proof</strong>
              <span>After join + after start</span>
            </div>
          </div>
        </section>

        <section className="grid" aria-label="Group quest settings">
          {settingCards.map((card) => (
            <article className="mission-card groupquests-setting-card" key={card.title}>
              <span className="eyebrow">{card.title}</span>
              <strong>{card.value}</strong>
              <p>{card.copy}</p>
            </article>
          ))}
        </section>

        <section className="mission-card" aria-label="Quest set preview">
          <div className="section-head">
            <div>
              <span className="eyebrow">Quest set</span>
              <h2>Start with one quest. Design for many.</h2>
            </div>
          </div>
          <div className="big-grid groupquests-quest-grid">
            {featuredQuests.map((challenge, index) => (
              <article className="challenge-card" key={challenge.id}>
                <div className="card-meta quest-card-meta">
                  <span className="badge gold">Step {index + 1}</span>
                  <strong className="quest-points">{challenge.reward} pts</strong>
                </div>
                <div>
                  <h3>{challenge.title}</h3>
                  <p>{challenge.objective}</p>
                </div>
                <p className="proof-line">{index === 0 ? "Active in MVP race" : "Designed for ladder / quest set expansion"}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid groupquests-dashboard-grid" aria-label="Leaderboard and event feed">
          <article className="mission-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Leaderboard</span>
                <h2>Proof-backed standings.</h2>
              </div>
            </div>
            <div className="groupquests-participant-list">
              {participants.map((participant, index) => (
                <div className={`groupquests-participant ${participant.tone}`} key={participant.name}>
                  <strong>#{index + 1}</strong>
                  <div>
                    <span>{participant.name}</span>
                    <small>{participant.handle}</small>
                  </div>
                  <div>
                    <em>{participant.score} pts</em>
                    <small>{participant.status}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="mission-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">Live feed</span>
                <h2>Events before chat.</h2>
              </div>
            </div>
            <div className="groupquests-feed-list">
              {eventFeed.map((event) => (
                <p key={event}>{event}</p>
              ))}
            </div>
          </article>
        </section>

        <section className="mission-card groupquests-rules-card" aria-label="Competition completion rules">
          <span className="eyebrow">Completion state rule</span>
          <h2>Personal proof and group proof are different ledgers.</h2>
          <p>
            If you already earned a Coat of Arms for a quest, that stays yours. But a group quest has its own completion state: joined participant, eligible window, competition proof, competition score, and group celebration. That keeps races fair and makes every group room feel alive.
          </p>
        </section>
      </div>
    </main>
  );
}
