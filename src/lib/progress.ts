import { z } from "zod";

const ProgressSchema = z.object({
  version: z.literal(1),
  completedModuleIds: z.array(z.string())
});

export function loadProgress(serialized: string | null, knownModuleIds: readonly string[]): string[] {
  if (!serialized) return [];
  try {
    const parsed: unknown = JSON.parse(serialized);
    const result = ProgressSchema.safeParse(parsed);
    if (!result.success) return [];
    const known = new Set(knownModuleIds);
    return [...new Set(result.data.completedModuleIds.filter((id) => known.has(id)))];
  } catch {
    return [];
  }
}

export function serializeProgress(completedModuleIds: readonly string[]): string {
  return JSON.stringify({ version: 1, completedModuleIds: [...new Set(completedModuleIds)] });
}

export function toggleModuleProgress(completedModuleIds: readonly string[], moduleId: string): string[] {
  return completedModuleIds.includes(moduleId)
    ? completedModuleIds.filter((id) => id !== moduleId)
    : [...completedModuleIds, moduleId];
}
