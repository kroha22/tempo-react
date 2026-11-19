import {describe,expect,it} from "vitest";
import {adultMaterialKey,adultMaterialsForBlock,adultRouteBlocks,adultRouteMaterials,adultSharedMaterials,type AdultMaterialReference} from "../../features/content/adult-route";
import {adultMaterialSources,resolveAdultMaterials,validateAdultRoute} from "../../features/content/adult-route-catalog";
import {allGramaticaLessons} from "../../features/content/gramatica-ativa";
import {preparationUnits} from "../../features/content/test-preparation";
import {shortGrammarLessons} from "../../features/content/short-grammar-lessons";
import {practicePlanSteps} from "../../features/practice/plan/model";
import {routeLessonExperiences} from "../../features/content/first-vertical-slice/route-extension";
import {navigationTopics} from "../../features/content/topic-navigation";
import {wordBrowseSets} from "../../features/content/word-browse-sets";
import {wordLibraryFor} from "../../features/content/word-learning-library";

describe("adult route inventory (no UI or persistence integration)",()=>{
  it("covers every live source exactly once, including planned book topics and shared tools",()=>{
    expect(validateAdultRoute()).toEqual([]);
    const inventories = [
      ["book",Array.from({length:54},(_,i)=>`U${String(i+1).padStart(2,"0")}`)],
      ["preparation",preparationUnits.map(item=>item.id)],
      ["short-grammar",shortGrammarLessons.map(item=>item.id)],
      ["practice-step",practicePlanSteps.map(item=>item.id)],
      ["route",routeLessonExperiences.map(item=>item.id)],
      ["word-set",[...wordBrowseSets(false).map(item=>item.id),...adultMaterialSources().filter(source=>source.kind==="word-set"&&source.legacyOnly).map(source=>source.sourceId)]],
      ["topic",navigationTopics.map(item=>item.id)],
      ["checkpoint",allGramaticaLessons.filter(item=>item.checkpoint).map(item=>item.id)],
    ] as const;
    for(const [kind,ids] of inventories){
      expect(adultRouteMaterials.filter(ref=>ref.kind===kind).map(ref=>ref.sourceId).sort()).toEqual([...ids].sort());
    }
    expect(adultRouteBlocks).toHaveLength(10);
    const previous=new Set<string>();
    for(const block of adultRouteBlocks){
      expect(block.after.every(key=>previous.has(key))).toBe(true);
      expect(adultMaterialsForBlock(block.key).length).toBeGreaterThan(0);
      previous.add(block.key);
    }
  });

  it("detects loss, drift, duplicate placement, unknown sources and invalid reuse",()=>{
    const sources=adultMaterialSources();
    const first=adultRouteMaterials[0];
    expect(validateAdultRoute(adultRouteMaterials.slice(1),sources)).toContain(`Unmapped source: ${adultMaterialKey(first)}`);
    expect(validateAdultRoute([...adultRouteMaterials,first],sources)).toContain(`Duplicate placement: ${adultMaterialKey(first)}`);
    expect(validateAdultRoute([...adultRouteMaterials,{...first,sourceId:"U99"}],sources)).toContain("Unknown source: book/U99");
    expect(validateAdultRoute(adultRouteMaterials,[...sources,{...sources[0],sourceId:"U55"}])).toContain("Unmapped source: book/U55");
    expect(validateAdultRoute(adultRouteMaterials,[...sources,sources[0]])).toContain("Duplicate source: book/U01");
    const change=(ref:AdultMaterialReference)=>[ref,...adultRouteMaterials.slice(1)];
    expect(validateAdultRoute(change({...first,block:null}),sources)).toContain("Missing primary block: book/U01");
    expect(validateAdultRoute(adultRouteMaterials.map(ref=>ref.kind==="word-set"&&ref.sourceId==="hello"?{...ref,block:null}:ref),sources)).toContain("Missing primary block: word-set/hello");
    expect(validateAdultRoute(change({...first,repeatIn:["B01","B01"]}),sources)).toContain("Invalid repeat placement: book/U01");
    expect(validateAdultRoute(change({...first,block:"B99" as AdultMaterialReference["block"]}),sources)).toContain("Unknown block: book/U01");
    expect(validateAdultRoute(adultRouteMaterials,sources.map(source=>source.kind==="book"?{...source,wordSets:[]}:source))).toContain("Missing book words: book/U01");
  });

  it("distinguishes planned GA1 lessons from available vocabulary and partial topic wrappers",()=>{
    const sources=adultMaterialSources();
    const books=sources.filter(source=>source.kind==="book");
    expect(books.filter(source=>source.availability==="available")).toHaveLength(30);
    expect(books.filter(source=>source.availability==="planned")).toHaveLength(24);
    for(const book of books){
      expect(book.wordSets?.length).toBeGreaterThan(0);
      expect(book.wordsHref).toBe(`/learning/gramatica-ativa/words/u${book.sourceId.slice(1)}`);
      if(book.availability==="planned")expect(book.href).toBeUndefined();
    }
    expect(sources.find(source=>source.kind==="topic"&&source.sourceId==="topic:city")?.availability).toBe("partial");
    expect(adultSharedMaterials().map(adultMaterialKey)).toContain("word-set/browse:deck:verbs");
    const reused=adultRouteMaterials.find(ref=>ref.kind==="book"&&ref.sourceId==="U30")!;
    expect(adultMaterialsForBlock("B03")).toContain(reused);
    expect(adultMaterialsForBlock("B09")).toContain(reused);
    expect(adultRouteMaterials.filter(ref=>adultMaterialKey(ref)===adultMaterialKey(reused))).toHaveLength(1);
  });

  it("resolves original objects, word IDs and aliases without mutating adult or child sources",()=>{
    const before=JSON.stringify({adult:wordLibraryFor(false),child:wordBrowseSets(true),lessons:allGramaticaLessons,preparation:preparationUnits,practice:practicePlanSteps,topics:navigationTopics});
    const sources=adultMaterialSources();
    expect(resolveAdultMaterials(sources).every(row=>row.material)).toBe(true);
    for(const set of wordBrowseSets(false)){
      const resolved=sources.find(source=>source.kind==="word-set"&&source.sourceId===set.id)!;
      expect(resolved.source).toBe(set);
      expect(resolved.aliases).toBe(set.aliases);
      expect(resolved.wordSets?.[0]).toBe(set);
    }
    for(const source of sources.filter(source=>source.legacyOnly))expect(wordLibraryFor(false).find(set=>set.id===source.sourceId)).toBe(source.source);
    for(const lesson of allGramaticaLessons.filter(lesson=>!lesson.checkpoint)){
      const resolved=sources.find(source=>source.kind==="book"&&source.sourceId===`U${String(lesson.unit).padStart(2,"0")}`)!;
      expect(resolved.source).toBe(lesson);
      expect(resolved.href).toBe(`/learning/gramatica-ativa/${lesson.slug}`);
    }
    expect(JSON.stringify({adult:wordLibraryFor(false),child:wordBrowseSets(true),lessons:allGramaticaLessons,preparation:preparationUnits,practice:practicePlanSteps,topics:navigationTopics})).toBe(before);
  });
});
