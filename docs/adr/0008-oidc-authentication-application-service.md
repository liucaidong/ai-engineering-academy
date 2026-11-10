# ADR-0008：OIDC 身份 Provisioning 与 Session 创建应用服务

- 状态：Accepted
- 日期：2026-11-10
- 范围：OIDC callback 成功验证后的身份解析、个人工作区 provisioning 与 Session 创建

## 背景

`/auth/callback` 路由在完成 state 校验、一次性登录事务消费和 ID Token 验证后，仍直接编排身份解析、用户/个人租户创建、Session 持久化以及并发唯一约束冲突重试。该流程属于应用用例，不应由 HTTP Adapter 直接拥有。

## 决策

- 新增 `app.services.authentication.provision_oidc_session`，集中处理已验证 OIDC claims 到应用 Session 的转换。
- 身份 provisioning 与 Session 创建保持在同一个数据库事务中。
- 对 `IntegrityError` 最多重试一次；重试发生在第一个 transaction scope 退出并回滚之后，使用全新的事务。
- 非完整性异常不重试；身份策略拒绝仍由 `OIDCIdentityRejected` 明确表达。
- FastAPI 路由继续负责 HTTP 状态码、Cookie、Redirect 和协议层 state/callback 校验。
- OIDC Provider、Discovery、JWKS 和 Token 验证仍在 security adapter，不与应用服务混合。

## 后果

- callback 路由不再直接依赖身份 provisioning 和 Session 创建的底层函数。
- 应用用例可以独立测试事务重试语义。
- 目前服务仍接收已验证 claims 字典；下一阶段可进一步引入明确的 `VerifiedOIDCIdentity` 值对象，避免未经验证的 claims 被错误传入。
- 真实 OIDC Provider 端到端验证仍需配置测试 IdP，不由 mock 测试替代。

## 验证

- 新增应用服务测试：唯一约束冲突后使用新事务重试、非 IntegrityError 不重试。
- 定向认证测试：9 passed。
- 完整后端与前端本机验收在本轮完成后记录于工程治理基线。