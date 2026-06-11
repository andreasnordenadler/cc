import Image from "next/image";
import Link from "next/link";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ProofPositionBoard from "@/components/proof-position-board";
import ShareProofActions from "@/components/share-proof-actions";
import SiteNav from "@/components/site-nav";
import { chooseCustomSideQuestBadge, getCustomSideQuests, parseCustomRuleConfig, type CustomSideQuest, type CustomSideQuestRuleConfig } from "@/lib/custom-side-quests";
import { describeCustomSideQuestRule, describeCustomSideQuestRuleDetails } from "@/lib/community-side-quests";
import { buildCustomPublicProofPath, publicProofImagePath } from "@/lib/proof-share";
import { getActiveChallenge, getChallengeProgress, getLatestChallengeAttempt, getPreferredRunnerName, buildAttemptSummary, type ChallengeAttempt, type UserMetadataRecord } from "@/lib/user-metadata";
import { POST as runQuestAction } from "@/app/api/mobile/quest/route";

export const metadata = {
  title: "My Custom Side Quests · Side Quest Chess",
  description: "Manage your Side Quest Chess custom Side Quest library.",
};

const WEB_CUSTOM_RULE_BLOCK_LIMIT = 6;
const WEB_CUSTOM_RULE_SUFFIXES = ["", "2", "3", "4", "5", "6"] as const;
type WebCustomRuleSuffix = (typeof WEB_CUSTOM_RULE_SUFFIXES)[number];
type WebCustomRuleConditionType = "none" | "gameResult" | "openingSequence" | "moveSequence" | "pieceState";
type WebCustomRuleBlockDefaults = {
  suffix: WebCustomRuleSuffix;
  conditionType: WebCustomRuleConditionType;
  result: "win" | "draw" | "lose";
  sequence: string;
  owner: "my" | "opponent";
  piece: "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
  pieceCondition: "gone" | "still on board" | "moved" | "not moved" | "captured" | "on square";
  timing: "byMove" | "atMove" | "atGameEnd";
  moveNumber: number;
  quantifier: "any one" | "at least" | "exactly" | "all";
  count: number;
  identity: string;
  targetSquare: string;
  negated: boolean;
};

type CustomLibraryFilter = "all" | "published" | "drafts" | "public" | "archived";

export default async function MyCustomSideQuestsPage({ searchParams }: { searchParams?: Promise<{ saved?: string; updated?: string; duplicated?: string; deleted?: string; edit?: string; archived?: string; restored?: string; started?: string; checked?: string; submitted?: string; deactivated?: string; reset?: string; error?: string; filter?: string; q?: string }> }) {
  noStore();
  const params = searchParams ? await searchParams : {};
  const authUser = await currentUser();
  if (!authUser) redirect("/sign-in");

  const client = await clerkClient();
  const user = await client.users.getUser(authUser.id);
  const publicMetadata = user.publicMetadata ? (user.publicMetadata as UserMetadataRecord) : {};
  const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? (user.privateMetadata as UserMetadataRecord) : {};
  const customQuests = getCustomSideQuests(privateMetadata).length ? getCustomSideQuests(privateMetadata) : getCustomSideQuests(publicMetadata);
  const activeChallenge = getActiveChallenge(publicMetadata);
  const completedSet = new Set(getChallengeProgress(publicMetadata).completedChallengeIds);
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
  const libraryFilter = cleanLibraryFilter(params.filter);
  const libraryQuery = cleanText(params.q, 80);
  const filteredCustomQuests = customQuests.filter((quest) => matchesCustomLibraryFilter(quest, libraryFilter, libraryQuery));
  const editingQuest = params.edit ? customQuests.find((quest) => quest.id === params.edit) ?? null : null;
  const editingRuleBlockCount = editingQuest ? parseCustomRuleConfig(editingQuest.config)?.blocks.length ?? 0 : 0;
  const preservesComplexRule = editingRuleBlockCount > WEB_CUSTOM_RULE_BLOCK_LIMIT;
  const builderDefaults = getCustomQuestBuilderDefaults(editingQuest);
  const customQuestCards = await Promise.all(filteredCustomQuests.map(async (quest) => {
    const latestAttempt = getLatestChallengeAttempt(publicMetadata, quest.id);
    const completed = completedSet.has(quest.id);
    const proofPath = completed && latestAttempt?.status === "passed"
      ? await buildCustomPublicProofPath({ attempt: latestAttempt, quest, runnerName: runnerDisplayName })
      : null;

    return {
      quest,
      active: activeChallenge?.id === quest.id,
      completed,
      latestAttempt,
      proofPath,
    };
  }));

  return (
    <main className="site-shell">
      <SiteNav isSignedIn active="account" />

      <div className="content-wrap quest-detail-wrap">
        <Link href="/account" className="button secondary back-to-hub">← Back to account</Link>

        <section className="hero-card side-quests-hub-hero">
          <span className="eyebrow">My Custom Side Quests</span>
          <h1>{runnerDisplayName}&apos;s Custom Solo shelf.</h1>
          <p className="hero-copy">
            Build, tune, prove, and share your own Solo Side Quests: private drafts, playable quests, Community Solo releases, and retired ideas kept neatly on your shelf.
          </p>
          <div className="hero-actions button-row">
            <a className="button primary" href="#custom-side-quest-builder">Create Custom Solo</a>
            <Link className="button primary" href="/challenges/community">Browse Community Solo</Link>
            <Link className="button secondary" href="/groupquests/create">Use one in Multiplayer</Link>
          </div>
        </section>

        {params.saved ? <p className="form-status success" role="status">Custom Side Quest saved. Your library is now in sync.</p> : null}
        {params.updated ? <p className="form-status success" role="status">Custom Side Quest updated. The same quest stays in your library.</p> : null}
        {params.duplicated ? <p className="form-status success" role="status">Custom Side Quest duplicated. The copy is ready in your library.</p> : null}
        {params.deleted ? <p className="form-status success" role="status">Custom Side Quest deleted from your library.</p> : null}
        {params.started ? <p className="form-status success" role="status">Custom Side Quest started. Play a public game, then check the latest result here.</p> : null}
        {params.checked ? <p className="form-status success" role="status">Latest-game proof check saved. See the receipt on the active card below.</p> : null}
        {params.submitted ? <p className="form-status success" role="status">Submitted proof game checked. See the receipt on the active card below.</p> : null}
        {params.deactivated ? <p className="form-status success" role="status">Custom Side Quest deactivated. Your quest stays saved.</p> : null}
        {params.reset ? <p className="form-status success" role="status">Custom Side Quest proof reset. You can run it again.</p> : null}
        {params.archived ? <p className="form-status success" role="status">Custom Side Quest archived. It is hidden from public discovery.</p> : null}
        {params.restored ? <p className="form-status success" role="status">Custom Side Quest restored as a private draft.</p> : null}
        {params.error ? <p className="form-status error" role="alert">{decodeURIComponent(params.error)}</p> : null}

        <section className="grid side-quest-mode-grid" aria-label="Custom Side Quest library summary">
          <StatCard label="Published public" value={publishedPublic} copy="Visible on the Community Solo browse page." />
          <StatCard label="Private" value={privateCount} copy="Only available to you and your own Multiplayer lineups." />
          <StatCard label="Draft / archived" value={draftCount + archivedCount} copy="Not public and not available for public discovery." />
        </section>

        <section className="mission-card" aria-label="My Custom Side Quest library">
          <div className="section-head">
            <div>
              <span className="eyebrow">Library</span>
              <h2>{customQuests.length ? "Your saved Custom Solo Side Quests." : "No saved Custom Solo Side Quests yet."}</h2>
              <p>
                Create a clear starter rule here, search and filter saved quests, publish polished ones to Community Solo, archive retired ideas, or restore an archived quest as a private draft. Private rule data stays hidden.
              </p>
            </div>
            <span className="badge gold">{filteredCustomQuests.length}/{customQuests.length}</span>
          </div>

          {customQuests.length ? <CustomLibraryFilters activeFilter={libraryFilter} query={libraryQuery} /> : null}

          {customQuests.length ? (
            filteredCustomQuests.length ? (
              <div className="big-grid starter-route-grid">
                {customQuestCards.map((entry) => (
                  <CustomQuestCard
                    key={entry.quest.id}
                    quest={entry.quest}
                    active={entry.active}
                    completed={entry.completed}
                    latestAttempt={entry.latestAttempt}
                    proofPath={entry.proofPath}
                  />
                ))}
              </div>
            ) : (
              <div className="groupquest-empty-state" role="status">
                <p>No saved Custom Solo Side Quests match this view. Clear the search or switch back to All; private drafts, private rule data, and archived quests stay protected.</p>
                <Link className="button primary" href="/account/custom-side-quests">Show all saved Side Quests</Link>
              </div>
            )
          ) : (
            <div className="groupquest-empty-state" role="status">
              <p>No custom Side Quests yet. Create one here or browse public examples first; your SQC account keeps the same saved shelf everywhere you play.</p>
              <Link className="button primary" href="/challenges/community">Browse public examples</Link>
            </div>
          )}
        </section>

        <section className="mission-card" id="custom-side-quest-builder" aria-label="Create Custom Solo Side Quest">
          <div className="section-head">
            <div>
              <span className="eyebrow">Custom Solo builder</span>
              <h2>{editingQuest ? "Edit a Custom Solo Side Quest." : "Create a Custom Solo Side Quest."}</h2>
              <p>
                Start with one clear proof condition, then open optional slots only when the quest needs them. Draft privately first, test proof checks, and publish to Community Solo when it feels ready.
              </p>
            </div>
            <span className="badge gold">{editingQuest ? "Editing" : "New"}</span>
          </div>

          <div className="custom-builder-guide" aria-label="Custom Solo builder flow">
            <div><strong>1</strong><span>Name the quest</span><small>Give runners a clear tavern-card promise.</small></div>
            <div><strong>2</strong><span>Set proof rules</span><small>Keep it simple; optional slots stay tucked away.</small></div>
            <div><strong>3</strong><span>Save safely</span><small>Draft first, then release when the quest reads cleanly.</small></div>
          </div>

          <div className="custom-builder-quality-strip" aria-label="Custom Solo quality checklist">
            <div>
              <span className="eyebrow">Good quest check</span>
              <strong>Would a runner understand it in ten seconds?</strong>
              <small>Use the title for the promise and the summary for the mood. Leave verifier details to the rule cards.</small>
            </div>
            <div>
              <span className="eyebrow">Proof comfort</span>
              <strong>One strong rule beats six noisy ones.</strong>
              <small>Add optional conditions only when they make the quest more fun, not just more complicated.</small>
            </div>
          </div>

          <div className="custom-builder-starter-patterns" aria-label="Custom Solo starter examples">
            <div className="custom-builder-starter-head">
              <span className="eyebrow">Quest starters</span>
              <strong>Pick the vibe before you touch the controls.</strong>
              <small>These are plain-language patterns for shaping a polished quest; the form below still keeps the final saved rules explicit.</small>
            </div>
            <div className="custom-builder-starter-grid">
              <article>
                <span>Clean finish</span>
                <strong>Win, draw, or survive on purpose.</strong>
                <small>Best with one Game result rule and a title that tells runners exactly what ending matters.</small>
              </article>
              <article>
                <span>Opening dare</span>
                <strong>Ask for a recognizable first-move pattern.</strong>
                <small>Use Opening pattern when the fun is in the setup, not in a long full-game checklist.</small>
              </article>
              <article>
                <span>Piece story</span>
                <strong>Make one piece behave strangely.</strong>
                <small>Use Piece state for moved, captured, saved, or target-square goals; add timing only when it makes the story clearer.</small>
              </article>
            </div>
          </div>

          <form action={saveCustomSideQuestFromWeb} className="custom-solo-builder">
            <input type="hidden" name="editId" value={editingQuest?.id ?? ""} />
            {editingQuest ? <p className="microcopy">Editing <strong>{editingQuest.title}</strong>. Save keeps the same Side Quest ID, badge, proof history, and public URL.</p> : null}
            {preservesComplexRule ? <p className="microcopy">This saved quest has {editingRuleBlockCount} conditions, so this editor preserves its existing rule stack and only updates title, summary, and save state.</p> : null}
            <div className="custom-builder-identity-grid">
            <label>
              <span>Side Quest title</span>
              <input name="title" maxLength={80} placeholder="Win after moving every knight" defaultValue={builderDefaults.title} required />
            </label>
            <label>
              <span>Tavern-wall summary</span>
              <textarea name="summary" maxLength={220} rows={3} placeholder="Tell runners what strange chess habit this quest rewards." defaultValue={builderDefaults.summary} required />
            </label>
            </div>
            <div className="custom-builder-rule-shell">
              <div className="custom-builder-rule-head">
                <div>
                  <span className="eyebrow">Proof rules</span>
                  <h3>Choose what a public chess game must prove.</h3>
                  <p className="microcopy">Open one condition card at a time. Pick the rule shape first; only the matching controls appear so the builder stays focused.</p>
                </div>
                <label className="custom-builder-logic-card">
                <span>Condition logic</span>
                <select name="logic" defaultValue="all" disabled={preservesComplexRule}>
                  <option value="all">Complete every condition</option>
                  <option value="any">Complete any one condition</option>
                </select>
              </label>
              </div>
              {builderDefaults.blocks.map((block, index) => (
                <CustomConditionFields key={block.suffix || "primary"} block={block} index={index} disabled={preservesComplexRule} />
              ))}
            </div>
            <div className="custom-builder-save-card">
              <label>
                <span>Save state</span>
                <select name="lifecycle" defaultValue={builderDefaults.lifecycleChoice}>
                  <option value="draft">Draft (private)</option>
                  <option value="published-private">Playable privately</option>
                  <option value="published-public">Publish to Community Solo</option>
                </select>
              </label>
              <p className="microcopy">Drafts stay quiet in your account. Playable private Side Quests can be used by you. Community Solo releases can appear in discovery and be played by other runners.</p>
            </div>
            <p className="microcopy">For sequence rules, use normal SAN tokens like <strong>e4 e5 Nf3</strong>. Leave optional condition slots set to “No condition”. Existing saved quests with more than six conditions are preserved safely.</p>
            <div className="button-row">
              <button className="button primary" type="submit">{editingQuest ? "Save edits" : "Save Custom Side Quest"}</button>
              {editingQuest ? <Link className="button secondary" href="/account/custom-side-quests#custom-side-quest-builder">Cancel edit</Link> : <Link className="button secondary" href="/challenges/community">See public examples</Link>}
            </div>
          </form>
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

function CustomLibraryFilters({ activeFilter, query }: { activeFilter: CustomLibraryFilter; query: string }) {
  const filters: { label: string; value: CustomLibraryFilter }[] = [
    { label: "All", value: "all" },
    { label: "Published", value: "published" },
    { label: "Drafts", value: "drafts" },
    { label: "Public", value: "public" },
    { label: "Archived", value: "archived" },
  ];
  return (
    <div className="quest-filter-panel" aria-label="Custom Side Quest library filters">
      <form className="quest-filter-grid" action="/account/custom-side-quests">
        <label className="input-card">
          <span>Search your Custom Solo shelf</span>
          <input name="q" type="search" placeholder="Title, summary, or safe rule text" defaultValue={query} />
        </label>
        <input type="hidden" name="filter" value={activeFilter} />
        <button className="button secondary" type="submit">Search shelf</button>
        {query ? <Link className="button ghost" href={`/account/custom-side-quests?filter=${activeFilter}`}>Clear search</Link> : null}
      </form>
      <div className="chip-row" aria-label="Saved Custom Solo filters">
        {filters.map((filter) => {
          const href = `/account/custom-side-quests?filter=${filter.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
          return <Link key={filter.value} className={activeFilter === filter.value ? "badge gold" : "badge"} href={href}>{filter.label}</Link>;
        })}
      </div>
      <p className="microcopy">Matches the full library shelf filters while keeping private Side Quests and raw rule config inside your account.</p>
    </div>
  );
}

function CustomConditionFields({ block, disabled, index }: { block: WebCustomRuleBlockDefaults; disabled: boolean; index: number }) {
  const prefix = index === 0 ? "" : `${index + 1} `;
  const suffix = block.suffix;
  const isOptional = index > 0;
  const summaryTitle = index === 0 ? "Main proof condition" : `Optional condition ${index + 1}`;
  const summaryHint = block.conditionType === "none" ? "No condition" : describeConditionType(block.conditionType);
  return (
    <details className="custom-condition-card" open={!isOptional || block.conditionType !== "none"}>
      <summary>
        <span>
          <strong>{summaryTitle}</strong>
          <small>{isOptional ? "Add another rule only if it makes the quest better." : "Every Custom Solo Side Quest needs one clear proof target."}</small>
        </span>
        <em>{summaryHint}</em>
      </summary>
      <div className="custom-condition-grid">
        <div className="custom-condition-type-guide" aria-label={`${summaryTitle} rule type guide`}>
          <span>Pick the rule shape first</span>
          <p>Pick the rule shape, then fill the matching section. Unused rule details stay tucked away as safe defaults.</p>
          <div>
            <small>Result: win, draw, or lose</small>
            <small>Pattern: opening or move sequence</small>
            <small>Piece state: moved, captured, on square, and timing</small>
          </div>
        </div>

        <label className="custom-condition-type-select">
          <span>{index === 0 ? "Proof condition" : `Optional condition ${index + 1}`}</span>
          <select name={`conditionType${suffix}`} defaultValue={block.conditionType} disabled={disabled}>
            {index > 0 ? <option value="none">No condition</option> : null}
            <option value="gameResult">Game result</option>
            <option value="openingSequence">Opening pattern from move 1</option>
            <option value="moveSequence">Move pattern</option>
            <option value="pieceState">Piece state</option>
          </select>
        </label>

        <div className="custom-condition-no-rule" aria-hidden="true">
          <strong>No extra rule here</strong>
          <p>Leave this optional slot closed unless the Side Quest needs another proof target.</p>
        </div>

        <fieldset className="custom-condition-field-group custom-condition-field-group-result">
          <legend>Result rule</legend>
          <p>Used when the proof condition is Game result.</p>
          <label>
            <span>{prefix}Result target</span>
            <select name={`result${suffix}`} defaultValue={block.result} disabled={disabled}>
              <option value="win">Win the game</option>
              <option value="draw">Draw the game</option>
              <option value="lose">Lose the game</option>
            </select>
          </label>
        </fieldset>

        <fieldset className="custom-condition-field-group custom-condition-field-group-pattern">
          <legend>Pattern rule</legend>
          <p>Used for opening and move-pattern proof. Write the moves in normal chess notation.</p>
          <label>
            <span>{prefix}Move / opening pattern</span>
            <input name={`sequence${suffix}`} placeholder="e4 e5 Nf3 or O-O" defaultValue={block.sequence} disabled={disabled} />
          </label>
        </fieldset>

        <fieldset className="custom-condition-field-group custom-condition-field-group-piece">
          <legend>Piece-state rule</legend>
          <p>Used when the proof condition is Piece state.</p>
          <div className="custom-condition-field-grid">
            <label>
              <span>{prefix}Piece</span>
              <select name={`piece${suffix}`} defaultValue={block.piece} disabled={disabled}>
                <option value="king">King</option>
                <option value="queen">Queen</option>
                <option value="rook">Rook</option>
                <option value="bishop">Bishop</option>
                <option value="knight">Knight</option>
                <option value="pawn">Pawn</option>
              </select>
            </label>
            <label>
              <span>{prefix}Owner</span>
              <select name={`owner${suffix}`} defaultValue={block.owner} disabled={disabled}>
                <option value="my">My pieces</option>
                <option value="opponent">Opponent pieces</option>
              </select>
            </label>
            <label>
              <span>{prefix}Condition</span>
              <select name={`pieceCondition${suffix}`} defaultValue={block.pieceCondition} disabled={disabled}>
                <option value="moved">moved</option>
                <option value="not moved">not moved</option>
                <option value="gone">gone</option>
                <option value="still on board">still on board</option>
                <option value="captured">captured</option>
                <option value="on square">on square</option>
              </select>
            </label>
            <label>
              <span>{prefix}Timing</span>
              <select name={`timing${suffix}`} defaultValue={block.timing} disabled={disabled}>
                <option value="byMove">By move</option>
                <option value="atMove">At move</option>
                <option value="atGameEnd">At game end</option>
              </select>
            </label>
            <label>
              <span>{prefix}Move number</span>
              <input name={`moveNumber${suffix}`} type="number" min={1} max={80} defaultValue={block.moveNumber} disabled={disabled} />
            </label>
            <label>
              <span>{prefix}How many pieces</span>
              <select name={`quantifier${suffix}`} defaultValue={block.quantifier} disabled={disabled}>
                <option value="any one">Any one</option>
                <option value="at least">At least</option>
                <option value="exactly">Exactly</option>
                <option value="all">All starting pieces</option>
              </select>
            </label>
            <label>
              <span>{prefix}Piece count</span>
              <input name={`count${suffix}`} type="number" min={1} max={8} defaultValue={block.count} disabled={disabled} />
            </label>
            <label>
              <span>{prefix}Starting piece</span>
              <select name={`identity${suffix}`} defaultValue={block.identity} disabled={disabled}>
                <option value="any">Any matching piece</option>
                <option value="original">Original king/queen</option>
                <option value="queenside">Queenside rook/bishop/knight</option>
                <option value="kingside">Kingside rook/bishop/knight</option>
                <option value="a">a-pawn</option>
                <option value="b">b-pawn</option>
                <option value="c">c-pawn</option>
                <option value="d">d-pawn</option>
                <option value="e">e-pawn</option>
                <option value="f">f-pawn</option>
                <option value="g">g-pawn</option>
                <option value="h">h-pawn</option>
              </select>
            </label>
            <label>
              <span>{prefix}Target square</span>
              <input name={`targetSquare${suffix}`} maxLength={2} placeholder="e4" defaultValue={block.targetSquare} disabled={disabled} />
            </label>
          </div>
        </fieldset>

        <fieldset className="custom-condition-field-group custom-condition-field-group-advanced">
          <legend>Advanced twist</legend>
          <p>Optional. Use only when the quest is about avoiding something.</p>
          <label>
            <span>{prefix}Invert condition</span>
            <select name={`negated${suffix}`} defaultValue={block.negated ? "yes" : "no"} disabled={disabled}>
              <option value="no">Must happen</option>
              <option value="yes">Must NOT happen</option>
            </select>
          </label>
        </fieldset>
      </div>
    </details>
  );
}

function describeConditionType(conditionType: WebCustomRuleConditionType) {
  switch (conditionType) {
    case "gameResult":
      return "Game result";
    case "openingSequence":
      return "Opening pattern";
    case "moveSequence":
      return "Move pattern";
    case "pieceState":
      return "Piece state";
    default:
      return "No condition";
  }
}

function CustomQuestCard({ active, completed, latestAttempt, proofPath, quest }: { active: boolean; completed: boolean; latestAttempt: ChallengeAttempt | null; proofPath: string | null; quest: CustomSideQuest }) {
  const isPublic = quest.visibility === "public" && quest.lifecycle === "published";
  const lifecycle = quest.lifecycle ?? "published";
  const statusLabel = isPublic ? "Public" : lifecycle === "draft" ? "Draft" : lifecycle === "archived" ? "Archived" : "Private";
  const statusTone = isPublic ? "green" : lifecycle === "archived" ? "" : "gold";
  const ruleDetails = describeCustomSideQuestRuleDetails(quest.config).slice(0, 3);
  const receipt = buildAttemptSummary(latestAttempt);
  const proofToken = proofPath?.startsWith("/proof/") ? proofPath.slice("/proof/".length) : null;

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
          {active ? <small>Active now</small> : null}
          {completed ? <small>Completed proof saved</small> : null}
        </div>
        {active || latestAttempt ? (
          <div className="groupquest-onboarding-steps" aria-label={`${quest.title} proof receipt`}>
            <div className="groupquest-onboarding-step">
              <em>{active ? "!" : "✓"}</em>
              <span><strong>{receipt.headline}</strong><small>{receipt.detail}</small><small>{receipt.meta}</small></span>
            </div>
          </div>
        ) : null}
        {latestAttempt ? <ProofPositionBoard attempt={latestAttempt} variant="receipt" /> : null}
        <div className="groupquest-onboarding-steps">
          {ruleDetails.map((line, index) => (
            <div className="groupquest-onboarding-step" key={`${quest.id}-${index}`}>
              <em>{index + 1}</em>
              <span><strong>{index === 0 ? "Rule" : "Also"}</strong><small>{line}</small></span>
            </div>
          ))}
        </div>
        {isPublic ? (
          <ShareProofActions
            challengeTitle={quest.title}
            copy={`Try “${quest.title}” on Side Quest Chess — a public Custom Solo Side Quest.`}
            sharePath={`/challenges/community/${encodeURIComponent(quest.id)}`}
            shareLabel="Copy public quest link"
            copiedCopy="Public Custom Solo link copied."
            socialCopy={`Try “${quest.title}” on Side Quest Chess — a public Custom Solo Side Quest.`}
            socialTitle={`Try ${quest.title} on Side Quest Chess`}
            shareAriaLabel="Share public Custom Solo Side Quest on social media"
          />
        ) : null}
        {proofPath ? (
          <div className="note-card" aria-label={`${quest.title} completed proof receipt share controls`}>
            <span className="eyebrow">Completed proof receipt</span>
            <h4>Share your Custom Solo proof.</h4>
            <p className="microcopy">Public receipt link with provider, game, and board evidence only — private rule details and library state stay hidden.</p>
            <div className="button-row">
              <Link className="button secondary" href={proofPath}>Open proof receipt</Link>
            </div>
            <ShareProofActions
              challengeTitle={quest.title}
              copy={`I completed “${quest.title}” on Side Quest Chess. Custom Solo proof accepted. +100 points.`}
              sharePath={proofPath}
              shareLabel="Copy proof link"
              copiedCopy="Custom Solo proof link copied."
              socialCopy={`I completed “${quest.title}” on Side Quest Chess. Custom Solo proof accepted. +100 points.`}
              socialTitle={`${quest.title} completed on Side Quest Chess`}
              shareAriaLabel="Share Custom Solo proof on social media"
              imagePath={proofToken ? publicProofImagePath(proofToken) : undefined}
              imageFileName="side-quest-chess-custom-solo-proof.png"
            />
          </div>
        ) : null}
        <div className="custom-library-action-panel" aria-label={`${quest.title} actions`}>
          <div className="custom-library-action-head">
            <span className={statusTone ? `badge ${statusTone}` : "badge"}>{statusLabel}</span>
            <small>{active ? "Running now" : completed ? "Proof saved" : lifecycle === "published" ? "Ready to run" : lifecycle === "archived" ? "Resting in the archive" : "Safe in your private shelf"}</small>
          </div>

          <div className="custom-library-action-group custom-library-action-group-primary">
            <span>Play</span>
            <div className="button-row">
              {isPublic ? <Link className="button secondary" href={`/challenges/community/${encodeURIComponent(quest.id)}`}>Open public page</Link> : null}
              {lifecycle === "published" ? (
                <form action={runCustomQuestProofActionFromWeb}>
                  <input type="hidden" name="id" value={quest.id} />
                  <input type="hidden" name="action" value={active ? "check" : "start"} />
                  <button className={active ? "button primary" : "button secondary"} type="submit">{active ? "Check latest game" : "Start solo run"}</button>
                </form>
              ) : null}
              {lifecycle !== "archived" ? <Link className="button ghost" href={`/groupquests/create?quest=${encodeURIComponent(quest.id)}`}>Use in Multiplayer</Link> : null}
            </div>
          </div>

          {active || completed ? (
            <div className="custom-library-action-group custom-library-action-group-proof">
              <span>Proof tools</span>
              <div className="button-row">
                {active ? (
                  <form action={runCustomQuestProofActionFromWeb} className="custom-proof-submit-form" aria-label={`Submit a specific proof game for ${quest.title}`}>
                    <input type="hidden" name="id" value={quest.id} />
                    <input type="hidden" name="action" value="submit" />
                    <label>
                      <span>Specific proof game</span>
                      <input name="gameId" type="text" inputMode="url" placeholder="Lichess game ID or Chess.com URL" />
                    </label>
                    <small>Optional: check one finished public game instead of only the latest game. Custom Solo exact-game proof uses the same verifier gate as mobile.</small>
                    <button className="button secondary" type="submit">Submit game/link</button>
                  </form>
                ) : null}
                {active ? (
                  <form action={runCustomQuestProofActionFromWeb}>
                    <input type="hidden" name="id" value={quest.id} />
                    <input type="hidden" name="action" value="deactivate" />
                    <button className="button ghost" type="submit">Deactivate</button>
                  </form>
                ) : null}
                {completed ? (
                  <form action={runCustomQuestProofActionFromWeb}>
                    <input type="hidden" name="id" value={quest.id} />
                    <input type="hidden" name="action" value="reset" />
                    <button className="button ghost" type="submit">Reset proof</button>
                  </form>
                ) : null}
              </div>
            </div>
          ) : null}

          <details className="custom-library-manage-details">
            <summary>Manage Side Quest</summary>
            <div className="button-row">
              <form action={duplicateCustomSideQuestFromWeb}>
                <input type="hidden" name="id" value={quest.id} />
                <button className="button ghost" type="submit">Duplicate</button>
              </form>
              <Link className="button ghost" href={`/account/custom-side-quests?edit=${encodeURIComponent(quest.id)}#custom-side-quest-builder`}>Edit quest</Link>
              <form action={setCustomSideQuestLifecycleFromWeb}>
                <input type="hidden" name="id" value={quest.id} />
                <input type="hidden" name="nextLifecycle" value={lifecycle === "archived" ? "draft" : "archived"} />
                <button className="button ghost" type="submit">{lifecycle === "archived" ? "Restore draft" : "Archive"}</button>
              </form>
              <details className="custom-delete-disclosure">
                <summary className="button ghost">Delete…</summary>
                <form action={deleteCustomSideQuestFromWeb}>
                  <input type="hidden" name="id" value={quest.id} />
                  <p className="microcopy">Permanent. Existing Multiplayer lineups keep their safe snapshot.</p>
                  <button className="button ghost" type="submit">Confirm delete</button>
                </form>
              </details>
            </div>
          </details>
        </div>
      </div>
    </article>
  );
}

async function runCustomQuestProofActionFromWeb(formData: FormData) {
  "use server";
  const authUser = await currentUser();
  if (!authUser) redirect("/sign-in");

  const id = String(formData.get("id") ?? "");
  const requestedAction = String(formData.get("action") ?? "");
  const action = requestedAction === "check" || requestedAction === "submit" || requestedAction === "deactivate" || requestedAction === "reset" ? requestedAction : "start";
  const gameId = String(formData.get("gameId") ?? "").trim();
  if (!id.startsWith("custom-")) redirect("/account/custom-side-quests?error=Unknown%20custom%20Side%20Quest.");
  if (action === "submit" && !gameId) redirect("/account/custom-side-quests?error=Paste%20a%20Lichess%20game%20ID%20or%20Chess.com%20game%20URL%20first.");

  const response = await runQuestAction(new Request("https://sidequestchess.local/api/mobile/quest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, challengeId: id, gameId: action === "submit" ? gameId : undefined }),
  }));
  const payload = await response.json() as { ok?: boolean; message?: string };

  revalidatePath("/account");
  revalidatePath("/account/custom-side-quests");

  if (!response.ok || !payload.ok) {
    redirect(`/account/custom-side-quests?error=${encodeURIComponent(payload.message || "Custom Side Quest proof action failed.")}`);
  }

  const flag = action === "check" ? "checked" : action === "submit" ? "submitted" : action === "deactivate" ? "deactivated" : action === "reset" ? "reset" : "started";
  redirect(`/account/custom-side-quests?${flag}=1`);
}

async function saveCustomSideQuestFromWeb(formData: FormData) {
  "use server";
  const authUser = await currentUser();
  if (!authUser) redirect("/sign-in");

  const title = cleanText(formData.get("title"), 80) || "Custom Side Quest";
  const summary = cleanText(formData.get("summary"), 220) || "Custom Side Quest";
  const lifecycleChoice = String(formData.get("lifecycle") ?? "draft");
  const lifecycle = lifecycleChoice === "draft" ? "draft" : "published";
  const visibility = lifecycleChoice === "published-public" ? "public" : "private";
  const submittedConfig = buildWebCustomRuleConfig(formData);

  const client = await clerkClient();
  const user = await client.users.getUser(authUser.id);
  const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as UserMetadataRecord : {};
  const publicMetadata = user.publicMetadata && typeof user.publicMetadata === "object" ? user.publicMetadata as UserMetadataRecord : {};
  const now = new Date().toISOString();
  const existing = getCustomSideQuestStore(privateMetadata, publicMetadata);
  const editId = cleanText(formData.get("editId"), 120);
  const editingQuest = editId.startsWith("custom-") ? existing.find((quest) => quest.id === editId) ?? null : null;

  if (editId && !editingQuest) {
    redirect("/account/custom-side-quests?error=Unknown%20custom%20Side%20Quest#custom-side-quest-builder");
  }

  const existingConfig = editingQuest ? parseCustomRuleConfig(editingQuest.config) : null;
  const shouldPreserveExistingConfig = Boolean(existingConfig && existingConfig.blocks.length > WEB_CUSTOM_RULE_BLOCK_LIMIT);
  const config = shouldPreserveExistingConfig ? existingConfig as CustomSideQuestRuleConfig : submittedConfig;
  const validation = lifecycle === "published" ? validateConfig(config) : null;
  if (validation) redirect(`/account/custom-side-quests?error=${encodeURIComponent(validation)}#custom-side-quest-builder`);

  const quest: CustomSideQuest = compactCustomSideQuest({
    id: editingQuest?.id ?? `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    summary,
    config: JSON.stringify(config),
    visibility,
    lifecycle,
    createdAt: editingQuest?.createdAt ?? now,
    updatedAt: now,
    badgeImageUrl: editingQuest?.badgeImageUrl || chooseCustomSideQuestBadge(),
  });

  const nextQuests = editingQuest
    ? [quest, ...existing.filter((savedQuest) => savedQuest.id !== editingQuest.id).map(compactCustomSideQuest)]
    : [quest, ...existing.map(compactCustomSideQuest)];

  await saveCustomQuestStore(client, authUser.id, nextQuests.slice(0, 8));
  revalidatePath("/account/custom-side-quests");
  revalidatePath("/challenges/community");
  if (quest.visibility === "public" && quest.lifecycle === "published") revalidatePath(`/challenges/community/${quest.id}`);
  redirect(`/account/custom-side-quests?${editingQuest ? "updated" : "saved"}=1#custom-side-quest-builder`);
}

async function duplicateCustomSideQuestFromWeb(formData: FormData) {
  "use server";
  const authUser = await currentUser();
  if (!authUser) redirect("/sign-in");
  const id = String(formData.get("id") ?? "");
  if (!id.startsWith("custom-")) redirect("/account/custom-side-quests?error=Unknown%20custom%20Side%20Quest.");
  const client = await clerkClient();
  const user = await client.users.getUser(authUser.id);
  const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as UserMetadataRecord : {};
  const publicMetadata = user.publicMetadata && typeof user.publicMetadata === "object" ? user.publicMetadata as UserMetadataRecord : {};
  const existing = getCustomSideQuestStore(privateMetadata, publicMetadata);
  const source = existing.find((quest) => quest.id === id);
  if (!source) redirect("/account/custom-side-quests?error=Unknown%20custom%20Side%20Quest.");
  const now = new Date().toISOString();
  const copy = compactCustomSideQuest({
    ...source,
    id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: `${source.title} Copy`.slice(0, 80),
    createdAt: now,
    updatedAt: now,
  });
  await saveCustomQuestStore(client, authUser.id, [copy, ...existing.map(compactCustomSideQuest)].slice(0, 8));
  revalidatePath("/account/custom-side-quests");
  revalidatePath("/challenges/community");
  if (copy.visibility === "public" && copy.lifecycle === "published") revalidatePath(`/challenges/community/${copy.id}`);
  redirect("/account/custom-side-quests?duplicated=1");
}

async function deleteCustomSideQuestFromWeb(formData: FormData) {
  "use server";
  const authUser = await currentUser();
  if (!authUser) redirect("/sign-in");
  const id = String(formData.get("id") ?? "");
  if (!id.startsWith("custom-")) redirect("/account/custom-side-quests?error=Unknown%20custom%20Side%20Quest.");
  const client = await clerkClient();
  const user = await client.users.getUser(authUser.id);
  const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as UserMetadataRecord : {};
  const publicMetadata = user.publicMetadata && typeof user.publicMetadata === "object" ? user.publicMetadata as UserMetadataRecord : {};
  const existing = getCustomSideQuestStore(privateMetadata, publicMetadata);
  const deletedQuest = existing.find((quest) => quest.id === id) ?? null;
  const next = existing.filter((quest) => quest.id !== id).map(compactCustomSideQuest).slice(0, 8);
  const activeChallenge = publicMetadata.activeChallenge && typeof publicMetadata.activeChallenge === "object" ? publicMetadata.activeChallenge as { id?: string } : null;
  const shouldClearActive = activeChallenge?.id === id;
  if (shouldClearActive) {
    await client.users.updateUserMetadata(authUser.id, { publicMetadata: { ...publicMetadata, activeChallenge: null }, privateMetadata: { customSideQuests: next } });
  } else {
    await saveCustomQuestStore(client, authUser.id, next);
  }
  revalidatePath("/account");
  revalidatePath("/account/custom-side-quests");
  revalidatePath("/challenges/community");
  if (deletedQuest?.visibility === "public") revalidatePath(`/challenges/community/${deletedQuest.id}`);
  redirect("/account/custom-side-quests?deleted=1");
}

async function setCustomSideQuestLifecycleFromWeb(formData: FormData) {
  "use server";
  const authUser = await currentUser();
  if (!authUser) redirect("/sign-in");
  const id = String(formData.get("id") ?? "");
  const nextLifecycle = String(formData.get("nextLifecycle") ?? "archived") === "draft" ? "draft" : "archived";
  if (!id.startsWith("custom-")) redirect("/account/custom-side-quests?error=Unknown%20custom%20Side%20Quest.");
  const client = await clerkClient();
  const user = await client.users.getUser(authUser.id);
  const privateMetadata = user.privateMetadata && typeof user.privateMetadata === "object" ? user.privateMetadata as UserMetadataRecord : {};
  const publicMetadata = user.publicMetadata && typeof user.publicMetadata === "object" ? user.publicMetadata as UserMetadataRecord : {};
  const next = getCustomSideQuestStore(privateMetadata, publicMetadata).map((quest) => compactCustomSideQuest(quest.id === id ? { ...quest, lifecycle: nextLifecycle, visibility: nextLifecycle === "draft" || nextLifecycle === "archived" ? "private" : quest.visibility, updatedAt: new Date().toISOString() } : quest)).slice(0, 8);
  await saveCustomQuestStore(client, authUser.id, next);
  revalidatePath("/account/custom-side-quests");
  revalidatePath("/challenges/community");
  redirect(`/account/custom-side-quests?${nextLifecycle === "archived" ? "archived" : "restored"}=1`);
}

function buildWebCustomRuleConfig(formData: FormData): CustomSideQuestRuleConfig {
  const blocks = WEB_CUSTOM_RULE_SUFFIXES.flatMap((suffix, index) => {
    const conditionType = String(formData.get(`conditionType${suffix}`) ?? (index === 0 ? "gameResult" : "none"));
    if (index > 0 && conditionType === "none") return [];
    return [buildWebCustomRuleBlock(formData, suffix)];
  });
  return { version: 2, logic: formData.get("logic") === "any" ? "any" : "all", blocks: blocks.slice(0, WEB_CUSTOM_RULE_BLOCK_LIMIT) };
}

function buildWebCustomRuleBlock(formData: FormData, suffix: WebCustomRuleSuffix): CustomSideQuestRuleConfig["blocks"][number] {
  const conditionType = String(formData.get(`conditionType${suffix}`) ?? "gameResult");
  if (conditionType === "openingSequence") {
    return { type: "openingSequence", raw: cleanText(formData.get(`sequence${suffix}`), 120), moves: splitMoveTokens(formData.get(`sequence${suffix}`)), anchor: "gameStart", negate: formData.get(`negated${suffix}`) === "yes" };
  }
  if (conditionType === "moveSequence") {
    return { type: "moveSequence", sequence: cleanText(formData.get(`sequence${suffix}`), 120), timing: buildTiming(formData, suffix), negate: formData.get(`negated${suffix}`) === "yes" };
  }
  if (conditionType === "pieceState") {
    const condition = cleanPieceCondition(formData.get(`pieceCondition${suffix}`));
    const piece = cleanPiece(formData.get(`piece${suffix}`));
    const quantifier = cleanQuantifier(formData.get(`quantifier${suffix}`));
    return {
      type: "pieceState",
      owner: formData.get(`owner${suffix}`) === "opponent" ? "opponent" : "my",
      piece,
      selector: {
        quantifier,
        count: quantifier === "all" ? getPieceMaxCount(piece) : normalizeCount(formData.get(`count${suffix}`), piece),
        maxAvailable: getPieceMaxCount(piece),
        identity: cleanIdentity(formData.get(`identity${suffix}`), piece),
      },
      condition,
      targetSquare: condition === "on square" ? cleanText(formData.get(`targetSquare${suffix}`), 2).toLowerCase() : null,
      timing: buildTiming(formData, suffix),
      negate: formData.get(`negated${suffix}`) === "yes",
    };
  }
  return { type: "gameResult", result: cleanResult(formData.get(`result${suffix}`)), negate: formData.get(`negated${suffix}`) === "yes" };
}

function validateConfig(config: CustomSideQuestRuleConfig) {
  const parsed = parseCustomRuleConfig(JSON.stringify(config));
  if (!parsed?.blocks.length) return "Add at least one saved condition before saving.";
  for (const block of parsed.blocks) {
    if (block.type === "openingSequence" && !block.moves.length) return "Opening sequence conditions need moves from move 1.";
    if (block.type === "moveSequence" && !block.sequence.trim()) return "Move sequence conditions need moves.";
    if (block.type === "pieceState" && block.condition === "on square" && !/^[a-h][1-8]$/.test(block.targetSquare ?? "")) return "Use real board squares like e4 or h8.";
  }
  return null;
}

function getCustomSideQuestStore(privateMetadata: UserMetadataRecord, publicMetadata: UserMetadataRecord) {
  const privateQuests = getCustomSideQuests(privateMetadata);
  return privateQuests.length ? privateQuests : getCustomSideQuests(publicMetadata);
}

async function saveCustomQuestStore(client: Awaited<ReturnType<typeof clerkClient>>, userId: string, quests: CustomSideQuest[]) {
  await client.users.updateUserMetadata(userId, { privateMetadata: { customSideQuests: quests } });
}

function compactCustomSideQuest(quest: CustomSideQuest): CustomSideQuest {
  const parsed = parseCustomRuleConfig(quest.config);
  return {
    id: quest.id,
    title: cleanText(quest.title, 80) || "Custom Side Quest",
    summary: cleanText(quest.summary, 220) || (quest.lifecycle === "draft" ? "Draft Side Quest" : "Custom Side Quest"),
    config: parsed ? JSON.stringify(parsed) : quest.config.slice(0, 1200),
    visibility: quest.visibility === "public" ? "public" : "private",
    lifecycle: quest.lifecycle === "draft" || quest.lifecycle === "archived" ? quest.lifecycle : "published",
    createdAt: typeof quest.createdAt === "string" ? quest.createdAt : new Date().toISOString(),
    updatedAt: typeof quest.updatedAt === "string" ? quest.updatedAt : new Date().toISOString(),
    badgeImageUrl: typeof quest.badgeImageUrl === "string" ? quest.badgeImageUrl.slice(0, 160) : null,
  };
}

function getCustomQuestBuilderDefaults(quest: CustomSideQuest | null) {
  const blocks = WEB_CUSTOM_RULE_SUFFIXES.map((suffix, index): WebCustomRuleBlockDefaults => ({
    suffix,
    conditionType: index === 0 ? "gameResult" : "none",
    result: "win",
    sequence: "",
    owner: "my",
    piece: "queen",
    pieceCondition: "moved",
    timing: "byMove",
    moveNumber: 15,
    quantifier: "any one",
    count: 1,
    identity: "original",
    targetSquare: "",
    negated: false,
  }));
  const defaults = {
    title: quest?.title ?? "",
    summary: quest?.summary ?? "",
    blocks,
    lifecycleChoice: "draft",
  };

  if (!quest) return defaults;

  defaults.lifecycleChoice = quest.lifecycle === "draft" ? "draft" : quest.visibility === "public" && quest.lifecycle === "published" ? "published-public" : "published-private";
  const savedBlocks = parseCustomRuleConfig(quest.config)?.blocks.slice(0, WEB_CUSTOM_RULE_BLOCK_LIMIT) ?? [];
  savedBlocks.forEach((block, index) => {
    const target = defaults.blocks[index];
    if (!target) return;
    if (block.type === "gameResult") {
      target.conditionType = "gameResult";
      target.result = block.result;
      target.negated = block.negate === true;
    } else if (block.type === "openingSequence") {
      target.conditionType = "openingSequence";
      target.sequence = block.raw || block.moves.join(" ");
      target.negated = block.negate === true;
    } else if (block.type === "moveSequence") {
      target.conditionType = "moveSequence";
      target.sequence = block.sequence;
      applyTimingDefaults(target, block.timing);
      target.negated = block.negate === true;
    } else if (block.type === "pieceState") {
      target.conditionType = "pieceState";
      target.owner = block.owner === "opponent" ? "opponent" : "my";
      target.piece = block.piece;
      target.pieceCondition = block.condition;
      applyTimingDefaults(target, block.timing);
      target.quantifier = cleanQuantifier(block.selector?.quantifier ?? null);
      target.count = normalizeCount(block.selector?.count ?? null, block.piece);
      target.identity = cleanIdentity(block.selector?.identity ?? null, block.piece);
      target.targetSquare = block.targetSquare ?? "";
      target.negated = block.negate === true;
    }
  });

  return defaults;
}

function splitMoveTokens(value: FormDataEntryValue | null) { return cleanText(value, 120).split(/\s+/).filter(Boolean).slice(0, 12); }
function cleanText(value: unknown, max: number) { return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : ""; }
function cleanLibraryFilter(value: unknown): CustomLibraryFilter {
  return value === "published" || value === "drafts" || value === "public" || value === "archived" ? value : "all";
}
function matchesCustomLibraryFilter(quest: CustomSideQuest, filter: CustomLibraryFilter, query: string) {
  const lifecycle = quest.lifecycle ?? "published";
  const isPublic = quest.visibility === "public" && lifecycle === "published";
  const statusMatch = filter === "all"
    || (filter === "published" && lifecycle === "published")
    || (filter === "drafts" && lifecycle === "draft")
    || (filter === "public" && isPublic)
    || (filter === "archived" && lifecycle === "archived");
  if (!statusMatch) return false;
  if (!query) return true;
  const haystack = [quest.title, quest.summary, describeCustomSideQuestRule(quest.config), ...describeCustomSideQuestRuleDetails(quest.config)].join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}
function cleanResult(value: FormDataEntryValue | null): "win" | "draw" | "lose" { return value === "draw" || value === "lose" ? value : "win"; }
function cleanPiece(value: FormDataEntryValue | null): "king" | "queen" | "rook" | "bishop" | "knight" | "pawn" { return value === "king" || value === "rook" || value === "bishop" || value === "knight" || value === "pawn" ? value : "queen"; }
function cleanPieceCondition(value: FormDataEntryValue | null): "gone" | "still on board" | "moved" | "not moved" | "captured" | "on square" { return value === "gone" || value === "still on board" || value === "not moved" || value === "captured" || value === "on square" ? value : "moved"; }
function cleanQuantifier(value: unknown): "any one" | "at least" | "exactly" | "all" { return value === "at least" || value === "exactly" || value === "all" ? value : "any one"; }
function getPieceMaxCount(piece: ReturnType<typeof cleanPiece>) { return piece === "pawn" ? 8 : piece === "king" || piece === "queen" ? 1 : 2; }
function normalizeCount(value: unknown, piece: ReturnType<typeof cleanPiece>) { const parsed = Number(value); return Math.min(Math.max(Number.isFinite(parsed) ? Math.floor(parsed) : 1, 1), getPieceMaxCount(piece)); }
function cleanIdentity(value: unknown, piece: ReturnType<typeof cleanPiece>) {
  const text = typeof value === "string" ? value : "any";
  if (piece === "pawn") return /^[a-h]$/.test(text) ? text : "any";
  if (piece === "rook" || piece === "bishop" || piece === "knight") return text === "queenside" || text === "kingside" ? text : "any";
  return text === "original" ? "original" : "any";
}
function buildTiming(formData: FormData, suffix: WebCustomRuleSuffix) {
  const moveNumber = Math.min(Math.max(Number(formData.get(`moveNumber${suffix}`)) || 15, 1), 80);
  const timing = formData.get(`timing${suffix}`);
  if (timing === "atMove") return { atMove: moveNumber };
  if (timing === "atGameEnd") return { atGameEnd: true as const };
  return { byMove: moveNumber };
}
function applyTimingDefaults(target: WebCustomRuleBlockDefaults, timing: unknown) {
  if (timing && typeof timing === "object" && "atMove" in timing && typeof timing.atMove === "number") {
    target.timing = "atMove";
    target.moveNumber = timing.atMove;
  } else if (timing && typeof timing === "object" && "byMove" in timing && typeof timing.byMove === "number") {
    target.timing = "byMove";
    target.moveNumber = timing.byMove;
  } else {
    target.timing = "atGameEnd";
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "Europe/Stockholm" }).format(date);
}
