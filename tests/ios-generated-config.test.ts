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
    `AAA /* Debug */ = {
  isa = XCBuildConfiguration;
  buildSettings = {
    INFOPLIST_FILE = SideQuestChess/Info.plist;
    PRODUCT_BUNDLE_IDENTIFIER = com.sidequestchess.app;
    TARGETED_DEVICE_FAMILY = "1,2";
  };
  name = Debug;
};
BBB /* Release */ = {
  isa = XCBuildConfiguration;
  buildSettings = {
    INFOPLIST_FILE = SideQuestChess/Info.plist;
    PRODUCT_BUNDLE_IDENTIFIER = com.sidequestchess.app;
    TARGETED_DEVICE_FAMILY = "1,2";
  };
  name = Release;
};`,
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

test("generated iOS config ignores identity settings owned by an extension target", () => {
  const iosRoot = makeGeneratedIosFixture();
  try {
    const projectPath = join(iosRoot, "SideQuestChess.xcodeproj", "project.pbxproj");
    const project = `${readFileSync(projectPath, "utf8")}
CCC /* Debug */ = {
  isa = XCBuildConfiguration;
  buildSettings = {
    INFOPLIST_FILE = Widget/Info.plist;
    PRODUCT_BUNDLE_IDENTIFIER = com.sidequestchess.app.widget;
    TARGETED_DEVICE_FAMILY = 1;
  };
  name = Debug;
};
DDD /* Release */ = {
  isa = XCBuildConfiguration;
  buildSettings = {
    INFOPLIST_FILE = Widget/Info.plist;
    PRODUCT_BUNDLE_IDENTIFIER = com.sidequestchess.app.widget;
    TARGETED_DEVICE_FAMILY = 1;
  };
  name = Release;
};`;
    writeFileSync(projectPath, project);
    const result = spawnSync(process.execPath, ["scripts/check-generated-ios-config.mjs", iosRoot], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(iosRoot, { recursive: true, force: true });
  }
});

test("generated iOS config rejects the callback value outside CFBundleURLSchemes", () => {
  const iosRoot = makeGeneratedIosFixture();
  try {
    const infoPath = join(iosRoot, "SideQuestChess", "Info.plist");
    const info = readFileSync(infoPath, "utf8").replace("CFBundleURLSchemes", "UnrelatedValues");
    writeFileSync(infoPath, info);
    const result = spawnSync(process.execPath, ["scripts/check-generated-ios-config.mjs", iosRoot], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /URL scheme/i);
  } finally {
    rmSync(iosRoot, { recursive: true, force: true });
  }
});

test("generated iOS config rejects malformed plist XML", () => {
  const iosRoot = makeGeneratedIosFixture();
  try {
    const infoPath = join(iosRoot, "SideQuestChess", "Info.plist");
    const info = readFileSync(infoPath, "utf8").replace("</dict></plist>", "<unexpected></dict></plist>");
    writeFileSync(infoPath, info);
    const result = spawnSync(process.execPath, ["scripts/check-generated-ios-config.mjs", iosRoot], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /parse generated plist/i);
  } finally {
    rmSync(iosRoot, { recursive: true, force: true });
  }
});

test("generated iOS config rejects NSAllowsArbitraryLoads outside NSAppTransportSecurity", () => {
  const iosRoot = makeGeneratedIosFixture();
  try {
    const infoPath = join(iosRoot, "SideQuestChess", "Info.plist");
    const info = readFileSync(infoPath, "utf8").replace("NSAppTransportSecurity", "UnrelatedPolicy");
    writeFileSync(infoPath, info);
    const result = spawnSync(process.execPath, ["scripts/check-generated-ios-config.mjs", iosRoot], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /ATS arbitrary loads/i);
  } finally {
    rmSync(iosRoot, { recursive: true, force: true });
  }
});

test("generated iOS config rejects a bundle identifier other than com.sidequestchess.app", () => {
  const iosRoot = makeGeneratedIosFixture();
  try {
    const projectPath = join(iosRoot, "SideQuestChess.xcodeproj", "project.pbxproj");
    const project = readFileSync(projectPath, "utf8").replace(
      "PRODUCT_BUNDLE_IDENTIFIER = com.sidequestchess.app;",
      "PRODUCT_BUNDLE_IDENTIFIER = com.example.wrong;",
    );
    writeFileSync(projectPath, project);
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

test("generated iOS config requires app identity settings in Debug and Release", () => {
  const iosRoot = makeGeneratedIosFixture();
  try {
    const projectPath = join(iosRoot, "SideQuestChess.xcodeproj", "project.pbxproj");
    const project = readFileSync(projectPath, "utf8").replace(/BBB \/\* Release \*\/[\s\S]*?\n};/, "");
    writeFileSync(projectPath, project);
    const result = spawnSync(process.execPath, ["scripts/check-generated-ios-config.mjs", iosRoot], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Debug and Release/i);
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

test("generated iOS config rejects NFCReaderUsageDescription", () => {
  const iosRoot = makeGeneratedIosFixture();
  try {
    const infoPath = join(iosRoot, "SideQuestChess", "Info.plist");
    const info = readFileSync(infoPath, "utf8").replace(
      "</dict></plist>",
      "<key>NFCReaderUsageDescription</key><string>Unexpected NFC access</string></dict></plist>",
    );
    writeFileSync(infoPath, info);
    const result = spawnSync(process.execPath, ["scripts/check-generated-ios-config.mjs", iosRoot], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /unexpected sensitive-resource usage description.*NFCReaderUsageDescription/i);
  } finally {
    rmSync(iosRoot, { recursive: true, force: true });
  }
});

test("generated iOS config rejects Default outside the Apple sign-in entitlement array", () => {
  const iosRoot = makeGeneratedIosFixture();
  try {
    const entitlementsPath = join(iosRoot, "SideQuestChess", "SideQuestChess.entitlements");
    writeFileSync(
      entitlementsPath,
      `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
<key>com.apple.developer.applesignin</key><array></array>
<key>unrelated-entitlement</key><array><string>Default</string></array>
</dict></plist>`,
    );
    const result = spawnSync(process.execPath, ["scripts/check-generated-ios-config.mjs", iosRoot], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Sign in with Apple entitlement/i);
  } finally {
    rmSync(iosRoot, { recursive: true, force: true });
  }
});

test("generated iOS config requires both iPhone and iPad device families", () => {
  const iosRoot = makeGeneratedIosFixture();
  try {
    const projectPath = join(iosRoot, "SideQuestChess.xcodeproj", "project.pbxproj");
    const project = readFileSync(projectPath, "utf8").replace(
      'TARGETED_DEVICE_FAMILY = "1,2";',
      "TARGETED_DEVICE_FAMILY = 1;",
    );
    writeFileSync(projectPath, project);
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
