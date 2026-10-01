import assert from "node:assert/strict";
import test from "node:test";

import { allVerbKeys, people, verbs } from "../features/conjugation/data.ts";
import {
  endingFor,
  resolveConjugation,
  resolveParadigm,
  verbKeysForGroup,
} from "../features/conjugation/resolver.ts";

test("resolver preserves European Portuguese regular forms", () => {
  assert.equal(resolveConjugation({ verb: "falar", tense: "past", person: "nos" }), "falámos");
  assert.equal(resolveConjugation({ verb: "comer", tense: "past", person: "ele" }), "comeu");
  assert.equal(resolveConjugation({ verb: "partir", tense: "present", person: "voces" }), "partem");
});

test("orthographic overrides remain explicit", () => {
  assert.equal(resolveConjugation({ verb: "crescer", tense: "present", person: "eu" }), "cresço");
  assert.equal(resolveConjugation({ verb: "descobrir", tense: "present", person: "eu" }), "descubro");
});

test("irregular paradigms remain complete", () => {
  assert.deepEqual(resolveParadigm("estar", "past"), {
    eu: "estive",
    tu: "estiveste",
    ele: "esteve",
    nos: "estivemos",
    voces: "estiveram",
    eles: "estiveram",
  });
  assert.equal(resolveConjugation({ verb: "ser", tense: "present", person: "tu" }), "és");
});

test("group lookup and endings support the existing trainer", () => {
  assert.deepEqual(verbKeysForGroup("ar"), ["falar", "estudar", "trabalhar", "reparar", "montar", "criar", "ficar"]);
  assert.equal(endingFor("falar", "past", "nos"), "ámos");
  assert.equal(endingFor("ser", "present", "eu"), null);
});

test("every trainer verb resolves every active person and tense", () => {
  assert.equal(allVerbKeys.length, 25);
  for (const verb of allVerbKeys) {
    for (const tense of ["present", "past"] as const) {
      for (const person of people) {
        assert.equal(typeof verbs[verb].forms[tense][person.key], "string");
        assert(verbs[verb].forms[tense][person.key].length > 0);
      }
    }
  }
});

test("route verbs TER and FICAR are available to learning-linked practice", () => {
  assert.equal(resolveConjugation({ verb: "ter", tense: "present", person: "eu" }), "tenho");
  assert.equal(resolveConjugation({ verb: "ter", tense: "present", person: "voces" }), "têm");
  assert.equal(resolveConjugation({ verb: "ficar", tense: "present", person: "ele" }), "fica");
  assert.equal(resolveConjugation({ verb: "ficar", tense: "past", person: "eu" }), "fiquei");
});
