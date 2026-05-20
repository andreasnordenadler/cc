export type SqcTestClientOptions = {
  baseUrl?: string;
  authCookie?: string;
  headers?: Record<string, string>;
  userAgent?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export type PublicSmokeResult = {
  path: string;
  url: string;
  status: number;
  ok: boolean;
  contentType: string;
  title: string;
};

export type CompletedQuestSealCheck = {
  sealPath: string;
  sealUrl: string;
  status: number;
  contentType: string;
  referencedByAccountPage: boolean | null;
  ok: true;
};

export declare class SideQuestChessTestClient {
  constructor(options?: SqcTestClientOptions);
  baseUrl: string;
  authCookie: string;
  timeoutMs: number;
  url(path?: string): string;
  request(path: string, options?: RequestInit & { authenticated?: boolean; timeoutMs?: number; allowError?: boolean }): Promise<Response>;
  getJson<T = unknown>(path: string, options?: RequestInit & { authenticated?: boolean; timeoutMs?: number; allowError?: boolean }): Promise<{ response: Response; data: T }>;
  getText(path: string, options?: RequestInit & { authenticated?: boolean; timeoutMs?: number; allowError?: boolean }): Promise<{ response: Response; text: string }>;
  getBootstrap<T = unknown>(): Promise<T>;
  getChallenge<T = unknown>(challengeId: string): Promise<T>;
  getAccount<T = unknown>(options?: RequestInit & { allowError?: boolean }): Promise<{ response: Response; data: T }>;
  questAction<T = unknown>(action: string, payload?: Record<string, unknown>): Promise<{ response: Response; data: T }>;
  startQuest<T = unknown>(challengeId: string): Promise<{ response: Response; data: T }>;
  checkActiveQuest<T = unknown>(): Promise<{ response: Response; data: T }>;
  submitQuestProof<T = unknown>(challengeId: string, gameUrlOrId: string): Promise<{ response: Response; data: T }>;
  deactivateQuest<T = unknown>(challengeId: string): Promise<{ response: Response; data: T }>;
  resetQuest<T = unknown>(challengeId: string): Promise<{ response: Response; data: T }>;
  smokePublicPages(paths?: string[]): Promise<PublicSmokeResult[]>;
  checkMobileBootstrapContract(): Promise<{ apiVersion: number; challengeCount: number; firstChallengeId: string | null; ok: true }>;
  checkCompletedQuestSeal(options?: { sealPath?: string; expectAccountReference?: boolean }): Promise<CompletedQuestSealCheck>;
}

export declare const DEFAULT_PUBLIC_SMOKE_PATHS: readonly string[];
export declare function createSqcTestClient(options?: SqcTestClientOptions): Promise<SideQuestChessTestClient>;
