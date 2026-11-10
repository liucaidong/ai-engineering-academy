import { useAcademySession } from "./useAcademySession";

const AUTH_UI_ENABLED = import.meta.env.VITE_ACADEMY_AUTH_UI_ENABLED === "true";

export default function SessionTenantControl() {
  const session = useAcademySession(AUTH_UI_ENABLED);

  if (session.status === "disabled") {
    return (
      <span className="account-state" role="status">
        账户功能未启用
      </span>
    );
  }

  if (session.status === "loading") {
    return (
      <span className="account-state" role="status">
        正在检查账户…
      </span>
    );
  }

  if (session.status === "unavailable") {
    return (
      <div className="account-control">
        <span className="account-state account-state-warning">账户服务不可用</span>
        <button className="account-action" type="button" onClick={session.refresh}>
          重试
        </button>
        {session.error && (
          <span className="account-error" role="status">
            {session.error}
          </span>
        )}
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    return (
      <div className="account-control">
        <span className="account-state">未登录</span>
        <a className="account-action" href="/auth/login">
          登录
        </a>
        {session.error && (
          <span className="account-error" role="status">
            {session.error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="account-control">
      <span className="account-state">已登录</span>
      {session.tenantStatus === "loading" ? (
        <span className="account-state" role="status">
          正在加载租户…
        </span>
      ) : session.tenantStatus === "unavailable" ? (
        <>
          <span className="account-state account-state-warning">租户服务不可用</span>
          <button className="account-action" type="button" onClick={session.refresh}>
            重试
          </button>
        </>
      ) : session.tenants.length === 0 ? (
        <span className="account-state">暂无可用租户</span>
      ) : (
        <label className="tenant-picker">
          <span className="sr-only">当前租户</span>
          <select
            aria-label="当前租户"
            value={session.selectedTenantId ?? ""}
            onChange={(event) => session.selectTenant(event.target.value)}
          >
            <option value="" disabled>
              选择租户
            </option>
            {session.tenants.map((tenant) => (
              <option key={tenant.tenant_id} value={tenant.tenant_id}>
                {tenant.name} · {tenant.roles.join(" / ")}
              </option>
            ))}
          </select>
        </label>
      )}
      {session.error && (
        <span className="sr-only" role="status">
          {session.error}
        </span>
      )}
      <button
        className="account-action"
        type="button"
        onClick={() => void session.logout()}
        disabled={session.logoutPending}
      >
        {session.logoutPending ? "退出中…" : "退出"}
      </button>
    </div>
  );
}
