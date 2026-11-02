import { z } from "zod";

export const savedItemSchema = z.object({ studyItemId: z.string().min(1), savedAt: z.int().positive() });
export const savedSourceSchema = z.object({
  studyItemId: z.string().min(1),
  sourceType: z.enum(["lesson", "topic", "scene", "summary", "checkpoint"]),
  sourceId: z.string().min(1),
  sourceContextId: z.preprocess((value) => value === "" ? undefined : value, z.string().min(1).optional()),
});
export const savedItemsResponseSchema = z.object({ items: z.array(savedItemSchema), sources: z.array(savedSourceSchema) });
export const saveItemResponseSchema = z.object({ item: savedItemSchema, sources: z.array(savedSourceSchema) });
export type SavedRow = z.infer<typeof savedItemSchema>;
export type SourceRow = z.infer<typeof savedSourceSchema>;
