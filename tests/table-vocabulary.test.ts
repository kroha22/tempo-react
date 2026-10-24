import assert from "node:assert/strict";
import test from "node:test";
import {catalogGroups,catalogWords} from "../features/content/learning-catalog-view.ts";
import {tableIllustrationLabels} from "../features/content/table-illustrations.ts";
import {tableImageActivity} from "../features/content/table-scene.ts";
import {vocabularyImages} from "../features/content/vocabulary-images.ts";
import {vocabularySets} from "../features/content/vocabulary-model.ts";
import {learningCatalog} from "../features/content/learning-catalog.ts";

test("table illustrations cover sixteen existing concepts and their aliases",()=>{
  assert.equal(tableIllustrationLabels.length,16);
  const cells=new Set<string>();
  for(const label of tableIllustrationLabels){
    const words=catalogWords.filter(word=>word.label===label);
    assert.ok(words.length,label);
    for(const word of words){
      const image=word.illustration!;
      assert.ok(image.src.includes("table-drawn"),word.id);
      cells.add(`${image.row}:${image.column}`);
      const crop=image.crop!;
      assert.ok(crop.x>=0&&crop.y>=0&&crop.x+crop.width<=1254&&crop.y+crop.height<=1254);
    }
  }
  assert.equal(cells.size,16);
});
test("setting the table is playable for exactly the existing six-word table set",()=>{
  const group=catalogGroups.find(group=>group.id==="topic:food")!;
  assert.ok(group.imageActivityIds?.includes(tableImageActivity.id));
  const set=vocabularySets(group).find(set=>set.id==="collection:expansion-food-table")!;
  assert.deepEqual(new Set(tableImageActivity.wordIds),new Set(set.words));
  assert.equal(new Set(vocabularyImages.map(image=>image.id)).size,vocabularyImages.length);
  const scene=learningCatalog.scenes.find(scene=>scene.id===tableImageActivity.id)!;
  assert.equal(scene.targets.length,6);
  for(const target of scene.targets)for(const id of target.meaningIds)assert.ok(learningCatalog.meanings.some(meaning=>meaning.id===id));
  for(const spot of tableImageActivity.spots){assert.ok(spot.x>0&&spot.x<1448&&spot.y>0&&spot.y<1086);assert.ok(spot.acceptedWordIds.length);}
});
