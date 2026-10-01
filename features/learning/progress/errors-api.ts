import { z } from "zod";
import { requestJson } from "@/shared/http/request-json";
import { errorPatternSchema, errorPatternsResponseSchema, repairResponseSchema } from "./dto";

export type ErrorPattern = z.infer<typeof errorPatternSchema>;

export async function loadErrorPatterns(signal?: AbortSignal): Promise<ErrorPattern[]> {
  return errorPatternsResponseSchema.parse(await requestJson("/api/learning/errors", { signal })).patterns;
}

export async function improveErrorPattern(patternKey: string, signal?: AbortSignal) {
  return repairResponseSchema.parse(await requestJson("/api/learning/errors", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ patternKey, result: "improved" }), signal,
  }));
}
