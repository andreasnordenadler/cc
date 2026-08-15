import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("desktop available quest puts the primary decision before supporting briefing", () => {
  const css = readFileSync("src/app/mobile-web.css", "utf8");
  const page = readFileSync("src/app/challenges/[id]/page.tsx", "utf8");
  const sectionStart = css.indexOf("/* Official detail keeps the Android content");
  const sectionEnd = css.indexOf("/* Community detail retains one parity-backed content/action subtree");

  assert.notEqual(sectionStart, -1);
  assert.notEqual(sectionEnd, -1);
  assert.ok(sectionEnd > sectionStart);

  const desktopOfficialDetail = css.slice(sectionStart, sectionEnd);
  const availableCardStart = page.indexOf('className="sqc-native-card sqc-proof-action-card sqc-official-available-action-card"');
  const availableCardEnd = page.indexOf("</section>", availableCardStart);
  const availableCard = page.slice(availableCardStart, availableCardEnd);
  const actionsIndex = availableCard.indexOf('className="sqc-action-pair one-or-two"');
  const briefingIndex = availableCard.indexOf("<DesktopOfficialQuestBriefing");

  assert.notEqual(availableCardStart, -1);
  assert.notEqual(actionsIndex, -1);
  assert.notEqual(briefingIndex, -1);
  assert.ok(actionsIndex < briefingIndex);
  assert.match(desktopOfficialDetail, /\.sqc-official-available-action-card\s*>\s*\.sqc-action-pair\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
  assert.doesNotMatch(desktopOfficialDetail, /\.sqc-proof-action-card\s*>\s*:(?:is\()?\.sqc-card-eyebrow/);
  assert.doesNotMatch(desktopOfficialDetail, /grid-template-areas:\s*"eyebrow"/);
});

test("official quest coat requests enough source pixels for its desktop render", () => {
  const page = readFileSync("src/app/challenges/[id]/page.tsx", "utf8");
  const coatImage = page.match(/<Image className="sqc-official-coat-image"[\s\S]*?\/>/)?.[0] ?? "";

  assert.match(coatImage, /width=\{190\}/);
  assert.match(coatImage, /height=\{214\}/);
  assert.match(coatImage, /sizes="\(min-width: 1180px\) 190px, 92px"/);
});
