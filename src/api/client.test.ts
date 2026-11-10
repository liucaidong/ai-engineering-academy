import { describe, expect, it, vi } from "vitest";
import { AcademyApiClient, type ApiClientOptions } from "./client";

function jsonResponse(body: unknown, status = 200, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function client(fetcher: typeof fetch, options: Omit<ApiClientOptions, "fetcher"> = {}) {
  return new AcademyApiClient({ fetcher, ...options });
}

describe("AcademyApiClient", () => {
  it("uses credentialed requests and binds learner calls to the selected tenant", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ csrf_token: "csrf-session-token" }))
      .mockResolvedValueOnce(jsonResponse({ id: "progress-1" }, 201));
    const api = client(fetcher, { baseUrl: "https://api.example.test/" });

    await api.beginLearningProgress("tenant-1", {
      course_release_id: "release-1",
      module_key: "M01",
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
    const [csrfUrl, csrfInit] = fetcher.mock.calls[0] ?? [];
    expect(csrfUrl).toBe("https://api.example.test/auth/csrf");
    expect(csrfInit?.credentials).toBe("include");
    expect(csrfInit?.cache).toBe("no-store");
    expect(csrfInit?.method).toBe("GET");

    const [requestUrl, requestInit] = fetcher.mock.calls[1] ?? [];
    expect(requestUrl).toBe("https://api.example.test/learning/progress");
    expect(requestInit?.credentials).toBe("include");
    expect(requestInit?.cache).toBe("no-store");
    expect(requestInit?.method).toBe("POST");
    const headers = new Headers(requestInit?.headers);
    expect(headers.get("X-CSRF-Token")).toBe("csrf-session-token");
    expect(headers.get("X-Tenant-ID")).toBe("tenant-1");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      course_release_id: "release-1",
      module_key: "M01",
    });
  });

  it("reuses a session-bound CSRF token across concurrent unsafe requests", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ csrf_token: "csrf-1" }))
      .mockResolvedValueOnce(jsonResponse({ id: "a" }))
      .mockResolvedValueOnce(jsonResponse({ id: "b" }));
    const api = client(fetcher);

    await Promise.all([
      api.completeLearningProgress("tenant-1", "progress-a"),
      api.completeLearningProgress("tenant-1", "progress-b"),
    ]);

    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls[0]?.[0]).toBe("/auth/csrf");
  });

  it("invalidates a rejected CSRF token without automatically replaying a mutation", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ csrf_token: "stale-token" }))
      .mockResolvedValueOnce(jsonResponse({ detail: "CSRF validation failed" }, 403))
      .mockResolvedValueOnce(jsonResponse({ csrf_token: "fresh-token" }))
      .mockResolvedValueOnce(jsonResponse({ id: "progress-1" }));
    const api = client(fetcher);

    await expect(api.completeLearningProgress("tenant-1", "progress-1")).rejects.toMatchObject({
      category: "forbidden",
      status: 403,
    });
    await api.completeLearningProgress("tenant-1", "progress-1");

    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(new Headers(fetcher.mock.calls[3]?.[1]?.headers).get("X-CSRF-Token")).toBe(
      "fresh-token",
    );
  });

  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [409, "conflict"],
    [422, "validation"],
    [503, "server"],
  ] as const)("maps HTTP %i to the %s error category", async (status, category) => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse({ detail: "request rejected" }, status, { "X-Request-ID": "request-123" }),
      );
    const api = client(fetcher);

    await expect(api.getMyTenants()).rejects.toMatchObject({
      name: "ApiClientError",
      category,
      status,
      message: "request rejected",
      requestId: "request-123",
    });
  });

  it("serializes query parameters while omitting undefined values", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse([]));
    const api = client(fetcher);

    await api.listLearningProgress("tenant-1", { course_release_id: "release-1", limit: 25 });

    expect(fetcher.mock.calls[0]?.[0]).toBe(
      "/learning/progress?course_release_id=release-1&limit=25",
    );
    expect(new Headers(fetcher.mock.calls[0]?.[1]?.headers).get("X-Tenant-ID")).toBe("tenant-1");
  });

  it("returns void for a successful 204 logout and clears the CSRF cache", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ csrf_token: "csrf-1" }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const api = client(fetcher);

    await expect(api.logout()).resolves.toBeUndefined();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("reports request timeouts distinctly from network errors", async () => {
    const fetcher: typeof fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      });
    const api = client(fetcher, { timeoutMs: 5 });

    await expect(api.getMyTenants()).rejects.toMatchObject({
      name: "ApiClientError",
      category: "timeout",
      status: 0,
    });
  });

  it("preserves caller cancellation instead of reporting a network failure", async () => {
    const fetcher: typeof fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      });
    const api = client(fetcher, { timeoutMs: 1_000 });
    const controller = new AbortController();
    const request = api.getMyTenants(controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
  });

  it("wraps unexpected fetch failures as network errors", async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError("offline"));
    const api = client(fetcher);

    await expect(api.getMyTenants()).rejects.toMatchObject({
      name: "ApiClientError",
      category: "network",
      status: 0,
    });
  });
});
