import { z } from "zod";
import { savedItemsResponseSchema } from "../features/cards/api/saved-items-dto";
import { studyReviewRowSchema, studyReviewCommandSchema, studyReviewResponseSchema } from "../features/cards/study-review/contracts";
import { learningProgressSchema } from "../features/learning/progress/dto";

export const localLearningSchema = z.strictObject({
  version: z.literal(1),
  items: savedItemsResponseSchema.shape.items,
  sources: savedItemsResponseSchema.shape.sources,
  reviews: z.array(studyReviewRowSchema),
  reviewReceipts: z.array(z.strictObject({command:studyReviewCommandSchema,result:studyReviewResponseSchema})),
  progress: z.array(learningProgressSchema.extend({ updatedAt: z.int().nonnegative() })),
  events: z.array(z.strictObject({ clientEventId: z.string().min(1), sessionId: z.string(), lessonId: z.string(), entityId: z.string().optional(), answer: z.string().optional(), correct: z.boolean().optional() })),
});
export type LocalLearning = z.infer<typeof localLearningSchema>;
export const emptyLocalLearning = (): LocalLearning => ({ version: 1, items: [], sources: [], reviews: [], reviewReceipts: [], progress: [], events: [] });
export interface LearningStore {
  read(): Promise<LocalLearning>;
  update(change: (data: LocalLearning) => LocalLearning): Promise<LocalLearning>;
  close(): void;
}

/** One document per profile; read/modify/write is a single cross-tab IDB transaction. */
export function openLearningStore(profileId: string): Promise<LearningStore> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("tempo-learning", 1);
    let abandoned=false;
    request.onupgradeneeded = () => request.result.createObjectStore("profiles");
    request.onerror = () => reject(request.error);
    request.onblocked = () => {abandoned=true;reject(new Error("Закройте другие вкладки Tempo и повторите."));};
    request.onsuccess = () => {
      const db = request.result;
      if(abandoned){db.close();return;}
      db.onversionchange = () => db.close();
      function transact(change?: (data: LocalLearning) => LocalLearning): Promise<LocalLearning> {
        return new Promise((done, fail) => {
          const tx = db.transaction("profiles", change ? "readwrite" : "readonly");
          const store = tx.objectStore("profiles");
          let result: LocalLearning;
          let failure: unknown;
          const get = store.get(profileId);
          get.onsuccess = () => {
            try {
              const before = get.result === undefined ? emptyLocalLearning() : localLearningSchema.parse(get.result);
              result = change ? localLearningSchema.parse(change(before)) : before;
              if (change) store.put(result, profileId);
            } catch (error) { failure = error; tx.abort(); }
          };
          tx.oncomplete = () => done(result);
          tx.onabort = tx.onerror = () => fail(failure ?? tx.error ?? new Error("Local save failed"));
        });
      }
      resolve({ read: () => transact(), update: change => transact(change), close: () => db.close() });
    };
  });
}

function union<T>(a: T[], b: T[], key: (row: T) => string): T[] {
  return [...new Map([...a, ...b].map(row => [key(row), row])).values()];
}
export function mergeLocalLearning(a: LocalLearning, b: LocalLearning): LocalLearning {
  const reviews = new Map(a.reviews.map(row => [row.studyItemId, row]));
  for (const row of b.reviews) {
    const old = reviews.get(row.studyItemId);
    if (!old) reviews.set(row.studyItemId,row);
    else if ((row.reviewedAt ?? 0) > (old.reviewedAt ?? 0)) reviews.set(row.studyItemId, {...row,version:Math.max(old.version,row.version)+1});
  }
  const progress = new Map(a.progress.map(row => [row.lessonId, row]));
  for (const row of b.progress) {
    const old = progress.get(row.lessonId);
    if (!old) { progress.set(row.lessonId, row); continue; }
    const next = row.updatedAt > old.updatedAt ? row : old;
    progress.set(row.lessonId, { ...next, status: old.status === "finished" || row.status === "finished" ? "finished" : next.status,
      canDoResult: old.canDoResult === "demonstrated" || row.canDoResult === "demonstrated" ? "demonstrated" : next.canDoResult });
  }
  return localLearningSchema.parse({ version: 1,
    items: union(b.items, a.items, row => row.studyItemId),
    sources: union(a.sources, b.sources, row => JSON.stringify([row.studyItemId, row.sourceType, row.sourceId, row.sourceContextId ?? ""])),
    reviews: [...reviews.values()], progress: [...progress.values()],
    reviewReceipts: union(b.reviewReceipts,a.reviewReceipts,row=>row.command.clientEventId),
    events: union(b.events, a.events, row => row.clientEventId),
  });
}
