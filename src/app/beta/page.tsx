import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";
import { CHALLENGES } from "@/lib/challenges";

export const metadata: Metadata = {
  title: "Private beta — Side Quest Chess",
  description:
    "Side Quest Chess private beta notes: what is ready to test, what data is used, and how to report rough edges.",
  openGraph: {
    title: "Private beta — Side Quest Chess",
    description:
      "A clear friends/private beta test loop for weird chess side quests, live receipts, and honest verifier feedback.",
    url: "/beta",
  },
};

const betaChecklist = [
  {
    title: "Connect a chess identity",
    copy: "Add either chess username. Every current starter-deck quest now works on Lichess or Chess.com, so beta testers can use their real chess home instead of hunting for a provider-specific dare.",
    href: "/connect",
    action: "Connect username",
  },
  {
    title: "Start with the beginner path",
    copy: "The private beta path now opens with three survivable but still weird win-required quests before the full chaos deck.",
    href: "/path",
    action: "Open path",
  },
  {
    title: "Create one honest receipt",
    copy: "Play normal games elsewhere, return to SQC, and use latest-game checking to produce a passed, failed, or pending proof card.",
    href: "/account",
    action: "Open test drive",
  },
];


const fiveMinuteScript = [
  {
    title: "1. Add one username",
    copy: "Open Connect, save either a Lichess or Chess.com username, and confirm the account page shows the saved identity before starting a quest.",
    href: "/connect",
    action: "Save identity",
  },
  {
    title: "2. Pick a survivable weird win",
    copy: "Use the beginner path if you want the cleanest first pass, or pick any deck quest now that the full set has dual-host latest-game checking.",
    href: "/path",
    action: "Choose quest",
  },
  {
    title: "3. Bring back one receipt",
    copy: "After a real game, return to Account and run latest-game verification. A good beta report says whether the proof card passed, failed honestly, or got confusing.",
    href: "/account",
    action: "Verify latest game",
  },
];


const feedbackBrief = [
  {
    label: "Challenge",
    copy: "Name the dare you tested and whether you used the beginner path, account quest launcher, or challenge page.",
  },
  {
    label: "Chess source",
    copy: "Say Lichess or Chess.com, include the public username, and paste the game link if the receipt looked wrong.",
  },
  {
    label: "Receipt outcome",
    copy: "Report passed, failed, or pending, then add one sentence on whether the result felt fair and understandable.",
  },
  {
    label: "Screenshot",
    copy: "If anything is confusing, send a screenshot of the account preflight, result card, or verifier copy that caused the confusion.",
  },
];

const feedbackTemplate = `Challenge tested:
Chess source: Lichess / Chess.com
Public username:
Game link, if useful:
Receipt outcome: passed / failed / pending
Did the result feel fair? yes / no, because…
Most confusing moment:
Screenshot attached? yes / no`;

const feedbackExample = `Challenge tested: Knights Before Coffee
Chess source: Chess.com
Public username: sampletester
Game link, if useful: https://www.chess.com/game/live/...
Receipt outcome: failed
Did the result feel fair? yes — I moved a pawn before the fourth knight move.
Most confusing moment: I was not sure whether a casual game counted.
Screenshot attached? yes`;

const friendInvite = `Want to test Side Quest Chess?

1. Open https://sidequestchess.com/beta
2. Sign in and save either your Lichess or Chess.com username.
3. Pick one weird win-required quest from the beginner path or full deck.
4. Play a real game on your chess site, then return to Account and verify latest game.
5. Send back the challenge, chess source, receipt outcome, and anything confusing.`;


const betaExitCriteria = [
  {
    label: "First 10 seconds",
    value: "Concept lands fast",
    copy: "A new tester can explain the loop as pick a weird win, play on their chess site, then return for an honest proof receipt.",
  },
  {
    label: "Account preflight",
    value: "No setup mystery",
    copy: "The tester knows which username is saved, which quest is active, and where to run latest-game verification after playing.",
  },
  {
    label: "Receipt clarity",
    value: "Every result has a next move",
    copy: "Passed means share proof, failed means check the rule explanation, and pending means send the public username plus latest game link.",
  },
  {
    label: "Friend handoff",
    value: "One message can recruit a tester",
    copy: "The beta invite and feedback template are specific enough that Andreas can ask for useful tests without writing a fresh brief each time.",
  },
];

const retestGuide = [
  {
    label: "Passed",
    value: "Share the proof card",
    copy: "If the receipt passes, send the challenge name plus the proof link or screenshot. That confirms the happy path works for your chess site.",
  },
  {
    label: "Failed",
    value: "Check whether the failure feels fair",
    copy: "A failed quest is useful if the explanation matches the game. Report it only if the result seems wrong or the wording makes the rule hard to understand.",
  },
  {
    label: "Pending",
    value: "Send the username and game link",
    copy: "Pending usually means there was no eligible recent public game yet. Send the public username and latest game link so the beta can distinguish normal waiting from a verifier gap.",
  },
];


const firstWavePlan = [
  {
    label: "Wave size",
    value: "3-5 friends first",
    copy: "Start with a tiny group so every confusing receipt, setup snag, or rule mismatch can be understood before the next invite wave.",
  },
  {
    label: "Tester mix",
    value: "Both chess sites",
    copy: "Include at least one Lichess-first and one Chess.com-first tester so dual-host receipts get real coverage instead of only Sam's fixtures.",
  },
  {
    label: "Best first quest",
    value: "Beginner path",
    copy: "Ask most testers to begin with the survivable starter path, then let one chaos-friendly tester try a harder deck quest for edge-case feedback.",
  },
  {
    label: "Escalate only if",
    value: "Two clean loops",
    copy: "Invite a wider circle after at least two testers can connect, play, verify, and send a useful report without route-hunting help.",
  },
];

const firstWaveScorecard = [
  {
    label: "Tester",
    value: "Who ran it?",
    copy: "Write the friend name or handle, then mark whether they tested Lichess, Chess.com, or both.",
  },
  {
    label: "Quest",
    value: "Which dare?",
    copy: "Capture the exact challenge and whether the tester started from /path, /account, or a direct challenge page.",
  },
  {
    label: "Receipt",
    value: "Pass / fail / pending",
    copy: "Record the latest-game outcome plus one fairness sentence so failures and pending states become useful signal instead of noise.",
  },
  {
    label: "Friction",
    value: "One fix candidate",
    copy: "Note the first confusing moment only. If there is no confusion, mark the loop clean and count it toward the two-clean-loop green light.",
  },
];

const firstWaveScorecardTemplate = `Tester:
Chess site tested: Lichess / Chess.com / both
Quest tested:
Entry route: /path /account /challenge
Receipt outcome: passed / failed / pending
Fairness note:
First confusing moment:
Clean loop? yes / no
Follow-up needed:`;

const samRunBetaPass = [
  {
    label: "First-10-second read",
    value: "Explain the loop unaided",
    copy: "Open the site cold and write whether the next action is obvious: pick a weird win, play on Lichess or Chess.com, then return for a receipt.",
  },
  {
    label: "Setup friction",
    value: "Identity → dare → proof",
    copy: "Run the signed-in path from account preflight through one active dare and note the first place where a tester might route-hunt or hesitate.",
  },
  {
    label: "Receipt interpretation",
    value: "Pass / fail / pending clarity",
    copy: "Check whether every result explains what happened, whether it felt fair, and what the tester should do next without asking Andreas.",
  },
  {
    label: "Fix priority",
    value: "One highest-friction fix",
    copy: "End each Sam-run beta pass with exactly one recommended product fix so internal testing turns into launch-readiness work, not notes for their own sake.",
  },
];

const samRunBetaTemplate = `Sam-run beta pass:
Date/time:
Entry route tested: / /beta /account /path /challenge
Chess site simulated: Lichess / Chess.com / both
Quest tested:
First-10-second clarity: clear / unclear, because…
Setup friction score: 1-5
Receipt clarity score: 1-5
First confusing moment:
Highest-priority fix:
Ready for friend wave? yes / no`;

const trustNotes = [
  {
    label: "Data used",
    value: "Public chess evidence only",
    copy: "SQC reads public Lichess or Chess.com game metadata/move text for the username you provide, then stores your SQC profile choices and proof receipts.",
  },
  {
    label: "Not used",
    value: "No chess-site passwords",
    copy: "Do not enter your Lichess or Chess.com password here. The beta uses usernames and public game records, not account credentials from those sites.",
  },
  {
    label: "Support",
    value: "Tell Andreas what broke",
    copy: "For this friends/private beta, send rough edges, confusing copy, wrong verifier outcomes, or badge/UI glitches directly to Andreas with the challenge name and game link. The support page spells out the minimum useful report.",
  },
];

export default async function BetaPage() {
  const { userId } = await auth();
  const beginnerCount = CHALLENGES.filter((challenge) => challenge.category === "Beginner").length;
  const fullDeckCount = CHALLENGES.length;

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="beta" />

      <div className="content-wrap">
        <section className="hero-card">
          <span className="eyebrow">Friends / private beta</span>
          <h1>Test the weird loop before the public launch push.</h1>
          <p className="hero-copy">
            Side Quest Chess is in private-beta hardening: clear onboarding, honest latest-game verification, readable proof cards, and no launch-marketing pressure until the first-user flow feels properly solid.
          </p>
          <div className="button-row hero-actions">
            <Link href="/account" className="button primary">Run the beta checklist</Link>
            <Link href="/path" className="button pink">Try beginner path</Link>
            <Link href="/verifiers" className="button secondary">See live verifiers</Link>
            <Link href="/rules" className="button secondary">Read proof rules</Link>
            <Link href="/support" className="button secondary">Support & privacy</Link>
          </div>
        </section>

        <section className="grid" aria-label="Private beta status">
          <Fact label="Launch posture" value="private beta" copy="The product should feel useful and legible for friends before any wider public launch push." />
          <Fact label="Beginner path" value={`${beginnerCount} quests`} copy="The first-run path starts with easier, abnormal, win-required dares instead of throwing people straight into peak chaos." />
          <Fact label="Verifier posture" value="full dual-host deck" copy="All ten current starter-deck quests can produce latest-game receipts from Lichess or Chess.com today." />
        </section>

        <section className="big-grid" aria-label="Private beta checklist">
          {betaChecklist.map((item, index) => (
            <article className="mission-card" key={item.title}>
              <span className="eyebrow">Beta step {index + 1}</span>
              <h2>{item.title}</h2>
              <p>{item.copy}</p>
              <Link href={item.href} className="button secondary">{item.action}</Link>
            </article>
          ))}
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">5-minute tester script</span>
              <h2>Give friends one exact loop to run, not a vague app tour.</h2>
            </div>
            <span className="badge green">identity → quest → receipt</span>
          </div>
          <p>
            If a tester only has a few minutes, this is the smallest useful pass: connect one public chess identity, choose one win-required dare, then bring back one latest-game receipt and report where the loop felt unclear.
          </p>
          <div className="big-grid" aria-label="Five-minute private beta tester script">
            {fiveMinuteScript.map((item) => (
              <article className="mission-card" key={item.title}>
                <span className="eyebrow">Tester script</span>
                <h2>{item.title}</h2>
                <p>{item.copy}</p>
                <Link href={item.href} className="button secondary">{item.action}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Live beta deck</span>
              <h2>All {fullDeckCount} starter-deck quests are dual-host now.</h2>
            </div>
            <span className="badge green">Lichess + Chess.com</span>
          </div>
          <p>
            This is the current private-beta proof surface: every listed quest can be made active, played on either supported chess site, and checked from latest public games without a pasted PGN or game URL.
          </p>
          <div className="grid">
            {CHALLENGES.map((challenge) => (
              <article className="fact" key={challenge.id}>
                <span>{challenge.category} · {challenge.difficulty}</span>
                <strong>{challenge.title}</strong>
                <p>{challenge.objective}</p>
                <Link href={`/challenges/${challenge.id}`} className="button secondary">Open rules</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Feedback packet</span>
              <h2>Tell testers exactly what useful feedback looks like.</h2>
            </div>
            <span className="badge blue">challenge · source · receipt</span>
          </div>
          <p>
            Private-beta reports should be small but diagnostic: one tested dare, one chess source, one receipt outcome, and the exact place where the loop became unclear.
          </p>
          <div className="grid" aria-label="Useful private beta feedback packet">
            {feedbackBrief.map((item) => (
              <article className="fact" key={item.label}>
                <span>Include</span>
                <strong>{item.label}</strong>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
          <div className="fact beta-template-card" aria-label="Copyable private beta feedback template">
            <span>Copy / paste template</span>
            <strong>One message is enough when it has the right fields.</strong>
            <p>Copy the blank version first; if a tester is unsure how much detail to send, the example below shows the right level of context without turning feedback into homework.</p>
            <pre>{feedbackTemplate}</pre>
            <span>Example report</span>
            <pre>{feedbackExample}</pre>
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Friend invite</span>
              <h2>Copy one short note when asking someone to test.</h2>
            </div>
            <span className="badge pink">ready to send</span>
          </div>
          <p>
            This keeps the ask crisp: one username, one quest, one real game, one receipt, one useful report.
          </p>
          <div className="fact beta-template-card" aria-label="Copyable private beta friend invite">
            <span>Copy / paste invite</span>
            <strong>Send this when you want a friend to run the private-beta loop.</strong>
            <pre>{friendInvite}</pre>
          </div>
        </section>


        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Private-beta green lights</span>
              <h2>Use these checks before inviting a wider tester circle.</h2>
            </div>
            <span className="badge green">clarity gates</span>
          </div>
          <p>
            The goal is not public-launch volume yet. The next invite wave is ready when a friend can understand the loop quickly, complete setup without route hunting, and know what to send back after any receipt outcome.
          </p>
          <div className="grid" aria-label="Private beta green-light criteria">
            {betaExitCriteria.map((item) => (
              <Fact key={item.label} label={item.label} value={item.value} copy={item.copy} />
            ))}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">After the receipt</span>
              <h2>Make passed, failed, and pending outcomes all useful.</h2>
            </div>
            <span className="badge blue">no dead ends</span>
          </div>
          <p>
            The beta should not leave testers guessing after verification. Use the outcome to decide whether to share proof, validate the failure explanation, or send a public game link for debugging.
          </p>
          <div className="grid" aria-label="Private beta retest guidance">
            {retestGuide.map((item) => (
              <Fact key={item.label} label={item.label} value={item.value} copy={item.copy} />
            ))}
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">First tester wave</span>
              <h2>Keep the next invite round small and diagnostic.</h2>
            </div>
            <span className="badge gold">3-5 testers</span>
          </div>
          <p>
            Now that the beta page has the invite, feedback template, outcome guidance, and green-light gates, the next useful move is a deliberately small tester wave that covers both chess providers without creating noisy launch pressure.
          </p>
          <div className="grid" aria-label="Private beta first tester wave plan">
            {firstWavePlan.map((item) => (
              <Fact key={item.label} label={item.label} value={item.value} copy={item.copy} />
            ))}
          </div>
        </section>


        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">First-wave scorecard</span>
              <h2>Track the first friend tests as evidence, not vibes.</h2>
            </div>
            <span className="badge blue">clean loop log</span>
          </div>
          <p>
            After each friend runs the private-beta loop, capture one compact scorecard. This gives Andreas a concrete view of whether the next wave is ready: two clean loops, both chess providers covered, and every confusing moment tied to a specific fix candidate.
          </p>
          <div className="grid" aria-label="Private beta first-wave scorecard fields">
            {firstWaveScorecard.map((item) => (
              <Fact key={item.label} label={item.label} value={item.value} copy={item.copy} />
            ))}
          </div>
          <div className="fact beta-template-card" aria-label="Copyable private beta first-wave scorecard">
            <span>Copy / paste scorecard</span>
            <strong>Use this once per tester so the green-light decision is based on comparable reports.</strong>
            <pre>{firstWaveScorecardTemplate}</pre>
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Sam-run beta pass</span>
              <h2>Use internal testing when friend feedback will be sparse.</h2>
            </div>
            <span className="badge gold">clarity + friction</span>
          </div>
          <p>
            External testers are useful, but the private beta should not wait on them. This pass gives Sam a repeatable way to act as the first beta tester: score clarity, setup friction, receipt interpretation, and the one fix that would most improve launch readiness.
          </p>
          <div className="grid" aria-label="Sam-run private beta pass checklist">
            {samRunBetaPass.map((item) => (
              <Fact key={item.label} label={item.label} value={item.value} copy={item.copy} />
            ))}
          </div>
          <div className="fact beta-template-card" aria-label="Copyable Sam-run beta pass template">
            <span>Copy / paste internal pass</span>
            <strong>Use this when Sam runs the beta loop without waiting for friend testers.</strong>
            <pre>{samRunBetaTemplate}</pre>
          </div>
        </section>

        <section className="mission-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Trust basics</span>
              <h2>What beta testers should know before connecting.</h2>
            </div>
            <span className="badge gold">no password sharing</span>
          </div>
          <div className="grid">
            {trustNotes.map((item) => (
              <Fact key={item.label} label={item.label} value={item.value} copy={item.copy} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
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
