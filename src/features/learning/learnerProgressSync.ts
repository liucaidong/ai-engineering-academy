import {
  type AcademyApiClient,
  academyApi,
  type CourseRelease,
  type LearningProgress,
} from "../../api";
import { courseCatalog } from "../../data/courseCatalog";
import { CourseSchema } from "../../types/course";

export type LearnerProgressApi = Pick<
  AcademyApiClient,
  | "listPublishedCourseReleases"
  | "getCourseRelease"
  | "listLearningProgress"
  | "beginLearningProgress"
  | "completeLearningProgress"
  | "reopenLearningProgress"
>;

const KNOWN_MODULE_IDS = new Set(courseCatalog.modules.map((module) => module.id));

/** Resolve only the exact published curriculum version shipped by this frontend. */
export async function resolveCurrentCourseRelease(
  tenantId: string,
  signal?: AbortSignal,
  api: LearnerProgressApi = academyApi,
): Promise<CourseRelease> {
  const releases = await api.listPublishedCourseReleases(
    tenantId,
    { course_key: courseCatalog.id, limit: 100 },
    signal,
  );
  const candidates = releases.filter(
    (release) =>
      release.course_key === courseCatalog.id &&
      release.version === courseCatalog.version &&
      release.schema_version === courseCatalog.schemaVersion,
  );
  if (candidates.length !== 1) {
    throw new Error(
      candidates.length === 0
        ? `当前课程版本 ${courseCatalog.version} 尚未发布，无法同步学习记录。`
        : "发现多个相同课程版本的发布记录，已停止同步以避免绑定错误。",
    );
  }

  const release = await api.getCourseRelease(tenantId, candidates[0].id, signal);
  if (release.status !== "published" || release.course_key !== courseCatalog.id) {
    throw new Error("课程发布记录状态或课程标识不匹配，已停止同步。");
  }
  const parsed = CourseSchema.safeParse(release.content);
  if (!parsed.success) {
    throw new Error("服务端课程快照未通过当前前端课程 Schema 校验，已停止同步。");
  }
  if (parsed.data.id !== courseCatalog.id || parsed.data.version !== courseCatalog.version) {
    throw new Error("服务端课程快照与当前前端课程版本不一致，已停止同步。");
  }
  const localModuleIds = courseCatalog.modules.map((module) => module.id);
  const releaseModuleIds = parsed.data.modules.map((module) => module.id);
  if (
    localModuleIds.length !== releaseModuleIds.length ||
    localModuleIds.some((moduleId, index) => moduleId !== releaseModuleIds[index])
  ) {
    throw new Error("服务端课程模块清单与当前前端版本不一致，已停止同步。");
  }
  return release;
}

export async function loadRemoteCompletedModules(
  tenantId: string,
  releaseId: string,
  signal?: AbortSignal,
  api: LearnerProgressApi = academyApi,
): Promise<string[]> {
  const progress = await api.listLearningProgress(
    tenantId,
    { course_release_id: releaseId, limit: 100 },
    signal,
  );
  return progress
    .filter(
      (record) =>
        KNOWN_MODULE_IDS.has(record.module_key) && record.completion_status === "completed",
    )
    .map((record) => record.module_key);
}

/** Merge remote completion into local state, then converge the server to the desired set. */
export async function reconcileLearningProgress(
  tenantId: string,
  releaseId: string,
  desiredCompletedModuleIds: readonly string[],
  signal?: AbortSignal,
  api: LearnerProgressApi = academyApi,
): Promise<{ remoteCompletedModuleIds: string[] }> {
  const desired = new Set(desiredCompletedModuleIds.filter((id) => KNOWN_MODULE_IDS.has(id)));
  const progress = await api.listLearningProgress(
    tenantId,
    { course_release_id: releaseId, limit: 100 },
    signal,
  );
  const byModule = new Map(progress.map((record) => [record.module_key, record]));

  for (const moduleId of desired) {
    if (signal?.aborted) throw signal.reason;
    let record = byModule.get(moduleId);
    if (!record) {
      record = await api.beginLearningProgress(
        tenantId,
        { course_release_id: releaseId, module_key: moduleId },
        signal,
      );
      byModule.set(moduleId, record);
    }
    if (record.completion_status === "in_progress") {
      const completed = await api.completeLearningProgress(tenantId, record.id, signal);
      byModule.set(moduleId, completed);
    }
  }

  for (const record of progress) {
    if (signal?.aborted) throw signal.reason;
    if (
      KNOWN_MODULE_IDS.has(record.module_key) &&
      record.completion_status === "completed" &&
      !desired.has(record.module_key)
    ) {
      const reopened = await api.reopenLearningProgress(tenantId, record.id, signal);
      byModule.set(record.module_key, reopened);
    }
  }

  const remoteCompletedModuleIds = [...byModule.values()]
    .filter((record: LearningProgress) => record.completion_status === "completed")
    .map((record) => record.module_key)
    .filter((moduleId) => KNOWN_MODULE_IDS.has(moduleId));
  return { remoteCompletedModuleIds };
}
