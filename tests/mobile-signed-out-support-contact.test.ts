import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildMobileSupportEmailUrl } from "../apps/mobile/src/support/mobileSupportContact";

const mobileSource = readFileSync(new URL("../apps/mobile/App.tsx", import.meta.url), "utf8");
const helpSupportModal = mobileSource.slice(
  mobileSource.indexOf("function HelpSupportModal"),
  mobileSource.indexOf("function CommunityMultiplayerReportModal"),
);

test("signed-out mobile support provides a direct Crowdler email action", () => {
  assert.equal(
    buildMobileSupportEmailUrl(),
    "mailto:sam@crowdler.com?subject=Side%20Quest%20Chess%20support",
  );
});

test("signed-out mobile support replaces the account-linked composer with the email action", () => {
  assert.match(
    helpSupportModal,
    /canComposeSupportMessage \? \([\s\S]*Something not working\?[\s\S]*accessibilityLabel="Send support message"[\s\S]*\) : \([\s\S]*Email Crowdler AB directly[\s\S]*accessibilityLabel="Email Side Quest Chess support"/,
  );
});

test("signed-out mobile support opens its mail URL through React Native Linking", () => {
  assert.match(mobileSource, /import \{[\s\S]*\bLinking\b[\s\S]*\} from "react-native"/);
  assert.match(helpSupportModal, /Linking\.openURL\(url\)/);
});
