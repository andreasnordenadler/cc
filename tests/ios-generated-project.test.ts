import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script = new URL("../scripts/check-ios-generated-project.mjs", import.meta.url);

const validInfoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
<key>CFBundleDisplayName</key><string>Side Quest Chess</string>
<key>UnrelatedInteger</key><integer>42</integer>
<key>CFBundleURLTypes</key><array><dict><key>CFBundleURLSchemes</key><array><string>sidequestchess</string><string>com.sidequestchess.app</string></array></dict></array>
<key>NSAppTransportSecurity</key><dict><key>NSAllowsArbitraryLoads</key><false/><key>NSAllowsLocalNetworking</key><true/></dict>
<key>UISupportedInterfaceOrientations</key><array><string>UIInterfaceOrientationPortrait</string><string>UIInterfaceOrientationPortraitUpsideDown</string></array>
<key>UISupportedInterfaceOrientations~ipad</key><array><string>UIInterfaceOrientationPortrait</string><string>UIInterfaceOrientationPortraitUpsideDown</string><string>UIInterfaceOrientationLandscapeLeft</string><string>UIInterfaceOrientationLandscapeRight</string></array>
</dict></plist>`;

const validEntitlements = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict><key>com.apple.developer.applesignin</key><array><string>Default</string></array></dict></plist>`;

const validProject = `/* Begin XCBuildConfiguration section */
		APPDEBUG /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				CODE_SIGN_ENTITLEMENTS = SideQuestChess/SideQuestChess.entitlements;
				PRODUCT_BUNDLE_IDENTIFIER = com.sidequestchess.app;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Debug;
		};
		APPRELEASE /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				CODE_SIGN_ENTITLEMENTS = SideQuestChess/SideQuestChess.entitlements;
				PRODUCT_BUNDLE_IDENTIFIER = com.sidequestchess.app;
				TARGETED_DEVICE_FAMILY = "1,2";
			};
			name = Release;
		};
/* End XCBuildConfiguration section */
/* Begin XCConfigurationList section */
		APPLIST /* Build configuration list for PBXNativeTarget "SideQuestChess" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				APPDEBUG /* Debug */,
				APPRELEASE /* Release */,
			);
		};
/* End XCConfigurationList section */`;

const makeGeneratedProject = () => {
  const root = mkdtempSync(join(tmpdir(), "sqc-ios-generated-"));
  const app = join(root, "SideQuestChess");
  const project = join(root, "SideQuestChess.xcodeproj");
  const infoPath = join(app, "Info.plist");
  const entitlementsPath = join(app, "SideQuestChess.entitlements");
  const projectPath = join(project, "project.pbxproj");
  mkdirSync(app, { recursive: true });
  mkdirSync(project, { recursive: true });
  writeFileSync(infoPath, validInfoPlist);
  writeFileSync(entitlementsPath, validEntitlements);
  writeFileSync(projectPath, validProject);
  return { root, infoPath, entitlementsPath, projectPath };
};

const runChecker = (root: string) => spawnSync(process.execPath, [script.pathname, root], { encoding: "utf8" });

test("generated iOS checker accepts the expected Expo native project", () => {
  const fixture = makeGeneratedProject();
  try {
    const result = runChecker(fixture.root);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /Verified generated iOS project/);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("generated iOS checker rejects release-identity, capability, transport, device, and permission drift", () => {
  const cases = [
    {
      name: "plist prototype pollution",
      file: "infoPath" as const,
      source: validInfoPlist
        .replace('<plist version="1.0"><dict>', '<plist version="1.0"><dict><key>__proto__</key><dict>')
        .replace("</dict></plist>", "</dict></dict></plist>"),
      diagnostic: /display name/i,
    },
    {
      name: "bundle identifier",
      file: "projectPath" as const,
      source: validProject.replaceAll("com.sidequestchess.app", "com.example.wrong"),
      diagnostic: /bundle identifier/i,
    },
    {
      name: "decoy Xcode settings outside app configurations",
      file: "projectPath" as const,
      source: validProject
        .replaceAll("PRODUCT_BUNDLE_IDENTIFIER", "WRONG_BUNDLE_SETTING")
        .replaceAll("TARGETED_DEVICE_FAMILY", "WRONG_DEVICE_SETTING")
        .replaceAll("CODE_SIGN_ENTITLEMENTS", "WRONG_ENTITLEMENT_SETTING")
        .replace(
          "/* Begin XCBuildConfiguration section */",
          `/* PRODUCT_BUNDLE_IDENTIFIER = com.sidequestchess.app; TARGETED_DEVICE_FAMILY = "1,2"; CODE_SIGN_ENTITLEMENTS = SideQuestChess/SideQuestChess.entitlements; */
/* PRODUCT_BUNDLE_IDENTIFIER = com.sidequestchess.app; TARGETED_DEVICE_FAMILY = "1,2"; CODE_SIGN_ENTITLEMENTS = SideQuestChess/SideQuestChess.entitlements; */
/* Begin XCBuildConfiguration section */`,
        ),
      diagnostic: /app build configuration/i,
    },
    {
      name: "device family",
      file: "projectPath" as const,
      source: validProject.replaceAll('"1,2"', "1"),
      diagnostic: /device family/i,
    },
    {
      name: "callback scheme",
      file: "infoPath" as const,
      source: validInfoPlist.replace("sidequestchess", "wrong-scheme"),
      diagnostic: /URL scheme/i,
    },
    {
      name: "callback scheme outside the URL scheme array",
      file: "infoPath" as const,
      source: validInfoPlist
        .replace("<string>sidequestchess</string>", "<string>wrong-scheme</string>")
        .replace("</dict></plist>", "<key>UnrelatedValue</key><string>sidequestchess</string></dict></plist>"),
      diagnostic: /URL scheme/i,
    },
    {
      name: "callback scheme outside CFBundleURLTypes",
      file: "infoPath" as const,
      source: validInfoPlist
        .replace("<string>sidequestchess</string>", "<string>wrong-scheme</string>")
        .replace(
          "</dict></plist>",
          "<key>CFBundleURLSchemes</key><array><string>sidequestchess</string></array></dict></plist>",
        ),
      diagnostic: /URL scheme/i,
    },
    {
      name: "unexpected callback scheme",
      file: "infoPath" as const,
      source: validInfoPlist.replace(
        "<string>com.sidequestchess.app</string>",
        "<string>com.sidequestchess.app</string><string>unexpected-scheme</string>",
      ),
      diagnostic: /URL schemes/i,
    },
    {
      name: "Apple sign-in entitlement",
      file: "entitlementsPath" as const,
      source: validEntitlements.replace("com.apple.developer.applesignin", "unrelated.entitlement"),
      diagnostic: /Apple sign-in/i,
    },
    {
      name: "unexpected entitlement",
      file: "entitlementsPath" as const,
      source: validEntitlements.replace(
        "</dict></plist>",
        "<key>aps-environment</key><string>development</string></dict></plist>",
      ),
      diagnostic: /unexpected entitlement/i,
    },
    {
      name: "unreferenced Apple sign-in entitlement",
      file: "projectPath" as const,
      source: validProject.replaceAll("CODE_SIGN_ENTITLEMENTS", "UNRELATED_SETTING"),
      diagnostic: /Apple sign-in entitlement file/i,
    },
    {
      name: "arbitrary network loads",
      file: "infoPath" as const,
      source: validInfoPlist.replace("<key>NSAllowsArbitraryLoads</key><false/>", "<key>NSAllowsArbitraryLoads</key><true/>"),
      diagnostic: /arbitrary network loads/i,
    },
    {
      name: "arbitrary network loads hidden by unrelated false value",
      file: "infoPath" as const,
      source: validInfoPlist
        .replace("<key>NSAllowsArbitraryLoads</key><false/>", "<key>NSAllowsArbitraryLoads</key><true/>")
        .replace("</dict></plist>", "<key>Unrelated</key><dict><key>NSAllowsArbitraryLoads</key><false/></dict></dict></plist>"),
      diagnostic: /arbitrary network loads/i,
    },
    {
      name: "duplicate arbitrary network loads override",
      file: "infoPath" as const,
      source: validInfoPlist.replace(
        "<key>NSAllowsArbitraryLoads</key><false/>",
        "<key>NSAllowsArbitraryLoads</key><false/><key>NSAllowsArbitraryLoads</key><true/>",
      ),
      diagnostic: /arbitrary network loads/i,
    },
    {
      name: "arbitrary network loads hidden by a commented false value",
      file: "infoPath" as const,
      source: validInfoPlist.replace(
        "<key>NSAllowsArbitraryLoads</key><false/>",
        "<key>NSAllowsArbitraryLoads</key><true/><!-- <key>NSAllowsArbitraryLoads</key><false/> -->",
      ),
      diagnostic: /arbitrary network loads/i,
    },
    {
      name: "ATS exception domains",
      file: "infoPath" as const,
      source: validInfoPlist.replace(
        "<key>NSAllowsLocalNetworking</key><true/>",
        "<key>NSAllowsLocalNetworking</key><true/><key>NSExceptionDomains</key><dict/>",
      ),
      diagnostic: /ATS relaxation/i,
    },
    {
      name: "unexpected sensitive permission",
      file: "infoPath" as const,
      source: validInfoPlist.replace("</dict></plist>", "<key>NSCameraUsageDescription</key><string>Camera</string></dict></plist>"),
      diagnostic: /sensitive usage description/i,
    },
    {
      name: "iPhone portrait orientation",
      file: "infoPath" as const,
      source: validInfoPlist.replace("<string>UIInterfaceOrientationPortrait</string>", ""),
      diagnostic: /iPhone orientations/i,
    },
    {
      name: "unexpected iPhone landscape orientation",
      file: "infoPath" as const,
      source: validInfoPlist.replace(
        "<string>UIInterfaceOrientationPortraitUpsideDown</string></array>",
        "<string>UIInterfaceOrientationPortraitUpsideDown</string><string>UIInterfaceOrientationLandscapeLeft</string></array>",
      ),
      diagnostic: /iPhone orientations/i,
    },
    {
      name: "iPad orientations",
      file: "infoPath" as const,
      source: validInfoPlist.replace("<string>UIInterfaceOrientationLandscapeRight</string>", ""),
      diagnostic: /iPad orientations/i,
    },
  ];

  for (const fixtureCase of cases) {
    const fixture = makeGeneratedProject();
    try {
      writeFileSync(fixture[fixtureCase.file], fixtureCase.source);
      const result = runChecker(fixture.root);
      assert.notEqual(result.status, 0, `${fixtureCase.name} drift was accepted`);
      assert.match(result.stderr, fixtureCase.diagnostic);
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  }
});
