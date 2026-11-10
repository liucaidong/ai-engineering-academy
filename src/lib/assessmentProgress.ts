import { z } from "zod";

const AssessmentResponseSchema = z.object({
  responseText: z.string(),
  reviewedCriteria: z.array(z.string()),
  updatedAt: z.string().datetime().optional(),
  serverUpdatedAt: z.string().datetime().optional(),
  syncState: z.enum(["pending", "synced"]).optional(),
});

const AssessmentProgressSchema = z.object({
  version: z.literal(1),
  responses: z.record(z.string(), AssessmentResponseSchema),
});

export type AssessmentResponse = z.infer<typeof AssessmentResponseSchema>;

export function loadAssessmentProgress(
  serialized: string | null,
  knownAssessmentIds?: readonly string[],
): Record<string, AssessmentResponse> {
  if (!serialized) return {};
  try {
    const parsed: unknown = JSON.parse(serialized);
    const result = AssessmentProgressSchema.safeParse(parsed);
    if (!result.success) return {};
    if (!knownAssessmentIds) return result.data.responses;
    const known = new Set(knownAssessmentIds);
    return Object.fromEntries(
      Object.entries(result.data.responses).filter(([id]) => known.has(id)),
    );
  } catch {
    return {};
  }
}

export function serializeAssessmentProgress(responses: Record<string, AssessmentResponse>): string {
  return JSON.stringify({ version: 1, responses });
}
