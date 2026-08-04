import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { diagnoseSchema, type DiagnoseResult } from "@/lib/ai/diagnoseSchema";
import { DIAGNOSE_SYSTEM_PROMPT, buildDiagnosePrompt } from "@/lib/ai/prompts/diagnose";

export const DIAGNOSE_MODEL = "gpt-5.4-mini";

type NumericContext = Parameters<typeof buildDiagnosePrompt>[1];

export async function diagnoseWithAI(
  transcript: string,
  numeric: NumericContext
): Promise<DiagnoseResult> {
  const { output } = await generateText({
    model: openai(DIAGNOSE_MODEL),
    output: Output.object({ schema: diagnoseSchema }),
    system: DIAGNOSE_SYSTEM_PROMPT,
    prompt: buildDiagnosePrompt(transcript, numeric),
  });

  return output;
}
