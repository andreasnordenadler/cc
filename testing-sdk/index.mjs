const DEFAULT_BASE_URL = "https://sidequestchess.com";
const DEFAULT_TIMEOUT_MS = 15_000;

export class SideQuestChessTestClient {
  constructor(options = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl ?? process.env.SQC_BASE_URL ?? DEFAULT_BASE_URL);
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
    this.defaultHeaders = {
      "user-agent": options.userAgent ?? "sqc-testing-sdk/1.0",
      accept: "application/json, text/html;q=0.9, image/png;q=0.8, */*;q=0.5",
      ...(options.headers ?? {}),
    };
    this.authCookie = options.authCookie ?? process.env.SQC_TEST_COOKIE ?? "";
    this.timeoutMs = options.timeoutMs ?? Number(process.env.SQC_TEST_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

    if (typeof this.fetchImpl !== "function") {
      throw new Error("SideQuestChessTestClient requires a fetch implementation.");
    }
  }

  url(path = "/") {
    return new URL(path, `${this.baseUrl}/`).toString();
  }

  async request(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? this.timeoutMs);
    const headers = {
      ...this.defaultHeaders,
      ...(options.authenticated && this.authCookie ? { cookie: this.authCookie } : {}),
      ...(options.headers ?? {}),
    };

    try {
      const response = await this.fetchImpl(this.url(path), {
        ...options,
        headers,
        signal: options.signal ?? controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  async getJson(path, options = {}) {
    const response = await this.request(path, options);
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Expected JSON from ${path}, got ${response.status} ${response.headers.get("content-type") || "unknown content-type"}`);
    }

    if (!response.ok && options.allowError !== true) {
      throw new Error(`Request failed for ${path}: ${response.status} ${JSON.stringify(data)}`);
    }

    return { response, data };
  }

  async getText(path, options = {}) {
    const response = await this.request(path, options);
    const text = await response.text();

    if (!response.ok && options.allowError !== true) {
      throw new Error(`Request failed for ${path}: ${response.status} ${text.slice(0, 240)}`);
    }

    return { response, text };
  }

  async getBootstrap() {
    const { data } = await this.getJson("/api/mobile/bootstrap");
    return data;
  }

  async getChallenge(challengeId) {
    const bootstrap = await this.getBootstrap();
    const challenge = bootstrap.challenges.find((candidate) => candidate.id === challengeId);
    if (!challenge) {
      throw new Error(`Unknown challenge: ${challengeId}`);
    }
    return challenge;
  }

  async getAccount(options = {}) {
    return this.getJson("/api/mobile/account", { authenticated: true, ...options });
  }

  async questAction(action, payload = {}) {
    return this.getJson("/api/mobile/quest", {
      method: "POST",
      authenticated: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
  }

  startQuest(challengeId) {
    return this.questAction("start", { challengeId });
  }

  checkActiveQuest() {
    return this.questAction("check");
  }

  submitQuestProof(challengeId, gameUrlOrId) {
    return this.questAction("submit", { challengeId, gameUrl: gameUrlOrId });
  }

  deactivateQuest(challengeId) {
    return this.questAction("deactivate", { challengeId });
  }

  resetQuest(challengeId) {
    return this.questAction("reset", { challengeId });
  }

  async smokePublicPages(paths = DEFAULT_PUBLIC_SMOKE_PATHS) {
    const results = [];
    for (const path of paths) {
      const { response, text } = await this.getText(path);
      results.push({
        path,
        url: this.url(path),
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get("content-type") ?? "",
        title: extractTitle(text),
      });
    }
    return results;
  }

  async checkMobileBootstrapContract() {
    const bootstrap = await this.getBootstrap();
    assert(bootstrap.apiVersion === 1, "bootstrap apiVersion should be 1");
    assert(bootstrap.product?.name === "Side Quest Chess", "bootstrap product name should be Side Quest Chess");
    assert(Array.isArray(bootstrap.challenges), "bootstrap challenges should be an array");
    assert(bootstrap.challenges.length > 0, "bootstrap should expose at least one challenge");

    const missingFields = bootstrap.challenges
      .filter((challenge) => !challenge.id || !challenge.title || !challenge.objective || !challenge.badgeIdentity?.name)
      .map((challenge) => challenge.id || "<missing-id>");

    assert(missingFields.length === 0, `bootstrap challenges missing required fields: ${missingFields.join(", ")}`);

    return {
      apiVersion: bootstrap.apiVersion,
      challengeCount: bootstrap.challenges.length,
      firstChallengeId: bootstrap.challenges[0]?.id ?? null,
      ok: true,
    };
  }

  async checkCompletedQuestSeal(options = {}) {
    const sealPath = options.sealPath ?? "/stamps/quest-complete-premium-red-wax-sqc-v15.png";
    const response = await this.request(sealPath, { headers: { accept: "image/png,*/*" } });
    const contentType = response.headers.get("content-type") ?? "";
    assert(response.ok, `seal asset should be reachable: ${response.status}`);
    assert(contentType.includes("image/png"), `seal asset should be image/png, got ${contentType || "unknown"}`);

    let referencedByAccountPage = null;
    if (options.expectAccountReference) {
      const { text } = await this.getText("/account", { authenticated: true });
      referencedByAccountPage = text.includes(sealPath);
      assert(referencedByAccountPage, `account page should reference ${sealPath}`);
    }

    return {
      sealPath,
      sealUrl: this.url(sealPath),
      status: response.status,
      contentType,
      referencedByAccountPage,
      ok: true,
    };
  }
}

export const DEFAULT_PUBLIC_SMOKE_PATHS = Object.freeze([
  "/",
  "/challenges",
  "/challenges/finish-any-game",
  "/result?challengeId=finish-any-game",
  "/account",
  "/badges",
]);

export async function createSqcTestClient(options = {}) {
  return new SideQuestChessTestClient(options);
}

function normalizeBaseUrl(baseUrl) {
  const normalized = String(baseUrl).trim().replace(/\/+$/, "");
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    throw new Error(`baseUrl must be absolute: ${baseUrl}`);
  }
  return normalized;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1]?.trim() ?? "";
}
