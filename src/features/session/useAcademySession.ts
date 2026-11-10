import { useCallback, useEffect, useRef, useState } from "react";
import { ApiClientError, academyApi, type CurrentSession, type TenantMembership } from "../../api";

const TENANT_PREFERENCE_KEY = "ai-engineering-academy:tenant-preference:v1";

type SessionStatus = "disabled" | "loading" | "unauthenticated" | "authenticated" | "unavailable";
type TenantStatus = "idle" | "loading" | "ready" | "unavailable";

export interface AcademySessionState {
  status: SessionStatus;
  session: CurrentSession | null;
  tenants: TenantMembership[];
  tenantStatus: TenantStatus;
  selectedTenantId: string | null;
  error: string | null;
}

function readTenantPreference(): string | null {
  try {
    return window.localStorage.getItem(TENANT_PREFERENCE_KEY);
  } catch {
    return null;
  }
}

function writeTenantPreference(tenantId: string | null): void {
  try {
    if (tenantId) window.localStorage.setItem(TENANT_PREFERENCE_KEY, tenantId);
    else window.localStorage.removeItem(TENANT_PREFERENCE_KEY);
  } catch {
    // Tenant selection remains in memory when browser storage is unavailable.
  }
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiClientError && error.category === "unauthorized";
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.category === "timeout") return "连接超时，请检查网络后重试。";
    if (error.category === "network") return "无法连接账户服务，请检查网络或服务状态。";
    if (error.status === 503) return "账户服务尚未启用或暂时不可用。";
    if (error.category === "forbidden") return "当前账户没有访问权限。";
  }
  return "账户状态暂时无法确认，请稍后重试。";
}

const initialState = (enabled: boolean): AcademySessionState => ({
  status: enabled ? "loading" : "disabled",
  session: null,
  tenants: [],
  tenantStatus: "idle",
  selectedTenantId: null,
  error: null,
});

/** Session identity is server-authoritative; local storage holds only a revalidated tenant preference. */
export type AcademySession = ReturnType<typeof useAcademySession>;

export function useAcademySession(enabled: boolean) {
  const [state, setState] = useState<AcademySessionState>(() => initialState(enabled));
  const [logoutPending, setLogoutPending] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  const refresh = useCallback(() => {
    activeRequest.current?.abort();
    if (!enabled) {
      setState(initialState(false));
      return;
    }

    const controller = new AbortController();
    activeRequest.current = controller;
    setState({
      status: "loading",
      session: null,
      tenants: [],
      tenantStatus: "loading",
      selectedTenantId: null,
      error: null,
    });

    void academyApi.getCurrentSession(controller.signal).then(
      async (session) => {
        if (controller.signal.aborted) return;
        setState({
          status: "authenticated",
          session,
          tenants: [],
          tenantStatus: "loading",
          selectedTenantId: null,
          error: null,
        });
        try {
          const tenants = await academyApi.getMyTenants(controller.signal);
          if (controller.signal.aborted) return;
          const preference = readTenantPreference();
          const selectedTenantId = tenants.some((tenant) => tenant.tenant_id === preference)
            ? preference
            : null;
          if (!selectedTenantId) writeTenantPreference(null);
          setState({
            status: "authenticated",
            session,
            tenants,
            tenantStatus: "ready",
            selectedTenantId,
            error: null,
          });
        } catch (error) {
          if (controller.signal.aborted) return;
          if (isUnauthorized(error)) {
            setState({
              status: "unauthenticated",
              session: null,
              tenants: [],
              tenantStatus: "idle",
              selectedTenantId: null,
              error: "登录状态已失效，请重新登录。",
            });
            return;
          }
          setState((current) => ({
            ...current,
            tenantStatus: "unavailable",
            error: errorMessage(error),
          }));
        }
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: isUnauthorized(error) ? "unauthenticated" : "unavailable",
          session: null,
          tenants: [],
          tenantStatus: "idle",
          selectedTenantId: null,
          error: isUnauthorized(error) ? null : errorMessage(error),
        });
      },
    );
  }, [enabled]);

  useEffect(() => {
    refresh();
    return () => activeRequest.current?.abort();
  }, [refresh]);

  const selectTenant = useCallback(
    (tenantId: string) => {
      if (state.status !== "authenticated" || state.tenantStatus !== "ready" || !state.session) {
        return;
      }
      if (!state.tenants.some((tenant) => tenant.tenant_id === tenantId)) return;
      writeTenantPreference(tenantId);
      setState((current) => ({ ...current, selectedTenantId: tenantId, error: null }));
    },
    [state],
  );

  const logout = useCallback(async () => {
    if (state.status !== "authenticated" || logoutPending) return;
    setLogoutPending(true);
    try {
      await academyApi.logout();
      if (state.session) writeTenantPreference(null);
      setState({
        status: "unauthenticated",
        session: null,
        tenants: [],
        tenantStatus: "idle",
        selectedTenantId: null,
        error: null,
      });
    } catch (error) {
      setState((current) => ({ ...current, error: errorMessage(error) }));
    } finally {
      setLogoutPending(false);
    }
  }, [logoutPending, state]);

  return { ...state, selectTenant, refresh, logout, logoutPending };
}
