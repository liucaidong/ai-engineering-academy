import { z } from "zod";

const BookmarkSchema = z.object({
  version: z.literal(1),
  moduleIds: z.array(z.string())
});

export function loadBookmarks(serialized: string | null, knownModuleIds: readonly string[]): string[] {
  if (!serialized) return [];
  try {
    const parsed: unknown = JSON.parse(serialized);
    const result = BookmarkSchema.safeParse(parsed);
    if (!result.success) return [];
    const known = new Set(knownModuleIds);
    return [...new Set(result.data.moduleIds.filter((id) => known.has(id)))];
  } catch {
    return [];
  }
}

export function serializeBookmarks(moduleIds: readonly string[]): string {
  return JSON.stringify({ version: 1, moduleIds: [...new Set(moduleIds)] });
}

export function toggleBookmark(moduleIds: readonly string[], moduleId: string): string[] {
  return moduleIds.includes(moduleId) ? moduleIds.filter((id) => id !== moduleId) : [...moduleIds, moduleId];
}
