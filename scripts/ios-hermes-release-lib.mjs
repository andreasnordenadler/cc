import path from "node:path";

const UUID_LINE = /UUID:\s+([0-9A-F-]+)\s+\(([^)]+)\)/gi;

export function deriveReleaseHermesReference(appPath) {
  const releaseProducts = path.dirname(path.resolve(appPath));
  if (!/^Release-(?:iphoneos|iphonesimulator)$/.test(path.basename(releaseProducts))) {
    throw new Error("Release app must be inside Xcode's Release build products directory.");
  }
  return path.join(
    releaseProducts,
    "XCFrameworkIntermediates/hermes-engine/Pre-built/hermes.framework/hermes",
  );
}

export function parseArchitectureUuids(output) {
  const uuids = new Map();
  for (const match of output.matchAll(UUID_LINE)) {
    uuids.set(match[2], match[1].toUpperCase());
  }
  if (uuids.size === 0) {
    throw new Error("No architecture UUIDs found in dwarfdump output.");
  }
  return uuids;
}

export function verifyHermesReleaseEvidence({
  builtUuidOutput,
  releaseUuidOutput,
  builtSymbolsOutput,
  releaseSymbolsOutput,
}) {
  if (/debugJavaScript/.test(builtSymbolsOutput)) {
    throw new Error(
      "Release app contains the Debug Hermes symbol debugJavaScript; rebuild from a clean Release Pods/DerivedData state.",
    );
  }
  if (/debugJavaScript/.test(releaseSymbolsOutput)) {
    throw new Error(
      "Release reference contains the Debug Hermes symbol debugJavaScript; CocoaPods did not select a trusted Release framework.",
    );
  }

  const built = parseArchitectureUuids(builtUuidOutput);
  const release = parseArchitectureUuids(releaseUuidOutput);
  const missingArchitectures = [...release.keys()]
    .filter((architecture) => !built.has(architecture))
    .sort();
  const unexpectedArchitectures = [...built.keys()]
    .filter((architecture) => !release.has(architecture))
    .sort();
  if (missingArchitectures.length > 0 || unexpectedArchitectures.length > 0) {
    throw new Error(
      `Hermes architecture set mismatch; missing from built binary: ${missingArchitectures.join(", ") || "none"}; unexpected: ${unexpectedArchitectures.join(", ") || "none"}.`,
    );
  }

  const mismatchedArchitectures = [...built]
    .filter(([architecture, uuid]) => release.get(architecture) !== uuid)
    .map(([architecture]) => architecture)
    .sort();

  if (mismatchedArchitectures.length > 0) {
    throw new Error(
      `Hermes Release UUID mismatch for architectures: ${mismatchedArchitectures.join(", ")}.`,
    );
  }

  return {
    architectures: [...built.keys()].sort(),
  };
}
