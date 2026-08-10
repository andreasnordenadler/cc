import assert from "node:assert/strict";
import test from "node:test";

import { evaluateProductionAudit } from "../scripts/production-audit-lib.mjs";

const metroImageFinding = {
  version: "1.2.1",
  paths: [
    "apps__mobile>expo>@expo/metro>metro>image-size",
    "apps__mobile>@clerk/clerk-expo>expo-auth-session>expo>react-native>@react-native/community-cli-plugin>metro>image-size",
  ],
};

test("production audit rejects malformed advisories and findings before allowlisting", () => {
  const invalidReports = [
    { advisories: [] },
    { advisories: { "1": null } },
    { advisories: { "1": { github_advisory_id: "GHSA-w3rx-r6r6-pgpr", module_name: "image-size", severity: "unknown", findings: [metroImageFinding] } } },
    { advisories: { "1": { github_advisory_id: "GHSA-w3rx-r6r6-pgpr", module_name: "image-size", severity: "high", findings: [] } } },
    { advisories: { "1": { github_advisory_id: "GHSA-w3rx-r6r6-pgpr", module_name: "image-size", severity: "high", findings: [metroImageFinding, {}] } } },
    { advisories: { "1": { github_advisory_id: "GHSA-w3rx-r6r6-pgpr", module_name: "image-size", severity: "high", findings: [{ version: "1.2.1", paths: ["apps__mobile>runtime>image-size"] }] } } },
  ];

  for (const report of invalidReports) {
    assert.throws(() => evaluateProductionAudit(report), /invalid|blocked/i);
  }
});

test("production audit accepts only the exact unpatched Metro image parser advisories", () => {
  const accepted = {
    advisories: {
      "1": { github_advisory_id: "GHSA-w3rx-r6r6-pgpr", module_name: "image-size", severity: "high", findings: [metroImageFinding] },
      "2": { github_advisory_id: "GHSA-5p2g-fcmc-qvqq", module_name: "image-size", severity: "high", findings: [metroImageFinding] },
    },
  };

  assert.deepEqual(evaluateProductionAudit(accepted), {
    acceptedAdvisories: ["GHSA-5p2g-fcmc-qvqq", "GHSA-w3rx-r6r6-pgpr"],
  });

  assert.throws(
    () => evaluateProductionAudit({
      advisories: {
        ...accepted.advisories,
        "3": { github_advisory_id: "GHSA-new-runtime-risk", module_name: "runtime-package", severity: "high", findings: [{ version: "1.0.0", paths: ["apps__mobile>runtime-package"] }] },
      },
    }),
    /GHSA-new-runtime-risk.*runtime-package/,
  );
});
