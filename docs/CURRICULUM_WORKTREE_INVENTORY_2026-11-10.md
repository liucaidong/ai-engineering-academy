# 工作区最终差异盘点（2026-11-10）

> 快照：2026-11-10；分支 `main`；HEAD `7dcfe7a4e9259e71b00e337ead867d0ab77d18c2`。此报告记录 Git 工作区现状，不推断每个文件最初由哪一轮任务创建。

## 1. 状态摘要

| 项目 | 数量 |
|---|---:|
| `git status --short`（目录折叠） | 205 |
| 完整 porcelain 条目（`-uall`） | 351 |
| 受版本控制的未暂存变更文件 | 150 |
| 未跟踪文件（逐文件展开） | 201 |
| 已暂存文件 | 0 |
| 删除项 | 0 |
| 重命名项 | 0 |
| 当前 tracked diff additions / deletions | 6492 / 2368 |

结论：工作区不是干净状态。没有已暂存文件、删除项或重命名项；150 个 tracked 文件有未暂存差异，201 个文件未跟踪。此前已有 197 个未跟踪文件；本轮新增四份审计报告（计算题、版本/弃用、证据等级、工作区清单），并修改已有工作区文件。

## 2. Tracked 变更按顶层路径分布

| 顶层路径 | 文件数 |
|---|---:|
| `.gitignore` | 1 |
| `CHANGELOG.md` | 1 |
| `README.md` | 1 |
| `backend` | 53 |
| `docs` | 28 |
| `e2e` | 1 |
| `package.json` | 1 |
| `playwright.config.ts` | 1 |
| `src` | 62 |
| `vite.config.ts` | 1 |

## 3. Untracked 文件按顶层路径分布

| 顶层路径 | 文件数 |
|---|---:|
| `.node-version` | 1 |
| `.python-version` | 1 |
| `backend` | 4 |
| `biome.json` | 1 |
| `docs` | 57 |
| `examples` | 125 |
| `openapi` | 2 |
| `pnpm-lock.yaml` | 1 |
| `pnpm-workspace.yaml` | 1 |
| `scripts` | 2 |
| `src` | 6 |

## 4. 完整 tracked 变更路径

- `.gitignore`
- `CHANGELOG.md`
- `README.md`
- `backend/README.md`
- `backend/app/api/assessments.py`
- `backend/app/api/auth.py`
- `backend/app/api/dependencies.py`
- `backend/app/api/learning.py`
- `backend/app/core/config.py`
- `backend/app/core/database.py`
- `backend/app/db/base.py`
- `backend/app/db/session.py`
- `backend/app/main.py`
- `backend/app/models/__init__.py`
- `backend/app/models/course_release.py`
- `backend/app/models/identity.py`
- `backend/app/models/learning.py`
- `backend/app/security/oidc.py`
- `backend/app/security/oidc_provider.py`
- `backend/app/security/oidc_transactions.py`
- `backend/app/security/request_protection.py`
- `backend/app/security/sessions.py`
- `backend/app/services/authorization.py`
- `backend/app/services/course_releases.py`
- `backend/app/services/learning_records.py`
- `backend/app/services/oidc_identity.py`
- `backend/migrations/env.py`
- `backend/migrations/versions/0001_course_releases.py`
- `backend/migrations/versions/0002_release_publication_state.py`
- `backend/migrations/versions/0003_identity_tenancy.py`
- `backend/migrations/versions/0004_tenant_rls.py`
- `backend/migrations/versions/0005_learner_records.py`
- `backend/migrations/versions/0006_session_lookup_rls.py`
- `backend/migrations/versions/0007_oidc_login_transactions.py`
- `backend/migrations/versions/0008_oidc_identity_provisioning.py`
- `backend/migrations/versions/0009_assessment_self_grading_guard.py`
- `backend/migrations/versions/0010_tenant_membership_discovery.py`
- `backend/pyproject.toml`
- `backend/tests/integration/test_tenant_rls_postgres.py`
- `backend/tests/test_auth_routes.py`
- `backend/tests/test_config.py`
- `backend/tests/test_course_release_service.py`
- `backend/tests/test_database.py`
- `backend/tests/test_health.py`
- `backend/tests/test_learner_api_disabled.py`
- `backend/tests/test_learning_records_service.py`
- `backend/tests/test_migrations.py`
- `backend/tests/test_models.py`
- `backend/tests/test_oidc_identity.py`
- `backend/tests/test_oidc_provider.py`
- `backend/tests/test_oidc_security_primitives.py`
- `backend/tests/test_oidc_transactions.py`
- `backend/tests/test_request_protection.py`
- `backend/tests/test_rls_migrations.py`
- `backend/tests/test_security_context.py`
- `backend/tests/test_session_lifecycle.py`
- `docs/ACCEPTANCE.md`
- `docs/ARCHITECTURE.md`
- `docs/CURRICULUM.md`
- `docs/CURRICULUM_SOURCE_AUDIT.md`
- `docs/FLAGSHIP_CURRICULUM_COMPLETION_REPORT.md`
- `docs/GLOSSARY.md`
- `docs/TEACHING_PLAYBOOK.md`
- `docs/teaching-guides/M01-teaching-guide.md`
- `docs/teaching-guides/M02-teaching-guide.md`
- `docs/teaching-guides/M03-teaching-guide.md`
- `docs/teaching-guides/M04-teaching-guide.md`
- `docs/teaching-guides/M05-teaching-guide.md`
- `docs/teaching-guides/M06-teaching-guide.md`
- `docs/teaching-guides/M07-teaching-guide.md`
- `docs/teaching-guides/M08-teaching-guide.md`
- `docs/teaching-guides/M09-teaching-guide.md`
- `docs/teaching-guides/M10-teaching-guide.md`
- `docs/teaching-guides/M11-teaching-guide.md`
- `docs/teaching-guides/M12-teaching-guide.md`
- `docs/teaching-guides/M13-teaching-guide.md`
- `docs/teaching-guides/M14-teaching-guide.md`
- `docs/teaching-guides/M15-teaching-guide.md`
- `docs/teaching-guides/M16-teaching-guide.md`
- `docs/teaching-guides/M17-teaching-guide.md`
- `docs/teaching-guides/M18-teaching-guide.md`
- `docs/teaching-guides/M19-teaching-guide.md`
- `docs/teaching-guides/M20-teaching-guide.md`
- `docs/teaching-guides/README.md`
- `e2e/academy.spec.ts`
- `package.json`
- `playwright.config.ts`
- `src/App.tsx`
- `src/components/AgentRuntimeLab.tsx`
- `src/components/AssessmentWorkspace.tsx`
- `src/components/CourseAuthoringWorkspace.tsx`
- `src/components/EvaluationLab.tsx`
- `src/components/MarkdownContent.tsx`
- `src/components/McpLab.tsx`
- `src/components/MultiAgentLab.tsx`
- `src/components/RagLab.tsx`
- `src/components/TokenizerLab.tsx`
- `src/components/ToolCallingLab.tsx`
- `src/components/TransformerLab.tsx`
- `src/data/curriculum.ts`
- `src/data/flagshipM01.ts`
- `src/data/flagshipM02.ts`
- `src/data/flagshipM03.ts`
- `src/data/flagshipM04.ts`
- `src/data/flagshipM05.ts`
- `src/data/flagshipM06.ts`
- `src/data/flagshipM07.ts`
- `src/data/flagshipM08.ts`
- `src/data/flagshipM09.ts`
- `src/data/flagshipM10.ts`
- `src/data/flagshipM11.ts`
- `src/data/flagshipM12.ts`
- `src/data/flagshipM13.ts`
- `src/data/flagshipM14.ts`
- `src/data/flagshipM15.ts`
- `src/data/flagshipM16.ts`
- `src/data/flagshipM17.ts`
- `src/data/flagshipM18.ts`
- `src/data/flagshipM19.ts`
- `src/data/flagshipM20.ts`
- `src/labs/agentRuntime.ts`
- `src/labs/bpe.ts`
- `src/labs/evaluation.test.ts`
- `src/labs/evaluation.ts`
- `src/labs/mcp.test.ts`
- `src/labs/mcp.ts`
- `src/labs/multiAgent.ts`
- `src/labs/rag.test.ts`
- `src/labs/rag.ts`
- `src/labs/toolCalling.test.ts`
- `src/labs/toolCalling.ts`
- `src/labs/transformer.test.ts`
- `src/labs/transformer.ts`
- `src/lib/assessmentProgress.test.ts`
- `src/lib/assessmentProgress.ts`
- `src/lib/bookmarks.test.ts`
- `src/lib/bookmarks.ts`
- `src/lib/courseMigration.ts`
- `src/lib/learningPath.test.ts`
- `src/lib/learningPath.ts`
- `src/lib/progress.test.ts`
- `src/lib/progress.ts`
- `src/lib/searchModules.test.ts`
- `src/lib/searchModules.ts`
- `src/lib/validateCourse.test.ts`
- `src/lib/validateCourse.ts`
- `src/main.tsx`
- `src/styles.css`
- `src/types/course.ts`
- `vite.config.ts`

## 5. 完整 untracked 文件路径

- `.node-version`
- `.python-version`
- `backend/migrations/versions/0011_personal_tenant_bootstrap.py`
- `backend/scripts/export_openapi.py`
- `backend/tests/test_auth_state_binding.py`
- `backend/uv.lock`
- `biome.json`
- `docs/CURRICULUM_ASSESSMENT_FRAMEWORK.md`
- `docs/CURRICULUM_CALCULATION_AUDIT.md`
- `docs/CURRICULUM_CAPSTONE_ALIGNMENT.md`
- `docs/CURRICULUM_CLAIM_SOURCE_TRACEABILITY.csv`
- `docs/CURRICULUM_CROSS_MODULE_AUDIT.md`
- `docs/CURRICULUM_EVIDENCE_LEVELS.md`
- `docs/CURRICULUM_LEARNING_PATH.md`
- `docs/CURRICULUM_PROGRESSION_REMEDIATION_REPORT.md`
- `docs/CURRICULUM_QUALITY_AUDIT.md`
- `docs/CURRICULUM_RELEASE_READINESS.md`
- `docs/CURRICULUM_TEACHING_QUALITY_MATRIX.md`
- `docs/CURRICULUM_VERSION_AND_DEPRECATION_AUDIT.md`
- `docs/CURRICULUM_WORKTREE_INVENTORY_2026-11-10.md`
- `docs/REFERENCE_LINK_REPAIR_REPORT.md`
- `docs/TECH_STACK.md`
- `docs/adr/0004-tech-stack-governance.md`
- `docs/claim-source-reviews/M01.md`
- `docs/claim-source-reviews/M02.md`
- `docs/claim-source-reviews/M03.md`
- `docs/claim-source-reviews/M04.md`
- `docs/claim-source-reviews/M05.md`
- `docs/claim-source-reviews/M06.md`
- `docs/claim-source-reviews/M07.md`
- `docs/claim-source-reviews/M08.md`
- `docs/claim-source-reviews/M09.md`
- `docs/claim-source-reviews/M10.md`
- `docs/claim-source-reviews/M11.md`
- `docs/claim-source-reviews/M12.md`
- `docs/claim-source-reviews/M13.md`
- `docs/claim-source-reviews/M14.md`
- `docs/claim-source-reviews/M15.md`
- `docs/claim-source-reviews/M16.md`
- `docs/claim-source-reviews/M17.md`
- `docs/claim-source-reviews/M18.md`
- `docs/claim-source-reviews/M19.md`
- `docs/claim-source-reviews/M20.md`
- `docs/reference-url-audit-2026-11-10.csv`
- `docs/teaching-guides/M01-lab-workbook.md`
- `docs/teaching-guides/M02-lab-workbook.md`
- `docs/teaching-guides/M03-lab-workbook.md`
- `docs/teaching-guides/M04-lab-workbook.md`
- `docs/teaching-guides/M05-lab-workbook.md`
- `docs/teaching-guides/M06-lab-workbook.md`
- `docs/teaching-guides/M07-lab-workbook.md`
- `docs/teaching-guides/M08-lab-workbook.md`
- `docs/teaching-guides/M09-lab-workbook.md`
- `docs/teaching-guides/M10-lab-workbook.md`
- `docs/teaching-guides/M11-lab-workbook.md`
- `docs/teaching-guides/M12-lab-workbook.md`
- `docs/teaching-guides/M13-lab-workbook.md`
- `docs/teaching-guides/M14-lab-workbook.md`
- `docs/teaching-guides/M15-lab-workbook.md`
- `docs/teaching-guides/M16-lab-workbook.md`
- `docs/teaching-guides/M17-lab-workbook.md`
- `docs/teaching-guides/M18-lab-workbook.md`
- `docs/teaching-guides/M19-lab-workbook.md`
- `docs/teaching-guides/M20-lab-workbook.md`
- `examples/m04/01_pretraining_budget.py`
- `examples/m04/02_moe_budget.py`
- `examples/m04/03_lora_qlora_budget.py`
- `examples/m04/04_preference_objectives.py`
- `examples/m04/05_evaluation_metrics.py`
- `examples/m04/README.md`
- `examples/m04/test_examples.py`
- `examples/m05/01_kv_cache_budget.py`
- `examples/m05/02_decoding_distribution.py`
- `examples/m05/03_queueing_budget.py`
- `examples/m05/04_quantization_speculative.py`
- `examples/m05/05_serving_capacity.py`
- `examples/m05/README.md`
- `examples/m05/test_examples.py`
- `examples/m06/01_prompt_contract.py`
- `examples/m06/02_fewshot_selection.py`
- `examples/m06/03_structured_validation.py`
- `examples/m06/04_injection_matrix.py`
- `examples/m06/05_prompt_eval_metrics.py`
- `examples/m06/README.md`
- `examples/m06/test_examples.py`
- `examples/m07/01_tool_call_trace.py`
- `examples/m07/02_strict_schema_compat.py`
- `examples/m07/03_tool_discovery.py`
- `examples/m07/04_idempotency_ledger.py`
- `examples/m07/05_tool_eval_metrics.py`
- `examples/m07/README.md`
- `examples/m07/test_examples.py`
- `examples/m08/01_rag_pipeline_trace.py`
- `examples/m08/02_chunking_budget.py`
- `examples/m08/03_hybrid_retrieval.py`
- `examples/m08/04_grounding_citations.py`
- `examples/m08/05_rag_eval_metrics.py`
- `examples/m08/README.md`
- `examples/m08/test_examples.py`
- `examples/m09/01_multimodal_alignment.py`
- `examples/m09/02_vision_token_budget.py`
- `examples/m09/03_diffusion_sampling_budget.py`
- `examples/m09/04_streaming_audio_metrics.py`
- `examples/m09/05_video_timeline_budget.py`
- `examples/m09/README.md`
- `examples/m09/test_examples.py`
- `examples/m10/01_autonomy_envelope.py`
- `examples/m10/02_agent_loop_trace.py`
- `examples/m10/03_durable_execution.py`
- `examples/m10/04_capability_policy.py`
- `examples/m10/05_agent_evaluation.py`
- `examples/m10/README.md`
- `examples/m10/test_examples.py`
- `examples/m11/01_plan_dag.py`
- `examples/m11/02_memory_records.py`
- `examples/m11/03_memory_retrieval.py`
- `examples/m11/04_approval_binding.py`
- `examples/m11/05_planning_memory_eval.py`
- `examples/m11/README.md`
- `examples/m11/test_examples.py`
- `examples/m12/01_protocol_eras.py`
- `examples/m12/02_capability_cache.py`
- `examples/m12/03_streamable_http.py`
- `examples/m12/04_oauth_binding.py`
- `examples/m12/05_extension_matrix.py`
- `examples/m12/README.md`
- `examples/m12/test_examples.py`
- `examples/m13/01_skill_metadata.py`
- `examples/m13/02_progressive_disclosure.py`
- `examples/m13/03_skill_dag.py`
- `examples/m13/04_supply_chain.py`
- `examples/m13/05_skill_evaluation.py`
- `examples/m13/README.md`
- `examples/m13/repository-security-review/README.md`
- `examples/m13/repository-security-review/SKILL.md`
- `examples/m13/repository-security-review/references/finding-schema.md`
- `examples/m13/repository-security-review/references/review-checklist.md`
- `examples/m13/repository-security-review/sample-report.json`
- `examples/m13/repository-security-review/scripts/validate_report.py`
- `examples/m13/test_examples.py`
- `examples/m14/01_topology_cost.py`
- `examples/m14/02_a2a_contract.py`
- `examples/m14/03_shared_state.py`
- `examples/m14/04_evidence_ledger.py`
- `examples/m14/05_multiagent_evaluation.py`
- `examples/m14/README.md`
- `examples/m14/test_examples.py`
- `examples/m15/01_threat_model.py`
- `examples/m15/02_taint_flow.py`
- `examples/m15/03_authorization.py`
- `examples/m15/04_human_oversight.py`
- `examples/m15/05_redteam_incident.py`
- `examples/m15/README.md`
- `examples/m15/test_examples.py`
- `examples/m16/01_workflow_control.py`
- `examples/m16/02_saga_events.py`
- `examples/m16/03_retry_resilience.py`
- `examples/m16/04_approval_audit.py`
- `examples/m16/05_replay_version.py`
- `examples/m16/README.md`
- `examples/m16/test_examples.py`
- `examples/m17/01_eval_harness.py`
- `examples/m17/02_statistical_eval.py`
- `examples/m17/03_judge_calibration.py`
- `examples/m17/04_genai_telemetry.py`
- `examples/m17/05_quality_slo.py`
- `examples/m17/README.md`
- `examples/m17/test_examples.py`
- `examples/m18/01_control_plane.py`
- `examples/m18/02_gateway_routing.py`
- `examples/m18/03_metering.py`
- `examples/m18/04_tenant_isolation.py`
- `examples/m18/05_capacity_fairness.py`
- `examples/m18/README.md`
- `examples/m18/test_examples.py`
- `examples/m19/01_discovery.py`
- `examples/m19/02_human_control.py`
- `examples/m19/03_unit_economics.py`
- `examples/m19/04_experiment_quality.py`
- `examples/m19/05_release_manifest.py`
- `examples/m19/README.md`
- `examples/m19/test_examples.py`
- `examples/m20/01_requirements.py`
- `examples/m20/02_architecture_review.py`
- `examples/m20/03_vertical_slice.py`
- `examples/m20/04_evidence_matrix.py`
- `examples/m20/05_defense_readiness.py`
- `examples/m20/README.md`
- `examples/m20/test_examples.py`
- `openapi/README.md`
- `openapi/openapi.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `scripts/acceptance-local.sh`
- `scripts/check-openapi.mjs`
- `src/api/generated.ts`
- `src/api/index.ts`
- `src/data/courseCatalog.ts`
- `src/data/loadFullCourse.ts`
- `src/data/moduleLessons.ts`
- `src/lib/moduleLessons.test.ts`

## 6. 风险判断与保护动作

- 本次工作区同时包含课程内容、前端/实验组件、后端身份认证/OIDC/租户/RLS、迁移脚本、依赖锁文件和工程配置等多个范围。它不是一个仅包含课程审计的单一变更集。
- 无法仅凭 Git 状态判断 150 个 tracked 差异和此前 197 个 untracked 文件分别属于哪次历史任务；不得把它们统称为本轮审计新增。
- 不能在未逐项确认变更归属、提交边界和目标版本前执行 `git add`、commit、push、reset、clean、删除或重置。
- 本轮未切换分支、未暂存、未提交、未推送、未清理，也未触发 GitHub Actions。
- `pnpm acceptance:local` 最新运行退出码 0；Markdown 链接检查 92 files / 155 relative links / 0 broken；`git diff --check` 通过。
- Backend PostgreSQL RLS 专项因缺少专用环境变量仍 skipped；不能把它标为已通过。

## 7. 冻结决策

**课程内容审计可以维持 Freeze Candidate；Git 工作区尚不具备直接形成单一稳定发布提交的条件。** 在用户明确确认变更归属和提交范围前，保留所有差异原样，不进行提交/推送或清理。
