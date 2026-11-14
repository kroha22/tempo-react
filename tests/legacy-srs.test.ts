import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {firstVerticalSliceContentPack as pack} from "../features/content/manifest.ts";
import {studyReviewCards,studyReviewCardById} from "../features/cards/study-review/catalog.ts";
import {legacySrsIds,legacySrsWords,legacyRouteSources} from "../features/content/legacy-srs.ts";
import {legacyExamples} from "../features/content/legacy-example-repairs.ts";
import {readingSourceById} from "../features/content/reading-sources.ts";
import {routeLessonExperiences} from "../features/content/first-vertical-slice/route-extension.ts";
const map=JSON.parse(readFileSync(new URL("../plans/LEGACY-SRS-A02-A05.json",import.meta.url),"utf8"));
test("all card-eligible identities have review definitions without remapping the 17 planned legacy targets",()=>{
  assert.equal(pack.studyItems.length,665);assert.equal(studyReviewCards.length,665);assert.equal(new Set(legacySrsIds).size,17);
  assert.deepEqual([...legacySrsIds].sort(),map.targets.map((x:{studyItemId:string})=>x.studyItemId).sort());
  assert.deepEqual(pack.studyItems.filter(x=>x.cardEligible&&!studyReviewCardById.has(x.id)),[]);
  for(const word of legacySrsWords){const item=pack.studyItems.find(x=>x.id===word.studyItemId)!,card=studyReviewCardById.get(word.studyItemId)!;assert.equal(card.back,pack.locales.ru[item.display.translationKey]);assert.deepEqual(card.units,[]);assert.deepEqual(card.examples,[word.example]);assert.ok(card.back);}
});
test("the eleven repaired defaults reference scoped examples while shared examples and flow revisions remain",()=>{
  assert.equal(legacyExamples.length,11);
  for(const repair of map.defaultRepairs){const item=pack.studyItems.find(x=>x.id===repair.studyItemId)!;assert.equal(item.contentRevision,2);assert.equal(item.defaultExampleId,repair.proposedExampleId);const e=pack.examples.find(x=>x.id===item.defaultExampleId)!;assert.equal(e.text,repair.pt);assert.equal(pack.locales.ru[e.translationKey],repair.ru);assert.deepEqual(e.targetIds,[item.id]);assert.ok(pack.examples.some(e=>e.id===repair.existingDefaultExampleId));}
  assert.ok(pack.flows.every(flow=>flow.contentRevision===1));
  for(const id of ["study:noun:chave","study:noun:livro","study:noun:cadeira"]){const item=pack.studyItems.find(x=>x.id===id)!,e=pack.examples.find(x=>x.id===item.defaultExampleId)!;assert.equal(studyReviewCardById.get(id)!.examples[0].pt,e.text);}
});
test("Route verbs retain their meanings and independent identities rather than borrowing GA1 backs or units",()=>{
  for(const [lemma,sense]of [["ser","identity"],["estar","state"],["ter","possession"],["ficar","location"]]){const route=studyReviewCardById.get(`study:verb:${lemma}:${sense}`)!,ga1=studyReviewCardById.get(`study:ga1:verb:${lemma}:entry`)!;assert.notEqual(route.studyItemId,ga1.studyItemId);assert.equal(route.lowerPriority,true);assert.deepEqual(route.units,[]);assert.ok(ga1.units.length);}
  assert.equal(studyReviewCardById.get("study:verb:estar:state")!.examples[0].pt,"O Rui está calmo.");assert.equal(studyReviewCardById.get("study:verb:ficar:location")!.back,"находиться, быть расположенным");
});
test("the three original Route source IDs resolve without extending their save lists",()=>{
  assert.equal(readingSourceById.size,72);assert.equal(legacyRouteSources.length,3);
  for(const source of map.sourceMetadata){assert.deepEqual(readingSourceById.get(source.id),{id:source.id,title:source.title,href:source.href});assert.ok(routeLessonExperiences.some(x=>x.id===decodeURIComponent(source.href.slice("/learning/lessons/".length))));}
  assert.deepEqual(routeLessonExperiences.find(x=>x.id==="lesson:a1-1:introduce-yourself")!.saveItemIds,["study:chunk:chamo-me","study:chunk:como-te-chamas"]);
});
