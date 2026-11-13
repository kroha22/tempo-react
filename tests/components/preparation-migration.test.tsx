import {expect,it} from "vitest";
import {preparationMigrationHomes,preparationMigrationInventory} from "@/features/content/preparation-migration";
import {preparationUnits} from "@/features/content/test-preparation";
import {readingLessonIds} from "@/features/content/reading-lessons";
import {preparationKeywords} from "@/features/content/preparation-support";
import {catalogWords} from "@/features/content/learning-catalog-view";
import {preparationWords} from "@/features/content/preparation-words";

it("maps all twenty source units exactly once and exposes all ten language lessons",()=>{
  const rows=preparationMigrationInventory();
  expect(rows).toHaveLength(20);
  expect(new Set(rows.map(row=>row.unitId)).size).toBe(20);
  expect(rows.map(row=>row.unitId)).toEqual(preparationUnits.map(unit=>unit.id));
  expect(rows.filter(row=>row.home==="reading")).toHaveLength(10);
  expect(rows.filter(row=>row.availability==="permanent-lesson")).toHaveLength(10);
  expect(rows.filter(row=>row.availability==="local-reading").map(row=>row.unitId)).toEqual([...readingLessonIds]);
  expect(preparationMigrationHomes).toHaveLength(rows.length);
});

it("preserves keyword IDs, meaning matching and order from the previous view for every unit",()=>{
  for(const unit of preparationUnits){
    const previous=(preparationKeywords[unit.id]??[]).map(([label,translation],i)=>catalogWords.find(word=>word.label===label&&word.translation.toLocaleLowerCase("ru").replace(/[.!]$/u,"")===translation.toLocaleLowerCase("ru"))??{id:`prep-keyword:${unit.id}:${i}`,label,translation});
    expect(preparationWords(unit.id)).toEqual(previous);
  }
});

it("retains existing embedded progress owners and targets without assigning quiz credit to phonics",async()=>{
  const rows=preparationMigrationInventory();
  for(const row of rows){
    const unit=preparationUnits.find(unit=>unit.id===row.unitId)!;
    expect(row.target).toEqual(unit.target??null);
    expect(row.pairsActivityId).toBe(`pairs:prep-keywords:${unit.id}`);
    if(unit.subject==="portuguese")expect(row.primaryActivityIds).not.toContain(`prep:${unit.id}`);
  }
  expect(rows.find(row=>row.unitId==="hours")!.primaryActivityIds).toEqual(["prep:hours","clock:read","clock:set"]);
  expect(rows.find(row=>row.unitId==="months")!.primaryActivityIds).toEqual(["prep:months","prep:months:order","prep:months:days"]);
  expect(rows.find(row=>row.unitId==="organs")!.primaryActivityIds).toEqual(["prep:organs","image:image-body-inside"]);
  await expect(JSON.stringify(rows,null,2)+"\n").toMatchFileSnapshot("../../plans/preparation-migration-inventory.json");
});
