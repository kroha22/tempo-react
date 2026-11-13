import assert from "node:assert/strict";
import test from "node:test";
import {timeDayWords,timeDayStudyItems,timeDayTopics,timeDaySources,timeDayStudyItemIds} from "../features/content/time-day.ts";
import {firstVerticalSliceContentPack as pack} from "../features/content/manifest.ts";
import {studyReviewCardById} from "../features/cards/study-review/catalog.ts";
import {readingSourceById} from "../features/content/reading-sources.ts";
import {preparationWords} from "../features/content/preparation-words.ts";
test("time flow uses existing word IDs, registered card targets and bounded word batches",()=>{
  assert.equal(timeDayWords.length,28);assert.equal(timeDayStudyItems.length,24);
  assert.equal(new Set(timeDayStudyItemIds).size,28);
  assert.deepEqual(timeDayWords.filter(word=>word.topic==="hours").map(word=>word.wordId),preparationWords("hours").map(word=>word.id));
  for(const topic of timeDayTopics)assert(timeDayWords.filter(word=>word.topic===topic).length<=14);
  for(const word of timeDayWords){assert(pack.studyItems.some(item=>item.id===word.studyItemId));assert(studyReviewCardById.has(word.studyItemId));}
  for(const source of timeDaySources)assert.equal(readingSourceById.get(source.id)?.href,source.href);
});
test("breakfast is a quoted existing sentence; prior verb senses are not overwritten",()=>{
  const breakfast=timeDayWords.find(word=>word.pt.startsWith("Tomo o pequeno-almoço"))!;
  assert(breakfast);assert(!breakfast.reused);assert(breakfast.studyItemId.startsWith("study:time-day:"));
  assert(pack.studyItems.some(item=>item.id==="study:ga1:verb:tomar:take-medicine"));
  assert.equal(timeDayWords.find(word=>word.pt==="acordar")?.studyItemId,"study:ga1:verb:acordar:entry");
});
