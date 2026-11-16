import {expect,it} from "vitest";
import {wordBrowseSets} from "@/features/content/word-browse-sets";
import {wordCollections} from "@/features/content/word-collections";
it.each([false,true])("groups calendar vocabulary without copying or losing source sets (%s)",child=>{
  const sets=wordBrowseSets(child),groups=wordCollections(sets);
  const calendar=groups.find(group=>group.title==="Время и календарь")!;
  expect(calendar.sets.some(set=>set.title==="Месяцы")).toBe(true);
  expect(calendar.sets.some(set=>set.title==="Дни недели")).toBe(true);
  const all=groups.flatMap(group=>group.sets);expect(all).toHaveLength(sets.length);
  expect(new Set(all.map(set=>set.id)).size).toBe(sets.length);
  for(const set of sets)expect(all).toContain(set);
});
