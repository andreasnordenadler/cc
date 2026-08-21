export type MobileCandidateConfig = {
  version?: string;
  ios?: { bundleIdentifier?: string };
  android?: { package?: string; versionCode?: number };
};

type MobileCandidateIdentityInput = {
  platform: string;
  nativeApplicationVersion?: string | null;
  nativeBuildVersion?: string | null;
  applicationId?: string | null;
  config: MobileCandidateConfig;
};

export type MobileCandidateIdentity = {
  appVersion: string;
  appBuild: string;
  applicationId: string;
  artifactLabel: string;
  releaseCandidate: string;
  releaseUrl: string | null;
};

const MOBILE_RELEASE_BASE_URL = "https://github.com/andreasnordenadler/cc/releases/tag";

export function getMobileCandidateIdentity(input: MobileCandidateIdentityInput): MobileCandidateIdentity {
  const appVersion = input.nativeApplicationVersion ?? input.config.version ?? "unknown";

  if (input.platform === "ios") {
    const appBuild = input.nativeBuildVersion ?? "unknown";
    return {
      appVersion,
      appBuild,
      applicationId: input.applicationId ?? input.config.ios?.bundleIdentifier ?? "unknown",
      artifactLabel: "iOS app build",
      releaseCandidate: `${appVersion} (${appBuild})`,
      releaseUrl: null,
    };
  }

  const nativeBuild = input.nativeBuildVersion ? Number(input.nativeBuildVersion) : undefined;
  const versionCode = Number.isFinite(nativeBuild) ? nativeBuild : input.config.android?.versionCode;
  const appBuild = versionCode ? String(versionCode) : "unknown";
  const releaseCandidate = versionCode ? `mobile-v${versionCode}` : "unknown";

  return {
    appVersion,
    appBuild,
    applicationId: input.applicationId ?? input.config.android?.package ?? "unknown",
    artifactLabel: "GitHub Release APK",
    releaseCandidate,
    releaseUrl: versionCode ? `${MOBILE_RELEASE_BASE_URL}/${releaseCandidate}` : null,
  };
}
