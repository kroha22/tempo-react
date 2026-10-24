import assert from "node:assert/strict";
import test from "node:test";
import { everydayIllustrationLabels, withEverydayIllustration } from "../features/content/everyday-illustrations.ts";
import { catalogWords } from "../features/content/learning-catalog-view.ts";

test("24 everyday illustrations cover existing word aliases without changing identities",()=>{
  assert.equal(everydayIllustrationLabels.length,24);
  const cells = new Set<string>();
  for (const label of everydayIllustrationLabels) {
    const words = catalogWords.filter(word=>word.label===label);
    assert.ok(words.length,label);
    for(const word of words){
      const illustration=word.illustration!;
      assert.ok(illustration.src.includes("everyday-drawn"),word.id);
      const crop=illustration.crop!;
      assert.ok(crop.x>=0&&crop.y>=0&&crop.x+crop.width<=1254&&crop.y+crop.height<=1254);
      cells.add(`${illustration.row}:${illustration.column}`);
      const original={...word};
      delete original.illustration;
      assert.deepEqual(withEverydayIllustration(original),word);
    }
  }
  assert.equal(cells.size,24);
  const verb={id:"test-read",label:"ler",translation:"читать"};
  assert.equal(withEverydayIllustration(verb),verb);
});
