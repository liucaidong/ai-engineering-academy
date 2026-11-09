import type { Lesson } from "../types/course";

const moduleLoaders: Record<string, () => Promise<Lesson[]>> = {
  M01: () => import("./flagshipM01").then((module) => module.flagshipM01Lessons),
  M02: () => import("./flagshipM02").then((module) => module.flagshipM02Lessons),
  M03: () => import("./flagshipM03").then((module) => module.flagshipM03Lessons),
  M04: () => import("./flagshipM04").then((module) => module.flagshipM04Lessons),
  M05: () => import("./flagshipM05").then((module) => module.flagshipM05Lessons),
  M06: () => import("./flagshipM06").then((module) => module.flagshipM06Lessons),
  M07: () => import("./flagshipM07").then((module) => module.flagshipM07Lessons),
  M08: () => import("./flagshipM08").then((module) => module.flagshipM08Lessons),
  M09: () => import("./flagshipM09").then((module) => module.flagshipM09Lessons),
  M10: () => import("./flagshipM10").then((module) => module.flagshipM10Lessons),
  M11: () => import("./flagshipM11").then((module) => module.flagshipM11Lessons),
  M12: () => import("./flagshipM12").then((module) => module.flagshipM12Lessons),
  M13: () => import("./flagshipM13").then((module) => module.flagshipM13Lessons),
  M14: () => import("./flagshipM14").then((module) => module.flagshipM14Lessons),
  M15: () => import("./flagshipM15").then((module) => module.flagshipM15Lessons),
  M16: () => import("./flagshipM16").then((module) => module.flagshipM16Lessons),
  M17: () => import("./flagshipM17").then((module) => module.flagshipM17Lessons),
  M18: () => import("./flagshipM18").then((module) => module.flagshipM18Lessons),
  M19: () => import("./flagshipM19").then((module) => module.flagshipM19Lessons),
  M20: () => import("./flagshipM20").then((module) => module.flagshipM20Lessons),
};

const moduleCache = new Map<string, Promise<Lesson[]>>();

/** Load only the requested module's lesson payload. Failed loads are retryable. */
export function loadModuleLessons(moduleId: string): Promise<Lesson[]> {
  const loader = Object.hasOwn(moduleLoaders, moduleId) ? moduleLoaders[moduleId] : undefined;
  if (!loader) return Promise.reject(new Error(`Unknown course module: ${moduleId}`));

  const cached = moduleCache.get(moduleId);
  if (cached) return cached;

  const pending = loader();
  moduleCache.set(moduleId, pending);
  void pending.catch(() => moduleCache.delete(moduleId));
  return pending;
}
