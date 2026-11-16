import {expect,it} from "vitest";
import {wordLibraryFor,setsForSource} from "@/features/content/word-learning-library";
import {quickWordSets} from "@/features/content/quick-word-sets";
import {verbCards} from "@/features/cards/data/verb-cards";
import {vocabularyForUnit} from "@/features/content/gramatica-vocabulary";
import {parseProfileLearning,emptyProfileLearning} from "@/features/practice/profile-learning";
import {wordSetSaveTargets} from "@/features/practice/SaveWordSet";
import {studyReviewCardById} from "@/features/cards/study-review/catalog";
import {mergeBrowserData} from "@/github-pages/local-backup";
import {parseProfileData} from "@/github-pages/profiles";
import {emptyPracticePlanProgress} from "@/features/practice/plan/model";
import {wordBrowseSets} from "@/features/content/word-browse-sets";
import {spatialCapability} from "@/features/content/spatial-capabilities";
it("merges the catalogue while retaining original source membership and spatial capabilities",()=>{
  const library=wordLibraryFor(true),browse=wordBrowseSets(true);
  const old=library.find(set=>set.id==="child-classroom")!;
  expect(old.title).toBe("Говорю с учителем");
  const school=browse.find(set=>set.aliases.includes(old.id))!;
  expect(school.title).toBe("Просьбы в школе");for(const word of old.words)expect(school.words.some(item=>item.label===word.label&&item.translation===word.translation)).toBe(true);
  expect(browse.filter(set=>set.title==="Где находится?")).toHaveLength(1);
  expect(spatialCapability(browse.find(set=>set.title==="Где находится?"))).toBe("placement");
});

it("keeps old quick IDs and reaches all 1000 verb IDs and all 54 book sources",()=>{
  const all=wordLibraryFor(false);
  expect(new Set(all.map(set=>set.id)).size).toBe(all.length);
  expect(all.every(set=>set.words.length>0)).toBe(true);
  for(const set of quickWordSets.filter(set=>set.audience!=="child")){const words=setsForSource(set.id,false).flatMap(item=>item.words.map(word=>word.id));for(const word of set.words)expect(words).toContain(word.id);}
  const verbs=new Set(setsForSource("deck:verbs",false).flatMap(set=>set.words.map(word=>word.id)));
  expect(verbs.size).toBe(1000);for(const card of verbCards)expect(verbs.has(card.id)).toBe(true);
  for(let unit=1;unit<=54;unit++){
    const sets=setsForSource(`book:${unit}`,false);
    expect(new Set(sets.flatMap(set=>set.words.map(word=>word.id)))).toEqual(new Set(vocabularyForUnit(unit).map(word=>word.studyItemId)));
    for(const target of sets.flatMap(wordSetSaveTargets)){expect(target.sourceId).toBe("course:ga1:pt-pt");expect(studyReviewCardById.has(target.studyItemId)).toBe(true);}
  }
});
it("uses collection aliases rather than a duplicate fruit/farm set",()=>{
  expect(setsForSource("collection:expansion-food-fruit",false).map(set=>set.id)).toEqual(["fruit"]);
  expect(setsForSource("collection:scene-set-farm",false).map(set=>set.id)).toEqual(["farm-animals"]);
});
it("round-trips per-profile continuation through validation/backup without changing old reviews",()=>{
  const session={setId:"colors-basic",stage:"cards" as const,index:2,viewed:["vocabulary:color:vermelho","vocabulary:color:azul"],mode:"pairs" as const,updatedAt:200};
  const base={version:1,plan:emptyPracticePlanProgress(),cards:[],learning:emptyProfileLearning()};
  const old=parseProfileData(base),next=parseProfileData({...base,learning:{...base.learning,wordSession:session}});
  const merged=mergeBrowserData(old,next);
  expect(merged.learning.wordSession).toEqual(session);expect(merged.cards).toEqual(old.cards);expect(merged.plan).toEqual(old.plan);
  expect(mergeBrowserData(next,{...old,learning:{...old.learning,wordSession:{...session,index:0,updatedAt:1}}}).learning.wordSession).toEqual(session);
  expect(()=>parseProfileLearning({...base.learning,wordSession:{...session,index:-1}})).toThrow();
  expect(parseProfileLearning(base.learning).wordSession).toBeUndefined();
  expect(old.learning.wordSession).toBeUndefined();
});
