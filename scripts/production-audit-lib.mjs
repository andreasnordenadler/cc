const acceptedBuildToolAdvisories = new Map([
  ["GHSA-w3rx-r6r6-pgpr", { moduleName: "image-size", pathSuffix: ">metro>image-size" }],
  ["GHSA-5p2g-fcmc-qvqq", { moduleName: "image-size", pathSuffix: ">metro>image-size" }],
]);

export function evaluateProductionAudit(report) {
  if (!report || typeof report !== "object" || !report.advisories || typeof report.advisories !== "object" || Array.isArray(report.advisories)) {
    throw new Error("Production audit returned an invalid advisory report.");
  }

  const acceptedAdvisories = [];
  const blockers = [];
  for (const advisory of Object.values(report.advisories)) {
    const validAdvisory = advisory
      && typeof advisory === "object"
      && typeof advisory.github_advisory_id === "string"
      && advisory.github_advisory_id.length > 0
      && typeof advisory.module_name === "string"
      && advisory.module_name.length > 0
      && ["info", "low", "moderate", "high", "critical"].includes(advisory.severity)
      && Array.isArray(advisory.findings)
      && advisory.findings.length > 0
      && advisory.findings.every((finding) => finding
        && typeof finding === "object"
        && Array.isArray(finding.paths)
        && finding.paths.length > 0
        && finding.paths.every((findingPath) => typeof findingPath === "string" && findingPath.length > 0));
    if (!validAdvisory) {
      throw new Error("Production audit returned an invalid advisory or finding.");
    }
    if (!["high", "critical"].includes(advisory.severity)) continue;

    const advisoryId = advisory.github_advisory_id;
    const accepted = acceptedBuildToolAdvisories.get(advisoryId);
    const paths = advisory.findings.flatMap((finding) => finding.paths);
    const exactBuildToolFinding = accepted
      && advisory.module_name === accepted.moduleName
      && paths.every((findingPath) => findingPath.startsWith("apps__mobile>") && findingPath.endsWith(accepted.pathSuffix));

    if (exactBuildToolFinding) {
      acceptedAdvisories.push(advisoryId);
    } else {
      blockers.push(`${advisoryId ?? "unknown advisory"} (${advisory.module_name ?? "unknown package"})`);
    }
  }

  if (blockers.length > 0) {
    throw new Error(`Production dependency audit blocked by: ${blockers.sort().join(", ")}`);
  }

  return { acceptedAdvisories: [...new Set(acceptedAdvisories)].sort() };
}
