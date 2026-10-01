import assert from "node:assert/strict";
import test from "node:test";
import { createPlacement, sameSemanticPlacement } from "../features/scenes/domain.ts";
import { validateScenePlacement } from "../features/scenes/validation.ts";

test("visual and structured scene paths yield the same semantic placement", () => {
  const visual = createPlacement("gato", "under", "mesa");
  const structured = createPlacement("gato", "under", "mesa");
  assert.equal(sameSemanticPlacement(visual, structured), true);
  assert.deepEqual(validateScenePlacement({ id: "task", expected: visual }, structured), {
    accepted: true, semanticEvidence: "demonstrated", response: structured,
  });
});

test("geometry-free validation rejects a different semantic relation", () => {
  const task = { id: "task", expected: createPlacement("gato", "inside", "caixa") };
  assert.equal(validateScenePlacement(task, createPlacement("gato", "on", "caixa")).accepted, false);
});
