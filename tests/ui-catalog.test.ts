import assert from "node:assert/strict";
import test from "node:test";
import { catalogStates, parseCatalogState } from "../features/ui-catalog/catalog-states.ts";

test("UI catalog exposes seven unique addressable states", () => {
  const ids = catalogStates.map((state) => state.id);
  assert.equal(ids.length, 7);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids, ["shared-ui", "adult-practice", "kids-map", "ser-estar", "action", "ter", "quiz-feedback"]);
});

test("UI catalog accepts only known state query values", () => {
  assert.equal(parseCatalogState("kids-map"), "kids-map");
  assert.equal(parseCatalogState(["ter", "shared-ui"]), "ter");
  assert.equal(parseCatalogState("unknown"), null);
  assert.equal(parseCatalogState(undefined), null);
});
