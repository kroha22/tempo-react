import {afterEach,describe,expect,it,vi} from "vitest";
import {cleanup,fireEvent,render,screen,within} from "@testing-library/react";
import {adultCatalogGroups,adultCatalogShared,adultCatalogLegacy,catalogText} from "../../features/content/adult-catalog";
import {adultRouteBlocks,adultRouteMaterials,adultMaterialKey,adultLegacyCatalogPlacements} from "../../features/content/adult-route";
import {adultMaterialSources} from "../../features/content/adult-route-catalog";
import {catalogGroups} from "../../features/content/learning-catalog-view";
import {topicForLegacyId,navigationTopics} from "../../features/content/topic-navigation";
import {wordLibraryFor} from "../../features/content/word-learning-library";
import {wordBrowseSets} from "../../features/content/word-browse-sets";
import {VocabularyHub} from "../../features/practice/VocabularyHub";
import {ProfileLearningContext,emptyProfileLearning} from "../../features/practice/profile-learning";
import {LearningReturnOrigin} from "../../features/practice/LearningReturnOrigin";
import {LegacyLessonLink} from "../../features/practice/LegacyLessonLink";
afterEach(cleanup);
function setup(child=false){
  const learning=emptyProfileLearning(),update=vi.fn(()=>true);
  render(<ProfileLearningContext value={{profile:{id:"catalog-test",child},learning,savingError:false,update}}><VocabularyHub onOpenCards={vi.fn()}/></ProfileLearningContext>);
  return {learning,update};
}
describe("adult catalogue is a projection of the single route",()=>{
  it("returns lesson back-links to the catalogue without redirecting the explicit plan navigation",()=>{
    render(<LearningReturnOrigin value="/learning/topics"><LegacyLessonLink href="/learning/plan">← К общему плану</LegacyLessonLink><LegacyLessonLink href="/learning/plan">Общий план</LegacyLessonLink></LearningReturnOrigin>);
    expect(screen.getByRole("link",{name:"← К каталогу тем"})).toHaveAttribute("href","/learning/topics");
    expect(screen.getByRole("link",{name:"Общий план"})).toHaveAttribute("href","/learning/plan");
  });
  it("covers all visible material references, deduplicates equal destinations and keeps every legacy group",()=>{
    const sources=adultMaterialSources(),before=JSON.stringify({sources,adult:wordLibraryFor(false),child:wordBrowseSets(true)});
    const groups=adultCatalogGroups();expect(groups.map(group=>group.block)).toEqual([...adultRouteBlocks]);
    const visible=new Set([...groups.flatMap(group=>group.entries.flatMap(entry=>entry.references)),...adultCatalogShared().map(adultMaterialKey)]);
    for(const ref of adultRouteMaterials){const source=sources.find(source=>adultMaterialKey(source)===adultMaterialKey(ref))!;if(!source.legacyOnly)expect(visible.has(adultMaterialKey(ref))).toBe(true);}
    for(const {entries} of groups){const destinations=entries.map(entry=>entry.material.href??entry.material.wordsHref??adultMaterialKey(entry.material));expect(new Set(destinations).size).toBe(destinations.length);}
    for(const group of catalogGroups)expect(!!topicForLegacyId(group.id)||Object.hasOwn(adultLegacyCatalogPlacements,group.id)).toBe(true);
    expect(adultCatalogLegacy()).toHaveLength(7);
    expect(JSON.stringify({sources:adultMaterialSources(),adult:wordLibraryFor(false),child:wordBrowseSets(true)})).toBe(before);
  });
  it("searches existing materials and shared tools without creating or changing the route",()=>{
    expect(catalogText("  AÇÃO  ")).toBe("acao");
    expect(adultCatalogGroups("SER").flatMap(group=>group.entries).some(entry=>entry.references.includes("short-grammar/ser"))).toBe(true);
    expect(adultCatalogGroups("Общение и конфликты").flatMap(group=>group.entries).some(entry=>entry.references.includes("preparation/cooperation"))).toBe(true);
    expect(adultCatalogGroups("дом").map(group=>group.block.key)).toEqual(["B03"]);
    expect(adultCatalogGroups("zzzz-no-such-material")).toEqual([]);
    const planned=adultCatalogGroups().flatMap(group=>group.entries).find(entry=>entry.references.includes("book/U54"))!.material;
    expect(planned.href).toBeUndefined();expect(planned.wordsHref).toBe("/learning/gramatica-ativa/words/u54");
  });
  it("shows exactly ten shared blocks, no second course/continue/progress, and does not write on browsing",()=>{
    const {update}=setup();
    expect(screen.getByRole("heading",{name:"Каталог тем"})).toBeVisible();
    expect(document.querySelectorAll("details[data-catalog-block]")).toHaveLength(10);
    expect(screen.queryByText("Времена и формы ↓")).toBeNull();expect(screen.queryByText("Gramática Ativa 1 · Взрослый курс")).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
    fireEvent.change(screen.getByRole("searchbox",{name:"Поиск"}),{target:{value:"zzzz-no-such-material"}});
    expect(screen.getByRole("status")).toHaveTextContent("Материалов не найдено");
    fireEvent.click(screen.getByRole("button",{name:"Очистить поиск"}));
    expect(document.querySelectorAll("details[data-catalog-block]")).toHaveLength(10);expect(update).not.toHaveBeenCalled();
  });
  it("retains all registered topic links/buttons and returns from a legacy exercise to the same search",()=>{
    const {update}=setup();
    for(const topic of navigationTopics){const region=screen.getByRole("region",{name:`Тема: ${topic.title}`,hidden:true});expect(within(region).getByRole("link",{name:new RegExp(`^${topic.title}`),hidden:true})).toHaveAttribute("href",topic.href);for(const entry of topic.legacyEntries)expect(region.querySelector(`button[data-topic-id="${entry.id}"]`)).not.toBeNull();}
    fireEvent.change(screen.getByRole("searchbox",{name:"Поиск"}),{target:{value:"город"}});
    const entry=screen.getByRole("region",{name:"Тема: Город и дорога"});fireEvent.click(within(entry).getByText("Материалы темы"));
    fireEvent.click(within(entry).getByRole("button",{name:"Город: прежние наборы и сцены"}));
    fireEvent.click(screen.getByRole("button",{name:"Назад ко всем темам"}));
    expect(screen.getByRole("searchbox",{name:"Поиск"})).toHaveValue("город");expect(update).toHaveBeenCalledTimes(1);
  });
  it("leaves the child catalogue presentation unchanged",()=>{setup(true);expect(screen.getByRole("heading",{name:"Aulas — Уроки"})).toBeVisible();expect(screen.queryByRole("region",{name:"Каталог единого маршрута"})).toBeNull();});
});
