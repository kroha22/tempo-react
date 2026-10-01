import assert from "node:assert/strict";
import test from "node:test";

import { verbCards } from "../features/cards/data/verb-cards.ts";
import { firstVerticalSliceContentPack } from "../features/content/manifest.ts";
import {
  collectContentValidationIssues,
  collectLegacyVerbDeckIssues,
  validateContentPack,
} from "../features/content/validation.ts";
import type { ContentPack, NounStudyItem } from "../features/content/types.ts";

function clonePack(): ContentPack {
  return structuredClone(firstVerticalSliceContentPack);
}

test("the first vertical slice content pack is valid and complete", () => {
  assert.doesNotThrow(() => validateContentPack(firstVerticalSliceContentPack));
  assert.equal(firstVerticalSliceContentPack.lessons.length, 7);
  assert.equal(firstVerticalSliceContentPack.units[0].lessonIds.length, 6);
  assert.equal(firstVerticalSliceContentPack.units[0].checkpointId, "checkpoint:a1-1:new-room");
});

test("duplicate IDs and missing references fail validation", () => {
  const pack = clonePack();
  pack.chunks[1].id = pack.chunks[0].id;
  pack.lessons[0].primaryCanDoIds = ["cando:missing"];

  const issues = collectContentValidationIssues(pack);
  assert(issues.some((issue) => issue.includes("Duplicate stable ID")));
  assert(issues.some((issue) => issue.includes("references missing ID cando:missing")));
});

test("lexical load above fourteen fails validation", () => {
  const pack = clonePack();
  pack.lessons[0].targets = Array.from({ length: 15 }, (_, index) => ({
    entityId: pack.chunks[index % pack.chunks.length].id,
    role: "new" as const,
    countsTowardLexicalLoad: true,
  }));

  assert(
    collectContentValidationIssues(pack).some((issue) => issue.includes("lexical load 15 exceeds 14")),
  );
});

test("noun StudyItems require article and plural", () => {
  const pack = clonePack();
  const noun: NounStudyItem = {
    id: "study:lex:noun:janela",
    schemaVersion: 1,
    contentRevision: 1,
    status: "reviewed",
    kind: "study-item",
    target: { type: "lexeme-sense", senseId: "sense:noun:janela:window", partOfSpeech: "noun" },
    display: {
      type: "noun",
      lemma: "janela",
      definiteArticle: "a",
      plural: "",
      pluralDefiniteArticle: "as",
      translationKey: "chunk.ola.gloss",
    },
    defaultExampleId: "example:eu-sou-rita",
    cardEligible: true,
  };
  pack.studyItems.push(noun);
  pack.manifest.entityRevisions[noun.id] = 1;

  assert(
    collectContentValidationIssues(pack).some((issue) => issue.includes("noun display lacks article or plural")),
  );
});

test("checkpoint content cannot introduce new targets", () => {
  const pack = clonePack();
  pack.lessons[0].lessonType = "checkpoint";

  assert(
    collectContentValidationIssues(pack).some((issue) => issue.includes("checkpoint introduces a new target")),
  );
});

test("legacy verb IDs and infinitives remain stable and unique", () => {
  assert.deepEqual(collectLegacyVerbDeckIssues(verbCards), []);
});
