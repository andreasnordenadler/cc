import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DesktopOfficialQuestBriefing from "../src/components/desktop-official-quest-briefing";

const baseProps = {
  difficulty: "Easy",
  conditionCount: 4,
};

test("desktop quest briefing renders only for an incomplete quest that is not active", () => {
  const available = renderToStaticMarkup(React.createElement(DesktopOfficialQuestBriefing, {
    ...baseProps,
    active: false,
    completed: false,
  }));
  const active = renderToStaticMarkup(React.createElement(DesktopOfficialQuestBriefing, {
    ...baseProps,
    active: true,
    completed: false,
  }));
  const completed = renderToStaticMarkup(React.createElement(DesktopOfficialQuestBriefing, {
    ...baseProps,
    active: false,
    completed: true,
  }));
  const activeAndCompleted = renderToStaticMarkup(React.createElement(DesktopOfficialQuestBriefing, {
    ...baseProps,
    active: true,
    completed: true,
  }));

  assert.match(available, /aria-label="Quest briefing"/);
  assert.match(available, /<dt>Difficulty<\/dt><dd>Easy<\/dd>/);
  assert.match(available, /<dt>Conditions<\/dt><dd>4<\/dd>/);
  assert.match(available, /<dt>Proof<\/dt><dd>Automatic<\/dd>/);
  assert.equal(active, "");
  assert.equal(completed, "");
  assert.equal(activeAndCompleted, "");
});
