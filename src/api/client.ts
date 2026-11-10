import type { components } from "./generated";

type ApiSchemas = components["schemas"];

export type TenantMembership = ApiSchemas["TenantMembershipRead"];
export type CourseReleaseSummary = ApiSchemas["CourseReleaseSummaryRead"];
export type CourseRelease = ApiSchemas["CourseReleaseRead"];
export type LearningProgress = ApiSchemas["ProgressRead"];
export type LearningProgressCreate = ApiSchemas["ProgressCreate"];
export type AssessmentAttempt = ApiSchemas["AttemptRead"];
export type AssessmentAttemptCreate = ApiSchemas["AttemptCreate"];

export interface CurrentSession {
  user_id: string;
  expires_at: string;
}

export type ApiErrorCategory =
  | "unauthorized"
  | "forbidden"
  | "conflict"
  | "validation"
  | "server"
  | "http"
  | "network"
  | "timeout";

export class ApiClientError extends Error {
  readonly name = "ApiClientError";

  constructor(
    message: string,
    readonly category: ApiErrorCategory,
    readonly status: number,
    readonly detail?: unknown,
    readonly requestId?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

export interface ApiClientOptions {
  /** Absolute API origin or same-origin base path. Defaults to the current origin. */
  baseUrl?: string;
  /** Override fetch for tests or controlled runtimes. */
  fetcher?: typeof fetch;
  /** Per-request timeout in milliseconds. Set to 0 to disable. */
  timeoutMs?: number;
}

interface RequestOptions {
  method?: "GET" | "POST";
  tenantId?: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  signal?: AbortSignal;
}

const UNSAFE_METHODS = new Set(["POST"]);
const DEFAULT_TIMEOUT_MS = 15_000;

function normalizeBaseUrl(value: string | undefined): string {
  return (value ?? "").replace(/\/+$/, "");
}

function appendQuery(
  path: string,
  query: Record<string, string | number | boolean | undefined> | undefined,
): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const encoded = params.toString();
  return encoded ? `${path}${path.includes("?") ? "&" : "?"}${encoded}` : path;
}

function responseMessage(detail: unknown, fallback: string): string {
  if (typeof detail === "string" && detail.trim()) return detail;
  if (
    typeof detail === "object" &&
    detail !== null &&
    "detail" in detail &&
    typeof detail.detail === "string" &&
    detail.detail.trim()
  ) {
    return detail.detail;
  }
  return fallback;
}

function errorCategory(status: number): ApiErrorCategory {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 409) return "conflict";
  if (status === 422) return "validation";
  if (status >= 500) return "server";
  return "http";
}

function awaitWithSignal<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) {
    return Promise.reject(signal.reason ?? new DOMException("Request was cancelled", "AbortError"));
  }

  return new Promise<T>((resolve, reject) => {
    const abort = () => {
      cleanup();
      reject(signal.reason ?? new DOMException("Request was cancelled", "AbortError"));
    };
    const cleanup = () => signal.removeEventListener("abort", abort);
    signal.addEventListener("abort", abort, { once: true });
    promise.then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error: unknown) => {
        cleanup();
        reject(error);
      },
    );
  });
}

export class AcademyApiClient {
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;
  private csrfTokenPromise: Promise<string> | null = null;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl);
    this.fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private async fetchWithTimeout<T>(
    path: string,
    init: RequestInit,
    consume: (response: Response) => Promise<T>,
  ): Promise<T> {
    const controller = new AbortController();
    const externalSignal = init.signal;
    let didTimeout = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const abortFromCaller = () => controller.abort(externalSignal?.reason);

    if (externalSignal?.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal?.addEventListener("abort", abortFromCaller, { once: true });
    }
    if (this.timeoutMs > 0) {
      timeout = setTimeout(() => {
        didTimeout = true;
        controller.abort(new DOMException("Request timed out", "TimeoutError"));
      }, this.timeoutMs);
    }

    try {
      const response = await this.fetcher(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
      });
      return await consume(response);
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      if (didTimeout) {
        throw new ApiClientError("The API request timed out", "timeout", 0, undefined, undefined, {
          cause: error,
        });
      }
      if (externalSignal?.aborted) throw error;
      throw new ApiClientError("The API could not be reached", "network", 0, undefined, undefined, {
        cause: error,
      });
    } finally {
      if (timeout !== undefined) clearTimeout(timeout);
      externalSignal?.removeEventListener("abort", abortFromCaller);
    }
  }

  private async readError(response: Response): Promise<ApiClientError> {
    let detail: unknown;
    try {
      detail = await response.json();
    } catch {
      detail = undefined;
    }
    return new ApiClientError(
      responseMessage(detail, `API request failed with status ${response.status}`),
      errorCategory(response.status),
      response.status,
      detail,
      response.headers.get("x-request-id") ?? undefined,
    );
  }

  private async fetchCsrfToken(): Promise<string> {
    return this.fetchWithTimeout(
      "/auth/csrf",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      },
      async (response) => {
        if (!response.ok) {
          const error = await this.readError(response);
          if (error.category === "unauthorized") this.clearCsrfToken();
          throw error;
        }

        let payload: unknown;
        try {
          payload = await response.json();
        } catch (error) {
          throw new ApiClientError(
            "The CSRF endpoint returned invalid JSON",
            "http",
            response.status,
            undefined,
            undefined,
            { cause: error },
          );
        }
        const token =
          typeof payload === "object" &&
          payload !== null &&
          "csrf_token" in payload &&
          typeof payload.csrf_token === "string"
            ? payload.csrf_token
            : "";
        if (!token) {
          throw new ApiClientError(
            "The CSRF endpoint did not return a token",
            "http",
            response.status,
            payload,
          );
        }
        return token;
      },
    );
  }

  private getCsrfToken(): Promise<string> {
    if (!this.csrfTokenPromise) {
      this.csrfTokenPromise = this.fetchCsrfToken().catch((error: unknown) => {
        this.csrfTokenPromise = null;
        throw error;
      });
    }
    return this.csrfTokenPromise;
  }

  private clearCsrfToken(): void {
    this.csrfTokenPromise = null;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    if (options.signal?.aborted) {
      throw options.signal.reason ?? new DOMException("Request was cancelled", "AbortError");
    }
    const method = options.method ?? "GET";
    const headers = new Headers({ Accept: "application/json" });
    if (options.tenantId) headers.set("X-Tenant-ID", options.tenantId);

    let body: string | undefined;
    if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }
    if (UNSAFE_METHODS.has(method)) {
      headers.set("X-CSRF-Token", await awaitWithSignal(this.getCsrfToken(), options.signal));
    }
    if (options.signal?.aborted) {
      throw options.signal.reason ?? new DOMException("Request was cancelled", "AbortError");
    }

    return this.fetchWithTimeout(
      appendQuery(path, options.query),
      {
        method,
        credentials: "include",
        cache: "no-store",
        headers,
        body,
        signal: options.signal,
      },
      async (response) => {
        if (!response.ok) {
          const error = await this.readError(response);
          if (
            error.category === "unauthorized" ||
            (error.category === "forbidden" && error.message === "CSRF validation failed")
          ) {
            this.clearCsrfToken();
          }
          throw error;
        }
        if (response.status === 204) return undefined as T;

        const text = await response.text();
        if (!text) return undefined as T;
        try {
          return JSON.parse(text) as T;
        } catch (error) {
          throw new ApiClientError(
            "The API returned invalid JSON",
            "http",
            response.status,
            undefined,
            response.headers.get("x-request-id") ?? undefined,
            { cause: error },
          );
        }
      },
    );
  }

  getCurrentSession(signal?: AbortSignal): Promise<CurrentSession> {
    return this.request("/auth/me", { signal });
  }

  getMyTenants(signal?: AbortSignal): Promise<TenantMembership[]> {
    return this.request("/tenants/me", { signal });
  }

  listPublishedCourseReleases(
    tenantId: string,
    query: { course_key?: string; limit?: number } = {},
    signal?: AbortSignal,
  ): Promise<CourseReleaseSummary[]> {
    return this.request("/courses/releases", { tenantId, query, signal });
  }

  getCourseRelease(
    tenantId: string,
    releaseId: string,
    signal?: AbortSignal,
  ): Promise<CourseRelease> {
    return this.request(`/courses/releases/${encodeURIComponent(releaseId)}`, {
      tenantId,
      signal,
    });
  }

  listLearningProgress(
    tenantId: string,
    query: { course_release_id?: string; limit?: number } = {},
    signal?: AbortSignal,
  ): Promise<LearningProgress[]> {
    return this.request("/learning/progress", { tenantId, query, signal });
  }

  beginLearningProgress(
    tenantId: string,
    body: LearningProgressCreate,
    signal?: AbortSignal,
  ): Promise<LearningProgress> {
    return this.request("/learning/progress", { method: "POST", tenantId, body, signal });
  }

  completeLearningProgress(
    tenantId: string,
    progressId: string,
    signal?: AbortSignal,
  ): Promise<LearningProgress> {
    return this.request(`/learning/progress/${encodeURIComponent(progressId)}/complete`, {
      method: "POST",
      tenantId,
      signal,
    });
  }

  reopenLearningProgress(
    tenantId: string,
    progressId: string,
    signal?: AbortSignal,
  ): Promise<LearningProgress> {
    return this.request(`/learning/progress/${encodeURIComponent(progressId)}/reopen`, {
      method: "POST",
      tenantId,
      signal,
    });
  }

  listAssessmentAttempts(
    tenantId: string,
    query: { course_release_id?: string; limit?: number } = {},
    signal?: AbortSignal,
  ): Promise<AssessmentAttempt[]> {
    return this.request("/assessments/attempts", { tenantId, query, signal });
  }

  createAssessmentAttempt(
    tenantId: string,
    body: AssessmentAttemptCreate,
    signal?: AbortSignal,
  ): Promise<AssessmentAttempt> {
    return this.request("/assessments/attempts", { method: "POST", tenantId, body, signal });
  }

  submitAssessmentAttempt(
    tenantId: string,
    attemptId: string,
    signal?: AbortSignal,
  ): Promise<AssessmentAttempt> {
    return this.request(`/assessments/attempts/${encodeURIComponent(attemptId)}/submit`, {
      method: "POST",
      tenantId,
      signal,
    });
  }

  logout(signal?: AbortSignal): Promise<void> {
    return this.request<void>("/auth/logout", { method: "POST", signal }).finally(() => {
      this.clearCsrfToken();
    });
  }
}

export const academyApi = new AcademyApiClient();
