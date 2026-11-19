import {expect,it} from "vitest";
import {wordBrowseSets} from "@/features/content/word-browse-sets";
import {wordLibraryFor,setsForSource} from "@/features/content/word-learning-library";
import {schoolWordSets} from "@/features/content/school-word-sets";
import {wordCollections} from "@/features/content/word-collections";

it.each([false,true])("replaces mixed home batches with complete room cards (%s)",child=>{
  const library=wordLibraryFor(child),browse=wordBrowseSets(child);
  const oldIds=["home-furniture","kitchen-bath","garden-transport"].map(id=>`library:collection:${id}:0`);
  const old=library.filter(set=>oldIds.includes(set.id));
  expect(old).toHaveLength(3);
  expect(browse.some(set=>oldIds.includes(set.id))).toBe(false);
  const rooms=browse.filter(set=>set.aliases.some(alias=>alias.startsWith("collection:house-room-set-")));
  expect(rooms).toHaveLength(6);
  for(const set of old){
    expect(setsForSource(set.id,child)).toContain(set);
    for(const word of set.words)expect(rooms.flatMap(room=>room.words)).toContain(word);
  }
  for(const room of rooms){
    const source=library.find(set=>set.id===room.id)!;
    // Existing room sessions retain their exact card order; new words only append.
    expect(room.words.slice(0,source.words.length)).toEqual(source.words);
    expect(room.words.every(word=>library.some(set=>set.words.includes(word)))).toBe(true);
  }
  expect(rooms.find(set=>set.title==="Спальня")!.words).toHaveLength(8);
  expect(rooms.find(set=>set.title==="Сад")!.words).toHaveLength(5);
});

it.each([false,true])("merges food and internal organs without changing source cards or old indices (%s)",child=>{
  const library=wordLibraryFor(child),browse=wordBrowseSets(child);
  const food=browse.find(set=>set.id==="food")!,oldFood=library.find(set=>set.id==="food")!;
  const dairy=library.find(set=>set.title==="Молочные и зерновые продукты")!;
  expect(food.words).toHaveLength(17);
  expect(food.words.slice(0,oldFood.words.length)).toEqual(oldFood.words);
  expect(food.aliases).toContain(dairy.id);
  for(const word of dairy.words)expect(food.words).toContain(word);
  expect(browse.some(set=>set.id===dairy.id)).toBe(false);
  const inside=library.find(set=>set.title==="Внутри тела")!;
  const body=browse.find(set=>set.id==="school:words:body")!;
  expect(body.words).toEqual(schoolWordSets.find(set=>set.id===body.id)!.words);
  expect(body.words).toHaveLength(8);
  expect(body.aliases).toContain(inside.id);
  for(const word of inside.words)expect(body.words).toContain(word);
  expect(browse.some(set=>set.id===inside.id)).toBe(false);
  expect(setsForSource(inside.id,child)).toContain(inside);
  const grouped=wordCollections(browse,child).flatMap(group=>group.sets);
  expect(grouped.filter(set=>set===body)).toHaveLength(1);
  expect(new Set(browse.map(set=>set.id)).size).toBe(browse.length);
});
