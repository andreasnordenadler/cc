import Image from "next/image";
import Link from "next/link";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import SiteNav from "@/components/site-nav";
import { chooseCustomSideQuestBadge, getCustomSideQuests, parseCustomRuleConfig, type CustomSideQuest, type CustomSideQuestRuleConfig } from "@/lib/custom-side-quests";
import { describeCustomSideQuestRule, describeCustomSideQuestRuleDetails } from "@/lib/community-side-quests";
import { getActiveChallenge, getChallengeProgress, getLatestChallengeAttempt, getPreferredRunnerName, buildAttemptSummary, type ChallengeAttempt, type UserMetadataRecord } from "@/lib/user-metadata";
import { POST as runQuestAction } from "@/app/api/mobile/quest/route";

export const metadata = {
  title: "My Custom Side Quests · Side Quest Chess",
  description: "Manage your Side Quest Chess custom Side Quest library.",
};

export default async function MyCustomSideQuestsPage({ searchParams }: { searchParams?: Promise<{ saved?: string; updated?: string; duplicated?: string; edit?: string; archived?: string; restored?: string; started?: string; checked?: string; deactivated?: string; reset?: string; error?: string }> }) {
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
  const editingQuest = params.edit ? customQuests.find((quest) => quest.id === params.edit) ?? null : null;
  const editingRuleBlockCount = editingQuest ? parseCustomRuleConfig(editingQuest.config)?.blocks.length ?? 0 : 0;
  const preservesComplexRule = editingRuleBlockCount > 1;
  const builderDefaults = getCustomQuestBuilderDefaults(editingQuest);

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
            <a className="button primary" href="#custom-side-quest-builder">Create on website</a>
            <Link className="button primary" href="/challenges/community">Browse Community Solo</Link>
            <Link className="button secondary" href="/groupquests/create">Use one in Multiplayer</Link>
          </div>
        </section>

        {params.saved ? <p className="form-status success" role="status">Custom Side Quest saved. Your website shelf is now in sync.</p> : null}
        {params.updated ? <p className="form-status success" role="status">Custom Side Quest updated. The same recipe is still on your website shelf.</p> : null}
        {params.duplicated ? <p className="form-status success" role="status">Custom Side Quest duplicated. The copy is ready on your website shelf.</p> : null}
        {params.started ? <p className="form-status success" role="status">Custom Side Quest started. Play a public game, then check the latest result here.</p> : null}
        {params.checked ? <p className="form-status success" role="status">Latest-game proof check saved. See the receipt on the active card below.</p> : null}
        {params.deactivated ? <p className="form-status success" role="status">Custom Side Quest deactivated. Your recipe stays saved.</p> : null}
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
              <h2>{customQuests.length ? "Your saved bad ideas." : "No saved custom Side Quests yet."}</h2>
              <p>
                Create a starter rule here, edit saved recipes, publish them to Community Solo when ready, archive old ideas, or restore an archived recipe as a private draft. Raw custom configs stay hidden.
              </p>
            </div>
            <span className="badge gold">{customQuests.length}</span>
          </div>

          {customQuests.length ? (
            <div className="big-grid starter-route-grid">
              {customQuests.map((quest) => (
                <CustomQuestCard
                  key={quest.id}
                  quest={quest}
                  active={activeChallenge?.id === quest.id}
                  completed={completedSet.has(quest.id)}
                  latestAttempt={getLatestChallengeAttempt(publicMetadata, quest.id)}
                />
              ))}
            </div>
          ) : (
            <div className="groupquest-empty-state" role="status">
              <p>No custom recipes yet. Use the mobile app to create one, then come back here when the shelf starts looking dangerous.</p>
              <Link className="button primary" href="/challenges/community">Browse public examples</Link>
            </div>
          )}
        </section>

        <section className="mission-card" id="custom-side-quest-builder" aria-label="Create Custom Side Quest on website">
          <div className="section-head">
            <div>
              <span className="eyebrow">Website creator</span>
              <h2>{editingQuest ? "Edit a Custom Solo Side Quest." : "Create a Custom Solo Side Quest."}</h2>
              <p>
                Match the mobile app&apos;s safest starter recipes: one clear proof condition, private draft by default, optional public publishing for Community Solo discovery, and safe edits for existing saved recipes.
              </p>
            </div>
            <span className="badge gold">{editingQuest ? "Editing" : "New"}</span>
          </div>

          <form action={saveCustomSideQuestFromWeb} className="profile-form">
            <input type="hidden" name="editId" value={editingQuest?.id ?? ""} />
            {editingQuest ? <p className="microcopy">Editing <strong>{editingQuest.title}</strong>. Save keeps the same Side Quest ID, badge, proof history, and public URL.</p> : null}
            {preservesComplexRule ? <p className="microcopy">This recipe has {editingRuleBlockCount} conditions, so the website editor preserves its existing rule stack and only updates title, summary, and save state.</p> : null}
            <label>
              Side Quest title
              <input name="title" maxLength={80} placeholder="Win after moving every knight" defaultValue={builderDefaults.title} required />
            </label>
            <label>
              Tavern-wall summary
              <textarea name="summary" maxLength={220} rows={3} placeholder="Tell runners what strange chess habit this quest rewards." defaultValue={builderDefaults.summary} required />
            </label>
            <div className="grid side-quest-mode-grid">
              <label>
                Proof condition
                <select name="conditionType" defaultValue={builderDefaults.conditionType}>
                  <option value="gameResult">Game result</option>
                  <option value="openingSequence">Opening pattern from move 1</option>
                  <option value="moveSequence">Move pattern</option>
                  <option value="pieceState">Piece state</option>
                </select>
              </label>
              <label>
                Result target
                <select name="result" defaultValue={builderDefaults.result}>
                  <option value="win">Win the game</option>
                  <option value="draw">Draw the game</option>
                  <option value="lose">Lose the game</option>
                </select>
              </label>
              <label>
                Move / opening pattern
                <input name="sequence" placeholder="e4 e5 Nf3 or O-O" defaultValue={builderDefaults.sequence} />
              </label>
              <label>
                Piece rule
                <select name="piece" defaultValue={builderDefaults.piece}>
                  <option value="king">My king</option>
                  <option value="queen">My queen</option>
                  <option value="rook">My rook</option>
                  <option value="bishop">My bishop</option>
                  <option value="knight">My knight</option>
                  <option value="pawn">My pawn</option>
                </select>
              </label>
              <label>
                Piece condition
                <select name="pieceCondition" defaultValue={builderDefaults.pieceCondition}>
                  <option value="moved">moved</option>
                  <option value="gone">gone</option>
                  <option value="still on board">still on board</option>
                  <option value="captured">captured</option>
                  <option value="on square">on square</option>
                </select>
              </label>
              <label>
                Target square (only for on-square rules)
                <input name="targetSquare" maxLength={2} placeholder="e4" defaultValue={builderDefaults.targetSquare} />
              </label>
              <label>
                Save state
                <select name="lifecycle" defaultValue={builderDefaults.lifecycleChoice}>
                  <option value="draft">Private draft</option>
                  <option value="published-private">Private published</option>
                  <option value="published-public">Publish publicly</option>
                </select>
              </label>
            </div>
            <p className="microcopy">For sequence rules, use normal SAN tokens like <strong>e4 e5 Nf3</strong>. For piece-state rules, the result fields are ignored.</p>
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

function CustomQuestCard({ active, completed, latestAttempt, quest }: { active: boolean; completed: boolean; latestAttempt: ChallengeAttempt | null; quest: CustomSideQuest }) {
  const isPublic = quest.visibility === "public" && quest.lifecycle === "published";
  const lifecycle = quest.lifecycle ?? "published";
  const statusLabel = isPublic ? "Public" : lifecycle === "draft" ? "Draft" : lifecycle === "archived" ? "Archived" : "Private";
  const statusTone = isPublic ? "green" : lifecycle === "archived" ? "" : "gold";
  const ruleDetails = describeCustomSideQuestRuleDetails(quest.config).slice(0, 3);
  const receipt = buildAttemptSummary(latestAttempt);

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
          {lifecycle === "published" ? (
            <form action={runCustomQuestProofActionFromWeb}>
              <input type="hidden" name="id" value={quest.id} />
              <input type="hidden" name="action" value={active ? "check" : "start"} />
              <button className={active ? "button primary" : "button secondary"} type="submit">{active ? "Check latest game" : "Start solo run"}</button>
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
          {lifecycle !== "archived" ? <Link className="button ghost" href="/groupquests/create">Use in Multiplayer</Link> : null}
          <form action={duplicateCustomSideQuestFromWeb}>
            <input type="hidden" name="id" value={quest.id} />
            <button className="button ghost" type="submit">Duplicate</button>
          </form>
          <Link className="button ghost" href={`/account/custom-side-quests?edit=${encodeURIComponent(quest.id)}#custom-side-quest-builder`}>Edit on website</Link>
          <form action={setCustomSideQuestLifecycleFromWeb}>
            <input type="hidden" name="id" value={quest.id} />
            <input type="hidden" name="nextLifecycle" value={lifecycle === "archived" ? "draft" : "archived"} />
            <button className="button ghost" type="submit">{lifecycle === "archived" ? "Restore draft" : "Archive"}</button>
          </form>
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
  const action = requestedAction === "check" || requestedAction === "deactivate" || requestedAction === "reset" ? requestedAction : "start";
  if (!id.startsWith("custom-")) redirect("/account/custom-side-quests?error=Unknown%20custom%20Side%20Quest.");

  const response = await runQuestAction(new Request("https://sidequestchess.local/api/mobile/quest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, challengeId: id }),
  }));
  const payload = await response.json() as { ok?: boolean; message?: string };

  revalidatePath("/account");
  revalidatePath("/account/custom-side-quests");

  if (!response.ok || !payload.ok) {
    redirect(`/account/custom-side-quests?error=${encodeURIComponent(payload.message || "Custom Side Quest proof action failed.")}`);
  }

  const flag = action === "check" ? "checked" : action === "deactivate" ? "deactivated" : action === "reset" ? "reset" : "started";
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
  const shouldPreserveExistingConfig = Boolean(existingConfig && existingConfig.blocks.length > 1);
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
  const conditionType = String(formData.get("conditionType") ?? "gameResult");
  if (conditionType === "openingSequence") {
    return { version: 2, logic: "all", blocks: [{ type: "openingSequence", raw: cleanText(formData.get("sequence"), 120), moves: splitMoveTokens(formData.get("sequence")), anchor: "gameStart" }] };
  }
  if (conditionType === "moveSequence") {
    return { version: 2, logic: "all", blocks: [{ type: "moveSequence", sequence: cleanText(formData.get("sequence"), 120) }] };
  }
  if (conditionType === "pieceState") {
    const condition = cleanPieceCondition(formData.get("pieceCondition"));
    return { version: 2, logic: "all", blocks: [{ type: "pieceState", owner: "my", piece: cleanPiece(formData.get("piece")), condition, targetSquare: condition === "on square" ? cleanText(formData.get("targetSquare"), 2).toLowerCase() : null, timing: { atGameEnd: true } }] };
  }
  return { version: 2, logic: "all", blocks: [{ type: "gameResult", result: cleanResult(formData.get("result")) }] };
}

function validateConfig(config: CustomSideQuestRuleConfig) {
  const parsed = parseCustomRuleConfig(JSON.stringify(config));
  if (!parsed?.blocks.length) return "Add at least one saved condition before saving.";
  const [block] = parsed.blocks;
  if (block.type === "openingSequence" && !block.moves.length) return "Opening sequence conditions need moves from move 1.";
  if (block.type === "moveSequence" && !block.sequence.trim()) return "Move sequence conditions need moves.";
  if (block.type === "pieceState" && block.condition === "on square" && !/^[a-h][1-8]$/.test(block.targetSquare ?? "")) return "Use real board squares like e4 or h8.";
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
  const defaults = {
    title: quest?.title ?? "",
    summary: quest?.summary ?? "",
    conditionType: "gameResult",
    result: "win",
    sequence: "",
    piece: "queen",
    pieceCondition: "moved",
    targetSquare: "",
    lifecycleChoice: "draft",
  };

  if (!quest) return defaults;

  defaults.lifecycleChoice = quest.lifecycle === "draft" ? "draft" : quest.visibility === "public" && quest.lifecycle === "published" ? "published-public" : "published-private";
  const block = parseCustomRuleConfig(quest.config)?.blocks[0];
  if (!block) return defaults;

  if (block.type === "gameResult") {
    defaults.conditionType = "gameResult";
    defaults.result = block.result;
  } else if (block.type === "openingSequence") {
    defaults.conditionType = "openingSequence";
    defaults.sequence = block.raw || block.moves.join(" ");
  } else if (block.type === "moveSequence") {
    defaults.conditionType = "moveSequence";
    defaults.sequence = block.sequence;
  } else if (block.type === "pieceState") {
    defaults.conditionType = "pieceState";
    defaults.piece = block.piece;
    defaults.pieceCondition = block.condition;
    defaults.targetSquare = block.targetSquare ?? "";
  }

  return defaults;
}

function splitMoveTokens(value: FormDataEntryValue | null) { return cleanText(value, 120).split(/\s+/).filter(Boolean).slice(0, 12); }
function cleanText(value: unknown, max: number) { return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : ""; }
function cleanResult(value: FormDataEntryValue | null): "win" | "draw" | "lose" { return value === "draw" || value === "lose" ? value : "win"; }
function cleanPiece(value: FormDataEntryValue | null): "king" | "queen" | "rook" | "bishop" | "knight" | "pawn" { return value === "king" || value === "rook" || value === "bishop" || value === "knight" || value === "pawn" ? value : "queen"; }
function cleanPieceCondition(value: FormDataEntryValue | null): "gone" | "still on board" | "moved" | "captured" | "on square" { return value === "gone" || value === "still on board" || value === "captured" || value === "on square" ? value : "moved"; }

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "Europe/Stockholm" }).format(date);
}
