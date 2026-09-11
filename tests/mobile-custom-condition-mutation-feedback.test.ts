import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("native custom condition deletion announces its outcome", async () => {
  const imported = await import("../apps/mobile/src/accessibility/customConditionMutationFeedback").catch(() => ({}));
  const getFeedback = (imported as {
    getCustomConditionMutationFeedback?: (action: "deleted", index: number, savedCount: number) => string;
  }).getCustomConditionMutationFeedback;

  assert.equal(typeof getFeedback, "function");
  assert.equal(getFeedback?.("deleted", 1, 2), "Condition B deleted. 2 conditions saved.");
  assert.equal(getFeedback?.("deleted", 0, 1), "Condition A deleted. 1 condition saved.");
  assert.equal(getFeedback?.("deleted", 0, 0), "Condition A deleted. No conditions saved.");

  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  assert.match(
    source,
    /import \{ getCustomConditionMutationFeedback, getCustomConditionSaveFeedback, getNextCustomConditionFeedbackRevision \} from "\.\/src\/accessibility\/customConditionMutationFeedback";/,
  );
  assert.equal(
    source.match(/const \{ message: customConditionFeedback, setMessage: setCustomConditionFeedback \} = useAccessibleActionFeedback\(\);/g)?.length ?? 0,
    2,
    "Both native custom builders need platform-correct action feedback",
  );
  assert.equal(
    source.match(/setCustomConditionFeedback\(getCustomConditionMutationFeedback\("deleted", removedIndex, nextConditions\.length\)\);/g)?.length ?? 0,
    2,
    "Both native custom builders must announce successful deletion",
  );
  assert.equal(
    source.match(/\{customConditionFeedback \? <Text key=\{customConditionFeedbackRevision\} accessibilityRole="alert" accessibilityLiveRegion="polite" style=\{styles\.microcopy\}>\{customConditionFeedback\}<\/Text> : null\}/g)?.length ?? 0,
    2,
    "Both native custom builders need an Android live-region fallback",
  );
});

test("native custom condition duplication announces its outcome", async () => {
  const { getCustomConditionMutationFeedback: getFeedback } = await import("../apps/mobile/src/accessibility/customConditionMutationFeedback") as {
    getCustomConditionMutationFeedback: (action: "deleted" | "duplicated", index: number, savedCount: number) => string;
  };

  assert.equal(getFeedback("duplicated", 2, 4), "Condition C duplicated. 4 conditions saved.");

  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  assert.equal(
    source.match(/const duplicatedIndex = currentState\.conditions\.findIndex\(\(candidate\) => candidate\.id === requirement\.id\);/g)?.length ?? 0,
    2,
    "Both native custom builders must identify the duplicated condition",
  );
  assert.equal(
    source.match(/setCustomConditionFeedback\(getCustomConditionMutationFeedback\("duplicated", duplicatedIndex, transition\.state\.conditions\.length\)\);/g)?.length ?? 0,
    2,
    "Both native custom builders must announce successful duplication",
  );
});

test("saving a native custom condition announces whether it was added or updated", async () => {
  const imported = await import("../apps/mobile/src/accessibility/customConditionMutationFeedback").catch(() => ({}));
  const getFeedback = (imported as {
    getCustomConditionMutationFeedback?: (action: "added" | "updated", index: number, savedCount: number) => string;
  }).getCustomConditionMutationFeedback;

  assert.equal(typeof getFeedback, "function");
  assert.equal(getFeedback?.("added", 0, 1), "Condition A added. 1 condition saved.");
  assert.equal(getFeedback?.("updated", 2, 4), "Condition C updated. 4 conditions saved.");

  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  assert.equal(
    source.match(/setCustomConditionFeedback\(savedConditionFeedback\);/g)?.length ?? 0,
    2,
    "Both native custom builders must announce successful condition saves",
  );
});

test("stale native custom condition save callbacks do not announce success", async () => {
  const imported = await import("../apps/mobile/src/accessibility/customConditionMutationFeedback").catch(() => ({}));
  const getSaveFeedback = (imported as {
    getCustomConditionSaveFeedback?: (
      state: { editorOpen: boolean; editingId: string | null },
      savedConditions: readonly { id: string }[],
    ) => string | null;
  }).getCustomConditionSaveFeedback;

  assert.equal(typeof getSaveFeedback, "function");
  assert.equal(
    getSaveFeedback?.({ editorOpen: true, editingId: null }, [{ id: "new" }]),
    "Condition A added. 1 condition saved.",
  );
  assert.equal(
    getSaveFeedback?.(
      { editorOpen: true, editingId: "condition-c" },
      [{ id: "condition-a" }, { id: "condition-b" }, { id: "condition-c" }],
    ),
    "Condition C updated. 3 conditions saved.",
  );
  assert.equal(
    getSaveFeedback?.({ editorOpen: false, editingId: null }, [{ id: "condition-a" }]),
    null,
    "A queued callback after the editor closes must not claim that it added a condition",
  );
  assert.equal(
    getSaveFeedback?.({ editorOpen: true, editingId: "missing" }, [{ id: "condition-a" }]),
    null,
    "A stale edit target must not claim that it updated another condition",
  );

  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  assert.equal(
    source.match(/const savedConditionFeedback = getCustomConditionSaveFeedback\(currentState, nextRequirements\);\s*if \(!savedConditionFeedback\) return false;\s*applyCustomConditionState/g)?.length ?? 0,
    2,
    "Both builders must reject stale save callbacks before applying state or announcing success",
  );
});

test("native custom condition feedback starts fresh for each builder session", async () => {
  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");

  assert.match(
    source,
    /function openCustomEditor\(quest\?: CustomLibraryQuest \| null\) \{\s*setCustomConditionFeedback\(null\);/,
    "The dashboard builder must clear feedback before it opens",
  );
  assert.match(
    source,
    /function openCustomBuilder\(\) \{\s*setCustomConditionFeedback\(null\);\s*setCustomCreateOpen\(true\);\s*\}/,
    "The Side Quests builder must clear feedback before it opens",
  );
  assert.equal(
    source.match(/onPress=\{openCustomBuilder\}/g)?.length ?? 0,
    2,
    "Every Side Quests builder entry must use the fresh-session opener",
  );
});

test("repeated identical native feedback remounts Android live regions", async () => {
  const imported = await import("../apps/mobile/src/accessibility/customConditionMutationFeedback");
  const nextRevision = (imported as {
    getNextCustomConditionFeedbackRevision?: (current: number) => number;
  }).getNextCustomConditionFeedbackRevision;

  assert.equal(typeof nextRevision, "function");
  assert.equal(nextRevision?.(0), 1);
  assert.equal(nextRevision?.(1), 2, "An identical second outcome must still get a new live-region identity");

  const source = await readFile(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
  assert.equal(
    source.match(/const \[customConditionFeedbackRevision, setCustomConditionFeedbackRevision\] = useState\(0\);/g)?.length ?? 0,
    2,
  );
  assert.equal(
    source.match(/setCustomConditionFeedbackRevision\(getNextCustomConditionFeedbackRevision\);/g)?.length ?? 0,
    6,
    "Every successful condition save, duplicate, or delete must advance the live-region key",
  );
  assert.equal(
    source.match(/<Text key=\{customConditionFeedbackRevision\} accessibilityRole="alert" accessibilityLiveRegion="polite"/g)?.length ?? 0,
    2,
    "Both Android live regions must remount even when outcome copy repeats",
  );
});
