import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

function makeGeneratedIosFixture() {
  const root = mkdtempSync(join(tmpdir(), "sqc-ios-config-"));
  const appDir = join(root, "SideQuestChess");
  const projectDir = join(root, "SideQuestChess.xcodeproj");
  mkdirSync(appDir, { recursive: true });
  mkdirSync(projectDir, { recursive: true });
  writeFileSync(
    join(appDir, "Info.plist"),
    `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
<key>CFBundleURLTypes</key><array><dict><key>CFBundleURLSchemes</key><array><string>sidequestchess</string><string>com.sidequestchess.app</string></array></dict></array>
<key>NSAppTransportSecurity</key><dict><key>NSAllowsArbitraryLoads</key><false/></dict>
</dict></plist>`,
  );
  writeFileSync(
    join(appDir, "SideQuestChess.entitlements"),
    `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict><key>com.apple.developer.applesignin</key><array><string>Default</string></array></dict></plist>`,
  );
  writeFileSync(
    join(projectDir, "project.pbxproj"),
    'PRODUCT_BUNDLE_IDENTIFIER = com.sidequestchess.app;\nTARGETED_DEVICE_FAMILY = "1,2";',
  );
  return root;
}

test("generated iOS config accepts the expected URL scheme, ATS policy, and Apple sign-in entitlement", () => {
  const iosRoot = makeGeneratedIosFixture();
  try {
    const result = spawnSync(process.execPath, ["scripts/check-generated-ios-config.mjs", iosRoot], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(iosRoot, { recursive: true, force: true });
  }
});

test("generated iOS config rejects a bundle identifier other than com.sidequestchess.app", () => {
  const iosRoot = makeGeneratedIosFixture();
  try {
    const projectDir = join(iosRoot, "SideQuestChess.xcodeproj");
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(join(projectDir, "project.pbxproj"), "PRODUCT_BUNDLE_IDENTIFIER = com.example.wrong;");
    const result = spawnSync(process.execPath, ["scripts/check-generated-ios-config.mjs", iosRoot], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /bundle identifier/i);
  } finally {
    rmSync(iosRoot, { recursive: true, force: true });
  }
});

test("generated iOS config rejects undeclared sensitive-resource usage descriptions", () => {
  const iosRoot = makeGeneratedIosFixture();
  try {
    const infoPath = join(iosRoot, "SideQuestChess", "Info.plist");
    const info = readFileSync(infoPath, "utf8").replace(
      "</dict></plist>",
      "<key>NSCameraUsageDescription</key><string>Unexpected camera access</string></dict></plist>",
    );
    writeFileSync(infoPath, info);
    const result = spawnSync(process.execPath, ["scripts/check-generated-ios-config.mjs", iosRoot], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /unexpected sensitive-resource usage description.*NSCameraUsageDescription/i);
  } finally {
    rmSync(iosRoot, { recursive: true, force: true });
  }
});

test("generated iOS config requires both iPhone and iPad device families", () => {
  const iosRoot = makeGeneratedIosFixture();
  try {
    const projectPath = join(iosRoot, "SideQuestChess.xcodeproj", "project.pbxproj");
    writeFileSync(
      projectPath,
      'PRODUCT_BUNDLE_IDENTIFIER = com.sidequestchess.app;\nTARGETED_DEVICE_FAMILY = 1;',
    );
    const result = spawnSync(process.execPath, ["scripts/check-generated-ios-config.mjs", iosRoot], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /device family.*iPhone and iPad/i);
  } finally {
    rmSync(iosRoot, { recursive: true, force: true });
  }
});
