# M12 可复现实验代码

五个 Python 标准库示例覆盖 MCP 双时代协议、能力缓存、Streamable HTTP、OAuth token binding 和 Extensions 协商。无需真实 MCP SDK、Server、OAuth Provider 或 API Key。

## 环境与运行

Python 3.10+，从仓库根目录执行：

    python3 examples/m12/01_protocol_eras.py
    python3 examples/m12/02_capability_cache.py
    python3 examples/m12/03_streamable_http.py
    python3 examples/m12/04_oauth_binding.py
    python3 examples/m12/05_extension_matrix.py
    python3 -m unittest discover -s examples/m12 -p 'test_examples.py'

## 文件映射

| 文件 | 课程主题 | 输出 |
|---|---|---|
| 01_protocol_eras.py | Versioning | Legacy handshake 与 2026-07-28 stateless lifecycle |
| 02_capability_cache.py | Discovery/Capabilities | ttlMs、cacheScope 与授权隔离缓存键 |
| 03_streamable_http.py | Transport | POST envelope、header/body 路由一致性和 per-request metadata |
| 04_oauth_binding.py | Authorization | Issuer、Audience、Scope 和禁止 token passthrough |
| 05_extension_matrix.py | Extensions | 能力交集、Tasks 扩展协商和弃用状态 |

## 重要边界

- 协议时代列表是教学矩阵，不执行真实版本协商。
- Cache key 模型不实现真实 HTTP cache、principal authentication 或 invalidation。
- Streamable HTTP 程序只构造/检查合成 envelope，不建立网络连接、不实现 MRTR streaming。
- OAuth 示例不验证 JWT 签名、PKCE、RFC 9207 回调参数或完整 OAuth/OIDC 流程。
- Extensions 示例只做名称交集和 gating，不实现 extension schema、Tasks worker 或 MCP Apps sandbox。
- 真实互操作必须使用目标版本的官方 SDK、Inspector/conformance tests 和真实授权服务验收。
