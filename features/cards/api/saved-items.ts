import { requestJson } from "../../../shared/http/request-json.ts";
import { savedItemsResponseSchema } from "./saved-items-dto.ts";
export type { SavedRow, SourceRow } from "./saved-items-dto.ts";

export async function loadSavedItems(signal?: AbortSignal) {
  return savedItemsResponseSchema.parse(await requestJson("/api/study-items", { signal }));
}
