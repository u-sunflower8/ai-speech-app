import { z } from "zod";

export const diagnoseSchema = z.object({
  scores: z.object({
    structure: z.number().int().min(0).max(20),
    clarity: z.number().int().min(0).max(20),
  }),
  summary: z.string(),
  strengths: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .max(3),
  improvements: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        priority: z.number().int(),
      })
    )
    .max(3),
  practiceTips: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .max(3),
  structureAnalysis: z.object({
    hasConclusion: z.boolean(),
    hasReason: z.boolean(),
    hasExample: z.boolean(),
    isConsistent: z.boolean(),
    comment: z.string(),
  }),
});

export type DiagnoseResult = z.infer<typeof diagnoseSchema>;
